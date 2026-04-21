import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const areaData = [
  { year: '2019', price: 6500 }, { year: '2020', price: 6800 },
  { year: '2021', price: 7400 }, { year: '2022', price: 8900 },
  { year: '2023', price: 10500 }, { year: '2024', price: 12000 }
];

const barData = [
  { type: 'Apt 3BHK', demand: 85 }, { type: 'Comm/Retail', demand: 45 },
  { type: 'Builder Floor', demand: 92 }, { type: 'Villas', demand: 30 }
];

export default function Charts() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="animate-slide-up">
      <div className="glass-card" style={{ padding: '2rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Historical Price Trends</h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={areaData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="rgba(59,130,246,0.3)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-card" style={{ padding: '2rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Current Demand by Property Type</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="type" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="demand" fill="#10b981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
