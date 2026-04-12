function MetricCard({ icon, label, value, sub }) {
  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderRadius: '8px', padding: '10px', textAlign: 'center',
    }}>
      <p style={{ fontSize: '16px', marginBottom: '2px' }}>{icon}</p>
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</p>
      <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{label}</p>
      {sub && <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{sub}</p>}
    </div>
  )
}

export default function MetricGrid({ streak, balls, level, testCount }) {
  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: '12px', padding: '16px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <MetricCard icon="🔥" label="Streak" value={`${streak} kun`} />
        <MetricCard icon="⭐" label="Ball" value={balls} />
        <MetricCard icon="🏆" label="Daraja" value={`${level}-daraja`} />
        <MetricCard icon="📋" label="Testlar" value={testCount} sub="bu oy" />
      </div>
    </div>
  )
}
