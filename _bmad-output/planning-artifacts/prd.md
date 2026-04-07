---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
classification:
  projectType: web_app
  domain: fintech
  complexity: high
  projectContext: brownfield
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-penny.md"
  - "_bmad-output/planning-artifacts/product-brief-penny-distillate.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-04-05-1337.md"
  - "wiki/00-reverse-engineering-summary.md"
  - "wiki/01-system-overview.md"
  - "wiki/02-account-service.md"
  - "wiki/03-statistics-service.md"
  - "wiki/04-notification-service.md"
  - "wiki/05-auth-service.md"
  - "wiki/06-infrastructure-services.md"
  - "wiki/07-data-flow.md"
  - "wiki/08-architecture-patterns.md"
  - "wiki/09-deployment-operations.md"
  - "wiki/10-technology-stack.md"
workflowType: prd
workflowStatus: complete
---

# Product Requirements Document — Penny

**Author:** Itobeo
**Date:** 2026-04-07

---

## Executive Summary

Penny is a free Progressive Web App (PWA) that rebrands PiggyMetrics as a teen-first financial companion. The core insight: 64% of teens are motivated to save, but every existing tool either excludes them (requires a bank account) or alienates them (parental surveillance, adult jargon, homework-like UX). Penny removes both barriers — no bank required, no parental oversight, no subscription — and replaces them with a saving buddy named Penny who acts as financial advisor, emotional anchor, and habit coach. Every interaction flows through her.

The product targets teens aged 13–19 with any income source (allowance, part-time job, birthday money) who want to save for a specific goal. They discover Penny via a shared TikTok or Instagram link and must be actively using the app within 90 seconds of clicking. The existing PiggyMetrics microservices backend (account-service, statistics-service, notification-service, auth-service, Zuul gateway, Eureka, Spring Cloud Config) is retained as-is; Penny is a complete UI/UX rebrand and PWA frontend rebuild on top of it.

### What Makes This Special

The mascot is the product. Penny is not decoration — she is the interface, the advisor, the emotional anchor, and the retention mechanic. No competitor combines: no-bank-required + goal-first + PWA-first + free + proactive mascot advisor. Copper (1M+ users) shut down May 2024 due to BaaS dependency — validating the no-bank model. Greenlight and GoHenry are parental surveillance tools. Step requires a bank card. Zogo is education-only.

The structural differentiator is the **What If Simulator**: a slider-based trade-off tool ("cut bubble tea in half → AirPods 3 weeks sooner") with a shareable, screenshot-worthy output card. No competitor has this. It is the primary viral distribution mechanic and the moment teens realize Penny was made for them.

## Project Classification

- **Project Type:** Web App (PWA — mobile-first, installable, offline-capable SPA)
- **Domain:** Fintech — teen personal finance, no banking integration
- **Complexity:** High — regulated domain (COPPA 2025, financial advice framing), PWA offline requirements, OAuth2 social login, multi-service backend coordination
- **Project Context:** Brownfield — PiggyMetrics microservices are the retained foundation; Penny is a new frontend layer + UX rebrand

---

## Success Criteria

### User Success

- **Onboarding activation:** 40%+ of registered users complete goal setup (goal name + price + target date) during onboarding
- **First value moment:** 25%+ of users who set a goal log at least one "Money In" entry within 7 days
- **Habit formation:** 30%+ of active users maintain a 7-day daily logging streak
- **Feature discovery:** What If Simulator used by 50%+ of active users within their first week
- **Qualitative signal:** Teens describe Penny as "actually made for me" in user feedback (NPS / open-ended survey)
- **Time-to-value:** User reaches first "aha moment" (goal set + Penny introduced) within 2 minutes of landing on the PWA

### Business Success

- **Acquisition (6 months):** Validate that viral PWA link mechanic (TikTok/Instagram) produces measurable organic growth; specific user count target TBD post-launch baseline
- **30-day retention:** 20%+ of users who complete onboarding remain active at day 30 (≥1 log entry)
- **Viral mechanic validation:** At least one shareable card type generates measurable referral traffic within 3 months
- **Compliance gate:** COPPA 2025 compliance decision resolved and implemented before public launch

### Technical Success

- **PWA performance:** Time-to-interactive ≤ 3 seconds on mid-range Android on 4G
- **Offline capability:** Core flows (goal progress view, transaction logging) functional without network; sync on reconnect
- **Installability:** PWA passes Lighthouse installability audit on iOS Safari and Android Chrome
- **Accessibility:** WCAG 2.1 Level AA; zero axe-core violations in CI
- **Backend compatibility:** All existing PiggyMetrics API contracts preserved; no breaking changes

