# Story 3.5: Goal Completion Celebration & Re-engagement

Status: done

## Story

As a user,
I want a full-screen celebration when I reach my goal and an immediate prompt to set my next one,
so that the achievement feels rewarding and I stay engaged.

## Acceptance Criteria

1. **Given** a user logs a transaction that brings their total to or above their goal target
   **When** the update is processed
   **Then** a full-screen celebration overlay triggers: confetti animation + `PennyAvatar` (lg) in `celebrating` mood

2. **And** the overlay is unskippable for 2 seconds, then shows a dismiss CTA (UX-DR19)

3. **And** the overlay displays: goal name, total saved, days taken

4. **After dismissing**, a re-engagement screen asks "Ready for your next goal?" with a primary CTA "Set new goal"

5. **And** tapping "Set new goal" routes to the goal setup flow (Story 3.2) with a clean state

6. **And** tapping "Not yet" returns to the home screen with the completed goal shown

7. **And** all animations respect `prefers-reduced-motion` — reduced motion users see an instant state change with static celebration screen (NFR18)

## Tasks / Subtasks

- [x] Create `useGoalCompletion` hook in `features/goal/hooks/useGoalCompletion.ts` (AC: 1)
  - [x] Return `isComplete: boolean` — true when `!isJustSaving && goalAmount !== null && savedAmount >= goalAmount`
  - [x] Return `daysTaken: number | null` — calculated from `targetDate` or fallback to null if no date set
  - [x] Read from `useGoalProgress()` — no direct store access

- [x] Create `GoalCompletionCelebration` component in `features/goal/components/GoalCompletionCelebration.tsx` (AC: 1, 2, 3, 4, 5, 6, 7)
  - [x] Full-screen overlay: fixed position, z-index above all content, dark backdrop
  - [x] Phase 1 (celebration, 0–2s): confetti animation + `PennyAvatar` size="lg" mood="celebrating" + goal name + total saved + days taken
  - [x] Phase 2 (re-engagement, after 2s): dismiss CTA appears — "Woohoo! 🎉" button
  - [x] After dismiss: re-engagement screen — "Ready for your next goal?" + "Set new goal" (primary) + "Not yet" (secondary)
  - [x] "Set new goal": calls `resetGoal()` from `useGoalStore`, then `navigate('/onboarding/goal')`
  - [x] "Not yet": closes overlay (sets local `dismissed` state), home screen shows completed goal
  - [x] `prefers-reduced-motion`: skip confetti animation, show static celebration screen immediately with dismiss CTA visible from t=0

- [x] Implement confetti animation in `styles/animations.css` (AC: 1, 7)
  - [x] CSS keyframe confetti using `@keyframes` — colored dots/squares falling from top
  - [x] Wrap confetti render in `!reducedMotion` check in component

- [x] Integrate `GoalCompletionCelebration` into `pages/Home.tsx` (AC: 1)
  - [x] Import `useGoalCompletion` from `features/goal`
  - [x] Render `<GoalCompletionCelebration />` conditionally when `isComplete && !dismissed`
  - [x] `dismissed` state lives in `Home.tsx` — reset on mount (each app open re-evaluates)

- [x] Export `useGoalCompletion` and `GoalCompletionCelebration` from `features/goal/index.ts`

- [x] Add tests for `useGoalCompletion` hook (AC: 1)
  - [x] Test: `isComplete: true` when `savedAmount >= goalAmount` and not just saving
  - [x] Test: `isComplete: false` when `isJustSaving: true`
  - [x] Test: `isComplete: false` when `goalAmount: null`
  - [x] Test: `isComplete: false` when `savedAmount < goalAmount`

- [x] Add tests for `GoalCompletionCelebration` component (AC: 2, 3, 4, 5, 6, 7)
  - [x] Test: overlay renders with goal name, saved amount, days taken
  - [x] Test: dismiss CTA not visible at t=0 (unskippable phase)
  - [x] Test: dismiss CTA visible after 2s (use `vi.useFakeTimers`)
  - [x] Test: re-engagement screen shows after dismiss
  - [x] Test: "Set new goal" calls `resetGoal` and navigates to `/onboarding/goal`
  - [x] Test: "Not yet" closes overlay
  - [x] Test: reduced motion — dismiss CTA visible immediately (no 2s wait)

## Dev Notes

### `useGoalCompletion` Hook

Create `penny/src/features/goal/hooks/useGoalCompletion.ts`:

