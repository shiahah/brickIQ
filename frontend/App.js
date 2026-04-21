import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("brickiq_token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("brickiq_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (tok, userData) => {
    localStorage.setItem("brickiq_token", tok);
    localStorage.setItem("brickiq_user", JSON.stringify(userData));
    setToken(tok);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("brickiq_token");
    localStorage.removeItem("brickiq_user");
    setToken(null);
    setUser(null);
  };

  if (!token) return <Login onLogin={handleLogin} />;
  return <Dashboard user={user} token={token} onLogout={handleLogout} />;
}
