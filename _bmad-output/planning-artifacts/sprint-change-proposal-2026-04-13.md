# Sprint Change Proposal
**Project:** Penny (PiggyMetrics)
**Date:** 2026-04-13
**Author:** Itobeo
**Triggered by:** UI redesign based on new Google Stitch designs in `./penny-ui`
**Scope Classification:** Major
**Status:** Approved

---

## Section 1: Issue Summary

A new UI design has been produced in `./penny-ui` (Google Stitch export). The new design represents a significant departure from the original Penny UX specification across visual design, mascot identity, navigation structure, terminology, and feature scope.

| Dimension | Original Design | New Design |
|---|---|---|
| **App name** | Penny | **Penny** (unchanged) |
| **Mascot** | Animated pig (Lottie, 10 mood states) | **Pixel-art character ("Pocket Pixel")** — static PNG, multiple skins |
| **Visual style** | Dark mode default, neon glow, Framer Motion | **Light mode, clean purple/teal/yellow palette, Material Design tokens** |
| **Design system** | Tailwind + shadcn/ui + Framer Motion + Lottie | **Tailwind + Material Symbols + Plus Jakarta Sans + Be Vietnam Pro** |
| **Navigation (mobile)** | Home / Wishlist / Penny FAB / Stats / Profile | **Home / Wishlist / Stash / Profile** |
| **Navigation (web)** | Not specified | **Left sidebar: Dashboard / Savings / Wishlist / Academy / Settings + Quick Record FAB** |
| **Goals terminology** | "Goals" / "Saving Goal" | **"Dreams" / "Wishlist"** |
| **Transactions terminology** | "Money In / Money Out" | **"Stash" / "Stashings" / "Saving Log"** |
| **Transaction logging** | Penny chat bottom sheet (text input) | **"Tap to Speak" voice-first + text fallback** |
| **Home screen hero** | GoalProgressCard (single goal) | **Multi-goal horizontal scroll ("Your Dreams") + Mascot tip banner** |
| **New section** | — | **Academy** (quizzes, pixel coins) |
| **Achievements** | Saver Level (Bronze→Penny Legend) | **Achievement badges (First $10, 7 Day, $100 Club, 3 Goals) + Level system** |
| **Color scheme** | Dark default, violet neon | **Light default, violet #6a37d4, teal #26fedc, yellow #f4db36** |
| **Typography** | Not specified | **Plus Jakarta Sans (headlines) + Be Vietnam Pro (body)** |

**Authentication (Epic 2): Excluded from change per user instruction — all Epic 2 stories remain as-is.**

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Status | Impact |
|---|---|---|
| Epic 1 — Foundation & Security | ✅ Done | **Moderate** — Design system story (1-4) used wrong fonts/tokens; addendum story needed |
| Epic 2 — Auth & Onboarding | ✅ Done | **Excluded** — Login screen visual style changes but flow preserved |
| Epic 3 — Goal Management & Home Screen | ✅ Done | **Major** — GoalProgressCard, home screen hero, terminology all change |
| Epic 4 — Transaction Logging & Penny Mascot | 🔄 In Progress | **Major** — Mascot system, chat input, mood engine, terminology all change |
| Epic 5 — Habit & Engagement | 📋 Backlog | **Major** — Streak, stats, emoji breakdown need redesign |
| Epic 6 — What If Simulator | 📋 Backlog | **Moderate** — Simulator logic unchanged; UI shell and sharing card style change |
| Epic 7 — Progression, PWA & Settings | 📋 Backlog | **Major** — Saver Level → Achievement badges, Settings → "My Vibe", Academy new section |

### Done Stories Requiring Rework Addendum

| Story | Rework Needed |
|---|---|
| 1-4 Design System Setup | New tokens: Plus Jakarta Sans, Be Vietnam Pro, Material Symbols, new color palette, light mode default, remove Lottie |
| 3-1 GoalProgressCard | Redesign to multi-goal horizontal scroll "Your Dreams" cards |
| 3-2 Create/Update Saving Goal | Rename to "Dream", update form UI |
| 3-3 Just Saving Goal Mode | Update to new card style |
| 3-4 Goal Countdown Mode | Update visual treatment |
| 3-5 Goal Completion Celebration | Update to new style |
| 4-1 Penny Mood Engine & Avatar | Replace Lottie pig → Pocket Pixel PNG skins; update mood states |
| 4-2 PennyChatInput | Replace text chat → "Tap to Speak" voice-first input |

