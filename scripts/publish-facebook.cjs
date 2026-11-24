/* Publication Facebook Page (Graph API) à partir de scripts/social/posts.json.
 *
 * Le jeton n'est JAMAIS écrit dans le code : il est lu depuis .env.local
 * (FB_PAGE_ID, FB_PAGE_TOKEN). Lancez d'abord en simulation :
 *   node scripts/publish-facebook.cjs
 * puis pour publier réellement :
 *   node scripts/publish-facebook.cjs --publish
 *
 * Format de posts.json :
 * [{ "message": "texte...", "images": ["https://.../photo.webp"],
 *    "scheduledAt": "2026-11-25T18:00:00+01:00" }]
 * scheduledAt est optionnel (publication immédiate si absent).
 */
const fs = require("fs");
const path = require("path");

const PUBLISH = process.argv.includes("--publish");

for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const VERSION = process.env.GRAPH_VERSION || "v23.0";
const PAGE_ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_TOKEN;
const API = `https://graph.facebook.com/${VERSION}`;

// Les photos « non publiées » et les posts programmés doivent être envoyés
// avec le jeton de la page, pas celui de l'utilisateur système.
let ACTIVE_TOKEN = TOKEN;

async function loadPageToken() {
  const url = `${API}/${PAGE_ID}?fields=access_token&access_token=${encodeURIComponent(TOKEN)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (data.access_token) {
    ACTIVE_TOKEN = data.access_token;
    return;
  }
  console.warn(`Jeton de page indisponible (${data.error?.message || "réponse inattendue"}), utilisation du jeton système.`);
}

function checkEnv() {
  const missing = [];
  if (!PAGE_ID) missing.push("FB_PAGE_ID");
  if (!TOKEN) missing.push("FB_PAGE_TOKEN");
  if (missing.length) {
    console.error(`Variables manquantes dans .env.local : ${missing.join(", ")}`);
    console.error("Ajoutez-les (sans les coller dans une conversation) puis relancez.");
    process.exit(1);
  }
}

async function graph(pathname, params) {
  const body = new URLSearchParams({ ...params, access_token: ACTIVE_TOKEN });
  const res = await fetch(`${API}/${pathname}`, { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function uploadPhoto(url) {
  const data = await graph(`${PAGE_ID}/photos`, { url, published: "false" });
  return data.id;
}

async function deletePost(id) {
  const res = await fetch(
    `${API}/${id}?access_token=${encodeURIComponent(ACTIVE_TOKEN)}`,
    { method: "DELETE" }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return true;
}

async function publishPost(post) {
  const images = (post.images || []).filter(Boolean);
  const params = { message: post.message };

  if (post.scheduledAt) {
    params.published = "false";
    params.scheduled_publish_time = String(Math.floor(new Date(post.scheduledAt).getTime() / 1000));
  }

  if (images.length > 1) {
    const ids = [];
    for (const url of images) ids.push(await uploadPhoto(url));
    params.attached_media = JSON.stringify(ids.map((id) => ({ media_fbid: id })));
    return graph(`${PAGE_ID}/feed`, params);
  }

  if (images.length === 1) {
    const body = { ...params, url: images[0] };
    return graph(`${PAGE_ID}/photos`, body);
  }

  return graph(`${PAGE_ID}/feed`, params);
}

async function main() {
  if (PUBLISH) checkEnv();
  else console.log("Mode simulation : aucun jeton requis, aucune publication envoyée.");
  if (PUBLISH) await loadPageToken();
  const file = path.join(process.cwd(), "scripts", "social", "posts.json");
  if (!fs.existsSync(file)) {
    console.error("Fichier introuvable : scripts/social/posts.json");
    process.exit(1);
  }
  const posts = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? Number(onlyArg.split("=")[1]) : 0;
  const selection = only ? [posts[only - 1]].filter(Boolean) : posts;
  console.log(`${selection.length} publication(s) | mode : ${PUBLISH ? "PUBLICATION" : "simulation"}`);

  for (const [i, post] of selection.entries()) {
    const label = `#${i + 1} ${post.message.slice(0, 60)}...`;
    if (!PUBLISH) {
      const remplace = (post.deleteIds || []).length;
      console.log(
        `[simulation] ${label} | images: ${(post.images || []).length} | ${post.scheduledAt || "immédiat"}${
          remplace ? ` | remplace ${remplace} ancien(s) post(s)` : ""
        }`
      );
      continue;
    }
    try {
      for (const oldId of post.deleteIds || []) {
        await deletePost(oldId);
        console.log(`SUPPRIME ${oldId}`);
      }
      const result = await publishPost(post);
      console.log(`OK ${label} -> ${result.id || result.post_id || "publie"}`);
    } catch (e) {
      console.error(`ERREUR ${label} -> ${e.message}`);
      process.exitCode = 1;
    }
  }
}

main();
