# Story 4.2: PennyChatInput — Natural Language Logging

Status: done

## Story

As a user,
I want to log a transaction by typing naturally to Penny,
so that logging feels like sending a text, not filling out a form.

## Acceptance Criteria

1. **Given** a user taps the Penny center tab
   **When** `PennyChatInput` opens
   **Then** a bottom sheet slides up with auto-focused text input

2. **And** the input has `aria-label="Tell Penny what you spent"`

3. **And** as the user types, `lib/nlp.ts` extracts amount and suggests a category with emoji in real-time

4. **And** `nlp.ts` handles formats: `"$6"`, `"6 dollars"`, `"spent 6"`, `"bubble tea $6"`

5. **And** `nlp.ts` returns `{ amount, category, emoji, confidence }`

6. **And** a single tap on the confirm button logs the transaction

7. **And** the sheet dismisses on confirm or swipe down

8. **And** the full flow from tap to confirmation completes in ≤5 seconds (NFR2)

9. **And** keyboard submit (Enter) triggers confirmation

## Tasks / Subtasks

- [x] Create `lib/nlp.ts` — client-side NLP parser (AC: 3, 4, 5)
  - [x] Regex amount extractor: handles `$6`, `6 dollars`, `spent 6`, `bubble tea $6`
  - [x] Keyword→category mapper: ≤20 rules, returns `{ amount, category, emoji, confidence }`
  - [x] Low confidence threshold: `confidence < 0.5` triggers fallback (used in Story 4.3)

- [x] Create `features/transactions/types.ts` (AC: 5)
  - [x] Define `NlpResult`: `{ amount: number | null, category: string, emoji: string, confidence: number }`
  - [x] Define `TransactionEntry`: `{ amount: number, category: string, emoji: string, note?: string, date: string }`

- [x] Create `features/transactions/hooks/useTransactionLog.ts` (AC: 6)
  - [x] Write to `db.pendingSync` first (offline-first — architecture requirement)
  - [x] Write to `db.transactions` (local history)
  - [x] Optimistic update: call `useGoalStore.updateSavedAmount(amount)` for instant progress update
  - [x] Update `streakStore.updateLastLogDate(today)` + `incrementStreak()` if first log today
  - [x] Attempt `PUT /statistics/{account}` via TanStack Query mutation (stub — full sync in Story 4.5)
  - [x] Return `{ logTransaction, isLogging }`

- [x] Create `features/transactions/index.ts` — public API exports (AC: all)

- [x] Create `components/PennyChatInput/PennyChatInput.tsx` (AC: 1, 2, 3, 6, 7, 8, 9)
  - [x] Bottom sheet using `components/ui/sheet.tsx` (`side="bottom"`)
  - [x] Auto-focus text input on open
  - [x] Real-time NLP parse preview as user types (debounced 300ms)
  - [x] Show parsed amount + category emoji below input
  - [x] Confirm button: disabled until `amount !== null`; triggers `logTransaction` then closes sheet
  - [x] Keyboard Enter submits (same as confirm button)
  - [x] Swipe down / backdrop tap dismisses (handled by Sheet primitive)

- [x] Create `components/PennyChatInput/index.ts` — re-export

- [x] Create `components/PennyChatInput/PennyChatInput.test.tsx` (AC: 1, 2, 3, 6, 7, 9)
  - [x] Test: sheet opens with auto-focused input
  - [x] Test: `aria-label="Tell Penny what you spent"` present
  - [x] Test: typing "bubble tea $6" shows parsed preview (amount: 6, emoji: 🧋)
  - [x] Test: confirm button disabled when no amount parsed
  - [x] Test: confirm button calls `logTransaction` and closes sheet
  - [x] Test: Enter key triggers confirmation
  - [x] Test: swipe/close dismisses sheet

- [x] Wire `PennyChatInput` into `BottomNav` Penny tab (AC: 1)
  - [x] `BottomNav` manages `isOpen` state for `PennyChatInput`
  - [x] Penny center tab tap opens `PennyChatInput` instead of navigating to `/home`

