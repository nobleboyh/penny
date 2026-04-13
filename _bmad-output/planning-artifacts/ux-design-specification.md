---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-penny.md"
  - "_bmad-output/planning-artifacts/product-brief-penny-distillate.md"
  - "penny-ui/mobile_dashboard/code.html"
  - "penny-ui/mobile_wishlist/code.html"
  - "penny-ui/mobile_stash_log/code.html"
  - "penny-ui/wishlist_tracker_updated_nav/code.html"
  - "penny-ui/unified_stash_dashboard/code.html"
  - "penny-ui/web_stash_log/code.html"
  - "penny-ui/mobile_login/code.html"
  - "penny-ui/web_login/code.html"
  - "_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-13.md"
lastUpdated: 2026-04-13
changeReason: Full rewrite — new design from penny-ui Google Stitch export. Product name is Penny (not Penny Play).
---

# UX Design Specification — Penny

**Author:** Itobeo
**Date:** 2026-04-13
**Version:** 2.0 (post sprint-change-proposal-2026-04-13)

> **Source of truth:** All screen specs in this document are derived from `./penny-ui/` HTML and PNG files.
> **Product name:** Penny (not "Penny Play" — update all design screens accordingly).

---

## Executive Summary

### Project Vision

Penny is a free Progressive Web App (PWA) that reframes personal finance for teenagers as a companion experience rather than a budgeting tool. Built on the PiggyMetrics microservices foundation, Penny is a complete rebrand centered on a customizable pixel-art character — **Pocket Pixel** — who acts as financial advisor, emotional anchor, and habit coach. Every interaction flows through them.

This v2 design replaces the original dark-mode neon aesthetic with a **light-mode-first, Material Design-inspired system** using a clean purple/teal/yellow palette. The mascot changes from an animated Lottie pig to static PNG sprite skins. Transaction logging shifts from text chat to a **voice-first "Tap to Speak"** interaction with text fallback.

### Target Users

**Primary:** Teens aged 13–19 with any income source (allowance, part-time job, birthday money, gig work) saving toward a specific goal. No bank account required. Must be actively using the app within 90 seconds of tapping a shared link.

**Not targeted in v1:** Under-13s, parents (no oversight features), adults.

### What Changed from v1 (Sprint Change Proposal 2026-04-13)

| Dimension | v1 Design | v2 Design (this spec) |
|---|---|---|
| Mascot | Animated pig (Lottie, 10 mood states) | Pocket Pixel — static PNG skins (8 moods) |
| Visual style | Dark mode default, neon glow | Light mode default, clean purple/teal/yellow |
| Design system | Tailwind + shadcn/ui + Framer Motion + Lottie | Tailwind + Material Symbols + Plus Jakarta Sans + Be Vietnam Pro |
| Mobile nav | Home / Wishlist / Penny FAB / Stats / Profile | Home / Wishlist / Stash / Profile |
| Web nav | Not specified | Left sidebar: Dashboard / Savings / Wishlist / Academy / Settings + Quick Record FAB |
| Goals terminology | "Goals" / "Saving Goal" | "Dreams" / "Wishlist" |
| Transactions | "Money In / Money Out" | "Stash" / "Stashings" / "Saving Log" |
| Transaction logging | Text chat bottom sheet | "Tap to Speak" voice-first + text fallback |
| Home hero | Single GoalProgressCard | Multi-goal horizontal scroll "Your Dreams" + Pocket Pixel tip banner |
| New section | — | Academy (quizzes, pixel coins) |
| Achievements | Saver Level (Bronze→Penny Legend) | Achievement badges (First $10, 7 Day, $100 Club, 3 Goals) + Level system |

**Authentication (Epic 2): Excluded from change — all Epic 2 stories remain as-is.**

---

## Design System Foundation

### Color Tokens

Sourced directly from the Tailwind config present in all `penny-ui` HTML files.

**Primary palette:**
| Token | Hex | Use |
|---|---|---|
| `primary` | `#6a37d4` | Primary actions, active nav, brand |
| `primary-container` | `#ae8dff` | Progress bars, tinted backgrounds |
| `primary-fixed` | `#ae8dff` | Fixed-tint surfaces |
| `primary-dim` | `#5e26c7` | Pressed/hover states |
| `on-primary` | `#f8f0ff` | Text on primary |
| `on-primary-container` | `#2b006e` | Text on primary-container |

