# Story 3.4: Goal Countdown Mode

Status: done

## Story

As a user,
I want a distinct visual experience when I'm close to my goal,
so that I feel the excitement and urgency of being nearly there.

## Acceptance Criteria

1. **Given** a user's saved amount is within a configurable threshold of their goal target (default: $30 or 90%)
   **When** the home screen renders
   **Then** `GoalProgressCard` enters countdown mode: glow intensifies, color shifts to `--accent` (mint green)

2. **And** `PennyAvatar` displays in `excited` mood state

3. **And** Penny's message references the specific remaining amount ("You're $18 away from AirPods! 🎧")

4. **And** the threshold value is configurable via a constant (not hardcoded inline)

5. **And** countdown mode is only shown for goals with a defined target amount (not "Just saving")

## Tasks / Subtasks

- [x] Create `useGoalCountdown` hook in `features/goal/hooks/useGoalCountdown.ts` (AC: 1, 4, 5)
  - [x] Export `COUNTDOWN_THRESHOLD_AMOUNT = 30` and `COUNTDOWN_THRESHOLD_PERCENT = 90` constants
  - [x] Return `isCountdown: boolean` — true only when `!isJustSaving && goalAmount !== null && (remaining <= COUNTDOWN_THRESHOLD_AMOUNT || progressPercent >= COUNTDOWN_THRESHOLD_PERCENT)`
  - [x] Return `remainingAmount: number | null` — `goalAmount - savedAmount` when goal is set, else null

- [x] Update `GoalProgressCard` to apply countdown visual styles (AC: 1)
  - [x] Import `useGoalCountdown` from `../../features/goal/hooks/useGoalCountdown`
  - [x] When `isCountdown`, shift progress bar fill and glow to `--color-accent` (mint green) instead of `--color-primary` (coral)
  - [x] When `isCountdown`, intensify glow: increase `glowSize` multiplier (e.g. `glowSize * 3` for outer shadow instead of `glowSize * 2`)
  - [x] Use `rgba(78,205,196,...)` for accent glow (mint green) — do NOT use `var(--color-accent)` inside `rgba()` — same pattern as existing coral glow

- [x] Update `GoalProgressCard` to show `PennyAvatar` in `excited` mood when `isCountdown` (AC: 2)
  - [x] Import `PennyAvatar` from `../../components/PennyAvatar`
  - [x] Render `<PennyAvatar size="md" mood="excited" />` in the card header area when `isCountdown`
  - [x] Only render when `isCountdown` — do not show PennyAvatar in normal goal mode

- [x] Update `GoalProgressCard` to show countdown Penny message (AC: 3)
  - [x] When `isCountdown && remainingAmount !== null && goalName`, render: `"You're ${fmt.format(remainingAmount)} away from ${goalName}! 🎯"`
  - [x] Place this message below the progress bar, above the amounts section
  - [x] Wrap in `<p role="status" aria-live="polite">` for screen reader announcement

- [x] Export `useGoalCountdown` from `features/goal/index.ts` (architecture compliance)

- [x] Add tests for `useGoalCountdown` hook (AC: 1, 4, 5)
  - [x] Test: returns `isCountdown: true` when remaining ≤ $30
  - [x] Test: returns `isCountdown: true` when progressPercent ≥ 90%
  - [x] Test: returns `isCountdown: false` when `isJustSaving: true`
  - [x] Test: returns `isCountdown: false` when `goalAmount: null`
  - [x] Test: returns `isCountdown: false` when well below threshold

- [x] Add tests for `GoalProgressCard` countdown mode (AC: 1, 2, 3)
  - [x] Test: countdown message renders when `isCountdown: true`
  - [x] Test: `PennyAvatar` renders when `isCountdown: true`
  - [x] Test: countdown message does NOT render when `isCountdown: false`

## Dev Notes

### `useGoalCountdown` Hook — Full Implementation

Create `penny/src/features/goal/hooks/useGoalCountdown.ts`:

```typescript
import { useGoalProgress } from './useGoalProgress'

export const COUNTDOWN_THRESHOLD_AMOUNT = 30   // $30 remaining
export const COUNTDOWN_THRESHOLD_PERCENT = 90  // 90% progress

export function useGoalCountdown() {
  const { goalAmount, savedAmount, progressPercent, isJustSaving } = useGoalProgress()

  if (isJustSaving || goalAmount === null) {
    return { isCountdown: false, remainingAmount: null }
  }

  const remaining = goalAmount - savedAmount
  const isCountdown =
    remaining <= COUNTDOWN_THRESHOLD_AMOUNT ||
    (progressPercent !== null && progressPercent >= COUNTDOWN_THRESHOLD_PERCENT)

  return {
    isCountdown,
    remainingAmount: remaining > 0 ? remaining : null,
  }
}
```

