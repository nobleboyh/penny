# Story 4.1: Penny Mood Engine & Avatar

Status: done

## Story

As a user,
I want Penny to display different mood states reflecting my financial activity,
so that the app feels alive and emotionally responsive.

## Acceptance Criteria

1. **Given** the app is running
   **When** Penny's mood state is evaluated
   **Then** `moodEngine(state)` in `features/penny/moodEngine.ts` is a pure function with no side effects

2. **And** it accepts: goal progress %, streak count, days since last log, recent transaction patterns

3. **And** it returns one of ≤10 mood states: `idle`, `happy`, `excited`, `sad`, `celebrating`, `worried`, `proud`, `neutral`, `thinking`, `disappointed`

4. **And** `PennyAvatar` renders the correct Lottie animation for each mood state

5. **And** `PennyAvatar` has size variants: `sm` (40px), `md` (80px), `lg` (160px)

6. **And** if Lottie fails to load, a 🐷 emoji fallback is shown

7. **And** `PennyAvatar` has `aria-label="Penny, your saving buddy"` and `role="img"`

8. **And** all animations respect `prefers-reduced-motion` (NFR18)

9. **And** mood state is stored in `pennyStore.currentMood` — components never call `moodEngine` directly

## Tasks / Subtasks

- [x] Create `moodEngine` pure function in `features/penny/moodEngine.ts` (AC: 1, 2, 3)
  - [x] Define `MoodEngineInput` interface: `{ progressPercent: number | null, streakCount: number, daysSinceLastLog: number, recentSpendingHigh: boolean }`
  - [x] Implement priority-ordered mood logic returning `MoodState`
  - [x] Ensure zero side effects — pure function only

- [x] Create `usePennyMood` hook in `features/penny/hooks/usePennyMood.ts` (AC: 9)
  - [x] Read `progressPercent` from `useGoalProgress()`
  - [x] Read `streakCount`, `lastLogDate` from `useStreakStore`
  - [x] Compute `daysSinceLastLog` from `lastLogDate`
  - [x] Call `moodEngine()` and write result to `pennyStore` via `setMood()`
  - [x] Return `currentMood` from `usePennyStore`

- [x] Update `PennyAvatar` component in `components/PennyAvatar/PennyAvatar.tsx` (AC: 4, 5, 6, 7, 8)
  - [x] Add per-mood Lottie animation map (use `lottie-react` `<Lottie>` component)
  - [x] Implement Lottie error/fallback: on load failure, render 🐷 emoji
  - [x] Ensure `role="img"` and `aria-label` default `"Penny, your saving buddy"` are present
  - [x] Wrap animation in `useReducedMotion()` check — static emoji fallback when true
  - [x] Preserve existing size variants: `sm` (40px), `md` (80px), `lg` (160px)

- [x] Export `moodEngine`, `usePennyMood` from `features/penny/index.ts` (AC: 9)

- [x] Add tests for `moodEngine` (AC: 1, 2, 3)
  - [x] Test: returns `idle` when no activity (progressPercent null, streak 0, daysSinceLastLog 0)
  - [x] Test: returns `excited` when streak ≥ 3 and progress ≥ 50%
  - [x] Test: returns `worried` when daysSinceLastLog ≥ 2
  - [x] Test: returns `celebrating` when progressPercent === 100
  - [x] Test: returns `proud` when progressPercent ≥ 75 and streak ≥ 1
  - [x] Test: returns `sad` when daysSinceLastLog ≥ 1 and streak === 0
  - [x] Test: pure function — same inputs always produce same output

- [x] Add tests for `PennyAvatar` (AC: 4, 5, 6, 7, 8)
  - [x] Test: renders `role="img"` and default `aria-label`
  - [x] Test: renders correct size for each variant (sm/md/lg)
  - [x] Test: renders emoji fallback when Lottie unavailable
  - [x] Test: reduced motion — no animation, static emoji shown

## Dev Notes

### Critical Context: `PennyAvatar` Already Exists

`penny/src/components/PennyAvatar/PennyAvatar.tsx` is already implemented with emoji-only rendering (no Lottie yet). It uses `framer-motion`'s `useReducedMotion` and `motion.div`. This story upgrades it to use Lottie per mood, with emoji as fallback.

