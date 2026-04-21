import { useState } from "react";
import api from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { username: form.username, email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      onLogin(data.token, data.user || { email: form.email, username: form.username });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="grid-overlay" />
        <div className="orb orb1" />
        <div className="orb orb2" />
      </div>

      <div className="login-card">
        <div className="brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">BrickIQ</span>
        </div>
        <p className="brand-sub">Real Estate Intelligence Platform</p>

        <div className="tab-row">
          <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
            Sign In
          </button>
          <button className={`tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>
            Register
          </button>
        </div>

        <div className="fields">
          {mode === "register" && (
            <div className="field">
              <label>Username</label>
              <input name="username" value={form.username} onChange={handle} placeholder="yourname" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" />
          </div>
        </div>

        {error && <p className="err">{error}</p>}

        <button className="submit-btn" onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        <p className="footer-note">
          AI-powered land use recommendations for Tier-2 &amp; Tier-3 cities.
        </p>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c14; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
          background: #080c14;
        }

        .login-bg {
          position: fixed; inset: 0; z-index: 0;
        }

        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,200,150,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,150,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: 0.25;
          animation: float 8s ease-in-out infinite;
        }
        .orb1 { width: 500px; height: 500px; background: #00c896; top: -150px; left: -150px; }
        .orb2 { width: 400px; height: 400px; background: #0077ff; bottom: -100px; right: -100px; animation-delay: -4s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }

        .login-card {
          position: relative; z-index: 1;
          width: 420px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 4px;
        }
        .brand-icon {
          font-size: 28px; color: #00c896;
          animation: spin 20s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .brand-name {
          font-size: 26px; font-weight: 700;
          color: #fff; letter-spacing: -0.5px;
        }
        .brand-sub {
          color: rgba(255,255,255,0.35);
          font-size: 13px; margin-bottom: 28px;
          padding-left: 38px;
        }

        .tab-row {
          display: flex; gap: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px; padding: 4px;
          margin-bottom: 24px;
        }
        .tab {
          flex: 1; padding: 8px;
          border: none; background: transparent;
          color: rgba(255,255,255,0.4);
          border-radius: 7px; cursor: pointer;
          font-size: 14px; font-weight: 500;
          transition: all 0.2s;
        }
        .tab.active {
          background: rgba(0,200,150,0.15);
          color: #00c896;
        }

        .fields { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }

        .field label {
          display: block; font-size: 12px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 6px;
        }
        .field input {
          width: 100%; padding: 11px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #fff;
          font-size: 14px; outline: none;
          transition: border-color 0.2s;
        }
        .field input:focus { border-color: rgba(0,200,150,0.5); }
        .field input::placeholder { color: rgba(255,255,255,0.2); }

        .err {
          color: #ff6b6b; font-size: 13px;
          margin-bottom: 12px;
          padding: 10px 14px;
          background: rgba(255,107,107,0.08);
          border-radius: 8px; border: 1px solid rgba(255,107,107,0.2);
        }

        .submit-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #00c896, #0077ff);
          border: none; border-radius: 11px;
          color: #fff; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s, transform 0.1s;
          margin-bottom: 20px;
        }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .footer-note {
          text-align: center; font-size: 12px;
          color: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
