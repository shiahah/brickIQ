# BrickIQ — Backend Technical Reference

## Overview

The backend is a **Node.js + Express** REST API server running on port 5000. It acts as the central orchestrator — receiving frontend requests, calling Google Places and Groq APIs, spawning a Python subprocess for ML inference, and persisting results to MongoDB.

---

## Why Node.js + Express?

- **Node.js** uses a non-blocking, event-driven I/O model. It can fire 7+ Google Places API requests simultaneously without waiting for each one — critical for the parallel POI scan.
- **Express** is a minimal HTTP framework handling routing, middleware, and JSON parsing with almost no boilerplate.

---

## `index.js` — Server Entry Point

```js
require('dotenv').config();           // Loads .env into process.env
const app = express();
app.use(cors());                      // Allow React (port 3000) to call this server
app.use(express.json());              // Parse JSON request bodies

app.use('/api/auth', authRoutes);     // Register / Login endpoints
app.use('/api', predictRoutes);       // Main prediction endpoint

mongoose.connect(process.env.MONGO_URI);  // Connect to MongoDB Atlas

app.listen(5000);
```

---

## Routes

| Method | Route | Handler |
|---|---|---|
| POST | `/api/auth/register` | `authController.register` |
| POST | `/api/auth/login` | `authController.login` |
| POST | `/api/predict` | `authMiddleware` → `predictController.getPrediction` |

---

## `middleware/authMiddleware.js` — JWT Verification

```js
const token = req.headers.authorization?.split(' ')[1]; // Extract from "Bearer <token>"
const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify signature + expiry
req.user = decoded; // Attach decoded user info to request
next();             // Hand off to route handler
```
If the token is missing or tampered, `jwt.verify` throws and the middleware returns `401 Unauthorized`.

---

## `controllers/authController.js` — Auth Logic

**Register:**
```js
const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
const user = new User({ name, email, password: hashedPassword });
await user.save();
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({ token });
```

**Login:**
```js
const match = await bcrypt.compare(password, user.password); // Compares plaintext vs hash
if (!match) return res.status(401).json({ error: 'Invalid credentials' });
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({ token });
```
Passwords are **never stored as plaintext**. `bcrypt` is a one-way hash function — even if the database is leaked, passwords can't be reversed.

---

## `controllers/predictController.js` — The AI Orchestrator

This is the core of BrickIQ. Five sequential phases:

### Phase 0: LLM POI Extraction

```js
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractResp = await groq.chat.completions.create({
  messages: [{ role: 'user', content: extractPrompt }],
  model: 'llama-3.3-70b-versatile',
  response_format: { type: 'json_object' }  // Forces strict JSON output
});
const { pois, labels } = JSON.parse(extractResp.choices[0].message.content);
// pois   = ["florist", "flower shop"]
// labels = ["Florists", "Flower Shops"]
```

`response_format: { type: "json_object" }` is critical — without it, the LLM might add markdown formatting or prose that breaks `JSON.parse()`.

### Phase 1: Google Places API — Adaptive Radius Loop

```js
const fetchType = async (category, rad) => {
  const resp = await client.placesNearby({
    params: { location: [lat, lng], radius: rad, type: category, key: API_KEY }
  });
  return resp.data.results.length; // Only the COUNT matters
};

// Fire all requests simultaneously:
return await Promise.all([...standardPromises, ...customPromises]);
```

**Adaptive scaling loop:**
```js
while (attempts < 3) {
  resultsArr = await runFetches(radius);
  const numMaxed = results.filter(n => n >= 20).length; // 20 = API cap
  const numEmpty = results.filter(n => n <= 2).length;

  if (numMaxed >= 4 && radius === 1000) radius = 200;    // Too dense → shrink
  else if (numMaxed >= 2 && radius === 1000) radius = 500;
  else if (numEmpty >= 4 && radius === 1000) radius = 1500; // Too sparse → expand
  else if (numEmpty >= 4 && radius === 1500) radius = 2000;
  else break; // Balanced — stop iterating

  scanHistory.push({ radius, gyms, schools, ... }); // Record each attempt
  attempts++;
}
```

### Phase 2: Groq LLM — Strategy Generation

The brutally honest system prompt explicitly instructs the model:
- Study what is **MISSING** (low counts) vs **SATURATED** (≥20, API cap) in POI data
- Do NOT flatter the user — if their idea competes with saturated categories, say so
- Rec 1 = user's idea (only if viable). Rec 2 & 3 = highest-ROI alternatives

```js
const chatCompletion = await groq.chat.completions.create({
  messages: [{ role: 'user', content: prompt }],
  model: 'llama-3.3-70b-versatile',
  response_format: { type: 'json_object' }
});
llmResult = JSON.parse(chatCompletion.choices[0].message.content);
// { verdict: "...", reasoning: "...", top_3_recommendations: [...] }
```

### Phase 3: Python ML Bridge

```js
const pythonExecutable = process.platform === 'win32'
  ? path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe')  // Windows
  : path.join(__dirname, '..', 'venv', 'bin', 'python');         // Mac/Linux

const pythonProcess = spawn(pythonExecutable, [scriptPath, JSON.stringify(payload)]);

pythonProcess.stdout.on('data', data => { pythonOut += data.toString(); });
pythonProcess.on('close', async code => {
  const mlResults = JSON.parse(pythonOut.trim());
  // ... stitch and return
});
```

`spawn` creates a **child process**. Data in via command-line argument (JSON string). Data out via stdout. No shared memory — pure pipe communication.

### Phase 4: Stitch, Sort & Save

```js
const finalRecommendations = mlRecommendations
  .map((mlRec, idx) => ({
    ...mlRec,                                         // ML financial data
    ai_logic: llmResult.top_3_recommendations[idx]?.logic  // LLM reasoning
  }))
  .sort((a, b) => b.net_profit_cr - a.net_profit_cr); // Highest profit FIRST

await new IntelligenceReport({ ...allData }).save(); // Persist to MongoDB
res.json(finalReport);                               // Return to frontend
```

---

## External APIs

### Google Places API (Nearby Search)
- **Endpoint**: `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
- **Key params**: `location` (lat,lng), `radius` (metres), `type` or `keyword`, `key`
- **What we use**: Only `results.length` — the count of matching places
- **Cost**: ~$0.032 per call. Active billing required on Google Cloud.
- **Cap**: Returns max 20 results per call (hence the ≥20 saturation check)

### Groq API (LLM)
- **Model**: `llama-3.3-70b-versatile` — Meta's 70B parameter Llama 3.3
- **Why Groq**: Their custom LPU (Language Processing Unit) hardware runs Llama 3.3 in 1-3 seconds vs 15-30s on GPU providers. Free tier available.
- **JSON Mode**: Forces structured, parseable output guaranteed

### Nominatim (OpenStreetMap Geocoding)
- **Forward**: `https://nominatim.openstreetmap.org/search?format=json&q=<address>`
- **Reverse**: `https://nominatim.openstreetmap.org/reverse?format=json&lat=X&lon=Y`
- **Free**: No API key. Rate-limited to 1 req/sec.
- **Used in**: `MapPlaceholder.jsx` (frontend) for bidirectional address↔coordinates sync

---

## Environment Variables (`.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Express server port (5000) |
| `MONGO_URI` | MongoDB Atlas SRV connection string |
| `JWT_SECRET` | Secret for signing/verifying JWT tokens |
| `GROQ_API_KEY` | Groq LLM API key |
| `GOOGLE_PLACES_API_KEY` | Google Places Nearby Search API key |

**Never committed to git** — protected by `.gitignore`.
