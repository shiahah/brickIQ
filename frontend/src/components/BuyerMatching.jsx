import React from 'react';
import { UserPlus, Star } from 'lucide-react';

const buyers = [
  { name: 'Karan Sharma', type: 'Residential Buyer', budget: '2-3 Cr', match: 96, timeframe: 'Immediate' },
  { name: 'Altus Investments', type: 'Commercial Firm', budget: '10-15 Cr', match: 89, timeframe: '1-3 Months' },
  { name: 'Divya Desai', type: 'Investor', budget: '5-10 Cr', match: 82, timeframe: 'Flexible' },
  { name: 'Rohan Gupta', type: 'Residential Buyer', budget: '1-2 Cr', match: 75, timeframe: 'Urgent' }
];

export default function BuyerMatching() {
  return (
    <div className="glass-card animate-slide-up" style={{ padding: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>Verified AI Buyer Matches</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {buyers.map((b, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{b.name}</h4>
                {b.match > 90 && <Star size={16} color="#fbbf24" fill="#fbbf24" />}
              </div>
              <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>{b.type} • Budget: {b.budget} • Required: {b.timeframe}</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: b.match > 90 ? '#10b981' : '#60a5fa' }}>{b.match}%</span>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>Match Score</p>
              </div>
              <button className="glass-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#3b82f6', color: '#3b82f6' }}>
                <UserPlus size={16} /> Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
