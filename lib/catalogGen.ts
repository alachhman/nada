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
// Curated photo IDs — the 23 product-shot images from lib/catalog.ts.
// Each ID depicts a specific object; only these IDs are used for product
// imagery (no art / social / nature / lifestyle pool photos).
// Note: photo-1593618998160-e34014e67546 (labelled "cast-skillet") actually
// depicts a knife set — it is mapped as a knives/kitchen-tools image.
// ---------------------------------------------------------------------------

// IMAGE_BY_NOUN maps each generator noun to 1–3 curated IDs of matching or
// adjacent objects.  productAt picks deterministically from the noun's list.
// Heavy reuse across products is accepted and intended.
const IMAGE_BY_NOUN: Record<string, string[]> = {
  // ── Apparel ──────────────────────────────────────────────────────────────
  Overshirt:         ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Hoodie:            ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Tote:              ["photo-1591561954557-26941169b49e", "photo-1553062407-98eeb64c6a62"], // leather-tote, weekender
  Sneakers:          ["photo-1560769629-975ec94e6a86"],                          // retro-runner
  Loafers:           ["photo-1560769629-975ec94e6a86"],                          // sneakers (closest footwear)
  Cardigan:          ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Blazer:            ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Joggers:           ["photo-1483721310020-03333e577078"],                       // running shorts
  Trousers:          ["photo-1483721310020-03333e577078"],                       // running shorts
  Shorts:            ["photo-1483721310020-03333e577078"],                       // running shorts
  Vest:              ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Windbreaker:       ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Bomber:            ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Dress:             ["photo-1556821840-3a63f95609a7"],                          // hoodie (closest garment)
  Jumpsuit:          ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Camisole:          ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Parka:             ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Trench:            ["photo-1556821840-3a63f95609a7"],                          // hoodie
  Beanie:            ["photo-1556821840-3a63f95609a7"],                          // hoodie (closest apparel)
  Cap:               ["photo-1560769629-975ec94e6a86"],                          // sneakers (sporty accessory)

  // ── Home ─────────────────────────────────────────────────────────────────
  "Floor Lamp":      ["photo-1507473885765-e6ed057f782c"],                       // arc lamp
  Shelf:             ["photo-1507473885765-e6ed057f782c"],                       // arc lamp (closest furniture)
  Vase:              ["photo-1514228742587-6b1558fcca3d"],                       // stoneware mug (ceramic vessel)
  Throw:             ["photo-1580301762395-83604792a36c"],                       // chunky knit throw
  Candle:            ["photo-1602874801006-e26c4c5b5b8a"],                       // scented candle
  Mirror:            ["photo-1507473885765-e6ed057f782c"],                       // arc lamp (reflective home piece)
  Rug:               ["photo-1580301762395-83604792a36c"],                       // throw blanket (textile, floor)
  Planter:           ["photo-1614594975525-e45190c55d0b"],                       // monstera
  Clock:             ["photo-1507473885765-e6ed057f782c"],                       // arc lamp (home decor)
  Frame:             ["photo-1614594975525-e45190c55d0b"],                       // monstera (decorative home object)
  Tray:              ["photo-1514228742587-6b1558fcca3d"],                       // stoneware mug (ceramic/surface)
  Basket:            ["photo-1580301762395-83604792a36c"],                       // throw blanket (woven textile)
  Stool:             ["photo-1507473885765-e6ed057f782c"],                       // arc lamp (furniture)
  Ottoman:           ["photo-1580301762395-83604792a36c"],                       // throw blanket (upholstered)
  Cushion:           ["photo-1580301762395-83604792a36c"],                       // throw blanket
  Diffuser:          ["photo-1602874801006-e26c4c5b5b8a"],                       // candle (scent device)
  Bookend:           ["photo-1507473885765-e6ed057f782c"],                       // arc lamp (desk object)
  "Side Table":      ["photo-1507473885765-e6ed057f782c"],                       // arc lamp (furniture)
  "Wall Hook":       ["photo-1507473885765-e6ed057f782c"],                       // arc lamp (closest home hardware)
  "Storage Box":     ["photo-1580301762395-83604792a36c"],                       // throw blanket (closest home storage)

  // ── Tech ─────────────────────────────────────────────────────────────────
  Earbuds:           ["photo-1606220588913-b3aacb4d2f46"],                       // noise-buds
  Keyboard:          ["photo-1587829741301-dc798b83add3"],                       // mech-keyboard
  Trackpad:          ["photo-1587829741301-dc798b83add3"],                       // keyboard (closest input device)
  Webcam:            ["photo-1496181133206-80ce9b88a853"],                       // instant camera
  "Monitor Light":   ["photo-1527443224154-c4a3942d3acf"],                       // desk mat (desk accessory)
  "USB Hub":         ["photo-1587829741301-dc798b83add3"],                       // keyboard (desk peripheral)
  "Cable Organizer": ["photo-1527443224154-c4a3942d3acf"],                       // desk mat (desk organization)
  "Desk Mat":        ["photo-1527443224154-c4a3942d3acf"],                       // desk mat
  Stand:             ["photo-1527443224154-c4a3942d3acf"],                       // desk mat (desk accessory)
  "Power Bank":      ["photo-1606220588913-b3aacb4d2f46"],                       // earbuds (portable tech)
  Stylus:            ["photo-1587829741301-dc798b83add3"],                       // keyboard (input device)
  Headphones:        ["photo-1606220588913-b3aacb4d2f46"],                       // earbuds
  Speaker:           ["photo-1606220588913-b3aacb4d2f46"],                       // earbuds (audio device)
  Adapter:           ["photo-1587829741301-dc798b83add3"],                       // keyboard (peripheral)
  "Charging Dock":   ["photo-1523275335684-37898b6baf30"],                       // smartwatch (charging)
  Camera:            ["photo-1496181133206-80ce9b88a853"],                       // instant camera
  Mouse:             ["photo-1587829741301-dc798b83add3"],                       // keyboard (input device)
  "Wrist Rest":      ["photo-1527443224154-c4a3942d3acf"],                       // desk mat
  "Laptop Sleeve":   ["photo-1527443224154-c4a3942d3acf"],                       // desk mat (protective sleeve)
  Smartwatch:        ["photo-1523275335684-37898b6baf30"],                       // smart-watch

  // ── Kitchen ──────────────────────────────────────────────────────────────
  Skillet:           ["photo-1604908176997-125f25cc6f3d"],                       // cast-iron pan
  "Dutch Oven":      ["photo-1604908176997-125f25cc6f3d"],                       // cast-iron pan (cookware)
  "Cutting Board":   ["photo-1566454825481-9c31a3f8d8b2"],                       // chef knife
  Knife:             ["photo-1566454825481-9c31a3f8d8b2", "photo-1593618998160-e34014e67546"], // chef-knife, knife-set
  Colander:          ["photo-1570222094114-d054a817e56b"],                       // blender (kitchen appliance)
  "Mixing Bowl":     ["photo-1570222094114-d054a817e56b"],                       // blender (kitchen vessel)
  Grater:            ["photo-1566454825481-9c31a3f8d8b2"],                       // chef knife (kitchen blade tool)
  "Pour-Over":       ["photo-1495474472287-4d71bcdd2085"],                       // pour-over coffee
  "French Press":    ["photo-1495474472287-4d71bcdd2085"],                       // pour-over coffee (coffee brewer)
  Mortar:            ["photo-1570222094114-d054a817e56b"],                       // blender (grinding/prep)
  Saucepan:          ["photo-1604908176997-125f25cc6f3d"],                       // cast-iron pan (cookware)
  Wok:               ["photo-1604908176997-125f25cc6f3d"],                       // cast-iron pan (cookware)
  "Baking Sheet":    ["photo-1604908176997-125f25cc6f3d"],                       // cast-iron pan (cookware)
  Spatula:           ["photo-1566454825481-9c31a3f8d8b2"],                       // chef knife (kitchen tool)
  Whisk:             ["photo-1566454825481-9c31a3f8d8b2"],                       // chef knife (kitchen tool)
  Carafe:            ["photo-1495474472287-4d71bcdd2085"],                       // pour-over (vessel for liquid)
  "Spice Rack":      ["photo-1570222094114-d054a817e56b"],                       // blender (kitchen storage)
  "Salad Bowl":      ["photo-1570222094114-d054a817e56b"],                       // blender (kitchen vessel)
  Strainer:          ["photo-1566454825481-9c31a3f8d8b2"],                       // chef knife (kitchen tool)
  Kettle:            ["photo-1495474472287-4d71bcdd2085"],                       // pour-over (hot water device)

  // ── Fitness ──────────────────────────────────────────────────────────────
  "Foam Roller":     ["photo-1571019613454-1cb2f99b2d8b"],                       // foam roller
  "Resistance Band": ["photo-1592432678016-e910b452f9a2"],                       // yoga mat (stretching)
  "Yoga Block":      ["photo-1592432678016-e910b452f9a2"],                       // yoga mat
  "Pull-Up Bar":     ["photo-1517836357463-d25dfeac3438"],                       // dumbbells (strength equipment)
  "Jump Rope":       ["photo-1483721310020-03333e577078"],                       // running shorts (cardio)
  Kettlebell:        ["photo-1517836357463-d25dfeac3438"],                       // dumbbells (weight)
  Dumbbells:         ["photo-1517836357463-d25dfeac3438"],                       // dumbbell-set
  Mat:               ["photo-1592432678016-e910b452f9a2"],                       // yoga mat
  Gliders:           ["photo-1592432678016-e910b452f9a2"],                       // yoga mat (floor exercise)
  "Massage Ball":    ["photo-1571019613454-1cb2f99b2d8b"],                       // foam roller (recovery)
  "Ankle Weights":   ["photo-1517836357463-d25dfeac3438"],                       // dumbbells (weights)
  "Ab Wheel":        ["photo-1571019613454-1cb2f99b2d8b"],                       // foam roller (core)
  "Stability Ball":  ["photo-1592432678016-e910b452f9a2"],                       // yoga mat (balance)
  "Grip Strengthener": ["photo-1517836357463-d25dfeac3438"],                     // dumbbells (hand strength)
  // Shorts is also an Apparel noun but appears in Fitness bank:
  // "Shorts" key already set above under Apparel — Fitness "Shorts" => running-shorts
  "Sports Bra":      ["photo-1483721310020-03333e577078"],                       // running shorts
  "Tank Top":        ["photo-1483721310020-03333e577078"],                       // running shorts
  "Compression Sleeve": ["photo-1483721310020-03333e577078"],                   // running shorts
  "Water Bottle":    ["photo-1592432678016-e910b452f9a2"],                       // yoga mat (fitness accessory)
  "Gym Bag":         ["photo-1591561954557-26941169b49e"],                       // leather-tote (bag)
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

  // Always use all three parts: the (adj, mat, noun) triple is what guarantees
  // name uniqueness within a category cycle, and adjective/material vocabularies
  // are disjoint, so the two word orders below can never collide with each other.
  // (Do NOT add a two-word adj+noun form — dropping the material makes indices
  // 66 apart collide: same adj, same noun, different mat.)
  const variant = catIndex % 4;
  if (variant === 1) {
    return `${mat} ${adj} ${noun}`;
  } else {
    return `${adj} ${mat} ${noun}`;
  }
}