### Measurable Outcomes

| Metric | Target | Timeframe |
|---|---|---|
| Onboarding completion rate | ≥ 40% | At launch |
| 7-day logging streak rate | ≥ 30% of active users | 3 months post-launch |
| What If Simulator adoption | ≥ 50% of active users | Within first week of use |
| First "Money In" entry | ≥ 25% of goal-setters | Within 7 days |
| 30-day retention | ≥ 20% | 3 months post-launch |
| Time-to-interactive (PWA) | ≤ 3 seconds | At launch |
| COPPA compliance decision | Resolved | Pre-launch gate |

---

## Product Scope

### MVP (Phase 1)

**MVP Philosophy:** Experience MVP — the minimum complete experience that delivers the core emotional loop (log → progress → motivation → log again) and validates the mascot-as-interface innovation. A feature-minimal version without Penny's personality would not validate the core hypothesis.

**Resource estimate:** 2–3 frontend engineers + 1 designer. No new backend services required.

| Capability | Rationale |
|---|---|
| PWA foundation (installable, offline core flows) | Without this, it's a website — not the "90 seconds from TikTok link" experience |
| Social login (Google + Apple) | Zero-friction onboarding; password forms kill teen adoption |
| Goal-first onboarding (including "Just saving" option) | First screen defines the product |
| Penny mascot system (mood states, voice, onboarding intro) | The mascot IS the product — without her, there's nothing to validate |
| Penny chat-style quick-add (natural language logging) | Manual logging must be ≤5 seconds or churn happens within days |
| Contextual Penny reaction at moment of logging | "3rd bubble tea this week 🧋" — insight at the moment of action, not just weekly |
| Teen language overhaul ("Money In / Money Out," Penny-voiced nav) | Language signals "made for you" |
| Dark mode default | Table stakes for teen-native feel |
| Daily logging streak + Penny emotional reactions | Core habit formation mechanic |
| What If Simulator + shareable output card | Primary viral mechanic and key innovation validator |
| Stories-style weekly summary | Retention and engagement |
| Shareable milestone cards (50% + 100%) | Secondary viral mechanic |
| Saver Level system (Bronze → Penny Legend) | Progression and completion reward |
| Goal countdown mode + completion celebration | Emotional payoff that drives re-engagement |
| Emoji spending breakdown | Teen-native data visualization |
| "Glow Up" stats view (improvement-first) | Progress-first framing — never shame |
| "Every Penny Counts" micro-saving (no minimum, celebrate every addition) | Inclusion — no income level excluded |
| COPPA 2025 compliance (age gate) | Pre-launch legal gate |
| Auth-service hardening (persistent token store) | Pre-launch security gate |
| Secrets management migration | Pre-launch security gate |

**Deliberately excluded from MVP:** Weekly Roast, "Rewind" progress card, Penny Morning Nudge push notifications, friend challenges, Penny Wrapped.

### Growth Features (Phase 2 — 3–6 months post-launch)

- Penny's Weekly Roast (opt-in, shareable brutally honest Sunday recap)
- "Skip It" button (recurring spend redirect to goal fund)
- "Rewind" progress card ("30 days ago: $12. Today: $89. 2.6x more 🚀")
- Spending Personality of the Week (shareable sticker card)
- Penny Morning Nudge (context-aware push notifications)
- Deferred goal-setting Penny proactive nudge (after N days without a goal)

### Vision (Phase 3 — 6–12 months+)

