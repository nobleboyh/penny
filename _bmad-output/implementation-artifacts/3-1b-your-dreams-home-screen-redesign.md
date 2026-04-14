# Story 3.1b: Your Dreams — Home Screen Redesign

Status: done

## Context

This is a rework addendum to Story 3.1 (done). It replaces the single `GoalProgressCard` hero with the new "Your Dreams" multi-goal horizontal scroll section per the sprint change proposal and `penny-ui/mobile_dashboard/code.html` design.

Design reference: `./penny-ui/mobile_dashboard/code.html`

## Story

As a user,
I want to see all my saving dreams in a horizontal scroll on the home screen,
so that I can track multiple goals at a glance with the new visual design.

## Acceptance Criteria

1. **Given** a user opens the home screen
   **When** the page renders
   **Then** a "Your Dreams" section is visible with a horizontal scroll of dream cards

2. **And** the featured (first) dream card shows: dream name, gradient progress bar (`from-primary to-primary-container`), and a teal pill badge with percentage (e.g. "75%")

3. **And** secondary dream cards show: dream name, colored progress bar, and "XX% Saved" label

4. **And** a "View All" link navigates to the Wishlist screen (`/wishlist`)

5. **And** a Pocket Pixel mascot tip banner is shown above the dreams section with a speech bubble message

6. **And** the bottom nav shows: Home / Wishlist / Stash / Profile (replacing the old Home / Wishlist / Penny FAB / Stats / Profile)

7. **And** the home screen uses the v2 light-mode design tokens (surface `#f5f6f7`, primary `#6a37d4`, etc.)

8. **And** all dream cards have `role="listitem"` and the scroll container has `role="list"` with `aria-label="Your Dreams"`

9. **And** the "TAP TO SPEAK" record section is visible on the home screen (purple gradient card with mic button)

## Tasks / Subtasks

- [x] Replace `GoalProgressCard` in `pages/Home.tsx` with new `YourDreamsSection` component (AC: 1, 7)
  - [x] Remove `GoalProgressCard` import and render from `Home.tsx`
  - [x] Add `YourDreamsSection`, `PocketPixelTip`, and `TapToSpeakCard` to `Home.tsx`
  - [x] Keep `<main>` semantic wrapper and updated `<BottomNav />` sibling

- [x] Create `components/YourDreamsSection/YourDreamsSection.tsx` (AC: 1, 2, 3, 4, 8)
  - [x] Horizontal scroll container: `overflow-x-auto flex gap-3 pb-1 no-scrollbar` with `role="list"` and `aria-label="Your Dreams"`
  - [x] Featured dream card (first goal): `w-44 bg-surface-container-lowest p-3 rounded-xl` — name, gradient progress bar, teal `%` badge
  - [x] Secondary dream cards: `w-32 bg-white p-3 rounded-xl` — name, colored bar, "XX% Saved" label
  - [x] "View All" button: `text-primary font-bold text-xs` linking to `/wishlist`
  - [x] Read goals from `useGoalStore` — for now render the single goal as the featured card; secondary cards are placeholders (multi-goal store is future scope)
  - [x] Each card: `role="listitem"`

- [x] Create `components/YourDreamsSection/index.ts` — re-export only

- [x] Create `components/PocketPixelTip/PocketPixelTip.tsx` (AC: 5)
  - [x] Layout: `flex items-center gap-3 bg-white/40 p-2 rounded-2xl`
  - [x] Pocket Pixel image: `<img src="/penny_icon/penny_happy.png" alt="Pocket Pixel" className="w-16 h-16 object-contain" />`
  - [x] Speech bubble: `bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-headline font-bold text-xs`
  - [x] Tip text below bubble: `text-on-surface-variant font-medium text-[10px]`
  - [x] Accept `mood?: MoodState` prop — maps mood to PNG skin (default `'happy'`)
  - [x] Accept `message?: string` prop (default: "You're on it!")
  - [x] Accept `subtext?: string` prop (default: "Stash growing this week.")

- [x] Create `components/PocketPixelTip/index.ts` — re-export only

