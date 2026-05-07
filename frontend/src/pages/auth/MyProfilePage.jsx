import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import Avatar from '../../components/common/Avatar';
import { PositionBadge } from '../../components/common/Badges';
import toast from 'react-hot-toast';
import { Camera, Gamepad2, Smartphone, Save, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { POSITIONS } from '../../utils/constants';

const DEVICES = ['PS5', 'PS4', 'Xbox Series X/S', 'Xbox One', 'PC', 'Mobile (iOS)', 'Mobile (Android)', 'Nintendo Switch'];

function compressImage(file, maxSize = 400) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize; canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        const size = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function MyProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    position: user?.position || 'CM',
    efootballId: user?.efootballId || '',
    deviceName: user?.deviceName || '',
    bio: user?.bio || '',
    photo: user?.photo || null,
  });
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    const compressed = await compressImage(file);
    setPhotoPreview(compressed);
    set('photo', compressed);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.efootballId.trim()) { toast.error('eFootball ID is required'); return; }
    if (!form.deviceName) { toast.error('Device is required'); return; }
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      await fetchMe();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('New passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPwSaving(false);
    }
  };

  const isProfileComplete = !!(user?.efootballId && user?.deviceName && user?.photo);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
          Manage your player profile and account settings
        </p>
      </div>

      {/* Profile completion alert */}
      {!isProfileComplete && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 12,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>Profile Incomplete</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Add your profile photo, eFootball ID and device to complete your profile.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Gamepad2 size={18} style={{ color: 'var(--accent-green)' }} />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Player Profile</h2>
            {isProfileComplete && <CheckCircle size={16} style={{ color: 'var(--accent-green)', marginLeft: 'auto' }} />}
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div
                style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile"
                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,208,132,0.4)' }} />
                ) : (
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: '2px dashed rgba(0,208,132,0.4)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,208,132,0.05)'
                  }}>
                    <Camera size={20} style={{ color: 'var(--accent-green)' }} />
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: 3 }}>ADD PHOTO</span>
                  </div>
                )}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-secondary)'
                }}>
                  <Camera size={11} style={{ color: '#0a0e1a' }} />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{user?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'monospace' }}>
                  ID: {user?.playerId}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <PositionBadge position={user?.position} />
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                    border: '1px solid rgba(245,158,11,0.25)', textTransform: 'uppercase'
                  }}>{user?.role}</span>
                </div>
                <button type="button" className="btn btn-ghost"
                  style={{ padding: '4px 10px', fontSize: '0.7rem', marginTop: 8 }}
                  onClick={() => fileInputRef.current?.click()}>
                  <Camera size={12} /> Change Photo
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input id="profile-name" className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Position</label>
              <select id="profile-position" className="select" value={form.position} onChange={e => set('position', e.target.value)}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* eFootball ID */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gamepad2 size={13} style={{ color: 'var(--accent-green)' }} />
                eFootball User ID *
              </label>
              <input
                id="profile-efootball-id"
                className="input"
                placeholder="Your in-game eFootball User ID"
                value={form.efootballId}
                onChange={e => set('efootballId', e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                eFootball app → Menu → Profile → User ID
              </span>
            </div>

            {/* Device */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Smartphone size={13} style={{ color: 'var(--accent-blue)' }} />
                Gaming Device *
              </label>
              <select
                id="profile-device"
                className="select"
                value={form.deviceName}
                onChange={e => set('deviceName', e.target.value)}
              >
                <option value="">Select your device...</option>
                {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                id="profile-bio"
                className="input"
                placeholder="Tell the club about yourself..."
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                rows={2}
                maxLength={200}
                style={{ resize: 'none', lineHeight: 1.5 }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {form.bio?.length || 0}/200
              </span>
            </div>

            <button id="save-profile-btn" type="submit" className="btn btn-primary" disabled={saving}
              style={{ justifyContent: 'center' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Lock size={18} style={{ color: 'var(--accent-blue)' }} />
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'currentPassword', label: 'Current Password', id: 'pw-current' },
                { key: 'newPassword', label: 'New Password', id: 'pw-new' },
                { key: 'confirmPassword', label: 'Confirm New Password', id: 'pw-confirm' },
              ].map(({ key, label, id }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id={id}
                      type={showPw[key.replace('Password', '').replace('Password', '') || key] ? 'text' : 'password'}
                      className="input"
                      placeholder="••••••••"
                      value={pwForm[key]}
                      onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ paddingRight: 40 }}
                    />
                    <button type="button"
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onClick={() => setShowPw(prev => {
                        const k = key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm';
                        return { ...prev, [k]: !prev[k] };
                      })}>
                      {showPw[key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm'] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              <button id="change-password-btn" type="submit" className="btn btn-secondary" disabled={pwSaving}
                style={{ justifyContent: 'center' }}>
                <Lock size={16} /> {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Account Info */}
          <div className="glass-card" style={{ padding: 20, marginTop: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, color: 'var(--text-secondary)' }}>Account Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Email', value: user?.email },
                { label: 'Role', value: user?.role?.toUpperCase() },
                { label: 'Member Since', value: user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                { label: 'Profile Status', value: isProfileComplete ? '✅ Complete' : '⚠️ Incomplete' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
