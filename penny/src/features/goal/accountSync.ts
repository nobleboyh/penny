import type { AccountResponse } from './types'

interface GoalNotePayload {
  goalName?: string
  goalEmoji?: string
  goalAmount?: number | null
  targetDate?: string | null
  savedAmount?: number
  isJustSaving?: boolean
}

export interface GoalAccountSnapshot {
  goalName: string | null
  goalEmoji: string | null
  goalAmount: number | null
  targetDate: string | null
  savedAmount: number
  isJustSaving: boolean
}

function parseGoalNote(note: string | null | undefined): GoalNotePayload {
  if (!note) return {}

  try {
    const parsed = JSON.parse(note) as GoalNotePayload
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return { goalName: note }
  }
}

export function buildGoalAccountNote(snapshot: GoalAccountSnapshot): string {
  return JSON.stringify({
    goalName: snapshot.goalName,
    goalEmoji: snapshot.goalEmoji,
    goalAmount: snapshot.goalAmount,
    targetDate: snapshot.targetDate,
    savedAmount: snapshot.savedAmount,
    isJustSaving: snapshot.isJustSaving,
  })
}

export function getGoalSnapshotFromAccount(account: AccountResponse): GoalAccountSnapshot | null {
  const parsed = parseGoalNote(account.note)
  const goalName = parsed.goalName ?? null
  const isJustSaving = parsed.isJustSaving === true || goalName === 'Just saving'
  const goalAmount = isJustSaving ? null : parsed.goalAmount ?? account.saving?.amount ?? null

  if (!goalName && goalAmount === null && !isJustSaving) {
    return null
  }

  return {
    goalName: isJustSaving ? 'Just saving' : goalName,
    goalEmoji: parsed.goalEmoji ?? (isJustSaving ? '💰' : '🎯'),
    goalAmount,
    targetDate: parsed.targetDate ?? null,
    savedAmount: typeof parsed.savedAmount === 'number' ? parsed.savedAmount : 0,
    isJustSaving,
  }
}
