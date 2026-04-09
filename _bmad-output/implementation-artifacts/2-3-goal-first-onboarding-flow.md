# Story 2.3: Goal-First Onboarding Flow

Status: done

## Story

As a newly registered user,
I want to set my saving goal with Penny calculating my weekly target,
so that I immediately understand what I'm working toward.

## Acceptance Criteria

1. **Given** a newly registered user (just completed social login)
   **When** they land on `/onboarding/goal`
   **Then** they are shown one question per screen: goal selection → target amount → target date

2. **And** goal cards are visual selectors (no dropdowns) per UX-DR17

3. **And** the amount input uses `inputmode="decimal"` and font size ≥ 24px

4. **And** the date picker offers quick options: 1 month / 3 months / 6 months / Custom

5. **And** Penny calculates and displays the weekly saving target instantly after date is selected (FR4)

6. **And** the goal is saved to the account via `PUT /accounts/current`

7. **And** the full onboarding flow completes in under 2 minutes (UX success criterion)

8. **And** a "Just saving 💰" option on the goal selection screen skips price and date screens, sets a default "Just saving" goal state in `goalStore`, and routes to the Penny introduction screen (Story 2.4 path — same destination)

9. **And** after goal setup (or "Just saving"), the Penny introduction screen is shown: `PennyAvatar` (lg, 160px) in `excited` mood with bounce animation, Penny's name + personality + goal reference, and a single "Let's go!" CTA

10. **And** `BottomNav` is visible on the home screen after onboarding completes with all 5 tabs

11. **And** `PennyAvatar` has `aria-label="Penny, your saving buddy"` and `role="img"` (UX-DR6)

## Tasks / Subtasks

- [x] Create `features/goal/types.ts` — goal domain types (AC: 1, 2, 5, 6)
  - [x] `GoalCategory` type: `'tech' | 'fashion' | 'travel' | 'food' | 'other'`
  - [x] `GoalSetupData` interface: `{ goalName, goalAmount, targetDate, category }`

- [x] Create `features/goal/api.ts` — TanStack Query hooks (AC: 6)
  - [x] `useUpdateAccount` mutation: `PUT /accounts/current` via `apiClient`
  - [x] Payload shape: `{ incomes: [], expenses: [], saving: { amount, currency: 'USD', interest: 0 }, note: goalName }`

- [x] Create `features/goal/components/GoalCategoryPicker.tsx` (AC: 1, 2, 8)
  - [x] Visual card grid: Tech 💻 / Fashion 👟 / Travel ✈️ / Food 🍔 / Other 🎯
  - [x] "Just saving 💰" option as a ghost/secondary card below the grid
  - [x] Selected card: coral border + glow; unselected: surface border
  - [x] Auto-advance to next screen on selection (except "Just saving" which skips to Penny intro)

- [x] Create `features/goal/components/GoalAmountInput.tsx` (AC: 3)
  - [x] Large number input: `inputmode="decimal"`, font size 24px+, centered
  - [x] Currency prefix display (e.g., "$")
  - [x] "Next" primary button advances to date screen

- [x] Create `features/goal/components/GoalDatePicker.tsx` (AC: 4, 5)
  - [x] Quick option buttons: "1 month" / "3 months" / "6 months" / "Custom"
  - [x] Custom: native `<input type="date">` (no date library)
  - [x] Weekly target calculation: `weeklyTarget = goalAmount / weeksUntilDate`
  - [x] Display: "Save $X/week → [Goal] by [Date] 🎯" — updates instantly on selection
  - [x] Calculation is instant (no async delay needed)

- [x] Create `features/goal/components/PennyIntroScreen.tsx` (AC: 9, 11)
  - [x] `PennyAvatar` lg (160px) in `excited` mood with bounce animation
  - [x] Intro message with Penny name, personality, bubble tea line
  - [x] If goal set: append "Let's get you to [goalName]!"
  - [x] Single primary CTA "Let's go!" → navigates to `/home` (visible after 1s)
  - [x] `PennyAvatar` has `aria-label="Penny, your saving buddy"` + `role="img"`

- [x] Create `features/auth/components/OnboardingFlow.tsx` — multi-step orchestrator (AC: 1, 7)
  - [x] Steps: `goal-category` → `goal-amount` → `goal-date` → `penny-intro`
  - [x] "Just saving" path: `goal-category` → `penny-intro` (skip amount + date)
  - [x] Progress indicator (step dots, not numbers)
  - [x] Back navigation between steps
  - [x] No step requires more than one action to advance

