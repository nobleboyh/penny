# Epic 6: What If Simulator & Sharing

Users can access the slider-based trade-off simulator, generate shareable cards for simulator results and milestones, and share via native share sheet. After this epic, the primary viral distribution mechanic is live.

## Story 6.1: What If Simulator

As a user,
I want to use a slider to see how reducing a spending category affects my goal timeline,
So that I can make informed trade-off decisions and feel motivated to cut back.

**Acceptance Criteria:**

**Given** a user navigates to the "My Journey" tab
**When** they tap "✨ What If?" on a spending category
**Then** `WhatIfSimulator` opens showing the selected category, current weekly spend, and a reduction slider (0–100%)
**And** as the slider moves, the adjusted goal completion date updates in real-time with ≤100ms visual latency (NFR3)
**And** the impact statement reads: "Save $X extra/week → [Goal] Y weeks sooner"
**And** a "for informational purposes only" disclaimer is always visible on the simulator (FR47)
**And** the slider has `aria-label` and `aria-valuetext` with a human-readable description (UX-DR10)
**And** calculation is debounced at 100ms — no calculation fires on every pixel of slider movement
**And** the simulator is only available for goals with a defined target amount and date

## Story 6.2: Shareable Simulator Card

As a user,
I want to generate and share a card showing my What If Simulator result,
So that I can show friends what I discovered and drive them to Penny.

**Acceptance Criteria:**

**Given** a user has adjusted the simulator slider to a result they like
**When** they tap "Share this 📤"
**Then** `html2canvas` renders the hidden `ShareableCard` DOM element (simulator variant) to a PNG
**And** `ShareableCard` uses inline styles only — no CSS custom properties (architecture constraint)
**And** the card is 1080×1920px (Stories format) with Penny branding and app watermark (UX-DR11)
**And** the card shows: category emoji, reduction %, savings amount, new goal date, Penny graphic
**And** the "for informational purposes only" disclaimer is included on the card (FR47)
**And** `navigator.share()` is called with the PNG if Web Share API is supported
**And** if Web Share API is not supported, the PNG is downloaded to the device
**And** `useShareCard` hook in `features/sharing/hooks/` owns the html2canvas + share logic

## Story 6.3: Milestone Shareable Cards

As a user,
I want to generate and share a card when I hit 50% and 100% of my goal,
So that I can celebrate publicly and bring friends to Penny.

**Acceptance Criteria:**

**Given** a user's goal progress reaches exactly 50% for the first time
**When** the progress update is processed
**Then** a milestone card prompt appears: "You're halfway there! Share your progress? 📤"
**And** tapping "Share" generates a `ShareableCard` (milestone variant) via html2canvas
**And** the card shows: goal name, milestone (50% or 100%), amount saved, Penny graphic, app watermark
**And** the card uses inline styles only (architecture constraint)
**Given** a user's goal progress reaches 100%
**When** the goal completion celebration (Story 3.5) is shown
**Then** the celebration screen includes a "Share your win 📤" CTA that generates the 100% milestone card
**And** both 50% and 100% cards are shared via `navigator.share()` with PNG fallback to download
**And** each milestone prompt is shown only once per goal (not on every subsequent visit)
