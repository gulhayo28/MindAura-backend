import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useClient, generateAIAnalysis } from '../../hooks/Usepsychologist'

const RISK_COLOR = {
  low: '#10B981', medium: '#F59E0B', high: '#EF4444', critical: '#7F1D1D',
}
const RISK_LABEL = {
  low: 'Past', medium: "O'rta", high: 'Yuqori', critical: 'Kritik',
}
const CATEGORY_COLOR = {
  depression: '#EF4444', anxiety: '#F97316', stress: '#F59E0B',
  personality: '#8B5CF6', other: '#6B7280',
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const { client, isLoading } = useClient(id)
  const [tab, setTab] = useState('results')
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const handleGenerateAI = async () => {
    setAiLoading(true)
    setAiError('')
    try {
      const result = await generateAIAnalysis(id)
      setAiResult(result)
    } catch (e) {
      setAiError(e.message || 'Xato yuz berdi')
    } finally {
      setAiLoading(false)
    }
  }

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  )

  if (!client) return (
    <div className="max-w-3xl mx-auto px-4 py-6 text-center text-gray-400">
      Mijoz topilmadi
    </div>
  )

  const chartData = (client.test_history || []).map(r => ({
    date: new Date(r.created_at).toLocaleDateString('uz-UZ', {
      day: 'numeric', month: 'short',
    }),
    percentage: r.percentage,
    category: r.category,
    test: r.test_title,
  }))

  const TABS = [
    { key: 'results',  label: '📊 Natijalar' },
    { key: 'sessions', label: '📅 Seanslar' },
    { key: 'tasks',    label: '✅ Vazifalar' },
    { key: 'ai',       label: '🤖 AI Tahlil' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* Client header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
          {client.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-800">{client.full_name}</h1>
          <p className="text-sm text-gray-400">{client.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">🏆 {client.level}-daraja</span>
            <span className="text-xs text-gray-400">⭐ {client.balls} ball</span>
            <span className="text-xs text-gray-400">🔥 {client.streak} streak</span>
          </div>
        </div>
        {client.risk_level && (
          <div
            className="px-3 py-1.5 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{
              background: (RISK_COLOR[client.risk_level] || '#6B7280') + '22',
              color: RISK_COLOR[client.risk_level] || '#6B7280',
            }}
          >
            {RISK_LABEL[client.risk_level] || client.risk_level} · {client.latest_percentage}%
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              tab === t.key
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Results */}
      {tab === 'results' && (
        <div className="space-y-4">
          {chartData.length >= 2 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Natijalar dinamikasi</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, _, props) => [`${val}%`, props.payload.test]}
                  />
                  <ReferenceLine
                    y={60} stroke="#F59E0B" strokeDasharray="4 4"
                    label={{ value: "O'rta", fontSize: 10 }}
                  />
                  <Line
                    type="monotone" dataKey="percentage"
                    stroke="#7C3AED" strokeWidth={2}
                    dot={{ r: 4, fill: '#7C3AED' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {(() => {
                const first = chartData[0]?.percentage
                const last = chartData[chartData.length - 1]?.percentage
                const diff = last - first
                return (
                  <p className={`text-sm mt-3 font-medium ${diff < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {diff < 0 ? '📈' : '📉'} Oxirgi davrda {Math.abs(diff)}%{' '}
                    {diff < 0 ? 'yaxshilandi' : 'yomonlashdi'}
                  </p>
                )
              })()}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 text-sm">
              Grafik uchun kamida 2 ta natija kerak
            </div>
          )}

          <div className="space-y-2">
            {[...(client.test_history || [])].reverse().map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ background: CATEGORY_COLOR[r.category] || '#6B7280' }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{r.test_title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('uz-UZ', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: RISK_COLOR[r.risk_level] || '#6B7280' }}
                  >
                    {r.percentage}%
                  </p>
                  <p className="text-xs text-gray-400">
                    {RISK_LABEL[r.risk_level] || r.risk_level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Sessions */}
      {tab === 'sessions' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Bu mijoz bilan o'tkazilgan seanslar tarixi</p>
          <a
            href="/psychologist/sessions"
            className="block text-center py-3 border border-violet-200 text-violet-600 rounded-xl text-sm hover:bg-violet-50 transition-colors"
          >
            📅 Barcha seanslarni ko'rish →
          </a>
        </div>
      )}

      {/* Tab: Tasks */}
      {tab === 'tasks' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Bu mijozga berilgan vazifalar</p>
          <a
            href="/psychologist/tasks"
            className="block text-center py-3 border border-violet-200 text-violet-600 rounded-xl text-sm hover:bg-violet-50 transition-colors"
          >
            ✅ Vazifalar kengashini ochish →
          </a>
        </div>
      )}

      {/* Tab: AI Analysis */}
      {tab === 'ai' && (
        <div className="space-y-4">
          <button
            onClick={handleGenerateAI}
            disabled={aiLoading}
            className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <><span className="animate-spin">⏳</span> Tahlil qilinmoqda...</>
            ) : (
              <><span>🤖</span> AI tahlilni yangilash</>
            )}
          </button>

          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {aiError}
            </div>
          )}

          {aiResult && (
            <div className="space-y-4">
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
                <h3 className="font-semibold text-violet-800 mb-2">Umumiy baholash</h3>
                <p className="text-sm text-violet-700">{aiResult.overall_assessment}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-2">Rivojlanish qaydlari</h3>
                <p className="text-sm text-gray-600">{aiResult.progress_note}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-3">Risk tendentsiyasi</h3>
                <p className="text-sm text-gray-600">{aiResult.risk_trend}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <h3 className="font-semibold text-amber-800 mb-3">Tavsiyalar (psixolog uchun)</h3>
                <ul className="space-y-2">
                  {(aiResult.recommendations_for_psychologist || []).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                      <span className="flex-shrink-0 mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!aiResult && !aiLoading && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Tahlil generatsiya qilish uchun yuqoridagi tugmani bosing
            </div>
          )}
        </div>
      )}

    </div>
  )
}
