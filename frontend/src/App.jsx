import React, { useState } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('token');
    return (saved && saved !== 'null' && saved !== 'undefined') ? saved : null;
  });

  const handleSetToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div style={{ color: "white" }}>
      {token ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login setToken={handleSetToken} />
      )}
    </div>
  );
}
