/* Générateur de visuels réseaux sociaux EliteTech.
 *
 * Crée des publications designées (et non de simples photos) :
 *   - Facebook / Instagram : 1080 x 1350
 *   - TikTok / Reels       : 1080 x 1920
 *
 * Deux thèmes : "dark" (noir premium) et "light" (blanc épuré).
 * Chaque visuel contient : logo, accroche, visuel produit, arguments,
 * prix et l'adresse du site elitetech.tn.
 *
 * Usage :
 *   node scripts/social/render-designs.cjs                 (tous les visuels)
 *   node scripts/social/render-designs.cjs galaxy-a07      (un seul)
 *   node scripts/social/render-designs.cjs --theme=light   (un seul thème)
 */
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, ImageData } = require("@napi-rs/canvas");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "social");
const designs = require("./designs.json");

const FONT = "Segoe UI, Tahoma, sans-serif";

const BASE = {
  accent: "#F5811F",
  accent2: "#FF9D4D",
  white: "#FFFFFF",
};

const THEMES = {
  dark: {
    bg1: "#07080B",
    bg2: "#0E1014",
    text: "#FFFFFF",
    muted: "#A7ADB9",
    chipBg: "rgba(255,255,255,0.07)",
    chipBorder: "rgba(255,255,255,0.16)",
    chipText: "#FFFFFF",
    line: "rgba(255,255,255,0.035)",
    ghost: "rgba(255,255,255,0.04)",
    glow: 0.34,
    priceColor: "#F5811F",
    badgeBg: "#F5811F",
    badgeText: "#0A0A0B",
    ctaFrom: "#F5811F",
    ctaTo: "#FF9D4D",
    ctaText: "#0A0A0B",
    ctaSub: "rgba(10,10,11,0.75)",
    ctaLine: "rgba(0,0,0,0.12)",
    darkLogo: false,
  },
  light: {
    bg1: "#FFFFFF",
    bg2: "#F3F4F6",
    text: "#0A0A0B",
    muted: "#5C6270",
    chipBg: "#FFFFFF",
    chipBorder: "rgba(10,10,11,0.10)",
    chipText: "#14161A",
    line: "rgba(10,10,11,0.035)",
    ghost: "rgba(10,10,11,0.045)",
    glow: 0.14,
    priceColor: "#F5811F",
    badgeBg: "#F5811F",
    badgeText: "#0A0A0B",
    ctaFrom: "#0A0A0B",
    ctaTo: "#1A1B1F",
    ctaText: "#FFFFFF",
    ctaSub: "rgba(255,255,255,0.65)",
    ctaLine: "rgba(255,255,255,0.06)",
    darkLogo: true,
  },
};

/* ── Helpers ─────────────────────────────────────────────────────────── */
function rgba(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function fitText(ctx, text, { maxWidth, maxLines, size, min = 40, weight = "bold" }) {
  let s = size;
  let lines = [];
  while (s >= min) {
    ctx.font = `${weight} ${s}px ${FONT}`;
    lines = wrapLines(ctx, text, maxWidth);
    if (lines.length <= maxLines) break;
    s -= 4;
  }
  return { size: s, lines };
}

function drawTextLines(ctx, lines, x, y, lineHeight, align = "center", color = "#fff") {
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + (lines.length - 1) * lineHeight;
}

function drawChip(ctx, label, x, y, theme, { height = 58, size = 26 } = {}) {
  ctx.font = `600 ${size}px ${FONT}`;
  const w = ctx.measureText(label).width + 56;
  roundRect(ctx, x, y, w, height, height / 2);
  ctx.fillStyle = theme.chipBg;
  ctx.fill();
  ctx.strokeStyle = theme.chipBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = theme.chipText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + height / 2 + 2);
  return w;
}

function chipRow(ctx, labels, centerX, y, theme, opts = {}) {
  ctx.font = `600 ${opts.size || 26}px ${FONT}`;
  const widths = labels.map((l) => ctx.measureText(l).width + 56);
  const gap = 16;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
  let x = centerX - total / 2;
  labels.forEach((label, i) => {
    drawChip(ctx, label, x, y, theme, opts);
    x += widths[i] + gap;
  });
  return total;
}

