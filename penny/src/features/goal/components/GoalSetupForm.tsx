import { useState } from 'react'
import { useGoalStore } from '../../../store/goalStore'
import { useUpdateAccount } from '../api'
import { GoalCategoryPicker } from './GoalCategoryPicker'
import { GoalAmountInput } from './GoalAmountInput'
import { GoalDatePicker } from './GoalDatePicker'
import type { GoalCategory } from '../types'
import { buildGoalAccountNote } from '../accountSync'
import { queryClient } from '../../../lib/api'

interface GoalSetupFormProps {
  mode?: 'create' | 'update'
  onComplete: () => void
  onCancel: () => void
}

type Step = 'goal-category' | 'goal-amount' | 'goal-date'

export function GoalSetupForm({ mode = 'create', onComplete, onCancel }: GoalSetupFormProps) {
  const { setGoal, setJustSaving, savedAmount, markRemoteSyncPending, clearRemoteSyncPending } = useGoalStore()
  const updateAccount = useUpdateAccount()

  const [step, setStep] = useState<Step>('goal-category')
  const [goalName, setGoalName] = useState('')
  const [goalEmoji, setGoalEmoji] = useState('🎯')
  const [goalAmount, setGoalAmount] = useState<number | null>(null)

  function handleJustSaving() {
    setJustSaving()
    markRemoteSyncPending()
    onComplete()
    updateAccount.mutateAsync({
      incomes: [],
      expenses: [],
      saving: { amount: 0, currency: 'USD', interest: 0, deposit: false, capitalization: false },
      note: buildGoalAccountNote({
        goalName: 'Just saving',
        goalEmoji: '💰',
        goalAmount: null,
        targetDate: null,
        savedAmount,
        isJustSaving: true,
      }),
    }).then(() => {
      clearRemoteSyncPending()
      void queryClient.invalidateQueries({ queryKey: ['accounts', 'current'] })
    }).catch(() => {})
  }

  function handleCategorySelect(_cat: GoalCategory, name: string, emoji: string) {
    setGoalName(name)
    setGoalEmoji(emoji)
    setStep('goal-amount')
  }

  function handleAmountNext(amount: number) {
    setGoalAmount(amount)
    setStep('goal-date')
  }

  function handleDateNext(targetDate: string) {
    if (goalAmount === null) return
    // Optimistic update — store updated immediately (AC: 5)
    setGoal(goalName, goalEmoji, goalAmount, targetDate)
    markRemoteSyncPending()
    // Close form immediately — don't wait for API (AC: 6)
    onComplete()
    // Fire-and-forget API call (AC: 4)
    updateAccount.mutateAsync({
      incomes: [],
      expenses: [],
      saving: { amount: goalAmount, currency: 'USD', interest: 0, deposit: false, capitalization: false },
      note: buildGoalAccountNote({
        goalName,
        goalEmoji,
        goalAmount,
        targetDate,
        savedAmount,
        isJustSaving: false,
      }),
    }).then(() => {
      clearRemoteSyncPending()
      void queryClient.invalidateQueries({ queryKey: ['accounts', 'current'] })
    }).catch(() => {
      // non-blocking — goal already saved locally in goalStore
    })
  }

  function handleBack() {
    if (step === 'goal-amount') setStep('goal-category')
    else if (step === 'goal-date') setStep('goal-amount')
  }

  const showBack = step !== 'goal-category'
  const title = mode === 'update' ? 'Update your goal' : undefined

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between min-h-[32px]">
        {showBack ? (
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 text-sm"
            aria-label="Go back"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        {title && <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{title}</p>}
        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 text-sm"
          aria-label="Cancel"
        >
          Cancel
        </button>
      </div>

      {step === 'goal-category' && (
        <GoalCategoryPicker onSelect={handleCategorySelect} onJustSaving={handleJustSaving} />
      )}
      {step === 'goal-amount' && (
        <GoalAmountInput goalName={goalName} onNext={handleAmountNext} />
      )}
      {step === 'goal-date' && goalAmount !== null && (
        <GoalDatePicker goalName={goalName} goalAmount={goalAmount} onNext={handleDateNext} />
      )}
    </div>
  )
}
