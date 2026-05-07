import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { StatusBadge } from '../../components/common/Badges';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime, POSITIONS } from '../../utils/constants';
import { Plus, Trophy, Calendar, Users, X, ChevronRight, Settings, Play, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function CreateTournamentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    format: 'round_robin',
    teamSize: 1,
    startDate: '',
    registrationEndDate: '',
    groupCount: '',
    advanceCount: 2,
    requireApproval: false,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.registrationEndDate) { 
      toast.error('Name, Start Date, and Deadline are required'); 
      return; 
    }
    setSaving(true);
    try {
      const groupCount = parseInt(form.groupCount) || 0;
      await api.post('/tournaments', { ...form, groupCount });
      toast.success('Tournament created and users notified!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal glass-card animate-fadeIn" style={{ maxWidth: 640, padding: 32, border: '1px solid var(--accent-cyan)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', margin: 0 }}>
            🏆 Create New <span style={{ color: 'var(--accent-cyan)' }}>Tournament</span>
          </h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 8 }}><X size={24} /></button>
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Tournament Name</label>
              <input className="input" placeholder="e.g. IUT Premier League 2024"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Format</label>
                <select className="select" value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
                  <option value="round_robin">Round Robin + Knockout</option>
                  <option value="ucl">UCL Format (Groups + KOs)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Team Size</label>
                <select className="select" value={form.teamSize} onChange={e => setForm({ ...form, teamSize: parseInt(e.target.value) })}>
                  <option value={1}>Solo (1v1)</option>
                  <option value={2}>Duo (2v2)</option>
                  <option value={4}>Squad (4v4)</option>
                  <option value={11}>Full (11v11)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--accent-cyan)' }}>Registration Deadline</label>
                <input type="datetime-local" className="input" style={{ borderColor: 'var(--accent-cyan)' }}
                  value={form.registrationEndDate} onChange={e => setForm({ ...form, registrationEndDate: e.target.value })} required />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Tournament will start automatically after this time.
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Tournament Start Date</label>
                <input type="date" className="input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Groups Count (auto if 0)</label>
                <input type="number" className="input" placeholder="e.g. 4" min={0}
                  value={form.groupCount} onChange={e => setForm({ ...form, groupCount: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Advance Per Group</label>
                <select className="select" value={form.advanceCount} onChange={e => setForm({ ...form, advanceCount: parseInt(e.target.value) })}>
                  {[1,2,3,4].map(n => <option key={n} value={n}>Top {n} {n > 1 ? 'Teams' : 'Team'}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description & Rules</label>
              <textarea className="input" style={{ minHeight: 80, resize: 'vertical' }} placeholder="Rules, prize pool, or entry requirements..." 
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.requireApproval} onChange={e => setForm({ ...form, requireApproval: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent-cyan)' }} />
                Require admin approval for results
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary glow-gold" disabled={saving} style={{ flex: 2, justifyContent: 'center', fontSize: '1rem', height: 48 }}>
                {saving ? 'Creating...' : '🏆 Create & Notify Users'}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default function TournamentsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetch = () => {
    api.get('/tournaments').then(res => setTournaments(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleStart = async (t) => {
    if (!window.confirm(`Start "${t.name}"? This will generate groups and matches.`)) return;
    try {
      await api.post(`/tournaments/${t._id}/start`);
      toast.success('Tournament started!');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start');
    }
  };

  const handleAdvance = async (t) => {
    if (!window.confirm(`Advance "${t.name}" to knockout stage?`)) return;
    try {
      await api.post(`/tournaments/${t._id}/advance-knockout`);
      toast.success('Knockout bracket generated!');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to advance');
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Are you sure you want to delete "${t.name}"? This will remove all associated matches and groups.`)) return;
    try {
      await api.delete(`/tournaments/${t._id}`);
      toast.success('Tournament deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner text="Loading tournaments..." />;

  const statusOrder = { group_stage: 0, knockout: 1, upcoming: 2, completed: 3 };
  const sorted = [...tournaments].sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <Trophy size={32} style={{ color: 'var(--accent-gold)' }} />
            Active Tournaments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Compete in the most prestigious eFootball events</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary glow-gold" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Create Tournament
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏆</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', marginBottom: 8 }}>No Tournaments Available</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Check back later or contact an administrator to organize a new tournament.
          </p>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={18} /> Create First Tournament</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {sorted.map((t, idx) => {
            const isRegOpen = t.status === 'upcoming' && new Date(t.registrationEndDate) > new Date();
            return (
              <div key={t._id} className={`glass-card animate-fadeIn ${(t.status === 'group_stage' || t.status === 'knockout') ? 'glow-cyan' : ''}`}
                style={{ 
                  padding: 0, 
                  animationDelay: `${idx * 0.05}s`, 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isRegOpen ? '1px solid var(--accent-cyan)' : '1px solid var(--border)'
                }}>
                
                {/* Header Image/Background */}
                <div style={{ 
                  height: 80, 
                  background: t.format === 'ucl' ? 'linear-gradient(135deg, #0a1f44 0%, #080c18 100%)' : 'linear-gradient(135deg, #1a1a1a 0%, #080c18 100%)',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <StatusBadge status={t.status} type="tournament" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    {user?.role === 'admin' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(t); }}
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', 
                          color: '#ef4444', padding: 6, borderRadius: 8, cursor: 'pointer' 
                        }}
                        title="Delete Tournament"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <div style={{ fontSize: '1.5rem' }}>{t.format === 'ucl' ? '⭐' : '🏆'}</div>
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ 
                    fontFamily: "'Barlow Condensed', sans-serif", 
                    fontSize: '1.4rem', 
                    fontWeight: 700, 
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)'
                  }}>{t.name}</h3>
                  
                  <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                    <span className="badge badge-gray">{t.format === 'ucl' ? 'UCL' : 'ROUND ROBIN'}</span>
                    <span className="badge badge-gray">{t.teamSize}v{t.teamSize}</span>
                  </div>

                  {/* Deadline Alert for Upcoming */}
                  {t.status === 'upcoming' && (
                    <div style={{ 
                      background: isRegOpen ? 'rgba(0, 240, 255, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                      padding: '12px',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 20,
                      border: isRegOpen ? '1px solid rgba(0, 240, 255, 0.1)' : '1px solid rgba(239, 68, 68, 0.1)'
                    }}>
                      <Clock size={16} style={{ color: isRegOpen ? 'var(--accent-cyan)' : 'var(--accent-red)' }} />
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>REGISTRATION DEADLINE</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isRegOpen ? 'var(--accent-cyan)' : 'var(--accent-red)' }}>
                          {isRegOpen ? formatDateTime(t.registrationEndDate) : 'CLOSED'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 16, 
                    marginBottom: 24,
                    padding: '16px 0',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>START DATE</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatDate(t.startDate)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>TEAMS</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.teams?.length || 0} Registered</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', height: 40 }}
                      onClick={() => navigate(`/tournaments/${t._id}`)}>
                      Details <ChevronRight size={16} />
                    </button>
                    {user?.role === 'admin' && t.status === 'upcoming' && (
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', height: 40 }}
                        onClick={() => handleStart(t)}>
                        <Play size={16} /> Start Now
                      </button>
                    )}
                    {user?.role === 'admin' && t.status === 'group_stage' && (
                      <button className="btn btn-primary glow-gold" style={{ flex: 1, justifyContent: 'center', height: 40 }}
                        onClick={() => handleAdvance(t)}>
                        Finals KO →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateTournamentModal onClose={() => setShowCreate(false)} onCreated={fetch} />}
    </div>
  );
}

