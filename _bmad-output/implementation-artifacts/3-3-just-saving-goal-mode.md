# Story 3.3: "Just Saving" Goal Mode

Status: done

## Story

As a user,
I want to save money without a specific target amount or date,
so that I'm not excluded if I don't have a concrete goal yet.

## Acceptance Criteria

1. **Given** a user selects "Just saving 💰" during onboarding or goal setup
   **When** they reach the home screen
   **Then** `GoalProgressCard` shows total amount saved with no target amount or progress percentage

2. **And** no "X% to goal" language is shown — only total saved

3. **And** Penny's home screen message is encouraging without referencing a missing goal

4. **And** the user can upgrade to a specific goal at any time via the goal update flow (Story 3.2)

5. **And** `goalStore` correctly represents the "Just saving" state with `isJustSaving: true`, `goalAmount: null`, `targetDate: null`

## Tasks / Subtasks

- [x] Fix `GoalSetupForm` to call `setJustSaving()` when "Just saving 💰" is tapped (AC: 1, 5)
  - [x] In `GoalSetupForm.tsx`, replace `onJustSaving={onCancel}` with a handler that calls `setJustSaving()` then `onComplete()`
  - [x] Import `setJustSaving` from `useGoalStore` in `GoalSetupForm`
  - [x] The handler must also fire-and-forget `updateAccount.mutateAsync` with the "just saving" payload (same non-blocking pattern as `handleDateNext`)

- [x] Verify `GoalProgressCard` renders correctly in "Just saving" mode (AC: 1, 2)
  - [x] No progress bar rendered (guarded by `!isJustSaving && goalAmount` — already correct)
  - [x] No "Goal" amount row rendered (same guard — already correct)
  - [x] No weekly target row rendered (weeklyTarget is null when isJustSaving — already correct)
  - [x] "Every penny counts 🐷" message shown in expanded view (already in place)
  - [x] "Edit goal" button in expanded view allows upgrading to a specific goal (already in place via Story 3.2)

- [x] Add "Upgrade to specific goal" CTA visible without expanding the card (AC: 4)
  - [x] When `isJustSaving && !isEditing`, render a subtle secondary CTA below the saved amount: "Set a goal 🎯"
  - [x] Tapping it sets `isEditing = true` to open `GoalSetupForm` in `'create'` mode
  - [x] This CTA is distinct from the existing "Set a goal" CTA (which shows when `!goalName && !isJustSaving`)

- [x] Update `GoalSetupForm` tests to cover the "Just saving" path (AC: 1, 5)
  - [x] Add test: tapping "Just saving 💰" calls `setJustSaving` and `onComplete`
  - [x] Add test: `setJustSaving` is NOT called when a category is selected normally

- [x] Update `GoalProgressCard` tests to cover "Just saving" upgrade CTA (AC: 4)
  - [x] Add test: "Set a goal 🎯" CTA renders when `isJustSaving: true`
  - [x] Add test: tapping CTA opens `GoalSetupForm`

## Dev Notes

### The Core Bug to Fix

`GoalSetupForm` currently wires `GoalCategoryPicker`'s "Just saving 💰" button to `onCancel`:

```typescript
// penny/src/features/goal/components/GoalSetupForm.tsx — CURRENT (wrong)
<GoalCategoryPicker onSelect={handleCategorySelect} onJustSaving={onCancel} />
```

This means tapping "Just saving 💰" just closes the form without updating `goalStore`. The fix:

```typescript
// GoalSetupForm.tsx — FIXED
const { setGoal, setJustSaving } = useGoalStore()

function handleJustSaving() {
  setJustSaving()  // optimistic — store updated immediately
  onComplete()     // close form immediately
  // fire-and-forget API (same pattern as handleDateNext)
  updateAccount.mutateAsync({
    incomes: [],
    expenses: [],
    saving: { amount: 0, currency: 'USD', interest: 0, deposit: false, capitalization: false },
    note: JSON.stringify({ goalName: 'Just saving', goalEmoji: '💰', targetDate: null }),
  }).catch(() => {})
}

// In render:
<GoalCategoryPicker onSelect={handleCategorySelect} onJustSaving={handleJustSaving} />
```