- [x] Create `lib/nlp.test.ts` (AC: 4, 5)
  - [x] Test: `"$6"` → `{ amount: 6, category: 'Other', emoji: '➕', confidence: 0.7 }`
  - [x] Test: `"6 dollars"` → amount: 6
  - [x] Test: `"spent 6"` → amount: 6
  - [x] Test: `"bubble tea $6"` → `{ amount: 6, category: 'Drinks', emoji: '🧋', confidence: 0.9 }`
  - [x] Test: `"lunch $12"` → `{ amount: 12, category: 'Food', emoji: '🍟', confidence: 0.9 }`
  - [x] Test: `"sneakers $80"` → `{ amount: 80, category: 'Shopping', emoji: '👟', confidence: 0.9 }`
  - [x] Test: `"game $15"` → `{ amount: 15, category: 'Fun', emoji: '🎮', confidence: 0.9 }`
  - [x] Test: `"xyz abc"` → `{ amount: null, confidence: 0 }`
  - [x] Test: pure function — same input always same output

## Dev Notes

### Critical: `lib/nlp.ts` Does NOT Exist Yet

`penny/src/lib/nlp.ts` is referenced in the architecture but has NOT been created. This story creates it. It is a pure client-side function — no API calls, no async.

**Implement `lib/nlp.ts`:**

```typescript
export interface NlpResult {
  amount: number | null
  category: string
  emoji: string
  confidence: number
}

// Category keyword rules — order matters (first match wins)
const CATEGORY_RULES: Array<{ keywords: string[]; category: string; emoji: string }> = [
  { keywords: ['bubble tea', 'boba', 'coffee', 'tea', 'drink', 'drinks', 'juice', 'soda', 'smoothie'], category: 'Drinks', emoji: '🧋' },
  { keywords: ['lunch', 'dinner', 'breakfast', 'food', 'meal', 'eat', 'pizza', 'burger', 'sushi', 'rice', 'noodle', 'snack', 'fries'], category: 'Food', emoji: '🍟' },
  { keywords: ['shoes', 'sneakers', 'shirt', 'clothes', 'shopping', 'buy', 'bought', 'store', 'mall', 'outfit', 'dress', 'pants'], category: 'Shopping', emoji: '👟' },
  { keywords: ['game', 'games', 'netflix', 'spotify', 'movie', 'cinema', 'fun', 'play', 'steam', 'app', 'subscription'], category: 'Fun', emoji: '🎮' },
]

// Amount extraction: handles "$6", "6 dollars", "spent 6", "bubble tea $6", "6.50"
const AMOUNT_REGEX = /\$\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)/i

export function parseTransaction(input: string): NlpResult {
  const lower = input.toLowerCase().trim()

  // Extract amount
  const match = lower.match(AMOUNT_REGEX)
  const amount = match ? parseFloat(match[1] ?? match[2]) : extractPlainNumber(lower)

  // Match category
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return { amount, category: rule.category, emoji: rule.emoji, confidence: amount !== null ? 0.9 : 0.4 }
    }
  }

  return {
    amount,
    category: 'Other',
    emoji: '➕',
    confidence: amount !== null ? 0.7 : 0,
  }
}

// Fallback: extract a bare number like "spent 6" or just "6"
function extractPlainNumber(lower: string): number | null {
  const match = lower.match(/(?:spent|paid|cost|costs?|for|got)\s+(\d+(?:\.\d{1,2})?)/)
    ?? lower.match(/^(\d+(?:\.\d{1,2})?)$/)
  return match ? parseFloat(match[1]) : null
}
```

