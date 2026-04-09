# Story 2.5: Penny Introduction & Home Screen Entry

Status: done

## Story

As a new user,
I want to be introduced to Penny by name after onboarding and land on the home screen,
so that I understand who Penny is before I start using the app.

## Acceptance Criteria

1. **Given** a user has completed goal setup or chosen "Just saving"
   **When** the Penny introduction screen is shown
   **Then** `PennyAvatar` (lg, 160px) is displayed in `excited` mood state with bounce animation

2. **And** Penny's introduction message is shown: name, personality, and a reference to the user's goal if set

3. **And** a single primary CTA "Let's go!" advances to the home screen

4. **And** the bottom navigation (`BottomNav`) is visible on the home screen with all 5 tabs (UX-DR14)

5. **And** the Penny center tab is slightly larger than the other tabs with no label

6. **And** `PennyAvatar` has `aria-label="Penny, your saving buddy"` and `role="img"` (UX-DR6)

## Context: What's Already Done

**`PennyIntroScreen` already exists and is fully implemented** in `penny/src/features/goal/components/PennyIntroScreen.tsx`:
- Renders `PennyAvatar size="lg" mood="excited"` with bounce animation
- Shows "Hi! I'm Penny, your saving buddy 🐷" + personality message
- Shows goal reference if `goalName` is set and not "Just saving"
- Has "Let's go! 🚀" CTA that calls `onDone()` after 1-second delay
- `PennyAvatar` already has `aria-label="Penny, your saving buddy"` and `role="img"` ✅

**`OnboardingFlow` already routes to `PennyIntroScreen`** for both paths:
- Goal path: `handleDateNext()` → sets `introGoalName` → `setStep('penny-intro')`
- Just saving path: `handleJustSaving()` → `setIntroGoalName(null)` → `setStep('penny-intro')`
- `PennyIntroScreen onDone={() => navigate('/home')}` — routes to home screen ✅

**`BottomNav` already exists** in `penny/src/components/BottomNav/BottomNav.tsx`:
- 5 tabs: My Stuff / My Journey / Penny (center, no label) / Penny Says / My Vibe
- Penny center tab uses `PennyAvatar size="sm"` with `-mt-4` to make it slightly larger/elevated ✅
- Already rendered in `Home.tsx` ✅

**`Home.tsx` already shows contextual Penny message** (Story 2.4):
- Reads `isJustSaving` + `goalName` from `useGoalStore`
- Three message states: just-saving, goal-set, default fallback
- Has `aria-live="polite"` wrapper + hydration guard ✅

**The remaining gap:** The `BottomNav` routes (`/stuff`, `/journey`, `/penny-says`, `/vibe`) are not registered in `App.tsx`. Tapping any non-home tab will hit the `*` catch-all and redirect to `/onboarding`. The home screen also lacks `<main>` semantic wrapper.

## Tasks / Subtasks

- [x] Add stub page routes to `App.tsx` so `BottomNav` tabs don't redirect to onboarding (AC: 4, 5)
  - [x] Create minimal stub pages: `Journey.tsx`, `PennySays.tsx`, `MyVibe.tsx`, `MyStuff.tsx` in `penny/src/pages/`
  - [x] Register routes `/stuff`, `/journey`, `/penny-says`, `/vibe` in `App.tsx`

- [x] Wrap `Home.tsx` content in `<main>` semantic element (AC: 6 — accessibility)

- [x] Verify `PennyIntroScreen` goal reference message for goal-set path (AC: 2)
  - [x] Confirm `goalName` is passed correctly from `OnboardingFlow` for both paths — no code change expected, just verify

## Dev Notes

### What Exists — Do NOT Recreate

- `penny/src/features/goal/components/PennyIntroScreen.tsx` — fully implemented, do NOT modify
- `penny/src/features/auth/components/OnboardingFlow.tsx` — routing to penny-intro is correct, do NOT modify
- `penny/src/components/BottomNav/BottomNav.tsx` — 5 tabs, Penny center elevated, do NOT modify
- `penny/src/pages/Home.tsx` — contextual message + BottomNav already rendered, do NOT modify
- `penny/src/components/PennyAvatar/PennyAvatar.tsx` — `role="img"` + `aria-label` already set, do NOT modify

### The Only Real Work: Stub Routes

