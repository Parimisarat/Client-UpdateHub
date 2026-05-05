import React, { useState } from 'react';
import { Briefcase, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const users = [
    { username: 'admin', password: 'admin123', name: 'Admin User' },
    { username: 'karthik', password: '1234', name: 'Karthik' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a professional loading feel
    setTimeout(() => {
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a0f18',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div className="modal-content" style={{ 
        width: '100%',
        maxWidth: '420px', 
        padding: '3rem', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#111827',
        borderRadius: '16px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="pulse" style={{ 
            background: 'var(--accent-color)', 
            width: '50px', 
            height: '50px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Briefcase size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sign in to manage your Client Hub</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
              <User size={14} /> Username
            </label>
            <input 
              type="text" 
              required 
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className={error ? 'input-error' : ''}
              style={{ paddingLeft: '1rem' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
              <Lock size={14} /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={error ? 'input-error' : ''}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              marginTop: '1rem', 
              padding: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="spin" />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
            Demo access: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
