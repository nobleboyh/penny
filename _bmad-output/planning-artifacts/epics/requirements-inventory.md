# Requirements Inventory

## Functional Requirements

FR1: A new user can register using Google OAuth2 or Apple Sign In without creating a password
FR2: A new user can complete goal setup (goal name, price, target date) during onboarding before accessing the main app
FR3: A new user can skip goal setup and access the main app immediately with a "Just saving" default state
FR4: The system calculates and displays a weekly saving target instantly when goal name, price, and target date are provided
FR5: A new user is introduced to the Penny mascot with a named greeting after completing goal setup
FR6: A returning user is authenticated and returned to their existing session state
FR7: A user can create a saving goal with a name, target amount, and optional target date
FR8: A user can create a goal without a specific target amount or date ("Just saving" mode)
FR9: A user can view their active goal's progress as a visual progress bar on the home screen without navigation
FR10: A user can update or replace their active saving goal at any time
FR11: A user can set a new goal immediately after completing a previous goal
FR12: The system displays a goal countdown experience (distinct visual state + Penny excitement) when a user is within a configurable threshold of their goal target
FR13: The system triggers a goal completion celebration (full-screen animation) when a user reaches their saving target
FR14: A user can log a transaction using natural language input (e.g., "bubble tea $6") parsed into category and amount
FR15: A user can log a transaction using a structured form as a fallback when natural language parsing is ambiguous
FR16: The system auto-categorizes a transaction from keywords; user can correct the category with a single tap
FR17: A user can log transactions while offline; the system syncs on reconnect
FR18: A user can view their full transaction history
FR19: The system displays a contextual Penny insight at the moment of logging (e.g., "3rd bubble tea this week 🧋")
FR20: The system displays Penny in distinct mood states reflecting the user's current financial health and activity
FR21: The system displays contextual Penny messages in response to user actions (logging, streaks, milestones, inactivity)
FR22: The system displays a Penny sad/disappointed state with a non-shaming message when a user's logging streak is broken
FR23: A user can interact with Penny as the primary entry point for transaction logging
FR24: The system tracks a user's daily transaction logging streak and displays the current streak count
FR25: The system resets a user's streak and displays Penny's streak-break reaction when a day is missed
FR26: A user can view a stories-style weekly spending summary as swipeable cards
FR27: A user can view their spending broken down by emoji category visualization
FR28: A user can view a "Glow Up" progress view showing improvement over time as the default statistics presentation
FR29: A user can access raw spending numbers from the "Glow Up" view with a single tap
FR30: The system celebrates every transaction addition regardless of amount (no minimum threshold)
FR31: A user can access a slider-based trade-off simulator showing how reducing a spending category affects their goal timeline
FR32: The system calculates and displays the adjusted goal completion date in real time as the user moves a simulator slider
FR33: A user can generate a shareable image card from the What If Simulator output
FR34: A user can share the simulator output card to external apps via native share sheet
FR35: The system awards Saver Level progression (Bronze → Silver → Gold → Penny Legend) based on goal completion milestones
FR36: The system unlocks a new Penny visual skin when a user reaches Penny Legend level
FR37: A user can generate a shareable milestone card at 50% and 100% goal completion
FR38: A user can share milestone cards to external apps via native share sheet
FR39: A user can install Penny to their device home screen via a Penny-voiced "Add to Home Screen" prompt after onboarding
FR40: A user can access core features (goal progress view, transaction logging) without a network connection
FR41: The system displays a rich link preview (title, description, Penny mascot image) when the PWA URL is shared on social media
FR42: A user can receive web push notifications for streak reminders and Penny nudges after granting permission via a Penny-voiced opt-in prompt
FR43: A user can access personalization settings ("My Vibe") including notification preferences and tone settings
FR44: A user can opt into the Weekly Roast notification (post-MVP)
FR45: A user can view and update their account notification settings
FR46: The system enforces an age gate during registration consistent with the COPPA 2025 compliance decision
FR47: The system displays a "for informational purposes only" disclaimer on all What If Simulator output
FR48: An authenticated user's data is accessible only to that user

## NonFunctional Requirements

