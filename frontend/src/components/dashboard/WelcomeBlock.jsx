export default function WelcomeBlock({ user }) {
  const today = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const initials = user.full_name
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{
      background: 'linear-gradient(135deg,#534AB7,#3C3489)',
      borderRadius: '12px', padding: '18px', color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', opacity: .7, marginBottom: '4px' }}>{today}</p>
          <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '10px' }}>
            Salom, {user.full_name.split(' ')[0]}! 👋
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {user.streak > 0 && (
              <span style={{ background: 'rgba(255,255,255,.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                🔥 {user.streak} kunlik streak
              </span>
            )}
            <span style={{ background: 'rgba(255,255,255,.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
              ⭐ {user.balls} ball
            </span>
            <span style={{ background: 'rgba(255,255,255,.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
              🏆 {user.level}-daraja
            </span>
          </div>
          {user.assigned_psychologist && (
            <div style={{ marginTop: '10px' }}>
              <span style={{
                background: 'rgba(255,255,255,.15)',
                border: '0.5px solid rgba(255,255,255,.3)',
                padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
              }}>
                {user.assigned_psychologist.full_name}
              </span>
            </div>
          )}
        </div>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name}
            style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'rgba(255,255,255,.25)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 500, flexShrink: 0,
          }}>
            {initials}
          </div>
        )}
      </div>
    </div>
  )
}
