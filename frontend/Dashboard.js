import { useState } from "react";
import api from "../api";
import RecommendationCard from "../components/RecommendationCard";
import { PriceTrendChart, DemandChart } from "../components/Charts";
import MapPlaceholder from "../components/MapPlaceholder";
import BuyerMatching from "../components/BuyerMatching";
import EthicsModal from "../components/EthicsModal";

const CITIES = ["Gurgaon", "Hyderabad", "Kolkata", "Mumbai"];
const SECTORS = {
  Gurgaon: ["Sector 14", "Sector 22", "Sector 45", "Sector 56", "DLF Phase 1"],
  Hyderabad: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "HITEC City"],
  Kolkata: ["Salt Lake", "New Town", "Park Street", "Ballygunge", "Rajarhat"],
  Mumbai: ["Andheri", "Bandra", "Powai", "Dadar", "Navi Mumbai"],
};

const statCards = [
  { icon: "🏙️", label: "Cities Covered", value: "4", trend: "+2 soon" },
  { icon: "📊", label: "Avg Market ROI", value: "18.4%", trend: "+2.1% YoY" },
  { icon: "🏗️", label: "Projects Analysed", value: "1,240", trend: "This month" },
  { icon: "🤝", label: "Direct Matches", value: "89", trend: "Active buyers" },
];

