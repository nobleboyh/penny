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
        <h1 className="text-2xl font-headline font-bold text-foreground text-center mb-2">
          How much do you need?
        </h1>
        <p className="text-muted-foreground text-center text-sm">{goalName}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-primary font-headline font-black text-2xl">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
          placeholder="0"
          className="w-40 bg-transparent text-center font-headline font-extrabold text-2xl text-foreground outline-none placeholder:text-muted-foreground/40 rounded-xl border border-outline-variant px-4 py-3"
          aria-label="Goal amount in dollars"
          autoFocus
        />
      </div>

      <button
        onClick={() => isValid && onNext(amount)}
        disabled={!isValid}
        className="w-full min-h-[56px] bg-gradient-to-r from-primary to-primary-container text-white rounded-full py-3 px-6 font-headline font-extrabold text-lg transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  )
}
