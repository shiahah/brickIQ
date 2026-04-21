import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function MapPlaceholder({ onLocationSelect }) {
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('brickiq_map_pin');
      return saved ? JSON.parse(saved) : { lat: 19.0760, lng: 72.8777 }; // Default Mumbai
    } catch {
       return { lat: 19.0760, lng: 72.8777 };
    }
  });

  useEffect(() => {
    if (position) {
      localStorage.setItem('brickiq_map_pin', JSON.stringify(position));
      if (onLocationSelect) onLocationSelect(position.lat, position.lng);
    }
  }, [position, onLocationSelect]);

  return (
    <div className="glass-card animate-slide-up" style={{ height: '350px', width: '100%', overflow: 'hidden', borderRadius: '12px', padding: 0 }}>
      {typeof window !== 'undefined' && (
        <MapContainer center={[position.lat, position.lng]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      )}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'rgba(15,23,42,0.8)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', color: '#60a5fa', backdropFilter: 'blur(4px)', border: '1px solid rgba(59,130,246,0.3)' }}>
        Drag map & click to drop pin
      </div>
    </div>
  );
}
