import Avatar from '../../components/common/Avatar';
import { PointsBadge } from '../../components/common/Badges';

export default function GroupTable({ group }) {
  const sorted = [...(group.standings || [])].sort((a, b) =>
    b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
  );

  return (
    <div className="glass-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem',
          background: 'rgba(0,208,132,0.15)', color: 'var(--accent-green)'
        }}>
          {group.name.split(' ')[1]}
        </div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{group.name}</div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {group.teams?.length} teams
        </span>
      </div>

      <div className="table-wrapper">
        <table className="table" style={{ fontSize: '0.78rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 10px' }}>#</th>
              <th style={{ padding: '8px 10px' }}>Team</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>P</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>W</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>D</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>L</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>GF</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>GA</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>GD</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, idx) => {
              const isAdvancing = idx < 2; // Top 2 advance (simplified)
              return (
                <tr key={s.team?._id || idx} style={{
                  background: isAdvancing ? 'rgba(0,208,132,0.04)' : 'transparent'
                }}>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700,
                      background: idx === 0 ? 'rgba(245,158,11,0.2)' : idx === 1 ? 'rgba(100,116,139,0.2)' : 'transparent',
                      color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : 'var(--text-muted)',
                    }}>{idx + 1}</span>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar user={s.team?.captain} size={24} />
                      <span style={{ fontWeight: 600 }}>{s.team?.name || 'Unknown'}</span>
                      {isAdvancing && <span style={{ fontSize: '0.6rem', color: 'var(--accent-green)', fontWeight: 700 }}>↑ADV</span>}
                    </div>
                  </td>
                  {[s.played, s.won, s.drawn, s.lost, s.goalsFor, s.goalsAgainst].map((v, i) => (
                    <td key={i} style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
                      {v ?? 0}
                    </td>
                  ))}
                  <td style={{
                    padding: '8px 10px', textAlign: 'center',
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                    color: s.goalDifference > 0 ? '#00d084' : s.goalDifference < 0 ? '#ef4444' : 'var(--text-secondary)'
                  }}>
                    {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <PointsBadge points={s.points ?? 0} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No matches completed yet
          </div>
        )}
      </div>
    </div>
  );
}
