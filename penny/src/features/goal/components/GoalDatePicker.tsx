import { useState, useMemo } from 'react'

interface Props {
  goalName: string
  goalAmount: number
  onNext: (targetDate: string, weeklyTarget: number) => void
}

function addMonths(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function calcWeeklyTarget(goalAmount: number, targetDate: string): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const [y, m, d] = targetDate.split('-').map(Number)
  const weeks = Math.max(1, Math.ceil((new Date(y, m - 1, d).getTime() - Date.now()) / msPerWeek))
  return Math.ceil(goalAmount / weeks)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(new Date(iso))
}

const QUICK_OPTIONS = [
  { label: '1 month', months: 1 },
  { label: '3 months', months: 3 },
  { label: '6 months', months: 6 },
]

export function GoalDatePicker({ goalName, goalAmount, onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  // Memoized so dates don't shift on re-render (prevents active-state loss near month boundary)
  const quickDates = useMemo(
    () => QUICK_OPTIONS.map((o) => ({ ...o, date: addMonths(o.months) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const weeklyTarget = selected ? calcWeeklyTarget(goalAmount, selected) : null

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">When do you want it by?</h1>
        <p className="text-muted-foreground text-center text-sm">{goalName}</p>
      </div>

      <div className="flex flex-col gap-3">
        {quickDates.map(({ label, date }) => {
          const isActive = selected === date
          return (
            <button
              key={label}
              onClick={() => { setSelected(date); setShowCustom(false) }}
              className={`w-full min-h-[56px] rounded-2xl border px-6 py-4 font-semibold text-base transition-all ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(255,107,107,0.3)]'
                  : 'border-border bg-surface text-foreground hover:border-primary/50'
              }`}
            >
              {label}
            </button>
          )
        })}

        <button
          onClick={() => { setShowCustom(true); setSelected(null) }}
          className={`w-full min-h-[56px] rounded-2xl border px-6 py-4 font-semibold text-base transition-all ${
            showCustom
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-surface text-foreground hover:border-primary/50'
          }`}
        >
          Custom 📅
        </button>

        {showCustom && (
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelected(e.target.value || null)}
            className="w-full min-h-[56px] rounded-2xl border border-border bg-surface px-6 py-4 text-foreground text-base outline-none focus:border-primary"
            aria-label="Custom target date"
            autoFocus
          />
        )}
      </div>

      {selected && weeklyTarget !== null && (
        <div className="rounded-2xl bg-surface border border-accent/30 px-6 py-4 text-center">
          <p className="text-accent font-bold text-lg">Save ${weeklyTarget}/week</p>
          <p className="text-muted-foreground text-sm mt-1">
            → {goalName} by {formatDate(selected)} 🎯
          </p>
        </div>
      )}

      <button
        onClick={() => selected && weeklyTarget !== null && onNext(selected, weeklyTarget)}
        disabled={!selected}
        className="w-full min-h-[56px] rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground text-lg transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  )
}
