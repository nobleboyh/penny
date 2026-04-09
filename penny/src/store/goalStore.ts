import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GoalState {
  goalName: string | null
  goalAmount: number | null
  savedAmount: number
  targetDate: string | null // ISO 8601 date string
  isJustSaving: boolean
}

interface GoalActions {
  setGoal: (name: string, amount: number, targetDate: string) => void
  setJustSaving: () => void
  updateSavedAmount: (amount: number) => void
  resetGoal: () => void
}

type GoalStore = GoalState & GoalActions

const initialState: GoalState = {
  goalName: null,
  goalAmount: null,
  savedAmount: 0,
  targetDate: null,
  isJustSaving: false,
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      ...initialState,
      setGoal: (goalName, goalAmount, targetDate) =>
        set({ goalName, goalAmount, targetDate, isJustSaving: false }),
      setJustSaving: () =>
        set({ goalName: 'Just saving', goalAmount: null, targetDate: null, isJustSaving: true }),
      updateSavedAmount: (amount) =>
        set((s) => ({ savedAmount: s.savedAmount + amount })),
      resetGoal: () => set(initialState),
    }),
    { name: 'penny-goal' }
  )
)
