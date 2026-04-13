import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useGoalProgress } from '../hooks/useGoalProgress'
import { useGoalCompletion } from '../hooks/useGoalCompletion'
import { useGoalStore } from '../../../store/goalStore'
import { PennyAvatar } from '../../../components/PennyAvatar'

interface Props {
  onDismiss: () => void
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function GoalCompletionCelebration({ onDismiss }: Props) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const { goalName, savedAmount } = useGoalProgress()
  const { daysTaken } = useGoalCompletion()
  const resetGoal = useGoalStore(s => s.resetGoal)
  const [phase, setPhase] = useState<'celebration' | 're-engagement'>('celebration')
  const [canDismiss, setCanDismiss] = useState(reducedMotion)

  useEffect(() => {
    if (reducedMotion) return
    const timer = setTimeout(() => setCanDismiss(true), 2000)
    return () => clearTimeout(timer)
  }, [reducedMotion])

  const handleSetNewGoal = () => {
    resetGoal()
    navigate('/onboarding/goal')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Goal achieved!"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(15,15,20,0.97)' }}
    >
      {phase === 'celebration' ? (
        <>
          {!reducedMotion && <div className="confetti-container" aria-hidden="true" />}
          <PennyAvatar size="lg" mood="fierce" aria-label="Penny is celebrating your achievement!" />
          <h1 className="text-3xl font-bold text-center mt-4" style={{ color: 'var(--color-primary)' }}>
            YOU DID IT! 🏆
          </h1>
          <p className="text-lg font-semibold text-center mt-2" style={{ color: 'var(--color-foreground)' }}>
            {goalName} — ACHIEVED
          </p>
          <p className="text-center mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {fmt.format(savedAmount)} saved
            {daysTaken !== null && ` · ${daysTaken} days`}
          </p>
          {canDismiss && (
            <button
              onClick={() => setPhase('re-engagement')}
              className="mt-8 min-h-[44px] px-8 rounded-2xl font-bold text-lg"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            >
              Woohoo! 🎉
            </button>
          )}
        </>
      ) : (
        <>
          <PennyAvatar size="lg" mood="happy" aria-label="Penny is happy for you" />
          <h2 className="text-xl font-bold text-center mt-4" style={{ color: 'var(--color-foreground)' }}>
            Ready for your next goal?
          </h2>
          <p className="text-sm text-center mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
            What are we saving for next? 🐷
          </p>
          <button
            onClick={handleSetNewGoal}
            className="mt-6 w-full max-w-xs min-h-[44px] rounded-2xl font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            Set new goal
          </button>
          <button
            onClick={onDismiss}
            className="mt-3 w-full max-w-xs min-h-[44px] rounded-2xl border font-semibold"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
          >
            Not yet
          </button>
        </>
      )}
    </div>
  )
}
