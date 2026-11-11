import { useEffect, useState } from 'react'
import { api } from '../lib/api'

// Loads data from the API. Falls back to the supplied mock data
// until the backend is ready, so pages always render.
export function useFetch(path, fallback = []) {
  const [state, set] = useState({ data: fallback, loading: true, error: null })
  useEffect(() => {
    let off = false
    api(path)
      .then((data) => !off && set({ data, loading: false, error: null }))
      .catch((error) => !off && set({ data: fallback, loading: false, error }))
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])
  return state
}
