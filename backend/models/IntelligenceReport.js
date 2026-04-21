const mongoose = require('mongoose');

const intelligenceReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  coords: { 
    type: [Number], // [latitude, longitude]
    required: true 
  },
  infrastructure: {
    type: Map,
    of: Number, // e.g. { "gyms": 2, "schools": 5 }
    default: {}
  },
  llm_reasoning: { type: String }, // Raw LLM verdict/reasoning
  market_scores: {
    expected_roi: Number,
    market_volatility: Number,
    price_per_sqft: Number
  },
  ai_recommendations: [{
    property_type: String,
    roi: Number,
    reasoning: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('IntelligenceReport', intelligenceReportSchema);
