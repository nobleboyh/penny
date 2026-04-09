import { describe, it, expect } from 'vitest'
import { moodEngine } from './moodEngine'
import type { MoodEngineInput } from './moodEngine'

const base: MoodEngineInput = {
  progressPercent: null,
  streakCount: 0,
  daysSinceLastLog: 0,
  recentSpendingHigh: false,
}

describe('moodEngine', () => {
  it('returns idle when no activity', () => {
    expect(moodEngine(base)).toBe('idle')
  })

  it('returns celebrating when progressPercent === 100', () => {
    expect(moodEngine({ ...base, progressPercent: 100, streakCount: 5 })).toBe('celebrating')
  })

  it('returns worried when daysSinceLastLog >= 2', () => {
    expect(moodEngine({ ...base, daysSinceLastLog: 2 })).toBe('worried')
    expect(moodEngine({ ...base, daysSinceLastLog: 5 })).toBe('worried')
  })

  it('returns sad when daysSinceLastLog >= 1 and streak === 0', () => {
    expect(moodEngine({ ...base, daysSinceLastLog: 1, streakCount: 0 })).toBe('sad')
  })

  it('returns proud when progressPercent >= 75 and streak >= 1', () => {
    expect(moodEngine({ ...base, progressPercent: 75, streakCount: 1 })).toBe('proud')
    expect(moodEngine({ ...base, progressPercent: 90, streakCount: 2 })).toBe('proud')
  })

  it('returns excited when streak >= 3 and progress >= 50%', () => {
    expect(moodEngine({ ...base, streakCount: 3, progressPercent: 50 })).toBe('excited')
    expect(moodEngine({ ...base, streakCount: 5, progressPercent: 60 })).toBe('excited')
  })

  it('returns happy when streak >= 1 and progress > 0', () => {
    expect(moodEngine({ ...base, streakCount: 1, progressPercent: 10 })).toBe('happy')
  })

  it('returns thinking when recentSpendingHigh and no other triggers', () => {
    expect(moodEngine({ ...base, recentSpendingHigh: true })).toBe('thinking')
  })

  it('returns neutral when progressPercent > 0 and no other triggers', () => {
    expect(moodEngine({ ...base, progressPercent: 30 })).toBe('neutral')
  })

  it('is a pure function — same inputs always produce same output', () => {
    const input: MoodEngineInput = { progressPercent: 60, streakCount: 3, daysSinceLastLog: 0, recentSpendingHigh: false }
    expect(moodEngine(input)).toBe(moodEngine(input))
    expect(moodEngine(input)).toBe('excited')
  })
})
