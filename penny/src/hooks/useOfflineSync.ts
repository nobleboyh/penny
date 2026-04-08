import { useEffect, useState } from 'react'
import { db } from '@/lib/db'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Drain pendingSync on reconnect — full implementation in Story 4.5
      drainPendingSync().catch(err => console.error('[useOfflineSync] drain failed', err))
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}

// Stub — full drain logic implemented in Story 4.5 (Offline Transaction Logging & Sync)
async function drainPendingSync() {
  const pending = await db.pendingSync.orderBy('createdAt').toArray()
  if (pending.length === 0) return
  // TODO Story 4.5: iterate pending, POST to API, move failures to failedSync after 3 retries
  console.debug(`[useOfflineSync] ${pending.length} pending items queued for sync`)
}
