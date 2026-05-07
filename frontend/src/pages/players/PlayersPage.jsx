import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Avatar from '../../components/common/Avatar';
import { PositionBadge } from '../../components/common/Badges';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, winRateColor } from '../../utils/constants';
import { Search, Trophy, Target, TrendingUp, Gamepad2, Smartphone } from 'lucide-react';

export default function PlayersPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api.get('/players'), api.get('/players/leaderboard')])
      .then(([pRes, lRes]) => {
        setPlayers(pRes.data);
        setLeaderboard(lRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading players..." />;

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.position?.toLowerCase().includes(search.toLowerCase())
  );

  // Map leaderboard stats to player id
  const statsMap = {};
  leaderboard.forEach(l => { statsMap[l.player._id] = l; });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Players</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{players.length} registered members</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {/* Player Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((player, idx) => {
          const stats = statsMap[player._id] || {};
          const wr = parseFloat(stats.winRate || 0);
          return (
            <div
              key={player._id}
              className="glass-card animate-fadeIn"
              style={{ padding: 20, cursor: 'pointer', animationDelay: `${idx * 0.04}s` }}
              onClick={() => navigate(`/players/${player._id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar user={player} size={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {player.name}
                    </div>
                    {player.profileCompleted && (
                      <div title="Profile complete" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <PositionBadge position={player.position} />
                    {player.deviceName && (
                      <span style={{ fontSize: '0.65rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(59,130,246,0.1)', padding: '1px 6px', borderRadius: 999 }}>
                        <Smartphone size={10} /> {player.deviceName}
                      </span>
                    )}
                  </div>
                  {player.efootballId && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-green)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Gamepad2 size={11} /> {player.efootballId}
                    </div>
                  )}
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { icon: Trophy, label: 'Played', value: stats.played || 0, color: '#3b82f6' },
                  { icon: Target, label: 'Goals', value: stats.goalsFor || 0, color: '#f59e0b' },
                  { icon: TrendingUp, label: 'Win %', value: `${wr}%`, color: winRateColor(wr) },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{
                    padding: '8px 10px', background: 'var(--bg-secondary)',
                    borderRadius: 10, textAlign: 'center', border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Win rate bar */}
              <div style={{ marginTop: 12 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${wr}%`, background: `linear-gradient(90deg, ${winRateColor(wr)}, ${winRateColor(wr)}aa)` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          No players found matching "{search}"
        </div>
      )}
    </div>
  );
}
