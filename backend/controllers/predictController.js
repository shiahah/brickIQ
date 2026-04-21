const { spawn } = require('child_process');
const path = require('path');
const { Client } = require("@googlemaps/google-maps-services-js");
const Groq = require("groq-sdk");
const IntelligenceReport = require('../models/IntelligenceReport');

exports.getPrediction = async (req, res) => {
  try {
    const { lat, lng, idea, plot_size, locality } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing latitude or longitude coordinates" });
    }

    // 1. Google Places Pipeline (Dynamic Radius + POI Tallies)
    const client = new Client({});
    let radius = 2000;
    let poi_counts = { gym: 0, school: 0, hospital: 0, pharmacy: 0, store: 0, restaurant: 0 };
    
    try {
      if (process.env.GOOGLE_PLACES_API_KEY) {
        let placesResp = await client.placesNearby({
          params: { location: [lat, lng], radius: radius, key: process.env.GOOGLE_PLACES_API_KEY }
        });
        
        // Adaptive Scaling for Demand-Gap Analysis
        if (placesResp.data.results.length < 5) {
          radius = 5000;
          placesResp = await client.placesNearby({
            params: { location: [lat, lng], radius: radius, key: process.env.GOOGLE_PLACES_API_KEY }
          });
        }
        
        placesResp.data.results.forEach(p => {
           if (p.types.includes('gym')) poi_counts.gym++;
           if (p.types.includes('school')) poi_counts.school++;
           if (p.types.includes('hospital')) poi_counts.hospital++;
           if (p.types.includes('pharmacy')) poi_counts.pharmacy++;
           if (p.types.includes('store')) poi_counts.store++;
           if (p.types.includes('restaurant')) poi_counts.restaurant++;
        });
      }
    } catch(err) {
      console.warn("Google Places API failed/missing, continuing with zeroed POIs:", err.message);
    }

    // 2. Groq LLM Pipeline (Strict JSON + Builder constraints)
    let llmResult = {
      verdict: "Recommended based on default ML fallback",
      reasoning: "Groq API bypassed. Applying generic area recommendations.",
      top_3_recommendations: ["Commercial Office", "Residential Apartment", "Retail Shop"]
    };

    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = `You are a Mumbai urban planner. The builder plot size is ${plot_size} sqft. The builder's idea: "${idea || 'Mixed use'}". 
      Local Infrastructure in ${radius}m radius: ${JSON.stringify(poi_counts)}.
      Identify structural demand gaps. Incorporate standard Mumbai FSI rules (Residential=2.5, Commercial=5.0).
      Return STRICTLY a JSON object with exactly these keys: "verdict" (string assessing the builder idea), "reasoning" (string, the explainable demand gap analysis), and "top_3_recommendations" (an array of 3 exact string property types, e.g., ["Commercial Office", "Luxury Apartment", "Retail Complex"]).`;

      const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile", // Using resilient instant model
          response_format: { type: "json_object" }
      });
      llmResult = JSON.parse(chatCompletion.choices[0].message.content);
    }

    // 3. Bridge to Python XGBoost Models
    const pythonPayload = {
       locality: locality || 'Andheri West',
       plot_size: parseFloat(plot_size) || 10000,
       recommendations: llmResult.top_3_recommendations
    };

    const pythonExecutable = process.platform === 'win32' 
      ? path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe')
      : path.join(__dirname, '..', 'venv', 'bin', 'python');

    const scriptPath = path.join(__dirname, '..', 'ml', 'predict.py');
    const pythonProcess = spawn(pythonExecutable, [scriptPath, JSON.stringify(pythonPayload)]);
    
    let pythonOut = '';
    let pythonErr = '';

    pythonProcess.stdout.on('data', (data) => { pythonOut += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { pythonErr += data.toString(); });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python Script Error:', pythonErr);
        return res.status(500).json({ error: 'AI ML Prediction failed', details: pythonErr });
      }
      
      try {
        const mlRecommendations = JSON.parse(pythonOut.trim());
        
        if (mlRecommendations.error) {
           return res.status(500).json({ error: mlRecommendations.error });
        }

        // 4. Stitch Master Final Payload
        const finalReport = {
           area_stats: { 
             avg_price: mlRecommendations[0].predicted_price_sqft, 
             roi_growth: mlRecommendations[0].expected_roi_percentage, 
             investment_score: 9.2
           },
           infrastructure: { ...poi_counts, gap_analysis: llmResult.reasoning },
           ai_verdict: { status: llmResult.verdict.substring(0, 50), reason: llmResult.verdict },
           recommendations: mlRecommendations
        };

        // Save DB Record
        try {
          const report = new IntelligenceReport({
             user: req.user ? req.user._id : null,
             coords: [lat, lng],
             infrastructure: poi_counts,
             llm_reasoning: llmResult.reasoning,
             market_scores: {
                expected_roi: mlRecommendations[0].expected_roi_percentage,
                market_volatility: 0,
                price_per_sqft: mlRecommendations[0].predicted_price_sqft
             },
             ai_recommendations: mlRecommendations.map(r => ({
                property_type: r.type, 
                roi: r.expected_roi_percentage, 
                reasoning: r.shap_explanation
             }))
          });
          await report.save();
        } catch (dbErr) {
          console.warn('DB Save bypass:', dbErr.message);
        }

        return res.json({ success: true, data: finalReport });
      } catch (parseErr) {
        console.error('Python JSON Parse Error:', pythonOut);
        return res.status(500).json({ error: 'Invalid JSON returned from Machine Learning bridge' });
      }
    });

  } catch (error) {
    console.error('Prediction controller breakdown:', error);
    res.status(500).json({ error: 'Server orchestration error during Builder AI prediction' });
  }
};