### What `setJustSaving()` Does

Already implemented in `goalStore.ts`:
```typescript
setJustSaving: () =>
  set({ goalName: 'Just saving', goalEmoji: '💰', goalAmount: null, targetDate: null, isJustSaving: true }),
```

After calling this, `useGoalProgress()` returns:
- `isJustSaving: true`
- `goalAmount: null`
- `progressPercent: null` (no progress bar)
- `weeklyTarget: null` (no weekly target row)

### GoalProgressCard — "Just Saving" Upgrade CTA

The card already handles `isJustSaving` in the expanded view ("Every penny counts 🐷" + "Edit goal" button). But the user needs a visible upgrade path WITHOUT expanding the card. Add this below the saved amount row:

```tsx
{isJustSaving && !isEditing && (
  <div className="mt-2">
    <button
      onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
      className="w-full min-h-[44px] rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      aria-label="Set a specific saving goal"
    >
      Set a goal 🎯
    </button>
  </div>
)}
```

This is different from the existing `!goalName && !isJustSaving` CTA — that one is for users with no goal at all. This one is for users who explicitly chose "Just saving."

**Important:** `GoalSetupForm` opened from this CTA uses `mode="create"` (not `'update'`) since the user is upgrading from "Just saving" to a specific goal. The `mode` prop in `GoalProgressCard` is already dynamic: `mode={goalName ? 'update' : 'create'}`. Since `goalName` is `'Just saving'` when `isJustSaving` is true, this would incorrectly show `mode="update"`. Fix: change the condition to `mode={goalName && !isJustSaving ? 'update' : 'create'}`.

### Penny's Message (AC: 3)

AC 3 says "Penny's home screen message is encouraging without referencing a missing goal." The `PennyResponseBubble` / Penny mood is driven by `moodEngine()` in `features/penny/moodEngine.ts`. Verify that the mood engine does not produce a message referencing a missing goal when `isJustSaving` is true. If it does, update `responseTemplates.ts` to add a "just saving" context branch. Check `features/penny/moodEngine.ts` and `features/penny/responseTemplates.ts` before implementing — this may already be handled or may be a no-op if Penny's home message isn't yet wired.

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/features/goal/components/GoalSetupForm.tsx` | Add `handleJustSaving`, import `setJustSaving`, fix `onJustSaving` prop |
| `penny/src/features/goal/components/GoalSetupForm.test.tsx` | Add "Just saving" path tests |
| `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` | Add "Just saving" upgrade CTA; fix `mode` prop condition |
| `penny/src/components/GoalProgressCard/GoalProgressCard.test.tsx` | Add upgrade CTA tests |
| `penny/src/features/penny/moodEngine.ts` | Check/update if needed (AC: 3) |
| `penny/src/features/penny/responseTemplates.ts` | Check/update if needed (AC: 3) |

### Architecture Compliance

- `setJustSaving` imported from `useGoalStore` — same pattern as `setGoal` already in `GoalSetupForm`
- `GoalProgressCard` imports `GoalSetupForm` via `../../features/goal` index — do NOT change this
- No new routes, no new components — all changes are within existing files
- `e.stopPropagation()` on all buttons inside the card (already established pattern)
- Use `lib/logger.ts` not `console.error`

### Testing Pattern

Follow the existing mock pattern in `GoalSetupForm.test.tsx`:

```typescript
// Mock setJustSaving alongside setGoal
const mockSetJustSaving = vi.fn()
vi.mock('../../../store/goalStore', () => ({
  useGoalStore: vi.fn((selector) => selector({
    setGoal: mockSetGoal,
    setJustSaving: mockSetJustSaving,
  }))
}))

