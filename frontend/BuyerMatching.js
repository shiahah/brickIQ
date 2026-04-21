const mockBuyers = [
  { id: 1, name: "Rajesh Mehta", budget: "₹45–60L", interest: "2BHK Apartment", city: "Hyderabad", match: 94 },
  { id: 2, name: "Priya Sharma", budget: "₹80–1.2Cr", interest: "Office Space", city: "Gurgaon", match: 87 },
  { id: 3, name: "Arjun Nair", budget: "₹25–35L", interest: "Clinic / Medical", city: "Kolkata", match: 81 },
  { id: 4, name: "Sunita Verma", budget: "₹1.5–2Cr", interest: "Villa / Independent", city: "Mumbai", match: 76 },
];

export default function BuyerMatching() {
  return (
    <div className="bm-wrap">
      <div className="bm-header">
        <span className="bm-icon">🤝</span>
        <div>
          <div className="bm-title">Direct Buyer Matches</div>
          <div className="bm-sub">No broker intermediary — direct inquiries</div>
        </div>
        <div className="bm-count">{mockBuyers.length} Active</div>
      </div>
      <div className="bm-list">
        {mockBuyers.map((b, i) => (
          <div className="bm-item" key={b.id} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="bm-avatar">{b.name[0]}</div>
            <div className="bm-info">
              <div className="bm-name">{b.name}</div>
              <div className="bm-detail">{b.interest} · {b.city} · {b.budget}</div>
            </div>
            <div className="bm-match-wrap">
              <div className="bm-match">{b.match}%</div>
              <div className="bm-match-label">match</div>
            </div>
            <button className="bm-btn">Connect</button>
          </div>
        ))}
      </div>
      <style>{`
        .bm-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px;
        }
        .bm-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 16px;
        }
        .bm-icon { font-size: 20px; }
        .bm-title { font-size: 14px; font-weight: 600; color: #fff; }
        .bm-sub { font-size: 11px; color: rgba(255,255,255,0.3); }
        .bm-count {
          margin-left: auto;
          background: rgba(0,200,150,0.12); color: #00c896;
          font-size: 12px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid rgba(0,200,150,0.25);
        }
        .bm-list { display: flex; flex-direction: column; gap: 8px; }
        .bm-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px; border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          animation: fadeIn 0.4s ease both;
          transition: border-color 0.2s;
        }
        .bm-item:hover { border-color: rgba(0,200,150,0.2); }
        @keyframes fadeIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        .bm-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #00c896, #0077ff);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; color: #fff;
          flex-shrink: 0;
        }
        .bm-info { flex: 1; min-width: 0; }
        .bm-name { font-size: 14px; font-weight: 600; color: #fff; }
        .bm-detail { font-size: 11px; color: rgba(255,255,255,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bm-match-wrap { text-align: center; flex-shrink: 0; }
        .bm-match { font-size: 16px; font-weight: 800; color: #00c896; }
        .bm-match-label { font-size: 10px; color: rgba(255,255,255,0.3); }
        .bm-btn {
          padding: 6px 14px; border-radius: 7px;
          background: rgba(0,119,255,0.12); color: #4da6ff;
          border: 1px solid rgba(0,119,255,0.25);
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .bm-btn:hover { background: rgba(0,119,255,0.2); }
      `}</style>
    </div>
  );
}
