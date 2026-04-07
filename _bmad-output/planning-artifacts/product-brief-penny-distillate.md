---
title: "Product Brief Distillate: Penny"
type: llm-distillate
source: "product-brief-penny.md"
created: "2026-04-05"
purpose: "Token-efficient context for downstream PRD creation"
---

# Product Brief Distillate: Penny

## Core Identity

- Product name: **Penny** (rebranded from PiggyMetrics)
- Tagline direction: "Your saving buddy" — not "budgeting app," not "financial tracker"
- Mascot: animated pig named Penny — the emotional and functional core of the product, not decoration
- Mascot voice rule: "supportive older sibling" — banned words: budget, income, expense
- Language replacements: Income → Money In, Expense → Money Out, Budget → Your Plan / What You've Got Left
- Navigation voice: "My Stuff," "My Journey," "Penny Says," "My Vibe" (not Settings, Dashboard, Reports)

## Technical Foundation

- Built on PiggyMetrics (Spring Boot microservices): account-service, statistics-service, notification-service, auth-service, API gateway, config-service, Eureka registry
- MongoDB as primary database per service
- OAuth2 for auth (currently password + client credentials grant types)
- Delivery target: **PWA (Progressive Web App)** — not a native app, not a standard web app
  - Must be: mobile-responsive, installable to home screen, offline-capable for core flows
  - Reason: teens discover via TikTok/Instagram links on mobile; non-installable web breaks at moment of highest intent
- Social login: Google and Apple only — remove password-based registration for teen UX
- Existing microservices infrastructure to be retained; UI layer is the primary rebuild target

## User Personas

- **Primary:** Jordan, 16, saving for AirPods ($249). Has allowance + occasional part-time income. Motivated but no bank account. Discovers Penny via TikTok link. Must be using the app within 90 seconds of clicking the link.
- **Broad target:** Teens 13–19, any income source (allowance, part-time job, birthday money, gig work), any saving goal (specific item, trip, car, vague "just saving")
- **Not targeted:** Under-13s (COPPA complexity), parents (no oversight features), adults

## Onboarding Requirements (Critical Path)

- First screen: "What are you saving for?" — visual goal cards, not a form
- Collect: goal name, price, target date → Penny instantly calculates weekly saving target
- Penny introduction moment after goal set: "Hi! I'm your saving buddy 🐷"
- "How do you get money?" uses teen language: Allowance / Part-time job / Both / Other
- Skip everything option: land on home screen immediately if user wants
- By end of onboarding: goal set + Penny met + optionally first transaction logged
- Zero passive screens — every onboarding screen must result in the user doing something

## Feature Requirements (v1)

### Must Have
- Goal-first home screen: hero = savings goal card with chunky progress bar + Penny mood indicator
- Penny chat-style quick-add: tap Penny, type "bubble tea $6," Penny parses and logs it
- Auto-categorization from keywords, one tap to fix
- Stories-style weekly spending summary (swipeable cards)
- Daily logging streak with Penny emotional reaction on break ("I missed you 🐷💔")
- **What If Simulator:** slider-based trade-off tool ("Cut X in half → save $Y extra → goal Z weeks sooner") — output is a shareable card (screenshot-worthy, TikTok/Instagram native)
- Shareable milestone cards at 50% and 100% goal completion
- Saver Level system: Bronze → Silver → Gold → Penny Legend (unlocks Penny skin)
- Penny's Weekly Roast: opt-in, funny brutally honest Sunday recap, shareable
- Emoji spending breakdown (🧋🧋🧋 vs 🍟🍟 — visual, not numeric by default)
- "Glow Up" stats view: shows improvement over time by default, raw numbers one tap away
- Goal countdown mode: within $30 of goal, UI changes color, Penny gets excited
- Goal completion celebration: full-screen confetti → immediate "Ready for your next goal?"
- Dark mode as default (not opt-in)
- Social login only (Google/Apple) — no password forms

### Nice to Have (v1 if time allows)
- "Skip It" button: Penny notices recurring spend, offers one-tap redirect to goal fund
- "Rewind" progress card: "30 days ago: $12 saved. Today: $87. That's 7x more 🚀"
- Spending Personality of the Week: "Snack Goblin 🍟" / "Saving Legend 💰" — shareable sticker card
- Penny Morning Nudge: context-aware push notification ("3 days into streak 🔥 $12 away from AirPods")

