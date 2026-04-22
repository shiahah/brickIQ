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

    const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
    
    // 0. Extract Dynamic Custom POIs from Idea
    let customPOIs = [];
    let customPOILabels = [];
    if (groq && idea) {
       try {
          const extractPrompt = `You are a Google Places API keyword specialist. Given the user's real estate vision: "${idea}", extract the business/amenity types they want to build or that are relevant to their idea.
Translate their vision into SPECIFIC Google Places search keywords. For example:
- "flower shop to sell bouquets" → ["florist", "flower shop", "garden center"]  
- "a pharmacy" → ["pharmacy", "chemist", "drugstore"]
- "luxury apartments" → ["apartment complex", "residential tower"]
- "a gym" → ["gym", "fitness center", "sports club"]

Return STRICTLY a JSON object with two keys:
"pois": array of 2-4 short Google Places keyword strings to search for,
"labels": array of matching human-readable labels for each keyword (same order)
Example: {"pois": ["florist", "flower shop"], "labels": ["Florists", "Flower Shops"]}`;
          
          const extractResp = await groq.chat.completions.create({
              messages: [{ role: "user", content: extractPrompt }],
              model: "llama-3.3-70b-versatile",
              response_format: { type: "json_object" }
          });
          const extracted = JSON.parse(extractResp.choices[0].message.content);
           customPOIs = extracted.pois || [];
           customPOILabels = extracted.labels || extracted.pois || [];
       } catch(e) { console.error('POI Extraction failed'); }
    }

    // 1. Strict Google Places API Pipeline (Adaptive Scaling)
    const client = new Client({});
    let radius = 1000;
    let poi_counts = { gym: 0, schools: 0, hospitals: 0, pharmacies: 0, stores: 0, restaurants_cafes: 0, residential_complexes: 0 };
    
    let scanHistory = [];
    try {
      if (!process.env.GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({ error: "Critical Error: GOOGLE_PLACES_API_KEY is missing from .env" });
      }

      const fetchType = async (category, rad) => {
         try {
            const resp = await client.placesNearby({
               params: { location: [lat, lng], radius: rad, type: category, key: process.env.GOOGLE_PLACES_API_KEY }
            });
            return resp.data.results.length;
         } catch(e) { return 0; }
      }

      const fetchKeyword = async (keyword, rad) => {
         try {
            const resp = await client.placesNearby({
               params: { location: [lat, lng], radius: rad, keyword: keyword, key: process.env.GOOGLE_PLACES_API_KEY }
            });
            return resp.data.results.length;
         } catch(e) { return 0; }
      }

      const runFetches = async (rad) => {
         const standardPromises = [
            fetchType('gym', rad),
            fetchType('school', rad),
            fetchType('hospital', rad),
            fetchType('pharmacy', rad),
            fetchType('store', rad),
            fetchType('restaurant', rad),
            fetchKeyword('apartment residential complex', rad)
         ];
         const customPromises = customPOIs.map(poi => fetchKeyword(poi, rad));
         return await Promise.all([...standardPromises, ...customPromises]);
      };

      let resultsArr = [];
      let attempts = 0;
      
      while (attempts < 3) {
         resultsArr = await runFetches(radius);
         // Evaluate only the main 7 categories for scaling logic
         const standardResults = resultsArr.slice(0, 7);
         const numMaxed = standardResults.filter(len => len >= 20).length;
         const numEmpty = standardResults.filter(len => len <= 2).length;

         scanHistory.push({
            radius: radius,
            gyms: resultsArr[0], schools: resultsArr[1], hospitals: resultsArr[2],
            pharmacies: resultsArr[3], stores: resultsArr[4], cafes: resultsArr[5], apartments: resultsArr[6]
         });

         if (numMaxed >= 4 && radius === 1000) radius = 200;
         else if (numMaxed >= 2 && radius === 1000) radius = 500;
         else if (numMaxed >= 4 && radius === 500) radius = 200;
         else if (numEmpty >= 4 && radius === 1000) radius = 1500;
         else if (numEmpty >= 4 && radius === 1500) radius = 2000;
         else break; // Balanced Density Achieved
         
         attempts++;
      }

      poi_counts.gym = resultsArr[0];
      poi_counts.schools = resultsArr[1];
      poi_counts.hospitals = resultsArr[2];
      poi_counts.pharmacies = resultsArr[3];
      poi_counts.stores = resultsArr[4];
      poi_counts.restaurants_cafes = resultsArr[5];
      poi_counts.residential_complexes = resultsArr[6];
      
      customPOIs.forEach((poi, idx) => {
         const label = customPOILabels[idx] || poi;
         poi_counts[label] = resultsArr[7 + idx];
      });
      
      // Cap at 150 so UI scales cleanly
      Object.keys(poi_counts).forEach(k => { if (poi_counts[k] > 150) poi_counts[k] = 150; });
      
    } catch(err) {
      console.error("Google Places API strictly failed:", err.message);
      return res.status(500).json({ error: "Google Places API failed. Check billing and key constraints: " + err.message });
    }

    // 2. Groq LLM Pipeline (Strict JSON + Builder constraints)
    let llmResult = {
      verdict: "Recommended based on default ML fallback",
      reasoning: "Groq API bypassed. Applying generic area recommendations.",
      top_3_recommendations: ["Commercial Office", "Residential Apartment", "Retail Shop"]
    };

    if (groq) {
      const userIdea = idea || 'Mixed use development';
      const prompt = `You are a brutally honest Mumbai real estate investment analyst. Your job is to maximize return on investment, not tell the user what they want to hear.

INPUT DATA:
- User's stated idea: "${userIdea}"
- Plot size: ${plot_size} sqft
- Budget: ${req.body.budget || 'unspecified'} Cr
- Infrastructure scan within ${radius}m: ${JSON.stringify(poi_counts)}
- Mumbai FSI: Residential = 2.5, Commercial = 5.0

MANDATE: Recommend the 3 HIGHEST-ROI building types for this specific plot and location based purely on infrastructure demand gaps.

ANALYSIS RULES:
- Study what is MISSING (low counts) vs SATURATED (high counts, 20+) in the POI data.
- If the user's idea aligns with a genuine gap, include it as one of the 3.
- If the user's idea competes with ALREADY SATURATED infrastructure (e.g., 20+ of that type), say so directly and do NOT recommend it — recommend better alternatives instead.
- Do NOT flatter the user. Be direct and data-driven.
- Each recommendation must be genuinely different (e.g., not 3 variations of "shop").
- All "type" strings must be SHORT 2-5 word labels like "Medical Clinic", "Premium Gym", "Residential Tower".

Return STRICTLY a JSON object with exactly 3 keys:
"verdict" (1 blunt sentence: is the user's idea the best use of this land given the data, or are there better options? Cite specific POI counts.),
"reasoning" (Minimum 5 sentences: state what the data reveals about the area, honestly assess the user's idea against alternatives, explain each of the 3 recommendations using actual POI gap numbers),
"top_3_recommendations" (Array of exactly 3 objects sorted by expected potential, each with a "type" string AND a "logic" JSON object with 3 arrays: "pros", "cons", "notable_details").`;

      const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
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

        // 4. Stitch Master Final Payload — sorted by net profit (highest first)
        const finalRecommendations = mlRecommendations
          .map((mlRec, idx) => ({
             ...mlRec,
             ai_logic: llmResult.top_3_recommendations[idx]?.logic || "Specialized AI reasoning context temporarily unavailable."
          }))
          .sort((a, b) => b.net_profit_cr - a.net_profit_cr);

        const finalReport = {
           area_stats: { 
             avg_price: mlRecommendations[0].predicted_price_sqft, 
             roi_growth: mlRecommendations[0].expected_roi_percentage, 
             investment_score: 9.2
           },
           scan_history: scanHistory,
            infrastructure: { ...poi_counts, gap_analysis: llmResult.reasoning },
           ai_verdict: { status: llmResult.verdict, reason: llmResult.reasoning },
           recommendations: finalRecommendations
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
    res.status(500).json({ error: 'Server orchestration error during Builder AI prediction', trace: error.message, stack: error.stack });
  }
};

