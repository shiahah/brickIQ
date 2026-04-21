export default function RecommendationCard({ result }) {
  if (!result) return null;

  const { recommended_land_use, expected_roi_percentage, explainability } = result;
  const roi = parseFloat(expected_roi_percentage) || 0;
  const roiCapped = Math.min(roi, 100);

  const landUseIcons = {
    Apartment: "🏢", Clinic: "🏥", Office: "🖥️",
    "Independent Floor": "🏠", Villa: "🏡", Commercial: "🏪",
    Warehouse: "🏭", default: "📍",
  };

  const icon = landUseIcons[recommended_land_use] || landUseIcons.default;

  return (
    <div className="rec-card">
      <div className="rec-header">
        <div className="rec-label">AI Recommendation</div>
        <div className="rec-badge">LIVE</div>
      </div>

      <div className="rec-body">
        <div className="land-use-display">
          <span className="lu-icon">{icon}</span>
          <div>
            <div className="lu-type">Recommended Land Use</div>
            <div className="lu-name">{recommended_land_use}</div>
          </div>
        </div>

        <div className="roi-section">
          <div className="roi-header">
            <span className="roi-label">Expected ROI</span>
            <span className="roi-value">{roi.toFixed(1)}%</span>
          </div>
          <div className="roi-bar-bg">
            <div
              className="roi-bar-fill"
              style={{ width: `${roiCapped}%` }}
            />
          </div>
          <div className="roi-scale">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </div>

      {explainability && explainability.length > 0 && (
        <div className="explain-section">
          <div className="explain-title">
            <span>🔍</span> Why This Was Recommended
          </div>
          <div className="explain-list">
            {explainability.map((item, i) => (
              <div className="explain-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="explain-dot" />
                <span className="explain-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .rec-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,200,150,0.2);
          border-radius: 16px;
          padding: 24px;
          animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        .rec-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .rec-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); }
        .rec-badge {
          font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
          background: rgba(0,200,150,0.15); color: #00c896;
          padding: 3px 8px; border-radius: 20px;
          border: 1px solid rgba(0,200,150,0.3);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        .rec-body { display: flex; flex-direction: column; gap: 20px; margin-bottom: 20px; }

        .land-use-display {
          display: flex; align-items: center; gap: 16px;
          background: rgba(0,200,150,0.06);
          border: 1px solid rgba(0,200,150,0.12);
          border-radius: 12px; padding: 16px;
        }
        .lu-icon { font-size: 36px; }
        .lu-type { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: rgba(255,255,255,0.3); margin-bottom: 4px; }
        .lu-name { font-size: 22px; font-weight: 700; color: #fff; }

        .roi-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
        .roi-label { font-size: 13px; color: rgba(255,255,255,0.5); }
        .roi-value { font-size: 28px; font-weight: 800; color: #00c896; font-variant-numeric: tabular-nums; }

        .roi-bar-bg {
          height: 8px; background: rgba(255,255,255,0.07);
          border-radius: 4px; overflow: hidden; margin-bottom: 6px;
        }
        .roi-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00c896, #0077ff);
          border-radius: 4px;
          transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
        }
        .roi-scale { display: flex; justify-content: space-between; font-size: 10px; color: rgba(255,255,255,0.2); }

        .explain-section {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 18px;
        }
        .explain-title {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.6);
          margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
        }
        .explain-list { display: flex; flex-direction: column; gap: 8px; }
        .explain-item {
          display: flex; align-items: flex-start; gap: 10px;
          animation: fadeIn 0.4s ease both;
        }
        .explain-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #00c896; margin-top: 5px; flex-shrink: 0;
        }
        .explain-text { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.5; }
      `}</style>
    </div>
  );
}
