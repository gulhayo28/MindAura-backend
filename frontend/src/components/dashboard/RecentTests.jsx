const RISK_BADGE = {
  low:      { label: 'Past',    bg: '#DCFCE7', color: '#166534' },
  medium:   { label: "O'rta",  bg: '#FEF3C7', color: '#92400E' },
  high:     { label: 'Yuqori', bg: '#FEE2E2', color: '#991B1B' },
  critical: { label: 'Kritik', bg: '#7F1D1D', color: '#ffffff' },
}

const RISK_BAR_COLOR = {
  low: '#10B981', medium: '#F59E0B', high: '#EF4444', critical: '#7F1D1D',
}

export default function RecentTests({ results }) {
  if (!results || results.length === 0) {
    return (
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '12px', padding: '16px',
      }}>
        <p style={{ fontWeight: 500, marginBottom: '12px', color: 'var(--color-text-primary)' }}>So'nggi testlar</p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '16px 0' }}>
          Hali test yechilmagan
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: '12px', padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>So'nggi testlar</p>
        <a href="/tests/history" style={{ fontSize: '12px', color: '#534AB7', textDecoration: 'none' }}>Barchasi →</a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {results.map(r => {
          const badge = RISK_BADGE[r.risk_level] || RISK_BADGE.medium
          const barColor = RISK_BAR_COLOR[r.risk_level] || '#F59E0B'
          const date = new Date(r.created_at).toLocaleDateString('uz-UZ', {
            day: 'numeric', month: 'short',
          })
          return (
            <div key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {r.test_title}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{
                    background: badge.bg, color: badge.color,
                    padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 500,
                  }}>
                    {badge.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{date}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '6px', background: 'var(--color-background-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${r.percentage}%`, height: '100%', background: barColor, borderRadius: '3px' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', width: '32px', textAlign: 'right' }}>
                  {r.percentage}%
                </span>
              </div>
              <a href={`/tests/results/${r.id}`} style={{ fontSize: '11px', color: '#534AB7', textDecoration: 'none', display: 'inline-block', marginTop: '2px' }}>
                Batafsil →
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
