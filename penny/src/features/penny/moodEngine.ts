import type { MoodState } from '../../store/pennyStore'

export interface MoodEngineInput {
  progressPercent: number | null
  streakCount: number
  daysSinceLastLog: number
  recentSpendingHigh: boolean
}

export function moodEngine(input: MoodEngineInput): MoodState {
  const { progressPercent, streakCount, daysSinceLastLog, recentSpendingHigh } = input

  if (progressPercent !== null && progressPercent >= 100) return 'celebrating'
  if (daysSinceLastLog >= 2) return 'worried'
  if (daysSinceLastLog >= 1 && streakCount === 0) return 'sad'
  if (progressPercent !== null && progressPercent >= 75 && streakCount >= 1) return 'proud'
  if (streakCount >= 3 && progressPercent !== null && progressPercent >= 50) return 'excited'
  if (streakCount >= 1 && progressPercent !== null && progressPercent > 0) return 'happy'
  if (recentSpendingHigh) return 'thinking'
  if (progressPercent !== null && progressPercent > 0) return 'neutral'
  return 'idle'
}
