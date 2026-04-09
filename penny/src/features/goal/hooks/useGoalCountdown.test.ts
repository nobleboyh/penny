import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGoalCountdown, COUNTDOWN_THRESHOLD_AMOUNT, COUNTDOWN_THRESHOLD_PERCENT } from './useGoalCountdown'

vi.mock('./useGoalProgress', () => ({ useGoalProgress: vi.fn() }))
import { useGoalProgress } from './useGoalProgress'
const mockProgress = useGoalProgress as ReturnType<typeof vi.fn>

const base = {
  goalName: 'AirPods',
  goalEmoji: '🎧',
  targetDate: '2026-12-01',
  isJustSaving: false,
}

describe('useGoalCountdown', () => {
  beforeEach(() => {
    mockProgress.mockReturnValue({ ...base, goalAmount: 249, savedAmount: 87, progressPercent: 35 })
  })

  it('returns isCountdown: false when well below threshold', () => {
    const { result } = renderHook(() => useGoalCountdown())
    expect(result.current.isCountdown).toBe(false)
  })

  it(`returns isCountdown: true when remaining ≤ $${COUNTDOWN_THRESHOLD_AMOUNT}`, () => {
    mockProgress.mockReturnValue({ ...base, goalAmount: 249, savedAmount: 225, progressPercent: 90.4 })
    const { result } = renderHook(() => useGoalCountdown())
    expect(result.current.isCountdown).toBe(true)
    expect(result.current.remainingAmount).toBe(24)
  })

  it(`returns isCountdown: true when progressPercent ≥ ${COUNTDOWN_THRESHOLD_PERCENT}%`, () => {
    mockProgress.mockReturnValue({ ...base, goalAmount: 249, savedAmount: 224, progressPercent: 90 })
    const { result } = renderHook(() => useGoalCountdown())
    expect(result.current.isCountdown).toBe(true)
  })

  it('returns isCountdown: false when isJustSaving: true', () => {
    mockProgress.mockReturnValue({ ...base, isJustSaving: true, goalAmount: null, savedAmount: 50, progressPercent: null })
    const { result } = renderHook(() => useGoalCountdown())
    expect(result.current.isCountdown).toBe(false)
    expect(result.current.remainingAmount).toBeNull()
  })

  it('returns isCountdown: false when goalAmount: null', () => {
    mockProgress.mockReturnValue({ ...base, goalAmount: null, savedAmount: 50, progressPercent: null })
    const { result } = renderHook(() => useGoalCountdown())
    expect(result.current.isCountdown).toBe(false)
    expect(result.current.remainingAmount).toBeNull()
  })

  it('returns remainingAmount: null when goal is already reached', () => {
    mockProgress.mockReturnValue({ ...base, goalAmount: 249, savedAmount: 249, progressPercent: 100 })
    const { result } = renderHook(() => useGoalCountdown())
    expect(result.current.isCountdown).toBe(true)
    expect(result.current.remainingAmount).toBeNull()
  })
})
