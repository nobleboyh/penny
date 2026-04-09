import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GoalState {
  goalName: string | null
  goalEmoji: string | null
  goalAmount: number | null
  savedAmount: number
  targetDate: string | null // ISO 8601 date string
  isJustSaving: boolean
  pendingRemoteSync: boolean
  _hasHydrated: boolean
}

interface GoalActions {
  setGoal: (name: string, emoji: string, amount: number, targetDate: string) => void
  setJustSaving: () => void
  updateSavedAmount: (amount: number) => void
  resetGoal: () => void
  setHasHydrated: (v: boolean) => void
  markRemoteSyncPending: () => void
  clearRemoteSyncPending: () => void
  rehydrateFromBackend: (name: string | null, emoji: string | null, amount: number | null, targetDate: string | null, savedAmount: number, isJustSaving: boolean) => void
}

type GoalStore = GoalState & GoalActions

const initialState: GoalState = {
  goalName: null,
  goalEmoji: null,
  goalAmount: null,
  savedAmount: 0,
  targetDate: null,
  isJustSaving: false,
  pendingRemoteSync: false,
  _hasHydrated: false,
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      ...initialState,
      setGoal: (goalName, goalEmoji, goalAmount, targetDate) =>
        set({ goalName, goalEmoji, goalAmount, targetDate, isJustSaving: false }),
      setJustSaving: () =>
        set({ goalName: 'Just saving', goalEmoji: '💰', goalAmount: null, targetDate: null, isJustSaving: true }),
      updateSavedAmount: (amount) =>
        set((s) => ({ savedAmount: s.savedAmount + amount })),
      resetGoal: () => set(initialState),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      markRemoteSyncPending: () => set({ pendingRemoteSync: true }),
      clearRemoteSyncPending: () => set({ pendingRemoteSync: false }),
      rehydrateFromBackend: (name, emoji, amount, targetDate, savedAmount, isJustSaving) =>
        set({
          goalName: name,
          goalEmoji: emoji,
          goalAmount: amount,
          targetDate: targetDate || null,
          savedAmount,
          isJustSaving,
          pendingRemoteSync: false,
        }),
    }),
    {
      name: 'penny-goal',
      partialize: (state) => ({
        goalName: state.goalName,
        goalEmoji: state.goalEmoji,
        goalAmount: state.goalAmount,
        savedAmount: state.savedAmount,
        targetDate: state.targetDate,
        isJustSaving: state.isJustSaving,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
