export default function MapPlaceholder({ city, sector }) {
  return (
    <div className="map-wrap">
      <div className="map-inner">
        <div className="map-grid" />
        <div className="map-rings">
          <div className="ring r1" />
          <div className="ring r2" />
          <div className="ring r3" />
        </div>
        <div className="map-pin">
          <div className="pin-dot" />
          <div className="pin-label">
            {sector && city ? `${sector}, ${city}` : "Select location"}
          </div>
        </div>
        <div className="map-badge">3D MAP — Mapbox Integration Ready</div>
        <div className="scan-line" />
      </div>
      <style>{`
        .map-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden;
          height: 220px; position: relative;
        }
        .map-inner {
          width: 100%; height: 100%;
          background: radial-gradient(ellipse at 50% 60%, rgba(0,119,255,0.08), transparent 70%),
                      #070b12;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .map-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,200,150,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,150,0.06) 1px, transparent 1px);
          background-size: 30px 30px;
          transform: perspective(300px) rotateX(20deg);
          transform-origin: bottom;
        }
        .map-rings { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(0,200,150,0.2);
          animation: expand 3s ease-out infinite;
        }
        .r1 { width: 80px; height: 80px; animation-delay: 0s; }
        .r2 { width: 150px; height: 150px; animation-delay: 1s; }
        .r3 { width: 220px; height: 220px; animation-delay: 2s; }
        @keyframes expand {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(1.1); }
        }
        .map-pin {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .pin-dot {
          width: 14px; height: 14px; border-radius: 50%;
          background: #00c896;
          box-shadow: 0 0 0 4px rgba(0,200,150,0.2), 0 0 20px rgba(0,200,150,0.4);
        }
        .pin-label {
          background: rgba(0,200,150,0.15);
          border: 1px solid rgba(0,200,150,0.3);
          color: #00c896; font-size: 12px; font-weight: 600;
          padding: 4px 12px; border-radius: 20px;
          white-space: nowrap;
        }
        .map-badge {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }
        .scan-line {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0,200,150,0.4), transparent);
          animation: scan 3s linear infinite;
        }
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
