# Epic 7: Progression, PWA & Settings

Users earn Saver Levels, unlock Penny skins, install the PWA to their home screen, receive push notifications, and manage their settings. After this epic, the full MVP feature set is complete and production-ready.

## Story 7.1: Saver Level Progression & Penny Legend Skin

As a user,
I want to earn Saver Level badges as I complete goals and unlock a special Penny skin at the top level,
So that I feel a sense of progression and have something to work toward beyond individual goals.

**Acceptance Criteria:**

**Given** a user completes a saving goal
**When** the goal completion celebration (Story 3.5) runs
**Then** `useSaverLevel` hook evaluates the new level based on total goals completed: 1=Bronze, 2=Silver, 3=Gold, 4+=Penny Legend
**And** a Saver Level up animation plays if the level increased (badge unlocks + level name displayed)
**And** the new level badge is visible on the home screen and "My Vibe" settings tab
**And** `streakStore.saverLevel` is updated and persisted to localStorage
**Given** a user reaches Penny Legend (4+ goals completed)
**When** the level up animation plays
**Then** a new Penny visual skin is revealed (distinct Lottie animation set or color variant)
**And** the Penny Legend skin is used for `PennyAvatar` from that point forward
**And** the level up card is shareable via the same `useShareCard` hook (level-up variant)

## Story 7.2: PWA Install Prompt

As a user,
I want Penny to invite me to add the app to my home screen after onboarding,
So that I can access Penny instantly without opening a browser.

**Acceptance Criteria:**

**Given** a user has completed onboarding (Story 2.5)
**When** they land on the home screen for the first time
**Then** `PWAInstallPrompt` appears with a Penny-voiced message: "Add me to your home screen for instant access 🐷"
**And** the prompt uses the browser's `beforeinstallprompt` event on Android Chrome
**And** on iOS Safari, the prompt shows manual instructions ("Tap Share → Add to Home Screen")
**And** the prompt is shown only once — dismissed state is persisted to localStorage
**And** dismissing the prompt does not block access to any feature
**And** when installed, the app launches in `standalone` display mode (no browser chrome)

## Story 7.3: Social Link Preview (OG Tags)

As a developer,
I want the Penny PWA URL to display a rich preview when shared on social media,
So that shared links drive curiosity and clicks from teens on TikTok and Instagram.

**Acceptance Criteria:**

**Given** the Penny PWA URL is shared on any social platform
**When** the platform fetches the URL for preview
**Then** the `<head>` contains Open Graph tags: `og:title`, `og:description`, `og:image` (penny-mascot.png), `og:url`
**And** `og:image` resolves to `public/penny-mascot.png` at the deployed CDN URL
**And** `twitter:card` is set to `summary_large_image`
**And** the preview title and description are teen-native in tone (not generic app store copy)
**And** tags are present in the static `index.html` — no server-side rendering required

## Story 7.4: Web Push Notifications

As a user,
I want to opt into Penny's push notifications via a Penny-voiced prompt,
So that Penny can remind me to log and keep my streak alive without intrusive browser dialogs.

**Acceptance Criteria:**

**Given** a user has been active for at least 3 days
**When** they have not yet been asked about notifications
**Then** `PennyResponseBubble` shows a Penny-voiced opt-in prompt: "Want me to nudge you when your streak is at risk? 🐷"
**And** the browser's native permission dialog is only shown after the user taps "Yes, nudge me"
**And** the browser default dialog is never shown without prior user intent (NFR24)
**And** if permission is granted, the Service Worker registers for Web Push via the Push API
**And** streak reminder notifications reference the user's current streak count and goal
**And** notification permission state is stored in settings and reflected in "My Vibe" (Story 7.5)
**And** users who decline are never asked again

## Story 7.5: My Vibe Settings

As a user,
I want to manage my notification preferences, tone settings, and display mode in one place,
So that I can personalise Penny to feel right for me.

**Acceptance Criteria:**

**Given** a user navigates to the "My Vibe ✨" tab
**When** the settings screen loads
**Then** the following settings are available: notification toggle (streak reminders on/off), Weekly Roast opt-in toggle (post-MVP, visible but labelled "coming soon"), dark/light mode toggle (UX-DR1)
**And** toggling dark/light mode switches the `<html>` class immediately without a page reload
**And** the selected mode is persisted to localStorage and restored on next visit
**And** notification toggle reflects the current Web Push permission state from Story 7.4
**And** turning off notifications does not revoke browser permission — it suppresses sends server-side
**And** account notification settings are synced via `GET /notifications/settings/current` and `PUT /notifications/settings/current` (FR45)
**And** all toggle controls have visible labels and meet 44×44px touch target requirement (NFR19)
