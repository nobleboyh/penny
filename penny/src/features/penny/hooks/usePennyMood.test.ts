import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePennyMood } from './usePennyMood'

vi.mock('../../goal', () => ({ useGoalProgress: vi.fn() }))
vi.mock('../../../store/streakStore', () => ({ useStreakStore: vi.fn((sel: (s: object) => unknown) => sel({ streakCount: 0, lastLogDate: null })) }))
vi.mock('../../../store/pennyStore', () => ({ usePennyStore: vi.fn((sel: (s: object) => unknown) => sel({ currentMood: 'idle', setMood: vi.fn() })) }))
vi.mock('../moodEngine', () => ({ moodEngine: vi.fn(() => 'happy') }))

import { useGoalProgress } from '../../goal'
import { usePennyStore } from '../../../store/pennyStore'
import { moodEngine } from '../moodEngine'

const mockProgress = useGoalProgress as ReturnType<typeof vi.fn>
const mockPennyStore = usePennyStore as ReturnType<typeof vi.fn>
const mockMoodEngine = moodEngine as ReturnType<typeof vi.fn>

describe('usePennyMood', () => {
  const mockSetMood = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockProgress.mockReturnValue({ progressPercent: null })
    mockPennyStore.mockImplementation((sel: (s: object) => unknown) =>
      sel({ currentMood: 'idle', setMood: mockSetMood })
    )
    mockMoodEngine.mockReturnValue('happy')
  })

  it('calls moodEngine and writes result to store via setMood', () => {
    renderHook(() => usePennyMood())
    expect(mockMoodEngine).toHaveBeenCalled()
    expect(mockSetMood).toHaveBeenCalledWith('happy')
  })

  it('returns currentMood from pennyStore', () => {
    mockPennyStore.mockImplementation((sel: (s: object) => unknown) =>
      sel({ currentMood: 'excited', setMood: mockSetMood })
    )
    const { result } = renderHook(() => usePennyMood())
    expect(result.current).toBe('excited')
  })

  it('passes recentSpendingHigh: false to moodEngine', () => {
    renderHook(() => usePennyMood())
    expect(mockMoodEngine).toHaveBeenCalledWith(
      expect.objectContaining({ recentSpendingHigh: false })
    )
  })

  it('reacts to progressPercent changes', () => {
    mockProgress.mockReturnValue({ progressPercent: 50 })
    const { rerender } = renderHook(() => usePennyMood())
    mockProgress.mockReturnValue({ progressPercent: 100 })
    act(() => { rerender() })
    expect(mockMoodEngine).toHaveBeenCalledTimes(2)
  })
})
