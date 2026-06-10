# Feed Customization — Implementation Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. nada conventions: StyleSheet +
> `lib/theme.ts` tokens; `components/ui/Reveal` for entrances (NEVER Moti mount hooks); web-guarded
> haptics; AsyncStorage provider (hydrate→persist-gated); Vitest for pure logic; verify via Expo web
> preview. Native-safety: never call a non-worklet fn (usd/format/etc.) inside a Reanimated worklet.

**Goal:** Let users shape the doomscroll feed — Classic vs immersive Reels layout, which post types
appear, which photo themes show, and an opt-in to weave in recent camera-roll photos. All free.

## File structure
```
lib/feedPrefs.ts (+test)                 # FeedPrefs type, DEFAULT_FEED_PREFS, pure toggles
components/providers/FeedPrefsProvider.tsx  # AsyncStorage nada_feedprefs_v1
lib/feed.ts (+test)                       # themed PHOTO_POOLS, generateFeed(start,count,prefs?), `photo` kind
lib/cameraRoll.ts                         # getRecentPhotos(limit) — expo-media-library, web/no-perm safe
app/scroll/customize.tsx                  # the Customize sheet/screen
components/scroll/ImmersiveCard.tsx       # full-screen Reels card
app/scroll/index.tsx                      # read prefs; swap Classic/Immersive; inject camera photos
app/(tabs)/... (none)                     # entry is inside the feed top bar
app.json                                  # NSPhotoLibraryUsageDescription
```

---

## Milestone FC-A — Prefs model + themed feed generation (TDD)
- [ ] `lib/feedPrefs.ts`: `PostType`, `PhotoTheme`, `FeedPrefs { layout, postTypes, photoThemes, cameraRoll }`, `DEFAULT_FEED_PREFS` (layout "classic"; all postTypes true; photoThemes nature+animals+cozy+skies true, food+art false; cameraRoll false). Pure helpers `togglePostType(prefs,t)`, `togglePhotoTheme(prefs,t)`, `setLayout`, `setCameraRoll` returning new prefs.
- [ ] `lib/feedPrefs.test.ts`: defaults; toggles flip and are immutable; (guard) toggling the last enabled postType off is allowed but generateFeed must still produce content (tested in feed).
- [ ] `lib/feed.ts`: add `{ kind:"photo"; id; uri; caption? }` to `FeedItem`. Reorganize calm imagery into `PHOTO_POOLS: Record<PhotoTheme,{image,caption}[]>` (~8 each: nature, animals, cozy, food, art, skies — Unsplash IDs + gentle captions; reuse existing nature/calm ones). Change `generateFeed(startIndex, count, prefs: FeedPrefs = DEFAULT_FEED_PREFS)`:
  - kind cycle built from enabled `postTypes` (preserve variety); always sprinkle `nada` ~every 8; if NO postTypes enabled → fall back to `calm` only (never empty).
  - `calm` image/caption drawn deterministically from the union of enabled `photoThemes` (if none enabled, use nature). Stable unique ids `item-<g>`; deterministic by global index.
  - Keep `photo` OUT of generateFeed (camera photos are injected at the screen level, FC-D).
- [ ] `lib/feed.test.ts`: extend — disabled postType absent from a batch; only enabled-theme images appear; never-empty fallback when all off; default-prefs batch still has ≥3 kinds + a nada; ids unique across batches. Keep existing assertions green.
- [ ] `FeedPrefsProvider` (`nada_feedprefs_v1`): `{ prefs, hydrated, setLayout, togglePostType, togglePhotoTheme, setCameraRoll, reset }` (hydrate→persist-gated). Wire into `app/_layout.tsx`. `useFeedPrefs()` throws outside provider.
- [ ] Gates + commit `feat(feed): prefs model, themed photo pools, prefs-aware generateFeed`.

