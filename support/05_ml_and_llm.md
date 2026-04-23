# BrickIQ — Machine Learning & AI Reference

## Overview

BrickIQ's intelligence pipeline has two AI components working together:

1. **XGBoost ML Models** (Python) — predict `expected_roi%` and `price_per_sqft` from historical Mumbai real estate data
2. **Groq LLM / Llama-3.3-70B** (Node.js) — interprets live infrastructure data, reasons about demand gaps, generates structured investment strategy

---

# Part 1: The Dataset

## `dataset/mumbai_house_data.csv`

A curated dataset of Mumbai real estate listings. Key columns:

| Column | Type | Description |
|---|---|---|
| `locality` | String | Neighbourhood (e.g., "Andheri West", "Bandra") |
| `type` | String | Property type ("Apartment", "Villa", "Studio Apartment") |
| `price` | Float | Listed price |
| `price_unit` | String | "Cr" (Crore) or "L" (Lakh) |
| `area` | Float | Area in Sq.Ft |
| `expected_roi(%)` | Float | **Target variable** — return on investment |
| `demand_indicator` | Float | Market demand score for that locality |
| `market_volatitlity_score` | Float | Price stability (lower = more predictable) |
| `property_liquidity_index` | Float | How quickly properties sell in that area |

---

# Part 2: XGBoost — Theory & Why We Used It

## What is XGBoost?

**XGBoost** (eXtreme Gradient Boosting) is a supervised ML algorithm based on **decision tree ensembles** trained with **gradient boosting**.

### Decision Trees — Intuition
A decision tree splits data on rules:
```
Is demand_indicator > 6.5?
├── YES → Is market_volatility < 3.0?
│         ├── YES → Predict ROI = 14%
│         └── NO  → Predict ROI = 9%
└── NO  → Predict ROI = 7%
```
One tree alone is weak and overfits. **Gradient boosting** trains many trees sequentially, where each new tree corrects the errors of the previous ones:

```
Tree 1 predicts: 10%  (actual: 14%) → error = -4%
Tree 2 focuses on correcting -4% error cases
Tree 3 focuses on remaining errors
...
Final prediction = weighted sum of all 100 trees
```

### Why XGBoost Specifically?
- **Best for tabular data**: Consistently wins Kaggle competitions on structured CSV data — exactly what the Mumbai housing dataset is
- **Speed**: Built-in CPU parallelism during tree construction
- **Regularization**: `reg_lambda=2.0` prevents overfitting by penalising complex trees
- **No GPU needed**: Runs in milliseconds on any CPU

---

## Training Process (`ml/train.py`)

### Step 1: Data Preprocessing
```python
df['price_rs'] = df.apply(calc_price, axis=1)
# Normalise to raw rupees: 1 Cr = ₹10,000,000; 1 L = ₹100,000

df['price_per_sqft'] = df['price_rs'] / df['area_num']
# Create a second target variable from the raw data
```

### Step 2: Label Encoding
```python
le_loc = LabelEncoder()
df['locality_encoded'] = le_loc.fit_transform(df['locality'])
# "Andheri West" → 3, "Bandra" → 7 (ML only works with numbers, not strings)

le_type = LabelEncoder()
df['type_encoded'] = le_type.fit_transform(df['type'])
```
The encoders are saved as `.pkl` files so `predict.py` uses the **exact same mapping** at inference time. Different encoders would assign different numbers to the same locality, breaking predictions.

### Step 3: Feature Matrix (The 5 Inputs)
```python
X = df[[
  'locality_encoded',          # Which neighbourhood
  'type_encoded',              # Property category
  'demand_indicator',          # Market demand score
  'market_volatitlity_score',  # Price predictability
  'property_liquidity_index'   # How fast properties sell
]]
y_roi   = df['expected_roi(%)']  # What we're predicting (Target 1)
y_price = df['price_per_sqft']   # What we're predicting (Target 2)
```

### Step 4: Train Two Separate Regressors
```python
reg_roi = XGBRegressor(
  n_estimators=100,    # 100 trees in the ensemble
  max_depth=5,         # Each tree can split at most 5 levels
  learning_rate=0.1,   # Each tree contributes 10% of its correction
  reg_lambda=2.0       # L2 regularisation to prevent overfitting
)
reg_roi.fit(X_train, y_train_roi)    # → saved as roi_model.pkl
reg_price.fit(X_train, y_train_price) # → saved as price_model.pkl
```

### Step 5: SHAP Explainer
```python
explainer_roi = shap.TreeExplainer(reg_roi)
joblib.dump(explainer_roi, 'artifacts/explainer_roi.pkl')
```
SHAP (SHapley Additive exPlanations) — from cooperative game theory. For any individual prediction, it calculates how much each feature pushed the ROI up or down from the baseline. This powers the **"AI Confidence Driver"** text on each recommendation card.

---

## Inference Process (`ml/predict.py`)

Called per request. Receives 3 recommendation types + locality + plot_size from Node.js.

