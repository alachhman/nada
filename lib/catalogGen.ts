/**
 * lib/catalogGen.ts
 * Deterministic, pure procedural generator for ~5,000 products.
 * NO Math.random, NO Date — every choice is derived from a mulberry32-style
 * hash over (index, salt).
 *
 * IMPORTANT: this file must NOT import from lib/catalog.ts (circular-import
 * risk). It only needs types from lib/types.ts.
 */

import type { Product } from "@/lib/types";

// ---------------------------------------------------------------------------
// Hash — mulberry32 single-step, returns a value in [0, 1)
// ---------------------------------------------------------------------------

function h32(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Deterministic float in [0, 1) given (index, salt).
 * Different salts give statistically independent streams.
 */
function h(index: number, salt: number): number {
  return h32(index * 1664525 + salt * 22695477 + 1013904223);
}

/** Integer in [lo, hi] inclusive from hash in [0,1). */
function hi(index: number, salt: number, lo: number, hi_: number): number {
  return lo + Math.floor(h(index, salt) * (hi_ - lo + 1));
}

/** Pick an item from an array. */
function pick<T>(arr: T[], index: number, salt: number): T {
  return arr[Math.floor(h(index, salt) * arr.length)];
}

// ---------------------------------------------------------------------------
// img helper (mirrors catalog.ts — duplicated to avoid circular import)
// ---------------------------------------------------------------------------

function img(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;
}

// ---------------------------------------------------------------------------
// Image pools — ONLY IDs that exist in lib/catalog.ts or lib/feed.ts
// Per category: 12–18 IDs, mapped sensibly.
// ---------------------------------------------------------------------------

const IMAGE_POOLS: Record<string, string[]> = {
  Apparel: [
    // catalog.ts curated
    "photo-1560769629-975ec94e6a86", // sneakers
    "photo-1556821840-3a63f95609a7", // hoodie
    "photo-1591561954557-26941169b49e", // leather tote
    "photo-1511499767150-a48a237f0083", // sunglasses
    "photo-1553062407-98eeb64c6a62", // weekender bag
    // feed.ts art pool — clean textures, fabric-like
    "photo-1541367777708-7905fe3296c0",
    "photo-1547826039-bfc35e0f1ea8",
    "photo-1578662996442-48f60103fc96",
    "photo-1561214115-f2f134cc4912",
    "photo-1549490349-8643362247b5",
    "photo-1523405045-d639bc206f87",
    "photo-1578926288207-a90a103f9f5e",
    // feed.ts social images (lifestyle / wearable context)
    "photo-1513519245088-0e12902e35ca",
    "photo-1558618666-fcd25c85cd64",
  ],
  Home: [
    // catalog.ts curated
    "photo-1507473885765-e6ed057f782c", // arc lamp
    "photo-1514228742587-6b1558fcca3d", // stoneware mug
    "photo-1614594975525-e45190c55d0b", // monstera
    "photo-1580301762395-83604792a36c", // chunky knit throw
    "photo-1602874801006-e26c4c5b5b8a", // candle
    // feed.ts cozy pool — home scenes
    "photo-1507003211169-0a1dd7228f2d",
    "photo-1544148103-0773bf10d330",
    "photo-1489710437720-ebb67ec84dd2",
    "photo-1512389142860-9c449e58a543",
    "photo-1481391243133-f96216dcb5d2",
    "photo-1558618047-3c8c76ca7d13",
    "photo-1616046229478-9901c5536a45",
    "photo-1600585154340-be6161a56a0c",
  ],
  Tech: [
    // catalog.ts curated
    "photo-1606220588913-b3aacb4d2f46", // earbuds
    "photo-1587829741301-dc798b83add3", // keyboard
    "photo-1523275335684-37898b6baf30", // smartwatch
    "photo-1496181133206-80ce9b88a853", // instant camera
    "photo-1527443224154-c4a3942d3acf", // desk mat
    // feed.ts skies pool — clean, minimal, good for tech backgrounds
    "photo-1470770841072-f978cf4d019e",
    "photo-1500534314209-a25ddb2bd429",
    "photo-1510784722466-f2aa240c4b28",
    "photo-1469474968028-56623f02e42e",
    "photo-1504608524841-42584120d693",
    "photo-1534088568595-a066f410bcda",
    "photo-1502082553048-f009c37129b9",
    "photo-1444927714506-8492d94b5ba0",
  ],
  Kitchen: [
    // catalog.ts curated
    "photo-1593618998160-e34014e67546", // cast iron skillet
    "photo-1495474472287-4d71bcdd2085", // pour-over coffee
    "photo-1566454825481-9c31a3f8d8b2", // chef knife
    "photo-1570222094114-d054a817e56b", // blender
    // feed.ts food pool — directly relevant
    "photo-1490645935967-10de6ba17061",
    "photo-1504674900247-0877df9cc836",
    "photo-1498837167922-ddd27525d352",
    "photo-1467003909585-2f8a72700288", // coffee
    "photo-1476224203421-9ac39bcb3b28",
    "photo-1512621776951-a57141f2eefd",
    "photo-1482049016688-2d3e1b311543",
    "photo-1540189549336-e6e99c3679fe",
  ],
  Fitness: [
    // catalog.ts curated
    "photo-1592432678016-e910b452f9a2", // yoga mat
    "photo-1517836357463-d25dfeac3438", // dumbbells
    "photo-1483721310020-03333e577078", // running shorts
    "photo-1571019613454-1cb2f99b2d8b", // foam roller
    // feed.ts nature pool — outdoors, movement context
    "photo-1506905925346-21bda4d32df4",
    "photo-1501854140801-50d01698950b",
    "photo-1476514525535-07fb3b4ae5f1",
    "photo-1518173946687-a4c8892bbd9f",
    "photo-1426604966848-d7adac402bff",
    "photo-1465146344425-f00d5f5c8f07",
    "photo-1523712999610-f77fbcfc3843",
    "photo-1414609245224-aea2814fe2ad",
    // feed.ts social outdoor images
    "photo-1441974231531-c6227db76b6e",
    "photo-1416879595882-3373a0480b5b",
  ],
};

// ---------------------------------------------------------------------------
// Part banks — bounded creative writing. Voice: clean, modern store.
// Per category: ~20 nouns, ~22 adjectives, ~10 materials/styles.
// 20×22×10 = 4,400 combinations per category (>1,000 global unique names
// guaranteed by the index/5 -> catIndex approach).
// ---------------------------------------------------------------------------

interface PartBank {
  nouns: string[];
  adjectives: string[];
  materials: string[];
}

const PARTS: Record<string, PartBank> = {
  Apparel: {
    nouns: [
      "Overshirt", "Hoodie", "Tote", "Sneakers", "Loafers", "Cardigan",
      "Blazer", "Joggers", "Trousers", "Shorts", "Vest", "Windbreaker",
      "Bomber", "Dress", "Jumpsuit", "Camisole", "Parka", "Trench", "Beanie", "Cap",
    ],
    adjectives: [
      "Relaxed", "Slim", "Oversized", "Cropped", "Tailored", "Boxy",
      "Longline", "Heavyweight", "Lightweight", "Classic", "Modern",
      "Vintage", "Minimalist", "Essential", "Everyday", "Structured",
      "Draped", "Refined", "Casual", "Utility", "Airy", "Layering",
    ],
    materials: [
      "Linen", "Cotton", "Wool", "Cashmere", "Leather", "Denim",
      "Fleece", "Nylon", "Suede", "Canvas",
    ],
  },
  Home: {
    nouns: [
      "Floor Lamp", "Shelf", "Vase", "Throw", "Candle", "Mirror",
      "Rug", "Planter", "Clock", "Frame", "Tray", "Basket",
      "Stool", "Ottoman", "Cushion", "Diffuser", "Bookend", "Side Table",
      "Wall Hook", "Storage Box",
    ],
    adjectives: [
      "Sculptural", "Minimal", "Warm", "Textured", "Matte", "Sleek",
      "Woven", "Organic", "Geometric", "Earthy", "Ambient", "Natural",
      "Streamlined", "Serene", "Handcrafted", "Bold", "Understated",
      "Rustic", "Soft", "Airy", "Classic", "Statement",
    ],
    materials: [
      "Walnut", "Oak", "Ceramic", "Linen", "Marble", "Brass",
      "Rattan", "Glass", "Stone", "Cotton",
    ],
  },
  Tech: {
    nouns: [
      "Earbuds", "Keyboard", "Trackpad", "Webcam", "Monitor Light",
      "USB Hub", "Cable Organizer", "Desk Mat", "Stand", "Power Bank",
      "Stylus", "Headphones", "Speaker", "Adapter", "Charging Dock",
      "Camera", "Mouse", "Wrist Rest", "Laptop Sleeve", "Smartwatch",
    ],
    adjectives: [
      "Compact", "Wireless", "Mechanical", "Portable", "Slim",
      "Noise-Cancelling", "Fast-Charging", "Ergonomic", "Backlit",
      "Precision", "Minimalist", "Pro", "Ultra-Thin", "Foldable",
      "Tactile", "Adaptive", "Woven", "Anodized", "Low-Profile", "Quiet",
      "All-Day", "Modular",
    ],
    materials: [
      "Aluminum", "Matte Black", "Arctic White", "Midnight Blue",
      "Rose Gold", "Carbon Fiber", "Space Gray", "Pearl White",
      "Brushed Steel", "Graphite",
    ],
  },
  Kitchen: {
    nouns: [
      "Skillet", "Dutch Oven", "Cutting Board", "Knife", "Colander",
      "Mixing Bowl", "Grater", "Pour-Over", "French Press", "Mortar",
      "Saucepan", "Wok", "Baking Sheet", "Spatula", "Whisk",
      "Carafe", "Spice Rack", "Salad Bowl", "Strainer", "Kettle",
    ],
    adjectives: [
      "Heavy-Duty", "Non-Stick", "Seasoned", "Enameled", "Hand-Forged",
      "Double-Wall", "Precision", "Everyday", "Professional", "Compact",
      "Wide", "Deep", "Slim", "Classic", "Modern", "Artisan",
      "Essential", "Versatile", "Premium", "Stripped-Down",
      "Lightweight", "Heirloom",
    ],
    materials: [
      "Cast Iron", "Ceramic", "Stainless Steel", "Walnut", "Copper",
      "Carbon Steel", "Bamboo", "Enameled Iron", "Silicone", "Glass",
    ],
  },
  Fitness: {
    nouns: [
      "Foam Roller", "Resistance Band", "Yoga Block", "Pull-Up Bar",
      "Jump Rope", "Kettlebell", "Dumbbells", "Mat", "Gliders",
      "Massage Ball", "Ankle Weights", "Ab Wheel", "Stability Ball",
      "Grip Strengthener", "Shorts", "Sports Bra", "Tank Top",
      "Compression Sleeve", "Water Bottle", "Gym Bag",
    ],
    adjectives: [
      "High-Density", "Anti-Slip", "Adjustable", "Compact", "Heavy",
      "Lightweight", "Breathable", "Cushioned", "Moisture-Wicking",
      "Contoured", "Professional", "Everyday", "Portable", "Durable",
      "Supportive", "Minimal", "Full-Body", "Recovery", "Core",
      "Functional", "Versatile", "Low-Impact",
    ],
    materials: [
      "Natural Rubber", "NBR Foam", "Neoprene", "EVA", "Cork",
      "Cast Iron", "Nylon", "Polyester", "Silicone", "Vinyl",
    ],
  },
};

// ---------------------------------------------------------------------------
// Name generation — walk a permuted (adj, material, noun) space per category
// so that the first 200 per-category indices (= 1,000 global) are unique.
// catIndex = Math.floor(index / 5)  (global index of this product within its cat)
// ---------------------------------------------------------------------------

function productName(catIndex: number, cat: string): string {
  const { nouns, adjectives, materials } = PARTS[cat];
  const nN = nouns.length;       // 20
  const nA = adjectives.length;  // 22
  const nM = materials.length;   // 10
  // Total combos per cat = 4400 — more than enough for 1,000 global unique names.
  // We walk the space deterministically by catIndex using mixed-radix indexing:
  //   adj slot   = catIndex % nA
  //   material slot = Math.floor(catIndex / nA) % nM
  //   noun slot  = Math.floor(catIndex / (nA * nM)) % nN
  // This gives unique (adj,mat,noun) triples for catIndex 0..4399.
  const adjIdx  = catIndex % nA;
  const matIdx  = Math.floor(catIndex / nA) % nM;
  const nounIdx = Math.floor(catIndex / (nA * nM)) % nN;
  const adj  = adjectives[adjIdx];
  const mat  = materials[matIdx];
  const noun = nouns[nounIdx];

  // Vary composition order slightly based on catIndex to avoid sounding template-y.
  // Use a small deterministic rotation — every 4th product uses material+noun,
  // every 3rd uses adj+noun, otherwise adj+material+noun.
  // Always use all three parts so the name uniquely identifies the (adj,mat,noun) triple.
  // Vary order to avoid the template-y feel.
  const variant = catIndex % 4;
  if (variant === 1) {
    return `${mat} ${adj} ${noun}`;
  } else {
    return `${adj} ${mat} ${noun}`;
  }
}

// ---------------------------------------------------------------------------
// Price bands (integer, inclusive)
// ---------------------------------------------------------------------------

const PRICE_BANDS: Record<string, [number, number]> = {
  Apparel:  [18, 220],
  Home:     [12, 320],
  Tech:     [15, 450],
  Kitchen:  [9,  260],
  Fitness:  [12, 300],
};

// ---------------------------------------------------------------------------
// Weight bands (lb, 1-decimal)
// ---------------------------------------------------------------------------

const WEIGHT_BANDS: Record<string, [number, number]> = {
  Apparel:  [0.2, 4.0],
  Home:     [0.5, 18.0],
  Tech:     [0.1, 12.0],
  Kitchen:  [0.5, 15.0],
  Fitness:  [0.5, 50.0],
};

// ---------------------------------------------------------------------------
// Dodge-line templates — 6 per category, some with a number slot.
// Numbers are filled from the hash (small plausible integer).
// ---------------------------------------------------------------------------

function dodgeLine(index: number, cat: string): string {
  const slot = hi(index, 81, 2, 52); // a number for the template slot
  const templates: Record<string, string[]> = {
    Apparel: [
      "1 hanger permanently occupied",
      "1 drawer that never quite closes again",
      `${slot} wears before it ends up folded and forgotten`,
      "1 tag you'll mean to cut off for months",
      `${slot} minutes of closet reorganisation ahead`,
      "1 item of clothing that owns a shelf now",
    ],
    Home: [
      `${slot} dust-collecting days per year`,
      "1 floor corner surrendered to ambient lighting",
      "1 surface that now needs styling",
      `${slot} minutes explaining it to guests, forever`,
      "1 living thing that needs water every time you travel",
      "1 cabinet slot dedicated to something seasonal",
    ],
    Tech: [
      `${slot} cable management crises`,
      "1 dongle you'll lose inside a week",
      `${slot} firmware updates you'll approve without reading`,
      "1 charging routine added to your morning",
      `${slot} unread notifications by next Tuesday`,
      "1 box kept 'just in case' for resale",
    ],
    Kitchen: [
      "1 cabinet tetris piece",
      "1 appliance that lives on the counter indefinitely",
      `${slot} uses before it migrates to the back of the shelf`,
      "1 tool with a very specific single purpose",
      `${slot} hand-washes ahead of you`,
      "1 thing too nice to put in the dishwasher",
    ],
    Fitness: [
      `${slot} guilt reps you don't owe anyone`,
      "1 rolled-up reminder propped against the wall",
      `${slot} optimistic calendar blocks you won't keep`,
      "1 thing under the bed by month three",
      `${slot} inches of floor space dedicated to good intentions`,
      "1 piece of equipment your future self was supposed to use",
    ],
  };
  const pool = templates[cat];
  const tplIdx = hi(index, 77, 0, pool.length - 1);
  return pool[tplIdx];
}

// ---------------------------------------------------------------------------
// Review pools — 10 per category: ~3 in never-arrived lore voice, ~7 ambient.
// ---------------------------------------------------------------------------

const AUTHORS = [
  "Jess M.", "Devon", "Sam P.", "Lena", "Tomas", "Priya", "Q", "Marie",
  "Ade", "Nina", "Carl", "Bea", "Ravi", "Jo", "Mira", "Dee", "Lou",
  "Hugo", "Pat", "Kim", "Tess", "Owen", "Ivy", "Gabe",
];

interface RawReview {
  text: string;
  rating: number;
}

const REVIEW_POOLS: Record<string, RawReview[]> = {
  Apparel: [
    // never-arrived lore (~3)
    { text: "Five stars. It never arrived. My wardrobe has never felt better about itself.", rating: 5 },
    { text: "Tracking says 'delivered to a better timeline.' I'll take it.", rating: 5 },
    { text: "The package went somewhere more exciting than my closet. Respect.", rating: 5 },
    // ambient realism (~7)
    { text: "Runs slightly large but the fabric is exceptional.", rating: 4 },
    { text: "Perfect weight for layering. Reached for it every single day.", rating: 5 },
    { text: "Color is exactly as shown — rare. Good construction.", rating: 4 },
    { text: "Washed beautifully three times. Still looks brand new.", rating: 5 },
    { text: "Pockets are real and deep. Groundbreaking in this category.", rating: 5 },
    { text: "Slightly stiff at first but broke in within a week.", rating: 4 },
    { text: "Gifts well. Received a lot of unprompted compliments.", rating: 4 },
  ],
  Home: [
    // never-arrived lore
    { text: "Did not arrive. My apartment somehow looks better. Can't explain it.", rating: 5 },
    { text: "Five stars. Stays exactly where it needs to be — in transit, forever.", rating: 5 },
    { text: "Nothing was carefully packaged and delivered straight to my peace of mind.", rating: 5 },
    // ambient realism
    { text: "Exactly the right scale. Doesn't dominate the space.", rating: 4 },
    { text: "Warm tone, quality materials. Looks twice the price.", rating: 5 },
    { text: "Assembly was simpler than expected. Solid and stable.", rating: 4 },
    { text: "Third piece from this range. All consistent. All good.", rating: 5 },
    { text: "Texture is lovely. Gets better with light on it.", rating: 4 },
    { text: "Smaller in person than the photo suggests, but still works.", rating: 3 },
    { text: "Gifted this to three people. Zero complaints.", rating: 5 },
  ],
  Tech: [
    // never-arrived lore
    { text: "Shipping was instant: nothing arrived immediately. Best $0 I ever didn't spend.", rating: 5 },
    { text: "Tracking said 'out for non-delivery.' My desk has never been cleaner.", rating: 5 },
    { text: "The warehouse carefully packed nothing and sent it express. Arrived before I noticed.", rating: 5 },
    // ambient realism
    { text: "Latency is undetectable. Exactly what I needed for this setup.", rating: 5 },
    { text: "Battery life is genuinely all-day. Charged it every other night.", rating: 4 },
    { text: "Build quality is solid — no flex, no creaks.", rating: 4 },
    { text: "Pairing was instant. Zero driver drama on three operating systems.", rating: 5 },
    { text: "Quieter than expected. Neighbours haven't complained yet.", rating: 4 },
    { text: "Compact enough to travel with. Doesn't feel like a compromise.", rating: 4 },
    { text: "Colour matched the rest of my desk setup perfectly.", rating: 5 },
  ],
  Kitchen: [
    // never-arrived lore
    { text: "Never showed up. My counter is clear. My coffee is imaginary but excellent.", rating: 5 },
    { text: "Dispatched into the void. My cabinet is grateful for the space.", rating: 5 },
    { text: "Five stars for the version of this that lives in my head, cooking things perfectly.", rating: 5 },
    // ambient realism
    { text: "Seasoned out of the box. Immediate results.", rating: 5 },
    { text: "Heavier than expected, which is exactly right for this type.", rating: 4 },
    { text: "Easy to clean. That alone earns five stars.", rating: 5 },
    { text: "Used it twice a week for a year. Zero signs of wear.", rating: 5 },
    { text: "Makes a noticeable difference in heat distribution.", rating: 4 },
    { text: "Size is ideal for two people. Not too big for the dishwasher.", rating: 4 },
    { text: "Pulled it out of storage after two months. Still perfect.", rating: 5 },
  ],
  Fitness: [
    // never-arrived lore
    { text: "It never arrived and I have never been more at peace. My core is imaginary but strong.", rating: 5 },
    { text: "Package lost in transit. My excuses have never felt more valid. Five stars.", rating: 5 },
    { text: "Tracking last updated: 'en route to my better self.' Still waiting. Loving it.", rating: 5 },
    // ambient realism
    { text: "Dense enough to actually do something. Previous one was useless.", rating: 4 },
    { text: "Compact. Doesn't take over the room. Does its job.", rating: 5 },
    { text: "Used it every morning for six weeks. No complaints.", rating: 4 },
    { text: "Good grip, even when hands are sweaty. Important.", rating: 4 },
    { text: "Odourless after one wash. That's the bar and it cleared it.", rating: 5 },
    { text: "Partner started stealing it. Taking that as a good sign.", rating: 5 },
    { text: "Exactly the resistance level the label says. Rare.", rating: 4 },
  ],
};

// ---------------------------------------------------------------------------
// Ratings — {3.5, 4, 4.5, 5}
// ---------------------------------------------------------------------------

const RATING_OPTIONS = [3.5, 4, 4.5, 5] as const;

// ---------------------------------------------------------------------------
// productAt — the main export
// ---------------------------------------------------------------------------

const CATS = ["Apparel", "Home", "Tech", "Kitchen", "Fitness"] as const;
export const TOTAL_GENERATED = 5000;

export function productAt(index: number): Product {
  const cat = CATS[index % 5];
  const catIndex = Math.floor(index / 5); // this product's position within its category

  // Name
  const name = productName(catIndex, cat);

  // Price — integer in band
  const [pLo, pHi] = PRICE_BANDS[cat];
  const price = hi(index, 1, pLo, pHi);

  // Weight — 1 decimal in band
  const [wLo, wHi] = WEIGHT_BANDS[cat];
  const wRaw = wLo + h(index, 2) * (wHi - wLo);
  const weightLb = Math.round(wRaw * 10) / 10;

  // Rating
  const rating = RATING_OPTIONS[hi(index, 3, 0, RATING_OPTIONS.length - 1)];

  // ReviewCount — 30–9000, skewed low: use h^2.2 curve
  const hVal = h(index, 4);
  const reviewCount = Math.floor(30 + Math.pow(hVal, 2.2) * 8970);

  // Dodge line
  const dodge = dodgeLine(index, cat);

  // Image
  const pool = IMAGE_POOLS[cat];
  const imageId = pool[hi(index, 5, 0, pool.length - 1)];
  const image = img(imageId);

  // Reviews — sample 1 or 2
  const reviewPool = REVIEW_POOLS[cat];
  const numReviews = hi(index, 6, 1, 2);
  const reviewStart = hi(index, 7, 0, reviewPool.length - 1);
  const reviews = Array.from({ length: numReviews }, (_, ri) => {
    const rv = reviewPool[(reviewStart + ri) % reviewPool.length];
    const author = AUTHORS[hi(index * 13 + ri, 8, 0, AUTHORS.length - 1)];
    return { author, rating: rv.rating, text: rv.text };
  });

  return {
    id: `gen-${index}`,
    name,
    category: cat,
    price,
    image,
    rating,
    reviewCount,
    reviews,
    weightLb,
    dodgeLine: dodge,
  };
}
