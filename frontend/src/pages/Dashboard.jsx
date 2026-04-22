import React, { useState } from 'react';
import api from '../api';
import axios from 'axios';
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
    address: 'Andheri West, Mumbai',
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

  const handleLocationSelect = (lat, lng, locName = null, fullAddress = null) => {
      setLocationDetails(prev => ({
          ...prev, 
          lat, 
          lng, 
          ...(locName && { locality: locName }),
          ...(fullAddress && { address: fullAddress })
      }));
  };

  const searchAddress = async (e) => {
    e.preventDefault();
    if (!locationDetails.address) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationDetails.address)}`);
      if (res.data && res.data.length > 0) {
        setLocationDetails(prev => ({ ...prev, lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) }));
      }
    } catch(err) { console.error('Geocoding search failed', err); }
  };

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

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                   <div style={{ flex: 1 }}>
                     <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Specific Pin Address</label>
                     <input className="glass-input" style={{ width: '100%' }} placeholder="Type physical address..." value={locationDetails.address} onChange={e => setLocationDetails({...locationDetails, address: e.target.value})} />
                   </div>
                   <button type="button" onClick={searchAddress} className="glass-input" style={{ background: 'rgba(59,130,246,0.2)', padding: '0.7rem', color: '#fff' }}>Locate</button>
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
                   <textarea className="glass-input" style={{ width: '100%', resize: 'vertical' }} placeholder="e.g. A luxury mixed-use development (Also explicitly include any custom POIs you want to scan for, like 'boutique', 'mall', 'flower store'...)" rows={4} value={locationDetails.idea} onChange={e => setLocationDetails({...locationDetails, idea: e.target.value})} />
                </div>

                {error && <div style={{ color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)' }}>{error}</div>}
                
                <button className="primary-btn" type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, marginTop: '0.5rem', width: '100%' }}>
                  {loading ? 'Running AI Subsystems...' : 'Generate Build Strategy'}
                </button>
              </form>
            </div>

            {/* Main Interactive Map & Results Array */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <MapPlaceholder lat={locationDetails.lat} lng={locationDetails.lng} onLocationSelect={handleLocationSelect} />

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
                     
                     {prediction.scan_history && prediction.scan_history.length > 0 ? (
                       <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {prediction.scan_history.map((scan, idx) => {
                             const maxedCount = Object.entries(scan).filter(([k,v]) => k !== 'radius' && v >= 20).length;
                             const emptyCount = Object.entries(scan).filter(([k,v]) => k !== 'radius' && v <= 2).length;
                             const isFinal = idx === prediction.scan_history.length - 1;
                             return (
                               <div key={idx} style={{ background: isFinal ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', padding: '1.5rem', borderRadius: '8px', border: isFinal ? '1px solid #10b981' : '1px dashed #3b82f6' }}>
                                 <h4 style={{ margin: '0 0 0.5rem 0', color: isFinal ? '#34d399' : '#60a5fa' }}>
                                    Step {idx + 1}: {scan.radius}m Radius Search
                                 </h4>
                                 <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                   Identified {maxedCount} saturated categories and {emptyCount} barren constraints.
                                   {!isFinal ? <em style={{color: '#f43f5e', marginLeft: '5px'}}>Adapting search matrix downstream...</em> : <em style={{color: '#10b981', marginLeft: '5px'}}>Density locked for AI generation!</em>}
                                 </p>
                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                    {Object.entries(scan).filter(([k,v]) => k !== 'radius').map(([k,v]) => (
                                        <div key={k}>
                                           <strong style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}:</strong> 
                                           <span style={{fontSize: '1.1rem', marginLeft: '0.4rem', color: v >= 20 ? '#ef4444' : '#f8fafc' }}>{v}{v >= 20 ? '+' : ''}</span>
                                        </div>
                                    ))}
                                 </div>
                               </div>
                             );
                          })}
                       </div>
                     ) : (
                       <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                          {Object.entries(prediction.infrastructure || {}).filter(([k,v]) => k !== 'gap_analysis').map(([k,v]) => (
                               <div key={k}>
                                  <strong style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}:</strong> 
                                  <span style={{fontSize: '1.1rem', marginLeft: '0.4rem', color: v >= 20 ? '#ef4444' : '#f8fafc' }}>{v}{v >= 20 ? '+' : ''}</span>
                               </div>
                          ))}
                       </div>
                     )}
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
