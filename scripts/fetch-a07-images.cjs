const fs = require("fs");
const path = require("path");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const queries = {
  "galaxy-a07-noir": "Samsung Galaxy A07 black front back",
  "galaxy-a07-vert": "Samsung Galaxy A07 green front back",
  "galaxy-a07-violet": "Samsung Galaxy A07 purple front back",
};

async function main() {
  const out = path.join(process.cwd(), ".cache", "a07");
  fs.mkdirSync(out, { recursive: true });
  for (const [key, q] of Object.entries(queries)) {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2`;
    const html = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
    const urls = [];
    for (const m of html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)) {
      const u = m[1].replace(/&amp;/g, "&");
      if (/^https?:\/\//i.test(u) && !urls.includes(u)) urls.push(u);
    }
    let n = 0;
    for (const u of urls.slice(0, 10)) {
      try {
        const r = await fetch(u, { headers: { "User-Agent": UA, Accept: "image/*" } });
        const type = (r.headers.get("content-type") || "").toLowerCase();
        if (!r.ok || !type.startsWith("image/")) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length < 12000) continue;
        const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
        fs.writeFileSync(path.join(out, `${key}-${++n}.${ext}`), buf);
        if (n >= 5) break;
      } catch {}
    }
    console.log(key, n);
  }
}
main();