```typescript
import { useGoalProgress } from './useGoalProgress'

export function useGoalCompletion() {
  const { goalAmount, savedAmount, isJustSaving, targetDate } = useGoalProgress()

  if (isJustSaving || goalAmount === null) {
    return { isComplete: false, daysTaken: null }
  }

  const isComplete = savedAmount >= goalAmount

  let daysTaken: number | null = null
  if (isComplete && targetDate) {
    const msPerDay = 24 * 60 * 60 * 1000
    daysTaken = Math.max(1, Math.round((Date.now() - new Date(targetDate).getTime()) / msPerDay))
    // Note: daysTaken from targetDate is approximate — Story 3.5 scope only
  }

  return { isComplete, daysTaken }
}
```

**Note:** `daysTaken` is a best-effort calculation. The AC says "days taken" but the backend doesn't store goal creation date. Use `targetDate` as a proxy (days since target date was set). If `targetDate` is null, `daysTaken` is null and the overlay omits that field gracefully.

### `GoalCompletionCelebration` Component

Create `penny/src/features/goal/components/GoalCompletionCelebration.tsx`:

**Key implementation details:**

```typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useGoalProgress } from '../hooks/useGoalProgress'
import { useGoalStore } from '../../../store/goalStore'
import { PennyAvatar } from '../../../components/PennyAvatar'

interface Props {
  onDismiss: () => void
}

export function GoalCompletionCelebration({ onDismiss }: Props) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const { goalName, savedAmount, goalAmount } = useGoalProgress()
  const resetGoal = useGoalStore(s => s.resetGoal)
  const [phase, setPhase] = useState<'celebration' | 're-engagement'>('celebration')
  const [canDismiss, setCanDismiss] = useState(reducedMotion) // reduced motion: skip wait

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  useEffect(() => {
    if (reducedMotion) return
    const timer = setTimeout(() => setCanDismiss(true), 2000)
    return () => clearTimeout(timer)
  }, [reducedMotion])

  const handleDismiss = () => setPhase('re-engagement')

  const handleSetNewGoal = () => {
    resetGoal()
    navigate('/onboarding/goal')
  }

  // ... render
}
```

**Overlay structure:**
```tsx
// Full-screen overlay
<div
  role="dialog"
  aria-modal="true"
  aria-label="Goal achieved!"
  className="fixed inset-0 z-50 flex flex-col items-center justify-center"
  style={{ backgroundColor: 'rgba(15,15,20,0.97)' }}
>
  {phase === 'celebration' ? (
    <>
      {/* Confetti — skip if reducedMotion */}
      {!reducedMotion && <div className="confetti-container" aria-hidden="true" />}

      <PennyAvatar size="lg" mood="celebrating" aria-label="Penny is celebrating your achievement!" />

      <h1 className="text-display font-bold text-center mt-4" style={{ color: 'var(--color-primary)' }}>
        YOU DID IT! 🏆
      </h1>
      <p className="text-lg font-semibold text-center mt-2" style={{ color: 'var(--color-foreground)' }}>
        {goalName} — ACHIEVED
      </p>
      <p className="text-muted-foreground text-center mt-1">
        {fmt.format(savedAmount)} saved
        {daysTaken !== null && ` · ${daysTaken} days`}
      </p>

      {canDismiss && (
        <button
          onClick={handleDismiss}
          className="mt-8 min-h-[44px] px-8 rounded-2xl font-bold text-lg"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          aria-label="Continue"
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
      <p className="text-muted-foreground text-center mt-2 text-sm">
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
        className="mt-3 w-full max-w-xs min-h-[44px] rounded-2xl border font-semibold text-muted-foreground"
        style={{ borderColor: 'var(--color-border)' }}
      >
        Not yet
      </button>
    </>
  )}
</div>
```

### Confetti CSS

Add to `penny/src/styles/animations.css`:

```css
/* Confetti particles — goal completion celebration */
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 51;
}

.confetti-container::before,
.confetti-container::after {
  content: '🎊 🎉 ✨ 🌟 💫';
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  font-size: 1.5rem;
  animation: confetti-fall 3s linear infinite;
  letter-spacing: 2rem;
}

.confetti-container::after {
  animation-delay: 1.5s;
  left: 2rem;
}

@keyframes confetti-fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
```

**Note:** This is a lightweight CSS-only confetti. No new library needed. Framer Motion is available if richer animation is desired — use `motion.div` with `animate={{ y: ['−20px', '100vh'] }}` as an alternative.

### Home.tsx Integration

```tsx
// penny/src/pages/Home.tsx
import { useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { GoalProgressCard } from '../components/GoalProgressCard'
import { useGoalCompletion } from '../features/goal'
import { GoalCompletionCelebration } from '../features/goal'

export function Home() {
  const { isComplete } = useGoalCompletion()
  const [celebrationDismissed, setCelebrationDismissed] = useState(false)

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-start bg-background pt-8 pb-20 px-4">
        <GoalProgressCard />
      </main>
      <BottomNav />
      {isComplete && !celebrationDismissed && (
        <GoalCompletionCelebration onDismiss={() => setCelebrationDismissed(true)} />
      )}
    </>
  )
}
```

