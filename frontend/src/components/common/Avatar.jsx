import { getInitials } from '../../utils/constants';

export default function Avatar({ user, size = 36, className = '' }) {
  const initials = getInitials(user?.name);
  const colors = ['#00d084', '#3b82f6', '#f59e0b', '#a855f7', '#14b8a6', '#ef4444'];
  const colorIndex = (user?.name?.charCodeAt(0) || 0) % colors.length;
  const bgColor = `${colors[colorIndex]}22`;
  const textColor = colors[colorIndex];

  if (user?.photo) {
    return (
      <img
        src={user.photo}
        alt={user.name}
        className={className}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: bgColor, color: textColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