**IMPORTANT:** `framer-motion` exports `useReducedMotion` — the project also has `hooks/useReducedMotion.ts` (a wrapper). Use `hooks/useReducedMotion.ts` for consistency with other components (e.g., `GoalCompletionCelebration`). Do NOT use `framer-motion`'s `useReducedMotion` directly in the updated component.

**Existing `PennyAvatar` props interface (preserve exactly):**
```typescript
interface Props {
  size?: 'sm' | 'md' | 'lg'
  mood?: MoodState
  'aria-label'?: string
}
```

### `moodEngine` Implementation

Create `penny/src/features/penny/moodEngine.ts`:

```typescript
import type { MoodState } from '../../store/pennyStore'

export interface MoodEngineInput {
  progressPercent: number | null  // 0–100, null if no goal set
  streakCount: number             // current streak days
  daysSinceLastLog: number        // 0 = logged today
  recentSpendingHigh: boolean     // true if last transaction was unusually large (future use, pass false for now)
}

export function moodEngine(input: MoodEngineInput): MoodState {
  const { progressPercent, streakCount, daysSinceLastLog, recentSpendingHigh } = input

  // Priority order: most specific/urgent first
  if (progressPercent !== null && progressPercent >= 100) return 'celebrating'
  if (daysSinceLastLog >= 2) return 'worried'
  if (daysSinceLastLog >= 1 && streakCount === 0) return 'sad'
  if (progressPercent !== null && progressPercent >= 75 && streakCount >= 1) return 'proud'
  if (streakCount >= 3 && progressPercent !== null && progressPercent >= 50) return 'excited'
  if (streakCount >= 1 && progressPercent !== null && progressPercent > 0) return 'happy'
  if (recentSpendingHigh) return 'thinking'
  if (progressPercent !== null && progressPercent > 0) return 'neutral'
  return 'idle'
}
```

**Rules:**
- Pure function — no imports from React, no side effects, no async
- `recentSpendingHigh` is wired for future use (Story 4.4) — callers pass `false` for now
- All 10 `MoodState` values are reachable (some via future stories: `disappointed` reserved for streak-break in Story 4.7)

### `usePennyMood` Hook

Create `penny/src/features/penny/hooks/usePennyMood.ts`:

```typescript
import { useEffect } from 'react'
import { useGoalProgress } from '../../goal'
import { useStreakStore } from '../../../store/streakStore'
import { usePennyStore } from '../../../store/pennyStore'
import { moodEngine } from '../moodEngine'

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 0
  const today = new Date().toISOString().slice(0, 10)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.max(0, Math.floor((new Date(today).getTime() - new Date(dateStr).getTime()) / msPerDay))
}

export function usePennyMood() {
  const { progressPercent } = useGoalProgress()
  const streakCount = useStreakStore(s => s.streakCount)
  const lastLogDate = useStreakStore(s => s.lastLogDate)
  const setMood = usePennyStore(s => s.setMood)
  const currentMood = usePennyStore(s => s.currentMood)

  useEffect(() => {
    const mood = moodEngine({
      progressPercent,
      streakCount,
      daysSinceLastLog: daysSince(lastLogDate),
      recentSpendingHigh: false,
    })
    setMood(mood)
  }, [progressPercent, streakCount, lastLogDate, setMood])

  return currentMood
}
```

**Note:** `useGoalProgress` is imported from `../../goal` (feature index), not directly from its file. This respects feature module boundaries.

### `PennyAvatar` Lottie Integration

**Lottie strategy:** `lottie-react` is already installed (`"lottie-react": "^2.4.1"`). Lottie animation JSON files should be placed in `penny/public/lottie/` (served as static assets). For this story, since actual Lottie JSON files may not exist yet, implement with a graceful fallback:

```typescript
import Lottie from 'lottie-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { MoodState } from '../../store/pennyStore'

// Lottie animation paths — files in /public/lottie/
const MOOD_LOTTIE: Partial<Record<MoodState, string>> = {
  idle: '/lottie/penny-idle.json',
  happy: '/lottie/penny-happy.json',
  excited: '/lottie/penny-excited.json',
  sad: '/lottie/penny-sad.json',
  celebrating: '/lottie/penny-celebrating.json',
  worried: '/lottie/penny-worried.json',
  proud: '/lottie/penny-proud.json',
  neutral: '/lottie/penny-neutral.json',
  thinking: '/lottie/penny-thinking.json',
  disappointed: '/lottie/penny-disappointed.json',
}

const MOOD_EMOJI: Record<MoodState, string> = {
  idle: '🐷', happy: '🐷', excited: '🐷', sad: '🐷', celebrating: '🐷',
  worried: '🐷', proud: '🐷', neutral: '🐷', thinking: '🐷', disappointed: '🐷',
}
```

