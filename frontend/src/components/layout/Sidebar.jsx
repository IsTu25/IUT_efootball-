import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Users, Trophy, Swords, BarChart3,
  LogOut, Menu, X, Shield, ChevronRight, Settings, UserCircle, Bell
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/players', icon: Users, label: 'Players' },
  { to: '/tournaments', icon: Trophy, label: 'Tournaments' },
  { to: '/matches', icon: Swords, label: 'Matches' },
  { to: '/leaderboard', icon: BarChart3, label: 'Leaderboard' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count
  useEffect(() => {
    if (user) {
      import('../../api/client').then(({ default: api }) => {
        api.get('/notifications').then(res => {
          const count = res.data.filter(n => n.status === 'unread').length;
          setUnreadCount(count);
        }).catch(() => {});
      });
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="sidebar" style={mobileOpen ? { transform: 'translateX(0)' } : {}}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20,
            background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(0,240,255,0.2))',
            border: '1px solid rgba(255,215,0,0.3)'
          }}>⚽</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.2, color: 'var(--text-primary)', letterSpacing: '0.025em' }}>
              IUT eFootball
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.05em' }}>
              TOURNAMENT MANAGER
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 4px 8px', textTransform: 'uppercase' }}>
          Menu
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon size={17} />
              <span style={{ fontWeight: 500 }}>{label}</span>
            </div>
            {to === '/notifications' && unreadCount > 0 && (
              <span style={{ 
                background: 'var(--accent-cyan)', color: '#080c18', 
                fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', 
                borderRadius: 999 
              }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', padding: '16px 4px 8px', textTransform: 'uppercase' }}>
              Admin Control
            </div>
            <NavLink to="/admin/players" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Shield size={17} />
              <span style={{ fontWeight: 500 }}>Manage Players</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        {/* My Profile clickable user card */}
        <div
          onClick={() => { navigate('/my-profile'); setMobileOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: 'var(--bg-card-hover)', borderRadius: 10, marginBottom: 6,
            cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
          title="My Profile"
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
        >
          {user?.photo ? (
            <img src={user.photo} alt={user.name}
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--accent-cyan)' }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
              background: 'rgba(0,240,255,0.15)', color: 'var(--accent-cyan)',
              fontFamily: "'Barlow Condensed', sans-serif"
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em',
              color: user?.role === 'admin' ? 'var(--accent-gold)' : 'var(--accent-cyan)' }}>
              {user?.role} · {user?.profileCompleted ? '✅ PROFILE OK' : '⚠️ INCOMPLETE'}
            </div>
          </div>
          <Settings size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ width: '100%', background: 'none', border: 'none', color: 'var(--accent-red)', gap: 10, paddingLeft: 12, fontWeight: 600 }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '8px', cursor: 'pointer', color: 'var(--text-primary)'
        }}
        className="mobile-menu-btn"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <SidebarContent />

      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 40, display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .sidebar { transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'}; }
        }
      `}</style>
    </>
  );
}
