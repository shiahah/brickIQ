# BrickIQ — Database Reference (MongoDB)

## What is MongoDB?

MongoDB is a **NoSQL document database**. Unlike SQL databases (MySQL, PostgreSQL) which store data in rigid tables with fixed columns, MongoDB stores data as **JSON-like documents** (BSON — Binary JSON) in collections.

### SQL vs MongoDB

| SQL | MongoDB |
|---|---|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Fixed schema (ALTER TABLE to add columns) | Flexible schema (just add the field) |

---

## Why MongoDB for BrickIQ?

1. **Variable POI Maps**: Each prediction stores a `poi_counts` object with different keys depending on what the user searched (gyms, florists, malls, etc.). In SQL you'd need a new column per POI type. In MongoDB it's just a nested object — any key is valid.

2. **Nested Scan History**: The `scan_history` is an array of objects (one per radius attempt). In SQL this requires a separate join table. In MongoDB it's an embedded array — one document, no joins.

3. **Schema Flexibility**: BrickIQ's data model evolved heavily during development. MongoDB allowed adding/removing fields without painful migration scripts.

4. **MongoDB Atlas**: Managed cloud hosting — no servers to maintain. Free tier includes 512MB, enough for tens of thousands of prediction records.

---

## How MongoDB Works Internally

### Documents (BSON)
Every record is a JSON-like object with an auto-generated `_id`:

```json
{
  "_id": "ObjectId('664f2a3b1c...')",
  "user": "ObjectId('663a1b2c...')",
  "user_inputs": {
    "idea": "a flower shop to sell bouquets",
    "locality": "Vile Parle East",
    "address": "Vile Parle East, Mumbai",
    "plot_size": 10000,
    "budget_cr": 50,
    "lat": 19.0990,
    "lng": 72.8479
  },
  "scan_history": [
    { "radius": 1000, "gyms": 20, "schools": 20, "hospitals": 20, "stores": 20 },
    { "radius": 200,  "gyms": 0,  "schools": 2,  "hospitals": 6,  "stores": 20 }
  ],
  "poi_counts": { "gym": 0, "schools": 2, "Florists": 3, "Flower Shops": 3 },
  "ai_verdict": "A flower shop faces saturation risk with 3 florists already within 200m...",
  "ai_reasoning": "...",
  "recommendations": [
    {
      "type": "Premium Gym",
      "projected_fsi": 5,
      "predicted_price_sqft": 7518.83,
      "total_revenue_cr": 37.59,
      "net_profit_cr": 12.59,
      "expected_roi_percentage": 14.1,
      "shap_explanation": "The Locality matrix highly favored this build..."
    }
  ],
  "createdAt": "2024-05-15T17:34:11.000Z",
  "updatedAt": "2024-05-15T17:34:11.000Z"
}
```

### The `ObjectId`
MongoDB auto-generates a unique 12-byte `ObjectId` for every document. It encodes a timestamp, a random value, and a counter — making every ID globally unique without a central counter.

### Collections in BrickIQ

**`users`** — Registered accounts
```json
{ "_id": "...", "name": "Shreya", "email": "...", "password": "$2b$10$..." }
```

**`intelligencereports`** — Every prediction run (full structure shown above)

---

## Mongoose — Connecting Node.js to MongoDB

**Mongoose** is an ODM (Object Data Mapper). It defines schemas and provides a model API (`.save()`, `.find()`, etc.).

### Schema (`IntelligenceReport.js`)
```js
const intelligenceReportSchema = new mongoose.Schema({

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // ObjectId = MongoDB's native ID type. ref: 'User' = foreign key to users collection.

  user_inputs: {
    idea: { type: String },
    plot_size: { type: Number },
    lat: { type: Number },
    lng: { type: Number },
    // ...
  },
  // Nested subdocument — stored directly in the document, no join needed.

  scan_history: [{ radius: Number, gyms: Number, schools: Number }],
  // Array of subdocuments — one entry per radius attempt.

  poi_counts: { type: Map, of: Number, default: {} },
  // Map type = dynamic keys. Perfect for variable POI categories.

}, { timestamps: true });
// timestamps: true auto-generates createdAt and updatedAt on every save.
```

### Saving
```js
const report = new IntelligenceReport({ ...allFields });
await report.save();
// Mongoose validates against schema, then inserts into MongoDB
```

---

## MongoDB Atlas — Cloud Setup

**Connection string format:**
```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```
- `mongodb+srv://` — DNS SRV lookup finds the cluster nodes automatically
- Atlas runs a 3-node replica set for redundancy
- All connections are TLS-encrypted

**Network Access**: Atlas blocks all IPs by default. During development, whitelist `0.0.0.0/0` (all IPs) or add specific IPs. On college/corporate WiFi, you must whitelist that network's IP from the Atlas dashboard.

---

## Sample Queries (for a Future History Feature)

```js
// All reports for a user, newest first:
const reports = await IntelligenceReport
  .find({ user: req.user._id })
  .sort({ createdAt: -1 })
  .limit(10);

// Most profitable recommendation ever made:
const best = await IntelligenceReport
  .findOne({})
  .sort({ 'recommendations.0.net_profit_cr': -1 });
```

MongoDB's query language is JavaScript-native — filters are plain JSON objects.

---

## What BrickIQ Stores Per Prediction

| Field | Content |
|---|---|
| `user_inputs` | idea, locality, address, plot_size, budget, lat, lng |
| `scan_history` | Every radius attempt with full POI counts per step |
| `poi_counts` | Final locked POI map used for LLM reasoning |
| `ai_verdict` | LLM's one-sentence feasibility verdict |
| `ai_reasoning` | LLM's full 5+ sentence investment analysis |
| `recommendations` | All 3 builds with FSI, price/sqft, revenue, profit, ROI, SHAP explanation |
