import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StreakState {
  streakCount: number
  lastLogDate: string | null // YYYY-MM-DD local timezone
  saverLevel: number
}

interface StreakActions {
  incrementStreak: () => void
  resetStreak: () => void
  updateLastLogDate: (date: string) => void
  incrementSaverLevel: () => void
}

type StreakStore = StreakState & StreakActions

export const useStreakStore = create<StreakStore>()(
  persist(
    (set) => ({
      streakCount: 0,
      lastLogDate: null,
      saverLevel: 1,
      incrementStreak: () => set((s) => ({ streakCount: s.streakCount + 1 })),
      resetStreak: () => set({ streakCount: 0, lastLogDate: null }),
      updateLastLogDate: (date) => set({ lastLogDate: date }),
      incrementSaverLevel: () => set((s) => ({ saverLevel: s.saverLevel + 1 })),
    }),
    { name: 'penny-streak' }
  )
)
