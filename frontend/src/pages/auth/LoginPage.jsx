import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleLogin = async (credential) => {
    setLoading(true);
    try {
      await googleLogin(credential);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 16,
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(255,215,0,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,240,255,0.05) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
            background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(0,240,255,0.2))',
            border: '1px solid rgba(255,215,0,0.3)', boxShadow: '0 0 30px rgba(255,215,0,0.15)'
          }}>⚽</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 800, marginBottom: 4, letterSpacing: '0.025em' }}>
            IUT <span className="gradient-text">eFootball</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tournament Manager — Members Only</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Sign In</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 24 }}>
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@club.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              id="login-btn"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button 
              type="button" 
              className="btn btn-ghost" 
              style={{ 
                width: '100%', justifyContent: 'center', padding: '10px',
                border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)'
              }}
              onClick={() => {
                // We'll use the official GoogleLogin component for better security
              }}
            >
              <div id="google-login-target" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin 
                  onSuccess={credentialResponse => {
                    handleGoogleLogin(credentialResponse.credential);
                  }}
                  onError={() => {
                    toast.error('Google Login Failed');
                  }}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  width="376"
                />
              </div>
            </button>
          </div>


          {/* Register link */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            New player?{' '}
            <Link to="/register" style={{ color: 'var(--accent-green)', fontWeight: 700, textDecoration: 'none' }}>
              Create your profile →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