NFR1: PWA time-to-interactive ≤ 3 seconds on mid-range Android on 4G (cold start from shared link)
NFR2: Transaction logging via Penny chat completes (parse + confirm) in ≤ 5 seconds end-to-end
NFR3: What If Simulator slider updates goal completion date with ≤ 100ms visual latency
NFR4: Core Web Vitals LCP ≤ 2.5 seconds; CLS < 0.1
NFR5: Lighthouse PWA score ≥ 90; Lighthouse Performance score ≥ 80
NFR6: Core flows (goal progress view, transaction logging) fully functional offline with sync on reconnect
NFR7: All data in transit encrypted via HTTPS/TLS 1.2+
NFR8: All user data at rest encrypted
NFR9: Auth-service token store must use a persistent production-grade store (Redis or DB-backed) — in-memory store not acceptable for production
NFR10: No secrets hardcoded in source code or config files; all secrets managed via environment variables or secrets manager
NFR11: Social login tokens (Google, Apple) validated server-side — client-side token trust not acceptable
NFR12: A user's transaction, goal, and account data accessible only to that authenticated user
NFR13: System supports 10x increase in concurrent users from launch baseline with < 20% response time degradation
NFR14: Existing PiggyMetrics microservices scale horizontally via Docker without architectural changes
NFR15: PWA frontend deployable via CDN for static asset delivery — no server-side rendering required for core flows
NFR16: PWA conforms to WCAG 2.1 Level AA
NFR17: Zero axe-core violations enforced in CI pipeline on every build
NFR18: All animations respect prefers-reduced-motion: reduce — reduced motion users receive instant state changes
NFR19: All interactive elements have minimum 44×44px touch targets
NFR20: App fully navigable via keyboard on desktop (Tab order, visible focus ring on all backgrounds)
NFR21: App usable with VoiceOver (iOS) and TalkBack (Android) for all core flows
NFR22: All existing PiggyMetrics API contracts preserved — no breaking changes to account-service, statistics-service, notification-service, or auth-service endpoints
NFR23: Google OAuth2 and Apple Sign In supported simultaneously — neither offered without the other on iOS
NFR24: Web Push API permission requested only after explicit user opt-in via Penny-voiced prompt — browser default dialogs not shown without prior user intent
NFR25: Shareable card generation (What If Simulator, milestone cards) works entirely client-side — no server-side image rendering dependency for v1

## Additional Requirements

- **Pre-launch gate (Security):** Auth-service in-memory token store must be replaced with Redis-backed persistent store before production (NFR9)
- **Pre-launch gate (Security):** All hardcoded secrets in PiggyMetrics config must be migrated to environment variables or secrets manager before production (NFR10)
- **Pre-launch gate (Legal):** COPPA 2025 age gate decision must be resolved before build starts; default path is 16+ restriction (FR46)
- **Pre-launch gate (Legal):** What If Simulator copy must be reviewed; "for informational purposes only" disclaimer required (FR47)
- **Pre-launch gate (Platform):** Apple Sign In must ship simultaneously with Google OAuth2 on iOS (NFR23)
- **Starter template:** Architecture specifies `npm create vite@latest penny -- --template react-ts` as the first implementation story
- **Zuul routing gap:** Existing Zuul gateway serves old pure-JS frontend at `/`; Nginx container for new React PWA must be configured as upstream — must be resolved in first implementation story
- **html2canvas constraint:** ShareableCard.tsx must use inline styles for canvas-rendered content (not CSS custom properties)
- **Backend preserved as-is:** All PiggyMetrics API contracts (account-service, statistics-service, notification-service, auth-service, Zuul, Eureka) must not be broken (NFR22)
- **Implementation sequence from Architecture:** (1) Secrets migration + auth hardening → (2) Vite scaffold → (3) Tailwind/shadcn/Framer/Lottie → (4) Dexie + Zustand → (5) TanStack Query + API layer → (6) Service Worker → (7) Core features → (8) Simulator + sharing → (9) Progression system → (10) CI/CD + CDN

## UX Design Requirements

