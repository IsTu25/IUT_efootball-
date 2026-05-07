import { MATCH_STATUS, TOURNAMENT_STATUS } from '../../utils/constants';

export function StatusBadge({ status, type = 'match' }) {
  const map = type === 'tournament' ? TOURNAMENT_STATUS : MATCH_STATUS;
  const info = map[status] || { label: status, class: 'badge-gray' };
  return <span className={`badge ${info.class}`}>{info.label}</span>;
}

export function PositionBadge({ position }) {
  return <span className={`pos-badge pos-${position}`}>{position}</span>;
}

export function PointsBadge({ points }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: '50%',
      background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)',
      fontWeight: 700, fontSize: '0.875rem', border: '1px solid rgba(0, 240, 255, 0.3)',
      fontFamily: "'Barlow Condensed', sans-serif"
    }}>
      {points}
    </span>
  );
}
