import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import { StatusBadge } from '../../components/common/Badges';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime, STAGES } from '../../utils/constants';
import {
  Trophy, Users, Swords, Clock, TrendingUp, CheckCircle,
  AlertCircle, Calendar, Star, ArrowRight
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color = 'var(--accent-cyan)', sub }) {
  return (
    <div className="stat-card animate-fadeIn">
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const { activeTournament, recentMatches = [], upcomingMatches = [], stats = {} } = data || {};

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
          Here's what's happening in the club today
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users} label="Active Players" value={stats.totalPlayers || 0} color="var(--accent-gold)" />
        <StatCard icon={Trophy} label="Total Tournaments" value={stats.totalTournaments || 0} color="var(--accent-cyan)" />
        <StatCard icon={AlertCircle} label="Pending Approvals" value={stats.pendingMatches || 0} color="var(--accent-red)"
          sub={stats.pendingMatches > 0 ? 'Needs review' : 'All clear'} />
        <StatCard icon={CheckCircle} label="Completed Matches" value={recentMatches.length} color="var(--accent-cyan)" />
      </div>

      {/* Active Tournament Banner */}
      {activeTournament && (
        <div className="glass-card glow-blue animate-fadeIn" style={{ padding: 20, marginBottom: 24, cursor: 'pointer' }}
          onClick={() => navigate(`/tournaments/${activeTournament._id}`)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 24,
                background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(0,240,255,0.2))',
                border: '1px solid rgba(255,215,0,0.3)'
              }}>🏆</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Tournament</span>
                  <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>LIVE</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.025em' }}>
                  {activeTournament.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activeTournament.teams?.length || 0} teams · {activeTournament.status?.replace('_', ' ')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.875rem' }}>
              View Tournament <ArrowRight size={16} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Recent Results */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Swords size={18} style={{ color: 'var(--accent-cyan)' }} /> Recent Results
            </h2>
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => navigate('/matches')}>
              View all
            </button>
          </div>

          {recentMatches.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
              No completed matches yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentMatches.slice(0, 6).map(match => (
                <div key={match._id} className="animate-fadeIn" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)'
                }}>
                  <Avatar user={match.teamA?.captain} size={28} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {match.teamA?.name || match.teamA?.captain?.name?.split(' ')[0] || '?'}
                  </span>
                  <div className="score-display" style={{ fontSize: '1rem' }}>
                    <span style={{ color: match.scoreA > match.scoreB ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>{match.scoreA}</span>
                    <span className="score-vs">—</span>
                    <span style={{ color: match.scoreB > match.scoreA ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>{match.scoreB}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1, textAlign: 'right', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {match.teamB?.name || match.teamB?.captain?.name?.split(' ')[0] || '?'}
                  </span>
                  <Avatar user={match.teamB?.captain} size={28} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} style={{ color: 'var(--accent-gold)' }} /> Upcoming Matches
            </h2>
          </div>

          {upcomingMatches.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
              No scheduled matches
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingMatches.map(match => (
                <div key={match._id} style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: 6 }}>
                    {match.tournament?.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar user={match.teamA?.captain} size={26} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1 }}>{match.teamA?.name || '?'}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>VS</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1, textAlign: 'right' }}>{match.teamB?.name || '?'}</span>
                    <Avatar user={match.teamB?.captain} size={26} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