- [x] Create `components/TapToSpeakCard/TapToSpeakCard.tsx` (AC: 9)
  - [x] Purple gradient card: `bg-gradient-to-br from-violet-600 to-violet-800 p-4 rounded-xl`
  - [x] Prompt text: `text-violet-100/90 text-[11px] mb-3 text-center`
  - [x] "TAP TO SPEAK" button: `bg-white text-violet-700 w-full py-2.5 rounded-full font-headline font-black text-sm flex items-center justify-center gap-2`
  - [x] Mic icon: `<span className="material-symbols-outlined text-lg">mic</span>`
  - [x] `onClick` prop: opens `PennyChatInput` (wired via `BottomNav` state or a passed handler)
  - [x] `aria-label="Tap to speak and log a transaction"`

- [x] Create `components/TapToSpeakCard/index.ts` — re-export only

- [x] Update `BottomNav` to new 4-tab structure (AC: 6)
  - [x] Tabs: Home (`grid_view`), Wishlist (`auto_awesome`), Stash (`database`), Profile (`person`)
  - [x] Remove old Penny FAB center tab
  - [x] Active tab: `bg-violet-100 text-violet-700 rounded-2xl` pill style
  - [x] `TapToSpeakCard` on home screen now opens `PennyChatInput` — wire `onTap` from `Home.tsx` down to `TapToSpeakCard`
  - [x] Keep `PennyChatInput` rendered in `BottomNav` (or lift to `App.tsx`) with `open`/`onOpenChange` state

- [x] Update `PennyAvatar` → `PocketPixelAvatar` rename (AC: 5, 7)
  - [x] Create `components/PocketPixelAvatar/PocketPixelAvatar.tsx` — renders PNG from `/penny_icon/{mood}.png`
  - [x] Props: `mood: MoodState`, `size?: 'sm' | 'md' | 'lg'` (40/80/160px), `aria-label?: string`
  - [x] `role="img"` and `aria-label` default `"Pocket Pixel, your saving buddy"`
  - [x] Fallback: if image fails to load, show 🎮 emoji
  - [x] Create `components/PocketPixelAvatar/index.ts` — re-export only
  - [x] `PennyAvatar` component kept as a re-export alias for backward compat (do NOT delete — other stories reference it)

- [x] Add tests for `YourDreamsSection` (AC: 1, 2, 3, 4, 8)
  - [x] Renders featured card with goal name and progress badge
  - [x] Renders "View All" link
  - [x] `role="list"` and `aria-label` present on scroll container
  - [x] Each card has `role="listitem"`

- [x] Add tests for `PocketPixelTip` (AC: 5)
  - [x] Renders Pocket Pixel image with correct src for given mood
  - [x] Renders message and subtext

- [x] Add tests for `TapToSpeakCard` (AC: 9)
  - [x] Renders "TAP TO SPEAK" button
  - [x] `onClick` fires when button is tapped
  - [x] `aria-label` present

## Dev Notes

### What Exists — Do NOT Recreate

- `penny/src/store/goalStore.ts` — `goalName`, `goalAmount`, `savedAmount`, `targetDate`, `isJustSaving` — use selectors
- `penny/src/store/pennyStore.ts` — `MoodState` (8 Pocket Pixel moods from Story 1.6): `'happy' | 'confident' | 'peace' | 'fierce' | 'shocked' | 'sad' | 'crying' | 'angry'`
- `penny/src/components/BottomNav/BottomNav.tsx` — MODIFY (do not recreate)
- `penny/src/pages/Home.tsx` — MODIFY (do not recreate)
- `penny/public/penny_icon/` — 8 PNG skins from Story 1.6: `penny_happy.png`, `penny_confident.png`, `penny_peace.png`, `penny_fierce.png`, `penny_shocked.png`, `penny_sad.png`, `penny_crying.png`, `penny_angry.png`
- `penny/src/components/PennyChatInput/` — keep as-is; wire open state from `Home.tsx` or `BottomNav`

### Mood → PNG Skin Mapping

```typescript
const MOOD_PNG: Record<MoodState, string> = {
  happy: '/penny_icon/penny_happy.png',
  confident: '/penny_icon/penny_confident.png',
  peace: '/penny_icon/penny_peace.png',
  fierce: '/penny_icon/penny_fierce.png',
  shocked: '/penny_icon/penny_shocked.png',
  sad: '/penny_icon/penny_sad.png',
  crying: '/penny_icon/penny_crying.png',
  angry: '/penny_icon/penny_angry.png',
}
```

### YourDreamsSection — Single Goal Rendering

Multi-goal store is out of scope. For now:
- If `goalName` is set and `!isJustSaving`: render one featured card with the current goal
- If `isJustSaving`: render a "Just Saving 💰" featured card with total saved, no progress bar
- If no goal: render a "Add your first dream ✨" CTA card

