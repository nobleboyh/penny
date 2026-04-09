import { useEffect, useState } from 'react'
import { apiClient } from '../../../lib/api'
import axios from 'axios'

export type AuthStatus = 'loading' | 'authenticated' | 'expired' | 'unauthenticated'

function getInitialStatus(): AuthStatus {
  try {
    return localStorage.getItem('access_token') ? 'loading' : 'unauthenticated'
  } catch {
    return 'unauthenticated'
  }
}

export function useAuthGuard(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>(getInitialStatus)

  useEffect(() => {
    if (status !== 'loading') return
    const controller = new AbortController()
    apiClient
      .get('/accounts/current', { signal: controller.signal })
      .then(() => setStatus('authenticated'))
      .catch((err) => {
        if (axios.isCancel(err)) return
        const isAuthError =
          axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)
        if (isAuthError) {
          try { localStorage.removeItem('access_token') } catch { /* ignore */ }
        }
        // Both auth errors and network errors redirect to /login.
        // Token is only cleared on 401/403 — network errors preserve it for retry.
        setStatus('expired')
      })
    return () => controller.abort()
  }, [status])

  return status
}
