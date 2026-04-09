# Story 3.2: Create & Update Saving Goal

Status: done

## Story

As a user,
I want to create a saving goal with a name, target amount, and target date, and update it at any time,
so that I can change what I'm saving for whenever I need to.

## Acceptance Criteria

1. **Given** a user is on the home screen or goal detail view
   **When** they tap to create or update a goal
   **Then** `GoalSetupForm` is presented

2. **And** `GoalSetupForm` accepts goal name, target amount (`inputmode="decimal"`), and optional target date

3. **And** the weekly saving target is calculated and displayed instantly when name + amount + date are all provided (FR4)

4. **And** the goal is saved via `PUT /accounts/current`

5. **And** `goalStore` is updated immediately (optimistic update)

6. **And** `GoalProgressCard` reflects the new goal without a page reload

7. **And** the form uses one question per screen pattern (UX-DR17)

## Tasks / Subtasks

- [x] Create `GoalSetupForm` orchestrator component in `penny/src/features/goal/components/GoalSetupForm.tsx` (AC: 1, 7)
  - [x] Reuse existing `GoalCategoryPicker`, `GoalAmountInput`, `GoalDatePicker` as steps — do NOT recreate them
  - [x] Accept `onComplete: () => void` and `onCancel: () => void` props
  - [x] Accept optional `mode: 'create' | 'update'` prop (default `'create'`) — affects header copy only
  - [x] Wire steps: category → amount → date → done (same flow as `OnboardingFlow`)
  - [x] On completion: call `setGoal()` on `goalStore`, call `useUpdateAccount` mutation, then `onComplete()`
  - [x] Optimistic update: call `setGoal()` before `mutateAsync` resolves (AC: 5)
  - [x] Non-blocking API: catch errors silently — goal is already saved locally (same pattern as `OnboardingFlow`)

- [x] Export `GoalSetupForm` from `penny/src/features/goal/index.ts` (AC: 1)

- [x] Add "Edit goal" entry point to `GoalProgressCard` expanded view (AC: 1, 6)
  - [x] In the expanded section of `GoalProgressCard`, add an "Edit goal" button
  - [x] Button opens `GoalSetupForm` inline via a state flag `isEditing` — no routing change
  - [x] On `GoalSetupForm` `onComplete`: close form (`isEditing = false`); `GoalProgressCard` re-reads from `goalStore` automatically via selectors (AC: 6)
  - [x] On `GoalSetupForm` `onCancel`: close form, no changes

- [x] Add "Set a goal" entry point to `GoalProgressCard` for users with no goal set (AC: 1)
  - [x] If `goalName` is null AND `!isJustSaving`, render a "Set a goal 🎯" CTA button in the card
  - [x] Tapping it sets `isEditing = true` to open `GoalSetupForm` in `'create'` mode

- [x] Write tests for `GoalSetupForm` in `penny/src/features/goal/components/GoalSetupForm.test.tsx` (AC: 1–7)
  - [x] Renders category picker as first step
  - [x] Advances to amount input after category selection
  - [x] Advances to date picker after amount entry
  - [x] Calls `setGoal` on goalStore and `onComplete` after date selection
  - [x] Calls `onCancel` when cancel is triggered

## Dev Notes

### What Exists — Do NOT Recreate

- `penny/src/features/goal/components/GoalCategoryPicker.tsx` — category selection step (already built, reuse as-is)
- `penny/src/features/goal/components/GoalAmountInput.tsx` — amount input step (already built, reuse as-is)
- `penny/src/features/goal/components/GoalDatePicker.tsx` — date picker step with weekly target preview (already built, reuse as-is)
- `penny/src/features/auth/components/OnboardingFlow.tsx` — **reference implementation** for wiring these steps together; `GoalSetupForm` is essentially the same flow extracted as a reusable component
- `penny/src/features/goal/api.ts` — `useUpdateAccount` mutation already exists; `useCurrentAccount` query already exists
- `penny/src/store/goalStore.ts` — `setGoal(name, emoji, amount, targetDate)` and `setJustSaving()` already exist
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — already reads from `goalStore` via selectors; adding `isEditing` state + `GoalSetupForm` render is the only change needed

### GoalSetupForm Component

`GoalSetupForm` is a **reusable extraction** of the goal-setup steps from `OnboardingFlow`. It must NOT duplicate logic — it orchestrates the existing step components.

```typescript
// penny/src/features/goal/components/GoalSetupForm.tsx
interface GoalSetupFormProps {
  mode?: 'create' | 'update'
  onComplete: () => void
  onCancel: () => void
}
```

Internal step type: `'goal-category' | 'goal-amount' | 'goal-date'` — same as `OnboardingFlow`.

