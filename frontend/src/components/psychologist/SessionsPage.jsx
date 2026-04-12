import { useState } from 'react'
import { useSessions, updateSession, cancelSession } from '../../hooks/Usepsychologist'

const STATUS_STYLE = {
  scheduled:  'bg-blue-100 text-blue-700',
  completed:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-gray-100 text-gray-400',
}
const STATUS_LABEL = {
  scheduled: 'Rejalashtirilgan',
  completed: 'Tugallangan',
  cancelled:  'Bekor qilingan',
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── Weekly Calendar ───────────────────────────────────────────────────────────
function WeeklyCalendar({ sessions, onSelect }) {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  const dayNames = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {days.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString()
          const daySessions = sessions.filter(s => {
            const sd = new Date(s.scheduled_at)
            return sd.toDateString() === d.toDateString()
          })
          return (
            <div
              key={i}
              className={`p-3 border-r border-gray-100 last:border-r-0 min-h-[120px] ${isToday ? 'bg-violet-50' : ''}`}
            >
              <div className="text-center mb-2">
                <p className="text-xs text-gray-400">{dayNames[i]}</p>
                <p className={`text-sm font-semibold ${isToday ? 'text-violet-600' : 'text-gray-700'}`}>
                  {d.getDate()}
                </p>
              </div>
              <div className="space-y-1">
                {daySessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s)}
                    className="w-full text-left px-2 py-1 rounded-lg bg-violet-100 text-violet-700 text-xs hover:bg-violet-200 transition-colors truncate"
                  >
                    {new Date(s.scheduled_at).toLocaleTimeString('uz-UZ', {
                      hour: '2-digit', minute: '2-digit',
                    })}{' '}
                    {s.client_name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Session Modal ─────────────────────────────────────────────────────────────
function SessionModal({ session, onClose, onSave }) {
  const [notes, setNotes] = useState(session?.private_notes || '')
  const [summary, setSummary] = useState(session?.summary || '')
  const [nextSteps, setNextSteps] = useState(session?.next_steps || '')
  const [status, setStatus] = useState(session?.status || 'scheduled')
  const [saving, setSaving] = useState(false)

  if (!session) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSession(session.id, {
        private_notes: notes, summary, next_steps: nextSteps, status,
      })
      onSave()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Seansni bekor qilasizmi?')) return
    await cancelSession(session.id)
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800">{session.client_name}</h3>
            <p className="text-sm text-gray-400">
              {new Date(session.scheduled_at).toLocaleDateString('uz-UZ', {
                weekday: 'long', day: 'numeric', month: 'long',
                hour: '2-digit', minute: '2-digit',
              })}{' '}· {session.duration_minutes} daqiqa
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Holat</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="scheduled">Rejalashtirilgan</option>
              <option value="completed">Tugallangan</option>
              <option value="cancelled">Bekor qilingan</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Shaxsiy qaydlar</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Faqat siz ko'rasiz..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Xulosa</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={2}
              placeholder="Seans natijasi..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Keyingi qadamlar</label>
            <textarea
              value={nextSteps}
              onChange={e => setNextSteps(e.target.value)}
              rows={2}
              placeholder="Mijozga topshiriqlar..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
        </div>

        <div className="flex gap-2 p-5 pt-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          {session.status === 'scheduled' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition-colors"
            >
              Bekor qilish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sessions Page ─────────────────────────────────────────────────────────────
export default function SessionsPage() {
  const { sessions, isLoading, mutate } = useSessions()
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('calendar')

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Seanslar</h1>
        <button
          onClick={() => setView(v => v === 'calendar' ? 'list' : 'calendar')}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          {view === 'calendar' ? "📋 Ro'yxat" : '📅 Kalendar'}
        </button>
      </div>

      {view === 'calendar' ? (
        <WeeklyCalendar sessions={sessions} onSelect={setSelected} />
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelected(s)}
            >
              <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold flex-shrink-0">
                {getInitials(s.client_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{s.client_name}</p>
                <p className="text-sm text-gray-400">
                  {new Date(s.scheduled_at).toLocaleDateString('uz-UZ', {
                    weekday: 'short', day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}{' '}· {s.duration_minutes} daqiqa
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[s.status] || ''}`}>
                {STATUS_LABEL[s.status] || s.status}
              </span>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-12 text-gray-400">Seanslar mavjud emas</div>
          )}
        </div>
      )}

      {selected && (
        <SessionModal
          session={selected}
          onClose={() => setSelected(null)}
          onSave={() => mutate()}
        />
      )}
    </div>
  )
}
