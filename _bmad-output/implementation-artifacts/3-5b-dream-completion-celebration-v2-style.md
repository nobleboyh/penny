# Story 3.5b: Dream Completion Celebration — v2 Style Update

Status: ready-for-dev

## Context

Rework addendum to Story 3.5 (done). Updates `GoalCompletionCelebration` to use the new v2 design tokens, Pocket Pixel PNG avatar, and updated copy ("Dream" instead of "Goal"). Logic and flow are unchanged.

Design reference: v2 design tokens from `./penny-ui/mobile_dashboard/code.html`

## Story

As a user who reaches a dream,
I want the celebration screen to use the new visual design and Pocket Pixel mascot,
so that the achievement moment feels consistent with the updated app.

## Acceptance Criteria

1. **Given** a user's saved amount reaches their dream target
   **When** `GoalCompletionCelebration` renders
   **Then** it shows `PocketPixelAvatar` (size `lg`, mood `'confident'`) instead of the old `PennyAvatar`

2. **And** the overlay background uses `bg-gradient-to-br from-primary to-primary-container` (violet gradient) instead of the old dark backdrop

3. **And** all copy uses "Dream" terminology: "Dream Complete! 🎉", "Ready for your next dream?", "New Dream", "Not yet"

4. **And** the dismiss CTA uses `bg-white text-primary rounded-full font-headline font-black` style

5. **And** the "New Dream" primary CTA uses `bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-headline font-extrabold` style

6. **And** confetti animation (when `!reducedMotion`) uses the v2 palette colors: `#6a37d4`, `#26fedc`, `#f4db36`

7. **And** `npm run build` and `npm run lint` pass

## Tasks / Subtasks

- [ ] Replace `PennyAvatar` with `PocketPixelAvatar` in `GoalCompletionCelebration.tsx` (AC: 1)
  - [ ] Import `PocketPixelAvatar` from `../../components/PocketPixelAvatar`
  - [ ] Replace `<PennyAvatar size="lg" mood="celebrating" />` with `<PocketPixelAvatar size="lg" mood="confident" />`

- [ ] Update overlay background (AC: 2)
  - [ ] Replace dark backdrop (`bg-black/80` or similar) with `bg-gradient-to-br from-primary to-primary-container`
  - [ ] Text on overlay: `text-on-primary` (`#f8f0ff`)

- [ ] Update all copy (AC: 3)
  - [ ] "Goal Complete!" → "Dream Complete! 🎉"
  - [ ] "Ready for your next goal?" → "Ready for your next dream?"
  - [ ] "Set new goal" → "New Dream"
  - [ ] "Not yet" — unchanged

- [ ] Update CTA button styles (AC: 4, 5)
  - [ ] Dismiss CTA: `bg-white text-primary rounded-full py-3 px-8 font-headline font-black text-base`
  - [ ] "New Dream" CTA: `bg-gradient-to-r from-primary to-primary-container text-white rounded-full py-3 px-8 font-headline font-extrabold text-base`
  - [ ] "Not yet" CTA: `border-2 border-white/60 text-white rounded-full py-3 px-8 font-headline font-bold text-base bg-transparent`

- [ ] Update confetti colors (AC: 6)
  - [ ] In `styles/animations.css` or inline confetti: replace old coral/mint colors with `#6a37d4`, `#26fedc`, `#f4db36`, `#ae8dff`

- [ ] Update tests (AC: 7)
  - [ ] Update `GoalCompletionCelebration.test.tsx` copy assertions: "Dream Complete!", "New Dream", "Ready for your next dream?"
  - [ ] Add test: `PocketPixelAvatar` renders (not `PennyAvatar`)

## Dev Notes

### What Exists — MODIFY Only

- `penny/src/features/goal/components/GoalCompletionCelebration.tsx` — MODIFY
- `penny/src/features/goal/components/GoalCompletionCelebration.test.tsx` — MODIFY
- `penny/src/styles/animations.css` — MODIFY confetti colors
- `penny/src/components/PocketPixelAvatar/` — created in Story 3.1b

### Scope Boundary

Do NOT change:
- The 2-second unskippable phase logic
- The `useGoalCompletion` hook
- The `resetGoal()` + `navigate('/onboarding/goal')` flow
- The `prefers-reduced-motion` handling

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/features/goal/components/GoalCompletionCelebration.tsx` | MODIFY: avatar, overlay, copy, button styles |
| `penny/src/features/goal/components/GoalCompletionCelebration.test.tsx` | MODIFY: copy assertions + avatar test |
| `penny/src/styles/animations.css` | MODIFY: confetti colors |

### Design Reference

`./penny-ui/mobile_dashboard/code.html` — color palette and button styles.
