# nada

A dopamine-placebo web app. Run the full impulse-shopping ritual — browse, fill a cart,
hit checkout — and get intercepted at payment. nada celebrates the money you *didn't* spend.

> you spent nada. nice work.

## Stack
Next.js (App Router) · TypeScript · Tailwind · Framer Motion. Fully client-side; state in `localStorage`.

## Develop
    npm install
    npm run dev      # http://localhost:3000
    npm test         # unit + component tests
    npm run build    # production build

## Deploy
Push to a Git host and import into Vercel. No environment variables required.

## How it works
- `lib/storage.ts` — savings/streak/intercept reducer (pure, unit-tested) + localStorage I/O
- `lib/catalog.ts` — static product catalog
- `components/intercept/InterceptOverlay.tsx` — processing theater then celebration
- Other rituals (food delivery, doomscroll, smoke break) are intentional "coming soon" teasers.