### `GoalProgressCard` Changes

**Imports to add:**
```typescript
import { useGoalCountdown } from '../../features/goal/hooks/useGoalCountdown'
import { PennyAvatar } from '../PennyAvatar'
```

**Hook call (add alongside existing hooks):**
```typescript
const { isCountdown, remainingAmount } = useGoalCountdown()
```

**Progress bar glow — countdown variant:**
```typescript
// Replace existing glowStyle with conditional:
const accentRgb = '78,205,196'  // mint green — matches --color-accent
const primaryRgb = '255,107,107' // coral — matches --color-primary
const glowRgb = isCountdown ? accentRgb : primaryRgb
const glowMultiplier = isCountdown ? 3 : 2  // intensify in countdown
const glowStyle: React.CSSProperties = {
  boxShadow: `0 0 ${glowSize}px rgba(${glowRgb},0.9), 0 0 ${glowSize * glowMultiplier}px rgba(${glowRgb},0.4)`,
  ...(reducedMotion ? {} : { transition: 'width 500ms ease, box-shadow 500ms ease' }),
}
```

**Progress bar fill color:**
```typescript
// In the progress bar div style:
backgroundColor: isCountdown ? 'var(--color-accent)' : 'var(--color-primary)',
```

**PennyAvatar + countdown message (insert after progress bar, before amounts):**
```tsx
{isCountdown && (
  <>
    <div className="flex justify-center mb-2">
      <PennyAvatar size="md" mood="excited" />
    </div>
    {remainingAmount !== null && goalName && (
      <p
        role="status"
        aria-live="polite"
        className="text-center text-sm font-semibold mb-3"
        style={{ color: 'var(--color-accent)' }}
      >
        You're {fmt.format(remainingAmount)} away from {goalName}! 🎯
      </p>
    )}
  </>
)}
```

### CSS Token Reference

From `globals.css` (established in Story 3.1):
- `--color-primary`: coral `rgb(255,107,107)` — normal goal progress
- `--color-accent`: mint green `rgb(78,205,196)` — countdown mode
- `--color-surface`, `--color-border`, `--color-foreground`, `--color-muted-foreground` — unchanged

**Critical:** Never use `var(--color-accent)` inside `rgba()` — CSS custom properties cannot be used as rgba arguments. Use the raw RGB values `78,205,196` as shown above. This is the same pattern already used for coral glow in the existing `glowStyle`.

### Architecture Compliance

- `useGoalCountdown` reads from `useGoalProgress` — no direct store access (single source of truth)
- `useGoalCountdown` exported via `features/goal/index.ts` (feature module boundary)
- `PennyAvatar` imported from `../../components/PennyAvatar` (shared component, correct path)
- No new routes, no new stores, no new pages
- `e.stopPropagation()` not needed on the new elements (they are not interactive)
- `lib/logger.ts` not needed (no async operations)

### Testing Pattern

Follow existing `GoalProgressCard.test.tsx` mock pattern. Add `useGoalCountdown` mock:

```typescript
vi.mock('../../features/goal/hooks/useGoalCountdown', () => ({
  useGoalCountdown: vi.fn(),
}))
import { useGoalCountdown } from '../../features/goal/hooks/useGoalCountdown'
const mockCountdown = useGoalCountdown as ReturnType<typeof vi.fn>

// In beforeEach, add default (non-countdown):
mockCountdown.mockReturnValue({ isCountdown: false, remainingAmount: null })

// Countdown test:
it('renders countdown message and PennyAvatar when isCountdown', () => {
  mockCountdown.mockReturnValue({ isCountdown: true, remainingAmount: 18 })
  render(<GoalProgressCard />)
  expect(screen.getByText(/you're \$18 away from airpods/i)).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /penny/i })).toBeInTheDocument()
})
```

For `useGoalCountdown` unit tests, mock `useGoalProgress`:
```typescript
vi.mock('./useGoalProgress', () => ({ useGoalProgress: vi.fn() }))
```

### What NOT to Do

