# Story 3.1: GoalProgressCard — Home Screen Hero

Status: done

## Story

As a user,
I want to see my goal progress on the home screen without any navigation,
so that I can check my progress at a glance every time I open the app.

## Acceptance Criteria

1. **Given** a user has an active goal
   **When** they open the home screen
   **Then** `GoalProgressCard` is visible without any navigation or taps

2. **And** the card shows: goal name, goal emoji, progress bar, amount saved, total target, and weekly saving target

3. **And** the progress bar has a neon glow effect (coral `box-shadow`) that intensifies as percentage increases (UX-DR5)

4. **And** the progress bar has `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` (UX-DR7)

5. **And** tapping the card expands to a full goal detail view

6. **And** goal data is fetched via `GET /accounts/current` through TanStack Query

## Tasks / Subtasks

- [x] Create `useCurrentAccount` TanStack Query hook in `penny/src/features/goal/api.ts` (AC: 6)
  - [x] `useQuery({ queryKey: ['accounts', 'current'], queryFn: () => apiClient.get('/accounts/current') })`
  - [x] Return `{ data, isLoading, isError }` — no custom wrapper

- [x] Create `useGoalProgress` hook in `penny/src/features/goal/hooks/useGoalProgress.ts` (AC: 2, 3)
  - [x] Read `goalAmount`, `savedAmount`, `targetDate`, `isJustSaving`, `goalName` from `useGoalStore`
  - [x] Compute `progressPercent = goalAmount ? Math.min((savedAmount / goalAmount) * 100, 100) : null`
  - [x] Compute `weeklyTarget`: `(goalAmount - savedAmount) / weeksUntilTarget` — null if no targetDate or isJustSaving
  - [x] Return `{ progressPercent, weeklyTarget, isJustSaving, goalName, goalAmount, savedAmount }`

- [x] Create `GoalProgressCard` component in `penny/src/components/GoalProgressCard/` (AC: 1–5)
  - [x] Create `penny/src/components/GoalProgressCard/GoalProgressCard.tsx`
  - [x] Create `penny/src/components/GoalProgressCard/index.ts` (re-export only)
  - [x] Create `penny/src/components/GoalProgressCard/GoalProgressCard.test.tsx`
  - [x] Progress bar: use shadcn `<Progress>` as base, override with neon glow via inline `style` prop
  - [x] Glow intensity: `box-shadow: 0 0 ${8 + progressPercent * 0.16}px var(--color-primary)` (scales 8px→24px at 100%)
  - [x] `role="progressbar"` with `aria-valuenow={progressPercent}` `aria-valuemin={0}` `aria-valuemax={100}`
  - [x] Tap-to-expand: `useState(false)` for `isExpanded` — show detail view inline (no routing needed for this story)
  - [x] Skeleton loading state while `isLoading` from `useCurrentAccount`
  - [x] "Just saving" variant: show total saved, no progress bar, no target

- [x] Export `GoalProgressCard` from `penny/src/components/GoalProgressCard/index.ts`

- [x] Replace placeholder content in `penny/src/pages/Home.tsx` with `GoalProgressCard` (AC: 1)
  - [x] Remove the `PennyAvatar` + message div placeholder
  - [x] Render `<GoalProgressCard />` as the home screen hero
  - [x] Keep `<main>` semantic wrapper and `<BottomNav />` sibling structure

- [x] Export `useCurrentAccount` from `penny/src/features/goal/index.ts`

## Dev Notes

### What Exists — Do NOT Recreate

- `penny/src/store/goalStore.ts` — `goalName`, `goalAmount`, `savedAmount`, `targetDate`, `isJustSaving`, `_hasHydrated` — use selectors, never import store directly
- `penny/src/lib/api.ts` — `apiClient` (axios, Bearer token interceptor) + `queryClient`
- `penny/src/features/goal/api.ts` — `useUpdateAccount` already exists — ADD `useCurrentAccount` to this file, do NOT replace
- `penny/src/features/goal/index.ts` — already exports `useUpdateAccount` — ADD `useCurrentAccount` export
- `penny/src/components/ui/progress.tsx` — shadcn `<Progress>` base component — use as base for the progress bar
- `penny/src/pages/Home.tsx` — `<main>` + `<BottomNav />` sibling structure — preserve this, only replace inner content
- `penny/src/features/auth/components/AuthGuard.tsx` — already wraps `/home` in `App.tsx` — no change needed

### GoalProgressCard Component Structure

Architecture mandates folder structure for components with tests:
```
penny/src/components/GoalProgressCard/
  index.ts              ← re-export only: export { GoalProgressCard } from './GoalProgressCard'
  GoalProgressCard.tsx  ← implementation
  GoalProgressCard.test.tsx
```

