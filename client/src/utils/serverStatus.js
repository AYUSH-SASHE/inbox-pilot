// ===========================================================
// serverStatus.js: checks every 5 seconds whether the backend
// is reachable, and whether a Gemini key is configured.
// ===========================================================
import { useEffect, useState } from 'react'

// In production we set VITE_API_URL. Locally it is the Express port.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function useServerStatus() {
  // online: null = still checking, true = reachable, false = offline
  const [status, setStatus] = useState({ online: null, gemini: false })

  useEffect(() => {
    let alive = true

    async function check() {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      try {
        const res = await fetch(API_URL + '/api/health', { signal: controller.signal })
        const data = await res.json()
        if (alive) setStatus({ online: true, gemini: Boolean(data.geminiConfigured) })
      } catch {
        if (alive) setStatus({ online: false, gemini: false })
      } finally {
        clearTimeout(timer)
      }
    }

    check()
    const id = setInterval(check, 5000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  return status
}