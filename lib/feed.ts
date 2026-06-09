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
  | { kind: "nada"; id: string };

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

const CALM_POOL = [
  { image: img("photo-1506905925346-21bda4d32df4"), caption: "mountains doing mountain things." },
  { image: img("photo-1501854140801-50d01698950b"), caption: "somewhere quiet. still there." },
  { image: img("photo-1476514525535-07fb3b4ae5f1"), caption: "fog is just low clouds having a slow day." },
  { image: img("photo-1518173946687-a4c8892bbd9f"), caption: "just a field, being a field." },
  { image: img("photo-1470770841072-f978cf4d019e"), caption: "still water holds the whole sky." },
  { image: img("photo-1426604966848-d7adac402bff"), caption: "trees: quiet, tall, unbothered." },
  { image: img("photo-1465146344425-f00d5f5c8f07"), caption: "wildflowers do their best every year." },
  { image: img("photo-1500534314209-a25ddb2bd429"), caption: "the light is always doing something nice." },
  { image: img("photo-1523712999610-f77fbcfc3843"), caption: "forests have been at this longer than us." },
  { image: img("photo-1414609245224-aea2814fe2ad"), caption: "petals, unbothered." },
  { image: img("photo-1510784722466-f2aa240c4b28"), caption: "morning comes back every time." },
  { image: img("photo-1507003211169-0a1dd7228f2d"), caption: "reflections on a calm surface." },
  { image: img("photo-1469474968028-56623f02e42e"), caption: "open sky. open schedule." },
];

// The kind cycle order (nada is inserted separately every 8 items)
const KIND_ORDER = [
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

type PoolKind = (typeof KIND_ORDER)[number];

const L = KIND_ORDER.length;

/**
 * Compute how many times kind K has appeared before global index g
 * (i.e. its "occurrence index"), so that each kind draws distinct pool items.
 */
function occurrenceIndex(kind: PoolKind, g: number): number {
  const fullCycles = Math.floor(g / L);
  const rem = g % L;
  const perCycle = KIND_ORDER.filter((k) => k === kind).length;
  const remCount = KIND_ORDER.slice(0, rem).filter((k) => k === kind).length;
  return fullCycles * perCycle + remCount;
}

function getPoolItem(kind: PoolKind, occurrence: number): Omit<FeedItem, "kind" | "id"> {
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
      const p = CALM_POOL[occurrence % CALM_POOL.length];
      return { image: p.image, caption: p.caption };
    }
  }
}

/**
 * Generate exactly `count` feed items starting at `startIndex`.
 * - IDs are stable: `item-${startIndex + i}` so consecutive batches never collide.
 * - Every 8th item (globalIndex % 8 === 7) is a `nada` interstitial.
 * - Otherwise, kind cycles through KIND_ORDER; pool items are chosen by
 *   per-kind occurrence count so the same kind never repeats content within
 *   a cycle (e.g. two "social" slots in one cycle get different posts).
 */
export function generateFeed(startIndex: number, count: number): FeedItem[] {
  const items: FeedItem[] = [];

  for (let i = 0; i < count; i++) {
    const g = startIndex + i;
    const id = `item-${g}`;

    if (g % 8 === 7) {
      items.push({ kind: "nada", id });
      continue;
    }

    const kind = KIND_ORDER[g % L];
    const occurrence = occurrenceIndex(kind, g);
    const poolData = getPoolItem(kind, occurrence);

    items.push({ kind, id, ...poolData } as FeedItem);
  }

  return items;
}
