import { useGoalProgress } from './useGoalProgress'

export function useGoalCompletion() {
  const { goalAmount, savedAmount, isJustSaving, targetDate } = useGoalProgress()

  if (isJustSaving || goalAmount === null) {
    return { isComplete: false, daysTaken: null }
  }

  const isComplete = savedAmount >= goalAmount

  let daysTaken: number | null = null
  if (isComplete && targetDate) {
    const msPerDay = 24 * 60 * 60 * 1000
    daysTaken = Math.max(1, Math.round((Date.now() - new Date(targetDate).getTime()) / msPerDay))
  }

  return { isComplete, daysTaken }
}