**Secondary (teal):**
| Token | Hex | Use |
|---|---|---|
| `secondary` | `#006859` | Income/positive amounts, secondary actions |
| `secondary-container` | `#26fedc` | Teal tint backgrounds, % badges |
| `secondary-fixed` | `#26fedc` | Fixed teal |
| `on-secondary-container` | `#005d4f` | Text on teal backgrounds |

**Tertiary (yellow):**
| Token | Hex | Use |
|---|---|---|
| `tertiary-fixed` | `#f4db36` | Pocket Pixel tip card background, goal bars |
| `tertiary-container` | `#f4db36` | Yellow tint surfaces |
| `on-tertiary-container` | `#584d00` | Text on yellow |

**Surface scale (light mode):**
| Token | Hex | Use |
|---|---|---|
| `background` | `#f5f6f7` | App background |
| `surface` | `#f5f6f7` | Default surface |
| `surface-container-lowest` | `#ffffff` | Cards, elevated surfaces |
| `surface-container-low` | `#eff1f2` | Nav bars, subtle containers |
| `surface-container` | `#e6e8ea` | Mid-level containers |
| `surface-container-high` | `#e0e3e4` | Progress bar tracks |
| `on-surface` | `#2c2f30` | Primary text |
| `on-surface-variant` | `#595c5d` | Secondary text, captions |
| `outline-variant` | `#abadae` | Dividers, subtle borders |

**Semantic:**
| Token | Hex | Use |
|---|---|---|
| `error` | `#b41340` | Expense amounts (Stash Out) |
| `error-container` | `#f74b6d` | Error backgrounds |

**Dark mode:** Opt-in via Settings. Not the default.

### Typography

| Role | Family | Weight | Use |
|---|---|---|---|
| `font-headline` | Plus Jakarta Sans | 700–900 | Screen titles, card headers, amounts, nav labels |
| `font-body` | Be Vietnam Pro | 400–700 | Body text, Pocket Pixel messages, captions |
| `font-label` | Plus Jakarta Sans | 600–700 | Badges, tags, button labels |

Both fonts loaded from Google Fonts CDN.

### Border Radius

| Token | Value | Use |
|---|---|---|
| `DEFAULT` | `1rem` (16px) | Cards, inputs, containers |
| `lg` | `2rem` (32px) | Bottom sheets, large cards |
| `xl` | `3rem` (48px) | Hero sections |
| `full` | `9999px` | Pills, nav active states, avatars, buttons |

### Icons

**Material Symbols Outlined** — Google icon font, loaded via CDN.
```
font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
```
Filled variant (`'FILL' 1`) used for active nav states and emphasis icons.

Key icons used across screens:
- `grid_view` — Home tab
- `auto_awesome` — Wishlist tab
- `database` — Stash tab
- `person` — Profile tab
- `mic` — Tap to Speak / Quick Record
- `account_balance_wallet` — Wallet/balance
- `dashboard` — Web sidebar Dashboard
- `school` — Academy
- `settings` — Settings

### Mascot: Pocket Pixel

**Source:** `./penny-ui/penny_icon/` — 8 static PNG skins.

| File | Mood | Trigger |
|---|---|---|
| `penny_happy.png` | Happy | Default, after logging, streak active |
| `penny_confident.png` | Confident | Goal near completion (>75%) |
| `penny_peace.png` | Peace | Idle, no recent activity |
| `penny_fierce.png` | Fierce | Streak milestone (7-day, 30-day) |
| `penny_shocked.png` | Shocked | Large unexpected expense logged |
| `penny_sad.png` | Sad | Streak broken |
| `penny_crying.png` | Crying | Goal deadline missed |
| `penny_angry.png` | Angry | Repeated overspending in same category |

Pocket Pixel appears in two contexts:
1. **Tip banner** — small (40–64px), inline with speech bubble text, on home and stash screens
2. **Hero** — large (128–192px), on web dashboard hero section and celebration screens

No Lottie. No animation. PNG only. Mood switching is an instant `src` swap.

---

## Navigation Structure

### Mobile Bottom Tab Bar

**Source:** `penny-ui/mobile_dashboard/code.html`, `penny-ui/mobile_stash_log/code.html`

4 tabs, no FAB. Active tab highlighted with `bg-violet-100 text-violet-700 rounded-full` pill.