## Milestone FC-B — Customize sheet + entry
- [ ] Add a **sliders/gear** control to the feed top bar in `app/scroll/index.tsx` → `router.push('/scroll/customize')`. (Keep the existing close button.)
- [ ] `app/scroll/customize.tsx`: cream screen with a back/done. Sections (Reveal entrances, tokens):
  - **Layout** — segmented "Classic / Immersive" bound to `setLayout`.
  - **What you see** — 5 toggle rows (Wholesome posts / Affirmations / Tiny wins / Slow news / Calm photos) bound to `togglePostType`. A muted note "nada reminders always stay."
  - **Photo vibes** — multi-select chips (Nature/Animals/Cozy/Food/Art/Skies) bound to `togglePhotoTheme` (accent when on).
  - **Your photos** — a switch row "Weave in recent photos" bound to `setCameraRoll`, with a privacy line "On your device only. Never uploaded." (the actual permission request is FC-D; for now the toggle just stores the pref). 
- [ ] Live: returning to the feed reflects the new prefs (feed re-seeds from `generateFeed(0,18,prefs)` when prefs change — key the list on a prefs signature so it rebuilds).
- [ ] Gates + commit `feat(feed): customize sheet (layout, content, photo themes, camera opt-in)`.

## Milestone FC-C — Immersive (Reels) layout
- [ ] `components/scroll/ImmersiveCard.tsx`: full-screen (`useWindowDimensions`) card by FeedItem kind:
  - calm/photo: full-bleed `expo-image`; slow **Ken-Burns** drift via Reanimated (scale 1→1.08 over ~12s, reduce-motion → static); bottom gradient scrim (a stacked View, no extra dep) + caption (light text); for `nada`, the calm full-screen with session time.
  - text kinds (affirmation/tinywin/news/social): centered on a soft token gradient bg (or a faded calm image), large legible type. Keep it calm/immersive.
- [ ] In `app/scroll/index.tsx`: when `prefs.layout==="immersive"`, render a vertically **paged** FlatList (`pagingEnabled`, `snapToInterval={height}`, `decelerationRate="fast"`, `showsVerticalScrollIndicator={false}`) of `ImmersiveCard`, sharing the same `items`/`onEndReached`/session-time logic. A subtle "swipe up" hint on first card. Classic path unchanged. Top bar (close + customize) overlays both.
- [ ] Gates + web preview (Classic unchanged; Immersive pages full-screen). Commit `feat(feed): immersive reels-style layout`.

## Milestone FC-D — Camera roll (opt-in, native)
- [ ] `npx expo install expo-media-library` (+ `expo-image-picker` if simpler for recents). Add `app.json` iOS `infoPlist.NSPhotoLibraryUsageDescription` = "nada can weave a few of your recent photos into your calm feed. They stay on your device and are never uploaded." Add the config plugin if required.
- [ ] `lib/cameraRoll.ts`: `getRecentPhotos(limit=8): Promise<{id,uri}[]>` — `if (Platform.OS==='web') return []`; request permission (`MediaLibrary.requestPermissionsAsync`); if denied return `[]`; else fetch most-recent N image assets → `[{id, uri}]`. Never throws.
- [ ] Customize "Your photos" toggle: on enable, call permission request; if denied, flip back + friendly inline note.
- [ ] Feed (`app/scroll/index.tsx`): when `prefs.cameraRoll` and photos available, fetch once on mount and **inject** `photo` items into the stream at intervals (~every 10th position), captioned "from your camera roll". Works in both layouts. Web-guarded (no-op on web).
- [ ] Gates; verify the rest on web; note camera path is native-only (simulator has sample photos). Commit `feat(feed): opt-in camera-roll photos (on-device, web-safe)`.

## FC-E — Verify + finish (controller)
- [ ] Web preview: Customize changes the live feed (content toggles, photo themes), Immersive pages full-screen, camera toggle shows on-device messaging. Simulator spot-check for camera-roll injection if feasible.
- [ ] Review pass; README note (feed is customizable). Merge `feat/feed-customization` → master.

## Notes
- `generateFeed` prefs arg is OPTIONAL (default = today's behavior) so existing call sites/tests don't break.
- Re-seed the feed when prefs change (list `key` = prefs signature) so edits apply immediately.
- Camera photos: on-device only, never uploaded — reinforce in copy (privacy is a brand asset).
- Reduce-motion respected for Ken-Burns; everything web-safe; no worklet/non-worklet violations.
