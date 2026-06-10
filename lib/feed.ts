import type { PhotoTheme } from "@/lib/feedPrefs";
import { DEFAULT_FEED_PREFS, type FeedPrefs } from "@/lib/feedPrefs";
import type { CameraPhoto } from "@/lib/cameraRoll";

function img(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;
}

export type FeedItem =
  | {
      kind: "social";
      id: string;
      author: string;
      handle: string;
      avatarColor: string;
      text: string;
      likes: number;
      comments: number;
      image?: string;
    }
  | { kind: "affirmation"; id: string; text: string }
  | { kind: "tinywin"; id: string; text: string }
  | { kind: "news"; id: string; headline: string; source: string }
  | { kind: "calm"; id: string; image: string; caption: string }
  | { kind: "nada"; id: string }
  | { kind: "photo"; id: string; uri: string; caption?: string };

// Avatar colors cycling by index
const AVATAR_COLORS = [
  "#F6C9A8", // peach
  "#CFE0C4", // sage
  "#F4E0A3", // butter
  "#DCD2EC", // lilac
  "#B8D9C8", // mint
  "#F6D4C4", // coral-light
  "#C4D4E8", // sky
  "#E8D4C4", // warm sand
];

const SOCIAL_POOL = [
  {
    author: "Margot Ellis",
    handle: "@margot_grows",
    text: "just watered my plants and they said thanks 🌱",
    likes: 142,
    comments: 18,
    image: img("photo-1416879595882-3373a0480b5b"),
  },
  {
    author: "Theo Nakamura",
    handle: "@theo_bakes",
    text: "made sourdough from scratch for the first time. it rose. I cried.",
    likes: 387,
    comments: 54,
  },
  {
    author: "Priya Sharma",
    handle: "@priya.reads",
    text: "finished a book today. a whole book. feeling like a legend.",
    likes: 211,
    comments: 29,
  },
  {
    author: "Sam Okonkwo",
    handle: "@sam_outside",
    text: "went for a walk without my phone. birds are still out there doing their thing.",
    likes: 504,
    comments: 67,
    image: img("photo-1441974231531-c6227db76b6e"),
  },
  {
    author: "Juno Park",
    handle: "@junopaints",
    text: "painted something small today. no plans, just colours. recommend.",
    likes: 328,
    comments: 41,
    image: img("photo-1513519245088-0e12902e35ca"),
  },
  {
    author: "Lena Kowalski",
    handle: "@lena_slow",
    text: "made tea, sat by the window, did absolutely nothing for 10 minutes. 10/10.",
    likes: 892,
    comments: 103,
  },
  {
    author: "Desmond Adeyemi",
    handle: "@dez_cooks",
    text: "cooked a real meal on a Tuesday. I am thriving.",
    likes: 176,
    comments: 22,
  },
  {
    author: "Hana Moreau",
    handle: "@hana.hikes",
    text: "saw a dog on my morning walk and he was wearing a tiny jacket 🐾",
    likes: 1203,
    comments: 178,
  },
  {
    author: "Ravi Iyer",
    handle: "@ravibuilds",
    text: "fixed the wobbly chair that's been wobbly for two years. huge.",
    likes: 445,
    comments: 58,
  },
  {
    author: "Opal Jensen",
    handle: "@opal_knits",
    text: "started knitting something without a pattern. it is becoming whatever it wants to be.",
    likes: 263,
    comments: 35,
    image: img("photo-1558618666-fcd25c85cd64"),
  },
  {
    author: "Felix Nguyen",
    handle: "@felix_outside",
    text: "the sky was pink this morning and I stopped to look at it. told no one.",
    likes: 712,
    comments: 88,
    image: img("photo-1500534314209-a25ddb2bd429"),
  },
  {
    author: "Alma Torres",
    handle: "@almagrows",
    text: "reorganised my bookshelf by colour. purely chaotic. fully correct.",
    likes: 339,
    comments: 47,
  },
  {
    author: "Wren Caldwell",
    handle: "@wren.makes",
    text: "called my grandmother. she told me a story I'd never heard. time well spent.",
    likes: 1847,
    comments: 214,
  },
  {
    author: "Cyrus Ahadi",
    handle: "@cyrus.letters",
    text: "wrote a letter by hand for the first time in years. my handwriting is hilarious.",
    likes: 521,
    comments: 73,
  },
];