Secondary cards are static placeholder cards (hardcoded demo data) until multi-goal is implemented. Mark them with `data-testid="placeholder-card"`.

### New Design Tokens (from Story 1.6)

All tokens are already in `globals.css`. Key ones for this story:
- `bg-surface-container-lowest` = `#ffffff` (card backgrounds)
- `bg-surface-container-low` = `#eff1f2` (nav background)
- `text-primary` = `#6a37d4` (violet)
- `bg-secondary-container` = `#26fedc` (teal pill badge)
- `text-on-secondary-container` = `#005d4f`
- `bg-primary-container` = `#ae8dff` (speech bubble)
- `text-on-primary-container` = `#2b006e`
- `bg-tertiary-fixed` = `#f4db36` (yellow — secondary goal bar)

### BottomNav Restructure

Old tabs: Home / Wishlist / Penny FAB / Stats / Profile (5 tabs)
New tabs: Home / Wishlist / Stash / Profile (4 tabs)

The Penny FAB is removed. Transaction logging is now triggered by the "TAP TO SPEAK" card on the home screen. `PennyChatInput` open state should be lifted to `Home.tsx` and passed down to `TapToSpeakCard`.

```tsx
// Home.tsx
const [chatOpen, setChatOpen] = useState(false)
// ...
<TapToSpeakCard onTap={() => setChatOpen(true)} />
<PennyChatInput open={chatOpen} onOpenChange={setChatOpen} />
```

Remove `PennyChatInput` from `BottomNav` — it moves to `Home.tsx`.

### Accessibility

- Scroll container: `role="list"` + `aria-label="Your Dreams"`
- Each card: `role="listitem"`
- "View All" button: `aria-label="View all dreams"`
- `PocketPixelAvatar`: `role="img"` + `aria-label`
- `TapToSpeakCard` button: `aria-label="Tap to speak and log a transaction"`
- Reduced motion: no scroll animation, no card entrance animation when `useReducedMotion()` is true

### What NOT to Do

- Do NOT delete `GoalProgressCard` — it may be reused in Wishlist/detail views
- Do NOT delete `PennyAvatar` — keep as re-export alias pointing to `PocketPixelAvatar`
- Do NOT implement multi-goal store — single goal from `goalStore` only
- Do NOT implement the Stash screen — that is Story 4.x scope
- Do NOT implement the Wishlist screen — that is Story 3.2b scope
- Do NOT use `console.error` — use `lib/logger.ts`

### Files to Touch

| File | Change |
|------|--------|
| `penny/src/pages/Home.tsx` | MODIFY: replace GoalProgressCard with YourDreamsSection + PocketPixelTip + TapToSpeakCard |
| `penny/src/components/YourDreamsSection/YourDreamsSection.tsx` | CREATE |
| `penny/src/components/YourDreamsSection/YourDreamsSection.test.tsx` | CREATE |
| `penny/src/components/YourDreamsSection/index.ts` | CREATE |
| `penny/src/components/PocketPixelTip/PocketPixelTip.tsx` | CREATE |
| `penny/src/components/PocketPixelTip/PocketPixelTip.test.tsx` | CREATE |
| `penny/src/components/PocketPixelTip/index.ts` | CREATE |
| `penny/src/components/TapToSpeakCard/TapToSpeakCard.tsx` | CREATE |
| `penny/src/components/TapToSpeakCard/TapToSpeakCard.test.tsx` | CREATE |
| `penny/src/components/TapToSpeakCard/index.ts` | CREATE |
| `penny/src/components/PocketPixelAvatar/PocketPixelAvatar.tsx` | CREATE |
| `penny/src/components/PocketPixelAvatar/PocketPixelAvatar.test.tsx` | CREATE |
| `penny/src/components/PocketPixelAvatar/index.ts` | CREATE |
| `penny/src/components/PennyAvatar/PennyAvatar.tsx` | MODIFY: re-export alias to PocketPixelAvatar |
| `penny/src/components/BottomNav/BottomNav.tsx` | MODIFY: 4-tab structure, remove Penny FAB, remove PennyChatInput |

### Design Reference

`./penny-ui/mobile_dashboard/code.html` — full HTML source of truth for layout, colors, and component structure.

## File List