/** Returns just the noun for a given catIndex + category (mirrors productName logic). */
function productNoun(catIndex: number, cat: string): string {
  const { nouns, adjectives, materials } = PARTS[cat];
  const nA = adjectives.length;
  const nM = materials.length;
  const nounIdx = Math.floor(catIndex / (nA * nM)) % nouns.length;
  return nouns[nounIdx];
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
// Noun-aware weight overrides — each band MUST lie within the category band.
// Fallback when noun is absent: category band.
// ---------------------------------------------------------------------------

export const WEIGHT_BY_NOUN: Record<string, [number, number]> = {
  // Apparel
  Overshirt:         [0.4, 1.0],
  Hoodie:            [0.8, 1.8],
  Tote:              [0.5, 2.5],
  Sneakers:          [1.2, 3.0],
  Loafers:           [0.8, 2.0],
  Cardigan:          [0.4, 1.2],
  Blazer:            [0.8, 2.0],
  Joggers:           [0.3, 0.9],
  Trousers:          [0.4, 1.2],
  Shorts:            [0.2, 0.6],
  Vest:              [0.3, 0.8],
  Windbreaker:       [0.4, 1.0],
  Bomber:            [0.8, 2.0],
  Dress:             [0.3, 1.2],
  Jumpsuit:          [0.5, 1.5],
  Camisole:          [0.2, 0.5],
  Parka:             [1.5, 4.0],
  Trench:            [1.2, 3.5],
  Beanie:            [0.2, 0.4],
  Cap:               [0.2, 0.4],
  // Home
  "Floor Lamp":      [3.0, 12.0],
  Shelf:             [3.0, 14.0],
  Vase:              [0.5, 4.0],
  Throw:             [1.5, 5.0],
  Candle:            [0.5, 2.0],
  Mirror:            [2.0, 12.0],
  Rug:               [3.0, 18.0],
  Planter:           [1.0, 8.0],
  Clock:             [1.0, 6.0],
  Frame:             [0.5, 3.0],
  Tray:              [0.5, 3.0],
  Basket:            [0.5, 4.0],
  Stool:             [4.0, 14.0],
  Ottoman:           [5.0, 18.0],
  Cushion:           [0.5, 2.5],
  Diffuser:          [0.5, 2.0],
  Bookend:           [0.5, 4.0],
  "Side Table":      [4.0, 16.0],
  "Wall Hook":       [0.5, 2.0],
  "Storage Box":     [0.5, 5.0],
  // Tech
  Earbuds:           [0.1, 0.4],
  Keyboard:          [1.0, 3.0],
  Trackpad:          [0.3, 1.0],
  Webcam:            [0.3, 1.2],
  "Monitor Light":   [0.3, 1.0],
  "USB Hub":         [0.2, 0.8],
  "Cable Organizer": [0.1, 0.5],
  "Desk Mat":        [0.5, 2.0],
  Stand:             [0.5, 3.0],
  "Power Bank":      [0.3, 1.5],
  Stylus:            [0.1, 0.3],
  Headphones:        [0.3, 1.0],
  Speaker:           [0.5, 4.0],
  Adapter:           [0.1, 0.4],
  "Charging Dock":   [0.3, 1.5],
  Camera:            [0.5, 2.5],
  Mouse:             [0.2, 0.8],
  "Wrist Rest":      [0.3, 1.0],
  "Laptop Sleeve":   [0.3, 1.2],
  Smartwatch:        [0.1, 0.5],
  // Kitchen
  Skillet:           [4.0, 8.0],
  "Dutch Oven":      [7.0, 15.0],
  "Cutting Board":   [1.0, 5.0],
  Knife:             [0.5, 1.5],
  Colander:          [0.5, 2.0],
  "Mixing Bowl":     [0.5, 3.0],
  Grater:            [0.5, 1.5],
  "Pour-Over":       [0.5, 2.0],
  "French Press":    [1.0, 3.0],
  Mortar:            [2.0, 6.0],
  Saucepan:          [2.0, 6.0],
  Wok:               [3.0, 8.0],
  "Baking Sheet":    [1.0, 4.0],
  Spatula:           [0.5, 1.0],
  Whisk:             [0.5, 1.0],
  Carafe:            [1.0, 3.0],
  "Spice Rack":      [1.0, 5.0],
  "Salad Bowl":      [1.0, 4.0],
  Strainer:          [0.5, 2.0],
  Kettle:            [2.0, 5.0],
  // Fitness
  "Foam Roller":     [1.0, 3.0],
  "Resistance Band": [0.5, 1.5],
  "Yoga Block":      [0.5, 1.5],
  "Pull-Up Bar":     [3.0, 8.0],
  "Jump Rope":       [0.5, 1.5],
  Kettlebell:        [8.0, 50.0],
  Dumbbells:         [15.0, 50.0],
  Mat:               [2.0, 6.0],
  Gliders:           [0.5, 1.5],
  "Massage Ball":    [0.5, 2.0],
  "Ankle Weights":   [2.0, 10.0],
  "Ab Wheel":        [1.0, 3.0],
  "Stability Ball":  [2.0, 5.0],
  "Grip Strengthener": [0.5, 2.0],
  "Sports Bra":      [0.2, 0.5],
  "Tank Top":        [0.2, 0.5],
  "Compression Sleeve": [0.5, 1.5],
  "Water Bottle":    [0.5, 2.5],
  "Gym Bag":         [1.5, 4.0],
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
// Curated ID set — exported so tests can assert image containment.
// ---------------------------------------------------------------------------

export const CURATED_IDS: ReadonlySet<string> = new Set([
  "photo-1560769629-975ec94e6a86", // sneakers
  "photo-1556821840-3a63f95609a7", // hoodie
  "photo-1507473885765-e6ed057f782c", // arc lamp
  "photo-1514228742587-6b1558fcca3d", // stoneware mug
  "photo-1606220588913-b3aacb4d2f46", // earbuds
  "photo-1587829741301-dc798b83add3", // keyboard
  "photo-1593618998160-e34014e67546", // knife set (kitchen tools)
  "photo-1604908176997-125f25cc6f3d", // cast-iron pan, overhead (cast-skillet)
  "photo-1495474472287-4d71bcdd2085", // pour-over coffee
  "photo-1592432678016-e910b452f9a2", // yoga mat
  "photo-1517836357463-d25dfeac3438", // dumbbells
  "photo-1591561954557-26941169b49e", // leather tote
  "photo-1511499767150-a48a237f0083", // sunglasses
  "photo-1614594975525-e45190c55d0b", // monstera
  "photo-1580301762395-83604792a36c", // chunky knit throw
  "photo-1523275335684-37898b6baf30", // smartwatch
  "photo-1496181133206-80ce9b88a853", // instant camera
  "photo-1566454825481-9c31a3f8d8b2", // chef knife
  "photo-1570222094114-d054a817e56b", // blender
  "photo-1483721310020-03333e577078", // running shorts
  "photo-1571019613454-1cb2f99b2d8b", // foam roller
  "photo-1527443224154-c4a3942d3acf", // desk mat
  "photo-1602874801006-e26c4c5b5b8a", // scented candle
  "photo-1553062407-98eeb64c6a62", // weekender bag
]);

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

  // Noun — used for noun-aware image and weight
  const noun = productNoun(catIndex, cat);

  // Weight — noun-aware override band when available, else category band.
  // Every override band lies within the category band (test-verified).
  const [wLo, wHi] = WEIGHT_BY_NOUN[noun] ?? WEIGHT_BANDS[cat];
  const wRaw = wLo + h(index, 2) * (wHi - wLo);
  const weightLb = Math.round(wRaw * 10) / 10;

  // Rating
  const rating = RATING_OPTIONS[hi(index, 3, 0, RATING_OPTIONS.length - 1)];

  // ReviewCount — 30–9000, skewed low: use h^2.2 curve
  const hVal = h(index, 4);
  const reviewCount = Math.floor(30 + Math.pow(hVal, 2.2) * 8970);

  // Dodge line
  const dodge = dodgeLine(index, cat);

  // Image — noun-aware: pick from the noun's curated photo list.
  // Falls back to the first image in the category's noun list for safety
  // (all nouns are mapped, so this branch should never be reached).
  const nounImages = IMAGE_BY_NOUN[noun] ?? IMAGE_BY_NOUN[PARTS[cat].nouns[0]];
  const imageId = nounImages[Math.floor(h(index, 5) * nounImages.length)];
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