| Tab | Icon | Label | Route |
|---|---|---|---|
| 1 | `grid_view` | Home | `/` |
| 2 | `auto_awesome` | Wishlist | `/wishlist` |
| 3 | `database` | Stash | `/stash` |
| 4 | `person` | Profile | `/profile` |

Tab labels: `text-[9px] font-bold uppercase tracking-wider` (Be Vietnam Pro).
Nav bar background: `bg-surface-container-low` with `backdrop-blur-md`, `border-t border-outline-variant/10`.

### Web Left Sidebar

**Source:** `penny-ui/wishlist_tracker_updated_nav/code.html`, `penny-ui/unified_stash_dashboard/code.html`

Fixed left sidebar, `w-64`, visible at `md` breakpoint and above. Hidden on mobile.

**Sidebar anatomy:**
- Top: Pocket Pixel avatar (40px) + greeting ("Hi, Champ!" / "Ready to grow?")
- Nav items (rounded-full pills, active = `bg-violet-100 text-violet-700`):
  - `dashboard` Dashboard
  - `account_balance_wallet` Savings
  - `auto_awesome` Wishlist
  - `school` Academy
  - `settings` Settings
- Bottom: **Quick Record** button — full-width, `bg-gradient-to-br from-primary to-primary-container`, `rounded-full`, mic icon + "Quick Record" label

### Web Top App Bar

Fixed, `bg-white/60 backdrop-blur-xl`, `z-50`.
- Left: App name "Penny" (`text-xl font-black text-violet-700 font-headline`)
- Right: `notifications` icon + `account_circle` icon

> **Note:** All HTML files show "Penny Play" in the top bar. Per sprint change proposal and user instruction, the product name is **Penny**. Replace all instances of "Penny Play" with "Penny" in implementation.

### Mobile Top App Bar

Compact (`h-12`), `bg-surface-container-low/80 backdrop-blur-md`.
- Left: Profile avatar (32px circle, `border-2 border-primary`)
- Center: "Penny" (`text-xl font-black text-violet-600 font-headline`)
- Right: `account_balance_wallet` icon

---

## Screen Specifications

### Screen 1: Mobile Home (Dashboard)

**Source:** `penny-ui/mobile_dashboard/code.html` + `screen.png`

**Layout:** Single column, `max-w-md mx-auto`, `px-4`, `space-y-3 py-2`. Overflow hidden (no body scroll — all content fits viewport).

#### Section 1: Pocket Pixel Tip Banner

```
bg-white/40 p-2 rounded-2xl
├── Pocket Pixel PNG (64×64px, object-contain)
└── Speech bubble (bg-primary-container, rounded-full, bubble-tail class)
    ├── Headline: "You're on it!" (font-headline font-bold text-xs)
    └── Body: contextual tip text (text-[10px] text-on-surface-variant)
```

`bubble-tail` removes bottom-left border radius to create speech bubble tail effect.

#### Section 2: Your Dreams (Horizontal Scroll)

```
space-y-2
├── Header row: "Your Dreams" (font-headline font-extrabold text-lg) + "View All" (text-primary text-xs)
└── Horizontal scroll row (flex gap-3 overflow-x-auto no-scrollbar)
    ├── Featured Dream card (w-44, bg-surface-container-lowest, rounded-xl, border)
    │   ├── Goal name (font-headline font-bold text-xs, truncate)
    │   ├── % badge (bg-secondary-container text-on-secondary-container, rounded-full, text-[9px] font-black)
    │   └── Progress bar (h-2, bg-gradient-to-r from-primary to-primary-container)
    ├── Secondary Dream card (w-32, bg-white, rounded-xl)
    │   ├── Goal name (font-headline font-bold text-[10px])
    │   ├── Progress bar (h-1.5, bg-tertiary-fixed or bg-secondary-fixed)
    │   └── "XX% Saved" label (text-[8px] font-bold uppercase)
    └── (additional secondary cards...)
```

"View All" navigates to `/wishlist`.

#### Section 3: Tap to Speak (Quick Record)

```
bg-gradient-to-br from-violet-600 to-violet-800 p-4 rounded-xl
├── Prompt text: "Spent something? Tap and say it to log!" (text-violet-100/90 text-[11px])
└── TAP TO SPEAK button
    bg-white text-violet-700 w-full py-2.5 rounded-full
    font-headline font-black text-sm
    mic icon (FILL 1) + "TAP TO SPEAK" label
```

