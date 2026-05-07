import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import { PositionBadge } from '../../components/common/Badges';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, winRateColor } from '../../utils/constants';
import { ArrowLeft, Swords, Gamepad2, Smartphone, User, Settings } from 'lucide-react';

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/players/${id}`).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading player..." />;
  if (!data) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Player not found</div>;

  const { player, stats, recentMatches } = data;
  const wr = parseFloat(stats.winRate || 0);
  const isOwnProfile = me?._id === player._id;

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '8px 14px' }}>
          <ArrowLeft size={16} /> Back
        </button>
        {isOwnProfile && (
          <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            onClick={() => navigate('/my-profile')}>
            <Settings size={15} /> Edit My Profile
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="glass-card glow-green" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <Avatar user={player} size={100} />
            {player.profileCompleted && (
              <div title="Profile Complete" style={{
                position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: '50%',
                background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-card)', fontSize: 12
              }}>✓</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name & Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800 }}>{player.name}</h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{player.playerId}</span>
              <PositionBadge position={player.position} />
              <span style={{
                padding: '2px 10px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700,
                background: player.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(0,208,132,0.1)',
                color: player.role === 'admin' ? '#f59e0b' : 'var(--accent-green)',
                border: `1px solid ${player.role === 'admin' ? 'rgba(245,158,11,0.3)' : 'rgba(0,208,132,0.2)'}`,
                textTransform: 'uppercase'
              }}>{player.role}</span>
            </div>

            {/* Bio */}
            {player.bio && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 10, fontStyle: 'italic' }}>
                "{player.bio}"
              </p>
            )}

            {/* eFootball ID & Device row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {player.efootballId ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem',
                  background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.3)'
                }}>
                  <Gamepad2 size={14} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>eFootball ID:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.03em' }}>
                    {player.efootballId}
                  </span>
                </div>
              ) : isOwnProfile ? (
                <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--accent-gold)', borderColor: 'rgba(245,158,11,0.3)' }}
                  onClick={() => navigate('/my-profile')}>
                  <Gamepad2 size={13} /> Add eFootball ID
                </button>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Gamepad2 size={13} /> <em>eFootball ID not set</em>
                </div>
              )}

              {player.deviceName ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)'
                }}>
                  <Smartphone size={14} style={{ color: '#3b82f6' }} />
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{player.deviceName}</span>
                </div>
              ) : null}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 10 }}>
              Member since {formatDate(player.joinDate)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Stats */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Career Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Matches Played', value: stats.played, color: '#3b82f6' },
              { label: 'Wins', value: stats.won, color: '#00d084' },
              { label: 'Draws', value: stats.drawn, color: '#f59e0b' },
              { label: 'Losses', value: stats.lost, color: '#ef4444' },
              { label: 'Goals For', value: stats.goalsFor, color: '#00d084' },
              { label: 'Goals Against', value: stats.goalsAgainst, color: '#ef4444' },
              { label: 'Goal Diff', value: stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference, color: stats.goalDifference >= 0 ? '#00d084' : '#ef4444' },
              { label: 'Win Rate', value: `${wr}%`, color: winRateColor(wr) },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem', fontWeight: 800, color }}>{value ?? 0}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Win Rate</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: winRateColor(wr) }}>{wr}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${wr}%` }} />
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Swords size={16} style={{ color: 'var(--accent-green)' }} />
            Recent Matches
          </h2>
          {recentMatches.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '0.875rem' }}>
              No matches played yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
              {recentMatches.map(match => {
                const isA = match.playerA?._id === id || match.playerA === id;
                const myScore = isA ? match.scoreA : match.scoreB;
                const oppScore = isA ? match.scoreB : match.scoreA;
                const opp = isA ? match.playerB : match.playerA;
                const result = myScore > oppScore ? 'W' : myScore < oppScore ? 'L' : 'D';
                const resultColor = { W: '#00d084', L: '#ef4444', D: '#f59e0b' }[result];

                return (
                  <div key={match._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)'
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.75rem',
                      background: `${resultColor}22`, color: resultColor
                    }}>{result}</div>
                    <Avatar user={opp} size={26} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>vs {opp?.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{match.tournament?.name}</div>
                    </div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                      <span style={{ color: resultColor }}>{myScore}</span>
                      <span style={{ color: 'var(--text-muted)' }}> — </span>
                      <span>{oppScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