/* ── Fond ────────────────────────────────────────────────────────────── */
function drawBackground(ctx, w, h, theme, { glowY = 0.42, ghost = "" } = {}) {
  const g0 = ctx.createLinearGradient(0, 0, 0, h);
  g0.addColorStop(0, theme.bg1);
  g0.addColorStop(1, theme.bg2);
  ctx.fillStyle = g0;
  ctx.fillRect(0, 0, w, h);

  // halo orange derrière le produit
  const g = ctx.createRadialGradient(w * 0.5, h * glowY, 40, w * 0.5, h * glowY, w * 0.72);
  g.addColorStop(0, rgba(BASE.accent, theme.glow));
  g.addColorStop(0.5, rgba(BASE.accent, theme.glow * 0.3));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // fines diagonales
  ctx.save();
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 2;
  for (let x = -h; x < w + h; x += 76) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();
  }
  ctx.restore();

  // dégradé haut
  const top = ctx.createLinearGradient(0, 0, 0, 260);
  top.addColorStop(0, theme.darkLogo ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0.55)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, 260);

  // mot fantôme en arrière-plan
  if (ghost) {
    ctx.save();
    ctx.font = `900 ${Math.round(w * 0.34)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme.ghost;
    ctx.fillText(ghost, w / 2, h * 0.47);
    ctx.restore();
  }
}

/* ── Logos ───────────────────────────────────────────────────────────── */
let logoLight = null;
let logoDark = null;

async function getLogo(dark = false) {
  if (dark) {
    if (logoDark) return logoDark;
    const src = await loadImage(path.join(ROOT, "public", "images", "logo.png"));
    const c = createCanvas(src.width, src.height);
    const cx = c.getContext("2d");
    cx.drawImage(src, 0, 0);
    const data = cx.getImageData(0, 0, src.width, src.height);
    for (let i = 0; i < data.data.length; i += 4) {
      const r = data.data[i];
      const g = data.data[i + 1];
      const b = data.data[i + 2];
      if (r > 200 && g > 200 && b > 200) {
        data.data[i] = 10;
        data.data[i + 1] = 10;
        data.data[i + 2] = 11;
      }
    }
    cx.putImageData(data, 0, 0);
    logoDark = await loadImage(c.toBuffer("image/png"));
    return logoDark;
  }
  if (!logoLight) logoLight = await loadImage(path.join(ROOT, "public", "images", "logo.png"));
  return logoLight;
}

async function drawLogo(ctx, cx, y, height, dark) {
  const img = await getLogo(dark);
  const w = (img.width / img.height) * height;
  ctx.drawImage(img, cx - w / 2, y, w, height);
}

/* ── Image produit ───────────────────────────────────────────────────── */
async function drawProduct(ctx, src, cx, cy, maxW, maxH, { shadow = true } = {}) {
  const img = await loadImage(path.join(ROOT, "public", src.replace(/^\//, "")));
  const ratio = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  const x = cx - w / 2;
  const y = cy - h / 2;

  if (shadow) {
    ctx.save();
    ctx.filter = "blur(34px)";
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(cx, y + h - h * 0.06, w * 0.32, h * 0.035 + 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.drawImage(img, x, y, w, h);
  return { x, y, w, h };
}

/* ── Bloc prix ───────────────────────────────────────────────────────── */
function drawPrice(ctx, cx, y, price, theme, { label, size = 150, currency = "DT", rtl = false } = {}) {
  if (label) {
    ctx.font = `700 24px ${FONT}`;
    ctx.fillStyle = theme.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(rtl ? label : label.split("").join(" "), cx, y - Math.round(size * 0.86));
  }
  if (!price) return;

  ctx.save();
  ctx.direction = "ltr";
  const num = String(price);
  ctx.font = `900 ${size}px ${FONT}`;
  const numW = ctx.measureText(num).width;
  ctx.font = `800 ${Math.round(size * 0.44)}px ${FONT}`;
  const curW = ctx.measureText(currency).width;
  const gap = 16;
  const startX = cx - (numW + gap + curW) / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = theme.priceColor;
  ctx.font = `900 ${size}px ${FONT}`;
  ctx.fillText(num, startX, y);
  ctx.font = `800 ${Math.round(size * 0.44)}px ${FONT}`;
  ctx.fillStyle = theme.text;
  ctx.fillText(currency, startX + numW + gap, y);
  ctx.restore();
}

/* ── Bandeau bas ─────────────────────────────────────────────────────── */
async function drawCta(ctx, w, h, d, theme, { height = 200 } = {}) {
  const y = h - height;

  const g = ctx.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, theme.ctaFrom);
  g.addColorStop(1, theme.ctaTo);
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, height);

  // motif discret
  ctx.save();
  ctx.strokeStyle = theme.ctaLine;
  ctx.lineWidth = 3;
  for (let x = -height; x < w + height; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + height, h);
    ctx.stroke();
  }
  ctx.restore();

  // filet orange en haut du bandeau (thème clair)
  if (theme.darkLogo) {
    ctx.fillStyle = BASE.accent;
    ctx.fillRect(0, y, w, 8);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = theme.darkLogo ? BASE.accent : theme.ctaText;
  ctx.font = `900 58px ${FONT}`;
  ctx.save();
  ctx.direction = "ltr";
  ctx.fillText(d.website || "elitetech.tn", w / 2, y + Math.round(height * 0.36));
  ctx.restore();

  if (d.phone) {
    ctx.fillStyle = theme.ctaText;
    ctx.font = `700 30px ${FONT}`;
    ctx.save();
    ctx.direction = "ltr";
    ctx.fillText(d.phone, w / 2, y + Math.round(height * 0.58));
    ctx.restore();
  }

  if (d.address) {
    ctx.font = `600 25px ${FONT}`;
    ctx.fillStyle = theme.ctaSub;
    ctx.fillText(d.address, w / 2, y + Math.round(height * 0.73));
  }

  if (d.lines?.length) {
    ctx.font = `700 24px ${FONT}`;
    ctx.fillStyle = theme.ctaSub;
    ctx.fillText(d.lines.join("  •  "), w / 2, y + Math.round(height * 0.87));
  }
}

function drawBadge(ctx, cx, y, text, theme, { size = 28 } = {}) {
  ctx.font = `800 ${size}px ${FONT}`;
  const w = Math.max(ctx.measureText(text).width + 64, 190);
  const h = size + 34;
  roundRect(ctx, cx - w / 2, y, w, h, h / 2);
  ctx.fillStyle = theme.badgeBg;
  ctx.fill();
  ctx.fillStyle = theme.badgeText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, y + h / 2 + 2);
}

/* ── Format Facebook / Instagram 1080x1350 ──────────────────────────── */
async function renderFeed(d) {
  const theme = THEMES[d.theme || "dark"];
  const w = 1080;
  const h = 1350;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const rtl = d.locale === "ar";
  if (rtl) ctx.direction = "rtl";

  drawBackground(ctx, w, h, theme, { glowY: 0.44, ghost: d.ghost || "" });

  await drawLogo(ctx, w / 2, 46, 82, theme.darkLogo);

  // pastille site en haut
  ctx.font = `700 25px ${FONT}`;
  const siteW = ctx.measureText(d.website || "elitetech.tn").width + 64;
  roundRect(ctx, w / 2 - siteW / 2, 146, siteW, 50, 25);
  ctx.fillStyle = theme.chipBg;
  ctx.fill();
  ctx.strokeStyle = theme.chipBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = theme.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.website || "elitetech.tn", w / 2, 172);

  if (d.badge) drawBadge(ctx, w / 2, 222, d.badge, theme);

  const title = fitText(ctx, d.title, { maxWidth: 900, maxLines: 2, size: 98, min: 60 });
  const titleY = 368;
  const tlh = Math.round(title.size * 1.02);
  const lastTitleY = drawTextLines(ctx, title.lines, w / 2, titleY, tlh, "center", theme.text);

  let subY = lastTitleY + 52;
  if (d.subtitle) {
    ctx.font = `500 33px ${FONT}`;
    const lines = wrapLines(ctx, d.subtitle, 820).slice(0, 2);
    drawTextLines(ctx, lines, w / 2, subY, 44, "center", theme.muted);
    subY += (lines.length - 1) * 44 + 16;
  }

  const imgTop = Math.max(subY + 14, 500);
  const imgBottom = 945;
  const imgs = d.images || [];
  if (imgs.length === 1) {
    await drawProduct(ctx, imgs[0], w / 2, (imgTop + imgBottom) / 2, 620, imgBottom - imgTop);
  } else if (imgs.length >= 2) {
    const each = Math.min(420, (w - 220) / imgs.length);
    const gap = 12;
    const total = each * imgs.length + gap * (imgs.length - 1);
    let x = w / 2 - total / 2;
    for (const src of imgs.slice(0, 3)) {
      await drawProduct(ctx, src, x + each / 2, (imgTop + imgBottom) / 2, each, imgBottom - imgTop, { shadow: false });
      x += each + gap;
    }
  }

  if (d.chips?.length) chipRow(ctx, d.chips.slice(0, 4), w / 2, 958, theme, { height: 56, size: 25 });

  if (d.price) {
    drawPrice(ctx, w / 2, 1132, d.price, theme, {
      label: d.priceLabel,
      size: 112,
      currency: d.currency || "DT",
      rtl,
    });
  } else if (d.priceText) {
    ctx.font = `900 64px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = theme.priceColor;
    ctx.fillText(d.priceText, w / 2, 1112);
  }

  await drawCta(ctx, w, h, d, theme, { height: 200 });

  const suffix = `${d.locale || "fr"}-${d.theme || "dark"}`;
  const file = path.join(OUT_DIR, `${d.id}-${suffix}-fb.png`);
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  return file;
}

