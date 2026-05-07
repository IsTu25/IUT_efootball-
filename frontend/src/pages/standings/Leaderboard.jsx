import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Avatar from '../../components/common/Avatar';
import { PositionBadge } from '../../components/common/Badges';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { winRateColor } from '../../utils/constants';
import { BarChart3, Trophy, Target, TrendingUp, Medal } from 'lucide-react';

function RankBadge({ rank }) {
  if (rank === 1) return <span style={{ fontSize: '1.2rem' }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: '1.2rem' }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: '1.2rem' }}>🥉</span>;
  return <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, color: 'var(--text-muted)', fontSize: '1rem' }}>#{rank}</span>;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/players/leaderboard').then(res => setLeaderboard(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading leaderboard..." />;

  // Top 3 players
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart3 size={26} style={{ color: 'var(--accent-gold)' }} />
            Club Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ranked by win rate · All time</p>
        </div>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, podiumIdx) => {
            const actualRank = [2, 1, 3][podiumIdx];
            const heights = { 1: 140, 2: 110, 3: 90 };
            const colors = { 1: '#f59e0b', 2: '#94a3b8', 3: '#cd7f32' };
            return (
              <div
                key={entry.player._id}
                onClick={() => navigate(`/players/${entry.player._id}`)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  cursor: 'pointer', minWidth: 120
                }}>
                <Avatar user={entry.player} size={actualRank === 1 ? 70 : 54} />
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginTop: 8, textAlign: 'center' }}>
                  {entry.player.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {entry.winRate}% win rate
                </div>
                <div style={{
                  width: '100%', height: heights[actualRank],
                  background: `linear-gradient(180deg, ${colors[actualRank]}33, ${colors[actualRank]}11)`,
                  border: `1px solid ${colors[actualRank]}55`,
                  borderRadius: '8px 8px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem'
                }}>
                  {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="glass-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.95rem' }}>
          Full Rankings
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Pos</th>
                <th style={{ textAlign: 'center' }}>Played</th>
                <th style={{ textAlign: 'center' }}>W</th>
                <th style={{ textAlign: 'center' }}>D</th>
                <th style={{ textAlign: 'center' }}>L</th>
                <th style={{ textAlign: 'center' }}>Goals</th>
                <th style={{ textAlign: 'center' }}>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const wr = parseFloat(entry.winRate);
                return (
                  <tr key={entry.player._id} style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/players/${entry.player._id}`)}>
                    <td style={{ width: 48, textAlign: 'center' }}>
                      <RankBadge rank={idx + 1} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar user={entry.player} size={34} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{entry.player.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><PositionBadge position={entry.player.position} /></td>
                    <td style={{ textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>{entry.played}</td>
                    <td style={{ textAlign: 'center', color: '#00d084', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>{entry.won}</td>
                    <td style={{ textAlign: 'center', color: '#f59e0b', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>{entry.drawn}</td>
                    <td style={{ textAlign: 'center', color: '#ef4444', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>{entry.lost}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>{entry.goalsFor}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, maxWidth: 100 }} className="progress-bar">
                          <div className="progress-fill" style={{
                            width: `${wr}%`,
                            background: `linear-gradient(90deg, ${winRateColor(wr)}, ${winRateColor(wr)}aa)`
                          }} />
                        </div>
                        <span style={{ color: winRateColor(wr), fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Rajdhani, sans-serif', minWidth: 48 }}>
                          {wr}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {leaderboard.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No player stats yet. Complete some matches to populate the leaderboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
