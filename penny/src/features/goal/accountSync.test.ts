import { describe, expect, it } from 'vitest'
import { buildGoalAccountNote, getGoalSnapshotFromAccount } from './accountSync'

describe('accountSync', () => {
  it('builds a note with goal target and saved progress', () => {
    expect(
      buildGoalAccountNote({
        goalName: 'Food',
        goalEmoji: '🍟',
        goalAmount: 200,
        targetDate: '2026-05-01',
        savedAmount: 45,
        isJustSaving: false,
      })
    ).toBe('{"goalName":"Food","goalEmoji":"🍟","goalAmount":200,"targetDate":"2026-05-01","savedAmount":45,"isJustSaving":false}')
  })

  it('hydrates goal target from note and progress from savedAmount metadata', () => {
    const snapshot = getGoalSnapshotFromAccount({
      name: 'demo',
      incomes: [],
      expenses: [],
      saving: { amount: 200, currency: 'USD', interest: 0, deposit: false, capitalization: false },
      note: JSON.stringify({ goalName: 'Food', goalEmoji: '🍟', targetDate: '2026-05-01', savedAmount: 45 }),
      lastSeen: '2026-04-09T00:00:00.000Z',
    })

    expect(snapshot).toEqual({
      goalName: 'Food',
      goalEmoji: '🍟',
      goalAmount: 200,
      targetDate: '2026-05-01',
      savedAmount: 45,
      isJustSaving: false,
    })
  })

  it('hydrates just-saving mode from note', () => {
    const snapshot = getGoalSnapshotFromAccount({
      name: 'demo',
      incomes: [],
      expenses: [],
      saving: { amount: 0, currency: 'USD', interest: 0, deposit: false, capitalization: false },
      note: JSON.stringify({ goalName: 'Just saving', goalEmoji: '💰', savedAmount: 18, isJustSaving: true }),
      lastSeen: '2026-04-09T00:00:00.000Z',
    })

    expect(snapshot).toEqual({
      goalName: 'Just saving',
      goalEmoji: '💰',
      goalAmount: null,
      targetDate: null,
      savedAmount: 18,
      isJustSaving: true,
    })
  })
})
