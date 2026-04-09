import { useEffect, useState } from 'react'
import { apiClient } from '../../../lib/api'
import { useGoalStore } from '../../../store/goalStore'
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
  const rehydrateFromBackend = useGoalStore(s => s.rehydrateFromBackend)
  const hasGoal = useGoalStore(s => !!s.goalName)

  useEffect(() => {
    if (status !== 'loading') return
    const controller = new AbortController()
    apiClient
      .get('/accounts/current', { signal: controller.signal })
      .then((res) => {
        // Rehydrate goalStore from backend if local store has no goal
        // (covers: localStorage cleared after logout, new device, first login)
        if (!hasGoal) {
          const { note, saving } = res.data
          if (note && saving?.amount > 0) {
            try {
              const parsed = JSON.parse(note)
              rehydrateFromBackend(
                parsed.goalName ?? note,
                parsed.goalEmoji ?? '🎯',
                saving.amount,
                parsed.targetDate ?? '',
              )
            } catch {
              // Legacy plain-string note — restore name only
              rehydrateFromBackend(note, '🎯', saving.amount, '')
            }
          }
        }
        setStatus('authenticated')
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        const isAuthError =
          axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)
        if (isAuthError) {
          try { localStorage.removeItem('access_token') } catch { /* ignore */ }
        }
        setStatus('expired')
      })
    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return status
}
