# nada — App Store submission kit

Everything needed to take nada from this repo to the App Store. Items marked 🔑 require
your accounts (Expo login is already active; Apple Developer is the remaining gate).

---

## 1. Listing metadata (paste into App Store Connect)

| Field | Value | Limit |
|---|---|---|
| **Name** | `nada — buy nothing` | 30 chars (19 ✓) |
| **Subtitle** | `the dopamine, not the damage` | 30 chars (28 ✓) |
| **Bundle ID** | `com.nada.shop` | — |
| **SKU** | `nada-ios-001` | — |
| **Primary category** | Lifestyle | — |
| **Secondary category** | Health & Fitness | — |
| **Price** | Free | — |
| **Age rating** | 4+ (answer "No" to all content questions) | — |

**Keywords** (100 chars):
```
impulse,shopping,habit,dopamine,mindful,spending,saving,doomscroll,wellness,placebo,calm
```
(88 chars ✓)

**Promotional text** (170 chars):
```
Get the thrill of the impulse buy — keep the money. nada intercepts your checkout and celebrates what you didn't spend.
```

**Description:**
```
nada is a shop where you can't buy anything — on purpose.

Browse a real-feeling marketplace. Read the reviews. Fill your cart. Hit checkout.
And right when you'd pay… nada intercepts the order and celebrates the money you
didn't spend. You get the hunt, the pick, the click — and you keep the cash.

It's a placebo for impulse habits. The ritual is real; the damage isn't.

RITUALS
• Impulse shopping — browse, cart, checkout, get intercepted. "You saved $129."
• Food delivery — build an order, track your courier to your door, never pay (or tip).
• Doomscroll — an endless feed that owes you nothing: wholesome posts, tiny wins,
  slow news where nothing bad happens. Time here is counted as time reclaimed.

YOUR WINS, TRACKED
• Total money you didn't spend, with streaks
• Cravings handled
• Time reclaimed from the scroll

PRIVATE BY DESIGN
No account. No ads. No tracking. Everything stays on your device.

you spent nada. nice work.
```

**Support URL:** your GitHub repo page (or any page you control)
**Privacy Policy URL:** host `PRIVACY.md` (e.g. GitHub: the file's blob URL works) 🔑

**App Privacy questionnaire:** select **"Data Not Collected"** for everything — the app
has no accounts, no analytics, no tracking, no third-party SDKs that collect data.

**App Review notes (paste into the Review Information box):**
```
nada is a wellness/novelty app — a "placebo" for impulse habits. The shopping and
food-delivery flows are intentionally fake: no real products, no real commerce, no
payment is ever requested or processed. The "checkout" deliberately intercepts and
shows the user the money they did not spend. No account is required; all state is
stored locally on-device. Product/feed imagery is loaded from Unsplash's public CDN.
```

## 2. Screenshots (required: 6.7" iPhone, 1290×2796)

Capture from the iOS Simulator (needs full Xcode) or a physical iPhone Pro Max.
Suggested 5-shot story:
1. Shop home ("Everything you don't need")
2. The intercept reveal ("You saved $149 · Craving handled") — the money shot
3. You hub ($ saved, streaks, reclaimed time)
4. Food delivery courier map
5. Doomscroll feed ("an endless feed that owes you nothing")

Optional captions in the warm cream/espresso style (see `docs/context/design-inspiration.md`).

## 3. Submission runbook

Already done in this repo:
- [x] Real app icon set (`assets/`), splash, favicon — "nada." wordmark on cream
- [x] `eas.json` build profiles + OTA channels; `app.json` store config
  (`com.nada.shop`, iPhone-only, `ITSAppUsesNonExemptEncryption: false`)
- [x] Privacy policy written (`PRIVACY.md`)
- [x] Most prominent branded product photo (Nike) swapped for unbranded imagery
- [x] EAS login active; project linked (`eas init`)

Remaining — each 🔑 needs you:

1. 🔑 **Apple Developer Program** — enroll at https://developer.apple.com/programs/
   ($99/yr, personal or org). Wait for approval (usually < 48h).
2. 🔑 **Production build** — `npm run build:ios`
   EAS will prompt once for your Apple ID, create certs/profiles automatically, and
   register the `com.nada.shop` bundle ID on your team.
3. 🔑 **Create the app record + upload** — `npm run submit:ios`
   (EAS can create the App Store Connect record for you, or create it first at
   https://appstoreconnect.apple.com with the metadata above.)
4. 🔑 **Fill the listing** in App Store Connect: metadata above, screenshots,
   privacy "Data Not Collected", privacy-policy URL, review notes.
5. 🔑 **TestFlight sanity pass** (install the build, run all three rituals once).
6. 🔑 **Submit for review.** Typical review time: 1–2 days.

## 4. Known review-risk notes (pre-empted)

- **Fake commerce:** clearly disclosed in review notes; no payment UI exists. The app
  never asks for payment info, so Guideline 3.1 (payments) does not apply.
- **IP / Guideline 5.2:** the loudest branded product photo (Nike sneaker) has been
  replaced. A few catalog photos may still show incidental products (e.g. a keyboard,
  a smartwatch); if review flags one, swap the Unsplash ID in `lib/catalog.ts` and
  ship an OTA-independent rebuild (catalog is bundled).
- **Minimum functionality (4.2):** three interactive rituals + persistent stats — well
  beyond a "thin" app.
- **"Smoke break" teaser:** it's a locked, non-functional card. If review questions a
  smoking reference, it can be hidden via a one-line change in `app/(tabs)/you.tsx`.