const AFFIRMATION_POOL = [
  { text: "you're allowed to rest." },
  { text: "you've handled every hard day so far." },
  { text: "slow is still movement." },
  { text: "you don't have to earn your breaks." },
  { text: "one thing at a time is enough." },
  { text: "doing less isn't failing." },
  { text: "your attention is worth protecting." },
  { text: "you are not behind." },
  { text: "gentleness toward yourself is a practice." },
  { text: "it's okay if today was just okay." },
  { text: "rest is productive." },
  { text: "small steps still count." },
  { text: "you are more than your output." },
];

const TINYWIN_POOL = [
  { text: "drank water. iconic." },
  { text: "closed 4 tabs. visionary." },
  { text: "replied to that one message. liberation." },
  { text: "made the bed. architect energy." },
  { text: "ate a vegetable. legend." },
  { text: "went outside. groundbreaking." },
  { text: "took a breath. transformative." },
  { text: "texted someone first. bold." },
  { text: "charged your phone before 10%. elite." },
  { text: "opened a window. genius." },
  { text: "put on real pants. inspiring." },
  { text: "remembered to eat lunch. visionary." },
  { text: "did a thing you'd been putting off for days. iconic." },
];

const NEWS_POOL = [
  { headline: "Local man drinks water, feels fine", source: "Slow News" },
  { headline: "Sun rises again, as expected", source: "The Daily Calm" },
  { headline: "Area cat naps through entire afternoon, no regrets", source: "Nothing Times" },
  { headline: "Bread still delicious, bakers confirm", source: "Slow News" },
  { headline: "Birds spotted doing bird things", source: "The Daily Calm" },
  { headline: "Rain came, left, situation resolved", source: "Nothing Times" },
  { headline: "Local woman finishes book, recommends it", source: "Slow News" },
  { headline: "Tuesday arrives on schedule for 47th consecutive week", source: "The Daily Calm" },
  { headline: "Soup enjoyed by those who had it", source: "Nothing Times" },
  { headline: "Park remains in same location as last year", source: "Slow News" },
  { headline: "Tea adequately warm, consumer satisfied", source: "The Daily Calm" },
  { headline: "Dog walks owner, both benefit", source: "Nothing Times" },
  { headline: "Clouds move slowly in pleasant direction", source: "Slow News" },
];

/**
 * Themed photo pools — ~8 entries each. Exported for tests.
 * Nature and skies reuse entries from the former CALM_POOL; the rest are new.
 * All IDs are distinct across pools.
 */