`App.tsx` currently only has `/onboarding`, `/login`, `/onboarding/goal`, `/home`. The `BottomNav` links to `/stuff`, `/journey`, `/penny-says`, `/vibe` — all hit the `*` catch-all and redirect to `/onboarding`.

Stub pages must be minimal — just enough to not redirect. They will be fully implemented in Epics 3–7.

```tsx
// pages/MyStuff.tsx, Journey.tsx, PennySays.tsx, MyVibe.tsx — same pattern
import { BottomNav } from '../components/BottomNav'

export function MyStuff() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background pb-20">
      <p className="text-muted-foreground text-sm">Coming soon…</p>
      <BottomNav />
    </main>
  )
}
```

```tsx
// App.tsx additions
import { MyStuff } from './pages/MyStuff'
import { Journey } from './pages/Journey'
import { PennySays } from './pages/PennySays'
import { MyVibe } from './pages/MyVibe'

// Add inside <Routes>:
<Route path="/stuff" element={<MyStuff />} />
<Route path="/journey" element={<Journey />} />
<Route path="/penny-says" element={<PennySays />} />
<Route path="/vibe" element={<MyVibe />} />
```

### Home.tsx Semantic Wrapper

Add `<main>` wrapper around the content div (not around `BottomNav` — it's a `<nav>`):

```tsx
// Current:
<div className="flex min-h-screen flex-col items-center justify-center bg-background pb-20">
  <div className="flex flex-col items-center gap-4 text-center px-6">

// Change outer div to main:
<main className="flex min-h-screen flex-col items-center justify-center bg-background pb-20">
  <div className="flex flex-col items-center gap-4 text-center px-6">
  ...
  </div>
  <BottomNav />
</main>
```

### Routing Architecture (current state)

```
/onboarding       → Onboarding.tsx (landing page)
/login            → Login.tsx
/onboarding/goal  → OnboardingFlow.tsx (goal setup + penny-intro steps)
/home             → Home.tsx ✅
/stuff            → MyStuff.tsx (stub — add this story)
/journey          → Journey.tsx (stub — add this story)
/penny-says       → PennySays.tsx (stub — add this story)
/vibe             → MyVibe.tsx (stub — add this story)
*                 → redirect to /onboarding
```

### File Locations (architecture compliance)

- New stub pages: `penny/src/pages/MyStuff.tsx`, `Journey.tsx`, `PennySays.tsx`, `MyVibe.tsx`
- Pages are route-level components — no business logic, just layout + BottomNav
- Do NOT create folder structure for stub pages (< 50 lines, no tests needed)

### What NOT to Do

- Do NOT modify `PennyIntroScreen.tsx` — it already satisfies ACs 1, 2, 3, 6
- Do NOT modify `OnboardingFlow.tsx` — routing is already correct
- Do NOT modify `BottomNav.tsx` — AC 4 and 5 are already satisfied
- Do NOT add auth guards to stub pages — that's a future story concern
- Do NOT implement any content in stub pages — just "Coming soon…" + BottomNav
- Do NOT use `<div onClick>` for navigation — `BottomNav` uses `<NavLink>` already

### Acceptance Criteria Verification

| AC | Status | Notes |
|----|--------|-------|
| 1 — PennyAvatar lg excited on intro screen | ✅ Already done | `PennyIntroScreen` renders `PennyAvatar size="lg" mood="excited"` |
| 2 — Penny intro message with goal reference | ✅ Already done | `PennyIntroScreen` shows goal name if set |
| 3 — "Let's go!" CTA to home screen | ✅ Already done | `onDone={() => navigate('/home')}` in `OnboardingFlow` |
| 4 — BottomNav visible on home screen with 5 tabs | ✅ Already done | `BottomNav` rendered in `Home.tsx`; stub routes needed to prevent redirect |
| 5 — Penny center tab larger, no label | ✅ Already done | `-mt-4` elevation, no label in `BottomNav` |
| 6 — PennyAvatar aria-label + role="img" | ✅ Already done | Set in `PennyAvatar.tsx` |

**Net new code:** 4 stub pages + route registrations in `App.tsx` + `<main>` wrapper in `Home.tsx`.

### References

- `penny/src/features/goal/components/PennyIntroScreen.tsx` — fully implemented intro screen
- `penny/src/features/auth/components/OnboardingFlow.tsx` — routing to penny-intro
- `penny/src/components/BottomNav/BottomNav.tsx` — 5-tab nav, Penny center tab
- `penny/src/pages/Home.tsx` — home screen (needs `<main>` wrapper)
- `penny/src/App.tsx` — route definitions (needs stub routes)
- `_bmad-output/planning-artifacts/epics/epic-2-authentication-onboarding.md#Story 2.5`
- `_bmad-output/planning-artifacts/architecture.md` — Pages section: "route-level components (lazy loaded)", feature-based structure
- `_bmad-output/planning-artifacts/ux-design-specification.md` — UX-DR14 (5-tab BottomNav), UX-DR6 (PennyAvatar accessibility)
- `_bmad-output/project-context.md` — Component rules, semantic HTML requirement

## Senior Developer Review (AI)

**Review Date:** 2026-04-09
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅
**Dismissed:** 2

### Action Items

- [x] [Review][Patch] Move `<BottomNav />` outside `<main>` in `Home.tsx` and all stub pages — `<nav>` landmark nested inside `<main>` is an ARIA violation; screen readers expect nav landmarks as siblings of main, not children [`penny/src/pages/Home.tsx`, `penny/src/pages/MyStuff.tsx`, `penny/src/pages/Journey.tsx`, `penny/src/pages/PennySays.tsx`, `penny/src/pages/MyVibe.tsx`]

### Deferred

- [x] [Review][Defer] No auth guard on stub routes — intentional per spec ("Do NOT add auth guards to stub pages — future story concern")
- [x] [Review][Defer] Catch-all redirects all users to /onboarding regardless of auth state — pre-existing behaviour, not introduced by this diff
- [x] [Review][Defer] Four identical stub components — intentional per spec ("stub pages must be minimal, will be fully replaced in Epics 3–7")
- [x] [Review][Defer] Stub pages have no `<h1>` — intentional for placeholder pages that will be fully replaced
- [x] [Review][Defer] No Suspense boundary for future lazy() imports — pre-existing gap, not introduced by this diff

### Tasks/Subtasks — Review Follow-ups (AI)

- [x] [AI-Review][Patch] Fix `<nav>` inside `<main>` ARIA landmark nesting in Home.tsx and all 4 stub pages [`penny/src/pages/Home.tsx`, stub pages]

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- `PennyIntroScreen` already exists from Story 2.3 — confirmed by reading file
- `BottomNav` already has 5 tabs with Penny center elevated — confirmed by reading file
- `Home.tsx` already renders `BottomNav` — confirmed by reading file
- `App.tsx` missing `/stuff`, `/journey`, `/penny-says`, `/vibe` routes — confirmed by reading file
- All 6 ACs are already satisfied by existing code except the routing gap (AC 4 — tabs redirect to onboarding)

### Completion Notes List

- Created 4 stub pages (`MyStuff.tsx`, `Journey.tsx`, `PennySays.tsx`, `MyVibe.tsx`) in `penny/src/pages/` — each renders `<main>` + "Coming soon…" with `<BottomNav />` as sibling (not child)
- Registered `/stuff`, `/journey`, `/penny-says`, `/vibe` routes in `App.tsx` — BottomNav tabs no longer redirect to onboarding
- Changed `Home.tsx` outer wrapper from `<div>` to `<main>` for semantic HTML compliance; `<BottomNav />` moved to sibling of `<main>`
- All 6 ACs satisfied: ACs 1–3, 5–6 were already done by previous stories; AC 4 fixed by stub routes + `<main>` wrapper
- ✅ Resolved review finding [Patch]: Fixed `<nav>` inside `<main>` ARIA landmark nesting — `<BottomNav />` is now a sibling of `<main>` in all 5 affected pages
- `npm run build` passes with zero TypeScript errors; `npm run lint` passes with zero errors (1 pre-existing warning in unrelated file)

### File List

- `penny/src/pages/MyStuff.tsx` — CREATED: stub page for /stuff route
- `penny/src/pages/Journey.tsx` — CREATED: stub page for /journey route
- `penny/src/pages/PennySays.tsx` — CREATED: stub page for /penny-says route
- `penny/src/pages/MyVibe.tsx` — CREATED: stub page for /vibe route
- `penny/src/App.tsx` — MODIFIED: added 4 stub routes + imports
- `penny/src/pages/Home.tsx` — MODIFIED: outer `<div>` → `<main>` semantic wrapper