Step wiring (copy from `OnboardingFlow`, remove navigate/intro step):
```typescript
// On category select → set local goalName + goalEmoji state → advance to 'goal-amount'
// On amount next → set local goalAmount state → advance to 'goal-date'
// On date next → setGoal() optimistically → fire mutateAsync (non-blocking) → onComplete()
```

The `handleDateNext` in `OnboardingFlow` is the exact pattern to follow:
```typescript
async function handleDateNext(targetDate: string) {
  if (goalAmount === null) return
  setGoal(goalName, goalEmoji, goalAmount, targetDate)  // optimistic — store updated immediately
  onComplete()  // close form immediately, don't wait for API
  try {
    await updateAccount.mutateAsync({
      incomes: [],
      expenses: [],
      saving: { amount: goalAmount, currency: 'USD', interest: 0, deposit: false, capitalization: false },
      note: goalName,
    })
  } catch {
    // non-blocking — goal saved locally in goalStore
  }
}
```

**Important:** Call `onComplete()` before `mutateAsync` (or fire-and-forget after) so the UI closes immediately. Do NOT await before calling `onComplete`.

### GoalProgressCard Changes

Add two things to `GoalProgressCard.tsx`:

1. `isEditing` state: `const [isEditing, setIsEditing] = useState(false)`

2. In the expanded section, add "Edit goal" button:
```tsx
{isExpanded && !isEditing && (
  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
    {/* existing targetDate display */}
    <button
      onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
      className="mt-3 w-full min-h-[44px] rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      Edit goal ✏️
    </button>
  </div>
)}
{isEditing && (
  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
    <GoalSetupForm
      mode="update"
      onComplete={() => { setIsEditing(false); setIsExpanded(false) }}
      onCancel={() => setIsEditing(false)}
    />
  </div>
)}
```

3. "Set a goal" CTA for users with no goal:
```tsx
{!goalName && !isJustSaving && !isEditing && (
  <div className="text-center py-4">
    <button
      onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
      className="min-h-[44px] px-6 rounded-2xl bg-primary font-bold text-primary-foreground text-sm"
    >
      Set a goal 🎯
    </button>
  </div>
)}
```

**Important:** `e.stopPropagation()` on all buttons inside the card to prevent the card's `onClick` toggle from firing.

**Important:** Import `GoalSetupForm` from `../../features/goal` (index), not directly from the component file — architecture boundary rule.

### GoalProgressCard Re-render on Goal Update

`GoalProgressCard` reads from `goalStore` via `useGoalProgress()` which uses Zustand selectors. When `setGoal()` is called in `GoalSetupForm`, Zustand triggers a re-render automatically — no manual refresh needed. AC 6 is satisfied by this reactive pattern.

### Architecture Compliance

- `GoalSetupForm` lives in `features/goal/components/` — feature-specific component, not shared
- Export via `features/goal/index.ts` — other features/components import from `../../features/goal`
- `GoalProgressCard` imports `GoalSetupForm` via `../../features/goal` (index) — not directly
- Tests co-located: `GoalSetupForm.test.tsx` next to `GoalSetupForm.tsx`
- No new routes added — form renders inline within `GoalProgressCard`

### One Question Per Screen (UX-DR17)

The existing step components (`GoalCategoryPicker`, `GoalAmountInput`, `GoalDatePicker`) already implement one-question-per-screen. `GoalSetupForm` just orchestrates them — no layout changes needed.

### Accessibility

- "Edit goal" button: minimum 44px touch target ✅ (min-h-[44px])
- "Set a goal" button: minimum 44px touch target ✅
- `e.stopPropagation()` prevents accidental card toggle when interacting with form
- `GoalSetupForm` renders inside the card — focus management: no special trap needed (inline, not a modal)

### Testing Requirements

`GoalSetupForm.test.tsx` — use `vi.mock` to mock:
- `useGoalStore` → mock `setGoal` action
- `useUpdateAccount` → mock `mutateAsync` returning resolved promise

Test pattern (same as `GoalProgressCard.test.tsx` in story 3.1):
```typescript
vi.mock('../../../store/goalStore', () => ({
  useGoalStore: vi.fn((selector) => selector(mockGoalState))
}))
vi.mock('../api', () => ({
  useUpdateAccount: () => ({ mutateAsync: vi.fn().mockResolvedValue({}) })
}))
```

### What NOT to Do

- Do NOT recreate `GoalCategoryPicker`, `GoalAmountInput`, or `GoalDatePicker` — they exist and work
- Do NOT add a new route for goal editing — inline form in `GoalProgressCard` only
- Do NOT add a separate `/goal/edit` page — Story 3.2 scope is inline editing only
- Do NOT implement countdown mode (Story 3.4) or completion celebration (Story 3.5)
- Do NOT implement "Just saving" mode changes — that's Story 3.3
- Do NOT use `console.error` — use `lib/logger.ts`
- Do NOT import `GoalSetupForm` directly from its file path — use `features/goal` index

### Acceptance Criteria Verification

