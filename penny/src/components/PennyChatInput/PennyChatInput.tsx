import { useState, useRef, useEffect } from 'react'
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet'
import { parseTransaction } from '../../lib/nlp'
import { useTransactionLog } from '../../features/transactions'
import type { NlpResult } from '../../features/transactions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PennyChatInput({ open, onOpenChange }: Props) {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<NlpResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { logTransaction, isLogging } = useTransactionLog()
  const immediateParsed = input.trim() ? parseTransaction(input) : null
  const canConfirm = immediateParsed?.amount !== null && immediateParsed !== null && !isLogging

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setInput('')
      setParsed(null)
    }
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    const t = setTimeout(() => {
      setParsed(input.trim() ? parseTransaction(input) : null)
    }, input.trim() ? 300 : 0)
    return () => clearTimeout(t)
  }, [input])

  async function handleConfirm() {
    if (!immediateParsed || immediateParsed.amount === null || isLogging) return
    await logTransaction(immediateParsed)
    handleOpenChange(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleConfirm()
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl px-4 pb-8 pt-6"
        style={{ backgroundColor: 'var(--color-surface-elevated)' }}
      >
        <SheetTitle className="sr-only">Log a transaction</SheetTitle>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Tell Penny what you spent"
          placeholder="e.g. bubble tea $6"
          className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
          autoComplete="off"
          autoCorrect="off"
        />

        {parsed && parsed.amount !== null && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <span className="text-xl" aria-hidden="true">{parsed.emoji}</span>
            <span>{parsed.category} · ${parsed.amount}</span>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="mt-4 w-full min-h-[44px] rounded-2xl bg-primary font-bold text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Confirm transaction"
        >
          {isLogging ? 'Logging...' : 'Log it ✓'}
        </button>
      </SheetContent>
    </Sheet>
  )
}
