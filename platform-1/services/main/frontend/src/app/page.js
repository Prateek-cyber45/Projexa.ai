"use client";
import React, { useState } from 'react';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // The Nginx proxy routes api.main.com to your FastAPI backend on port 4000
    const endpoint = isLogin ? 'http://api.main.com/login' : 'http://api.main.com/register';
        
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setToken(data.access_token);
          localStorage.setItem('jwt', data.access_token);
          setMessage('Login successful! Welcome to the CyberPlatform.');
          setTimeout(() => window.location.href = '/dashboard', 1000);
        } else {
          setMessage('Registration successful! You can now log in.');
          setIsLogin(true);
        }
      } else {
        setMessage(data.detail || 'An error occurred.');
      }
    } catch (error) {
      setMessage('Network error. Is the FastAPI backend running?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h2>{isLogin ? 'Log In to CyberPlatform' : 'Register an Account'}</h2>
            
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
          required
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#333', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', color: token ? 'green' : 'red' }}>{message}</p>}

      <button 
        onClick={() => setIsLogin(!isLogin)} 
        style={{ marginTop: '20px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {isLogin ? 'Need an account? Register here.' : 'Already have an account? Log in.'}
      </button>

      {token && (
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f4f4f4', wordBreak: 'break-all' }}>
          <strong>Active JWT Token:</strong> <br/>
          <small>{token}</small>
        </div>
      )}
    </div>
  );
}
