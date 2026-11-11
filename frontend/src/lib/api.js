const BASE = import.meta.env.VITE_API_URL || '/api'

export async function api(path, { method = 'GET', body, token } = {}) {
  let authToken = token
  if (!authToken) {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      authToken = auth?.token
    } catch {
      authToken = null
    }
  }

  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`)
  return data
}