**Rules:**
- Pure function — no imports from React, no side effects, no async
- `confidence < 0.5` = low confidence → Story 4.3 fallback form (pass `confidence` through, don't act on it here)
- Export `parseTransaction` (not `nlp`) — matches architecture spec `lib/nlp.ts`

---

### Critical: `features/transactions/` Does NOT Exist Yet

This story creates the `features/transactions/` module. Architecture spec:
```
features/transactions/
  index.ts
  types.ts
  api.ts          ← useUpdateStatistics (PUT /statistics/{account})
  hooks/
    useTransactionLog.ts
  components/
    TransactionHistory.tsx   ← Story 4.6
    CategoryPicker.tsx       ← Story 4.3
```
This story creates: `types.ts`, `hooks/useTransactionLog.ts`, `index.ts`.
Do NOT create `TransactionHistory.tsx` or `CategoryPicker.tsx` — those are Stories 4.6 and 4.3.

**`features/transactions/api.ts`** — create stub for `PUT /statistics/{account}`:

```typescript
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

interface StatisticsPayload {
  incomes: Array<{ title: string; amount: number; currency: string; period: string }>
  expenses: Array<{ title: string; amount: number; currency: string; period: string }>
  saving: { amount: number; currency: string; interest: number; deposit: boolean; capitalization: boolean }
}

export function useUpdateStatistics(accountName: string) {
  return useMutation({
    mutationFn: (data: StatisticsPayload) =>
      apiClient.put(`/statistics/${accountName}`, data),
  })
}
```

**`features/transactions/hooks/useTransactionLog.ts`:**

```typescript
import { useGoalStore } from '../../../store/goalStore'
import { useStreakStore } from '../../../store/streakStore'
import { db } from '../../../lib/db'
import type { NewTransaction } from '../../../lib/db'
import type { NlpResult } from '../types'

export function useTransactionLog() {
  const updateSavedAmount = useGoalStore(s => s.updateSavedAmount)
  const updateLastLogDate = useStreakStore(s => s.updateLastLogDate)
  const incrementStreak = useStreakStore(s => s.incrementStreak)
  const lastLogDate = useStreakStore(s => s.lastLogDate)

  async function logTransaction(parsed: NlpResult & { note?: string }) {
    if (parsed.amount === null) return

    const today = new Date().toISOString().slice(0, 10)
    const tx: NewTransaction = {
      amount: parsed.amount,
      category: parsed.category,
      emoji: parsed.emoji,
      note: parsed.note,
      date: today,
      createdAt: new Date().toISOString(),
    }

    // Offline-first: write to Dexie before anything else
    await db.transactions.add(tx)
    await db.pendingSync.add({ transactionData: tx, retryCount: 0, createdAt: tx.createdAt })

    // Optimistic update: goal progress updates instantly
    updateSavedAmount(parsed.amount)

    // Streak: increment only on first log of the day
    if (lastLogDate !== today) {
      updateLastLogDate(today)
      incrementStreak()
    }

    // Background sync stub — full implementation in Story 4.5
    // useOfflineSync will drain pendingSync on reconnect
  }

  return { logTransaction }
}
```

**Key rules:**
- Write to `db.pendingSync` BEFORE attempting any API call (architecture anti-pattern prevention)
- Optimistic update via `useGoalStore.updateSavedAmount` — goal progress bar updates instantly
- Streak increment only if `lastLogDate !== today` (prevents double-increment on same day)
- No API call in this story — full sync is Story 4.5. The `pendingSync` table is the queue.

---

### `PennyChatInput` Component

**Location:** `penny/src/components/PennyChatInput/PennyChatInput.tsx`

This is a **shared component** (not feature-specific) — it lives in `components/`, not `features/`.

**Uses `components/ui/sheet.tsx`** (already exists — `@radix-ui/react-dialog` based, `side="bottom"`).

**Props interface:**
```typescript
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Implementation sketch:**
```typescript
import { useState, useRef, useEffect } from 'react'
import { Sheet, SheetContent } from '../ui/sheet'
import { parseTransaction } from '../../lib/nlp'
import { useTransactionLog } from '../../features/transactions'
import type { NlpResult } from '../../features/transactions'

export function PennyChatInput({ open, onOpenChange }: Props) {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<NlpResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { logTransaction } = useTransactionLog()

  // Auto-focus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setInput('')
      setParsed(null)
    }
  }, [open])

  // Real-time parse (debounced 300ms)
  useEffect(() => {
    if (!input.trim()) { setParsed(null); return }
    const t = setTimeout(() => setParsed(parseTransaction(input)), 300)
    return () => clearTimeout(t)
  }, [input])

  async function handleConfirm() {
    if (!parsed || parsed.amount === null) return
    await logTransaction(parsed)
    onOpenChange(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleConfirm()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-6">
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

        {/* Real-time parse preview */}
        {parsed && parsed.amount !== null && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xl">{parsed.emoji}</span>
            <span>{parsed.category} · ${parsed.amount}</span>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!parsed || parsed.amount === null}
          className="mt-4 w-full min-h-[44px] rounded-2xl bg-primary font-bold text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Confirm transaction"
        >
          Log it ✓
        </button>
      </SheetContent>
    </Sheet>
  )
}
```

---

### Wiring `PennyChatInput` into `BottomNav`

The Penny center tab currently navigates to `/home`. It must instead open `PennyChatInput`.

**Current `BottomNav.tsx`** renders a `<NavLink to="/home">` for the Penny tab. Change this to a `<button>` that calls `onPennyTap()`.

**Two options — choose Option A (simpler):**

**Option A:** `BottomNav` owns `isOpen` state internally and renders `PennyChatInput` itself.

```typescript
// BottomNav.tsx
import { useState } from 'react'
import { PennyChatInput } from '../PennyChatInput'

