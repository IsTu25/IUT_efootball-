import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import { PositionBadge } from '../../components/common/Badges';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { POSITIONS, formatDate, winRateColor } from '../../utils/constants';
import { Plus, Edit, Trash2, Search, X, Save, Gamepad2, Smartphone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function PlayerModal({ player, onClose, onSaved }) {
  const isEdit = !!player?._id;
  const [form, setForm] = useState({
    name: player?.name || '',
    email: player?.email || '',
    password: '',
    position: player?.position || 'CM',
    role: player?.role || 'player',
  });
  const [saving, setSaving] = useState(false);
  const { user: me } = useAuthStore();
  const isSelf = me?._id === player?._id;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/players/${player._id}`, form);
      } else {
        if (!form.password) { toast.error('Password required for new player'); return; }
        await api.post('/players', form);
      }
      toast.success(isEdit ? 'Player updated' : 'Player created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal glass-card animate-fadeIn" style={{ maxWidth: 440, padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {isEdit ? 'Edit Player' : 'Add New Player'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px', borderRadius: 8 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="player-name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="player-email" type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="player-password" type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Position</label>
              <select id="player-position" className="select" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Role</label>
              <select 
                id="player-role" 
                className="select" 
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value })}
                disabled={isSelf}
                style={isSelf ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <option value="player">Player</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" id="save-player-btn" className="btn btn-primary" disabled={saving} style={{ flex: 2, justifyContent: 'center' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPlayers() {
  const { user } = useAuthStore();
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | player obj

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get('/players'), api.get('/players/leaderboard')])
      .then(([pRes, lRes]) => { setPlayers(pRes.data); setLeaderboard(lRes.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      await api.delete(`/players/${id}`);
      toast.success('Player deactivated');
      fetchData();
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  };

  if (loading) return <LoadingSpinner text="Loading players..." />;

  const statsMap = {};
  leaderboard.forEach(l => { statsMap[l.player._id] = l; });
  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Players</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{players.length} registered members</p>
        </div>
        <button id="add-player-btn" className="btn btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> Add Player
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      <div className="glass-card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                <th>eFootball ID</th>
                <th>Device</th>
                <th>Profile</th>
                <th>Played</th>
                <th>Win %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(player => {
                const s = statsMap[player._id] || {};
                const wr = parseFloat(s.winRate || 0);
                return (
                  <tr key={player._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar user={player} size={34} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{player.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{player.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><PositionBadge position={player.position} /></td>
                    <td>
                      {player.efootballId ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Gamepad2 size={13} />{player.efootballId}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                    </td>
                    <td>
                      {player.deviceName ? (
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Smartphone size={12} />{player.deviceName}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {player.profileCompleted
                        ? <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
                        : <span style={{ color: '#f59e0b', fontSize: '0.7rem' }}>⚠️</span>}
                    </td>
                    <td style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>{s.played || 0}</td>
                    <td>
                      <span style={{ color: winRateColor(wr), fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{wr}%</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          onClick={() => setModal(player)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleDelete(player._id, player.name)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No players found</div>
          )}
        </div>
      </div>

      {modal && (
        <PlayerModal
          player={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