### Explicitly Out of v1
- Bank/card integration (structural decision — no BaaS risk)
- Parental dashboard or oversight (deliberate positioning: Penny trusts teens)
- Friend challenges / social saving features
- Penny Wrapped annual recap
- Native mobile app (PWA covers mobile)
- Family wishlist / gifting / goal sharing
- Monetization layer (free, no subscription, no ads in v1)
- Currency selector on main UI (hide in settings)
- Lock screen widget

## Rejected Ideas (Do Not Re-Propose)

- **Parental controls / oversight dashboard** — rejected by design; Penny's core positioning is teen autonomy and trust
- **Bank account / debit card requirement** — structural rejection; no-bank-required is the primary moat
- **Subscription fee** — rejected for v1; subscription fatigue is real for teens; free is non-negotiable for launch
- **Password-based registration** — rejected; social login only for zero-friction onboarding
- **"Budget" language** — banned word throughout the product; use "your plan" or "what you've got left"
- **Balance-first home screen** — rejected; goal progress is the hero, not account balance
- **Complex account structure** — replace with flat goals list + one spending tracker
- **Currency selector on main UI** — removed; hide in settings for edge cases

## Competitive Intelligence

- **Greenlight** (6.5M users, JPMorgan-backed): parent-centric, $5–15/month, account lockout complaints, surveillance perception
- **Step** (acquired by MrBeast): requires bank card, credit-building skews 16+, shallow gamification, no goal-first or simulator
- **GoHenry / Acorns Early**: skews 6–12, childish UI for teens, terrible support reputation, card activation failures
- **Copper**: shut down May 2024 due to Synapse BaaS collapse — 1M+ users displaced; validates no-bank-required model
- **Zogo**: education-only, no money management, degraded reward system (takes too long to earn meaningful rewards)
- **Gap confirmed**: no competitor offers no-bank-required + goal-first + web/PWA-first + free + proactive advisor

## Market Context

- Gen Z/Millennial personal finance app segment: $10.27B (2025), 8.2% CAGR → $17.84B by 2033
- Gen Z spending power: $450B–$2T annually, projected $12T by 2030
- 64% of teens motivated to save (RBC); 69% of Gen Z use some form of budget
- Gen Z started saving at average age 18 — younger than any prior generation
- 50%+ of Gen Z lives paycheck to paycheck — financial anxiety is endemic; hope-oriented tools (goal visualization, "what if") are well-timed

## Regulatory / Legal Open Questions

- **COPPA 2025 (effective June 2025, compliance deadline April 2026):** Stricter parental consent for under-13 data collection. Penny targets 13+, but 13–15 year olds are still a legal grey zone for social login consent.
- **Decision needed before build:** Either (a) restrict v1 to 16+, (b) build lightweight consent flow that doesn't expose parental surveillance UX, or (c) get legal opinion on minimum viable compliance path
- **Financial advice framing:** "What If" Simulator and Penny-as-advisor copy must avoid language that could be construed as investment advice — legal review needed for simulator copy

## Monetization Hypotheses (Post-v1, Not Built)

- Premium Penny skins / cosmetic unlocks (freemium)
- School / library / classroom licensing (B2B2C — 26 US states require personal finance education)
- Brand affiliate partnerships with teen-relevant brands (non-intrusive, opt-in)
- "Share My Goal" public link enabling anyone (family, friends) to contribute to a teen's goal — potential gifting/payment layer

## Distribution & Growth Signals

- PWA link sharing is the primary acquisition channel — TikTok/Instagram links that open instantly on mobile
- What If Simulator shareable card is the primary viral mechanic — designed to be screenshot-worthy
- Milestone cards and Saver Level cards are secondary viral mechanics
- Penny's Weekly Roast (opt-in) is a third shareable moment
- School partnerships are a medium-term distribution channel (classroom mode)
- Micro-influencer seeding (10–15 teen finance/productivity creators) recommended pre-launch over paid marketing

## Success Metrics (v1, 6 months)

- Activation: 40%+ complete goal setup in onboarding
- Habit: 30%+ of active users maintain 7-day logging streak
- Feature: What If Simulator used by 50%+ of active users within first week
- Outcome: 25%+ of users who set a goal log at least one "Money In" entry within 7 days
- Qualitative: teens describe Penny as "actually made for me"