- [x] Create `components/PennyAvatar/PennyAvatar.tsx` (AC: 9, 11)
  - [x] Props: `size: 'sm' | 'md' | 'lg'`, `mood: MoodState`
  - [x] `sm` = 40px, `md` = 80px, `lg` = 160px
  - [x] Static emoji fallback (Lottie slot ready for future)
  - [x] Coral radial glow backdrop
  - [x] `aria-label="Penny, your saving buddy"` + `role="img"` always present
  - [x] Bounce animation wrapped in `useReducedMotion()` check

- [x] Create `components/PennyAvatar/index.ts` — re-export only

- [x] Create `features/penny/types.ts` — `MoodState` re-export (AC: 9)
  - [x] Re-exports from `store/pennyStore.ts` (no duplication)

- [x] Update `goalStore.ts` — add `isJustSaving` flag (AC: 8)
  - [x] Add `isJustSaving: boolean` to `GoalState`
  - [x] Add `setJustSaving: () => void` action
  - [x] Update `setGoal` to set `isJustSaving: false`

- [x] Update `App.tsx` — replace `/onboarding/goal` stub with `OnboardingFlow`, add `/home` route (AC: 1, 10)
  - [x] `/onboarding/goal` → `<OnboardingFlow />`
  - [x] `/home` → `<Home />`
  - [x] `BottomNav` rendered inside `Home` page

- [x] Create `pages/Home.tsx` stub (AC: 10)
  - [x] Renders `BottomNav` with all 5 tabs
  - [x] Placeholder content: Penny avatar + "You're all set! 🎉"

- [x] Create `components/BottomNav/BottomNav.tsx` (AC: 10)
  - [x] 5 tabs: My Stuff 📊 / My Journey 📈 / Penny 🐷 (center) / Penny Says 💬 / My Vibe ✨
  - [x] Penny center tab: no label, PennyAvatar sm
  - [x] All tabs: min 44×44px touch targets
  - [x] `<nav aria-label="Main navigation">`

- [x] Export from `features/goal/index.ts` (AC: all)
  - [x] Export all components, hook, and types

- [x] Export from `features/auth/index.ts` — add `OnboardingFlow` export

## Dev Notes

### What Exists Already (from Stories 2.1 + 2.2 + Epic 1)

**Frontend:**
- `penny/src/features/auth/` — `index.ts`, `types.ts`, `api.ts`, `components/AgeGate.tsx`, `components/SocialLoginButtons.tsx`
- `penny/src/pages/Onboarding.tsx` — renders `AgeGate`, navigates to `/login`
- `penny/src/pages/Login.tsx` — renders `SocialLoginButtons`, navigates to `/onboarding/goal` on success
- `penny/src/App.tsx` — has `/onboarding`, `/login`, `/onboarding/goal` (stub) routes
- `penny/src/lib/api.ts` — `apiClient` (axios) with `Authorization: Bearer` interceptor; reads `access_token` from `localStorage`
- `penny/src/store/goalStore.ts` — `useGoalStore` with `setGoal`, `updateSavedAmount`, `resetGoal`; persisted to `localStorage` as `penny-goal`
- `penny/src/store/pennyStore.ts` — `usePennyStore` exists
- `penny/src/store/streakStore.ts` — `useStreakStore` exists
- All shadcn/ui components in `penny/src/components/ui/`
- Framer Motion, React Router v7, TanStack Query v5 all installed
- `penny/src/styles/globals.css` — all design tokens defined (see Design Tokens section)
- `penny/src/hooks/useReducedMotion.ts` — exists (use for all animations)

**Backend:**
- `PUT /accounts/current` — existing endpoint in account-service; accepts `Account` object
- `Account` shape (from account-service): `{ incomes: Item[], expenses: Item[], saving: Saving, note: string }`
- `Saving` shape: `{ amount: number, currency: string, interest: number }`
- `Item` shape: `{ title: string, moneyAmount: { amount: number, currency: string }, period: string, icon: string }`
- Auth token in `localStorage` as `access_token` — `apiClient` sends it automatically

**What does NOT exist yet (this story creates):**
- `features/goal/` directory — entirely new
- `components/PennyAvatar/` — entirely new
- `components/BottomNav/` — entirely new
- `features/penny/types.ts` — entirely new
- `pages/Home.tsx` — entirely new

