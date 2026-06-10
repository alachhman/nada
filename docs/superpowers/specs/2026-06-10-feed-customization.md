# Doomscroll — Feed Customization

**Date:** 2026-06-10
**Status:** Approved
**Builds on:** the doomscroll ritual (`app/scroll/`, `lib/feed.ts`, `ScrollProvider`).

## Overview

Let the user shape their guilt-free feed. Three controls + an opt-in:
1. **Layout** — keep it as it is now (**Classic** card feed) or switch to an immersive,
   full-screen, vertically-snapping **Reels/TikTok-style** mode.
2. **What you see** — toggle which post types appear (wholesome posts, affirmations, tiny wins,
   slow news, calm photos). The "nada" reminders always stay.
3. **Photo vibes** — pick which kinds of pictures show up (Nature / Animals / Cozy / Food / Art /
   Skies), multi-select; drives the calm + immersive imagery.
4. **Your photos** (opt-in) — weave a few recent nice shots from the camera roll into the feed.
   On-device only, never uploaded (consistent with nada's no-data-collection charter). Native only.

All of this stays **free** (it deepens the calm, anti-doomscroll experience). Note: per the
[nada+ spec](2026-06-10-nada-plus-monetization.md) this maps to the future "customization / expanded
worlds" tier; we are NOT gating it now (monetization flag is off).

## Decisions
- Preferences persist in a small **`FeedPrefsProvider`** (AsyncStorage `nada_feedprefs_v1`), same
  pattern as ScrollProvider. Sensible defaults reproduce today's feed exactly.
- Customization is reached from a **gear/sliders control** in the feed's top bar → a
  **Customize sheet/screen** (`app/scroll/customize.tsx`).
- `generateFeed(startIndex, count, prefs?)` gains an **optional** prefs arg (default = everything on
  = current behavior, so existing tests/call sites keep working). It filters enabled post types and
  draws imagery from enabled photo themes, staying deterministic by index.
- New FeedItem kind **`photo`** for camera-roll images (`{ kind:"photo"; id; uri; caption? }`).
- Camera roll via **expo-image-picker / expo-media-library** (permissioned, opt-in); on web it's a
  no-op (the toggle shows "available on device"). Add `NSPhotoLibraryUsageDescription` to `app.json`.

## Data / model
`lib/feedPrefs.ts`:
```ts
export type PostType = "social" | "affirmation" | "tinywin" | "news" | "calm";
export type PhotoTheme = "nature" | "animals" | "cozy" | "food" | "art" | "skies";
export interface FeedPrefs {
  layout: "classic" | "immersive";
  postTypes: Record<PostType, boolean>;   // which kinds appear (nada always on)
  photoThemes: Record<PhotoTheme, boolean>;
  cameraRoll: boolean;                     // opt-in
}
export const DEFAULT_FEED_PREFS: FeedPrefs; // classic, all postTypes on, nature+animals+cozy+skies on, cameraRoll off
```
`FeedPrefsProvider` → `{ prefs, hydrated, setLayout, togglePostType, togglePhotoTheme, setCameraRoll, reset }`.

`lib/feed.ts`:
- Reorganize calm imagery into **themed pools** `PHOTO_POOLS: Record<PhotoTheme, {image,caption}[]>`
  (~8 each: Nature, Animals, Cozy interiors, Food, Art/abstract, Skies) — Unsplash IDs + gentle captions.
- `generateFeed(startIndex, count, prefs?)`: build the kind-cycle from the **enabled** `postTypes`
  (always include a `nada` every ~8; if the user disables everything, fall back to calm so the feed
  is never empty). `calm`/image cards draw from the union of enabled `photoThemes`. Deterministic by
  global index; stable unique ids (`item-<n>`).

## Layout: Immersive (Reels-style)
`components/scroll/ImmersiveCard.tsx` + a renderer the scroll screen swaps in when `layout==="immersive"`:
- A vertically **paged** FlatList (`pagingEnabled`, snap = screen height, one item/screen,
  `decelerationRate="fast"`).
- Image/photo/calm items: **full-bleed** `expo-image` with a slow **Ken-Burns** drift (Reanimated
  scale, reduce-motion aware), a bottom gradient scrim, caption overlay, and a subtle "swipe up"
  hint on the first card.
- Text items (affirmation/tinywin/news/social): full-screen, centered, on a soft gradient (or a
  faded calm photo) so they read as immersive "cards."
- nada interstitial: full-screen calm version with the running session time.
- Keep the existing **top bar** (close → exit summary) and **session-time tracking** intact in both
  layouts. Classic stays exactly as today.

## Camera roll (opt-in, native)
`lib/cameraRoll.ts`: `getRecentPhotos(limit)` using expo-media-library (guarded: web/no-permission →
`[]`). On the feed, if `cameraRoll` enabled + permission granted, fetch once on mount and **sprinkle
a few** `photo` items into the generated stream (e.g. every ~10th slot), captioned gently ("from your
camera roll"). Photos never leave the device. The Customize toggle requests permission and explains
the privacy stance; denial flips the toggle back with a friendly note.

## Testing
- Unit (Vitest): `lib/feedPrefs.ts` (defaults, toggles), `lib/feed.ts` `generateFeed(prefs)` —
  disabled types absent; only enabled themes' images appear; never-empty fallback; ids stable/unique;
  default prefs == legacy output shape. Keep existing feed tests green (prefs optional).
- Manual (web preview): Classic unchanged; Customize toggles change the live feed; Immersive mode
  pages full-screen with imagery + captions; camera-roll toggle shows the on-device-only messaging.
  Camera-roll injection verified on the iOS simulator if feasible.

## MVP Boundary (Done)
- Customize entry on the feed → sheet with Layout / What you see / Photo vibes / Your photos.
- Prefs persist; feed honors them live; Classic default == today's feed.
- Immersive full-screen paged mode works with Ken-Burns imagery + captions.
- Camera-roll opt-in path implemented (native), privacy-respecting, web-guarded.
- Web-safe, typecheck + tests + export green.

## Non-Goals
- No real video, no external content APIs, no uploading anything anywhere, no per-photo "nice" ML
  scoring (just recent photos). No gating behind nada+ yet.