### Step 1: Load Artifacts
```python
reg_roi      = joblib.load('artifacts/roi_model.pkl')     # Trained XGBoost
reg_price    = joblib.load('artifacts/price_model.pkl')
scaler       = joblib.load('artifacts/scaler.pkl')         # StandardScaler
le_loc       = joblib.load('artifacts/le_loc.pkl')         # Locality encoder
explainer    = joblib.load('artifacts/explainer_roi.pkl')  # SHAP
locality_stats = pd.read_csv('artifacts/locality_stats.csv') # Market medians per locality
```

### Step 2: Encode Locality
```python
try:
    loc_encoded = le_loc.transform([locality])[0]
except ValueError:
    loc_encoded = locality_stats['locality_encoded'].mode()[0]
    # Unknown locality → fall back to most common (graceful degradation)
```

### Step 3: Pull Market Conditions
```python
stats_row  = locality_stats[locality_stats['locality_encoded'] == loc_encoded]
demand     = stats_row['demand_indicator']       # From training data medians
volatility = stats_row['market_volatitlity_score']
liquidity  = stats_row['property_liquidity_index']
```

### Step 4: XGBoost Inference
```python
X_scaled = scaler.transform(X_input)
base_roi   = reg_roi.predict(X_scaled)[0]    # Raw % ROI prediction
base_price = reg_price.predict(X_scaled)[0]  # Raw ₹/sqft prediction
```

### Step 5: Mumbai FSI Business Logic
```python
# FSI = Floor Space Index — Mumbai municipal regulation
fsi = 5.0 if is_commercial else 2.5
# A 10,000 sqft plot with FSI=5 → can build 50,000 sqft across floors

saleable_area    = plot_size * fsi
total_revenue    = saleable_area * price_per_sqft
construction_cost = saleable_area * cost_per_sqft  # ₹5000/sqft commercial, ₹3000 residential
net_profit       = total_revenue - construction_cost
```

### Step 6: SHAP Feature Attribution
```python
shap_vals      = explainer.shap_values(X_scaled)[0]
best_feat_idx  = np.argmax(shap_vals)   # Which feature had biggest positive impact?
best_feat_name = feature_names[best_feat_idx]
explanation    = f"The {best_feat_name} matrix drove +{shap_vals[best_feat_idx]:.1f}% to ROI"
# → Becomes the "AI Confidence Driver" text in the frontend card
```

---

# Part 3: The LLM — Groq + Llama-3.3-70B

## What is an LLM?

A Large Language Model is a neural network trained on vast text to predict the next token. Through this training it learns to reason, analyse, and generate structured content. **Llama 3.3-70B** has 70 billion parameters — numerical weights encoding patterns from trillions of words of text.

## What is Groq?

Groq builds custom silicon — **Language Processing Units (LPUs)** — optimised specifically for LLM inference. A query to `llama-3.3-70b-versatile` on Groq returns in 1-3 seconds vs 15-30 seconds on GPU providers. Free tier available.

## How BrickIQ Uses the LLM

### Use 1: POI Keyword Extraction (LLM Call #1)
Translates free-text user vision into concrete Google Places search terms:
```
Input:  "a flower shop to sell bouquets"
Output: {"pois": ["florist", "flower shop", "garden center"], "labels": ["Florists", ...]}
```

### Use 2: Investment Strategy (LLM Call #2)
Receives actual POI counts and generates honest investment analysis:
- If user's idea category is saturated (e.g., 20+ stores nearby) → says so directly
- Recommends what's actually MISSING from the infrastructure
- Returns structured JSON with verdict + reasoning + 3 recommendations

**JSON Mode** (`response_format: { type: "json_object" }`) is critical — forces parseable output without markdown or prose wrapping.

---

## Why Hybrid (LLM + ML) Instead of Just One?

| Capability | Pure LLM | Pure ML | BrickIQ Hybrid |
|---|---|---|---|
| ROI/Revenue calculation | ❌ Hallucinated | ✅ Data-driven | ✅ ML handles numbers |
| Natural language reasoning | ✅ Rich | ❌ None | ✅ LLM handles reasoning |
| Real-time infrastructure data | ❌ No | ❌ No | ✅ Google Places API |
| Speed | Slow (GPU) | Fast (CPU) | Fast (Groq LPU + XGBoost) |

The LLM is good at **understanding and reasoning**. XGBoost is good at **numerical prediction from historical data**. Combining them yields both accurate financials and intelligent, context-aware interpretation.

---

## Saved Artifacts (`.pkl` files)

| File | Contents |
|---|---|
| `roi_model.pkl` | Trained XGBoost regressor for ROI |
| `price_model.pkl` | Trained XGBoost regressor for price/sqft |
| `scaler.pkl` | StandardScaler fit on training features |
| `le_loc.pkl` | LabelEncoder for locality names |
| `le_type.pkl` | LabelEncoder for property types |
| `explainer_roi.pkl` | SHAP TreeExplainer for ROI model |
| `locality_stats.csv` | Median market stats per locality from training data |

**Why `.pkl`?** `joblib.dump` serialises the trained Python object to a binary file. `joblib.load` restores it exactly — no retraining on every request.

**Why not in git?** Binary files don't diff well. Excluded via `.gitignore`. Must be regenerated by running `python train.py` on a new machine (requires the dataset and `venv` to be set up first).
