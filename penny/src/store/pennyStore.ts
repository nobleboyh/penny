import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MoodState =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'sad'
  | 'celebrating'
  | 'worried'
  | 'proud'
  | 'neutral'
  | 'thinking'
  | 'disappointed'

interface PennyState {
  currentMood: MoodState
  lastReaction: string | null
}

interface PennyActions {
  setMood: (mood: MoodState) => void
  setLastReaction: (reaction: string) => void
}

type PennyStore = PennyState & PennyActions

export const usePennyStore = create<PennyStore>()(
  persist(
    (set) => ({
      currentMood: 'idle',
      lastReaction: null,
      setMood: (mood) => set({ currentMood: mood }),
      setLastReaction: (reaction) => set({ lastReaction: reaction }),
    }),
    { name: 'penny-mood' }
  )
)
