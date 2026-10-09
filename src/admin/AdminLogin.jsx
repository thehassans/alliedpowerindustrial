import React, { useState } from 'react';

export default function AdminLogin({ onLoginSuccess, onBackToSite }) {
  const [email, setEmail] = useState('admin@alliedpowerindustrial.com');
  const [password, setPassword] = useState('admin2026');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Allow demo credentials or non-empty login
      if (email && password) {
        localStorage.setItem('allied_admin_session', JSON.stringify({
          email,
          role: 'Super Administrator',
          loginTime: new Date().toISOString()
        }));
        onLoginSuccess();
      } else {
        setError('Please enter valid administrator credentials.');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      backgroundImage: 'radial-gradient(ellipse at top, rgba(0, 104, 55, 0.08) 0%, rgba(248, 250, 252, 1) 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#0f172a',
      fontFamily: "'Exo', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        borderTop: '4px solid #006837',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
        padding: '40px 36px'
      }}>
        {/* Logo & Portal Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '10px 18px',
            borderRadius: '10px',
            display: 'inline-block',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <img
              src="/alliedpowerlogo-removebg-preview.png"
              alt="Allied Power Industrial Company"
              style={{ height: '48px', objectFit: 'contain' }}
            />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            Enterprise Management Console
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Procurement Requisitions, Catalog CRUD &amp; SEO Controls
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '6px' }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="admin@alliedpowerindustrial.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Master Security Key / Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="••••••••••••"
            />
          </div>

          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '11px',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="bi bi-shield-lock-fill" style={{ color: '#006837' }}></i>
            <span>Demo Mode Ready: Click "Authorize Access" below to enter.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#006837',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(0, 104, 55, 0.3)',
              transition: 'all 0.2s',
              marginTop: '4px'
            }}
          >
            {isLoading ? (
              <span>Authenticating Credentials...</span>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Authorize &amp; Access Admin Console</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={onBackToSite}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="bi bi-arrow-left"></i> Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
}
