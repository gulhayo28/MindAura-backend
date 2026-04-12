export default function PsychologistBlock({ psychologist, nextSession }) {
  const initials = psychologist.full_name
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: '12px', padding: '16px',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '12px' }}>
        Psixologingiz
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        {psychologist.avatar_url ? (
          <img src={psychologist.avatar_url} alt={psychologist.full_name}
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: '#EEEDFE', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '14px', fontWeight: 500,
            color: '#534AB7', flexShrink: 0,
          }}>
            {initials}
          </div>
        )}
        <div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {psychologist.full_name}
          </p>
          {psychologist.specialization && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {psychologist.specialization}
            </p>
          )}
        </div>
      </div>

      {nextSession ? (
        <div style={{
          background: 'var(--color-background-secondary)',
          borderRadius: '8px', padding: '10px', marginBottom: '12px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>📅</span>
          <div>
            <p style={{ fontSize: '11px', color: '#534AB7', fontWeight: 500 }}>Keyingi seans</p>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {new Date(nextSession.scheduled_at).toLocaleDateString('uz-UZ', {
                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
              })}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {nextSession.duration_minutes} daqiqa
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-background-secondary)',
          borderRadius: '8px', padding: '10px', marginBottom: '12px',
          fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center',
        }}>
          Rejalashtirilgan seans yo'q
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <a href="/messages" style={{
          display: 'block', padding: '9px', borderRadius: '8px',
          background: '#534AB7', color: 'white', border: 'none',
          fontSize: '13px', fontWeight: 500, textAlign: 'center', textDecoration: 'none',
        }}>
          💬 Xabar
        </a>
        <a href="/sessions/request" style={{
          display: 'block', padding: '9px', borderRadius: '8px',
          background: 'none', border: '0.5px solid #534AB7',
          color: '#534AB7', fontSize: '13px', fontWeight: 500,
          textAlign: 'center', textDecoration: 'none',
        }}>
          📅 Seans
        </a>
      </div>
    </div>
  )
}
