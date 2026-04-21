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
    city: 'Gurgaon', sector: 'Sector 84',
    bedrooms: 3, bathrooms: 2, age: 5, carpet_sqft: 1500
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEthics, setShowEthics] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Flat payload — matches backend's exact expected shape
      const payload = {
        city: locationDetails.city,
        sector: locationDetails.sector,
        bedrooms: Number(locationDetails.bedrooms),
        bathrooms: Number(locationDetails.bathrooms),
        age: Number(locationDetails.age),
        carpet_sqft: Number(locationDetails.carpet_sqft),
      };
      const res = await api.post('/api/predict', payload);
      // Handle both res.data and res.data.data response shapes
      setPrediction(res.data.data || res.data);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.message || 'Prediction failed. Make sure the backend is running on port 5000.');
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container animate-slide-up">
      <header className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', background: '-webkit-linear-gradient(#60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BrickIQ Portal
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="glass-input" onClick={() => setActiveTab('predict')} style={{ background: activeTab === 'predict' ? 'rgba(59,130,246,0.2)' : '' }}>Predict</button>
          <button className="glass-input" onClick={() => setActiveTab('market')} style={{ background: activeTab === 'market' ? 'rgba(59,130,246,0.2)' : '' }}>Market</button>
          <button className="glass-input" onClick={() => setActiveTab('buyers')} style={{ background: activeTab === 'buyers' ? 'rgba(59,130,246,0.2)' : '' }}>Buyers & Match</button>
          <button onClick={onLogout} className="glass-input" style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#fca5a5' }}>Logout</button>
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: activeTab === 'predict' ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {activeTab === 'predict' && (
          <>
            <div className="glass-card animate-slide-up" style={{ padding: '2rem' }}>
              <h3 style={{ marginTop: 0 }}>Location & Asset Details</h3>
              <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input className="glass-input" placeholder="City (e.g. Gurgaon)" value={locationDetails.city} onChange={e => setLocationDetails({...locationDetails, city: e.target.value})} required />
                <input className="glass-input" placeholder="Sector/Locality" value={locationDetails.sector} onChange={e => setLocationDetails({...locationDetails, sector: e.target.value})} required />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="number" className="glass-input" placeholder="Bedrooms" style={{ flex: 1 }} value={locationDetails.bedrooms} min={1} onChange={e => setLocationDetails({...locationDetails, bedrooms: parseInt(e.target.value)})} />
                  <input type="number" className="glass-input" placeholder="Bathrooms" style={{ flex: 1 }} value={locationDetails.bathrooms} min={1} onChange={e => setLocationDetails({...locationDetails, bathrooms: parseInt(e.target.value)})} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="number" className="glass-input" placeholder="Age (years)" style={{ flex: 1 }} value={locationDetails.age} min={0} onChange={e => setLocationDetails({...locationDetails, age: parseInt(e.target.value)})} />
                  <input type="number" className="glass-input" placeholder="Carpet Area (sqft)" style={{ flex: 1 }} value={locationDetails.carpet_sqft} min={100} onChange={e => setLocationDetails({...locationDetails, carpet_sqft: parseInt(e.target.value)})} />
                </div>
                {error && (
                  <div style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem' }}>
                    {error}
                  </div>
                )}
                <button className="primary-btn" type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Analyzing data...' : 'Generate AI Strategy Report'}
                </button>
              </form>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {prediction ? <RecommendationCard prediction={prediction} /> : <MapPlaceholder />}
            </div>
          </>
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