### New Story Required

- **1-6: Design System Update** — New typography, Material Symbols, updated color tokens, light-mode-default. Must be implemented before any rework stories.

### Backlog Stories

All stories from 4-3 onward have no story files yet — they will be written fresh against the new design. No rework cost.

### Artifact Conflicts

| Artifact | Update Required |
|---|---|
| `ux-design-specification.md` | Full rewrite — visual language, mascot, navigation, terminology, all screen specs |
| `prd.md` | Targeted updates — app name, mascot, terminology, Academy scoping decision |
| `architecture.md` | Design system section — replace Lottie/Framer Motion with Material Symbols/PNG; add Web Speech API |
| Epic 3–7 epic files | Update acceptance criteria for new terminology and component names |

### Technical Impact

| Change | Detail |
|---|---|
| Lottie removed | Replaced with static PNG sprite sheets from `./penny-ui/penny_icon/` |
| Web Speech API added | New dependency for voice logging; fallback to text input for unsupported browsers |
| Material Symbols added | Google icon font (CDN or self-hosted) |
| Typography added | Plus Jakarta Sans + Be Vietnam Pro (Google Fonts) |
| Light mode default | Reverses dark-mode-default assumption in Epic 1–4 stories |
| Academy feature | New section not in current PRD — scoping decision required |
| Round-up CTA | Appears in Wishlist tip card — scoping decision required |

---

## Section 3: Recommended Approach

**Path: Direct Adjustment** — Do not restart. Backend, auth flow, core loop logic, and PWA infrastructure are all preserved. This is a UI/UX layer replacement.

**Two Decisions Resolved:**
- **App name:** Remains **Penny** (not "Penny Play" as shown in designs — update all design screens accordingly)
- **Academy:** Accepted as-is — scoping deferred to UX/PRD update step
- **Round-up feature:** Accepted as-is — scoping deferred to UX/PRD update step

### Recommended Sequence

| Step | Action | Skill |
|---|---|---|
| 1 | Rewrite UX design specification against penny-ui screens | `bmad-create-ux-design` |
| 2 | Update PRD (name, mascot, terminology, Academy decision) | `bmad-edit-prd` |
| 3 | Create story 1-6 (Design System Update) | `bmad-create-story` |
| 4 | Dev story 1-6 | `bmad-dev-story` |
| 5 | Create rework addendum stories (3-1b through 4-2b) | `bmad-create-story` |
| 6 | Dev rework stories | `bmad-dev-story` |
| 7 | Continue from 4-3 onward with fresh stories | `bmad-create-story` → `bmad-dev-story` |

**Effort estimate:**
- UX spec rewrite: 1 session
- PRD update: 1 session
- Story 1-6 + dev: 1 session
- Rework stories (3-1b through 4-2b): ~8 stories × 1 session each
- Backlog stories 4-3 onward: written fresh, no extra cost vs original plan

**Risk mitigation:** Create addendum stories (e.g., `3-1b-goalprogresscard-redesign`) rather than reopening done stories — preserves sprint audit trail in sprint-status.yaml.

---

## Section 4: Detailed Change Proposals

### A. PRD Changes

**App name:** Unchanged — product remains "Penny" (not "Penny Play")

**Mascot:**
```
OLD: a saving buddy named Penny who acts as financial advisor, emotional anchor, and habit coach
NEW: a saving buddy named Pocket Pixel — a customizable pixel-art character — who acts as financial advisor, emotional anchor, and habit coach
```

**Terminology (global find/replace):**
```
"Money In / Money Out"  →  "Stash In / Stash Out"
"Goals" / "Saving Goal"  →  "Dreams" / "Wishlist"
"Penny mascot"  →  "Pocket Pixel mascot"
"dark mode default"  →  "light mode default, dark mode opt-in"
```