Tapping triggers Web Speech API `SpeechRecognition`. Unsupported browsers show text input fallback.

#### Section 4: Recent Log

```
flex-1 overflow-hidden flex flex-col space-y-2
├── Header: "Recent Log" + "View All" → /stash
└── Scrollable list (overflow-y-auto no-scrollbar)
    └── Transaction row (bg-surface-container-low px-3 py-2 rounded-lg)
        ├── Icon circle (w-8 h-8 bg-white rounded-full, Material Symbol)
        ├── Name + date
        └── Amount (font-headline font-extrabold, text-error for out, text-secondary for in)
```

---

### Screen 2: Mobile Wishlist

**Source:** `penny-ui/mobile_wishlist/code.html` + `screen.png`

**Layout:** `max-w-md mx-auto px-6`, flex column, overflow hidden.

#### Section 1: Saving For... (Active Dreams)

```
space-y-2 mb-4
├── Header: "Saving For..." (font-headline font-extrabold text-xl) + "X Active" badge
└── Grid of Dream cards (grid gap-2)
    └── Dream card (bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-black/5)
        ├── Icon (Material Symbol, FILL 1) + Dream name (font-headline font-bold text-sm)
        ├── % badge (bg-secondary-container or bg-tertiary-container, rounded-full)
        ├── Progress bar (h-2, gradient from-primary to-primary-container or from-tertiary to-tertiary-container)
        └── "$X / $Y" + motivational label (text-[10px] text-on-surface-variant)
```

#### Section 2: Pocket Pixel Tip Card

```
flex items-center gap-3 bg-primary-container/10 p-3 rounded-xl border border-primary-container/20
├── Pocket Pixel PNG (40×40px)
└── Tip text
    ├── "Penny Pixel Tip" label (font-bold text-primary text-[10px] uppercase)
    └── Tip body (text-[11px] font-medium)
```

> Note: Label reads "Penny Pixel Tip" in the design file. This refers to Pocket Pixel. Use "Pocket Pixel Tip" in implementation per sprint change proposal.

#### Section 3: Achievements Grid

```
space-y-2 mb-6
├── "Achievements" header (font-headline font-extrabold text-xl)
└── 4-column grid
    ├── Unlocked badge: bg-secondary-container/20, icon in bg-secondary-container circle, label
    └── Locked badge: bg-surface-container-high, opacity-50 grayscale, lock icon
```

**Achievement badges (v1):**
- First $10 — `star` icon
- 7 Day — `local_fire_department` icon
- $100 Club — locked
- 3 Goals — locked

#### Section 4: New Goal CTA

```
w-full bg-gradient-to-r from-primary to-primary-container
text-white rounded-full py-3 px-6
font-headline font-extrabold text-base
add_circle icon + "New Goal" label
```

---

### Screen 3: Mobile Stash Log (Saving Log)

**Source:** `penny-ui/mobile_stash_log/code.html` + `screen.png`

**Layout:** `max-w-md mx-auto`, flex column, overflow hidden.

#### Section 1: Total Stash Balance Card (Hero)

```
kinetic-gradient (linear-gradient 135deg, #6a37d4 → #ae8dff) p-6 rounded-xl aspect-[2/1]
├── "Total Stash Balance" label (font-label font-bold uppercase tracking-widest text-[9px] opacity-80)
├── "$X,XXX.XX" (text-4xl font-black font-headline text-on-primary)
├── Icon cluster (trending_up + savings, small circles)
└── "+X% this month" pill (bg-white/20 backdrop-blur-md rounded-full)
```

Decorative blurred circles for depth (no image assets).

#### Section 2: Pocket Pixel Tip

```
bg-tertiary-container p-3 rounded-lg rounded-bl-sm
├── Pocket Pixel PNG (40×40px, drop-shadow-md)
└── Tip text
    ├── "Pocket Pixel:" label (font-bold font-headline text-[12px])
    └── Contextual tip referencing active goal
```

#### Section 3: Recent Stashings

```
flex-1 flex flex-col min-h-0
├── "Recent Stashings" header + "See All" → /stash/all
└── Transaction cards (space-y-3)
    └── Card (bg-surface-container-lowest p-4 rounded-lg border-l-4)
        ├── Border color: primary-container (income), secondary-container (gig), tertiary-container (gift)
        ├── Icon circle (bg-[color]/20)
        ├── Name + timestamp
        └── Amount (font-black text-secondary-dim for income)
```

