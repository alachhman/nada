// Harvest per-noun Unsplash photo-ID pools via the site's own frontend API,
// from inside a real browser context (napi rejects bare curl).
// Usage: node scripts/design-pass/harvest-images.mjs /tmp/nada-pools.json
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const OUT = process.argv[2] ?? "/tmp/nada-pools.json";

const QUERIES = {
  // Apparel
  Overshirt: "linen shirt", Hoodie: "hoodie", Tote: "tote bag", Sneakers: "sneakers",
  Loafers: "loafers", Cardigan: "cardigan", Blazer: "blazer", Joggers: "joggers",
  Trousers: "trousers", Shorts: "shorts", Vest: "vest jacket", Windbreaker: "windbreaker jacket",
  Bomber: "bomber jacket", Dress: "dress", Jumpsuit: "jumpsuit", Camisole: "camisole",
  Parka: "parka", Trench: "trench coat", Beanie: "beanie", Cap: "cap hat",
  // Home
  "Floor Lamp": "floor lamp", Shelf: "wall shelf", Vase: "ceramic vase", Throw: "throw blanket",
  Candle: "candle", Mirror: "wall mirror", Rug: "area rug", Planter: "plant pot",
  Clock: "wall clock", Frame: "picture frame", Tray: "serving tray", Basket: "woven basket",
  Stool: "wooden stool", Ottoman: "ottoman furniture", Cushion: "cushion pillow",
  Diffuser: "reed diffuser", Bookend: "bookend", "Side Table": "side table",
  "Wall Hook": "wall hooks", "Storage Box": "storage box",
  // Tech
  Earbuds: "wireless earbuds", Keyboard: "mechanical keyboard", Trackpad: "trackpad",
  Webcam: "webcam", "Monitor Light": "desk light bar", "USB Hub": "usb hub",
  "Cable Organizer": "cable organizer", "Desk Mat": "desk mat", Stand: "laptop stand",
  "Power Bank": "power bank", Stylus: "stylus pen tablet", Headphones: "headphones",
  Speaker: "bluetooth speaker", Adapter: "usb adapter", "Charging Dock": "charging dock",
  Camera: "camera product", Mouse: "computer mouse", "Wrist Rest": "keyboard wrist rest",
  "Laptop Sleeve": "laptop sleeve", Smartwatch: "smartwatch",
  // Kitchen
  Skillet: "cast iron skillet", "Dutch Oven": "dutch oven", "Cutting Board": "cutting board",
  Knife: "chef knife", Colander: "colander", "Mixing Bowl": "mixing bowl",
  Grater: "cheese grater", "Pour-Over": "pour over coffee", "French Press": "french press",
  Mortar: "mortar and pestle", Saucepan: "saucepan", Wok: "wok pan",
  "Baking Sheet": "baking sheet pan", Spatula: "spatula", Whisk: "whisk",
  Carafe: "glass carafe", "Spice Rack": "spice jars", "Salad Bowl": "salad bowl",
  Strainer: "kitchen strainer", Kettle: "kettle",
  // Fitness
  "Foam Roller": "foam roller", "Resistance Band": "resistance band", "Yoga Block": "yoga block",
  "Pull-Up Bar": "pull up bar", "Jump Rope": "jump rope", Kettlebell: "kettlebell",
  Dumbbells: "dumbbells", Mat: "yoga mat", Gliders: "core sliders fitness",
  "Massage Ball": "massage ball", "Ankle Weights": "ankle weights", "Ab Wheel": "ab wheel",
  "Stability Ball": "exercise ball", "Grip Strengthener": "hand grip strengthener",
  "Sports Bra": "sports bra", "Tank Top": "tank top", "Compression Sleeve": "compression sleeve",
  "Water Bottle": "water bottle", "Gym Bag": "gym duffel bag",
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("https://unsplash.com/", { waitUntil: "domcontentloaded" });

const pools = {};
for (const [noun, q] of Object.entries(QUERIES)) {
  try {
    const ids = await page.evaluate(async (query) => {
      const r = await fetch(
        `/napi/search/photos?query=${encodeURIComponent(query)}&per_page=15`,
      );
      const d = await r.json();
      return (d.results ?? [])
        .map((x) => x.urls?.raw?.match(/\/(photo-[a-z0-9-]+)/i)?.[1])
        .filter(Boolean);
    }, q);
    pools[noun] = [...new Set(ids)].slice(0, 12);
    console.log(`${noun}: ${pools[noun].length}`);
  } catch (e) {
    console.log(`${noun}: FAILED ${e.message}`);
    pools[noun] = [];
  }
  await page.waitForTimeout(140);
}

writeFileSync(OUT, JSON.stringify(pools, null, 2));
console.log("wrote", OUT);
await browser.close();
