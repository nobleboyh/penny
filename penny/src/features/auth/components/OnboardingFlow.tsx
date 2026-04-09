import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoalStore } from '../../../store/goalStore'
import { useUpdateAccount } from '../../goal/api'
import { GoalCategoryPicker } from '../../goal/components/GoalCategoryPicker'
import { GoalAmountInput } from '../../goal/components/GoalAmountInput'
import { GoalDatePicker } from '../../goal/components/GoalDatePicker'
import { PennyIntroScreen } from '../../goal/components/PennyIntroScreen'
import type { GoalCategory } from '../../goal/types'

type Step = 'goal-category' | 'goal-amount' | 'goal-date' | 'penny-intro'

const PROGRESS_STEPS: Step[] = ['goal-category', 'goal-amount', 'goal-date']

export function OnboardingFlow() {
  const navigate = useNavigate()
  const { setGoal, setJustSaving } = useGoalStore()
  const updateAccount = useUpdateAccount()

  const [step, setStep] = useState<Step>('goal-category')
  const [goalName, setGoalName] = useState('')
  const [goalEmoji, setGoalEmoji] = useState('🎯')
  const [goalAmount, setGoalAmount] = useState<number | null>(null)
  const [introGoalName, setIntroGoalName] = useState<string | null>(null)

  const progressIndex = PROGRESS_STEPS.indexOf(step as (typeof PROGRESS_STEPS)[number])
  const showProgress = progressIndex >= 0
  const showBack = step === 'goal-amount' || step === 'goal-date'

  function handleCategorySelect(_cat: GoalCategory, name: string, emoji: string) {
    setGoalName(name)
    setGoalEmoji(emoji)
    setStep('goal-amount')
  }

  function handleJustSaving() {
    setJustSaving()
    setIntroGoalName(null)
    setStep('penny-intro')
  }

  function handleAmountNext(amount: number) {
    setGoalAmount(amount)
    setStep('goal-date')
  }

  async function handleDateNext(targetDate: string) {
    if (goalAmount === null) return
    setGoal(goalName, goalEmoji, goalAmount, targetDate)
    setIntroGoalName(goalName)
    try {
      await updateAccount.mutateAsync({
        incomes: [],
        expenses: [],
        saving: { amount: goalAmount, currency: 'USD', interest: 0, deposit: false, capitalization: false },
        note: JSON.stringify({ goalName, goalEmoji, targetDate }),
      })
    } catch {
      // non-blocking — goal saved locally
    }
    setStep('penny-intro')
  }

  function handleBack() {
    if (step === 'goal-amount') setStep('goal-category')
    else if (step === 'goal-date') setStep('goal-amount')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-8">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Header: back + progress dots */}
        <div className="flex items-center justify-between min-h-[32px]">
          {showBack ? (
            <button
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Go back"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          {showProgress && (
            <div
              role="progressbar"
              aria-valuenow={progressIndex + 1}
              aria-valuemin={1}
              aria-valuemax={PROGRESS_STEPS.length}
              aria-label={`Step ${progressIndex + 1} of ${PROGRESS_STEPS.length}`}
              className="flex gap-2"
            >
              {PROGRESS_STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`h-2 w-2 rounded-full transition-colors ${i <= progressIndex ? 'bg-primary' : 'bg-border'}`}
                />
              ))}
            </div>
          )}
          <div className="w-12" />
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
        {step === 'penny-intro' && (
          <PennyIntroScreen goalName={introGoalName} onDone={() => navigate('/home')} />
        )}
      </div>
    </div>
  )
}
