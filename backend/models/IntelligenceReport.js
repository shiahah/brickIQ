const mongoose = require('mongoose');

const intelligenceReportSchema = new mongoose.Schema({
  // Auth reference
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },

  // User inputs
  user_inputs: {
    idea:       { type: String },
    locality:   { type: String },
    address:    { type: String },
    plot_size:  { type: Number },
    budget_cr:  { type: Number },
    lat:        { type: Number },
    lng:        { type: Number },
  },

  // Adaptive radius scan history
  scan_history: [{
    radius:      Number,
    gyms:        Number,
    schools:     Number,
    hospitals:   Number,
    pharmacies:  Number,
    stores:      Number,
    cafes:       Number,
    apartments:  Number,
  }],

  // Final POI counts used for LLM (at locked radius)
  poi_counts: {
    type: Map,
    of: Number,
    default: {}
  },

  // LLM output
  ai_verdict:  { type: String },
  ai_reasoning:{ type: String },

  // Full ML recommendations
  recommendations: [{
    type:                  String,
    projected_fsi:         Number,
    predicted_price_sqft:  Number,
    total_revenue_cr:      Number,
    net_profit_cr:         Number,
    expected_roi_percentage: Number,
    shap_explanation:      String,
  }],

}, { timestamps: true });

module.exports = mongoose.model('IntelligenceReport', intelligenceReportSchema);