export const PHOTO_POOLS: Record<PhotoTheme, { image: string; caption: string }[]> = {
  nature: [
    { image: img("photo-1506905925346-21bda4d32df4"), caption: "mountains doing mountain things." },
    { image: img("photo-1501854140801-50d01698950b"), caption: "somewhere quiet. still there." },
    { image: img("photo-1476514525535-07fb3b4ae5f1"), caption: "fog is just low clouds having a slow day." },
    { image: img("photo-1518173946687-a4c8892bbd9f"), caption: "just a field, being a field." },
    { image: img("photo-1426604966848-d7adac402bff"), caption: "trees: quiet, tall, unbothered." },
    { image: img("photo-1465146344425-f00d5f5c8f07"), caption: "wildflowers do their best every year." },
    { image: img("photo-1523712999610-f77fbcfc3843"), caption: "forests have been at this longer than us." },
    { image: img("photo-1414609245224-aea2814fe2ad"), caption: "petals, unbothered." },
  ],
  animals: [
    { image: img("photo-1518020382113-a7e8fc38eac9"), caption: "a dog, perfectly content." },
    { image: img("photo-1548247416-ec66f4900b2e"), caption: "cat choosing stillness, as always." },
    { image: img("photo-1474511320723-9a56873867b5"), caption: "fox pausing, just for a moment." },
    { image: img("photo-1425082661705-1834bfd09dca"), caption: "ducks doing their steady thing." },
    { image: img("photo-1437622368342-7a3d73a34c8f"), caption: "turtle: unhurried and correct." },
    { image: img("photo-1456926631375-92c8ce872def"), caption: "deer at the edge of things." },
    { image: img("photo-1535268647677-300dbf3d78d1"), caption: "kittens: the original calm content." },
    { image: img("photo-1462953491269-9aff00919695"), caption: "bird perched, unbothered by the time." },
  ],
  cozy: [
    { image: img("photo-1507003211169-0a1dd7228f2d"), caption: "a warm corner waiting for you." },
    { image: img("photo-1544148103-0773bf10d330"), caption: "candle doing its one simple job." },
    { image: img("photo-1489710437720-ebb67ec84dd2"), caption: "morning light through a soft curtain." },
    { image: img("photo-1512389142860-9c449e58a543"), caption: "blanket weather, indefinitely." },
    { image: img("photo-1481391243133-f96216dcb5d2"), caption: "a book and nowhere to be." },
    { image: img("photo-1558618047-3c8c76ca7d13"), caption: "the smell of something warm in the oven." },
    { image: img("photo-1616046229478-9901c5536a45"), caption: "a shelf of things that matter." },
    { image: img("photo-1600585154340-be6161a56a0c"), caption: "soft light, slow afternoon." },
  ],
  food: [
    { image: img("photo-1490645935967-10de6ba17061"), caption: "breakfast, taken slowly." },
    { image: img("photo-1504674900247-0877df9cc836"), caption: "a meal worth sitting down for." },
    { image: img("photo-1498837167922-ddd27525d352"), caption: "fruit doing its colourful best." },
    { image: img("photo-1467003909585-2f8a72700288"), caption: "coffee before the noise starts." },
    { image: img("photo-1476224203421-9ac39bcb3b28"), caption: "something homemade and unhurried." },
    { image: img("photo-1512621776951-a57141f2eefd"), caption: "vegetables: quietly excellent." },
    { image: img("photo-1482049016688-2d3e1b311543"), caption: "a bowl of something warm." },
    { image: img("photo-1540189549336-e6e99c3679fe"), caption: "colour on a plate." },
  ],
  art: [
    { image: img("photo-1541367777708-7905fe3296c0"), caption: "texture worth resting your eyes on." },
    { image: img("photo-1547826039-bfc35e0f1ea8"), caption: "soft shapes, no agenda." },
    { image: img("photo-1578662996442-48f60103fc96"), caption: "colour doing the work quietly." },
    { image: img("photo-1561214115-f2f134cc4912"), caption: "abstract and at ease." },
    { image: img("photo-1549490349-8643362247b5"), caption: "marks on a surface, meaning something." },
    { image: img("photo-1558618666-fcd25c85cd64"), caption: "pattern for its own sake." },
    { image: img("photo-1523405045-d639bc206f87"), caption: "a gentle arrangement of things." },
    { image: img("photo-1578926288207-a90a103f9f5e"), caption: "made with care. that's enough." },
  ],
  skies: [
    { image: img("photo-1470770841072-f978cf4d019e"), caption: "still water holds the whole sky." },
    { image: img("photo-1500534314209-a25ddb2bd429"), caption: "the light is always doing something nice." },
    { image: img("photo-1510784722466-f2aa240c4b28"), caption: "morning comes back every time." },
    { image: img("photo-1469474968028-56623f02e42e"), caption: "open sky. open schedule." },
    { image: img("photo-1504608524841-42584120d693"), caption: "clouds on their own unhurried path." },
    { image: img("photo-1534088568595-a066f410bcda"), caption: "the last light before dark." },
    { image: img("photo-1502082553048-f009c37129b9"), caption: "a good sky needs no comment." },
    { image: img("photo-1444927714506-8492d94b5ba0"), caption: "stars: still there, still unbothered." },
  ],
};