- Do NOT implement goal completion celebration (Story 3.5)
- Do NOT add countdown mode for `isJustSaving` users (AC: 5)
- Do NOT hardcode `30` or `90` inline — use the exported constants
- Do NOT use `var(--color-accent)` inside `rgba()` — use raw RGB `78,205,196`
- Do NOT import `useGoalCountdown` directly from its file path in other features — use `features/goal` index
- Do NOT add `PennyAvatar` to the card in non-countdown mode
- Do NOT use `console.error` — use `lib/logger.ts`

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/features/goal/hooks/useGoalCountdown.ts` | CREATE: new hook with threshold constants |
| `penny/src/features/goal/index.ts` | ADD: export `useGoalCountdown` |
| `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` | MODIFY: countdown glow, PennyAvatar, message |
| `penny/src/components/GoalProgressCard/GoalProgressCard.test.tsx` | MODIFY: add countdown tests |
| `penny/src/features/goal/hooks/useGoalCountdown.test.ts` | CREATE: unit tests for hook |

### Acceptance Criteria Verification

| AC | Implementation |
|----|----------------|
| 1 — Glow intensifies, color shifts to accent | `isCountdown` flag drives `glowRgb` + `glowMultiplier` + bar `backgroundColor` |
| 2 — PennyAvatar in `excited` mood | `<PennyAvatar size="md" mood="excited" />` rendered when `isCountdown` |
| 3 — Penny message with remaining amount | `"You're ${fmt.format(remainingAmount)} away from ${goalName}! 🎯"` |
| 4 — Threshold configurable via constant | `COUNTDOWN_THRESHOLD_AMOUNT` + `COUNTDOWN_THRESHOLD_PERCENT` exported from hook file |
| 5 — Only for goals with defined target | `isJustSaving || goalAmount === null` → `isCountdown: false` |

### References

- `penny/src/features/goal/hooks/useGoalProgress.ts` — source of `progressPercent`, `savedAmount`, `goalAmount`, `isJustSaving`
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — existing glow pattern, `fmt`, `reducedMotion`
- `penny/src/components/PennyAvatar/PennyAvatar.tsx` — `mood` prop accepts `MoodState`, `excited` bounces
- `penny/src/store/pennyStore.ts` — `MoodState` type (includes `excited`)
- `_bmad-output/planning-artifacts/epics/epic-3-goal-management-home-screen.md#Story 3.4`
- `_bmad-output/planning-artifacts/architecture.md` — CSS token usage, anti-patterns, feature module boundaries
- `_bmad-output/implementation-artifacts/3-3-just-saving-goal-mode.md` — GoalProgressCard patterns, `e.stopPropagation`, `isJustSaving` guards

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

### Completion Notes List

- Created `useGoalCountdown` hook with `COUNTDOWN_THRESHOLD_AMOUNT=30` and `COUNTDOWN_THRESHOLD_PERCENT=90` exported constants
- Hook reads from `useGoalProgress` (no direct store access); returns `isCountdown` + `remainingAmount`
- `GoalProgressCard` updated: countdown shifts glow + fill to mint green (`rgba(78,205,196,...)`), intensifies outer glow multiplier to 3x
- `PennyAvatar` in `excited` mood rendered inside card only when `isCountdown`
- Countdown message `"You're $X away from [goalName]! 🎯"` with `role="status" aria-live="polite"`
- `useGoalCountdown` exported from `features/goal/index.ts`
- 25/25 tests pass, zero regressions (6 new hook tests + 3 new card tests)

### File List

- `penny/src/features/goal/hooks/useGoalCountdown.ts` — CREATED
- `penny/src/features/goal/hooks/useGoalCountdown.test.ts` — CREATED
- `penny/src/features/goal/index.ts` — MODIFIED: added `useGoalCountdown` export
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — MODIFIED: countdown glow, PennyAvatar, message
- `penny/src/components/GoalProgressCard/GoalProgressCard.test.tsx` — MODIFIED: added countdown mock + 3 tests

### Review Findings

- [x] [Review][Decision] Emoji in countdown message: spec example uses 🎧, implementation uses 🎯 — kept 🎯 (more appropriate for generic goal message)
- [x] [Review][Patch] RGB constants defined inside render — inlined directly into template literal [GoalProgressCard.tsx]
- [x] [Review][Patch] PennyAvatar excited mood not communicated to screen readers — added optional `aria-label` prop to PennyAvatar; countdown usage passes "Penny is excited — you're almost there!" [PennyAvatar.tsx, GoalProgressCard.tsx]
- [x] [Review][Patch] Missing card test for isCountdown:true + remainingAmount:null branch — added test [GoalProgressCard.test.tsx]
- [x] [Review][Defer] goalAmount===0 not guarded in hook [useGoalCountdown.ts] — deferred, pre-existing degenerate state in useGoalProgress
- [x] [Review][Defer] savedAmount > goalAmount shows excited Penny with no message — deferred, acceptable UX for goal-reached/exceeded state
- [x] [Review][Defer] Countdown block visible during isEditing — deferred, minor UX, out of scope for this story
- [x] [Review][Defer] Glow renders at 0% progress (glowSize=8) — deferred, pre-existing behavior not introduced here