---

### Screen 4: Web Wishlist (Wishlist Tracker)

**Source:** `penny-ui/wishlist_tracker_updated_nav/code.html` + `screen.png`

**Layout:** Left sidebar (w-64, fixed) + main content (`md:ml-64`, scrollable).

#### Main Content

**Header:**
```
"My Wishlist" (text-4xl font-black tracking-tight)
"Turn your dreams into reality, one pixel at a time."
```

**Dreams Grid** (`grid grid-cols-1 lg:grid-cols-2 gap-8`):

Primary Dream card:
```
bg-surface-container-lowest p-8 rounded-xl
├── Pocket Pixel PNG (w-28 h-28, absolute -top-6 -right-4, hover scale)
├── Icon + Dream name + subtitle ("Level 14 · Saving Streak 🔥")
├── "$X / $Y" progress display
├── % badge (bg-secondary-container)
└── Striped progress bar (h-6, gradient + diagonal stripe overlay)
```

Secondary Dream card: same structure, no mascot overlay, teal/yellow gradient.

**Bento row** (`grid grid-cols-1 md:grid-cols-3`):

Pocket Pixel Tip card (`md:col-span-2`, `bg-primary`):
```
├── Pocket Pixel PNG (w-32 h-32)
├── "Pocket Pixel Tip" badge (bg-white/10)
├── Headline + tip body
└── "Activate Round-up" button (bg-white text-primary rounded-full)
    [Scoping deferred — render as visible but non-functional in v1]
```

Achievements card:
```
bg-surface-container-low p-8 rounded-xl
└── 2×2 grid of achievement badges
    ├── 7 Day Streak (workspace_premium, bg-secondary-container)
    ├── Fast Saver (rocket_launch, bg-tertiary-container)
    ├── Centurion (locked, grayscale)
    └── Goal Crusher (celebration, bg-primary-container)
```

---

### Screen 5: Web Unified Stash Dashboard

**Source:** `penny-ui/unified_stash_dashboard/code.html` + `screen.png`

**Layout:** Left sidebar + main content (`md:ml-64 pt-20 pb-24 px-4 md:px-8`).

#### Hero Section

```
bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl
├── Left: "You're on it!" (text-4xl–5xl font-black text-on-primary) + subtitle
└── Right: Pocket Pixel PNG (w-48 h-48, scale-110 md:scale-125)
```

#### Bento Grid (`grid grid-cols-1 lg:grid-cols-12 gap-8`)

Left column (`lg:col-span-7`):
- "Your Dreams" header + "View All"
- 2-column dream cards (same structure as web wishlist)
- Academy promo card (`sm:col-span-2`, dark bg, "Start Learning" CTA)

Right column (`lg:col-span-5`):
- Recent Log card (`bg-surface-container-lowest p-8 rounded-xl`)
- Transaction rows with icon circles, name, date, amount
- "Show More Transactions" dashed border button

#### Mobile FAB (hidden on md+)

```
fixed bottom-24 right-6 w-16 h-16
bg-gradient-to-br from-primary to-primary-container
rounded-full shadow-2xl
mic icon (FILL 1, text-3xl)
```

---

### Screen 6: Web Stash Log (Saving Log)

**Source:** `penny-ui/web_stash_log/code.html` + `screen.png`

**Layout:** Left sidebar + main content (`md:ml-64 flex-1 px-6 md:px-12 py-8`).

#### Hero: Balance + Pocket Pixel

```
flex flex-col md:flex-row items-end gap-6
├── Balance card (bg-gradient-to-br from-primary to-primary-dim p-8 rounded-xl min-w-[320px])
│   ├── "Total Stash Balance" label
│   ├── "$X,XXX.XX" (text-5xl font-black font-headline)
│   └── "+X% this month" pill
└── Pocket Pixel interaction
    ├── Speech bubble (bg-surface-container-lowest, rounded-full, bubble-tail)
    │   └── "You're doing great!" (text-sm font-bold text-primary)
    └── Pocket Pixel PNG (w-24 h-24, hover scale-105)
```

#### Bento Saving Log Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`)

Colored bento cards — each transaction is a full card, not a list row:
- `md:col-span-2` wide card: `bg-secondary-container` (income)
- Single card: `bg-tertiary-container` (gig work)
- Single card: `bg-primary-container` (gift)
- `md:col-span-2` wide card: `bg-surface-container-low` (chores)