// Test: "Just saving" path
it('calls setJustSaving and onComplete when Just saving is tapped', async () => {
  render(<GoalSetupForm onComplete={mockOnComplete} onCancel={mockOnCancel} />)
  fireEvent.click(screen.getByRole('button', { name: /just saving/i }))
  expect(mockSetJustSaving).toHaveBeenCalledTimes(1)
  expect(mockOnComplete).toHaveBeenCalledTimes(1)
  expect(mockOnCancel).not.toHaveBeenCalled()
})
```

### What NOT to Do

- Do NOT recreate `GoalCategoryPicker` — the "Just saving 💰" button already exists in it
- Do NOT add a new route or page for "Just saving" mode
- Do NOT implement countdown mode (Story 3.4) or completion celebration (Story 3.5)
- Do NOT use `console.error` — use `lib/logger.ts`
- Do NOT import `GoalSetupForm` directly from its file path — use `features/goal` index

### Acceptance Criteria Verification

| AC | Implementation |
|----|----------------|
| 1 — GoalProgressCard shows total saved, no target/progress | `isJustSaving` guards already in place; `setJustSaving()` now correctly called |
| 2 — No "X% to goal" language | Progress bar + "Goal" row hidden when `isJustSaving` (existing guards) |
| 3 — Penny message encouraging, no missing-goal reference | Check/update `moodEngine.ts` + `responseTemplates.ts` |
| 4 — User can upgrade to specific goal | "Set a goal 🎯" CTA added to card when `isJustSaving && !isEditing` |
| 5 — goalStore: `isJustSaving: true`, `goalAmount: null`, `targetDate: null` | `setJustSaving()` already sets this correctly; fix ensures it's called |

### References

- `penny/src/features/goal/components/GoalSetupForm.tsx` — fix `onJustSaving` handler
- `penny/src/features/goal/components/GoalCategoryPicker.tsx` — "Just saving 💰" button already exists
- `penny/src/store/goalStore.ts` — `setJustSaving()` already implemented
- `penny/src/features/goal/hooks/useGoalProgress.ts` — `isJustSaving` already returned
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — add upgrade CTA, fix `mode` condition
- `penny/src/features/penny/moodEngine.ts` — verify AC 3
- `penny/src/features/penny/responseTemplates.ts` — verify AC 3
- `_bmad-output/planning-artifacts/epics/epic-3-goal-management-home-screen.md#Story 3.3`
- `_bmad-output/planning-artifacts/architecture.md` — Feature module boundaries, anti-patterns
- `_bmad-output/implementation-artifacts/3-2-create-update-saving-goal.md` — GoalSetupForm patterns, GoalProgressCard patterns

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (Kiro CLI)

### Debug Log References

### Completion Notes List

- Fixed `GoalSetupForm`: added `handleJustSaving()` that calls `setJustSaving()` + `onComplete()` + fire-and-forget API; wired to `GoalCategoryPicker.onJustSaving`
- Added "Set a goal 🎯" upgrade CTA to `GoalProgressCard` for `isJustSaving` state (visible without expanding)
- Fixed `mode` prop condition: `goalName && !isJustSaving ? 'update' : 'create'` so "Just saving" users get create flow
- AC 3 (Penny message): `moodEngine.ts` / `responseTemplates.ts` not yet implemented — no-op, no changes needed
- All 17 tests pass (10 GoalProgressCard + 7 GoalSetupForm), zero regressions

### File List

- `penny/src/features/goal/components/GoalSetupForm.tsx` — MODIFIED: added `handleJustSaving`, imported `setJustSaving`
- `penny/src/features/goal/components/GoalSetupForm.test.tsx` — MODIFIED: added `mockSetJustSaving`, 2 new tests
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — MODIFIED: added "Just saving" upgrade CTA, fixed `mode` condition
- `penny/src/components/GoalProgressCard/GoalProgressCard.test.tsx` — MODIFIED: added `GoalSetupForm` mock, 2 new tests
