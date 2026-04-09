import { useState } from 'react'

interface Props {
  goalName: string
  onNext: (amount: number) => void
}

export function GoalAmountInput({ goalName, onNext }: Props) {
  const [value, setValue] = useState('')

  const amount = parseFloat(value)
  const isValid = !isNaN(amount) && amount > 0

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          How much does it cost?
        </h1>
        <p className="text-muted-foreground text-center text-sm">{goalName}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-4xl font-bold text-muted-foreground">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
          placeholder="0"
          className="w-40 bg-transparent text-center text-5xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
          aria-label="Goal amount in dollars"
          autoFocus
        />
      </div>

      <button
        onClick={() => isValid && onNext(amount)}
        disabled={!isValid}
        className="w-full min-h-[56px] rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground text-lg transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  )
}
