import { useGoalProgress } from './useGoalProgress'

export const COUNTDOWN_THRESHOLD_AMOUNT = 30   // $30 remaining
export const COUNTDOWN_THRESHOLD_PERCENT = 90  // 90% progress

export function useGoalCountdown() {
  const { goalAmount, savedAmount, progressPercent, isJustSaving } = useGoalProgress()

  if (isJustSaving || goalAmount === null) {
    return { isCountdown: false, remainingAmount: null }
  }

  const remaining = goalAmount - savedAmount
  const isCountdown =
    remaining <= COUNTDOWN_THRESHOLD_AMOUNT ||
    (progressPercent !== null && progressPercent >= COUNTDOWN_THRESHOLD_PERCENT)

  return {
    isCountdown,
    remainingAmount: remaining > 0 ? remaining : null,
  }
}
