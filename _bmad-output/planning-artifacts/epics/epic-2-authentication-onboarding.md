# Epic 2: Authentication & Onboarding

Users can register with Google or Apple, complete goal setup, meet Penny, and reach the home screen in under 2 minutes. After this epic, the full onboarding funnel is live and users can authenticate.

## Story 2.1: Age Gate (COPPA Compliance)

As a new user,
I want to confirm my age before registering,
So that the app complies with COPPA 2025 (16+ default path).

**Acceptance Criteria:**

**Given** a user visits the Penny PWA for the first time
**When** they reach the registration screen
**Then** an age confirmation step is shown before any account creation
**And** users who indicate they are under 16 are shown a friendly message and cannot proceed
**And** users who confirm 16+ can proceed to social login
**And** the age gate is enforced server-side in the auth-service registration endpoint
**And** the `AgeGate.tsx` component is in `features/auth/components/`

## Story 2.2: Social Login (Google OAuth2 + Apple Sign In)

As a new user,
I want to register and log in using Google or Apple,
So that I don't need to create a password.

**Acceptance Criteria:**

**Given** a user has passed the age gate
**When** they tap "Continue with Google" or "Continue with Apple"
**Then** the OAuth2 flow completes and an internal token is issued by auth-service
**And** Google OAuth2 and Apple Sign In are both available simultaneously (NFR23)
**And** social tokens are validated server-side before issuing internal tokens (NFR11)
**And** the token is stored in the Redis-backed token store (from Story 1.2)
**And** on success the user is routed to the onboarding goal setup flow
**And** `SocialLoginButtons.tsx` renders both options with minimum 44×44px touch targets (NFR19)

## Story 2.3: Goal-First Onboarding Flow

As a new user,
I want to set my saving goal with Penny calculating my weekly target,
So that I immediately understand what I'm working toward.

**Acceptance Criteria:**

**Given** a newly registered user
**When** they complete the onboarding goal setup
**Then** they are shown one question per screen: goal selection → target amount → target date
**And** goal cards are visual selectors (no dropdowns) per UX-DR17
**And** the amount input uses `inputmode="decimal"` and font size ≥ 24px
**And** the date picker offers quick options: 1 month / 3 months / 6 months / Custom
**And** Penny calculates and displays the weekly saving target instantly after date is selected (FR4)
**And** the goal is saved to the account via `PUT /accounts/current`
**And** the full onboarding flow completes in under 2 minutes (UX success criterion)

## Story 2.4: "Just Saving" Onboarding Path

As a new user,
I want to skip goal setup and start saving without a specific goal,
So that I'm not blocked from using the app if I don't have a goal in mind.

**Acceptance Criteria:**

**Given** a user is on the goal selection screen
**When** they tap "Just saving 💰"
**Then** they skip the price and date screens
**And** a default "Just saving" goal state is set in `goalStore`
**And** the home screen shows Penny with an encouraging no-goal message
**And** Penny's message does not pressure the user to set a goal immediately
**And** the skip path routes to the Penny introduction screen (Story 2.5)

## Story 2.5: Penny Introduction & Home Screen Entry

As a new user,
I want to be introduced to Penny by name after onboarding and land on the home screen,
So that I understand who Penny is before I start using the app.

**Acceptance Criteria:**

**Given** a user has completed goal setup or chosen "Just saving"
**When** the Penny introduction screen is shown
**Then** `PennyAvatar` (lg, 160px) is displayed in `excited` mood state with bounce animation
**And** Penny's introduction message is shown: name, personality, and a reference to the user's goal if set
**And** a single primary CTA "Let's go!" advances to the home screen
**And** the bottom navigation (`BottomNav`) is visible on the home screen with all 5 tabs (UX-DR14)
**And** the Penny center tab is slightly larger than the other tabs with no label
**And** `PennyAvatar` has `aria-label="Penny, your saving buddy"` and `role="img"` (UX-DR6)

## Story 2.6: Returning User Session Restore

As a returning user,
I want to be authenticated and returned to my existing session state,
So that I don't have to set up my goal again.

**Acceptance Criteria:**

**Given** a user has previously completed onboarding
**When** they open the Penny PWA
**Then** their existing OAuth2 token is validated against the Redis token store
**And** they are routed directly to the home screen (skipping onboarding)
**And** their goal state, streak, and Penny mood are restored from Zustand (localStorage)
**And** if the token is expired, they are routed to the login screen (not onboarding)
**And** an expired token does not cause a blank screen or unhandled error