### Account Service API — Critical Details

`PUT /accounts/current` requires a full `Account` object. For goal setup, send:
```json
{
  "incomes": [],
  "expenses": [],
  "saving": {
    "amount": 249.00,
    "currency": "USD",
    "interest": 0
  },
  "note": "AirPods Pro"
}
```
- `saving.amount` = the goal target amount
- `note` = the goal name (free text)
- `incomes` and `expenses` can be empty arrays for initial setup
- The endpoint is authenticated — `apiClient` sends `Authorization: Bearer {access_token}` automatically
- Route through Zuul gateway: `VITE_API_BASE_URL/accounts/current`

### Weekly Target Calculation

```typescript
function calcWeeklyTarget(goalAmount: number, targetDate: string): number {
  const now = new Date()
  const target = new Date(targetDate)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeks = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / msPerWeek))
  return Math.ceil(goalAmount / weeks)
}
```

Quick option date calculation:
```typescript
function addMonths(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0] // YYYY-MM-DD
}
```

Display format: use `Intl.DateTimeFormat` — no date library:
```typescript
new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(new Date(targetDate))
// → "June 15"
```

### goalStore Update Required

Add `isJustSaving` to the existing store — do NOT recreate the store:
```typescript
// Add to GoalState interface:
isJustSaving: boolean

// Add to GoalActions interface:
setJustSaving: () => void

// Add to initialState:
isJustSaving: false

// Add to create():
setJustSaving: () => set({ isJustSaving: true, goalName: 'Just saving', goalAmount: null, targetDate: null }),
// Update setGoal to also set isJustSaving: false:
setGoal: (goalName, goalAmount, targetDate) => set({ goalName, goalAmount, targetDate, isJustSaving: false }),
```

### OnboardingFlow Step Orchestration

The `OnboardingFlow` component lives in `features/auth/components/` (not `features/goal/`) because it's part of the auth/onboarding journey. It orchestrates goal-feature components:

```typescript
// features/auth/components/OnboardingFlow.tsx
type OnboardingStep = 'goal-category' | 'goal-amount' | 'goal-date' | 'penny-intro'

// State:
const [step, setStep] = useState<OnboardingStep>('goal-category')
const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null)
const [goalName, setGoalName] = useState('')
const [goalAmount, setGoalAmount] = useState<number | null>(null)
const [targetDate, setTargetDate] = useState<string | null>(null)

// "Just saving" path:
// GoalCategoryPicker calls onJustSaving() → setJustSaving() in store → navigate to penny-intro step
```

### PennyAvatar — Lottie vs Fallback

