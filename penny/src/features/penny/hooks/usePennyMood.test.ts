import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePennyMood } from './usePennyMood'

vi.mock('../../goal', () => ({ useGoalProgress: vi.fn() }))
vi.mock('../../../store/streakStore', () => ({ useStreakStore: vi.fn((sel: (s: object) => unknown) => sel({ streakCount: 0, lastLogDate: null })) }))
vi.mock('../../../store/pennyStore', () => ({ usePennyStore: vi.fn((sel: (s: object) => unknown) => sel({ currentMood: 'peace', setMood: vi.fn() })) }))
vi.mock('../moodEngine', () => ({ moodEngine: vi.fn(() => 'happy') }))

import { useGoalProgress } from '../../goal'
import { usePennyStore } from '../../../store/pennyStore'
import { moodEngine } from '../moodEngine'

const mockProgress = vi.mocked(useGoalProgress)
const mockPennyStore = vi.mocked(usePennyStore)
const mockMoodEngine = vi.mocked(moodEngine)

const baseProgress = {
  progressPercent: null,
  weeklyTarget: null,
  isJustSaving: false,
  goalName: null,
  goalEmoji: null,
  goalAmount: null,
  savedAmount: 0,
  targetDate: null,
} satisfies ReturnType<typeof useGoalProgress>

function makePennyState(mood: string, setMood: () => void) {
  return (sel: unknown) =>
    (sel as (s: object) => unknown)({ currentMood: mood, lastReaction: null, setMood, setLastReaction: vi.fn() })
}

describe('usePennyMood', () => {
  const mockSetMood = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockProgress.mockReturnValue(baseProgress)
    mockPennyStore.mockImplementation(makePennyState('peace', mockSetMood))
    mockMoodEngine.mockReturnValue('happy')
  })

  it('calls moodEngine and writes result to store via setMood', () => {
    renderHook(() => usePennyMood())
    expect(mockMoodEngine).toHaveBeenCalled()
    expect(mockSetMood).toHaveBeenCalledWith('happy')
  })

  it('returns currentMood from pennyStore', () => {
    mockPennyStore.mockImplementation(makePennyState('happy', mockSetMood))
    const { result } = renderHook(() => usePennyMood())
    expect(result.current).toBe('happy')
  })

  it('passes recentSpendingHigh: false to moodEngine', () => {
    renderHook(() => usePennyMood())
    expect(mockMoodEngine).toHaveBeenCalledWith(
      expect.objectContaining({ recentSpendingHigh: false })
    )
  })

  it('reacts to progressPercent changes', () => {
    mockProgress.mockReturnValue({ ...baseProgress, progressPercent: 50 })
    const { rerender } = renderHook(() => usePennyMood())
    mockProgress.mockReturnValue({ ...baseProgress, progressPercent: 100 })
    act(() => { rerender() })
    expect(mockMoodEngine).toHaveBeenCalledTimes(2)
  })
})
