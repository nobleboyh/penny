# Epic 3: Goal Management & Home Screen

Users can create, view, and manage saving dreams. The home screen shows "Your Dreams" multi-goal horizontal scroll with Pocket Pixel mascot tip, countdown mode, and dream completion celebration. After this epic, the core emotional loop is visible.

> **Sprint Change 2026-04-13:** Rework addendum stories (3-1b through 3-5b) update this epic to the v2 design — "Your Dreams" home screen, "Dream" terminology, Pocket Pixel mascot, v2 Material Design tokens.

## Story 3.1: GoalProgressCard — Home Screen Hero *(done)*

As a user,
I want to see my goal progress on the home screen without any navigation,
So that I can check my progress at a glance every time I open the app.

**Acceptance Criteria:**

**Given** a user has an active goal
**When** they open the home screen
**Then** `GoalProgressCard` is visible without any navigation or taps
**And** the card shows: goal name, goal emoji, progress bar, amount saved, total target, and weekly saving target
**And** the progress bar has a neon glow effect (coral `box-shadow`) that intensifies as percentage increases (UX-DR5)
**And** the progress bar has `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` (UX-DR7)
**And** tapping the card expands to a full goal detail view
**And** goal data is fetched via `GET /accounts/current` through TanStack Query

## Story 3.1b: Your Dreams — Home Screen Redesign *(rework addendum — ready-for-dev)*

As a user,
I want to see all my saving dreams in a horizontal scroll on the home screen,
So that I can track multiple goals at a glance with the new visual design.

**File:** `_bmad-output/implementation-artifacts/3-1b-your-dreams-home-screen-redesign.md`

## Story 3.2: Create & Update Saving Goal *(done)*

As a user,
I want to create a saving goal with a name, target amount, and target date, and update it at any time,
So that I can change what I'm saving for whenever I need to.

**Acceptance Criteria:**

**Given** a user is on the home screen or goal detail view
**When** they create or update a goal
**Then** `GoalSetupForm` accepts goal name, target amount (`inputmode="decimal"`), and optional target date
**And** the weekly saving target is calculated and displayed instantly when name + amount + date are all provided (FR4)
**And** the goal is saved via `PUT /accounts/current`
**And** `goalStore` is updated immediately (optimistic update)
**And** `GoalProgressCard` reflects the new goal without a page reload
**And** the form uses one question per screen pattern (UX-DR17)

## Story 3.2b: Create/Update Dream — Form UI Redesign *(rework addendum — ready-for-dev)*

As a user,
I want to create or update a "Dream" using the new visual design,
So that the goal setup experience matches the updated app style.

**File:** `_bmad-output/implementation-artifacts/3-2b-create-update-dream-form-redesign.md`

## Story 3.3: "Just Saving" Goal Mode *(done)*

As a user,
I want to save money without a specific target amount or date,
So that I'm not excluded if I don't have a concrete goal yet.

**Acceptance Criteria:**

**Given** a user selects "Just saving 💰" or creates a goal without amount/date
**When** they reach the home screen
**Then** `GoalProgressCard` shows total amount saved with no target amount or progress percentage
**And** no "X% to goal" language is shown — only total saved
**And** Penny's home screen message is encouraging without referencing a missing goal
**And** the user can upgrade to a specific goal at any time via the goal update flow (Story 3.2)
**And** `goalStore` correctly represents the "Just saving" state with null target amount and date

## Story 3.3b: "Just Saving" Mode — v2 Card Style Update *(rework addendum — ready-for-dev)*

As a user in "Just Saving" mode,
I want the home screen to show my total stash in the new visual style,
So that the experience is consistent with the updated design.

**File:** `_bmad-output/implementation-artifacts/3-3b-just-saving-mode-v2-card-update.md`

## Story 3.4: Goal Countdown Mode *(done)*

As a user,
I want a distinct visual experience when I'm close to my goal,
So that I feel the excitement and urgency of being nearly there.

**Acceptance Criteria:**

**Given** a user's saved amount is within a configurable threshold of their goal target (default: $30 or 90%)
**When** the home screen renders
**Then** `GoalProgressCard` enters countdown mode: glow intensifies, color shifts to `--accent` (mint green)
**And** `PennyAvatar` displays in `excited` mood state
**And** Penny's message references the specific remaining amount ("You're $18 away from AirPods! 🎧")
**And** the threshold value is configurable via a constant (not hardcoded inline)
**And** countdown mode is only shown for goals with a defined target amount (not "Just saving")

## Story 3.4b: Dream Countdown Mode — v2 Visual Update *(rework addendum — ready-for-dev)*

As a user close to reaching a dream,
I want the countdown visual to use the new design style,
So that the excitement of being nearly there is expressed in the updated UI.

**File:** `_bmad-output/implementation-artifacts/3-4b-dream-countdown-mode-v2-visual-update.md`

## Story 3.5: Goal Completion Celebration & Re-engagement *(done)*

As a user,
I want a full-screen celebration when I reach my goal and an immediate prompt to set my next one,
So that the achievement feels rewarding and I stay engaged.

**Acceptance Criteria:**

**Given** a user logs a transaction that brings their total to or above their goal target
**When** the update is processed
**Then** a full-screen celebration overlay triggers: confetti animation + `PennyAvatar` (lg) in `celebrating` mood
**And** the overlay is unskippable for 2 seconds, then shows a dismiss CTA (UX-DR19)
**And** the overlay displays: goal name, total saved, days taken
**And** after dismissing, a re-engagement screen asks "Ready for your next goal?" with a primary CTA "Set new goal"
**And** tapping "Set new goal" routes to the goal setup flow (Story 3.2) with a clean state
**And** tapping "Not yet" returns to the home screen with the completed goal shown
**And** all animations respect `prefers-reduced-motion` — reduced motion users see an instant state change with static celebration screen (NFR18)

## Story 3.5b: Dream Completion Celebration — v2 Style Update *(rework addendum — ready-for-dev)*

As a user who reaches a dream,
I want the celebration screen to use the new visual design and Pocket Pixel mascot,
So that the achievement moment feels consistent with the updated app.

**File:** `_bmad-output/implementation-artifacts/3-5b-dream-completion-celebration-v2-style.md`