**Important:** `celebrationDismissed` is local state — resets on every mount. This means if the user refreshes while goal is complete, the celebration shows again. This is acceptable for v1 (goal completion is a rare event). A `sessionStorage` flag could prevent repeat shows but is out of scope.

### Architecture Compliance

- `useGoalCompletion` reads from `useGoalProgress` — no direct store access (single source of truth)
- `GoalCompletionCelebration` accesses `useGoalStore` directly only for `resetGoal` action (write operation, acceptable)
- Both exported via `features/goal/index.ts` (feature module boundary)
- `PennyAvatar` imported from `../../../components/PennyAvatar` (shared component, correct relative path from `features/goal/components/`)
- `useReducedMotion` from `../../../hooks/useReducedMotion`
- `useNavigate` from `react-router-dom` — already a project dependency
- No new routes added — "Set new goal" reuses existing `/onboarding/goal` route
- No new stores, no new pages
- `role="dialog"` + `aria-modal="true"` for overlay accessibility (UX spec: focus trapped, Escape/Enter to dismiss after 2s)

### CSS Token Reference

From `globals.css`:
- `--color-primary`: coral `#FF6B6B` — celebration CTA, achievement text
- `--color-primary-foreground`: `#FFFFFF`
- `--color-foreground`: `#F9FAFB`
- `--color-muted-foreground`: `#9CA3AF`
- `--color-surface`: `#1A1A24`
- `--color-border`: `#2E2E42`
- `--color-background`: `#0F0F14`

**Note:** `--color-accent` is `#34D399` (mint green) — NOT `rgb(78,205,196)` as used in Story 3.4. The globals.css was updated. Use `var(--color-accent)` for display text, not for rgba glow (same rule as Story 3.4: never use CSS vars inside `rgba()`).

### Testing Pattern

Follow `GoalProgressCard.test.tsx` mock pattern. For `GoalCompletionCelebration`:

```typescript
// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}))
vi.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}))
vi.mock('../hooks/useGoalProgress', () => ({
  useGoalProgress: vi.fn(),
}))
vi.mock('../../../store/goalStore', () => ({
  useGoalStore: vi.fn((selector) => selector({
    resetGoal: vi.fn(),
  })),
}))
vi.mock('../../../components/PennyAvatar', () => ({
  PennyAvatar: ({ mood, 'aria-label': ariaLabel }: { mood: string; 'aria-label'?: string }) => (
    <div role="img" aria-label={ariaLabel ?? 'Penny'} data-mood={mood} />
  ),
}))

// Timer test for 2s unskippable:
it('dismiss CTA not visible before 2s', () => {
  vi.useFakeTimers()
  render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
  expect(screen.queryByRole('button', { name: /woohoo/i })).not.toBeInTheDocument()
  vi.useRealTimers()
})

it('dismiss CTA visible after 2s', async () => {
  vi.useFakeTimers()
  render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
  act(() => { vi.advanceTimersByTime(2000) })
  expect(screen.getByRole('button', { name: /woohoo/i })).toBeInTheDocument()
  vi.useRealTimers()
})

// Reduced motion: dismiss CTA visible immediately
it('reduced motion: dismiss CTA visible immediately', () => {
  mockReducedMotion.mockReturnValue(true)
  render(<GoalCompletionCelebration onDismiss={vi.fn()} />)
  expect(screen.getByRole('button', { name: /woohoo/i })).toBeInTheDocument()
})
```

For `useGoalCompletion` unit tests, mock `useGoalProgress`:
```typescript
vi.mock('./useGoalProgress', () => ({ useGoalProgress: vi.fn() }))
```

### What NOT to Do

