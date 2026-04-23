# BrickIQ — System Architecture & Full Workflow

## What Is BrickIQ?

BrickIQ is a **Builder Intelligence Platform** that helps real estate developers make data-driven decisions about what to build on a given plot of land. Instead of guessing, it uses live infrastructure data, machine learning, and generative AI to recommend the highest-ROI building types for any location in Mumbai.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│   React Frontend (Vite, port 3000)                                  │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│   │  Login/     │  │  Leaflet     │  │  Dashboard (Sidebar +  │    │
│   │  Register   │  │  Map (OSM)   │  │  Results Cards)        │    │
│   └─────────────┘  └──────────────┘  └────────────────────────┘    │
│          │               │  ↑ Nominatim Reverse Geocoding           │
└──────────┼───────────────┼──────────────────────────────────────────┘
           │ JWT Auth      │ lat/lng + idea + plot_size + budget
           ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Node.js Backend (Express, port 5000)            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              predictController.js                            │   │
│  │                                                              │   │
│  │  Step 0: Groq LLM → Extract custom POI keywords from idea   │   │
│  │  Step 1: Google Places API → Parallel 7+N category fetches  │   │
│  │          → Adaptive radius loop (1000→500→200 or 1500→2000) │   │
│  │  Step 2: Groq LLM → Generate 3 recommendations (JSON mode)  │   │
│  │  Step 3: Python Bridge → XGBoost ML → ROI + Revenue calcs   │   │
│  │  Step 4: Sort by net_profit_cr, stitch, save to MongoDB      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  External API calls:                                                │
│  ├── Google Places API (POI infrastructure counts)                  │
│  ├── Groq API / Llama-3.3-70B (LLM reasoning + POI extraction)     │
│  └── Nominatim / OpenStreetMap (reverse geocoding on frontend)      │
└──────────────────────┬──────────────────────┬───────────────────────┘
                       │                      │
              ┌────────▼────────┐    ┌────────▼──────────┐
              │   MongoDB Atlas │    │  Python (venv)     │
              │  users          │    │  train.py          │
              │  intelligence   │    │  predict.py        │
              │  reports        │    │  XGBoost models    │
              └─────────────────┘    │  SHAP explainer    │
                                     └────────────────────┘
```

---

## End-to-End Request Lifecycle

When a user clicks **"Generate Build Strategy"**, this exact sequence happens:

### Step 0 — Groq POI Extraction (LLM Call #1)
The user's free-text idea (e.g., *"a flower shop to sell bouquets"*) is sent to `llama-3.3-70b-versatile`. The LLM translates natural language into **Google Places API keywords** (e.g., `["florist", "flower shop", "garden center"]`) and human-readable labels. These become additional search categories appended to the standard 7.

### Step 1 — Google Places API (Adaptive Spatial Scan)
The backend fires **7 + N parallel API requests** simultaneously (using `Promise.all`):
- Standard: `gym`, `school`, `hospital`, `pharmacy`, `store`, `restaurant`, `apartment`
- Custom: whatever the LLM extracted from Step 0

The results are evaluated for density:
- If **4+ categories hit ≥20 results** → area too dense → shrink radius (1000m → 500m → 200m)
- If **4+ categories hit ≤2 results** → area too sparse → expand radius (1000m → 1500m → 2000m)
- Repeat up to 3 times until balanced density is found

Each iteration is recorded in `scanHistory[]` and displayed to the user as a step-by-step trace.

### Step 2 — Groq LLM (Strategy Generation, LLM Call #2)
The locked POI counts, plot size, budget, and user idea are sent with a **brutally honest** system prompt. The LLM returns strict JSON with:
- `verdict` — one blunt feasibility sentence citing actual POI numbers
- `reasoning` — ≥5 sentence investment analysis
- `top_3_recommendations` — each with short `type` label + `logic` (pros, cons, notable_details)

### Step 3 — Python ML Bridge (XGBoost Inference)
Node.js spawns a Python child process (`spawn`) passing the 3 recommendation type strings + locality + plot_size as a JSON argument. Python loads pre-trained XGBoost models, runs inference, applies Mumbai FSI rules, calculates revenue/profit/ROI, runs SHAP for explainability, then returns JSON via stdout.

### Step 4 — Stitch, Sort & Save
Node.js maps ML financials with LLM reasoning arrays, **sorts by `net_profit_cr` descending** (highest earner always first), saves to MongoDB, and returns the full payload to React.

---

## Tech Stack Summary

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Fast hot-reload, component-based UI |
| Map | React-Leaflet + OpenStreetMap | Free, no API key needed for tiles |
| Geocoding | Nominatim (OSM) | Reverse geocoding for pin→address, free |
| Styling | Vanilla CSS (glassmorphism) | Full control, no framework overhead |
| Backend | Node.js + Express | Non-blocking I/O, perfect for parallel API calls |
| Database | MongoDB Atlas | Flexible schema for variable POI maps |
| Auth | JWT (JSON Web Tokens) | Stateless, scalable authentication |
| LLM | Groq API / Llama-3.3-70B | Fast inference, JSON mode, free tier |
| POI Data | Google Places API | Real-world infrastructure ground truth |
| ML | XGBoost (Python) | Best-in-class tabular regression |
| Explainability | SHAP | Feature importance for "AI Confidence Driver" |

---

## Project Folder Structure

```
brickiq/
├── backend/
│   ├── controllers/
│   │   ├── predictController.js   ← Main AI orchestrator (5-phase pipeline)
│   │   └── authController.js      ← Register/Login JWT logic
│   ├── models/
│   │   ├── IntelligenceReport.js  ← MongoDB schema for full prediction records
│   │   └── User.js                ← MongoDB schema for user accounts
│   ├── routes/
│   │   ├── predictRoutes.js       ← POST /api/predict
│   │   └── authRoutes.js          ← POST /api/auth/register & /login
│   ├── ml/
│   │   ├── train.py               ← XGBoost training script (run once)
│   │   ├── predict.py             ← Inference + SHAP script (called per request)
│   │   └── artifacts/             ← Saved .pkl model files (not in git)
│   ├── middleware/
│   │   └── authMiddleware.js      ← JWT token verification
│   ├── index.js                   ← Express server entry point
│   └── .env                       ← API keys (not in git)
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx      ← Main app page
│       │   ├── Login.jsx          ← Login form
│       │   └── Register.jsx       ← Registration form
│       ├── components/
│       │   ├── MapPlaceholder.jsx     ← Leaflet map + geocoding
│       │   ├── RecommendationCard.jsx ← Build recommendation UI card
│       │   ├── Charts.jsx             ← Market Indices tab
│       │   ├── BuyerMatching.jsx      ← Buyer Funnel tab
│       │   └── EthicsModal.jsx        ← AI Ethics disclosure popup
│       ├── api.js                 ← Axios base config with JWT interceptor
│       ├── App.jsx                ← Top-level auth gate / router
│       └── index.css              ← Global glassmorphism design system
├── dataset/
│   └── mumbai_house_data.csv      ← Training dataset
├── support/                       ← Documentation (you are here)
└── requirements.txt               ← Python dependencies
```