**Fallback logic:** Use `useState` to track Lottie load failure. If `animationData` fetch fails (404 or network error), or if `reducedMotion` is true, render the emoji fallback. Use `useLottie` or the `<Lottie>` component's `onError` / `onDataFail` callback.

**Recommended implementation pattern:**
```typescript
function PennyAvatarLottie({ mood, px, fontSize }: { mood: MoodState; px: number; fontSize: number }) {
  const [failed, setFailed] = useState(false)
  const [animData, setAnimData] = useState<object | null>(null)

  useEffect(() => {
    setFailed(false)
    setAnimData(null)
    const path = MOOD_LOTTIE[mood]
    if (!path) { setFailed(true); return }
    fetch(path)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setAnimData)
      .catch(() => setFailed(true))
  }, [mood])

  if (failed || !animData) {
    return <span style={{ fontSize, lineHeight: 1 }}>{MOOD_EMOJI[mood]}</span>
  }
  return <Lottie animationData={animData} style={{ width: px, height: px }} loop autoplay />
}
```

**Full updated `PennyAvatar`:**
```typescript
export function PennyAvatar({ size = 'md', mood = 'idle', 'aria-label': ariaLabel = 'Penny, your saving buddy' }: Props) {
  const reducedMotion = useReducedMotion()
  const px = SIZE_PX[size]
  const fontSize = Math.round(px * 0.6)

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ width: px, height: px, fontSize }}
      className="relative flex items-center justify-center rounded-full"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.25) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      {reducedMotion ? (
        <span style={{ fontSize, lineHeight: 1 }}>{MOOD_EMOJI[mood]}</span>
      ) : (
        <PennyAvatarLottie mood={mood} px={px} fontSize={fontSize} />
      )}
    </div>
  )
}
```

**Note:** Remove `motion.div` from the outer wrapper — the Lottie component handles its own animation. The coral glow backdrop is preserved.

### `features/penny/index.ts`

Create `penny/src/features/penny/index.ts`:

```typescript
export { moodEngine } from './moodEngine'
export { usePennyMood } from './hooks/usePennyMood'
export type { MoodEngineInput } from './moodEngine'
export type { MoodState } from './types'
```

### Architecture Compliance

- `moodEngine` is a pure function in `features/penny/moodEngine.ts` — matches architecture spec exactly
- `usePennyMood` calls `moodEngine()` and writes to `pennyStore.setMood()` — components NEVER call `moodEngine` directly (architecture anti-pattern)
- `MoodState` type lives in `store/pennyStore.ts` (source of truth) — `features/penny/types.ts` re-exports it (already exists)
- `useGoalProgress` imported via `features/goal` index (not direct file import)
- `useReducedMotion` from `hooks/useReducedMotion.ts` — NOT from `framer-motion` directly
- `PennyAvatar` stays in `components/PennyAvatar/` (shared component, not feature-specific)

### Testing Pattern

Follow `useGoalCompletion.test.ts` mock pattern for `usePennyMood`:

```typescript
// usePennyMood.test.ts
vi.mock('../../goal', () => ({ useGoalProgress: vi.fn() }))
vi.mock('../../../store/streakStore', () => ({ useStreakStore: vi.fn((sel) => sel({ streakCount: 0, lastLogDate: null })) }))
vi.mock('../../../store/pennyStore', () => ({ usePennyStore: vi.fn((sel) => sel({ currentMood: 'idle', setMood: vi.fn() })) }))
vi.mock('../moodEngine', () => ({ moodEngine: vi.fn(() => 'happy') }))
```

For `PennyAvatar` tests, mock `lottie-react` and `fetch`:
```typescript
vi.mock('lottie-react', () => ({ default: () => <div data-testid="lottie" /> }))
vi.mock('../../hooks/useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }))
// Mock fetch to simulate Lottie load failure:
global.fetch = vi.fn(() => Promise.reject())
```