/* ── Format TikTok / Reels 1080x1920 ────────────────────────────────── */
async function renderVertical(d) {
  const theme = THEMES[d.theme || "dark"];
  const w = 1080;
  const h = 1920;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const rtl = d.locale === "ar";
  if (rtl) ctx.direction = "rtl";

  drawBackground(ctx, w, h, theme, { glowY: 0.46, ghost: d.ghost || "" });

  await drawLogo(ctx, w / 2, 246, 94, theme.darkLogo);

  ctx.font = `700 28px ${FONT}`;
  const siteW = ctx.measureText(d.website || "elitetech.tn").width + 70;
  roundRect(ctx, w / 2 - siteW / 2, 358, siteW, 54, 27);
  ctx.fillStyle = theme.chipBg;
  ctx.fill();
  ctx.strokeStyle = theme.chipBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = theme.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.website || "elitetech.tn", w / 2, 386);

  if (d.badge) drawBadge(ctx, w / 2, 446, d.badge, theme, { size: 30 });

  const title = fitText(ctx, d.title, { maxWidth: 900, maxLines: 3, size: 110, min: 62 });
  const titleY = 620;
  const tlh = Math.round(title.size * 1.0);
  const lastTitleY = drawTextLines(ctx, title.lines, w / 2, titleY, tlh, "center", theme.text);

  let subY = lastTitleY + 60;
  if (d.subtitle) {
    ctx.font = `500 35px ${FONT}`;
    const lines = wrapLines(ctx, d.subtitle, 820).slice(0, 2);
    drawTextLines(ctx, lines, w / 2, subY, 46, "center", theme.muted);
    subY += (lines.length - 1) * 46 + 14;
  }

  const imgTop = Math.max(subY + 24, 820);
  const imgBottom = 1310;
  const imgs = d.images || [];
  if (imgs.length === 1) {
    await drawProduct(ctx, imgs[0], w / 2, (imgTop + imgBottom) / 2, 760, imgBottom - imgTop);
  } else if (imgs.length >= 2) {
    const each = Math.min(430, (w - 240) / imgs.length);
    const gap = 16;
    const total = each * imgs.length + gap * (imgs.length - 1);
    let x = w / 2 - total / 2;
    for (const src of imgs.slice(0, 3)) {
      await drawProduct(ctx, src, x + each / 2, (imgTop + imgBottom) / 2, each, imgBottom - imgTop, { shadow: false });
      x += each + gap;
    }
  }

  if (d.chips?.length) chipRow(ctx, d.chips.slice(0, 4), w / 2, 1334, theme, { height: 58, size: 24 });

  if (d.price) {
    drawPrice(ctx, w / 2, 1596, d.price, theme, {
      label: d.priceLabel,
      size: 138,
      currency: d.currency || "DT",
      rtl,
    });
  } else if (d.priceText) {
    ctx.font = `900 84px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = theme.priceColor;
    ctx.fillText(d.priceText, w / 2, 1576);
  }

  await drawCta(ctx, w, h, d, theme, { height: 250 });

  const suffix = `${d.locale || "fr"}-${d.theme || "dark"}`;
  const file = path.join(OUT_DIR, `${d.id}-${suffix}-tt.png`);
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  return file;
}

/* ── Exécution ───────────────────────────────────────────────────────── */
(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const args = process.argv.slice(2);
  const themeArg = args.find((a) => a.startsWith("--theme="));
  const themeFilter = themeArg ? themeArg.split("=")[1] : null;
  const only = args.filter((a) => !a.startsWith("--"));

  let list = designs;
  if (only.length) list = list.filter((d) => only.includes(d.id));
  if (themeFilter) list = list.filter((d) => (d.theme || "dark") === themeFilter);

  for (const d of list) {
    const feed = await renderFeed(d);
    const vert = await renderVertical(d);
    console.log(`${d.id} [${d.locale || "fr"}/${d.theme || "dark"}] -> ${path.relative(ROOT, feed)} | ${path.relative(ROOT, vert)}`);
  }
  console.log(`Terminé : ${list.length} publication(s).`);
})();
