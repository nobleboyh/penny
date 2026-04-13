# Story 3.4b: Dream Countdown Mode — v2 Visual Update

Status: ready-for-dev

## Context

Rework addendum to Story 3.4 (done). Updates the countdown mode visual treatment in `YourDreamsSection` to use the new v2 design tokens. The `useGoalCountdown` hook logic is unchanged.

Design reference: `./penny-ui/mobile_wishlist/code.html` (AirPods Pro card at 85% — "Almost there!" state)

## Story

As a user close to reaching a dream,
I want the countdown visual to use the new design style,
so that the excitement of being nearly there is expressed in the updated UI.

## Acceptance Criteria

1. **Given** a user's saved amount is within the countdown threshold (≥90% or ≤$30 remaining)
   **When** the home screen renders
   **Then** the featured dream card enters countdown mode with `bg-secondary-container` (`#26fedc` teal) percentage badge

2. **And** the progress bar uses `bg-gradient-to-r from-primary to-primary-container` (unchanged gradient, no color shift needed — teal badge is the countdown signal)

3. **And** the Pocket Pixel tip banner shows the countdown message: "You're $X away from [Dream]! 🎯" with `mood="confident"`

4. **And** the "Almost there!" label appears below the progress bar in `text-on-surface-variant font-medium text-[10px]`

5. **And** `useGoalCountdown` constants (`COUNTDOWN_THRESHOLD_AMOUNT`, `COUNTDOWN_THRESHOLD_PERCENT`) are unchanged

6. **And** `npm run build` and `npm run lint` pass

## Tasks / Subtasks

- [ ] Update `YourDreamsSection` featured card countdown variant (AC: 1, 2, 4)
  - [ ] Import `useGoalCountdown` from `features/goal`
  - [ ] When `isCountdown`: percentage badge uses `bg-secondary-container text-on-secondary-container` (teal)
  - [ ] When `isCountdown`: add "Almost there!" label: `text-[10px] text-on-surface-variant font-medium` below progress bar
  - [ ] Progress bar gradient unchanged: `bg-gradient-to-r from-primary to-primary-container`

- [ ] Update `PocketPixelTip` countdown message (AC: 3)
  - [ ] When `isCountdown && remainingAmount !== null && goalName`:
    - `message`: `"You're ${fmt} away from ${goalName}! 🎯"`
    - `mood`: `'confident'`
    - `subtext`: `"So close — keep stashing!"`

- [ ] Remove old `PennyAvatar` countdown render from `GoalProgressCard` (cleanup)
  - [ ] `GoalProgressCard` is no longer the home screen hero — remove the `isCountdown` `PennyAvatar` render from it (it was added in Story 3.4 but is now superseded by `PocketPixelTip`)
  - [ ] Keep `useGoalCountdown` export and hook — it is still used by `YourDreamsSection`

- [ ] Add/update tests (AC: 6)
  - [ ] `YourDreamsSection.test.tsx`: countdown badge uses teal class when `isCountdown`
  - [ ] `YourDreamsSection.test.tsx`: "Almost there!" label renders when `isCountdown`

## Dev Notes

### Scope Boundary

- Do NOT change `useGoalCountdown` hook logic or constants
- Do NOT change the countdown threshold values
- The `GoalProgressCard` countdown `PennyAvatar` render cleanup is a side-effect of the home screen restructure — it's safe to remove since `GoalProgressCard` is no longer the home hero

### What Exists

- `penny/src/features/goal/hooks/useGoalCountdown.ts` — `isCountdown`, `remainingAmount`, `COUNTDOWN_THRESHOLD_AMOUNT`, `COUNTDOWN_THRESHOLD_PERCENT`
- `penny/src/components/YourDreamsSection/YourDreamsSection.tsx` — created in Story 3.1b
- `penny/src/components/PocketPixelTip/PocketPixelTip.tsx` — created in Story 3.1b

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/components/YourDreamsSection/YourDreamsSection.tsx` | MODIFY: countdown badge + "Almost there!" label |
| `penny/src/components/YourDreamsSection/YourDreamsSection.test.tsx` | MODIFY: add countdown tests |
| `penny/src/components/PocketPixelTip/PocketPixelTip.tsx` | MODIFY: countdown message + mood |
| `penny/src/components/GoalProgressCard/GoalProgressCard.tsx` | MODIFY: remove countdown PennyAvatar render |

### Design Reference

`./penny-ui/mobile_wishlist/code.html` — AirPods Pro card at 85% with `bg-secondary-container` teal badge and "Almost there!" label.
