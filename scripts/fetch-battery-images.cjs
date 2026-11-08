/* Telecharge des candidates d'images produit depuis Bing Images.
 * Usage: node scripts/fetch-battery-images.cjs [cle1 cle2 ...]
 * Sortie: .cache/battery-imgs/<cle>/<n>.<ext>
 */
const fs = require("fs");
const path = require("path");
const { batteries } = require("./batteries-data.cjs");

const OUT = path.join(process.cwd(), ".cache", "battery-imgs");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const PREFERRED = [
  "pieces2mobile.com",
  "impextrom.com",
  "all-spares.com",
  "amso.eu",
  "mobilnetelefony.sk",
  "batterypro.co.kr",
  "gsmprofi",
  "fixez.com",
  "cellspare.com",
  "mobileparts",
  "sparepart",
  "batterie",
];

function queryFor(b) {
  const ref = b.ref.split(" / ")[0];
  switch (b.family) {
    case "apple":
      return `batterie ${b.name.replace("Batterie ", "")} ${ref}`;
    case "samsung":
      return `${b.name.replace("Batterie Samsung ", "")} battery ${ref}`;
    default:
      return `battery ${ref} ${b.name.replace("Batterie Xiaomi ", "")}`;
  }
}

async function bingImages(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" },
  });
  if (!res.ok) throw new Error(`Bing HTTP ${res.status}`);
  const html = await res.text();
  const urls = [];
  for (const m of html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)) {
    const u = m[1]
      .replace(/&amp;/g, "&")
      .replace(/\\u002f/gi, "/")
      .replace(/\\\//g, "/");
    if (/^https?:\/\//i.test(u) && !urls.includes(u)) urls.push(u);
  }
  // Les boutiques de pieces detachees passent en premier.
  const score = (u) => {
    const low = u.toLowerCase();
    let s = 0;
    if (/\.(png|webp)(\?|$)/.test(low)) s += 1;
    for (const d of PREFERRED) if (low.includes(d)) s += 5;
    if (/white|fond|product|batterie|battery/.test(low)) s += 1;
    return s;
  };
  return urls.sort((a, b) => score(b) - score(a)).slice(0, 6);
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/png,image/jpeg,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") || "").toLowerCase();
  if (!type.startsWith("image/")) throw new Error(`type ${type}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error(`trop petit (${buf.length})`);
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  fs.writeFileSync(`${dest}.${ext}`, buf);
  return `${dest}.${ext}`;
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length ? batteries.filter((b) => only.includes(b.key)) : batteries;
  fs.mkdirSync(OUT, { recursive: true });

  for (const b of list) {
    const dir = path.join(OUT, b.key);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length >= 2) {
      console.log(`SKIP ${b.key} (deja telecharge)`);
      continue;
    }
    fs.mkdirSync(dir, { recursive: true });
    const query = queryFor(b);
    try {
      const urls = await bingImages(query);
      let n = 0;
      for (const url of urls) {
        try {
          await download(url, path.join(dir, String(++n)));
          if (n >= 4) break;
        } catch (e) {
          // candidate suivante
        }
      }
      console.log(`OK ${b.key} -> ${n} image(s) | ${query}`);
    } catch (e) {
      console.log(`ERR ${b.key}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 700));
  }
}

main();
