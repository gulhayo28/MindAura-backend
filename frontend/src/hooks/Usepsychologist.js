import useSWR from 'swr'
import { fetcher, apiFetch } from './apiFetch'

// ── Sessions ──────────────────────────────────────────────────────────────────
export function useSessions() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/psychologist/sessions',
    fetcher,
    { refreshInterval: 30000 }
  )
  return { sessions: data || [], isLoading, isError: !!error, mutate }
}

export function createSession(body) {
  return apiFetch('/api/psychologist/sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateSession(id, body) {
  return apiFetch(`/api/psychologist/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function cancelSession(id) {
  return apiFetch(`/api/psychologist/sessions/${id}`, { method: 'DELETE' })
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/psychologist/tasks',
    fetcher,
    { refreshInterval: 30000 }
  )
  return { tasks: data || [], isLoading, isError: !!error, mutate }
}

export function createTask(body) {
  return apiFetch('/api/psychologist/tasks', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateTask(id, body) {
  return apiFetch(`/api/psychologist/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteTask(id) {
  return apiFetch(`/api/psychologist/tasks/${id}`, { method: 'DELETE' })
}

// ── Clients ───────────────────────────────────────────────────────────────────
export function useClients() {
  const { data, error, isLoading } = useSWR(
    '/api/psychologist/clients',
    fetcher
  )
  return { clients: data || [], isLoading, isError: !!error }
}

export function useClient(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/psychologist/clients/${id}` : null,
    fetcher
  )
  return { client: data, isLoading, isError: !!error, mutate }
}

export function generateAIAnalysis(clientId) {
  return apiFetch(`/api/psychologist/clients/${clientId}/ai-analysis`, {
    method: 'POST',
  })
}