For `moodEngine` — no mocks needed, it's a pure function. Test directly.

### What NOT to Do

- Do NOT call `moodEngine()` from components — only `usePennyMood` calls it
- Do NOT set `pennyStore.currentMood` directly — always via `setMood()` action
- Do NOT add Lottie JSON files to `src/` — they go in `public/lottie/` (static assets)
- Do NOT use `framer-motion`'s `useReducedMotion` — use `hooks/useReducedMotion.ts`
- Do NOT implement `recentSpendingHigh` logic — pass `false` for now (Story 4.4 scope)
- Do NOT implement `disappointed` mood trigger — reserved for Story 4.7 (streak-break)
- Do NOT create a `features/penny/components/` folder — `PennyAvatar` stays in `components/PennyAvatar/`
- Do NOT use `console.error` — use `lib/logger.ts`

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/features/penny/moodEngine.ts` | CREATE: pure mood engine function |
| `penny/src/features/penny/moodEngine.test.ts` | CREATE: unit tests (pure function, no mocks) |
| `penny/src/features/penny/hooks/usePennyMood.ts` | CREATE: hook that calls moodEngine + writes to store |
| `penny/src/features/penny/hooks/usePennyMood.test.ts` | CREATE: hook tests |
| `penny/src/features/penny/index.ts` | CREATE: feature public API |
| `penny/src/components/PennyAvatar/PennyAvatar.tsx` | MODIFY: add Lottie per mood + emoji fallback |
| `penny/src/components/PennyAvatar/PennyAvatar.test.tsx` | CREATE: component tests |

### CSS Token Reference (from `globals.css`)

- `--color-primary`: `#FF6B6B` (coral) — glow backdrop color
- `--color-background`: `#0F0F14`

### References

- `penny/src/store/pennyStore.ts` — `MoodState` type, `usePennyStore`, `setMood` action
- `penny/src/store/streakStore.ts` — `streakCount`, `lastLogDate`
- `penny/src/store/goalStore.ts` — goal state shape
- `penny/src/features/goal/hooks/useGoalProgress.ts` — `progressPercent` source
- `penny/src/features/goal/index.ts` — import `useGoalProgress` from here
- `penny/src/features/penny/types.ts` — re-exports `MoodState` (already exists)
- `penny/src/components/PennyAvatar/PennyAvatar.tsx` — existing component to modify
- `penny/src/hooks/useReducedMotion.ts` — reduced motion hook
- `penny/src/features/goal/hooks/useGoalCompletion.test.ts` — test mock pattern to follow
- `_bmad-output/planning-artifacts/epics/epic-4-transaction-logging-penny-mascot.md#Story 4.1`
- `_bmad-output/planning-artifacts/architecture.md` — Penny Mood Engine section, Implementation Patterns

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

### Completion Notes List

- Implemented `moodEngine` as a pure function with priority-ordered mood logic covering all 10 MoodState values
- Created `usePennyMood` hook that reads from `useGoalProgress`, `useStreakStore`, writes to `pennyStore.setMood()` — components never call `moodEngine` directly
- Updated `PennyAvatar` to use `lottie-react` per mood with fetch-based loading; falls back to 🐷 emoji on fetch failure or 404; uses `hooks/useReducedMotion.ts` (not framer-motion's); removed `motion.div` outer wrapper
- Added `useGoalProgress` export to `features/goal/index.ts` (was missing)
- Created `features/penny/index.ts` as feature public API
- All 64 tests pass (10 moodEngine, 4 usePennyMood, 9 PennyAvatar, 41 regression)

### File List

- `penny/src/features/penny/moodEngine.ts` (created)
- `penny/src/features/penny/moodEngine.test.ts` (created)
- `penny/src/features/penny/hooks/usePennyMood.ts` (created)
- `penny/src/features/penny/hooks/usePennyMood.test.ts` (created)
- `penny/src/features/penny/index.ts` (created)
- `penny/src/components/PennyAvatar/PennyAvatar.tsx` (modified)
- `penny/src/components/PennyAvatar/PennyAvatar.test.tsx` (created)
- `penny/src/features/goal/index.ts` (modified — added `useGoalProgress` export)
