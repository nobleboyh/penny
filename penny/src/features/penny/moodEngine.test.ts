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
  it('returns peace when no activity', () => {
    expect(moodEngine(base)).toBe('peace')
  })

  it('returns fierce when progressPercent === 100', () => {
    expect(moodEngine({ ...base, progressPercent: 100, streakCount: 5 })).toBe('fierce')
  })

  it('returns sad when daysSinceLastLog >= 2', () => {
    expect(moodEngine({ ...base, daysSinceLastLog: 2 })).toBe('sad')
    expect(moodEngine({ ...base, daysSinceLastLog: 5 })).toBe('sad')
  })

  it('returns sad when daysSinceLastLog >= 1 and streak === 0', () => {
    expect(moodEngine({ ...base, daysSinceLastLog: 1, streakCount: 0 })).toBe('sad')
  })

  it('returns confident when progressPercent >= 75 and streak >= 1', () => {
    expect(moodEngine({ ...base, progressPercent: 75, streakCount: 1 })).toBe('confident')
    expect(moodEngine({ ...base, progressPercent: 90, streakCount: 2 })).toBe('confident')
  })

  it('returns happy when streak >= 3 and progress >= 50%', () => {
    expect(moodEngine({ ...base, streakCount: 3, progressPercent: 50 })).toBe('happy')
    expect(moodEngine({ ...base, streakCount: 5, progressPercent: 60 })).toBe('happy')
  })

  it('returns happy when streak >= 1 and progress > 0', () => {
    expect(moodEngine({ ...base, streakCount: 1, progressPercent: 10 })).toBe('happy')
  })

  it('returns shocked when recentSpendingHigh and no other triggers', () => {
    expect(moodEngine({ ...base, recentSpendingHigh: true })).toBe('shocked')
  })

  it('returns peace when progressPercent > 0 and no other triggers', () => {
    expect(moodEngine({ ...base, progressPercent: 30 })).toBe('peace')
  })

  it('is a pure function — same inputs always produce same output', () => {
    const input: MoodEngineInput = { progressPercent: 60, streakCount: 3, daysSinceLastLog: 0, recentSpendingHigh: false }
    expect(moodEngine(input)).toBe(moodEngine(input))
    expect(moodEngine(input)).toBe('happy')
  })
})