- Penny Wrapped (annual shareable year-in-review)
- Friend saving challenges / social features
- School / classroom partnership mode (26 US states require personal finance education)
- Native mobile app (iOS/Android)
- Monetization layer (premium Penny skins, school licensing, brand affiliates)
- "Share My Goal" public link (family/friends contribute to teen's goal)
- Bank/card integration — deferred; no-bank-required is the v1 structural moat
- Parental dashboard — deliberately excluded; Penny's positioning is teen autonomy

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Natural language parsing edge cases | Fallback to structured form; "Did you mean X?" for ambiguous input |
| Mascot feels gimmicky | Every Penny interaction must deliver functional value; validate in user testing |
| What If Simulator not discovered | Prominent home screen placement + Penny proactive suggestion after first week |
| PWA install rates low on iOS Safari | Penny-voiced "Add to Home Screen" prompt post-onboarding; test on iPhone SE |
| Scope creep on Penny personality | Define finite mood state library (≤10 states) + message templates (≤30) before build |
| Smaller team than planned | Cut order: Saver Level → emoji breakdown → Glow Up stats; core loop is irreducible minimum |

---

## User Journeys

### Journey 1: Jordan — First-Time Teen (Happy Path)

Jordan, 16, wants AirPods ($249). She taps a TikTok link on her phone.

**Opening Scene:** Penny PWA loads — no App Store, no wait. Dark mode, animated pig, "What are you saving for?"

**Rising Action:** She taps the AirPods card, types "$249," picks a date 6 weeks out. Penny calculates: "Save $42/week → AirPods by May 19 🎧." Penny introduces herself. Jordan logs "allowance $20" by tapping Penny and typing it — done in 4 seconds. Penny reacts: "First one! You're already ahead of yesterday-you 🐷"

**Climax:** Day 8. Jordan opens the What If Simulator, drags the bubble tea slider. "Cut bubble tea in half → save $36 extra → AirPods 2 weeks sooner." She screenshots it and posts on Instagram.

**Resolution:** Week 5, $220 saved — within $30 of goal. UI shifts color, Penny bounces. Week 6: full-screen confetti, Saver Level up to Silver, milestone card shared. Penny: "Ready for your next goal?" Jordan types "sneakers."

*Reveals:* goal-first onboarding, Penny chat quick-add, contextual logging reaction, What If Simulator + shareable card, goal countdown, completion celebration, Saver Level, milestone sharing.

---

### Journey 2: Marcus — Returning User After Streak Break (Edge Case)

Marcus, 17, had a 12-day streak. Missed 3 days during exams.

**Opening Scene:** Penny's mood is sad. "I missed you 🐷💔 — your streak reset, but your savings didn't." Guilt without shame.

**Rising Action:** Marcus logs retroactively — Penny accepts without judgment. Streak resets to Day 1; goal progress unchanged. Penny shows: "12 days ago: $34. Today: $89. Still 2.6x more 🚀"

**Climax:** Marcus opts into Weekly Roast. Sunday: "You spent $47 on food this week. That's 3 Chipotle bowls, 2 bubble teas, and one decision you probably regret. Still saved $18 though. Penny approves... barely. 🐷"

**Resolution:** Marcus shares the Roast card. Three friends ask what app it is. He sends the PWA link.

*Reveals:* streak break handling (no shame), retroactive logging, "Rewind" card, Weekly Roast (opt-in + shareable), PWA link as referral mechanic.

---

### Journey 3: Ops — Monitoring the System

Developer verifies statistics-service processing and notification scheduler after deployment.

**Flow:** Eureka dashboard (port 8761) → trigger test account update → verify DataPoint created → check notification cron logs → spot Hystrix circuit open → adjust timeout in config-service YAML → trigger `/refresh` via Spring Cloud Bus → system recovers without restart.

*Reveals:* existing PiggyMetrics infra unchanged; config hot-reload support (already exists); health check endpoints on all services.

---

### Journey 4: Sam — No Specific Goal (Edge Case)

Sam, 14, wants to "start saving" but has no goal in mind.

**Flow:** Onboarding → picks "Just saving 💰" → skips price/date → home screen. Penny: "No goal yet? That's fine — everyone starts somewhere 🐷." Logs $10 allowance. After 2 weeks, Penny: "You've saved $47. What are you working toward? 👀" Sam sets a gaming controller goal ($65). Penny: "Now we're talking 🎮"

*Reveals:* flexible goal types, optional price/date fields, deferred goal-setting, Penny proactive nudge after N days without a goal.

---

### Journey Requirements Summary

| Capability | Journey |
|---|---|
| Goal-first onboarding (with "Just saving" option) | 1, 4 |
| Penny chat quick-add (natural language, ≤5 seconds) | 1, 2 |
| Contextual Penny reaction at moment of logging | 1 |
| What If Simulator + shareable card | 1 |
| Goal countdown + completion celebration | 1 |
| Saver Level + milestone sharing | 1 |
| Streak break handling (no shame) | 2 |
| "Rewind" progress card | 2 |
| Weekly Roast (opt-in, shareable) | 2 |
| PWA link as referral mechanic | 2 |
| Existing PiggyMetrics infra unchanged | 3 |
| Flexible/vague goal types + deferred goal-setting | 4 |

---

## Domain-Specific Requirements

### Compliance & Regulatory

- **COPPA 2025** (compliance deadline April 2026): Penny targets 13+, but 13–15 year olds are a legal grey zone for social login consent. **Pre-build decision required:** (a) restrict v1 to 16+, (b) build lightweight consent flow for 13–15 that does not expose parental surveillance UX, or (c) obtain legal opinion on minimum viable compliance path. Default to 16+ if legal review is not complete before build starts.
- **Financial advice framing:** What If Simulator and all Penny-as-advisor copy must avoid language construable as investment advice. Legal review of simulator copy required before launch. "For informational purposes only" disclaimer required on all simulator output.
- **No PCI-DSS / KYC / AML:** No bank integration, no real money movement — manual tracking only. Standard fintech compliance burden does not apply.

### Technical Constraints

- **Data privacy:** User data = transaction logs + goal metadata only. No bank credentials or financial account numbers stored. HTTPS/TLS in transit; encryption at rest.
- **Auth hardening (pre-launch gate):** Existing auth-service uses in-memory token store and NoOp password encoder (demo-grade per wiki). Must be replaced with persistent token store (Redis or DB-backed) before production.
- **Secrets management (pre-launch gate):** Hardcoded secrets in config identified in wiki as production gap. All secrets must migrate to environment variables or secrets manager before launch.

### Integration Requirements

- **Google OAuth2:** Replaces password grant type in auth-service for end users.
- **Apple Sign In:** Required alongside Google OAuth2 on iOS (Apple policy). Must be implemented concurrently — not sequentially.
- **Existing PiggyMetrics APIs:** All API contracts preserved. Penny frontend consumes them as-is with no breaking changes.

### Pre-Launch Gates

| Gate | Requirement |
|---|---|
| Legal | COPPA 2025 age gate decision resolved |
| Legal | What If Simulator copy reviewed; disclaimer added |
| Security | Auth-service token store replaced with persistent store |
| Security | All secrets migrated to environment variables / secrets manager |
| Platform | Apple Sign In implemented alongside Google OAuth2 |

---

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Mascot-as-Interface**
No consumer fintech app has made the mascot the primary interaction layer. Penny is simultaneously the chat interface, advisor, mood indicator, notification system, and retention mechanic. This is "companion-first UX" vs. "dashboard-first UX" — a new interaction paradigm for personal finance. Closest analogs: Duolingo's Duo (retention only) + Tamagotchi (emotional engagement only). Penny combines both with functional utility.

**2. What If Simulator as Viral Distribution Mechanic**
No competitor has a shareable, screenshot-worthy financial trade-off tool designed for social media. The simulator output card is engineered as a distribution event. Novel combination: financial modeling + social sharing + teen-native design.

**3. No-Bank-Required PWA as Structural Moat**
PWA-first (no App Store friction) + no bank connection (no BaaS dependency) is structurally novel in teen fintech. Copper's collapse validated BaaS risk. Penny's moat is what it doesn't require.

**4. Natural Language Transaction Logging**
Conversational transaction entry ("bubble tea $6" → parsed + logged) as the primary input model, not a form. New interaction pattern for manual expense tracking.

### Competitive Gap

No competitor offers: no-bank-required + goal-first + PWA-first + free + proactive mascot advisor + What If Simulator.

| Competitor | Status | Gap |
|---|---|---|
| Copper | Shut down May 2024 (BaaS failure) | Validates no-bank model |
| Greenlight | 6.5M users, $5–15/month | Parent-centric, surveillance perception |
| Step | Active, bank card required | No goal-first, no simulator |
| Zogo | Active | Education-only, no money management |

### Innovation Validation

| Innovation | Signal | Timeframe |
|---|---|---|
| Mascot-as-interface | "Actually made for me" qualitative feedback | 3 months post-launch |
| What If Simulator virality | Measurable referral traffic from shareable cards | 3 months post-launch |
| Natural language logging | 50%+ of transactions via Penny chat | 1 month post-launch |
| PWA link acquisition | % of registrations from shared links | Ongoing |

---

## Web App (PWA) Specific Requirements

### Architecture

- **Type:** SPA (Single Page Application) with PWA capabilities — not MPA
- **Framework:** React recommended (component-based mascot state management, PWA ecosystem)
- **Service Worker:** Cache-first for core assets; network-first for API calls; offline fallback for goal view + transaction logging
- **Backend:** Existing PiggyMetrics microservices via Zuul API gateway — no new backend services for v1
- **State persistence:** Client-side goal state, transaction log, Penny mood state via localStorage / IndexedDB for offline support
- **NLP:** Client-side regex + keyword matching for Penny chat quick-add — no external NLP service required for v1

### Browser Support

| Browser | Priority | Notes |
|---|---|---|
| Chrome (Android) | P1 | Primary discovery channel |
| Safari (iOS) | P1 | Apple Sign In; PWA "Add to Home Screen" |
| Chrome (desktop) | P2 | Full feature parity |
| Safari (desktop) | P2 | Full feature parity |
| Firefox | P3 | Best-effort |
| Edge | P3 | Best-effort |

### Responsive Design

- Mobile-first: 375px viewport baseline, scaled up
- Breakpoints: sm (375px), md (768px), lg (1024px+)
- No pinch-zoom, no horizontal scroll, no desktop-first layouts on mobile
- Dark mode default; light mode opt-in in settings

### Performance Targets

| Metric | Target |
|---|---|
| Time-to-interactive (mobile 4G) | ≤ 3 seconds |
| Lighthouse PWA score | ≥ 90 |
| Lighthouse Performance score | ≥ 80 |
| Core Web Vitals LCP | ≤ 2.5s |
| Core Web Vitals CLS | < 0.1 |
| Offline core flows | 100% functional |

### SEO & Discoverability

- Open Graph meta tags on landing URL (title, description, Penny mascot image) for rich social link previews
- PWA manifest for Android "Add to Home Screen" discoverability
- No blog, sitemap, or structured data required for v1

### Implementation Notes

- Shareable cards (What If Simulator, milestone, Weekly Roast): client-side canvas/SVG — no server-side image generation for v1
- Social login: Google OAuth2 via updated auth-service; Apple Sign In via Apple JS SDK — both required simultaneously
- Push notifications: Web Push API — Penny-voiced opt-in prompt only; no browser default dialogs
- "Add to Home Screen" prompt: triggered post-onboarding, not on first visit

---

## Functional Requirements

### Authentication & Onboarding

- FR1: A new user can register using Google OAuth2 or Apple Sign In without creating a password
- FR2: A new user can complete goal setup (goal name, price, target date) during onboarding before accessing the main app
- FR3: A new user can skip goal setup and access the main app immediately with a "Just saving" default state
- FR4: The system calculates and displays a weekly saving target instantly when goal name, price, and target date are provided
- FR5: A new user is introduced to the Penny mascot with a named greeting after completing goal setup
- FR6: A returning user is authenticated and returned to their existing session state

### Goal Management

- FR7: A user can create a saving goal with a name, target amount, and optional target date
- FR8: A user can create a goal without a specific target amount or date ("Just saving" mode)
- FR9: A user can view their active goal's progress as a visual progress bar on the home screen without navigation
- FR10: A user can update or replace their active saving goal at any time
- FR11: A user can set a new goal immediately after completing a previous goal
- FR12: The system displays a goal countdown experience (distinct visual state + Penny excitement) when a user is within a configurable threshold of their goal target
- FR13: The system triggers a goal completion celebration (full-screen animation) when a user reaches their saving target

### Transaction Logging

- FR14: A user can log a transaction using natural language input (e.g., "bubble tea $6") parsed into category and amount
- FR15: A user can log a transaction using a structured form as a fallback when natural language parsing is ambiguous
- FR16: The system auto-categorizes a transaction from keywords; user can correct the category with a single tap
- FR17: A user can log transactions while offline; the system syncs on reconnect
- FR18: A user can view their full transaction history
- FR19: The system displays a contextual Penny insight at the moment of logging (e.g., "3rd bubble tea this week 🧋")

### Penny Mascot System

- FR20: The system displays Penny in distinct mood states reflecting the user's current financial health and activity
- FR21: The system displays contextual Penny messages in response to user actions (logging, streaks, milestones, inactivity)
- FR22: The system displays a Penny sad/disappointed state with a non-shaming message when a user's logging streak is broken
- FR23: A user can interact with Penny as the primary entry point for transaction logging

### Habit & Engagement Mechanics

- FR24: The system tracks a user's daily transaction logging streak and displays the current streak count
- FR25: The system resets a user's streak and displays Penny's streak-break reaction when a day is missed
- FR26: A user can view a stories-style weekly spending summary as swipeable cards
- FR27: A user can view their spending broken down by emoji category visualization
- FR28: A user can view a "Glow Up" progress view showing improvement over time as the default statistics presentation
- FR29: A user can access raw spending numbers from the "Glow Up" view with a single tap
- FR30: The system celebrates every transaction addition regardless of amount (no minimum threshold)

### What If Simulator

- FR31: A user can access a slider-based trade-off simulator showing how reducing a spending category affects their goal timeline
- FR32: The system calculates and displays the adjusted goal completion date in real time as the user moves a simulator slider
- FR33: A user can generate a shareable image card from the What If Simulator output
- FR34: A user can share the simulator output card to external apps via native share sheet

### Progression & Sharing

- FR35: The system awards Saver Level progression (Bronze → Silver → Gold → Penny Legend) based on goal completion milestones
- FR36: The system unlocks a new Penny visual skin when a user reaches Penny Legend level
- FR37: A user can generate a shareable milestone card at 50% and 100% goal completion
- FR38: A user can share milestone cards to external apps via native share sheet

### PWA & Platform

- FR39: A user can install Penny to their device home screen via a Penny-voiced "Add to Home Screen" prompt after onboarding
- FR40: A user can access core features (goal progress view, transaction logging) without a network connection
- FR41: The system displays a rich link preview (title, description, Penny mascot image) when the PWA URL is shared on social media
- FR42: A user can receive web push notifications for streak reminders and Penny nudges after granting permission via a Penny-voiced opt-in prompt

### Personalization & Settings

- FR43: A user can access personalization settings ("My Vibe") including notification preferences and tone settings
- FR44: A user can opt into the Weekly Roast notification (post-MVP)
- FR45: A user can view and update their account notification settings

### Compliance & Safety

- FR46: The system enforces an age gate during registration consistent with the COPPA 2025 compliance decision
- FR47: The system displays a "for informational purposes only" disclaimer on all What If Simulator output
- FR48: An authenticated user's data is accessible only to that user

---

## Non-Functional Requirements

### Performance

- NFR1: PWA time-to-interactive ≤ 3 seconds on mid-range Android on 4G (cold start from shared link)
- NFR2: Transaction logging via Penny chat completes (parse + confirm) in ≤ 5 seconds end-to-end
- NFR3: What If Simulator slider updates goal completion date with ≤ 100ms visual latency
- NFR4: Core Web Vitals LCP ≤ 2.5 seconds; CLS < 0.1
- NFR5: Lighthouse PWA score ≥ 90; Lighthouse Performance score ≥ 80
- NFR6: Core flows (goal progress view, transaction logging) fully functional offline with sync on reconnect

### Security

- NFR7: All data in transit encrypted via HTTPS/TLS 1.2+
- NFR8: All user data at rest encrypted
- NFR9: Auth-service token store must use a persistent production-grade store (Redis or DB-backed) — in-memory store not acceptable for production
- NFR10: No secrets hardcoded in source code or config files; all secrets managed via environment variables or secrets manager
- NFR11: Social login tokens (Google, Apple) validated server-side — client-side token trust not acceptable
- NFR12: A user's transaction, goal, and account data accessible only to that authenticated user

### Scalability

- NFR13: System supports 10x increase in concurrent users from launch baseline with < 20% response time degradation
- NFR14: Existing PiggyMetrics microservices scale horizontally via Docker without architectural changes
- NFR15: PWA frontend deployable via CDN for static asset delivery — no server-side rendering required for core flows

### Accessibility

- NFR16: PWA conforms to WCAG 2.1 Level AA
- NFR17: Zero `axe-core` violations enforced in CI pipeline on every build
- NFR18: All animations respect `prefers-reduced-motion: reduce` — reduced motion users receive instant state changes
- NFR19: All interactive elements have minimum 44×44px touch targets
- NFR20: App fully navigable via keyboard on desktop (Tab order, visible focus ring on all backgrounds)
- NFR21: App usable with VoiceOver (iOS) and TalkBack (Android) for all core flows

### Integration

- NFR22: All existing PiggyMetrics API contracts preserved — no breaking changes to account-service, statistics-service, notification-service, or auth-service endpoints
- NFR23: Google OAuth2 and Apple Sign In supported simultaneously — neither offered without the other on iOS
- NFR24: Web Push API permission requested only after explicit user opt-in via Penny-voiced prompt — browser default dialogs not shown without prior user intent
- NFR25: Shareable card generation (What If Simulator, milestone cards) works entirely client-side — no server-side image rendering dependency for v1
