/* Telecharge des visuels pour le catalogue « marche tunisien ».
 * Usage: node scripts/fetch-catalog-images.cjs [cle1 cle2 ...]
 * Les images atterrissent dans .cache/catalog/<cle>/1.jpg, 2.jpg, ...
 */
const fs = require("fs");
const path = require("path");
const { newProducts, existingProducts } = require("./catalog-data.cjs");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const all = [...newProducts, ...existingProducts];
const OUT = path.join(process.cwd(), ".cache", "catalog");
const PER_PRODUCT = 4;
const CONCURRENCY = 3;

function keyOf(item) {
  return item.key || item.match.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function bingImages(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`bing ${res.status}`);
  const html = await res.text();
  const urls = [];
  for (const m of html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)) {
    const u = m[1].replace(/&amp;/g, "&");
    if (/^https?:\/\//i.test(u) && !urls.includes(u)) urls.push(u);
  }
  return urls;
}

async function downloadOne(u, destBase) {
  const r = await fetch(u, {
    headers: { "User-Agent": UA, Accept: "image/*", Referer: "https://www.bing.com/" },
  });
  if (!r.ok) return false;
  const type = (r.headers.get("content-type") || "").toLowerCase();
  if (!type.startsWith("image/")) return false;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 12000) return false;
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  fs.writeFileSync(`${destBase}.${ext}`, buf);
  return true;
}

async function processItem(item) {
  const key = keyOf(item);
  const dir = path.join(OUT, key);
  fs.mkdirSync(dir, { recursive: true });
  if (fs.readdirSync(dir).length >= 2) {
    return `${key} deja fait (${fs.readdirSync(dir).length})`;
  }
  const urls = await bingImages(item.q);
  let n = 0;
  for (const u of urls.slice(0, 24)) {
    if (n >= PER_PRODUCT) break;
    try {
      if (await downloadOne(u, path.join(dir, String(n + 1)))) n++;
    } catch {}
  }
  return `${key} -> ${n} image(s)`;
}

async function main() {
  const only = process.argv.slice(2);
  const items = only.length ? all.filter((i) => only.includes(keyOf(i))) : all;
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const item = items[index++];
      try {
        console.log(await processItem(item));
      } catch (e) {
        console.log(`${keyOf(item)} ERREUR ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log("Termine.");
}

main();
