# BrickIQ — Frontend Technical Reference

## Overview

The frontend is a **React SPA (Single Page Application)** built with **Vite** as the bundler. It communicates with the Node.js backend via REST API (Axios), renders an interactive Leaflet map, and displays AI-generated recommendations in a glassmorphism dark UI.

---

## Why React + Vite?

- **React**: Component-based. The UI is broken into reusable pieces (MapPlaceholder, RecommendationCard, etc.) that each manage their own state. React's virtual DOM re-renders only what changed — efficiently.
- **Vite**: Replaces Create React App. Uses native ES Modules for near-instant hot-module replacement (HMR). Dev server starts in milliseconds vs CRA's 30+ seconds.

---

## File-by-File Breakdown

### `src/index.jsx` — Entry Point
```jsx
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```
Single line that mounts the entire React app into `<div id="root">` in `index.html`. `createRoot` is React 18's concurrent mode renderer.

---

### `src/App.jsx` — Auth Gate
Checks `localStorage` for a JWT token. If present → show `<Dashboard>`. If absent → show `<Login>`. No routing library needed — just a conditional render based on `useState`.

---

### `src/api.js` — Axios Base Config
```js
const api = axios.create({ baseURL: 'http://localhost:5000' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
All API calls go through this pre-configured Axios instance. The **interceptor** automatically injects the JWT into the `Authorization: Bearer <token>` header on every request — you never manually attach it anywhere.

---

### `src/index.css` — Global Design System

Defines CSS custom properties and utility classes:
- **Glassmorphism**: `backdrop-filter: blur(10px)` + semi-transparent backgrounds
- **`.glass-card`**: Frosted-glass panels used throughout the UI
- **`.glass-input`**: Consistently styled dark-theme form inputs
- **`.primary-btn`**: Gradient action button
- **`.animate-slide-up`**: CSS keyframe animation for cards entering from below

---

### `src/pages/Dashboard.jsx` — Main Application Page

The largest and most important file. Manages all user state and orchestrates the full prediction flow.

#### State Variables
```jsx
const [activeTab, setActiveTab] = useState('predict');
// Which tab is visible: 'predict' | 'market' | 'buyers'

const [locationDetails, setLocationDetails] = useState({
  locality: 'Andheri West',        // ML pricing index lookup key
  address: 'Andheri West, Mumbai', // Physical address for forward geocoding
  idea: '...',                     // User's free-text vision
  plot_size: 10000,                // Square feet
  budget: 50,                      // Crore ₹ (optional)
  lat: 19.1136,                    // From map pin or Nominatim search
  lng: 72.8697
});

const [prediction, setPrediction] = useState(null);
// null until API responds. When set, all result cards render.
```

#### `handleLocationSelect(lat, lng, locName, fullAddress)` — Map Sync
Called by `MapPlaceholder` when user drops a pin. Merges new lat/lng and auto-fills `locality` + `address` from Nominatim reverse geocoding.

#### `searchAddress(e)` — Forward Geocoding
```jsx
const res = await axios.get(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationDetails.address)}`
);
setLocationDetails(prev => ({ ...prev, lat: res.data[0].lat, lng: res.data[0].lon }));
```
User types a physical address → Nominatim converts it to coordinates → coordinates flow down as props to `MapPlaceholder` → map pans to that location.

#### `handlePredict(e)` — Main API Call
```jsx
const payload = { lat, lng, locality, plot_size, budget, idea };
const res = await api.post('/api/predict', payload);
setPrediction(res.data.data);  // Triggers all result sections to render
```

#### Scan History Rendering
```jsx
{prediction.scan_history.map((scan, idx) => {
  const isFinal = idx === prediction.scan_history.length - 1;
  return (
    <div style={{ border: isFinal ? '1px solid #10b981' : '1px dashed #3b82f6' }}>
      {/* Green border = final locked radius, blue dashed = intermediate attempt */}
      Step {idx+1}: {scan.radius}m Radius Search
      {/* Renders all POI counts for that radius attempt */}
    </div>
  );
})}
```

---

### `src/components/MapPlaceholder.jsx` — Interactive Map

Uses **React-Leaflet** (React wrapper around Leaflet.js) to embed an OpenStreetMap tile layer.

#### `LocationMarker` — Click Handler
```jsx
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition(e.latlng); }  // Any map click drops a pin
  });
  return position ? <Marker position={position} /> : null;
}
```
`useMapEvents` is a React-Leaflet hook that listens to Leaflet's native click events.

#### `ChangeView` — Programmatic Pan
```jsx
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);  // Forces map to pan to new coordinates
  return null;
}
```
When the user types an address and clicks "Locate", new coordinates flow as props. This component receives them and calls `map.setView()` to physically move the camera.

#### Nominatim Reverse Geocoding
```jsx
useEffect(() => {
  const res = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
  );
  const locality = res.data.address.suburb || res.data.address.city_district;
  const fullAddress = res.data.display_name;
  onLocationSelect(position.lat, position.lng, locality, fullAddress);
}, [position]);
```
Every time `position` changes (pin dropped), fires a Nominatim call to convert coordinates → human-readable address. Auto-fills both Locality and Address sidebar fields.

---

### `src/components/RecommendationCard.jsx` — Build Result Cards

```jsx
// LLM-generated logic arrays (from Groq):
{rec.ai_logic?.pros?.map(p => <li>{p}</li>)}
{rec.ai_logic?.cons?.map(c => <li>{c}</li>)}
{rec.ai_logic?.notable_details?.map(d => <li>{d}</li>)}

// Python ML financials (from XGBoost):
<span>{rec.expected_roi_percentage}%</span>
<span>₹{rec.predicted_price_sqft}/sqft</span>
<span>{rec.total_revenue_cr} Cr revenue</span>
<span>{rec.net_profit_cr} Cr net profit</span>
```
`ai_logic` = LLM. Financial numbers = Python XGBoost. Both merged in `predictController.js`.

---

### Other Components

| Component | Purpose |
|---|---|
| `Charts.jsx` | Market Indices tab — trend charts for Mumbai market data |
| `BuyerMatching.jsx` | Buyer Funnel tab — demographic buyer matching UI |
| `EthicsModal.jsx` | AI Ethics popup — discloses how the AI makes decisions |

---

## Key Libraries

| Library | Why |
|---|---|
| `react` 18.x | Core UI framework |
| `vite` 5.x | Build tool / dev server |
| `react-leaflet` 4.x | Map wrapper for Leaflet.js |
| `leaflet` 1.9.x | Map rendering engine (OpenStreetMap tiles) |
| `axios` 1.x | HTTP client for API calls |
| `lucide-react` | Icon library (Shield icon in AI verdict section) |