Each card: icon circle (white, rounded-full) + name + source + amount (font-headline font-black).

#### Web FAB

```
fixed bottom-8 right-8
bg-gradient-to-tr from-primary to-primary-container
px-8 py-5 rounded-full shadow-xl
add icon + "Add Stash" label (font-headline font-bold text-lg)
```

---

### Screen 7: Mobile Login

**Source:** `penny-ui/mobile_login/code.html` + `screen.png`

**Layout:** Full-screen, flex column, centered content. Decorative blurred blobs in background (CSS radial gradients, no images).

```
├── Background decorations (fixed, pointer-events-none)
│   ├── Top-left blob: bg-primary-container/15 blur-[120px]
│   ├── Bottom-right blob: bg-secondary-container/15 blur-[120px]
│   └── Floating icons: star (tertiary-fixed), circle (primary-container), token (secondary-fixed)
├── Success toast (fixed top-6, bg-secondary-container, rounded-[2rem])
│   └── Pocket Pixel PNG (32px) + "Welcome back! Ready to earn some coins?"
├── Main content (centered)
│   ├── Pocket Pixel PNG (w-40 h-40 md:w-56 md:h-56, glow backdrop)
│   ├── "Penny" (text-4xl font-black text-primary) [NOT "Penny Play"]
│   ├── Tagline: "Level up your money game while having a blast."
│   └── "Login with Google" button
│       bg-surface-container-lowest shadow-lg rounded-full
│       Google SVG icon + "Login with Google" (font-bold text-base)
└── Footer: Privacy · Support links (text-[10px] uppercase)
```

---

### Screen 8: Web Login

**Source:** `penny-ui/web_login/code.html`

**Layout:** Full-screen centered, `kinetic-bg` radial gradient background.

```
├── Mascot section
│   ├── Decorative blurred circle backdrop
│   ├── Floating coin element (bg-tertiary-container, currency_exchange icon)
│   ├── Floating sparkle element (bg-secondary-container, auto_awesome icon)
│   └── Pocket Pixel PNG (w-72 h-72)
├── "Welcome back!" (font-headline font-black text-4xl–5xl)
├── "Your money, your rules." (font-body text-lg text-on-surface-variant)
├── "Login with Google" button (same style as mobile)
└── Pocket Pixel chat bubble (fixed top-right, desktop only lg:flex)
    └── "Psst! All your progress is saved safely here."
```

---

## Component Inventory

### New / Replaced Components

| Component | Status | Notes |
|---|---|---|
| `PocketPixelAvatar` | **New** (replaces `PennyAvatar`) | PNG `<img>` tag, `src` swapped by mood. No Lottie. |
| `TapToSpeakButton` | **New** (replaces `PennyChatInput`) | Web Speech API primary, text input fallback |
| `YourDreamsScroll` | **New** (replaces `GoalProgressCard`) | Horizontal scroll, featured + secondary cards |
| `DreamCard` | **New** | Individual goal card, used in scroll and wishlist grid |
| `StashBalanceHero` | **New** | Gradient card with total balance + growth pill |
| `StashingRow` | **New** | Transaction list row with left-color-border variant |
| `StashingBentoCard` | **New** | Full bento-style transaction card (web stash log) |
| `AchievementBadge` | **New** | Locked/unlocked badge with icon + label |
| `PocketPixelTipBanner` | **New** | Inline tip banner with mascot + speech bubble |
| `WebSidebar` | **New** | Left nav for web layout |
| `MobileBottomNav` | **Updated** | 4 tabs (was 5), new tab set |
| `GoalProgressCard` | **Deprecated** | Replaced by `YourDreamsScroll` + `DreamCard` |
| `PennyChatInput` | **Deprecated** | Replaced by `TapToSpeakButton` |
| `PennyAvatar` | **Deprecated** | Replaced by `PocketPixelAvatar` |

### TapToSpeakButton Spec

**Primary behavior (Web Speech API supported):**
1. User taps button
2. `SpeechRecognition.start()` — mic activates
3. Visual feedback: button pulses, mic icon animates
4. On `result` event: transcript displayed as preview text
5. On `end` event: transcript passed to NLP parser (existing `nlp.ts`)
6. Confirmation UI: parsed amount + category shown, one-tap confirm

