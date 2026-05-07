import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Camera, User, Gamepad2, Smartphone, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { POSITIONS } from '../../utils/constants';

const DEVICES = ['PS5', 'PS4', 'Xbox Series X/S', 'Xbox One', 'PC', 'Mobile (iOS)', 'Mobile (Android)', 'Nintendo Switch'];

// Image compress helper — converts to 400×400 jpeg base64
function compressImage(file, maxSize = 400) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        // Crop to square from center
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1=Account, 2=Profile
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    position: 'CM',
    efootballId: '',
    deviceName: '',
    bio: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    try {
      const compressed = await compressImage(file);
      setPhotoBase64(compressed);
      setPhotoPreview(compressed);
    } catch {
      toast.error('Failed to process image');
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    
    // Gmail validation
    if (!form.email.toLowerCase().endsWith('@gmail.com')) {
      toast.error('Only Gmail addresses (@gmail.com) are allowed for registration');
      return;
    }

    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.efootballId.trim()) { toast.error('eFootball User ID is required'); return; }
    if (!form.deviceName) { toast.error('Device name is required'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photo: photoBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // Auto-login after registration
      localStorage.setItem('token', data.token);
      useAuthStore.setState({ user: data.user, token: data.token });
      toast.success(`Welcome to the club, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '16px',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,208,132,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(0,240,255,0.2))',
            border: '1px solid rgba(255,215,0,0.3)', boxShadow: '0 0 30px rgba(255,215,0,0.15)'
          }}>⚽</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.2rem', fontWeight: 800, marginBottom: 2, letterSpacing: '0.025em' }}>
            Join <span className="gradient-text">IUT eFootball</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Create your player profile</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {[{ n: 1, label: 'Account' }, { n: 2, label: 'Player Profile' }].map(({ n, label }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                background: step >= n ? 'rgba(0,240,255,0.15)' : 'var(--bg-card)',
                color: step >= n ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: `1px solid ${step >= n ? 'rgba(0,240,255,0.4)' : 'var(--border)'}`,
                transition: 'all 0.3s'
              }}>
                <span>{n}</span> {label}
              </div>
              {n < 2 && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 28 }}>
          {/* STEP 1 — Account info */}
          {step === 1 && (
            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <User size={18} style={{ color: 'var(--accent-green)' }} />
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Account Details</h2>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input id="reg-name" className="input" placeholder="Your full name"
                  value={form.name} onChange={e => set('name', e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input id="reg-email" type="email" className="input" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min 6 chars)</span></label>
                <div style={{ position: 'relative' }}>
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input"
                    placeholder="••••••••" value={form.password}
                    onChange={e => set('password', e.target.value)} required style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Position</label>
                <select id="reg-position" className="select" value={form.position} onChange={e => set('position', e.target.value)}>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <button id="reg-next-btn" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}>
                Next: Player Profile <ChevronRight size={16} />
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--accent-green)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </form>
          )}

          {/* STEP 2 — Player profile */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Gamepad2 size={18} style={{ color: 'var(--accent-green)' }} />
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Player Profile</h2>
              </div>

              {/* Photo upload */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 96, height: 96, borderRadius: '50%', cursor: 'pointer',
                    border: '2px dashed rgba(0,208,132,0.5)', position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: photoPreview ? 'transparent' : 'rgba(0,208,132,0.05)',
                    overflow: 'hidden', transition: 'border-color 0.2s'
                  }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <Camera size={22} style={{ color: 'var(--accent-green)' }} />
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 4 }}>Add Photo</div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                <button type="button" className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                  onClick={() => fileInputRef.current?.click()}>
                  <Camera size={14} /> {photoPreview ? 'Change Photo' : 'Upload Profile Photo'}
                </button>
              </div>

              {/* eFootball ID */}
              <div className="form-group">
                <label className="form-label">eFootball User ID *</label>
                <div style={{ position: 'relative' }}>
                  <Gamepad2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-efootball-id"
                    className="input"
                    placeholder="Your in-game eFootball ID"
                    value={form.efootballId}
                    onChange={e => set('efootballId', e.target.value)}
                    style={{ paddingLeft: 36 }}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Find it in eFootball → Profile → User ID
                </span>
              </div>

              {/* Device */}
              <div className="form-group">
                <label className="form-label">Gaming Device *</label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    id="reg-device"
                    type="text"
                    className="input"
                    placeholder="e.g. PS5, PC, Mobile"
                    value={form.deviceName}
                    onChange={e => set('deviceName', e.target.value)}
                    style={{ paddingLeft: 36 }}
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="form-group">
                <label className="form-label">Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  id="reg-bio"
                  className="input"
                  placeholder="Tell your clubmates about yourself..."
                  value={form.bio}
                  onChange={e => set('bio', e.target.value)}
                  rows={2}
                  maxLength={200}
                  style={{ resize: 'none', lineHeight: 1.5 }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {form.bio.length}/200
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button id="reg-submit-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
                  {loading ? (
                    <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Registering...</>
                  ) : '🎉 Join the Club'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