UX-DR1: Dark mode as default; light mode available as opt-in via "My Vibe" settings — inverted palette with warm off-white base (#FAFAF8)
UX-DR2: Design token implementation — CSS custom properties for full color system: --background (#0F0F14), --surface (#1A1A24), --surface-elevated (#242433), --border (#2E2E42), --primary (#FF6B6B), --secondary (#A78BFA), --accent (#34D399), --success (#34D399), --warning (#FBBF24), --foreground (#F9FAFB), --muted-foreground (#9CA3AF)
UX-DR3: Typography system — Nunito (Google Fonts) as primary typeface with full type scale: display (32px/800), h1 (24px/700), h2 (20px/700), h3 (16px/600), body (15px/400), small (13px/400), micro (11px/500)
UX-DR4: Spacing system — 8px base unit with scale: xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px); border radius: sm(8px), md(16px), lg(24px), full(9999px)
UX-DR5: Neon accent visual direction — CSS radial gradients for atmospheric background blobs; box-shadow with color for neon glow on cards and progress bars; glow intensifies as goal percentage increases
UX-DR6: PennyAvatar component — 5 mood states (idle/blink, happy/bounce, excited/spin, sad/droop, celebrating/jump+sparkles); 3 size variants (sm:40px, md:80px, lg:160px); Lottie JSON animations per state; fallback to 🐷 emoji; aria-label="Penny, your saving buddy" + role="img"; prefers-reduced-motion respected
UX-DR7: GoalProgressCard component — home screen hero; states: default, near-goal (within $30, glow intensifies), complete (triggers celebration); chunky progress bar with neon glow; role="progressbar" with aria-valuenow/min/max; tap to expand to full goal detail
UX-DR8: PennyChatInput component — bottom sheet (iMessage-style); auto-focus on open; real-time parse preview (amount + category emoji); one-tap confirm; one-tap category change; aria-label="Tell Penny what you spent"; keyboard submit on Enter; dismiss on swipe down
UX-DR9: PennyResponseBubble component — role="status" + aria-live="polite"; ~20 contextual message templates (never generic); slide up + fade in animation; coral border, dark fill speech bubble
UX-DR10: WhatIfSimulator component — slider with aria-label + aria-valuetext; real-time calculation debounced at 100ms; "for informational purposes only" disclaimer always visible; html2canvas shareable card generation
UX-DR11: ShareableCard component — 1080×1920px canvas (Stories format); variants: milestone, simulator, level-up, weekly-roast; html2canvas renders hidden DOM element; inline styles only (no CSS custom properties); Penny branding + app watermark
UX-DR12: StreakBadge component — states: active (🔥 + count), at-risk (Penny worried), broken (Penny sad, count resets); amber dot indicator when offline; aria-label="X day streak"
UX-DR13: StoriesWeeklySummary component — horizontal swipe card stack; 4–5 cards per week; arrow key navigation on desktop; each card has descriptive aria-label
UX-DR14: Bottom navigation — 5 tabs: My Stuff (📊), My Journey (📈), Penny center tab (PennyAvatar, no label, bounces on new content), Penny Says (💬), My Vibe (✨); Penny tab slightly larger; no nested nav deeper than 2 levels
UX-DR15: Button hierarchy — Primary (coral, filled, one per screen max); Secondary (purple, outlined); Ghost (text only, muted); Destructive (amber, not red); all CTAs use active verbs in Penny's voice; minimum 44px touch target; loading state uses Penny thinking indicator (animated dots)
UX-DR16: Empty states — always include Penny with encouraging message + clear CTA; no blank screens or generic "No data" text; specific templates for no-transactions and no-goal states
UX-DR17: Form patterns — one question per screen in onboarding; large inputs (24px+ font for numbers); no required field asterisks; auto-advance where possible; inputmode="decimal" for numbers; no dropdowns — use visual card selectors or emoji pickers
UX-DR18: Onboarding flow — animated landing (Penny waves), goal card selection, amount input, date picker with quick options, Penny calculates weekly target, income source selection, Penny introduction moment, home screen; zero passive screens; no bank connection prompt; skip available after goal entry; target under 2 minutes
UX-DR19: Celebration patterns — goal completion: full-screen confetti + Penny jump/spin + unskippable 2 seconds + Saver Level up animation + auto-generated shareable card + re-engagement prompt; streak milestones: Penny bounce + streak counter increment; all celebrations designed as distribution events
UX-DR20: Accessibility implementation — semantic HTML throughout; focus ring: 2px coral outline visible on all backgrounds; skip link as first focusable element; focus trapped in modals/sheets; all animations respect prefers-reduced-motion; minimum 44×44px touch targets; axe-core CI enforcement (zero violations)

## FR Coverage Map

FR1: Epic 2 — Auth & Onboarding — Google/Apple registration
FR2: Epic 2 — Auth & Onboarding — Goal setup during onboarding
FR3: Epic 2 — Auth & Onboarding — Skip goal setup / "Just saving"
FR4: Epic 2 — Auth & Onboarding — Weekly saving target calculation
FR5: Epic 2 — Auth & Onboarding — Penny mascot introduction
FR6: Epic 2 — Auth & Onboarding — Returning user session restore
FR7: Epic 3 — Goal Management — Create goal with name/amount/date
FR8: Epic 3 — Goal Management — "Just saving" goal mode
FR9: Epic 3 — Goal Management — Home screen progress bar
FR10: Epic 3 — Goal Management — Update/replace active goal
FR11: Epic 3 — Goal Management — Set new goal after completion
FR12: Epic 3 — Goal Management — Goal countdown mode
FR13: Epic 3 — Goal Management — Goal completion celebration
FR14: Epic 4 — Transaction Logging & Penny — Natural language logging
FR15: Epic 4 — Transaction Logging & Penny — Structured form fallback
FR16: Epic 4 — Transaction Logging & Penny — Auto-categorization + one-tap correction
FR17: Epic 4 — Transaction Logging & Penny — Offline logging + sync
FR18: Epic 4 — Transaction Logging & Penny — Transaction history view
FR19: Epic 4 — Transaction Logging & Penny — Contextual Penny insight at logging
FR20: Epic 4 — Transaction Logging & Penny — Penny mood states
FR21: Epic 4 — Transaction Logging & Penny — Contextual Penny messages
FR22: Epic 4 — Transaction Logging & Penny — Streak-break non-shaming reaction
FR23: Epic 4 — Transaction Logging & Penny — Penny as primary logging entry point
FR24: Epic 5 — Habit & Engagement — Daily streak tracking + display
FR25: Epic 5 — Habit & Engagement — Streak reset + Penny reaction
FR26: Epic 5 — Habit & Engagement — Stories-style weekly summary
FR27: Epic 5 — Habit & Engagement — Emoji spending breakdown
FR28: Epic 5 — Habit & Engagement — Glow Up stats view (default)
FR29: Epic 5 — Habit & Engagement — Raw numbers one-tap access
FR30: Epic 5 — Habit & Engagement — Celebrate every transaction
FR31: Epic 6 — Simulator & Sharing — What If Simulator slider
FR32: Epic 6 — Simulator & Sharing — Real-time goal date recalculation
FR33: Epic 6 — Simulator & Sharing — Shareable simulator card generation
FR34: Epic 6 — Simulator & Sharing — Native share sheet for simulator card
FR35: Epic 7 — Progression, PWA & Settings — Saver Level progression
FR36: Epic 7 — Progression, PWA & Settings — Penny Legend skin unlock
FR37: Epic 6 — Simulator & Sharing — Shareable milestone cards (50%/100%)
FR38: Epic 6 — Simulator & Sharing — Native share sheet for milestone cards
FR39: Epic 7 — Progression, PWA & Settings — PWA install prompt (Penny-voiced)
FR40: Epic 7 — Progression, PWA & Settings — Offline core flows
FR41: Epic 7 — Progression, PWA & Settings — Rich social link preview (OG tags)
FR42: Epic 7 — Progression, PWA & Settings — Web push notifications (opt-in)
FR43: Epic 7 — Progression, PWA & Settings — My Vibe personalization settings
FR44: Epic 7 — Progression, PWA & Settings — Weekly Roast opt-in (post-MVP)
FR45: Epic 7 — Progression, PWA & Settings — Notification settings
FR46: Epic 1 (infrastructure) + Epic 2 (UI) — COPPA age gate
FR47: Epic 6 — Simulator & Sharing — Simulator disclaimer
FR48: Epic 1 — Foundation — Data access security (auth-service hardening)