// Fixed theme order for deterministic pool union construction
const THEME_ORDER: PhotoTheme[] = ["nature", "animals", "cozy", "food", "art", "skies"];

/**
 * Build the flat list of calm images from enabled photo themes.
 * Themes are concatenated in THEME_ORDER; falls back to nature if none enabled.
 */
function buildCalmPool(
  photoThemes: Record<PhotoTheme, boolean>,
): { image: string; caption: string }[] {
  const pool: { image: string; caption: string }[] = [];
  for (const theme of THEME_ORDER) {
    if (photoThemes[theme]) {
      pool.push(...PHOTO_POOLS[theme]);
    }
  }
  return pool.length > 0 ? pool : PHOTO_POOLS.nature;
}

// All valid content kinds (excludes nada which is inserted separately)
const ALL_CONTENT_KINDS = [
  "social",
  "affirmation",
  "calm",
  "tinywin",
  "social",
  "news",
  "affirmation",
  "calm",
  "tinywin",
  "social",
  "news",
] as const;

type ContentKind = (typeof ALL_CONTENT_KINDS)[number];

/**
 * Build the kind cycle from enabled postTypes.
 * Preserves the variety/order pattern of ALL_CONTENT_KINDS,
 * filtering to only enabled types.
 * Falls back to ["calm"] if nothing is enabled.
 */
function buildKindCycle(postTypes: Record<string, boolean>): ContentKind[] {
  const cycle = ALL_CONTENT_KINDS.filter((k) => postTypes[k]);
  if (cycle.length === 0) return ["calm"];
  return cycle;
}

/**
 * Compute how many times `kind` has appeared before position `g`
 * within the given cycle, so each kind draws distinct pool items.
 */
function occurrenceIndexInCycle(kind: ContentKind, g: number, cycle: ContentKind[]): number {
  const L = cycle.length;
  const fullCycles = Math.floor(g / L);
  const rem = g % L;
  const perCycle = cycle.filter((k) => k === kind).length;
  const remCount = cycle.slice(0, rem).filter((k) => k === kind).length;
  return fullCycles * perCycle + remCount;
}

function getPoolItem(
  kind: ContentKind,
  occurrence: number,
  calmPool: { image: string; caption: string }[],
): Omit<FeedItem, "kind" | "id"> {
  switch (kind) {
    case "social": {
      const p = SOCIAL_POOL[occurrence % SOCIAL_POOL.length];
      const avatarColor = AVATAR_COLORS[occurrence % AVATAR_COLORS.length];
      return { ...p, avatarColor };
    }
    case "affirmation": {
      const p = AFFIRMATION_POOL[occurrence % AFFIRMATION_POOL.length];
      return { text: p.text };
    }
    case "tinywin": {
      const p = TINYWIN_POOL[occurrence % TINYWIN_POOL.length];
      return { text: p.text };
    }
    case "news": {
      const p = NEWS_POOL[occurrence % NEWS_POOL.length];
      return { headline: p.headline, source: p.source };
    }
    case "calm": {
      const p = calmPool[occurrence % calmPool.length];
      return { image: p.image, caption: p.caption };
    }
  }
}

/**
 * Inject camera-roll photo items into a feed at regular intervals.
 *
 * Pure, side-effect-free helper — suitable for unit tests.
 *
 * @param items   Base feed items (output of generateFeed or a concatenated list)
 * @param photos  Camera photos to weave in; if empty, returns items unchanged.
 * @param everyN  Insert a photo item approximately every N positions (default 10).
 *                The first injection is at position everyN-1 (0-indexed) so the
 *                feed always starts with real content before any camera photo.
 * @param startN  Starting value for the cam-id counter (default 0). Pass the
 *                total number of cam items already in the list to ensure ids are
 *                globally unique across paginated batches (cam-0, cam-1, …).
 *
 * Injected items have ids `cam-<n>` where n starts at startN and increments,
 * cycling through `photos` if there are more slots than photos.
 */
