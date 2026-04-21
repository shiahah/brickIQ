import React, { useState } from 'react';
import api from '../api';
import RecommendationCard from '../components/RecommendationCard.jsx';
import Charts from '../components/Charts.jsx';
import MapPlaceholder from '../components/MapPlaceholder.jsx';
import BuyerMatching from '../components/BuyerMatching.jsx';
import EthicsModal from '../components/EthicsModal.jsx';
import { Shield } from 'lucide-react';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('predict');
  const [locationDetails, setLocationDetails] = useState({
    locality: 'Andheri West', 
    idea: 'A luxury mixed-use development',
    plot_size: 10000, 
    budget: 50,
    lat: 19.1136, 
    lng: 72.8697
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEthics, setShowEthics] = useState(false);

  const handleLocationSelect = (lat, lng) => setLocationDetails(prev => ({...prev, lat, lng }));

  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        lat: locationDetails.lat,
        lng: locationDetails.lng,
        locality: locationDetails.locality,
        plot_size: Number(locationDetails.plot_size),
        budget: Number(locationDetails.budget),
        idea: locationDetails.idea
      };
      const res = await api.post('/api/predict', payload);
      setPrediction(res.data.data || res.data);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.message || 'Prediction failed. Make sure the backend is running and valid API keys are supplied.');
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container animate-slide-up">
      <header className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', background: '-webkit-linear-gradient(#60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BrickIQ Builder Intelligence
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="glass-input" onClick={() => setActiveTab('predict')} style={{ background: activeTab === 'predict' ? 'rgba(59,130,246,0.2)' : '' }}>Demand-Gap Strategy</button>
          <button className="glass-input" onClick={() => setActiveTab('market')} style={{ background: activeTab === 'market' ? 'rgba(59,130,246,0.2)' : '' }}>Market Indices</button>
          <button className="glass-input" onClick={() => setActiveTab('buyers')} style={{ background: activeTab === 'buyers' ? 'rgba(59,130,246,0.2)' : '' }}>Buyer Funnel</button>
          <button onClick={onLogout} className="glass-input" style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#fca5a5' }}>Logout</button>
        </div>
      </header>

      <main style={{ display: 'block', marginTop: '2rem' }}>
        {activeTab === 'predict' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Sidebar Configuration */}
            <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Builder Settings</h3>
              <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Locality (Pricing Matrix Index)</label>
                   <input className="glass-input" style={{ width: '100%' }} placeholder="e.g. Andheri West" value={locationDetails.locality} onChange={e => setLocationDetails({...locationDetails, locality: e.target.value})} required />
                </div>
                
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Plot Size (Sq.Ft)</label>
                   <input type="number" className="glass-input" style={{ width: '100%' }} placeholder="10000" value={locationDetails.plot_size} min={500} onChange={e => setLocationDetails({...locationDetails, plot_size: parseInt(e.target.value)})} required />
                </div>
                
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Dev Budget (Cr) - Optional</label>
                   <input type="number" className="glass-input" style={{ width: '100%' }} placeholder="50" value={locationDetails.budget} min={1} onChange={e => setLocationDetails({...locationDetails, budget: parseInt(e.target.value)})} />
                </div>
                
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Target Vision / Project Idea</label>
                   <textarea className="glass-input" style={{ width: '100%', resize: 'vertical' }} placeholder="Describe your property idea..." rows={3} value={locationDetails.idea} onChange={e => setLocationDetails({...locationDetails, idea: e.target.value})} />
                </div>

                {error && <div style={{ color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)' }}>{error}</div>}
                
                <button className="primary-btn" type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, marginTop: '0.5rem', width: '100%' }}>
                  {loading ? 'Running AI Subsystems...' : 'Generate Build Strategy'}
                </button>
              </form>
            </div>

            {/* Main Interactive Map & Results Array */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <MapPlaceholder onLocationSelect={handleLocationSelect} />

               {prediction && (
                 <>
                   <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', background: 'linear-gradient(45deg, rgba(16,185,129,0.1), transparent)' }}>
                     <h3 style={{ margin: '0 0 1rem 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} /> AI Demand-Gap Verdict
                     </h3>
                     <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '1.1rem', color: '#f8fafc' }}>
                        {prediction.ai_verdict?.status || 'Verdict Pending'}
                     </p>
                     <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.6 }}>
                        {prediction.ai_verdict?.reason || 'Awaiting reason output.'}
                     </p>
                     
                     <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <div><strong style={{ color: '#94a3b8' }}>Gyms:</strong> <span style={{fontSize: '1.1rem'}}>{prediction.infrastructure?.gym || 0}</span></div>
                        <div><strong style={{ color: '#94a3b8' }}>Schools:</strong> <span style={{fontSize: '1.1rem'}}>{prediction.infrastructure?.school || 0}</span></div>
                        <div><strong style={{ color: '#94a3b8' }}>Hospitals:</strong> <span style={{fontSize: '1.1rem'}}>{prediction.infrastructure?.hospital || 0}</span></div>
                        <div><strong style={{ color: '#94a3b8' }}>Retail Stores:</strong> <span style={{fontSize: '1.1rem'}}>{prediction.infrastructure?.store || 0}</span></div>
                     </div>
                   </div>

                   <h3 style={{ margin: 0, color: '#e2e8f0', paddingTop: '1rem' }}>Top Build Recommendations</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     {prediction.recommendations?.map((rec, i) => <RecommendationCard key={i} rec={rec} />)}
                   </div>
                 </>
               )}
            </div>
          </div>
        )}
        {activeTab === 'market' && <Charts />}
        {activeTab === 'buyers' && <BuyerMatching />}
      </main>

      <footer style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button onClick={() => setShowEthics(true)} className="glass-input" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid #059669' }}>
          <Shield size={16} /> Transparent AI Guidelines
        </button>
      </footer>
      {showEthics && <EthicsModal onClose={() => setShowEthics(false)} />}
    </div>
  );
}
