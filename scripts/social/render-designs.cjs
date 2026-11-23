/* Générateur de visuels réseaux sociaux EliteTech.
 *
 * Crée des publications designées (et non de simples photos) :
 *   - Facebook / Instagram : 1080 x 1350
 *   - TikTok / Reels       : 1080 x 1920
 *
 * Chaque visuel contient : logo, accroche, visuel produit, arguments,
 * prix et l'adresse du site elitetech.tn.
 *
 * Usage :
 *   node scripts/social/render-designs.cjs            (tous les visuels)
 *   node scripts/social/render-designs.cjs galaxy-a07 (un seul)
 */
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "social");
const designs = require("./designs.json");

/* ── Palette ─────────────────────────────────────────────────────────── */
const C = {
  bg: "#07080B",
  bg2: "#0E1014",
  white: "#FFFFFF",
  muted: "#A7ADB9",
  accent: "#F5811F",
  accent2: "#FF9D4D",
  amber: "#FFB020",
  green: "#37D67A",
};

const FONT = "Segoe UI, Tahoma, sans-serif";

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

/** Écrit un texte sur plusieurs lignes en réduisant la taille si nécessaire. */
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

function drawTextLines(ctx, lines, x, y, lineHeight, align = "center", color = C.white) {
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + (lines.length - 1) * lineHeight;
}

function drawChip(ctx, label, x, y, { height = 58, size = 26, color = C.white } = {}) {
  ctx.font = `600 ${size}px ${FONT}`;
  const w = ctx.measureText(label).width + 56;
  roundRect(ctx, x, y, w, height, height / 2);
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + height / 2 + 1);
  return w;
}

function chipRow(ctx, labels, centerX, y, opts) {
  ctx.font = `600 ${opts.size || 26}px ${FONT}`;
  const widths = labels.map((l) => ctx.measureText(l).width + 56);
  const gap = 16;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
  let x = centerX - total / 2;
  labels.forEach((label, i) => {
    drawChip(ctx, label, x, y, opts);
    x += widths[i] + gap;
  });
  return total;
}

/* ── Fond ────────────────────────────────────────────────────────────── */
function drawBackground(ctx, w, h, { glowY = 0.42, accent = C.accent, ghost = "" } = {}) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, w, h);

  // halo orange derrière le produit
  const g = ctx.createRadialGradient(w * 0.5, h * glowY, 40, w * 0.5, h * glowY, w * 0.72);
  g.addColorStop(0, rgba(accent, 0.34));
  g.addColorStop(0.45, rgba(accent, 0.1));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // halo lumineux derrière le produit (détache les produits sombres)
  const halo = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.5);
  halo.addColorStop(0, "rgba(255,255,255,0.10)");
  halo.addColorStop(0.55, "rgba(255,255,255,0.03)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  // fines diagonales
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 2;
  for (let x = -h; x < w + h; x += 76) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();
  }
  ctx.restore();

  // vignette bas + haut
  const top = ctx.createLinearGradient(0, 0, 0, 260);
  top.addColorStop(0, "rgba(0,0,0,0.55)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, 260);

  // mot fantôme en arrière-plan
  if (ghost) {
    ctx.save();
    ctx.font = `900 ${Math.round(w * 0.34)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    ctx.fillText(ghost, w / 2, h * 0.47);
    ctx.restore();
  }
}

/* ── Logo ────────────────────────────────────────────────────────────── */
let logo = null;
async function getLogo() {
  if (!logo) logo = await loadImage(path.join(ROOT, "public", "images", "logo.png"));
  return logo;
}

async function drawLogo(ctx, cx, y, height, { align = "center" } = {}) {
  const img = await getLogo();
  const w = (img.width / img.height) * height;
  const x = align === "center" ? cx - w / 2 : cx;
  ctx.drawImage(img, x, y, w, height);
  return { x, y, w, h: height };
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
    ctx.filter = "blur(38px)";
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath();
    ctx.ellipse(cx, y + h - h * 0.06, w * 0.34, h * 0.04 + 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.drawImage(img, x, y, w, h);
  return { x, y, w, h };
}

/* ── Bloc prix ───────────────────────────────────────────────────────── */
function drawPrice(ctx, cx, y, price, { label = "PRIX MAGASIN", size = 150, color = C.accent } = {}) {
  if (label) {
    ctx.font = `700 24px ${FONT}`;
    ctx.fillStyle = C.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(label.split("").join(" "), cx, y - Math.round(size * 0.86));
  }
  if (!price) return;

  const num = String(price);
  ctx.font = `900 ${size}px ${FONT}`;
  const numW = ctx.measureText(num).width;
  ctx.font = `800 ${Math.round(size * 0.44)}px ${FONT}`;
  const dtW = ctx.measureText("DT").width;
  const gap = 16;
  const startX = cx - (numW + gap + dtW) / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  ctx.font = `900 ${size}px ${FONT}`;
  ctx.fillText(num, startX, y);
  ctx.font = `800 ${Math.round(size * 0.44)}px ${FONT}`;
  ctx.fillStyle = C.white;
  ctx.fillText("DT", startX + numW + gap, y);
}

/* ── Bandeau bas ─────────────────────────────────────────────────────── */
async function drawCta(ctx, w, h, { website = "elitetech.tn", phone, address, lines = [] }, { height = 230 } = {}) {
  const y = h - height;

  const g = ctx.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, C.accent);
  g.addColorStop(1, C.accent2);
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, height);

  // motif discret
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  for (let x = -height; x < w + height; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + height, h);
    ctx.stroke();
  }
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#0A0A0B";
  ctx.font = `900 54px ${FONT}`;
  ctx.fillText(website, w / 2, y + Math.round(height * 0.38));

  ctx.font = `600 26px ${FONT}`;
  const info = [address, phone].filter(Boolean).join("  •  ");
  if (info) ctx.fillText(info, w / 2, y + Math.round(height * 0.6));

  if (lines.length) {
    ctx.font = `700 24px ${FONT}`;
    ctx.fillStyle = "rgba(10,10,11,0.72)";
    ctx.fillText(lines.join("  •  "), w / 2, y + Math.round(height * 0.81));
  }
}

/* ── Badge ───────────────────────────────────────────────────────────── */
function drawBadge(ctx, cx, y, text, { bg = C.accent, fg = "#0A0A0B", size = 28 } = {}) {
  ctx.font = `800 ${size}px ${FONT}`;
  const w = ctx.measureText(text).width + 64;
  const h = size + 34;
  roundRect(ctx, cx - w / 2, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, y + h / 2 + 1);
  return { w, h };
}

/* ── Format Facebook / Instagram 1080x1350 ──────────────────────────── */
async function renderFeed(d) {
  const w = 1080;
  const h = 1350;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx, w, h, { glowY: 0.44, accent: d.accent || C.accent, ghost: d.ghost || "" });

  await drawLogo(ctx, w / 2, 54, 62);

  // pastille site en haut
  ctx.font = `700 24px ${FONT}`;
  const siteW = ctx.measureText(d.website || "www.elitetech.tn").width + 58;
  roundRect(ctx, w / 2 - siteW / 2, 130, siteW, 46, 23);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.website || "www.elitetech.tn", w / 2, 154);

  // badge
  if (d.badge) drawBadge(ctx, w / 2, 200, d.badge, { bg: d.badgeColor || C.accent });

  // titre
  const title = fitText(ctx, d.title, { maxWidth: 900, maxLines: 2, size: 98, min: 60 });
  const titleY = 340;
  const tlh = Math.round(title.size * 1.02);
  const lastTitleY = drawTextLines(ctx, title.lines, w / 2, titleY, tlh);

  // sous-titre
  let subY = lastTitleY + 52;
  if (d.subtitle) {
    ctx.font = `500 33px ${FONT}`;
    const lines = wrapLines(ctx, d.subtitle, 820).slice(0, 2);
    drawTextLines(ctx, lines, w / 2, subY, 44, "center", C.muted);
    subY += (lines.length - 1) * 44 + 16;
  }

  // image(s) produit
  const imgTop = Math.max(subY + 14, 480);
  const imgBottom = 930;
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

  // arguments
  if (d.chips?.length) chipRow(ctx, d.chips.slice(0, 4), w / 2, 944, { height: 56, size: 25 });

  // prix
  if (d.price) {
    drawPrice(ctx, w / 2, 1140, d.price, { label: d.priceLabel || "PRIX MAGASIN", size: 118 });
  } else if (d.priceText) {
    ctx.font = `900 68px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = C.accent;
    ctx.fillText(d.priceText, w / 2, 1118);
  }

  await drawCta(ctx, w, h, d, { height: 200 });

  const file = path.join(OUT_DIR, `${d.id}-fb.png`);
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  return file;
}

