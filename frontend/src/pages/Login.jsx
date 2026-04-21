import React, { useState } from 'react';
import api from '../api';

export default function Login({ setToken }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await api.post(endpoint, formData);
      if (res.data.token) {
        setToken(res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication Failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card animate-slide-up" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {isRegister ? 'Join BrickIQ' : 'Welcome Back'}
        </h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <input 
              type="text" 
              placeholder="Full Name" 
              className="glass-input" 
              required
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            className="glass-input" 
            required
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="glass-input" 
            required
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          <button type="submit" className="primary-btn" style={{ marginTop: '1rem' }}>
            {isRegister ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', opacity: 0.7, cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}
