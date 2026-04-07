# Epic 5: Habit & Engagement Mechanics

Users have a daily streak system, stories-style weekly summary, emoji spending breakdown, and Glow Up stats view. After this epic, the retention mechanics are live.

## Story 5.1: Daily Streak Tracking & StreakBadge

As a user,
I want to see my daily logging streak and have Penny celebrate milestones,
So that I'm motivated to log every day and build a habit.

**Acceptance Criteria:**

**Given** a user logs their first transaction of the day
**When** the log is confirmed
**Then** `streakStore.streakCount` increments by 1
**And** `streakStore.lastLogDate` is updated to today's date (local timezone, `YYYY-MM-DD`)
**And** `StreakBadge` displays the updated streak count with 🔥
**And** `StreakBadge` is visible on the home screen without navigation
**And** `StreakBadge` has `aria-label="X day streak"` (UX-DR12)
**Given** a streak milestone is reached (3, 7, 14, 30 days)
**When** the streak increments to a milestone
**Then** `PennyAvatar` displays in `excited` mood with a milestone-specific message
**And** FR30 is satisfied — every transaction addition is acknowledged regardless of amount

## Story 5.2: Stories-Style Weekly Summary

As a user,
I want to swipe through a weekly spending summary presented as story cards,
So that I can review my week in a format that feels native and effortless.

**Acceptance Criteria:**

**Given** a user navigates to the "Penny Says" tab
**When** the weekly summary is shown
**Then** `StoriesWeeklySummary` renders 4–5 swipeable cards: week overview, top spending category, goal delta, streak highlight, Penny's verdict
**And** cards are navigated by horizontal swipe or tap on right/left half
**And** arrow key navigation works on desktop (UX-DR13)
**And** each card has a descriptive `aria-label`
**And** data is derived from the current week's transactions in TanStack Query cache
**And** if no transactions exist for the week, Penny's card shows an encouraging empty state (UX-DR16)

## Story 5.3: Emoji Spending Breakdown

As a user,
I want to see my spending broken down by category as emoji stacks,
So that I can understand my spending patterns without reading numbers.

**Acceptance Criteria:**

**Given** a user navigates to the "My Journey" tab
**When** the emoji breakdown is shown
**Then** `EmojiBreakdown` displays each spending category as a row of repeated emoji (e.g., 🧋🧋🧋🧋 Drinks $24)
**And** the number of emoji per row is proportional to the spend amount relative to the largest category
**And** the actual spend amount is shown alongside the emoji
**And** no red color is used for any category amount
**And** categories with zero spend this week are hidden
**And** data is derived from the current week's transactions

## Story 5.4: Glow Up Stats View

As a user,
I want to see my financial improvement over time as the default stats view, with raw numbers one tap away,
So that I always see progress first, never a deficit.

**Acceptance Criteria:**

**Given** a user navigates to the "My Journey" tab
**When** the stats view loads
**Then** `GlowUpStats` is the default view showing improvement metrics: savings growth %, streak best, goal progress delta
**And** all metrics are framed positively — "2.6x more than last month 🚀" not "spent $X"
**And** a secondary "See numbers" tap reveals raw transaction totals
**And** raw numbers view uses neutral colors — no red for any value
**And** data is fetched via `GET /statistics/{account}` through TanStack Query
**And** a skeleton screen is shown during initial load
