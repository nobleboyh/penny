import { useGoalStore } from '../../../store/goalStore'

function weeksUntil(targetDate: string): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  return Math.max(1, Math.ceil((new Date(targetDate).getTime() - Date.now()) / msPerWeek))
}

function isPastDate(targetDate: string): boolean {
  return new Date(targetDate).getTime() < Date.now()
}

export function useGoalProgress() {
  const goalName = useGoalStore(s => s.goalName)
  const goalEmoji = useGoalStore(s => s.goalEmoji)
  const goalAmount = useGoalStore(s => s.goalAmount)
  const savedAmount = useGoalStore(s => s.savedAmount)
  const targetDate = useGoalStore(s => s.targetDate)
  const isJustSaving = useGoalStore(s => s.isJustSaving)

  // Guard goalAmount > 0 to prevent NaN from 0/0
  const progressPercent = goalAmount && goalAmount > 0
    ? Math.min((savedAmount / goalAmount) * 100, 100)
    : null

  let weeklyTarget: number | null = null
  if (!isJustSaving && goalAmount && goalAmount > 0 && targetDate && !isPastDate(targetDate) && savedAmount < goalAmount) {
    weeklyTarget = (goalAmount - savedAmount) / weeksUntil(targetDate)
  } else if (!isJustSaving && goalAmount && goalAmount > 0 && savedAmount >= goalAmount) {
    weeklyTarget = 0
  }
  // Past targetDate → weeklyTarget stays null (goal overdue, no weekly target shown)

  return { progressPercent, weeklyTarget, isJustSaving, goalName, goalEmoji, goalAmount, savedAmount, targetDate }
}