| AC | Implementation |
|----|----------------|
| 1 — GoalSetupForm presented from home screen / goal detail | "Edit goal" button in expanded `GoalProgressCard` + "Set a goal" CTA |
| 2 — Accepts name, amount (inputmode="decimal"), optional date | Existing `GoalCategoryPicker` + `GoalAmountInput` + `GoalDatePicker` |
| 3 — Weekly target calculated instantly when all fields provided | `GoalDatePicker` already shows weekly target preview |
| 4 — Saved via `PUT /accounts/current` | `useUpdateAccount().mutateAsync()` in `GoalSetupForm.handleDateNext` |
| 5 — `goalStore` updated immediately (optimistic) | `setGoal()` called before `mutateAsync` resolves |
| 6 — `GoalProgressCard` reflects new goal without reload | Zustand selector re-render via `useGoalProgress()` |
| 7 — One question per screen (UX-DR17) | Existing step components already implement this |

### References

- `penny/src/features/goal/components/GoalCategoryPicker.tsx` — reuse as step 1
- `penny/src/features/goal/components/GoalAmountInput.tsx` — reuse as step 2
- `penny/src/features/goal/components/GoalDatePicker.tsx` — reuse as step 3 (already shows weekly target)
- `penny/src/features/auth/components/OnboardingFlow.tsx` — reference implementation for step wiring
- `penny/src/features/goal/api.ts` — `useUpdateAccount` mutation
- `penny/src/store/goalStore.ts` — `setGoal(name, emoji, amount, targetDate)`
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — add `isEditing` state + form render
- `penny/src/features/goal/index.ts` — add `GoalSetupForm` export
- `_bmad-output/planning-artifacts/epics/epic-3-goal-management-home-screen.md#Story 3.2`
- `_bmad-output/planning-artifacts/architecture.md` — Feature module boundaries, component structure, anti-patterns
- `_bmad-output/planning-artifacts/ux-design-specification.md` — UX-DR17 (one question per screen), GoalProgressCard anatomy

## Senior Developer Review (AI)

**Review Date:** 2026-04-09
**Outcome:** Changes Requested
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅
**Dismissed:** 3

### Action Items

- [x] [Review][Patch] `mode="update"` hardcoded in GoalProgressCard — shows "Update your goal" label on create flow; pass `mode={goalName ? 'update' : 'create'}` [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]
- [x] [Review][Patch] No `aria-live` announcement when GoalSetupForm mounts inline — screen readers not notified [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]
- [x] [Review][Patch] Card header tap toggles `isExpanded` while form is open — add `if (isEditing) return` guard to the card's `toggle` function [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]

### Deferred

- [x] [Review][Defer] `mutateAsync` called after `onComplete()` may log unmounted-component warning from TanStack Query — cosmetic, not a correctness issue [`penny/src/features/goal/components/GoalSetupForm.tsx`]
- [x] [Review][Defer] "Just saving" users have no upgrade path to specific goal from home screen — dependency on Story 3.3 [`penny/src/components/GoalProgressCard/GoalProgressCard.tsx`]

### Tasks/Subtasks — Review Follow-ups (AI)

- [x] [AI-Review][Patch] Fix hardcoded `mode="update"` → dynamic `mode={goalName ? 'update' : 'create'}`
- [x] [AI-Review][Patch] Add `aria-live="polite"` region for inline form mount announcement
- [x] [AI-Review][Patch] Guard `toggle` function: skip expand/collapse when `isEditing` is true

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

- `useGoalStore` mock initially used selector pattern — fixed to return store object directly (component uses destructuring, not selector)

### Completion Notes List

- Created `GoalSetupForm` in `features/goal/components/GoalSetupForm.tsx` — orchestrates existing `GoalCategoryPicker` → `GoalAmountInput` → `GoalDatePicker` steps; no logic duplicated
- Optimistic update: `setGoal()` called before `mutateAsync`; `onComplete()` called immediately (fire-and-forget API)
- Added `GoalSetupForm` export to `features/goal/index.ts`
- Updated `GoalProgressCard`: added `isEditing` state, "Edit goal" button in expanded view, "Set a goal" CTA for no-goal state, inline `GoalSetupForm` render with `e.stopPropagation()` guards
- `GoalProgressCard` imported `GoalSetupForm` via `../../features/goal` index (architecture boundary respected)
- All 13 tests pass (8 existing GoalProgressCard + 5 new GoalSetupForm); 0 lint errors; build passes

### File List

- `penny/src/features/goal/components/GoalSetupForm.tsx` — CREATED
- `penny/src/features/goal/components/GoalSetupForm.test.tsx` — CREATED
- `penny/src/features/goal/index.ts` — MODIFIED: added `GoalSetupForm` export
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — MODIFIED: added `isEditing` state, "Edit goal" button, "Set a goal" CTA, inline `GoalSetupForm`
