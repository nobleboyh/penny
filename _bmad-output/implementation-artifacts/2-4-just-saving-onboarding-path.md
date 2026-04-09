# Story 2.4: "Just Saving" Onboarding Path

Status: done

## Story

As a new user,
I want to skip goal setup and start saving without a specific goal,
so that I'm not blocked from using the app if I don't have a goal in mind.

## Acceptance Criteria

1. **Given** a user is on the goal selection screen
   **When** they tap "Just saving 💰"
   **Then** they skip the price and date screens

2. **And** a default "Just saving" goal state is set in `goalStore`

3. **And** the home screen shows Penny with an encouraging no-goal message

4. **And** Penny's message does not pressure the user to set a goal immediately

5. **And** the skip path routes to the Penny introduction screen (Story 2.5 path — same destination)

## Context: What's Already Done

Story 2.3 already implemented ACs 1, 2, and 5 as part of `OnboardingFlow`:
- `GoalCategoryPicker` has the "Just saving 💰" ghost button that calls `onJustSaving()`
- `OnboardingFlow.handleJustSaving()` calls `setJustSaving()` and routes to `penny-intro` step
- `goalStore.setJustSaving()` sets `{ goalName: 'Just saving', goalAmount: null, targetDate: null, isJustSaving: true }`
- `PennyIntroScreen` already receives `goalName={null}` for the just-saving path and shows a neutral fallback message

**The only remaining work is AC 3 + 4:** The `Home` page must read `isJustSaving` from `goalStore` and show Penny with an encouraging no-goal message (not the generic "You're all set! 🎉").

## Tasks / Subtasks

- [x] Update `pages/Home.tsx` to show contextual Penny message based on goal state (AC: 3, 4)
  - [x] Read `isJustSaving` and `goalName` from `useGoalStore`
  - [x] If `isJustSaving === true`: show Penny in `happy` mood with no-pressure message
  - [x] If goal is set (`goalName !== null && !isJustSaving`): show goal-aware message
  - [x] If no state at all (edge case): show default welcome message
  - [x] Message must NOT say "set a goal" or pressure the user

## Dev Notes

### What Exists (do NOT recreate)

- `penny/src/store/goalStore.ts` — `useGoalStore` with `isJustSaving: boolean`, `goalName: string | null`, `goalAmount: number | null`, `targetDate: string | null`
- `penny/src/pages/Home.tsx` — renders `PennyAvatar` + `BottomNav`; currently shows generic "You're all set! 🎉"
- `penny/src/components/PennyAvatar/PennyAvatar.tsx` — accepts `size: 'sm' | 'md' | 'lg'` and `mood: MoodState`
- `penny/src/components/BottomNav/BottomNav.tsx` — already rendered in `Home`
- `penny/src/store/pennyStore.ts` — `MoodState` type source of truth

### Home.tsx Change — Minimal Implementation

```tsx
// pages/Home.tsx
import { useGoalStore } from '../store/goalStore'
import { BottomNav } from '../components/BottomNav'
import { PennyAvatar } from '../components/PennyAvatar'

export function Home() {
  const isJustSaving = useGoalStore(s => s.isJustSaving)
  const goalName = useGoalStore(s => s.goalName)

  const message = isJustSaving
    ? { headline: "Every penny counts 🐷", sub: "Log what you spend and watch it add up!" }
    : goalName
    ? { headline: `Let's get you to ${goalName}! 🎯`, sub: "Log your first spend to get started." }
    : { headline: "You're all set! 🎉", sub: "More features coming soon…" }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background pb-20">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <PennyAvatar size="md" mood="happy" />
        <p className="text-foreground text-xl font-bold">{message.headline}</p>
        <p className="text-muted-foreground text-sm">{message.sub}</p>
      </div>
      <BottomNav />
    </div>
  )
}
```

### Zustand Selector Pattern (required)

Always use selector functions — never destructure the whole store:
```tsx
// ✅ correct
const isJustSaving = useGoalStore(s => s.isJustSaving)
const goalName = useGoalStore(s => s.goalName)

// ❌ wrong
const { isJustSaving, goalName } = useGoalStore()
```

### UX Rules for No-Goal Message

- **No pressure language** — never say "set a goal", "you should", "why not try"
- **Positive framing** — focus on what they CAN do (log a spend, watch progress)
- **Penny's voice** — peer-to-peer, encouraging, not instructional
- **Banned words** — budget, expense, income, net worth, should, must

### What NOT to Do

- Do NOT modify `goalStore.ts` — it already has `isJustSaving` from Story 2.3
- Do NOT modify `OnboardingFlow.tsx` — the routing is already correct
- Do NOT add a "Set a goal" CTA on the home screen for just-saving users
- Do NOT use `useGoalStore()` without a selector (causes unnecessary re-renders)
- Do NOT use red color for any state — use amber (`text-warning`) for caution if needed

### References

- `_bmad-output/planning-artifacts/epics/epic-2-authentication-onboarding.md#Story 2.4`
- `_bmad-output/implementation-artifacts/2-3-goal-first-onboarding-flow.md` — File List, goalStore changes, OnboardingFlow implementation
- `penny/src/store/goalStore.ts` — `isJustSaving` field
- `penny/src/pages/Home.tsx` — file to modify
- `_bmad-output/planning-artifacts/ux-design-specification.md` — "Emotions to Avoid" (shame, pressure), "Penny first, features second"
- `_bmad-output/project-context.md` — Zustand selector pattern, banned UX words

## Senior Developer Review (AI)

**Review Date:** 2026-04-09
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅
**Dismissed:** 1

### Action Items

- [x] [Review][Patch] Add `aria-live="polite"` to dynamic message container so screen readers announce message changes on hydration [`penny/src/pages/Home.tsx`]
- [x] [Review][Patch] Guard against Zustand hydration flicker — show neutral fallback until store is hydrated [`penny/src/pages/Home.tsx`]

### Deferred

- [x] [Review][Defer] `PennyAvatar mood` hardcoded to `happy` regardless of store state — deferred, mood engine is Story 4.1

### Tasks/Subtasks — Review Follow-ups (AI)

- [x] [AI-Review][Low] Add `aria-live="polite"` to message container [`penny/src/pages/Home.tsx`]
- [x] [AI-Review][Med] Fix Zustand hydration flicker on return visit [`penny/src/pages/Home.tsx`]

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- `isJustSaving` and `goalName` already in `goalStore` from Story 2.3 — no store changes needed
- Used individual selectors per project-context.md Zustand pattern

### Completion Notes List

- Updated `pages/Home.tsx` to read `isJustSaving` + `goalName` from `useGoalStore` with individual selectors
- Three message states: just-saving ("Every penny counts 🐷"), goal-set (goal-aware), default fallback
- No pressure language, no "set a goal" CTA — compliant with UX rules
- Added `_hasHydrated` flag + `onRehydrateStorage` to `goalStore.ts` to prevent hydration flicker on return visits
- Added `aria-live="polite"` wrapper around dynamic message paragraphs for screen reader support
- `npm run build` passes with zero TypeScript errors

### File List

- `penny/src/pages/Home.tsx` — MODIFIED: contextual Penny message, aria-live, hydration guard
- `penny/src/store/goalStore.ts` — MODIFIED: _hasHydrated flag + onRehydrateStorage