- Do NOT implement Saver Level Up animation (Epic 7 scope — UX spec mentions it but it's not in Story 3.5 AC)
- Do NOT implement shareable card generation (Epic 6 scope)
- Do NOT add a new route for the celebration — it's an overlay on `/home`
- Do NOT persist `celebrationDismissed` to localStorage — local state is sufficient for v1
- Do NOT use `console.error` — use `lib/logger.ts`
- Do NOT import `GoalCompletionCelebration` directly from its file path in other features — use `features/goal` index
- Do NOT call `moodEngine()` — Penny mood in this overlay is hardcoded to `celebrating`/`happy` (overlay is self-contained, not driven by global mood engine)
- Do NOT add `GoalProgressCard` countdown mode logic here — that's Story 3.4 (done)

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/features/goal/hooks/useGoalCompletion.ts` | CREATE: new hook |
| `penny/src/features/goal/hooks/useGoalCompletion.test.ts` | CREATE: unit tests |
| `penny/src/features/goal/components/GoalCompletionCelebration.tsx` | CREATE: overlay component |
| `penny/src/features/goal/components/GoalCompletionCelebration.test.tsx` | CREATE: component tests |
| `penny/src/features/goal/index.ts` | ADD: export `useGoalCompletion`, `GoalCompletionCelebration` |
| `penny/src/pages/Home.tsx` | MODIFY: add `useGoalCompletion` + conditional overlay render |
| `penny/src/styles/animations.css` | ADD: confetti keyframes (create file if not exists) |

### Acceptance Criteria Verification

| AC | Implementation |
|----|----------------|
| 1 — Full-screen overlay: confetti + PennyAvatar celebrating | `GoalCompletionCelebration` fixed overlay, confetti CSS, `<PennyAvatar size="lg" mood="celebrating" />` |
| 2 — Unskippable 2s, then dismiss CTA | `canDismiss` state, `setTimeout(2000)`, `reducedMotion` bypasses wait |
| 3 — Overlay shows goal name, total saved, days taken | Rendered from `useGoalProgress()` + `daysTaken` calc |
| 4 — Re-engagement screen after dismiss | `phase` state: `'celebration'` → `'re-engagement'` on dismiss |
| 5 — "Set new goal" → clean state → goal setup | `resetGoal()` + `navigate('/onboarding/goal')` |
| 6 — "Not yet" → home with completed goal | `onDismiss()` closes overlay, `GoalProgressCard` still shows completed state |
| 7 — Reduced motion: instant static screen | `reducedMotion` → `canDismiss: true` from t=0, no confetti rendered |

### References

- `penny/src/features/goal/hooks/useGoalProgress.ts` — source of `goalAmount`, `savedAmount`, `goalName`, `isJustSaving`, `targetDate`
- `penny/src/store/goalStore.ts` — `resetGoal()` action
- `penny/src/components/PennyAvatar/PennyAvatar.tsx` — `size="lg"` is 160px, `mood="celebrating"` bounces
- `penny/src/store/pennyStore.ts` — `MoodState` type (includes `celebrating`)
- `penny/src/hooks/useReducedMotion.ts` — `useReducedMotion()` hook
- `penny/src/App.tsx` — `/onboarding/goal` route exists (`<Route path="/onboarding/goal" element={<OnboardingFlow />} />`)
- `penny/src/pages/Home.tsx` — current Home page to modify
- `penny/src/styles/globals.css` — CSS token values
- `_bmad-output/planning-artifacts/epics/epic-3-goal-management-home-screen.md#Story 3.5`
- `_bmad-output/planning-artifacts/ux-design-specification.md` — Journey 4: Goal Completion Celebration (lines 506–527), full-screen overlay rules (line 673, 707), reduced motion (line 782)
- `_bmad-output/implementation-artifacts/3-4-goal-countdown-mode.md` — GoalProgressCard patterns, `useGoalProgress` usage, `PennyAvatar` import path, test mock patterns

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

### Completion Notes List

- Created `useGoalCompletion` hook — reads from `useGoalProgress`, returns `isComplete` (savedAmount >= goalAmount, not just saving) and `daysTaken` (best-effort from targetDate)
- Created `GoalCompletionCelebration` component — full-screen overlay with 2-phase flow: celebration (unskippable 2s) → re-engagement
- Confetti via CSS-only `animations.css` keyframes — no new library; skipped when `reducedMotion`
- `canDismiss` initialized to `reducedMotion` value — reduced motion users see dismiss CTA immediately
- "Set new goal" calls `resetGoal()` + `navigate('/onboarding/goal')`; "Not yet" calls `onDismiss` prop
- `Home.tsx` updated: `useGoalCompletion` drives conditional overlay render with local `celebrationDismissed` state
- `animations.css` imported in `main.tsx`
- Both `useGoalCompletion` and `GoalCompletionCelebration` exported from `features/goal/index.ts`
- 41/41 tests pass, zero regressions (7 new hook tests + 8 new component tests)

### File List

- `penny/src/features/goal/hooks/useGoalCompletion.ts` — CREATED
- `penny/src/features/goal/hooks/useGoalCompletion.test.ts` — CREATED
- `penny/src/features/goal/components/GoalCompletionCelebration.tsx` — CREATED
- `penny/src/features/goal/components/GoalCompletionCelebration.test.tsx` — CREATED
- `penny/src/features/goal/index.ts` — MODIFIED: added exports for `useGoalCompletion`, `GoalCompletionCelebration`
- `penny/src/pages/Home.tsx` — MODIFIED: added celebration overlay integration
- `penny/src/styles/animations.css` — CREATED: confetti keyframes
- `penny/src/main.tsx` — MODIFIED: import `animations.css`
