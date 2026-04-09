import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGoalCompletion } from './useGoalCompletion'

vi.mock('./useGoalProgress', () => ({ useGoalProgress: vi.fn() }))
import { useGoalProgress } from './useGoalProgress'
const mockProgress = useGoalProgress as ReturnType<typeof vi.fn>

describe('useGoalCompletion', () => {
  beforeEach(() => {
    mockProgress.mockReturnValue({
      goalAmount: 200,
      savedAmount: 200,
      isJustSaving: false,
      targetDate: null,
    })
  })

  it('isComplete: true when savedAmount >= goalAmount', () => {
    const { result } = renderHook(() => useGoalCompletion())
    expect(result.current.isComplete).toBe(true)
  })

  it('isComplete: true when savedAmount exceeds goalAmount', () => {
    mockProgress.mockReturnValue({ goalAmount: 200, savedAmount: 250, isJustSaving: false, targetDate: null })
    const { result } = renderHook(() => useGoalCompletion())
    expect(result.current.isComplete).toBe(true)
  })

  it('isComplete: false when isJustSaving: true', () => {
    mockProgress.mockReturnValue({ goalAmount: 200, savedAmount: 200, isJustSaving: true, targetDate: null })
    const { result } = renderHook(() => useGoalCompletion())
    expect(result.current.isComplete).toBe(false)
  })

  it('isComplete: false when goalAmount: null', () => {
    mockProgress.mockReturnValue({ goalAmount: null, savedAmount: 200, isJustSaving: false, targetDate: null })
    const { result } = renderHook(() => useGoalCompletion())
    expect(result.current.isComplete).toBe(false)
  })

  it('isComplete: false when savedAmount < goalAmount', () => {
    mockProgress.mockReturnValue({ goalAmount: 200, savedAmount: 150, isJustSaving: false, targetDate: null })
    const { result } = renderHook(() => useGoalCompletion())
    expect(result.current.isComplete).toBe(false)
  })

  it('daysTaken: null when targetDate is null', () => {
    const { result } = renderHook(() => useGoalCompletion())
    expect(result.current.daysTaken).toBeNull()
  })

  it('daysTaken: at least 1 when targetDate is set and goal is complete', () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    mockProgress.mockReturnValue({ goalAmount: 200, savedAmount: 200, isJustSaving: false, targetDate: pastDate })
    const { result } = renderHook(() => useGoalCompletion())
    expect(result.current.daysTaken).toBeGreaterThanOrEqual(1)
  })
})
