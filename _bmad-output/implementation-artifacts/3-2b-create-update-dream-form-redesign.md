# Story 3.2b: Create/Update Dream — Form UI Redesign

Status: ready-for-dev

## Context

Rework addendum to Story 3.2 (done). Updates `GoalSetupForm` and related components to use the new v2 design language and renames "Saving Goal" → "Dream" throughout the UI. Logic and API calls are unchanged.

Design reference: `./penny-ui/mobile_wishlist/code.html`

## Story

As a user,
I want to create or update a "Dream" using the new visual design,
so that the goal setup experience matches the updated app style.

## Acceptance Criteria

1. **Given** a user taps "New Dream" or "Edit Dream"
   **When** `GoalSetupForm` opens
   **Then** all UI copy uses "Dream" instead of "Goal" (e.g. "What's your dream?", "New Dream", "Edit Dream")

2. **And** the form uses v2 design tokens: `bg-surface-container-lowest` cards, `font-headline` labels, `rounded-xl` inputs, `text-primary` accents

3. **And** the primary CTA button uses `bg-gradient-to-r from-primary to-primary-container text-white rounded-full` style

4. **And** the "Just saving 💰" option is relabeled "Just Saving 💰" and styled as a secondary outlined button

5. **And** the weekly saving target preview uses `font-headline font-extrabold text-primary` typography

6. **And** `GoalProgressCard` entry points ("Set a goal 🎯", "Edit goal") are relabeled to "Add Dream ✨" and "Edit Dream"

7. **And** `npm run build` and `npm run lint` pass with zero errors

## Tasks / Subtasks

- [ ] Update copy in `GoalSetupForm.tsx` (AC: 1)
  - [ ] Step headers: "What's your dream?" / "How much do you need?" / "When do you want it?"
  - [ ] CTA labels: "Next →" (unchanged), "Save Dream", "Update Dream" (based on `mode` prop)
  - [ ] "Just saving 💰" → "Just Saving 💰" (capitalize)

- [ ] Update `GoalSetupForm.tsx` visual styles (AC: 2, 3, 4, 5)
  - [ ] Step container: `bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-black/5`
  - [ ] Primary CTA: `bg-gradient-to-r from-primary to-primary-container text-white rounded-full py-3 px-6 font-headline font-extrabold`
  - [ ] "Just Saving" button: `border-2 border-primary text-primary rounded-full py-3 px-6 font-headline font-bold bg-transparent`
  - [ ] Weekly target preview: `font-headline font-extrabold text-primary text-lg`
  - [ ] Input fields: `rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body`

- [ ] Update `GoalCategoryPicker.tsx` visual styles (AC: 2)
  - [ ] Category option cards: `bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/20`
  - [ ] Selected state: `border-primary bg-primary/5`
  - [ ] Category label: `font-headline font-bold text-sm`

- [ ] Update `GoalProgressCard` entry point labels (AC: 6)
  - [ ] "Set a goal 🎯" → "Add Dream ✨"
  - [ ] "Edit goal" → "Edit Dream"
  - [ ] "Set new goal" (in `GoalCompletionCelebration`) → "New Dream"

- [ ] Update `GoalAmountInput.tsx` visual styles (AC: 2)
  - [ ] Amount input: `inputmode="decimal"`, `rounded-xl border border-outline-variant`, `font-headline font-extrabold text-2xl text-center`
  - [ ] Currency prefix: `text-primary font-headline font-black text-2xl`

- [ ] Update `GoalDatePicker.tsx` visual styles (AC: 2)
  - [ ] Date input: `rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3`
  - [ ] "Skip" link: `text-primary font-bold text-sm underline`

- [ ] Verify all tests still pass after copy/style changes (AC: 7)
  - [ ] Update test assertions that check for old copy ("Set a goal", "Edit goal", "Save Goal")
  - [ ] `npm run build` — zero TS errors
  - [ ] `npm run lint` — zero errors

## Dev Notes

### What Exists — Do NOT Recreate

- `penny/src/features/goal/components/GoalSetupForm.tsx` — MODIFY only
- `penny/src/features/goal/components/GoalCategoryPicker.tsx` — MODIFY only
- `penny/src/features/goal/components/GoalAmountInput.tsx` — MODIFY only
- `penny/src/features/goal/components/GoalDatePicker.tsx` — MODIFY only
- `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` — MODIFY entry point labels only
- `penny/src/features/goal/components/GoalCompletionCelebration.tsx` — MODIFY "Set new goal" copy only

### Scope Boundary

This story is **copy and style only**. Do NOT change:
- Any business logic in `GoalSetupForm`
- The `setGoal()` / `setJustSaving()` store calls
- The `useUpdateAccount` mutation
- The step flow order (category → amount → date)
- Any prop interfaces

### Design Tokens

All tokens already in `globals.css` from Story 1.6. Key ones:
- `bg-surface-container-lowest` = `#ffffff`
- `from-primary to-primary-container` = `#6a37d4` → `#ae8dff`
- `border-outline-variant` = `#abadae`
- `font-headline` = Plus Jakarta Sans
- `font-body` = Be Vietnam Pro

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/features/goal/components/GoalSetupForm.tsx` | MODIFY: copy + styles |
| `penny/src/features/goal/components/GoalCategoryPicker.tsx` | MODIFY: styles |
| `penny/src/features/goal/components/GoalAmountInput.tsx` | MODIFY: styles |
| `penny/src/features/goal/components/GoalDatePicker.tsx` | MODIFY: styles |
| `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` | MODIFY: entry point labels |
| `penny/src/features/goal/components/GoalCompletionCelebration.tsx` | MODIFY: "Set new goal" → "New Dream" |
| `penny/src/features/goal/components/GoalSetupForm.test.tsx` | MODIFY: update copy assertions |

### Design Reference

`./penny-ui/mobile_wishlist/code.html` — goal card styles, button styles, typography.
