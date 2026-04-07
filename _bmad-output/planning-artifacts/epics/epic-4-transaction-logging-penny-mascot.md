# Epic 4: Transaction Logging & Penny Mascot

Users can log transactions via Penny chat (natural language), see Penny's contextual reactions, and have offline logging with sync on reconnect. After this epic, the core daily habit loop is complete.

## Story 4.1: Penny Mood Engine & Avatar

As a user,
I want Penny to display different mood states reflecting my financial activity,
So that the app feels alive and emotionally responsive.

**Acceptance Criteria:**

**Given** the app is running
**When** Penny's mood state is evaluated
**Then** `moodEngine(state)` in `features/penny/moodEngine.ts` is a pure function with no side effects
**And** it accepts: goal progress %, streak count, days since last log, recent transaction patterns
**And** it returns one of ≤10 mood states: `idle`, `happy`, `excited`, `sad`, `celebrating`, `worried`, `proud`, `neutral`, `thinking`, `disappointed`
**And** `PennyAvatar` renders the correct Lottie animation for each mood state
**And** `PennyAvatar` has size variants: `sm` (40px), `md` (80px), `lg` (160px)
**And** if Lottie fails to load, a 🐷 emoji fallback is shown
**And** `PennyAvatar` has `aria-label="Penny, your saving buddy"` and `role="img"`
**And** all animations respect `prefers-reduced-motion` (NFR18)
**And** mood state is stored in `pennyStore.currentMood` — components never call `moodEngine` directly

## Story 4.2: PennyChatInput — Natural Language Logging

As a user,
I want to log a transaction by typing naturally to Penny,
So that logging feels like sending a text, not filling out a form.

**Acceptance Criteria:**

**Given** a user taps the Penny center tab
**When** `PennyChatInput` opens
**Then** a bottom sheet slides up with auto-focused text input
**And** the input has `aria-label="Tell Penny what you spent"`
**And** as the user types, `lib/nlp.ts` extracts amount and suggests a category with emoji in real-time
**And** `nlp.ts` handles formats: "$6", "6 dollars", "spent 6", "bubble tea $6"
**And** `nlp.ts` returns `{ amount, category, emoji, confidence }`
**And** a single tap on the confirm button logs the transaction
**And** the sheet dismisses on confirm or swipe down
**And** the full flow from tap to confirmation completes in ≤5 seconds (NFR2)
**And** keyboard submit (Enter) triggers confirmation

## Story 4.3: Transaction Category Correction & Fallback Form

As a user,
I want to correct a wrong category with one tap and have a form fallback when Penny can't parse my input,
So that I'm never stuck with a wrong category or a failed log.

**Acceptance Criteria:**

**Given** Penny has parsed a transaction
**When** the suggested category is wrong
**Then** a one-tap category picker row shows 5 emoji options: 🧋 Drinks / 🍟 Food / 👟 Shopping / 🎮 Fun / ➕ Other
**And** tapping a category updates the selection without re-entering the amount
**Given** `nlp.ts` returns `confidence` below threshold (ambiguous input)
**When** the user submits
**Then** a structured fallback form is shown with amount pre-filled and category picker visible
**And** the fallback form requires no more than 2 taps to complete

## Story 4.4: Contextual Penny Response at Logging

As a user,
I want Penny to respond with a contextual message every time I log a transaction,
So that logging feels personal and motivating rather than mechanical.

**Acceptance Criteria:**

**Given** a user confirms a transaction
**When** the log is saved
**Then** `PennyResponseBubble` appears with a contextual message from `features/penny/responseTemplates.ts`
**And** the message is selected based on: category, frequency this week, streak state, goal proximity
**And** at least 20 distinct message templates exist — no two consecutive logs show the same template
**And** `PennyResponseBubble` has `role="status"` and `aria-live="polite"` (UX-DR9)
**And** the bubble animates in (slide up + fade) respecting `prefers-reduced-motion`
**And** `GoalProgressCard` progress bar animates the delta after each log
**And** Penny's mood is recalculated via `moodEngine()` after every log

## Story 4.5: Offline Transaction Logging & Sync

As a user,
I want to log transactions without a network connection and have them sync automatically when I'm back online,
So that I never lose a transaction due to poor connectivity.

**Acceptance Criteria:**

**Given** a user is offline (no network connection)
**When** they log a transaction via `PennyChatInput`
**Then** the transaction is written to Dexie `pendingSync` table first
**And** an optimistic update is applied to TanStack Query cache (goal progress updates instantly)
**And** no error is shown to the user — the flow feels identical to online logging
**And** `StreakBadge` shows an amber dot indicator while transactions are pending sync (UX-DR12)
**Given** the user comes back online
**When** `useOfflineSync` detects `navigator.onLine` is true
**Then** all entries in `pendingSync` are flushed to `PUT /statistics/{account}` in insertion order
**And** successfully synced entries are removed from `pendingSync`
**And** entries that fail after 3 retries are moved to `failedSync` table

## Story 4.6: Transaction History View

As a user,
I want to view all my logged transactions,
So that I can review what I've spent and earned.

**Acceptance Criteria:**

**Given** a user navigates to the transaction history
**When** the view loads
**Then** all transactions are listed in reverse chronological order
**And** each entry shows: category emoji, description, amount (Money In green / Money Out neutral), date
**And** no red color is used for any transaction amount (UX anti-pattern)
**And** the list is fetched via `GET /statistics/{account}` through TanStack Query
**And** a skeleton screen (not spinner) is shown during initial load
**And** the empty state shows Penny with "Everyone starts at zero. Log your first $1 🐷" + "Tell Penny" CTA (UX-DR16)
**And** swipe-to-delete removes a transaction with Penny acknowledging: "Got it, removed 🐷"

## Story 4.7: Penny Streak-Break Reaction

As a user,
I want Penny to react with empathy (not shame) when I miss a day,
So that a broken streak doesn't make me feel bad or abandon the app.

**Acceptance Criteria:**

**Given** a user opens the app after missing at least one full day without logging
**When** the streak state is evaluated
**Then** `PennyAvatar` displays in `sad` mood state
**And** Penny's message is non-shaming: "I missed you 🐷💔 — your streak reset, but your savings didn't."
**And** the streak counter resets to 0 in `streakStore`
**And** goal progress and total saved are unchanged
**And** Penny's message references the user's current savings amount to reinforce progress
**And** the user can immediately log a transaction to start a new streak from Day 1
