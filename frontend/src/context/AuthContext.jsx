import { createContext, useContext, useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api } from '../lib/api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('auth'))
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Validate session on mount
  useEffect(() => {
    let active = true
    api('/auth/me')
      .then((res) => {
        if (active && res?.user) {
          const updated = { token: auth?.token || 'session-active', user: res.user }
          localStorage.setItem('auth', JSON.stringify(updated))
          setAuth(updated)
        }
      })
      .catch(() => {
        if (active && auth) {
          // If token was invalid, clear stale credentials
          localStorage.removeItem('auth')
          setAuth(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    localStorage.setItem('auth', JSON.stringify(data))
    setAuth(data)
    return data
  }

  // Login with role expectation (shows clear error if wrong portal)
  const loginAsRole = async (email, password, expectedRole) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password, expectedRole }
    })
    localStorage.setItem('auth', JSON.stringify(data))
    setAuth(data)
    return data
  }

  const register = async (userData) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: userData
    })
    localStorage.setItem('auth', JSON.stringify(data))
    setAuth(data)
    return data
  }

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('auth')
      try {
        sessionStorage.removeItem('auth')
        sessionStorage.clear()
      } catch {
        // Ignore storage access errors
      }
      try {
        document.cookie = 'token=; Max-Age=0; path=/;'
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      } catch {
        // Ignore cookie access errors
      }
      setAuth(null)
    }
  }

  return (
    <Ctx.Provider
      value={{
        user: auth?.user,
        token: auth?.token,
        loading,
        login,
        loginAsRole,
        register,
        logout
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

/* ── Student-only protected route ── */
export function ProtectedRoute({ children }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
          <p className="text-xs font-semibold text-gray-500">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If logged in as admin, redirect to admin dashboard
  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

/* ── Admin-only protected route ── */
export function AdminRoute({ children }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
          <p className="text-xs font-semibold text-gray-500">Verifying admin session...</p>
        </div>
      </div>
    )
  }

  if (!user && !token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-black text-brand-navy mb-2">403 — Access Denied</h1>
          <p className="text-sm text-gray-600 mb-6">
            This area is restricted to Lecturers and Administrators only. Your current account does not have the required permissions.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-bold text-white hover:bg-brand-navy/90 transition"
          >
            ← Return to Homepage
          </a>
        </div>
      </div>
    )
  }

  return children
}
