import { useRef, useState } from 'react'
import { db } from '../../../lib/db'
import type { NewTransaction } from '../../../lib/db'
import { toLocalIsoDate } from '../../../lib/dates'
import { useGoalStore } from '../../../store/goalStore'
import { useStreakStore } from '../../../store/streakStore'
import type { NlpResult } from '../types'

export function useTransactionLog() {
  const [isLogging, setIsLogging] = useState(false)
  const loggingRef = useRef(false)
  const updateSavedAmount = useGoalStore(s => s.updateSavedAmount)
  const updateLastLogDate = useStreakStore(s => s.updateLastLogDate)
  const incrementStreak = useStreakStore(s => s.incrementStreak)
  const lastLogDate = useStreakStore(s => s.lastLogDate)

  async function logTransaction(parsed: NlpResult & { note?: string }) {
    if (parsed.amount === null || loggingRef.current) return

    loggingRef.current = true
    setIsLogging(true)

    try {
      const now = new Date()
      const today = toLocalIsoDate(now)
      const tx: NewTransaction = {
        amount: parsed.amount,
        category: parsed.category,
        emoji: parsed.emoji,
        note: parsed.note,
        date: today,
        createdAt: now.toISOString(),
      }

      // Offline-first: write to Dexie before anything else
      await db.transactions.add(tx)
      await db.pendingSync.add({ transactionData: tx, retryCount: 0, createdAt: tx.createdAt })

      // Optimistic update: goal progress updates instantly
      updateSavedAmount(parsed.amount)

      // Streak: increment only on first log of the day
      if (lastLogDate !== today) {
        updateLastLogDate(today)
        incrementStreak()
      }
    } finally {
      loggingRef.current = false
      setIsLogging(false)
    }
  }

  return { logTransaction, isLogging }
}
