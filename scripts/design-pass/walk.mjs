// Design-pass harness: walks the full nada ritual loop on the Expo web preview,
// recording video + per-state screenshots + a timestamped manifest so frame
// windows can be sliced with ffmpeg afterwards.
//
// Usage: node scripts/design-pass/walk.mjs [outDir]
// Requires: the web preview running on :8081 (npm run web), playwright devDep.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:8081";
const OUT = process.argv[2] ?? "/tmp/design-pass/run1";
mkdirSync(OUT, { recursive: true });

const manifest = [];
const t0 = Date.now();
const mark = (label) => {
  const t = (Date.now() - t0) / 1000;
  manifest.push({ label, t: Math.round(t * 100) / 100 });
  console.log(`[${t.toFixed(1)}s] ${label}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
});
const page = await ctx.newPage();
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });

// Generous helper: click a pressable by accessible name or visible text.
async function tap(nameRe, { optional = false } = {}) {
  const byRole = page.getByRole("button", { name: nameRe }).first();
  try {
    await byRole.click({ timeout: 4000 });
    return true;
  } catch {}
  try {
    await page.getByText(nameRe).first().click({ timeout: 3000 });
    return true;
  } catch (e) {
    if (optional) return false;
    throw new Error(`tap failed: ${nameRe}`);
  }
}

// ---- 1. Shop home: entrances + rails + endless aisle preview -------------
mark("shop-home:load");
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500); // Reveal entrances
mark("shop-home:settled");
await shot("01-shop-home");
await page.mouse.wheel(0, 900);
await page.waitForTimeout(800);
await page.mouse.wheel(0, 1200);
await page.waitForTimeout(800);
mark("shop-home:scrolled-to-aisle");
await shot("02-shop-home-aisle");

// ---- 2. Product detail (curated) ------------------------------------------
mark("product:open");
await page.goto(BASE + "/product/cast-skillet", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
mark("product:settled");
await shot("03-product-detail");
await page.mouse.wheel(0, 700);
await page.waitForTimeout(700);
await shot("04-product-detail-scrolled");

// ---- 3. Add to cart → cart -------------------------------------------------
await page.mouse.wheel(0, -1200);
await page.waitForTimeout(400);
await tap(/add to cart/i);
mark("cart:added");
await page.waitForTimeout(900);
await page.goto(BASE + "/cart", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
mark("cart:settled");
await shot("05-cart");

// ---- 4. THE MONEY SEQUENCE: checkout → theater → celebration ---------------
mark("intercept:checkout-tap");
await tap(/check ?out/i);
// processing theater ~2s, then morph to celebration with count-up + confetti
await page.waitForTimeout(1000);
mark("intercept:theater-mid");
await shot("06-intercept-theater");
await page.waitForTimeout(1400);
mark("intercept:morph-window"); // morph ~2.0-2.6s after tap
await page.waitForTimeout(900);
await shot("07-intercept-celebration");
await page.waitForTimeout(2200); // count-up + confetti settle
mark("intercept:celebration-settled");
await shot("08-intercept-celebration-settled");
await tap(/keep the money|done|close|back to/i, { optional: true });
await page.waitForTimeout(800);
mark("intercept:closed");

// ---- 5. You hub: hero count-up, pills, saves -------------------------------
mark("you:load");
await page.goto(BASE + "/you", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
mark("you:settled");
await shot("09-you-hub");
await page.mouse.wheel(0, 700);
await page.waitForTimeout(700);
await shot("10-you-hub-scrolled");

// ---- 6. Nothing tracker (tap most recent save) ------------------------------
try {
  await page.getByRole("button", { name: /^Track save:/ }).first().click({ timeout: 4000 });
} catch {
  await page.goto(BASE + "/you", { waitUntil: "networkidle" });
}
await page.waitForTimeout(2000);
mark("nothing:settled");
await shot("11-nothing-tracker");

// ---- 7. Doomscroll ritual ----------------------------------------------------
mark("scroll:load");
await page.goto(BASE + "/scroll", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await shot("12-scroll-feed");
await page.mouse.wheel(0, 700);
await page.waitForTimeout(900);
await page.mouse.wheel(0, 700);
await page.waitForTimeout(900);
mark("scroll:scrolled");
await shot("13-scroll-feed-deeper");

// ---- 8. Smoke break ----------------------------------------------------------
mark("break:load");
await page.goto(BASE + "/break", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await shot("14-break-entry");
await tap(/step out/i, { optional: true });
await page.waitForTimeout(2000);
mark("break:breathing-early");
await shot("15a-break-breathing-early");
await page.waitForTimeout(4000); // breathing cycle
mark("break:breathing-late");
await shot("15b-break-breathing-late");

// ---- 9. Food ritual (entry + menu only; courier map needs an order) ----------
mark("food:load");
await page.goto(BASE + "/food", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
mark("food:settled");
await shot("16-food-home");

// ---- 10. Endless aisle + search ----------------------------------------------
mark("aisle:load");
await page.goto(BASE + "/aisle", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await shot("17-aisle");
await page.mouse.wheel(0, 1400);
await page.waitForTimeout(1000);
mark("aisle:paginated");
await shot("18-aisle-paginated");

mark("search:load");
await page.goto(BASE + "/search", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const input = page.locator("input").first();
await input.fill("walnut");
await page.waitForTimeout(1200);
mark("search:results");
await shot("19-search-results");

// ---- 11. Why page --------------------------------------------------------------
await page.goto(BASE + "/why", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
mark("why:settled");
await shot("20-why");

mark("done");
await ctx.close(); // flushes video
const video = await page.video()?.path();
writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ video, manifest }, null, 2));
console.log("video:", video);
console.log("manifest:", join(OUT, "manifest.json"));
await browser.close();
