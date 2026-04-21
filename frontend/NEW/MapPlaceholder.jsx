import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapPlaceholder() {
  return (
    <div className="glass-card animate-slide-up" style={{ padding: '2rem', minHeight: '350px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes scanLine {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>

      {/* Perspective grid background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(rgba(59,130,246,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.5,
        transform: 'perspective(500px) rotateX(60deg) scale(2)',
        transformOrigin: 'center 80%'
      }} />

      {/* Scanning Line — keyframe defined above in this component */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '4px',
        background: '#3b82f6',
        boxShadow: '0 0 20px 5px rgba(59,130,246,0.5)',
        animation: 'scanLine 3s infinite linear',
        top: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <MapPin color="#3b82f6" size={48} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px', height: '80px',
            border: '2px solid rgba(59,130,246,0.5)',
            borderRadius: '50%',
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
          }} />
        </div>
        <h3 style={{ marginTop: '1.5rem', color: '#60a5fa' }}>Awaiting Asset Parameters</h3>
        <p style={{ opacity: 0.6 }}>Enter location details to generate 3D intelligence map</p>
      </div>
    </div>
  );
}
