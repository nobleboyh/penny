import { useEffect } from 'react'
import { useGoalProgress } from '../../goal'
import { useStreakStore } from '../../../store/streakStore'
import { usePennyStore } from '../../../store/pennyStore'
import { moodEngine } from '../moodEngine'

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0
  const today = new Date().toISOString().slice(0, 10)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.max(0, Math.floor((new Date(today).getTime() - new Date(dateStr).getTime()) / msPerDay))
}

export function usePennyMood() {
  const { progressPercent } = useGoalProgress()
  const streakCount = useStreakStore(s => s.streakCount)
  const lastLogDate = useStreakStore(s => s.lastLogDate)
  const setMood = usePennyStore(s => s.setMood)
  const currentMood = usePennyStore(s => s.currentMood)

  useEffect(() => {
    const mood = moodEngine({
      progressPercent,
      streakCount,
      daysSinceLastLog: daysSince(lastLogDate),
      recentSpendingHigh: false,
    })
    setMood(mood)
  }, [progressPercent, streakCount, lastLogDate, setMood])

  return currentMood
}