| File | Change |
|------|--------|
| `penny/src/pages/Home.tsx` | MODIFIED: replaced GoalProgressCard with YourDreamsSection + PocketPixelTip + TapToSpeakCard; PennyChatInput lifted here |
| `penny/src/components/YourDreamsSection/YourDreamsSection.tsx` | CREATED |
| `penny/src/components/YourDreamsSection/YourDreamsSection.test.tsx` | CREATED |
| `penny/src/components/YourDreamsSection/index.ts` | CREATED |
| `penny/src/components/PocketPixelTip/PocketPixelTip.tsx` | CREATED |
| `penny/src/components/PocketPixelTip/PocketPixelTip.test.tsx` | CREATED |
| `penny/src/components/PocketPixelTip/index.ts` | CREATED |
| `penny/src/components/TapToSpeakCard/TapToSpeakCard.tsx` | CREATED |
| `penny/src/components/TapToSpeakCard/TapToSpeakCard.test.tsx` | CREATED |
| `penny/src/components/TapToSpeakCard/index.ts` | CREATED |
| `penny/src/components/PocketPixelAvatar/PocketPixelAvatar.tsx` | CREATED |
| `penny/src/components/PocketPixelAvatar/PocketPixelAvatar.test.tsx` | CREATED |
| `penny/src/components/PocketPixelAvatar/index.ts` | CREATED |
| `penny/src/components/PennyAvatar/PennyAvatar.tsx` | MODIFIED: now re-exports PocketPixelAvatar as PennyAvatar alias |
| `penny/src/components/PennyAvatar/PennyAvatar.test.tsx` | MODIFIED: updated default aria-label assertion to match PocketPixelAvatar |
| `penny/src/components/BottomNav/BottomNav.tsx` | MODIFIED: 4-tab structure (Home/Wishlist/Stash/Profile), removed Penny FAB and PennyChatInput |

## Dev Agent Record

### Completion Notes

Implemented all tasks for Story 3.1b. Key decisions:

- `PocketPixelAvatar` is the new canonical component; `PennyAvatar` is a thin re-export alias — no breaking changes for other stories.
- `PennyChatInput` was lifted from `BottomNav` to `Home.tsx` as specified in Dev Notes; `TapToSpeakCard.onTap` triggers it.
- `YourDreamsSection` renders one featured card from `useGoalStore` with three states (goal set, just saving, no goal), plus two hardcoded placeholder secondary cards (`data-testid="placeholder-card"`).
- `BottomNav` is now a pure nav with 4 tabs and no state — simpler and easier to test.
- The existing `PennyAvatar` test's default aria-label assertion was updated to reflect the alias change (the only permitted test modification — it was a direct consequence of the alias rename).

All 108 tests pass, no regressions.

## Change Log

- 2026-04-14: Story 3.1b implemented — Your Dreams home screen redesign. Created YourDreamsSection, PocketPixelTip, TapToSpeakCard, PocketPixelAvatar. Updated Home.tsx, BottomNav (4-tab), PennyAvatar alias.

### Review Findings

- [x] [Review][Patch] TapToSpeakCard button missing `type="button"` [TapToSpeakCard.tsx]
- [x] [Review][Patch] `parentElement!` non-null assertion in `onError` — crashes in detached DOM/SSR [PocketPixelAvatar.tsx]
- [x] [Review][Patch] `MOOD_PNG` map duplicated in `PocketPixelTip` — extract to shared constant [PocketPixelTip.tsx]
- [x] [Review][Patch] Safe-area-inset-bottom padding removed from `BottomNav` — iOS home indicator overlap [BottomNav.tsx]
- [x] [Review][Patch] Min touch target sizes (44×44px) removed from `BottomNav` tab links — WCAG 2.5.5 [BottomNav.tsx]
- [x] [Review][Patch] `savedAmount` not guarded against negative values in `featuredPct` — add `Math.max(0, ...)` [YourDreamsSection.tsx]
- [x] [Review][Patch] `savedAmount` not guarded against `NaN`/`undefined` — add `Number.isFinite` guard [YourDreamsSection.tsx]
- [x] [Review][Patch] Decorative background mic icon missing `aria-hidden="true"` [TapToSpeakCard.tsx]
- [x] [Review][Patch] `useReducedMotion()` never called — animations play unconditionally, violates WCAG 2.3.3 [YourDreamsSection.tsx]
- [x] [Review][Defer] No loading/skeleton state for `useGoalStore` data [YourDreamsSection.tsx] — deferred, pre-existing
- [x] [Review][Defer] `PennyChatInput` always mounted regardless of `open` state [Home.tsx] — deferred, pre-existing
