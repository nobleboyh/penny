import { useState } from 'react'
import { useCurrentAccount } from '../../features/goal'
import { useGoalProgress } from '../../features/goal/hooks/useGoalProgress'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function GoalProgressCard() {
  const { isLoading, isError } = useCurrentAccount()
  const { progressPercent, weeklyTarget, isJustSaving, goalName, goalEmoji, goalAmount, savedAmount, targetDate } = useGoalProgress()
  const reducedMotion = useReducedMotion()
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        className="w-full max-w-sm rounded-2xl p-6 animate-pulse"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="h-5 w-2/3 rounded mb-4" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-4 w-1/2 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-muted-foreground text-sm">Couldn't load goal data. Check your connection.</p>
      </div>
    )
  }

  const glowSize = 8 + (progressPercent ?? 0) * 0.16
  // Use rgba for valid CSS alpha — var() references cannot have hex alpha appended
  const glowStyle: React.CSSProperties = {
    boxShadow: `0 0 ${glowSize}px rgba(255,107,107,0.9), 0 0 ${glowSize * 2}px rgba(255,107,107,0.4)`,
    ...(reducedMotion ? {} : { transition: 'width 500ms ease, box-shadow 500ms ease' }),
  }

  const toggle = () => setIsExpanded(p => !p)
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') toggle() }
  const cardLabel = goalName ? `${goalName} goal progress` : 'Goal progress'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={cardLabel}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className="w-full max-w-sm rounded-2xl p-6 cursor-pointer focus:outline-none focus-visible:ring-2"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', minHeight: '44px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl" aria-hidden="true">{goalEmoji ?? '🐷'}</span>
        <h2 className="text-foreground font-bold text-lg truncate">{goalName ?? 'My Goal'}</h2>
      </div>

      {/* Progress bar (goal mode only) */}
      {!isJustSaving && goalAmount && (
        <div className="mb-4">
          <div
            role="progressbar"
            aria-valuenow={Math.round(progressPercent ?? 0)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Goal progress"
            className="relative h-4 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPercent ?? 0}%`,
                backgroundColor: 'var(--color-primary)',
                ...glowStyle,
              }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-1 text-right">
            {Math.round(progressPercent ?? 0)}%
          </p>
        </div>
      )}

      {/* Amounts */}
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">Saved</span>
        <span className="text-foreground font-semibold">{fmt.format(savedAmount)}</span>
      </div>

      {!isJustSaving && goalAmount && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Goal</span>
          <span className="text-foreground font-semibold">{fmt.format(goalAmount)}</span>
        </div>
      )}

      {weeklyTarget !== null && weeklyTarget > 0 && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Save this week</span>
          <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{fmt.format(weeklyTarget)}</span>
        </div>
      )}

      {weeklyTarget === 0 && (
        <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>🎉 Goal reached!</p>
      )}

      {/* Expanded detail */}
      {isExpanded && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {targetDate && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target date</span>
              <span className="text-foreground">{dateFmt.format(new Date(targetDate))}</span>
            </div>
          )}
          {isJustSaving && (
            <p className="text-muted-foreground text-sm">Every penny counts 🐷</p>
          )}
        </div>
      )}
    </div>
  )
}