Lottie animations are NOT yet created (they're a design asset). For this story, implement the component with a **static emoji fallback** as the primary implementation. The Lottie layer is a progressive enhancement:

```typescript
// PennyAvatar.tsx — use static emoji for now, Lottie slot ready
const MOOD_EMOJI: Record<MoodState, string> = {
  idle: '🐷', happy: '🐷', excited: '🐷✨', sad: '😢', celebrating: '🎉',
  worried: '😟', proud: '😊', neutral: '🐷', thinking: '🤔', disappointed: '😔'
}
```

Framer Motion for animations (bounce, pulse) — wrap in `useReducedMotion()`:
```typescript
const prefersReduced = useReducedMotion()
// bounce animation: only if !prefersReduced
```

### Design Tokens (from globals.css)

```css
--background: #0F0F14
--surface: #1A1A24
--surface-elevated: #242433
--primary: #FF6B6B       /* coral — primary buttons */
--primary-foreground: #FFFFFF
--secondary: #A78BFA     /* purple — secondary actions */
--accent: #34D399        /* mint — success, goal progress */
--warning: #FBBF24       /* amber — errors, caution */
--foreground: #F9FAFB
--muted-foreground: #9CA3AF
--border: #2E2E42
--border-radius-md: 16px
--border-radius-lg: 24px
```

Goal card selected state: `border-primary shadow-[0_0_12px_rgba(255,107,107,0.4)]`

### Component File Structure (Architecture Rule)

Multi-file components use the folder pattern:
```
components/PennyAvatar/
  index.ts              ← re-export only: export { PennyAvatar } from './PennyAvatar'
  PennyAvatar.tsx       ← implementation
  PennyAvatar.test.tsx  ← (optional for this story)

components/BottomNav/
  index.ts
  BottomNav.tsx
```

Single-file components (< 50 lines, no test needed) can be a single `.tsx` file.

### Feature Module Exports

`features/goal/index.ts` must export everything the rest of the app needs:
```typescript
export { GoalCategoryPicker } from './components/GoalCategoryPicker'
export { GoalAmountInput } from './components/GoalAmountInput'
export { GoalDatePicker } from './components/GoalDatePicker'
export { PennyIntroScreen } from './components/PennyIntroScreen'
export { useUpdateAccount } from './api'
export type { GoalCategory, GoalSetupData } from './types'
```

`features/auth/index.ts` — add `OnboardingFlow` export (do NOT remove existing exports).

### App.tsx Route Update

Replace the stub `/onboarding/goal` route and add `/home`:
```tsx
import { OnboardingFlow } from './features/auth'
import { Home } from './pages/Home'

// Replace:
<Route path="/onboarding/goal" element={<div ...stub.../>} />
// With:
<Route path="/onboarding/goal" element={<OnboardingFlow />} />
<Route path="/home" element={<Home />} />
```

The `*` catch-all still redirects to `/onboarding`.

### BottomNav Tab Structure

```tsx
const TABS = [
  { path: '/stuff', icon: '📊', label: 'My Stuff' },
  { path: '/journey', icon: '📈', label: 'My Journey' },
  { path: '/home', icon: null, label: null, isPenny: true },  // center Penny tab
  { path: '/penny-says', icon: '💬', label: 'Penny Says' },
  { path: '/vibe', icon: '✨', label: 'My Vibe' },
]
```

For this story, all tabs except the Penny center tab can be stub routes (they'll be built in later epics). The Penny center tab navigates to `/home`.

### UX Rules for This Story

- **One question per screen** — never stack multiple fields on the same screen
- **Auto-advance** after goal card selection (except "Just saving" which goes to penny-intro)
- **No dropdowns** — visual card selectors only (UX-DR17)
- **Amount input**: `inputmode="decimal"`, font-size ≥ 24px, centered, currency prefix
- **Date quick options**: pill buttons, not a dropdown; custom date uses native `<input type="date">`
- **Weekly target**: display immediately after date selection, no submit button needed
- **Penny intro**: unskippable for 1 second (forces the emotional moment), then "Let's go!" CTA appears
- **Back navigation**: each step has a back arrow (top-left) to go to previous step
- **Progress dots**: show current step position (e.g., ● ○ ○ for step 1 of 3)

### What NOT to Do

- Do NOT create a new `goalStore.ts` — extend the existing one
- Do NOT use `<select>` or dropdowns for goal category or date — use visual cards/pills
- Do NOT use a date library — use `Intl.DateTimeFormat` and native `<input type="date">`
- Do NOT call `PUT /accounts/current` with the full account history — send empty `incomes`/`expenses` arrays for initial setup
- Do NOT use `console.error` — use `lib/logger.ts`
- Do NOT use `useState` + `useEffect` for server state — use TanStack Query mutation
- Do NOT import directly from feature internals — use `features/goal` (index only)
- Do NOT add `@GetMapping`/`@PostMapping` in Java — no backend changes needed for this story
- Do NOT create `OnboardingFlow.tsx` in `features/goal/` — it belongs in `features/auth/components/`
- Do NOT implement `GoalProgressCard` (home screen hero) — that's Story 3.1
- Do NOT implement Penny mood engine — that's Story 4.1; use static emoji for now

### Previous Story Learnings (from Stories 2.1 + 2.2 + Epic 1)

- `react-router-dom@7.14.0` installed with `--legacy-peer-deps` — same pattern if adding new deps
- Framer Motion `Variants` type must be imported explicitly (not inlined)
- `@RequestMapping` style only in Java (not `@GetMapping`/`@PostMapping`) — no Java changes this story
- `@Autowired` field injection only — no Java changes this story
- `npm run build` must pass with zero TypeScript errors before marking done
- `mvn test` must pass for any modified Java service — no Java changes this story
- AgeGate pattern: single-screen component with one primary CTA — follow same pattern for each onboarding step
- `apiClient` from `lib/api.ts` handles auth header automatically — no manual token handling needed
- Error messages use `text-warning` (amber) class, never red
- All interactive elements need `aria-label` if icon-only

### File List After This Story

```
penny/src/
  App.tsx                                         ← MODIFY: /onboarding/goal → OnboardingFlow, add /home
  pages/
    Home.tsx                                      ← NEW: stub with BottomNav
  features/
    auth/
      index.ts                                    ← MODIFY: export OnboardingFlow
      components/
        OnboardingFlow.tsx                        ← NEW: multi-step orchestrator
    goal/
      index.ts                                    ← NEW: public API exports
      types.ts                                    ← NEW: GoalCategory, GoalSetupData
      api.ts                                      ← NEW: useUpdateAccount mutation
      components/
        GoalCategoryPicker.tsx                    ← NEW: visual goal card selector
        GoalAmountInput.tsx                       ← NEW: decimal input, 24px+ font
        GoalDatePicker.tsx                        ← NEW: quick options + weekly calc
        PennyIntroScreen.tsx                      ← NEW: Penny intro + "Let's go!"
    penny/
      types.ts                                    ← NEW: MoodState type
  components/
    PennyAvatar/
      index.ts                                    ← NEW: re-export
      PennyAvatar.tsx                             ← NEW: avatar with mood + size props
    BottomNav/
      index.ts                                    ← NEW: re-export
      BottomNav.tsx                               ← NEW: 5-tab nav
  store/
    goalStore.ts                                  ← MODIFY: add isJustSaving + setJustSaving
```

### References

- `_bmad-output/planning-artifacts/epics/epic-2-authentication-onboarding.md#Story 2.3`
- `_bmad-output/planning-artifacts/epics/epic-2-authentication-onboarding.md#Story 2.4` (Just saving path)
- `_bmad-output/planning-artifacts/epics/epic-2-authentication-onboarding.md#Story 2.5` (Penny intro)
- `_bmad-output/planning-artifacts/architecture.md` — "Frontend Architecture", "API & Communication Patterns", "Implementation Patterns & Consistency Rules"
- `_bmad-output/planning-artifacts/ux-design-specification.md` — Journey 1 (Onboarding), Component Strategy, Form Patterns, UX Consistency Patterns
- `_bmad-output/planning-artifacts/prd.md` — FR2, FR3, FR4, FR5, FR7, FR8
- `_bmad-output/implementation-artifacts/2-2-social-login-google-oauth2-apple-sign-in.md` — File List, Dev Notes, Completion Notes
- `penny/src/store/goalStore.ts` — existing store to extend
- `penny/src/App.tsx` — existing routes to update
- `penny/src/lib/api.ts` — apiClient pattern
- `penny/src/features/auth/components/AgeGate.tsx` — single-screen component pattern to follow

## Senior Developer Review (AI)

**Review Date:** 2026-04-09
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅
**Dismissed:** 0

### Action Items

- [x] [High] Multiple decimal points allowed in amount input — `replace(/[^0-9.]/g, '')` permits `"1.2.3"`; `parseFloat` silently parses as `1.2` while input shows invalid string. [`GoalAmountInput.tsx`]
- [x] [Med] Quick option dates recomputed on every render — `addMonths()` called inside `.map()` on each render; near a month boundary a re-render deselects the active option. [`GoalDatePicker.tsx`]
- [x] [Med] UTC date parsing gives wrong weekly target — `new Date('YYYY-MM-DD')` is UTC midnight; in UTC-N timezones a same-day custom date produces negative diff, clamped to 1 week → weeklyTarget = goalAmount. [`GoalDatePicker.tsx`]
- [x] [Med] CTA invisible for 1s with no affordance — `disabled:opacity-0` hides the button entirely; screen reader users hear nothing about the CTA during that second. [`PennyIntroScreen.tsx`]
- [x] [Decision] Category label used as goalName — resolved as option B: neutral fallback "Let's start saving! 🎯" [AC9, `PennyIntroScreen.tsx`]
- [x] [Low] Redundant aria-label on BottomNav tabs — removed. [`BottomNav.tsx`]

### Deferred

- [x] [Defer] Async setStep after unmount — React 18 suppresses warning, state update is a no-op; not a crash. Pre-existing React pattern. [`OnboardingFlow.tsx`]

### Tasks/Subtasks — Review Follow-ups (AI)

- [x] [AI-Review][High] Fix multiple decimal points in amount input [`GoalAmountInput.tsx`]
- [x] [AI-Review][Med] Memoize quick option dates to prevent active-state loss on re-render [`GoalDatePicker.tsx`]
- [x] [AI-Review][Med] Parse custom date as local time, not UTC [`GoalDatePicker.tsx`]
- [x] [AI-Review][Med] Replace `disabled:opacity-0` with visible-but-inactive CTA pattern [`PennyIntroScreen.tsx`]
- [x] [AI-Review][Decision] Resolved as option B — neutral fallback "Let's start saving! 🎯" [`PennyIntroScreen.tsx`]
- [x] [AI-Review][Low] Remove redundant aria-label from BottomNav tabs with visible text [`BottomNav.tsx`]

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- `MoodState` already defined in `store/pennyStore.ts` — `features/penny/types.ts` re-exports it rather than duplicating
- `BottomNav` tab type narrowing: used `'isPenny' in tab` instead of `tab.isPenny` to satisfy TypeScript discriminated union
- `OnboardingFlow` stores `introGoalName` separately from `goalName` to avoid passing stale state to `PennyIntroScreen` after `setJustSaving()` clears it
- `npm run build` passes with zero TypeScript errors

- 2026-04-09: Addressed code review findings — 6 items resolved (Date: 2026-04-09)

- Created `features/goal/types.ts` — `GoalCategory` union type + `GoalSetupData` interface
- Created `features/goal/api.ts` — `useUpdateAccount` TanStack Query mutation for `PUT /accounts/current`
- Created `features/goal/components/GoalCategoryPicker.tsx` — 5 visual goal cards + "Just saving 💰" ghost button
- Created `features/goal/components/GoalAmountInput.tsx` — `inputmode="decimal"`, 48px font, currency prefix, disabled Next until valid
- Created `features/goal/components/GoalDatePicker.tsx` — 3 quick options + custom date input, instant weekly target calc via `Intl.DateTimeFormat`, no date library
- Created `features/goal/components/PennyIntroScreen.tsx` — PennyAvatar lg + intro message + goal reference + "Let's go!" CTA (visible after 1s)
- Created `features/auth/components/OnboardingFlow.tsx` — 4-step orchestrator with progress dots, back nav, "Just saving" skip path, non-blocking `PUT /accounts/current`
- Created `components/PennyAvatar/PennyAvatar.tsx` — size/mood props, coral radial glow, Framer Motion bounce (respects `useReducedMotion`), static emoji fallback, `role="img"` + `aria-label`
- Created `components/PennyAvatar/index.ts` — re-export
- Created `features/penny/types.ts` — re-exports `MoodState` from `store/pennyStore.ts`
- Updated `store/goalStore.ts` — added `isJustSaving` field + `setJustSaving` action; `setGoal` sets `isJustSaving: false`
- Updated `App.tsx` — `/onboarding/goal` → `<OnboardingFlow />`, added `/home` → `<Home />`
- Created `pages/Home.tsx` — stub with `PennyAvatar` + `BottomNav`
- Created `components/BottomNav/BottomNav.tsx` — 5-tab nav, Penny center tab (PennyAvatar sm), `<nav aria-label="Main navigation">`, 44px+ touch targets
- Created `components/BottomNav/index.ts` — re-export
- Created `features/goal/index.ts` — public API exports
- Updated `features/auth/index.ts` — added `OnboardingFlow` export

### File List

- `penny/src/features/goal/types.ts` — NEW
- `penny/src/features/goal/api.ts` — NEW
- `penny/src/features/goal/index.ts` — NEW
- `penny/src/features/goal/components/GoalCategoryPicker.tsx` — NEW
- `penny/src/features/goal/components/GoalAmountInput.tsx` — NEW
- `penny/src/features/goal/components/GoalDatePicker.tsx` — NEW
- `penny/src/features/goal/components/PennyIntroScreen.tsx` — NEW
- `penny/src/features/auth/components/OnboardingFlow.tsx` — NEW
- `penny/src/features/auth/index.ts` — MODIFIED: added OnboardingFlow export
- `penny/src/features/penny/types.ts` — NEW
- `penny/src/components/PennyAvatar/PennyAvatar.tsx` — NEW
- `penny/src/components/PennyAvatar/index.ts` — NEW
- `penny/src/components/BottomNav/BottomNav.tsx` — NEW
- `penny/src/components/BottomNav/index.ts` — NEW
- `penny/src/store/goalStore.ts` — MODIFIED: isJustSaving + setJustSaving
- `penny/src/App.tsx` — MODIFIED: /onboarding/goal → OnboardingFlow, /home added
- `penny/src/pages/Home.tsx` — NEW
