import { useEffect, useState } from 'react'
import WelcomeBlock from '../components/dashboard/WelcomeBlock'
import RiskCard from '../components/dashboard/RiskCard'
import MetricGrid from '../components/dashboard/MetricGrid'
import RecentTests from '../components/dashboard/RecentTests'
import PsychologistBlock from '../components/dashboard/PsychologistBlock'

const API_BASE = process.env.REACT_APP_API_URL || 'https://mindaura-backend-4.onrender.com'

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[180, 140, 200].map((h, i) => (
        <div key={i} style={{
          height: `${h}px`, borderRadius: '12px',
          background: 'var(--color-background-secondary)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = () => {
    const token = localStorage.getItem('access_token')
    fetch(`${API_BASE}/api/user/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => {
    fetchDashboard()
    // 30 soniyada yangilash
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>
      <Skeleton />
    </div>
  )

  if (error) return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>
      <div style={{
        background: '#FEE2E2', border: '0.5px solid #FECACA',
        borderRadius: '12px', padding: '20px', textAlign: 'center',
      }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</p>
        <p style={{ fontWeight: 500, color: '#991B1B', marginBottom: '4px' }}>
          Ma'lumotlarni yuklashda xato
        </p>
        <p style={{ fontSize: '12px', color: '#B91C1C', marginBottom: '12px' }}>{error}</p>
        <button onClick={() => { setLoading(true); setError(''); fetchDashboard() }}
          style={{
            background: '#EF4444', color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
          }}>
          Qayta urinish
        </button>
      </div>
    </div>
  )

  if (!data) return null

  const { user, latest_risk, recent_results, next_session, days_since_last_test } = data

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      <WelcomeBlock user={user} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <RiskCard risk={latest_risk} daysSinceLastTest={days_since_last_test} />
        <MetricGrid
          streak={user.streak}
          balls={user.balls}
          level={user.level}
          testCount={recent_results.length}
        />
      </div>

      <RecentTests results={recent_results} />

      <a href="/chat" style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'var(--color-background-secondary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '12px', padding: '14px', textDecoration: 'none',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: '#534AB7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '18px', flexShrink: 0,
        }}>🤖</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            MindBot bilan suhbat
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            AI yordamchi har doim tayyor
          </p>
        </div>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>›</span>
      </a>

      {user.assigned_psychologist && (
        <PsychologistBlock
          psychologist={user.assigned_psychologist}
          nextSession={next_session}
        />
      )}

    </div>
  )
}
