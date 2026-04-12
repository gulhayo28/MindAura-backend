const API_BASE = process.env.REACT_APP_API_URL || 'https://mindaura-backend-4.onrender.com'
function getToken() {
  return localStorage.getItem('access_token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  return res.json()
}

// SWR uchun fetcher
export const fetcher = (url) => apiFetch(url)
