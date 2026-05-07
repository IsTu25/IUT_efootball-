// Position colors for UI
export const POSITIONS = ['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST','CF'];

export const positionColors = {
  GK: 'bg-yellow-500/20 text-yellow-400',
  CB: 'bg-blue-500/20 text-blue-400',
  LB: 'bg-blue-500/20 text-blue-400',
  RB: 'bg-blue-500/20 text-blue-400',
  CDM: 'bg-purple-500/20 text-purple-400',
  CM: 'bg-purple-500/20 text-purple-400',
  CAM: 'bg-amber-500/20 text-amber-400',
  LW: 'bg-teal-500/20 text-teal-400',
  RW: 'bg-teal-500/20 text-teal-400',
  ST: 'bg-red-500/20 text-red-400',
  CF: 'bg-red-500/20 text-red-400',
};

export const TOURNAMENT_STATUS = {
  upcoming: { label: 'Upcoming', class: 'badge-blue' },
  group_stage: { label: 'Group Stage', class: 'badge-green' },
  knockout: { label: 'Knockout', class: 'badge-gold' },
  completed: { label: 'Completed', class: 'badge-gray' },
};

export const MATCH_STATUS = {
  scheduled: { label: 'Scheduled', class: 'badge-blue' },
  pending_approval: { label: 'Pending', class: 'badge-gold' },
  completed: { label: 'Completed', class: 'badge-green' },
  cancelled: { label: 'Cancelled', class: 'badge-red' },
};

export const STAGES = {
  group: 'Group Stage',
  round_of_16: 'Round of 16',
  quarter_final: 'Quarter Final',
  semi_final: 'Semi Final',
  final: 'Final',
};

// Generate initials avatar
export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

// Format date
export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric'
}) : '—';

export const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
}) : '—';

// Win rate color
export const winRateColor = (rate) => {
  if (rate >= 70) return '#00d084';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
};
