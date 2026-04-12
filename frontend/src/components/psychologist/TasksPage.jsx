import { useState } from 'react'
import { useTasks, createTask, updateTask, deleteTask, useClients } from '../../hooks/Usepsychologist'

const COLUMNS = [
  { key: 'pending',     label: 'Kutilmoqda',  color: 'bg-gray-50 border-gray-200' },
  { key: 'in_progress', label: 'Jarayonda',   color: 'bg-blue-50 border-blue-200' },
  { key: 'completed',   label: 'Bajarildi',   color: 'bg-emerald-50 border-emerald-200' },
]

const CATEGORY_ICONS = {
  exercise: '🏃', breathing: '🌬️', journaling: '📓',
  social: '🤝', professional: '💼', other: '📌',
}

function isOverdue(due) {
  if (!due) return false
  return new Date(due) < new Date()
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onStatusChange, onDelete }) {
  const overdue = isOverdue(task.due_date) && task.status !== 'completed'

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base">{CATEGORY_ICONS[task.category] || '📌'}</span>
          <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-400 text-xs flex-shrink-0"
        >✕</button>
      </div>

      <p className="text-xs text-gray-400 mb-2">{task.client_name}</p>

      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      {task.due_date && (
        <p className={`text-xs mb-2 ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {overdue ? '⚠️ ' : '📅 '}
          {new Date(task.due_date).toLocaleDateString('uz-UZ', {
            day: 'numeric', month: 'short',
          })}
        </p>
      )}

      <div className="flex gap-1">
        {task.status !== 'pending' && (
          <button
            onClick={() => onStatusChange(task.id, task.status === 'in_progress' ? 'pending' : 'in_progress')}
            className="text-xs px-2 py-0.5 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            ← Orqaga
          </button>
        )}
        {task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, task.status === 'pending' ? 'in_progress' : 'completed')}
            className="text-xs px-2 py-0.5 rounded-lg border border-violet-200 text-violet-600 hover:bg-violet-50"
          >
            Oldinga →
          </button>
        )}
      </div>
    </div>
  )
}

// ── Create Task Modal ─────────────────────────────────────────────────────────
function CreateTaskModal({ onClose, onCreated }) {
  const { clients } = useClients()
  const [form, setForm] = useState({
    user_id: '', title: '', description: '', category: 'other', due_date: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.user_id || !form.title) return
    setSaving(true)
    try {
      await createTask({ ...form, due_date: form.due_date || null })
      onCreated()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Yangi vazifa</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Mijoz</label>
            <select
              value={form.user_id}
              onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="">Mijozni tanlang</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Vazifa nomi</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Vazifa nomini kiriting"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Tavsif</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Kategoriya</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="exercise">🏃 Mashq</option>
                <option value="breathing">🌬️ Nafas</option>
                <option value="journaling">📓 Daftar</option>
                <option value="social">🤝 Ijtimoiy</option>
                <option value="other">📌 Boshqa</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Muddat</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
          </div>
        </div>
        <div className="p-5 pt-0">
          <button
            onClick={handleSubmit}
            disabled={saving || !form.user_id || !form.title}
            className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saqlanmoqda...' : 'Vazifa berish'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tasks Page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { tasks, isLoading, mutate } = useTasks()
  const [showModal, setShowModal] = useState(false)

  const handleStatusChange = async (id, status) => {
    await updateTask(id, { status })
    mutate()
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Vazifani o'chirasizmi?")) return
    await deleteTask(id)
    mutate()
  }

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Vazifalar</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          + Yangi vazifa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key} className={`rounded-2xl border p-4 ${col.color}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">{col.label}</h2>
                <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {colTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-4">Bo'sh</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreated={() => mutate()}
        />
      )}
    </div>
  )
}
