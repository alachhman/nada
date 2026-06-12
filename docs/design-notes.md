# nada — design notes

Decisions and intent from design passes, so future sessions retain the *why*.

## 2026-06-12 — "100x the Design" pass #2 (post endless-aisle/presence)

Method: [the design-pass plan](superpowers/plans/2026-06-10-design-pass.md) (anshuc
frame-verification method), adapted to the iOS-era app — Playwright walks the Expo web
preview at 390×844 recording video (`scripts/design-pass/walk.mjs`), ffmpeg dumps frames
and maps pops/freezes (`scdet`, `freezedetect`), and pixel measurements settle disputes
screenshots can't. Native-fidelity spot checks deferred to the next simulator build.

### Verified good (no changes — evidence, not vibes)

- **Intercept theater → celebration morph**: no scene-cut at the boundary; the morph
  reads as one continuous moment. Count-up verified mid-flight ($32→$39 across frames).
- **Breathing circle**: measured 207→289px (+40%) per cycle — two stills suggested it
  barely moved; frame measurement proved otherwise. Lesson recorded: measure, don't
  eyeball two frames.
- You-hub hero count-up, nothing-tracker, cart, why-page: clean.

### Fixed (and the intent behind each)

1. **Fabricated break-room presence removed** (`app/break/index.tsx`). It rendered
   "N others are on a break right now" from `2 + (minutes % 3)` — a deterministic lie.
   The charter (and the why-page's own copy) forbids imitation sociality. Now: nothing
   renders unless `PRESENCE_ENABLED && enabled`, in which case the count is REAL
   (presence events with `ritual === "break"` in the last hour:
   "N real breaks taken in the last hour"). Dark today; truthful at v1.1.
2. **Noun-aware product imagery** (`lib/catalogGen.ts` `IMAGE_BY_NOUN`). Generated
   products were drawing art/nature/social photos (a painting sold as an overshirt).
   Every noun now maps to 1–3 of the curated product-shot IDs; heavy reuse is accepted —
   repeated stock photography reads "cheap store", mismatched photography reads "scam".
3. **Noun-aware weights** (`WEIGHT_BY_NOUN`, constrained inside category bands so tests
   hold). No more 8.5 lb earbuds undermining the dodge-metric's credibility.
4. **Sparse deal badges** (`ProductCard.dealBadge` + id-hash gate, ~25% of eligible).
   A badge on every card is a template tell; scarcity restores the signal.
5. **Curated skillet photo corrected** to a visually-verified overhead cast-iron pan
   (`photo-1604908176997-125f25cc6f3d`); the old image (a knife set) stays mapped to
   knife/kitchen-tool nouns where it's truthful.
6. **Layout nits**: food title no longer clipped by the absolute back button
   (header paddingLeft); Breaks card "taken" demoted to the sibling sub-label style;
   category chips get trailing breathing room to signal scrollability; broken ⚖ glyph
   removed from the dodge block.

### Known deferred

- Native-fidelity frame audit on the iOS simulator (needs a fresh build; Reanimated
  timing differs from web).
- The celebration → next-screen exit is a plain navigation cut; consider a fade-through
  exit in a future pass.
- Foam-roller/apparel imagery is adjacent-not-exact (person stretching, hoodie for all
  garment nouns) — acceptable stock-photo realism; revisit if/when illustrated art lands.
