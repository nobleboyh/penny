import { describe, expect, it, vi } from 'vitest'
import { toLocalIsoDate } from './dates'

describe('toLocalIsoDate', () => {
  it('converts an instant to the local calendar day for positive UTC offsets', () => {
    const date = new Date('2026-04-08T17:30:00.000Z')
    vi.spyOn(date, 'getTimezoneOffset').mockReturnValue(-420)

    expect(toLocalIsoDate(date)).toBe('2026-04-09')
  })

  it('converts an instant to the local calendar day for negative UTC offsets', () => {
    const date = new Date('2026-04-09T02:30:00.000Z')
    vi.spyOn(date, 'getTimezoneOffset').mockReturnValue(420)

    expect(toLocalIsoDate(date)).toBe('2026-04-08')
  })
})
