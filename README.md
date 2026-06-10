# nada (iOS)

A native iOS dopamine-placebo shopping app. Browse a real-feeling marketplace, fill a cart,
hit checkout — and instead of charging you, nada **intercepts** and celebrates the money you
*didn't* spend.

> you spent nada. nice work.

## Stack
Expo · Expo Router · React Native · TypeScript · Reanimated + Moti (motion) · expo-haptics ·
AsyncStorage (persistence). Pure logic (savings/streak reducer, catalog) is framework-agnostic
and unit-tested with Vitest.

## Develop
    npm install
    npm start          # Expo dev server (press i for iOS simulator with full Xcode, w for web)
    npm run web        # web preview
    npm test           # unit tests (pure logic)
    npm run typecheck  # tsc --noEmit

## Verifying
This environment has only Xcode Command Line Tools, so the app is verified via the **Expo web
preview** (`npm run web`). Running on the iOS Simulator or TestFlight requires full Xcode.

## Shipping to the App Store
The EAS project is linked (`@antneee/nada`) and the listing kit lives in
[`store/app-store.md`](store/app-store.md) — metadata, privacy answers, review notes, and the
step-by-step runbook (`npm run build:ios` → `npm run submit:ios`). Privacy policy: [`PRIVACY.md`](PRIVACY.md).

## How it works
- `lib/storage.ts` — pure `recordIntercept` reducer (savings + streak, capped history) + AsyncStorage I/O
- `lib/catalog.ts` — static product catalog · `lib/theme.ts` — design tokens
- `components/providers/` — Cart + Nada (savings) React contexts, AsyncStorage-persisted
- `components/intercept/InterceptOverlay.tsx` — the signature "magic moment": processing theater → spring + confetti/glow reveal of "You saved $X"
- Tabs: **Shop** (marketplace) · **Search** · **Cart** (hosts the intercept) · **You** (savings hub)
- **Food delivery ritual** (launched from the You tab): `lib/food.ts` (restaurants + menus), `app/food/` (browse → menu → order → courier tracking), `components/food/CourierMap.tsx` (stylized SVG route + animated courier marker), `lib/courier.ts` (status beats), `components/food/CelebrationReveal.tsx`. Food orders run through the same `intercept` and log to the same You stats.
- **Doomscroll ritual** (launched from the You tab): `app/scroll/` (an infinite, guilt-free positive feed — wholesome social posts, affirmations, tiny wins, deadpan slow-news, calm imagery via `lib/feed.ts`), tracked as **time reclaimed** + a scroll streak in `components/providers/ScrollProvider.tsx` (`lib/scroll.ts`, separate from the $ savings), with a calm exit summary. Surfaced as a "Reclaimed" block on the You hub.
  - **Customizable** (`app/scroll/customize.tsx`, `lib/feedPrefs.ts` / `FeedPrefsProvider`): pick a **Classic** card feed or an immersive **Reels-style** full-screen mode, toggle which post types appear, choose photo themes (nature/animals/cozy/food/art/skies), and optionally weave in a few **recent camera-roll photos** — on-device only, never uploaded (`lib/cameraRoll.ts`, opt-in, web-safe no-op).
- **Smoke break ritual** (launched from the You tab): `app/break/` — a timed, guided-breathing break ("all of the break, none of the cigarette"), tracked as breaks taken + time away in `components/providers/BreakProvider.tsx` (`lib/breaks.ts`), with a calm completion. Completes the four-ritual set.
- **Nothing-tracker** (`app/nothing/[ts].tsx`, `lib/nothing.ts`): every save is trackable — "Order intercepted → Your nothing has shipped → Delivered: nothing", advancing on wall-clock time, with the courier map carrying nothing to your door and a native share. Saves also count **things kept out of your house** (`SaveEntry.itemCount`).
- **why this works** (`app/why.tsx`): the honest open-simulator explanation, linked from the You hub.
- `components/ui/Reveal.tsx` — web-reliable entrance primitive (Reanimated `useEffect`-driven) used app-wide for mount/stagger animations.

## Design
Warm cream/espresso palette with soft pastel accents and award-calibre motion — see
`docs/context/design-inspiration.md` and `docs/superpowers/specs/2026-06-08-nada-ios-design.md`.
