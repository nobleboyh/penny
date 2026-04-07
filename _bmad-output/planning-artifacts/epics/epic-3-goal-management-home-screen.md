# Epic 3: Goal Management & Home Screen

Users can create, view, and manage saving goals. The home screen hero (GoalProgressCard) is live with neon glow progress, countdown mode, and goal completion celebration. After this epic, the core emotional loop is visible.

## Story 3.1: GoalProgressCard — Home Screen Hero

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

## Story 3.2: Create & Update Saving Goal

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

## Story 3.3: "Just Saving" Goal Mode

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

## Story 3.4: Goal Countdown Mode

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

## Story 3.5: Goal Completion Celebration & Re-engagement

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