**FR20 — Mascot mood states:**
```
OLD: The system displays Penny in distinct mood states...
NEW: The system displays Pocket Pixel in distinct mood states (via PNG sprite skins)...
```

**MVP scope table — add row:**
```
| Academy (quizzes, pixel coins) | [Scope to be decided in PRD update] |
| Round-up feature               | [Scope to be decided in PRD update] |
```

### B. UX Design Specification

Full rewrite required for:
- Visual language (light mode, new palette, typography system)
- Navigation structure (mobile bottom tab + web left sidebar)
- Home screen ("Your Dreams" multi-goal scroll + Pocket Pixel tip banner)
- Mascot system (Pocket Pixel PNG skins, mood mapping)
- Transaction logging ("Tap to Speak" voice-first)
- Stash / Saving Log screen
- Wishlist / Dreams screen with Achievements
- Terminology glossary

Source of truth: all screens in `./penny-ui/` (HTML + PNG files)

### C. Architecture Changes

**Design system:**
```
REMOVE: Lottie (mascot animations)
REMOVE: shadcn/ui (replaced by custom components with Material Symbols)
RETAIN: Framer Motion (page transitions only)
ADD: PNG sprite sheets — ./penny-ui/penny_icon/ (8 Pocket Pixel mood skins)
ADD: Material Symbols Outlined (icon font)
ADD: Plus Jakarta Sans + Be Vietnam Pro (Google Fonts)
```

**New dependency:**
```
ADD: Web Speech API (SpeechRecognition) for voice logging
     - Fallback: text input (existing PennyChatInput behavior)
     - Browser support: Chrome/Android P1 ✅, Safari iOS limited ⚠️ (fallback required)
```

### D. Story Rework Addenda

**Story 1-4b: Design System Token Update**
- Typography: Plus Jakarta Sans (headlines), Be Vietnam Pro (body) in Tailwind config
- Icons: Material Symbols Outlined font loaded
- Color tokens: primary #6a37d4, secondary #26fedc, tertiary #f4db36 (full palette per penny-ui HTML)
- Light mode is default; dark mode is opt-in
- Remove Lottie from package.json

**Story 3-1b: Your Dreams — Home Screen Redesign**
- Replace single GoalProgressCard hero with "Your Dreams" horizontal scroll section
- Featured goal card: goal name, % badge (teal pill), gradient progress bar
- Secondary goal cards: compact, name + % + colored bar
- "View All" link to Wishlist screen
- Terminology: "goal" → "dream" throughout

**Story 3-2b through 3-5b:** Update form UI, card styles, and terminology to match new design

**Story 4-1b: Pocket Pixel Mood Engine**
- Replace PennyAvatar (Lottie) with PocketPixelAvatar (PNG)
- Source images: `./penny-ui/penny_icon/` (happy, sad, crying, fierce, shocked, peace, confident, angry)
- moodEngine() maps existing mood states to PNG skin names
- Remove Lottie dependency

**Story 4-2b: Tap to Speak Voice Input**
- Primary CTA: "TAP TO SPEAK" using Web Speech API
- Unsupported browsers: fall back to text input
- Voice transcript fed into existing nlp.ts parser
- UI: purple gradient card, white pill button, mic icon

---

## Section 5: Implementation Handoff

**Scope: Major** — UX and PRD must be updated before dev resumes on any UI story.

| Step | Skill | Output |
|---|---|---|
| 1 | `bmad-create-ux-design` | New UX spec (penny-ui as source of truth) |
| 2 | `bmad-edit-prd` | Updated PRD |
| 3 | `bmad-create-story` → `bmad-dev-story` (1-6) | Design system update implemented |
| 4 | `bmad-create-story` × 8 (3-1b through 4-2b) | Rework addendum stories |
| 5 | `bmad-dev-story` × 8 | Redesigned components implemented |
| 6 | Continue sprint from 4-3 onward | Fresh stories against new design |

**Success criteria:**
- UX spec reflects all penny-ui screens as source of truth
- PRD terminology consistent with new design
- All new/rework stories reference `./penny-ui/` HTML files as design reference
- sprint-status.yaml updated with addendum story entries
- No done stories reopened — addendum pattern used throughout
