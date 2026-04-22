import React from 'react';
import { TrendingUp, CheckCircle, Lightbulb, IndianRupee } from 'lucide-react';

export default function RecommendationCard({ rec }) {
  if (!rec) return null;

  const {
    type,
    projected_fsi,
    predicted_price_sqft,
    total_revenue_cr,
    net_profit_cr,
    expected_roi_percentage,
    shap_explanation,
    ai_logic
  } = rec;

  const roi = parseFloat(expected_roi_percentage) || 0;

  return (
    <div className="glass-card animate-slide-up" style={{ padding: '2rem', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(145deg, rgba(30,58,138,0.4), rgba(15,23,42,0.8))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <TrendingUp color="#3b82f6" size={32} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#f8fafc' }}>{type}</h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              Recommended Build (FSI: {projected_fsi})
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <h3 style={{ margin: 0, fontSize: '2rem', color: '#10b981' }}>{roi}%</h3>
           <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Est. ROI</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
         <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Price per Sq.Ft</p>
            <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
               <IndianRupee size={16}/> {predicted_price_sqft}
            </p>
         </div>
         <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Est. Revenue</p>
            <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
               <IndianRupee size={16}/> {total_revenue_cr} Cr
            </p>
         </div>
         <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Net Profit</p>
            <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', color: '#34d399' }}>
               <IndianRupee size={16}/> {net_profit_cr} Cr
            </p>
         </div>
      </div>

      {shap_explanation && (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', color: '#60a5fa', fontSize: '0.9rem' }}>
            <Lightbulb size={16} /> AI Confidence Driver
          </h4>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
             <CheckCircle size={16} color="#10b981" style={{ marginTop: '3px', flexShrink: 0 }} />
             <span style={{ color: '#e2e8f0', lineHeight: 1.5, fontSize: '0.95rem' }}>{shap_explanation}</span>
          </div>
        </div>
      )}

      {ai_logic && typeof ai_logic === 'object' && (
        <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem', borderTop: '3px solid #10b981' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#34d399', fontSize: '1rem' }}>
            <Lightbulb size={20} /> Deep Market Strategy
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <div>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#10b981' }}>Pros</h5>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#f8fafc', fontSize: '0.9rem', lineHeight: 1.6 }}>
                   {ai_logic.pros?.map((p, i) => <li key={i}>{p}</li>) || <li>Strong generic metrics.</li>}
                </ul>
             </div>
             <div>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#f43f5e' }}>Cons / Risks</h5>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#f8fafc', fontSize: '0.9rem', lineHeight: 1.6 }}>
                   {ai_logic.cons?.map((p, i) => <li key={i}>{p}</li>) || <li>High initial capital.</li>}
                </ul>
             </div>
          </div>
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
             <h5 style={{ margin: '0 0 0.5rem 0', color: '#60a5fa' }}>Notable Details & Prerequisites</h5>
             <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {ai_logic.notable_details?.map((p, i) => <li key={i}>{p}</li>) || <li>Review local land zoning.</li>}
             </ul>
          </div>
        </div>
      )}
    </div>
  );
}