export function BottomNav() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <>
      <nav ...>
        {TABS.map(tab =>
          'isPenny' in tab ? (
            <button
              key="penny"
              onClick={() => setChatOpen(true)}
              aria-label="Penny — log a transaction"
              className="flex flex-col items-center justify-center -mt-4 min-w-[44px] min-h-[44px]"
            >
              <PennyAvatar size="sm" mood="idle" />
            </button>
          ) : (
            // existing NavLink tabs unchanged
          )
        )}
      </nav>
      <PennyChatInput open={chatOpen} onOpenChange={setChatOpen} />
    </>
  )
}
```

**Do NOT** change the Penny tab to a `NavLink` to a new route — the UX spec says it opens a bottom sheet, not a page.

---

### Architecture Compliance

- `lib/nlp.ts` — pure function, no React imports, no side effects ✓
- `features/transactions/` — new feature module with `index.ts` public API ✓
- `PennyChatInput` in `components/` (shared) — not in `features/` ✓
- Cross-feature import: `PennyChatInput` imports `useTransactionLog` via `features/transactions` index ✓
- Offline-first: `db.pendingSync` written before any API call ✓
- Optimistic update: `updateSavedAmount` called immediately after Dexie write ✓
- No `navigator.onLine` check in components — sync handled by `useOfflineSync` (Story 4.5) ✓
- No `console.error` — `lib/logger.ts` does not exist yet; use `lib/utils.ts` or omit logging for now ✓

### What NOT to Do

- Do NOT create `CategoryPicker.tsx` — that's Story 4.3
- Do NOT create `PennyResponseBubble` — that's Story 4.4
- Do NOT implement the full offline sync drain — that's Story 4.5
- Do NOT create `TransactionHistory.tsx` — that's Story 4.6
- Do NOT call `moodEngine()` directly from `PennyChatInput` — mood recalculation is Story 4.4
- Do NOT add `recentSpendingHigh: true` logic to `moodEngine` — pass `false` (Story 4.4 scope)
- Do NOT navigate to a new route when Penny tab is tapped — open the bottom sheet
- Do NOT use `console.error` — `lib/logger.ts` doesn't exist yet; omit error logging for now
- Do NOT add `useUpdateStatistics` mutation call in `useTransactionLog` — full sync is Story 4.5

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/lib/nlp.ts` | CREATE: pure NLP parser |
| `penny/src/lib/nlp.test.ts` | CREATE: unit tests (pure function, no mocks) |
| `penny/src/features/transactions/types.ts` | CREATE: `NlpResult`, `TransactionEntry` types |
| `penny/src/features/transactions/api.ts` | CREATE: `useUpdateStatistics` stub |
| `penny/src/features/transactions/hooks/useTransactionLog.ts` | CREATE: offline-first log hook |
| `penny/src/features/transactions/index.ts` | CREATE: feature public API |
| `penny/src/components/PennyChatInput/PennyChatInput.tsx` | CREATE: bottom sheet NLP input |
| `penny/src/components/PennyChatInput/PennyChatInput.test.tsx` | CREATE: component tests |
| `penny/src/components/PennyChatInput/index.ts` | CREATE: re-export |
| `penny/src/components/BottomNav/BottomNav.tsx` | MODIFY: Penny tab opens chat sheet |

