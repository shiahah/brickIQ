import React from 'react';
import { TrendingUp, CheckCircle, Lightbulb } from 'lucide-react';

export default function RecommendationCard({ prediction }) {
  if (!prediction) return null;

  const {
    recommended_land_use,
    expected_roi_percentage,
    confidence_score,
    explainability = [],
  } = prediction;

  const roi = parseFloat(expected_roi_percentage) || 0;
  // confidence_score may be 0-1 or 0-100 depending on backend
  const confidenceDisplay = confidence_score
    ? confidence_score <= 1
      ? (confidence_score * 100).toFixed(1)
      : parseFloat(confidence_score).toFixed(1)
    : null;

  return (
    <div className="glass-card animate-slide-up" style={{ padding: '2rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}>
          <TrendingUp color="#3b82f6" size={32} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{recommended_land_use}</h2>
          <p style={{ margin: 0, opacity: 0.7 }}>
            AI Suggested Land Use
            {confidenceDisplay ? ` • ${confidenceDisplay}% Confidence` : ''}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Projected ROI</h4>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', height: '24px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, bottom: 0,
            width: `${Math.min(roi * 5, 100)}%`,
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
          <span style={{ position: 'absolute', left: '10px', top: '2px', fontSize: '0.85rem', fontWeight: 'bold', zIndex: 1 }}>
            {roi}% Annual Return
          </span>
        </div>
      </div>

      {explainability.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#60a5fa' }}>
            <Lightbulb size={20} /> AI Explainability Factors
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {explainability.map((reason, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <CheckCircle size={16} color="#10b981" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span style={{ opacity: 0.85, lineHeight: 1.5 }}>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