**Fallback behavior (unsupported browser):**
- Button tap opens text input field (same NLP flow as before)
- No error shown — seamless degradation

**Browser support:**
- Chrome/Android: ✅ full support
- Safari iOS: ⚠️ limited — fallback to text
- Firefox: ❌ — fallback to text

### PocketPixelAvatar Spec

```tsx
interface PocketPixelAvatarProps {
  mood: 'happy' | 'confident' | 'peace' | 'fierce' | 'shocked' | 'sad' | 'crying' | 'angry';
  size: 'sm' | 'md' | 'lg'; // 40px | 64px | 128–192px
  className?: string;
}
```

Image source: `./penny-ui/penny_icon/penny_{mood}.png`
No animation. Mood prop change = instant `src` swap.

### Mood Engine

```ts
function getPocketPixelMood(context: MoodContext): PocketPixelMood {
  if (context.streakBroken) return 'sad';
  if (context.goalMissedDeadline) return 'crying';
  if (context.repeatedOverspend) return 'angry';
  if (context.largeUnexpectedExpense) return 'shocked';
  if (context.streakMilestone) return 'fierce';       // 7-day, 30-day
  if (context.goalNearComplete) return 'confident';   // >75%
  if (context.idle) return 'peace';
  return 'happy';                                      // default
}
```

---

## Terminology Glossary

| Old Term | New Term | Notes |
|---|---|---|
| Goals / Saving Goal | Dreams / Wishlist | Used throughout UI copy |
| Money In / Money Out | Stash In / Stash Out | Transaction direction labels |
| Transactions | Stashings / Saving Log | Screen and section titles |
| Penny (mascot) | Pocket Pixel | Mascot name |
| Saver Level | Achievement Level | Level system name |
| My Vibe | Settings | Settings screen label |
| Dark mode default | Light mode default | Dark mode is opt-in |

> **Copy rule:** Any instance of "Penny Play" in UI copy → replace with "Penny". Any instance of "Penny" referring to the mascot → replace with "Pocket Pixel".

---

## Responsive Behavior

### Mobile (< 768px)
- Bottom tab bar (4 tabs)
- Single column, `max-w-md mx-auto`
- Compact top app bar (h-12)
- Horizontal scroll for Your Dreams section
- Tap to Speak FAB visible on home screen
- No sidebar

### Web (≥ 768px)
- Left sidebar (w-64, fixed)
- Top app bar (fixed, full-width)
- Main content: `md:ml-64`
- Bento grid layouts (12-column)
- Quick Record FAB in sidebar bottom
- Mobile bottom nav hidden (`md:hidden`)

---

## Accessibility

All v1 accessibility requirements carry forward. Additions for v2:

- `TapToSpeakButton`: `aria-label="Tap to speak and log a transaction"`, `aria-pressed` state during recording
- `PocketPixelAvatar`: `aria-label="Pocket Pixel, {mood}"`, `role="img"`
- `YourDreamsScroll`: `role="list"`, each `DreamCard` is `role="listitem"` with `aria-label="{name}, {percent}% saved"`
- `AchievementBadge`: locked badges have `aria-disabled="true"` and `aria-label="{name} — locked"`
- Web Speech API: always provide visible text fallback; never rely on voice as the only input method

---

## Implementation Notes

### Dependencies to Add
```json
{
  "Web Speech API": "native browser API — no package",
  "@fontsource/plus-jakarta-sans": "or Google Fonts CDN",
  "@fontsource/be-vietnam-pro": "or Google Fonts CDN"
}
```

### Dependencies to Remove
```json
{
  "lottie-react": "replaced by PNG sprites",
  "shadcn/ui": "replaced by custom components with Material Symbols"
}
```

### Dependencies to Retain
```json
{
  "framer-motion": "page transitions only (not mascot animations)",
  "tailwindcss": "core styling",
  "nlp.ts": "existing NLP parser — voice transcript fed in as string"
}
```

### Tailwind Config

The full color token set and font family config is defined in every `penny-ui` HTML file under `<script id="tailwind-config">`. Copy this config verbatim into `tailwind.config.ts`. The border radius and font family sections are also defined there.

### Story 1-6 Must Precede All UI Work

Per sprint change proposal: **Story 1-6 (Design System Update)** must be implemented before any rework or new UI stories. It establishes the Tailwind tokens, fonts, Material Symbols, and light-mode default that all subsequent components depend on.

---