### CSS Token Reference

- `--color-surface-elevated`: `#242433` — bottom sheet background
- `--color-primary`: `#FF6B6B` — confirm button, focus ring
- `--color-border`: `#2E2E42`
- `--color-background`: `#0F0F14`

### References

- `penny/src/lib/db.ts` — `NewTransaction`, `PendingSync` types, `db.transactions`, `db.pendingSync`
- `penny/src/store/goalStore.ts` — `updateSavedAmount` action
- `penny/src/store/streakStore.ts` — `updateLastLogDate`, `incrementStreak`, `lastLogDate`
- `penny/src/components/ui/sheet.tsx` — `Sheet`, `SheetContent` (side="bottom")
- `penny/src/components/BottomNav/BottomNav.tsx` — Penny center tab to modify
- `penny/src/hooks/useOfflineSync.ts` — owns `navigator.onLine`; do NOT check online status in components
- `_bmad-output/planning-artifacts/epics/epic-4-transaction-logging-penny-mascot.md#Story 4.2`
- `_bmad-output/planning-artifacts/architecture.md` — NLP Parser section, Offline Persistence, Feature Module Structure
- `_bmad-output/planning-artifacts/ux-design-specification.md` — PennyChatInput component spec, Transaction Logging flow

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- 2026-04-09: Rechecked PennyChatInput bug where `Log it` stayed disabled after typing. Root cause: confirm enablement depended on the debounced `parsed` preview state, so valid input could remain blocked until the 300ms timer completed. Fixed by deriving immediate parse eligibility for submit/disabled state while keeping the preview debounced.

### Completion Notes List

- Created `lib/nlp.ts` as a pure function with regex amount extraction and keyword→category mapping (4 categories + Other fallback). `confidence < 0.5` signals low confidence for Story 4.3 fallback form.
- Created `features/transactions/` module: `types.ts`, `api.ts` (useUpdateStatistics stub), `hooks/useTransactionLog.ts` (offline-first: writes to Dexie `transactions` + `pendingSync` before optimistic store updates), `index.ts`.
- Created `components/PennyChatInput/` with bottom sheet (Radix Sheet `side="bottom"`), 300ms debounced NLP parse preview, disabled confirm until amount parsed, Enter key submit, auto-focus on open.
- Rechecked and fixed PennyChatInput confirm-state behavior: `Log it` now enables immediately when the current input parses to a valid amount, instead of waiting for the debounced preview state to settle. Added a regression test for immediate enablement before timer flush.
- Modified `BottomNav.tsx`: Penny center tab changed from `<NavLink to="/home">` to `<button>` that opens `PennyChatInput` via internal `chatOpen` state. Removed `/home` from TABS array (was only used for Penny tab).
- 80 tests pass, 0 regressions. 9 new nlp tests + 7 new PennyChatInput tests = 16 new tests.

### File List

- `penny/src/lib/nlp.ts` (created)
- `penny/src/lib/nlp.test.ts` (created)
- `penny/src/features/transactions/types.ts` (created)
- `penny/src/features/transactions/api.ts` (created)
- `penny/src/features/transactions/hooks/useTransactionLog.ts` (created)
- `penny/src/features/transactions/index.ts` (created)
- `penny/src/components/PennyChatInput/PennyChatInput.tsx` (created)
- `penny/src/components/PennyChatInput/PennyChatInput.test.tsx` (created)
- `penny/src/components/PennyChatInput/index.ts` (created)
- `penny/src/components/BottomNav/BottomNav.tsx` (modified)
