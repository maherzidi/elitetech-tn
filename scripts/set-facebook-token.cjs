/* Écrit le jeton Facebook depuis le presse-papiers dans .env.local.
 * Usage: npm run fb:token
 * Le jeton n'est jamais affiché : seule sa longueur est indiquée.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const envPath = path.join(process.cwd(), ".env.local");

function clipboard() {
  return execFileSync(
    "powershell",
    ["-NoProfile", "-Command", "Get-Clipboard -Raw"],
    { encoding: "utf8" }
  );
}

const raw = clipboard().replace(/\uFEFF/g, "").trim().replace(/^"|"$/g, "").replace(/\s+/g, "");

if (!/^EAA[A-Za-z0-9_-]{60,}$/.test(raw)) {
  console.error("Le presse-papiers ne contient pas un jeton Meta valide.");
  console.error("Copiez d'abord le jeton (bouton Copier) puis relancez : npm run fb:token");
  process.exit(1);
}

let content = fs.readFileSync(envPath, "utf8");
if (!/^FB_PAGE_TOKEN=.*$/m.test(content)) {
  console.error("Ligne FB_PAGE_TOKEN introuvable dans .env.local.");
  process.exit(1);
}
content = content.replace(/^FB_PAGE_TOKEN=.*$/m, `FB_PAGE_TOKEN="${raw}"`);
fs.writeFileSync(envPath, content, "utf8");

try {
  execFileSync("powershell", ["-NoProfile", "-Command", "Set-Clipboard -Value ' '"], { stdio: "ignore" });
} catch {}

console.log(`Jeton enregistré dans .env.local (${raw.length} caractères). Presse-papiers vidé.`);
console.log("Vérification : npm run fb:check");