/* ── Format TikTok / Reels 1080x1920 ────────────────────────────────── */
async function renderVertical(d) {
  const w = 1080;
  const h = 1920;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx, w, h, { glowY: 0.46, accent: d.accent || C.accent, ghost: d.ghost || "" });

  await drawLogo(ctx, w / 2, 250, 74);

  ctx.font = `700 27px ${FONT}`;
  const siteW = ctx.measureText(d.website || "www.elitetech.tn").width + 64;
  roundRect(ctx, w / 2 - siteW / 2, 344, siteW, 50, 25);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.website || "www.elitetech.tn", w / 2, 370);

  if (d.badge) drawBadge(ctx, w / 2, 428, d.badge, { bg: d.badgeColor || C.accent, size: 30 });

  const title = fitText(ctx, d.title, { maxWidth: 900, maxLines: 3, size: 110, min: 62 });
  const titleY = 600;
  const tlh = Math.round(title.size * 1.0);
  const lastTitleY = drawTextLines(ctx, title.lines, w / 2, titleY, tlh);

  let subY = lastTitleY + 60;
  if (d.subtitle) {
    ctx.font = `500 35px ${FONT}`;
    const lines = wrapLines(ctx, d.subtitle, 820).slice(0, 2);
    drawTextLines(ctx, lines, w / 2, subY, 46, "center", C.muted);
    subY += (lines.length - 1) * 46 + 14;
  }

  const imgTop = Math.max(subY + 24, 800);
  const imgBottom = 1298;
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

  if (d.chips?.length) chipRow(ctx, d.chips.slice(0, 4), w / 2, 1322, { height: 58, size: 24 });

  if (d.price) {
    drawPrice(ctx, w / 2, 1570, d.price, { label: d.priceLabel || "PRIX MAGASIN", size: 138 });
  } else if (d.priceText) {
    ctx.font = `900 86px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = C.accent;
    ctx.fillText(d.priceText, w / 2, 1555);
  }

  await drawCta(ctx, w, h, d, { height: 250 });

  const file = path.join(OUT_DIR, `${d.id}-tt.png`);
  fs.writeFileSync(file, canvas.toBuffer("image/png"));
  return file;
}

/* ── Exécution ───────────────────────────────────────────────────────── */
(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const only = process.argv.slice(2);
  const list = only.length ? designs.filter((d) => only.includes(d.id)) : designs;
  for (const d of list) {
    const feed = await renderFeed(d);
    const vert = await renderVertical(d);
    console.log(`${d.id} -> ${path.relative(ROOT, feed)} | ${path.relative(ROOT, vert)}`);
  }
  console.log(`Terminé : ${list.length} publication(s).`);
})();