### Neon Glow Implementation

The glow must intensify as progress increases (UX-DR5). Use inline `style` on the progress bar element — NOT a Tailwind class (dynamic values can't be purged safely):

```tsx
// Glow scales from 8px (0%) to 24px (100%)
const glowSize = 8 + (progressPercent ?? 0) * 0.16
const glowStyle = {
  boxShadow: `0 0 ${glowSize}px var(--color-primary), 0 0 ${glowSize * 2}px var(--color-primary)40`
}
```

Apply `glowStyle` to the progress bar fill element (the inner div of shadcn `<Progress>`). The shadcn `<Progress>` component in `penny/src/components/ui/progress.tsx` renders a `<div>` with a child indicator div — pass `style` via the `indicatorStyle` prop pattern or wrap with a custom div.

### Weekly Target Calculation

```typescript
// useGoalProgress.ts
function weeksUntil(targetDate: string): number {
  const now = new Date()
  const target = new Date(targetDate)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  return Math.max(1, Math.ceil((target.getTime() - now.getTime()) / msPerWeek))
}
```

- If `isJustSaving` or no `targetDate` or no `goalAmount` → `weeklyTarget = null`
- If `savedAmount >= goalAmount` → `weeklyTarget = 0` (goal reached)
- Format as currency: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(weeklyTarget)`

### TanStack Query Key Pattern

Per architecture: `['accounts', 'current']` — mirrors the endpoint path `/accounts/current`.

```typescript
// penny/src/features/goal/api.ts — ADD this, keep useUpdateAccount
export function useCurrentAccount() {
  return useQuery({
    queryKey: ['accounts', 'current'],
    queryFn: () => apiClient.get<AccountResponse>('/accounts/current').then(r => r.data),
  })
}
```

The `AccountResponse` type should be added to `penny/src/features/goal/types.ts`. The PiggyMetrics `/accounts/current` response shape (from wiki):
```typescript
interface AccountResponse {
  name: string
  incomes: Item[]
  expenses: Item[]
  saving: { amount: number; currency: string; interest: number; deposit: boolean; capitalization: boolean }
  note: string
  lastSeen: string
}
interface Item {
  title: string
  amount: number
  currency: string
  period: string
  icon: string
}
```

**Important:** The `saving.amount` field from the API is the backend's savings record. The `savedAmount` in `goalStore` is the client-side optimistic total. For this story, use `goalStore.savedAmount` as the source of truth for progress display (it's already set during onboarding and updated optimistically). The `useCurrentAccount` query is fetched to satisfy AC 6 (data fetched via TanStack Query) and for future use — but the progress calculation uses the Zustand store.

### GoalProgressCard Props Interface

```typescript
interface GoalProgressCardProps {
  // No props needed — reads from useGoalStore + useCurrentAccount internally
}
```

The component is self-contained. It reads from `useGoalStore` selectors and `useCurrentAccount`.

### Tap-to-Expand (AC 5)

For this story, the expanded view is a simple inline detail panel (not a separate route). Use `useState(false)` for `isExpanded`. The expanded view shows the same data with more detail. Full goal detail routing is deferred to Story 3.2.

```tsx
const [isExpanded, setIsExpanded] = useState(false)
// Card wrapper: onClick={() => setIsExpanded(prev => !prev)}
// Expanded: show additional detail (targetDate, full amounts)
```

The card must be keyboard accessible: `<div role="button" tabIndex={0} onClick={...} onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(prev => !prev)}>` — or use a `<button>` wrapper.

### Accessibility Requirements (enforced by axe-core CI)

- Progress bar: `<div role="progressbar" aria-valuenow={progressPercent ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Goal progress">`
- Card tap target: `<button>` or `role="button"` with `tabIndex={0}` and `onKeyDown` Enter handler
- Minimum 44px touch target on the card
- Skeleton loading: use `aria-busy="true"` on the card container while loading

### Reduced Motion

Wrap any progress bar animation in `useReducedMotion()` from `penny/src/hooks/useReducedMotion.ts`:
```tsx
const reducedMotion = useReducedMotion()
// Apply transition only if !reducedMotion
const barStyle = reducedMotion ? {} : { transition: 'width 500ms ease, box-shadow 500ms ease' }
```

### Home.tsx Update

Current `Home.tsx` renders `PennyAvatar` + message div as placeholder. Replace with `GoalProgressCard`:

```tsx
// penny/src/pages/Home.tsx — REPLACE inner content only
import { GoalProgressCard } from '../components/GoalProgressCard'

export function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-start bg-background pt-8 pb-20 px-4">
        <GoalProgressCard />
      </main>
      <BottomNav />
    </>
  )
}
```

Remove: `useGoalStore` import, `PennyAvatar` import, message logic — all of that moves into `GoalProgressCard`.

### Design Tokens Available

From `penny/src/styles/globals.css`:
- `--color-primary`: `#FF6B6B` (coral — use for progress bar fill + glow)
- `--color-accent`: `#34D399` (mint green — use for near-goal/countdown mode in Story 3.4)
- `--color-surface`: `#1A1A24` (card background)
- `--color-surface-elevated`: `#242433` (elevated card)
- `--color-border`: `#2E2E42`

### Testing Requirements

`GoalProgressCard.test.tsx` must cover:
1. Renders goal name and progress bar when goal is set
2. Progress bar has correct `aria-valuenow`
3. "Just saving" variant renders total saved without progress bar
4. Skeleton renders when `isLoading` is true
5. Tap expands to detail view

Use `vi.mock` to mock `useGoalStore` and `useCurrentAccount`. Co-locate test with component per architecture.

### What NOT to Do

- Do NOT use `navigator.onLine` directly — use `useOfflineSync().isOnline` (but offline handling is not required for this story — just don't break the pattern)
- Do NOT set Penny mood directly — `pennyStore.setMood()` is acceptable here since `moodEngine` is not yet implemented; Story 4.x will wire up the full mood engine
- Do NOT create a new `api.ts` file — add `useCurrentAccount` to the existing `penny/src/features/goal/api.ts`
- Do NOT import `GoalProgressCard` internals from outside — export only via `index.ts`
- Do NOT use `console.error` — use `lib/logger.ts` for any error logging
- Do NOT add routing for the expanded view — inline expand only for this story (Story 3.2 adds the full goal setup/edit flow)
- Do NOT implement countdown mode (Story 3.4) or completion celebration (Story 3.5) — those are separate stories

### Acceptance Criteria Verification

| AC | Implementation |
|----|----------------|
| 1 — GoalProgressCard visible on home screen without navigation | `GoalProgressCard` rendered directly in `Home.tsx` |
| 2 — Shows goal name, emoji, progress bar, amount saved, total target, weekly target | All fields in `GoalProgressCard` from `useGoalStore` |
| 3 — Neon glow intensifies with progress (UX-DR5) | Inline `boxShadow` style scales with `progressPercent` |
| 4 — `role="progressbar"` with aria attributes (UX-DR7) | Applied to progress bar div |
| 5 — Tap expands to full goal detail view | `useState(isExpanded)` inline expand |
| 6 — Data fetched via `GET /accounts/current` TanStack Query | `useCurrentAccount` query in `features/goal/api.ts` |

### References

- `penny/src/store/goalStore.ts` — goal state (goalName, goalAmount, savedAmount, targetDate, isJustSaving)
- `penny/src/features/goal/api.ts` — add `useCurrentAccount` here
- `penny/src/features/goal/types.ts` — add `AccountResponse` type here
- `penny/src/components/ui/progress.tsx` — shadcn Progress base component
- `penny/src/hooks/useReducedMotion.ts` — reduced motion hook
- `penny/src/pages/Home.tsx` — replace placeholder with GoalProgressCard
- `penny/src/styles/globals.css` — design tokens (--color-primary, --color-surface, etc.)
- `_bmad-output/planning-artifacts/epics/epic-3-goal-management-home-screen.md#Story 3.1`
- `_bmad-output/planning-artifacts/architecture.md` — Component structure, naming, TanStack Query key pattern, accessibility rules
- `_bmad-output/planning-artifacts/ux-design-specification.md` — UX-DR5 (neon glow), UX-DR7 (GoalProgressCard anatomy), GoalProgressCard custom component spec
- `_bmad-output/planning-artifacts/epics/requirements-inventory.md` — FR9, UX-DR5, UX-DR7

## Senior Developer Review (AI)

**Review Date:** 2026-04-09
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅
**Dismissed:** 0

### Action Items

- [x] [Review][Patch] Remove duplicate `AccountItem` and `AccountResponse` interface declarations [`penny/src/features/goal/types.ts`]
- [x] [Review][Patch] Fix invalid CSS `var(--color-primary)40` — use `rgba` or a hardcoded hex alpha instead [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]
- [x] [Review][Patch] Handle `isError` from `useCurrentAccount` — render an error state instead of silently showing empty card [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]
- [x] [Review][Patch] Add `aria-label` to the `role="button"` card div — screen readers need an accessible name [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]
- [x] [Review][Decision] Goal emoji hardcoded as 🐷 — AC2 requires "goal emoji" (user's chosen category emoji); resolved: (a) added `goalEmoji` to `goalStore`, wired from `GoalCategoryPicker` → `OnboardingFlow` → `setGoal` [`penny/src/store/goalStore.ts`, `penny/src/features/goal/components/GoalCategoryPicker.tsx`, `penny/src/features/auth/components/OnboardingFlow.tsx`]
- [x] [Review][Patch] Import `useCurrentAccount` via `../../features/goal` (index) not directly from `../../features/goal/api` — architecture boundary rule [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]
- [x] [Review][Patch] Guard `goalAmount > 0` before computing `progressPercent` to prevent `NaN` when `goalAmount = 0` [`penny/src/features/goal/hooks/useGoalProgress.ts`]
- [x] [Review][Patch] Guard past `targetDate` in `weeklyTarget` calculation — if target date is in the past, set `weeklyTarget = null` (goal overdue) [`penny/src/features/goal/hooks/useGoalProgress.ts`]

### Deferred

- [x] [Review][Defer] `Intl.DateTimeFormat` instantiated inline on every render — minor perf, not a correctness issue [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]
- [x] [Review][Defer] `weeklyTarget` fractional value displays as `$0` — cosmetic edge case, acceptable for now

### Tasks/Subtasks — Review Follow-ups (AI)

- [x] [AI-Review][Patch] Remove duplicate interface declarations in `types.ts`
- [x] [AI-Review][Patch] Fix `var(--color-primary)40` invalid CSS glow
- [x] [AI-Review][Patch] Handle `isError` in `GoalProgressCard`
- [x] [AI-Review][Patch] Add `aria-label` to card `role="button"`
- [x] [AI-Review][Decision] Resolve goal emoji approach — option (a): added `goalEmoji` to `goalStore`
- [x] [AI-Review][Patch] Fix direct internal import → use `index.ts`
- [x] [AI-Review][Patch] Guard `goalAmount > 0` for NaN prevention
- [x] [AI-Review][Patch] Guard past `targetDate` → `weeklyTarget = null`

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- `@testing-library/dom` missing as peer dep — installed separately with `--legacy-peer-deps`
- `defineConfig` from `vite` doesn't accept `test` key — switched to `defineConfig` from `vitest/config`
- `useReducedMotion.ts` not yet created — created as new hook in `penny/src/hooks/`

### Completion Notes List

- Created `useCurrentAccount` TanStack Query hook in `features/goal/api.ts` — query key `['accounts', 'current']`
- Added `AccountResponse` + `AccountItem` types to `features/goal/types.ts`
- Created `features/goal/hooks/useGoalProgress.ts` — computes `progressPercent`, `weeklyTarget` from Zustand store
- Created `hooks/useReducedMotion.ts` — `prefers-reduced-motion` media query wrapper
- Created `components/GoalProgressCard/GoalProgressCard.tsx` — neon glow progress bar, skeleton, tap-to-expand, just-saving variant, full accessibility
- Created `components/GoalProgressCard/index.ts` — re-export only
- Created `components/GoalProgressCard/GoalProgressCard.test.tsx` — 5 tests, all passing
- Updated `pages/Home.tsx` — replaced placeholder with `GoalProgressCard`
- Updated `features/goal/index.ts` — added `useCurrentAccount` + new type exports
- Installed vitest + RTL; configured `vite.config.ts` with `test` block; added `test-setup.ts`
- `npm run build` passes (zero TS errors); `npm run lint` passes (0 errors, 1 pre-existing warning); `npm test` 5/5 pass

### File List

- `penny/src/features/goal/types.ts` — MODIFIED: added `AccountItem`, `AccountResponse`
- `penny/src/features/goal/api.ts` — MODIFIED: added `useCurrentAccount`
- `penny/src/features/goal/hooks/useGoalProgress.ts` — CREATED
- `penny/src/features/goal/index.ts` — MODIFIED: added `useCurrentAccount` + new type exports
- `penny/src/hooks/useReducedMotion.ts` — CREATED
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — CREATED
- `penny/src/components/GoalProgressCard/index.ts` — CREATED
- `penny/src/components/GoalProgressCard/GoalProgressCard.test.tsx` — CREATED
- `penny/src/pages/Home.tsx` — MODIFIED: replaced placeholder with GoalProgressCard
- `penny/src/test-setup.ts` — CREATED: vitest + jest-dom setup
- `penny/vite.config.ts` — MODIFIED: added vitest config, switched to `vitest/config` defineConfig
- `penny/package.json` — MODIFIED: added test scripts + vitest/RTL dev deps
