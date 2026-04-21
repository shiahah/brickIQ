import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const priceData = [
  { month: "Jan", price: 4200 }, { month: "Feb", price: 4350 },
  { month: "Mar", price: 4100 }, { month: "Apr", price: 4600 },
  { month: "May", price: 4900 }, { month: "Jun", price: 5100 },
  { month: "Jul", price: 5050 }, { month: "Aug", price: 5400 },
  { month: "Sep", price: 5700 }, { month: "Oct", price: 5600 },
  { month: "Nov", price: 5900 }, { month: "Dec", price: 6200 },
];

const demandData = [
  { type: "Apartment", demand: 78 },
  { type: "Office", demand: 54 },
  { type: "Clinic", demand: 41 },
  { type: "Villa", demand: 33 },
  { type: "Commercial", demand: 67 },
  { type: "Warehouse", demand: 22 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tt-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.name.toLowerCase().includes("price")
            ? `₹${p.value.toLocaleString()}/sqft`
            : `${p.value}%`}
        </p>
      ))}
      <style>{`
        .custom-tooltip {
          background: #0d1520; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 10px 14px;
          font-size: 12px; color: rgba(255,255,255,0.7);
        }
        .tt-label { font-weight: 600; margin-bottom: 4px; color: #fff; }
      `}</style>
    </div>
  );
};

export function PriceTrendChart() {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-icon">📈</span>
        <div>
          <div className="chart-title">Price Trend</div>
          <div className="chart-sub">₹/sqft — Last 12 months</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={priceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c896" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="price" name="Price" stroke="#00c896" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <style>{`
        .chart-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px;
        }
        .chart-header { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .chart-icon { font-size:20px; }
        .chart-title { font-size:14px; font-weight:600; color:#fff; }
        .chart-sub { font-size:11px; color:rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}

export function DemandChart() {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-icon">🏗️</span>
        <div>
          <div className="chart-title">Demand Analysis</div>
          <div className="chart-sub">Market demand by land use type</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={demandData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0077ff" />
              <stop offset="100%" stopColor="#00c896" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="type" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="demand" name="Demand" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <style>{`
        .chart-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px;
        }
        .chart-header { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .chart-icon { font-size:20px; }
        .chart-title { font-size:14px; font-weight:600; color:#fff; }
        .chart-sub { font-size:11px; color:rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}
