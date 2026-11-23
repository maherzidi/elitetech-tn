/* Vérifie la connexion à la page Facebook sans jamais afficher le jeton.
 * Usage: npm run fb:check
 */
const fs = require("fs");
const path = require("path");

for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const VERSION = process.env.GRAPH_VERSION || "v23.0";
const TOKEN = process.env.FB_PAGE_TOKEN;
let PAGE_ID = process.env.FB_PAGE_ID;
const API = `https://graph.facebook.com/${VERSION}`;

if (!TOKEN) {
  console.log("FB_PAGE_TOKEN est vide dans .env.local.");
  console.log("Suivez docs/facebook-publication.md puis relancez : npm run fb:check");
  process.exit(1);
}

async function get(pathname, params = {}) {
  const qs = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = await fetch(`${API}/${pathname}?${qs}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  return data;
}

(async () => {
  try {
    const me = await get("me", { fields: "id,name" });
    const looksLikePage = !PAGE_ID || me.id === PAGE_ID;
    console.log(`Jeton valide. Compte lié : ${me.name} (${me.id})`);

    if (!PAGE_ID && !looksLikePage) {
      const accounts = await get("me/accounts", { fields: "id,name", limit: "50" });
      if (accounts.data?.length) {
        console.log("\nPages accessibles avec ce jeton :");
        for (const page of accounts.data) console.log(`  - ${page.name} : ${page.id}`);
        console.log("\nCopiez l'identifiant de votre page dans FB_PAGE_ID puis relancez.");
        process.exit(0);
      }
      console.log("Aucune page trouvée : le jeton est probablement un jeton utilisateur sans pages_show_list.");
      process.exit(0);
    }

    if (!PAGE_ID) PAGE_ID = me.id;
    const page = await get(PAGE_ID, { fields: "id,name,fan_count,link" });
    console.log(`Page : ${page.name} (${page.id}) — ${page.fan_count ?? 0} abonné(s)`);
    console.log(`Lien : ${page.link || "-"}`);
    console.log("\nTout est prêt. Simulation : npm run fb:dry | Publication : npm run fb:publish");
  } catch (e) {
    console.error(`ERREUR : ${e.message}`);
    console.error("Vérifiez que le jeton n'a pas été révoqué et que FB_PAGE_ID correspond à la page.");
    process.exitCode = 1;
  }
})();