export default function Dashboard({ user, token, onLogout }) {
  const [form, setForm] = useState({
    city: "", sector: "", bedrooms: 2, bathrooms: 2,
    age: 5, carpet_sqft: 1000,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("predict");

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        city: form.city,
        sector: form.sector,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        age: parseInt(form.age),
        carpet_sqft: parseInt(form.carpet_sqft),
      };
      const { data } = await api.post("/predict", payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-root">
      {/* Background */}
      <div className="dash-bg">
        <div className="dash-grid" />
        <div className="dash-glow" />
      </div>

      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-hex">⬡</span>
          <span className="topbar-name">BrickIQ</span>
        </div>
        <nav className="topbar-nav">
          {["predict", "market", "buyers"].map((t) => (
            <button
              key={t}
              className={`nav-btn ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "predict" && "🧠 "}
              {t === "market" && "📊 "}
              {t === "buyers" && "🤝 "}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <span className="topbar-user">
            👤 {user?.username || user?.email?.split("@")[0] || "User"}
          </span>
          <button className="logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <main className="dash-main">
        {/* Stat cards */}
        <div className="stat-row">
          {statCards.map((s, i) => (
            <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="stat-top">
                <span className="stat-icon">{s.icon}</span>
                <span className="stat-trend">{s.trend}</span>
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── PREDICT TAB ── */}
        {activeTab === "predict" && (
          <div className="predict-layout">
            {/* Left: Form */}
            <div className="form-panel">
              <div className="panel-label">📍 Property Details</div>

              <div className="form-grid">
                <div className="form-field span2">
                  <label>City</label>
                  <select name="city" value={form.city} onChange={handle}>
                    <option value="">Select city…</option>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-field span2">
                  <label>Sector / Locality</label>
                  <select name="sector" value={form.sector} onChange={handle} disabled={!form.city}>
                    <option value="">Select sector…</option>
                    {(SECTORS[form.city] || []).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Bedrooms</label>
                  <input type="number" name="bedrooms" value={form.bedrooms} min={1} max={10} onChange={handle} />
                </div>

                <div className="form-field">
                  <label>Bathrooms</label>
                  <input type="number" name="bathrooms" value={form.bathrooms} min={1} max={10} onChange={handle} />
                </div>

                <div className="form-field">
                  <label>Age (years)</label>
                  <input type="number" name="age" value={form.age} min={0} max={100} onChange={handle} />
                </div>

                <div className="form-field">
                  <label>Carpet Area (sqft)</label>
                  <input type="number" name="carpet_sqft" value={form.carpet_sqft} min={100} onChange={handle} />
                </div>
              </div>

              {error && <div className="form-err">{error}</div>}

              <button
                className="predict-btn"
                onClick={submit}
                disabled={loading || !form.city || !form.sector}
              >
                {loading ? (
                  <span className="loading-dots">
                    <span /><span /><span />
                  </span>
                ) : "Run AI Analysis →"}
              </button>

              <MapPlaceholder city={form.city} sector={form.sector} />
            </div>

            {/* Right: Result */}
            <div className="result-panel">
              {!result && !loading && (
                <div className="empty-state">
                  <div className="empty-hex">⬡</div>
                  <p>Fill in the property details and run the AI analysis to get land use recommendations.</p>
                </div>
              )}
              {loading && (
                <div className="empty-state">
                  <div className="empty-hex spinning">⬡</div>
                  <p>Analysing market data and running XGBoost model…</p>
                </div>
              )}
              {result && <RecommendationCard result={result} />}
            </div>
          </div>
        )}

        {/* ── MARKET TAB ── */}
        {activeTab === "market" && (
          <div className="market-layout">
            <div className="section-title">📊 Area Intelligence</div>
            <div className="charts-grid">
              <PriceTrendChart />
              <DemandChart />
            </div>
            <div className="market-info">
              <div className="info-card">
                <div className="info-icon">🏙️</div>
                <div className="info-label">Tier-2 / Tier-3 Focus</div>
                <p>BrickIQ prioritises markets that legacy platforms ignore — cities with high growth potential and underserved demand.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🤖</div>
                <div className="info-label">XGBoost Intelligence</div>
                <p>Our model is trained on 10,000+ property transactions across Gurgaon, Hyderabad, Kolkata and Mumbai with 92% accuracy.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🔍</div>
                <div className="info-label">Explainable AI</div>
                <p>Every recommendation lists the exact factors — location score, area demand, infrastructure index — that drove the result.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── BUYERS TAB ── */}
        {activeTab === "buyers" && (
          <div className="buyers-layout">
            <div className="section-title">🤝 Builder–Buyer Direct Matching</div>
            <p className="section-sub">Eliminating broker dependency. Connect directly with verified buyers.</p>
            <BuyerMatching />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="dash-footer">
        <span className="footer-brand">⬡ BrickIQ</span>
        <span className="footer-copy">© 2024 · AI-powered real estate intelligence</span>
        <EthicsModal />
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c14; }

        .dash-root {
          min-height: 100vh;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          color: #fff;
          background: #080c14;
          position: relative;
        }

        .dash-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .dash-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,200,150,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,150,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .dash-glow {
          position: absolute; top: -200px; right: -200px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,119,255,0.08), transparent 70%);
        }

        /* TOPBAR */
        .topbar {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; gap: 24px;
          padding: 0 28px; height: 60px;
          background: rgba(8,12,20,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .topbar-brand { display: flex; align-items: center; gap: 8px; }
        .topbar-hex { color: #00c896; font-size: 20px; }
        .topbar-name { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }

        .topbar-nav { display: flex; gap: 4px; flex: 1; }
        .nav-btn {
          padding: 6px 14px; border-radius: 8px;
          background: transparent; border: none;
          color: rgba(255,255,255,0.4); font-size: 13px;
          font-weight: 500; cursor: pointer; transition: all 0.2s;
        }
        .nav-btn:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); }
        .nav-btn.active { color: #00c896; background: rgba(0,200,150,0.1); }

        .topbar-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
        .topbar-user { font-size: 13px; color: rgba(255,255,255,0.4); }
        .logout-btn {
          padding: 5px 12px; border-radius: 7px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); font-size: 12px;
          cursor: pointer; transition: all 0.2s;
        }
        .logout-btn:hover { color: #fff; border-color: rgba(255,255,255,0.2); }

        /* MAIN */
        .dash-main {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          padding: 28px 28px 60px;
        }

        /* STAT CARDS */
        .stat-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 28px;
        }
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 18px;
          animation: slideUp 0.5s ease both;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: rgba(0,200,150,0.2); }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .stat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .stat-icon { font-size: 18px; }
        .stat-trend { font-size: 10px; color: rgba(0,200,150,0.7); background: rgba(0,200,150,0.08); padding: 2px 7px; border-radius: 10px; }
        .stat-value { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.35); }

        /* PREDICT */
        .predict-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .form-panel, .result-panel {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
        }

        .panel-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.8px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-field.span2 { grid-column: 1 / -1; }
        .form-field label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: rgba(255,255,255,0.35); }
        .form-field input, .form-field select {
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px; color: #fff; font-size: 14px;
          outline: none; transition: border-color 0.2s;
          appearance: none;
        }
        .form-field input:focus, .form-field select:focus { border-color: rgba(0,200,150,0.4); }
        .form-field select option { background: #0d1520; }

        .form-err {
          color: #ff6b6b; font-size: 13px;
          padding: 10px 14px;
          background: rgba(255,107,107,0.08);
          border-radius: 8px; border: 1px solid rgba(255,107,107,0.2);
        }

        .predict-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #00c896, #0077ff);
          border: none; border-radius: 10px;
          color: #fff; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; min-height: 46px;
        }
        .predict-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .predict-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .loading-dots { display: flex; gap: 5px; align-items: center; }
        .loading-dots span {
          width: 7px; height: 7px; border-radius: 50%; background: #fff;
          animation: bounce 1s infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }

        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; text-align: center;
          padding: 40px;
        }
        .empty-hex { font-size: 52px; color: rgba(0,200,150,0.25); }
        .empty-hex.spinning { animation: spin 3s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-state p { font-size: 14px; color: rgba(255,255,255,0.3); max-width: 260px; line-height: 1.6; }

        /* MARKET */
        .market-layout { display: flex; flex-direction: column; gap: 20px; }
        .section-title { font-size: 16px; font-weight: 700; color: #fff; }
        .section-sub { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: -12px; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .market-info { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .info-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .info-icon { font-size: 22px; }
        .info-label { font-size: 13px; font-weight: 600; color: #fff; }
        .info-card p { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; }

        /* BUYERS */
        .buyers-layout { display: flex; flex-direction: column; gap: 16px; }

        /* FOOTER */
        .dash-footer {
          position: relative; z-index: 1;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 16px 28px;
          display: flex; align-items: center; gap: 16px;
          background: rgba(8,12,20,0.6);
        }
        .footer-brand { font-size: 14px; font-weight: 700; color: rgba(0,200,150,0.6); }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); flex: 1; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .stat-row { grid-template-columns: repeat(2,1fr); }
          .predict-layout { grid-template-columns: 1fr; }
          .charts-grid { grid-template-columns: 1fr; }
          .market-info { grid-template-columns: 1fr; }
          .topbar-nav { display: none; }
        }
      `}</style>
    </div>
  );
}