export function injectPhotos(
  items: FeedItem[],
  photos: CameraPhoto[],
  everyN = 10,
  startN = 0,
): FeedItem[] {
  if (photos.length === 0) return items;
  const out: FeedItem[] = [];
  let injected = startN;
  // We track the "output position" (out.length after each push) to decide when
  // the next injection slot falls. We inject before appending the item at every
  // everyN-th output position (1-indexed: positions everyN, 2*everyN, …).
  for (const item of items) {
    // If the next output index (0-based) is a multiple of everyN AND non-zero,
    // inject a camera photo first.
    if (out.length > 0 && out.length % everyN === 0) {
      const photo = photos[injected % photos.length];
      out.push({
        kind: "photo",
        id: `cam-${injected}`,
        uri: photo.uri,
        caption: "from your camera roll",
      });
      injected++;
    }
    out.push(item);
  }
  return out;
}

/**
 * Generate exactly `count` feed items starting at `startIndex`.
 *
 * @param startIndex  Global start position (for stable IDs across batches)
 * @param count       Number of items to return
 * @param prefs       Optional feed preferences; defaults to DEFAULT_FEED_PREFS
 *                    so existing 2-arg call sites keep working.
 *
 * Behaviour:
 * - IDs are stable: `item-${globalIndex}` — consecutive batches never collide.
 * - Every 8th item (globalIndex % 8 === 7) is a `nada` interstitial (always).
 * - Kind cycle is built from enabled postTypes (preserving variety order).
 * - If ALL postTypes are disabled, falls back to calm-only (feed is never empty).
 * - Calm images are drawn from the union of enabled photoThemes in fixed order.
 * - If ALL photoThemes are disabled, falls back to the nature pool.
 * - `photo` kind is NOT generated here; camera photos are injected at screen level.
 */
export function generateFeed(
  startIndex: number,
  count: number,
  prefs: FeedPrefs = DEFAULT_FEED_PREFS,
): FeedItem[] {
  const cycle = buildKindCycle(prefs.postTypes);
  const calmPool = buildCalmPool(prefs.photoThemes);
  const L = cycle.length;
  const items: FeedItem[] = [];

  // Occurrence counters per kind, incremented as we assign items.
  // We track occurrence by counting how many times each kind has been picked
  // across the virtual full-cycle index space up to startIndex, then increment
  // as we go — matching occurrenceIndexInCycle for the non-nada positions.

  // Pre-compute occurrence offsets at startIndex by simulating the cycle
  // for positions 0..startIndex-1 (skipping nada slots).
  const occurrenceOffset: Partial<Record<ContentKind, number>> = {};
  let cyclePos = 0;
  for (let g = 0; g < startIndex; g++) {
    if (g % 8 === 7) continue; // nada slot — doesn't advance cycle
    const kind = cycle[cyclePos % L];
    occurrenceOffset[kind] = (occurrenceOffset[kind] ?? 0) + 1;
    cyclePos++;
  }

  // Now generate the requested items
  for (let i = 0; i < count; i++) {
    const g = startIndex + i;
    const id = `item-${g}`;

    if (g % 8 === 7) {
      items.push({ kind: "nada", id });
      continue;
    }

    const kind = cycle[cyclePos % L];
    const occurrence = occurrenceOffset[kind] ?? 0;
    occurrenceOffset[kind] = occurrence + 1;
    cyclePos++;

    const poolData = getPoolItem(kind, occurrence, calmPool);
    items.push({ kind, id, ...poolData } as FeedItem);
  }

  return items;
}
