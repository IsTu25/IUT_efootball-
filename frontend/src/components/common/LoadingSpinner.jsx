export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-primary)', flexDirection: 'column', gap: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>⚽</span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
          IUT eFootball
        </span>
      </div>
      <div className="spinner" />
    </div>
  );
}
