import { useEffect, useState } from 'react'
import { apiClient } from '../../../lib/api'
import { useGoalStore } from '../../../store/goalStore'
import axios from 'axios'
import { getGoalSnapshotFromAccount } from '../../goal/accountSync'

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
  const pendingRemoteSync = useGoalStore(s => s.pendingRemoteSync)

  useEffect(() => {
    if (status !== 'loading') return
    const controller = new AbortController()
    apiClient
      .get('/accounts/current', { signal: controller.signal })
      .then((res) => {
        if (!pendingRemoteSync) {
          const snapshot = getGoalSnapshotFromAccount(res.data)
          if (snapshot) {
            rehydrateFromBackend(
              snapshot.goalName,
              snapshot.goalEmoji,
              snapshot.goalAmount,
              snapshot.targetDate,
              snapshot.savedAmount,
              snapshot.isJustSaving,
            )
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
  }, [pendingRemoteSync, rehydrateFromBackend, status])

  return status
}
