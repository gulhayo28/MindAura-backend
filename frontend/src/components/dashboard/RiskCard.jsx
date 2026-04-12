const RISK_CONFIG = {
  low:      { color: '#10B981', bg: '#DCFCE7', textColor: '#166534', label: 'Yaxshi holat' },
  medium:   { color: '#F59E0B', bg: '#FEF3C7', textColor: '#92400E', label: "E'tibor bering" },
  high:     { color: '#EF4444', bg: '#FEE2E2', textColor: '#991B1B', label: 'Yordam kerak' },
  critical: { color: '#7F1D1D', bg: '#7F1D1D', textColor: '#ffffff', label: 'Darhol yordam' },
}

function CircularProgress({ percentage, color }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (percentage / 100) * circ
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ overflow: 'visible' }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

export default function RiskCard({ risk, daysSinceLastTest }) {
  if (!risk) {
    return (
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '12px', padding: '16px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '140px', gap: '8px',
      }}>
        <span style={{ fontSize: '32px' }}>📋</span>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          Hali test yechilmagan
        </p>
        <a href="/tests" style={{ fontSize: '12px', color: '#534AB7' }}>Testni boshlash →</a>
      </div>
    )
  }

  const cfg = RISK_CONFIG[risk.level] || RISK_CONFIG.medium

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: '12px', padding: '16px',
    }}>
      {daysSinceLastTest !== null && daysSinceLastTest >= 7 && (
        <div style={{
          background: '#FEF3C7', border: '0.5px solid #FDE68A',
          borderRadius: '8px', padding: '6px 10px',
          fontSize: '11px', color: '#92400E', marginBottom: '10px',
        }}>
          ⏰ {daysSinceLastTest} kun test yechmagansiz
        </div>
      )}
      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '10px' }}>
        Umumiy holat
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <CircularProgress percentage={risk.percentage} color={cfg.color} />
          <span style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 500, color: cfg.color,
          }}>
            {risk.percentage}%
          </span>
        </div>
        <div>
          <span style={{
            background: cfg.bg, color: cfg.textColor,
            padding: '3px 8px', borderRadius: '10px',
            fontSize: '11px', fontWeight: 500, display: 'inline-block', marginBottom: '6px',
          }}>
            {cfg.label}
          </span>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            Oxirgi test: {new Date(risk.last_test_date).toLocaleDateString('uz-UZ', {
              day: 'numeric', month: 'short',
            })}
          </p>
          <a href="/tests" style={{ fontSize: '11px', color: '#534AB7', display: 'inline-block', marginTop: '2px' }}>
            Yangi test →
          </a>
        </div>
      </div>
    </div>
  )
}
