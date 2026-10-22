# EliteTech — elitetech.tn

Site e-commerce (Next.js 14 + PostgreSQL + Prisma + Tailwind) pour la vente d'électronique,
téléphonie, accessoires et matériel informatique. Prêt à héberger sur **Vercel**.

## Ce que contient le projet

- **Site public** : catalogue par catégories/sous-catégories (façon mytek.tn / tunisianet.tn),
  recherche, fiche produit, panier, commande en ligne (paiement à la livraison pour l'instant),
  bilingue **Français / Arabe** (avec bascule RTL).
- **Espace admin** (`/admin`) protégé par mot de passe : gestion des produits, des catégories,
  du stock/inventaire, et des commandes.
- **Base de données PostgreSQL** conçue pour être **partagée avec ta future caisse** (logiciel
  de facturation) : une seule table `Product` avec un seul stock, et un journal `StockMovement`
  qui trace chaque mouvement (vente site, vente caisse, ajustement, réception) avec sa source.

## 1. Prérequis

- [Node.js](https://nodejs.org) version 18 ou plus
- Un compte [Vercel](https://vercel.com) (gratuit) pour héberger le site
- Une base PostgreSQL gratuite, par ex. [Neon](https://neon.tech) (recommandé, fonctionne très
  bien avec Vercel) ou [Supabase](https://supabase.com)

## 2. Créer la base de données (Neon)

1. Va sur [neon.tech](https://neon.tech), crée un compte et un nouveau projet.
2. Dans le tableau de bord du projet, l'onglet **Connection Details** te donne une chaîne de
   connexion (`postgresql://...`). Copie-la **telle quelle, sans guillemets ni le mot `psql`** :
   ce sera ta variable `DATABASE_URL`. Si Neon en propose deux (pooled / direct), prends celle
   **sans** `-pooler` dans l'adresse pour commencer.
3. Garde cette chaîne de côté, tu en auras besoin à l'étape suivante.

> C'est cette même chaîne de connexion que ton logiciel de caisse utilisera plus tard pour
> accéder aux mêmes données de stock.

## 3. Configuration locale

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement et le remplir
cp .env.example .env
```

Ouvre `.env` et renseigne au minimum :

```
DATABASE_URL="ta-chaine-de-connexion-neon"
ADMIN_EMAIL="admin@elitetech.tn"
ADMIN_PASSWORD="choisis-un-mot-de-passe-fort"
AUTH_SECRET="une-longue-chaine-aleatoire"
```

Puis crée les tables et les données de départ (catégories, compte admin, 2 produits d'exemple) :

```bash
npm run db:push
npm run db:seed
```

> Si ta base existait déjà avant l'ajout du Programme Vendeur, relance simplement
> `npm run db:push` : Prisma ajoute les nouvelles tables/colonnes sans toucher à tes données
> existantes.

Lance le site en local :

```bash
npm run dev
```

Le site : http://localhost:3000
L'admin : http://localhost:3000/admin-login (avec l'email/mot de passe définis dans `.env`)

## 4. Remplacer le logo et les photos produits

- Le logo est dans `public/images/logo.png` (déjà remplacé par ton logo).
- Les photos produits sont pour l'instant des visuels provisoires
  (`public/images/placeholder-product.svg`). Pour ajouter de vraies photos :
  - le plus simple pour commencer : dépose tes images dans `public/images/produits/` et
    renseigne le chemin (`/images/produits/mon-produit.jpg`) dans la fiche produit (colonne
    `images` en base, ou on peut ajouter un champ d'upload dans l'admin plus tard) ;
  - pour une vraie gestion d'upload (glisser-déposer depuis l'admin), on pourra brancher
    [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) ou
    [Cloudinary](https://cloudinary.com) — dis-le-moi quand tu es prêt et je l'ajoute.

## 5. Déployer sur Vercel

**La méthode fiable est GitHub + import Vercel** (le glisser-déposer d'un zip est plus fragile :
Vercel doit deviner le dossier racine, et si le zip a un sous-dossier en trop, tu obtiens "page
does not exist"). Utilise plutôt :

1. Crée un dépôt sur GitHub, puis depuis ce dossier :
   ```bash
   git init
   git add .
   git commit -m "Site EliteTech"
   git branch -M main
   git remote add origin https://github.com/<ton-compte>/elitetech-tn.git
   git push -u origin main
   ```
2. Sur [vercel.com](https://vercel.com) → **Add New → Project** → importe ce dépôt GitHub.
3. **Vérifie "Root Directory"** dans l'écran d'import : il doit être vide/`.` (le dossier importé
   doit être celui qui contient directement `package.json`). C'est la cause la plus fréquente de
   "page does not exist".
4. **Avant de cliquer "Deploy"**, ouvre **Environment Variables** et ajoute (les mêmes que ton
   `.env` local) :
   - `DATABASE_URL` (la chaîne de connexion Neon, sans guillemets)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`
   - `NEXT_PUBLIC_SHOP_NAME`, `NEXT_PUBLIC_SHOP_PHONE`, `NEXT_PUBLIC_SHOP_WHATSAPP`,
     `NEXT_PUBLIC_SHOP_ADDRESS`
   Un déploiement sans `DATABASE_URL` compile mais chaque page plante à l'ouverture.
5. Clique **Deploy**. Vercel exécute `npm install`, puis
   `npm run build` (qui génère aussi le client Prisma).
6. **Vérifie les logs** : Deployments → ton déploiement → **Building** puis **Functions**. Toute
   erreur y est écrite noir sur blanc.
7. Une fois le déploiement "Ready", ouvre le lien `*.vercel.app` fourni : c'est ton site en ligne,
   avant même de brancher `elitetech.tn`.
8. Depuis ta machine, avec `DATABASE_URL` de `.env` pointant vers cette même base
   Neon, lance la création des tables et le seed :
   ```bash
   npm run db:push
   npm run db:seed
   ```
   (Sans ça, la base est vide et le site affiche des pages sans produits/catégories.)
9. Ajoute `elitetech.tn` dans **Settings → Domains**, puis mets à jour les enregistrements DNS
   chez ton registrar comme indiqué par Vercel (ça peut prendre jusqu'à 24-48h à se propager).

### Checklist si une page affiche encore "does not exist" ou une erreur

- [ ] **Root Directory** du projet Vercel = dossier contenant `package.json` (pas un sous-dossier)
- [ ] `DATABASE_URL` renseignée dans Environment Variables (sans guillemets, commence par `postgresql://`)
- [ ] `npm run db:push` a bien été exécuté sur cette base (les tables existent)
- [ ] Le déploiement est marqué **Ready** (pas "Error") dans l'onglet Deployments
- [ ] Tu testes le lien `*.vercel.app`, pas `elitetech.tn` (le DNS peut ne pas être propagé)

### Lancer le seed sur la base de production

Depuis ta machine, avec `DATABASE_URL` de `.env` pointant vers la base de prod :

```bash
npm run db:seed
```

(Fais-le une seule fois, il ne duplique pas les données si tu le relances.)

## 6. Activer le paiement en ligne plus tard

Le tunnel de commande est déjà prêt à accueillir un deuxième mode de paiement. Quand la banque
aura validé ton accès à l'API (carte bancaire tunisienne, type ClicToPay/Konnect/Paymee...) :

1. On ajoute les clés API de la banque dans les variables d'environnement.
2. On active le bouton "Paiement en ligne" dans `src/app/commande/page.tsx` (actuellement
   grisé), et on branche l'appel à l'API de paiement dans `src/app/api/orders/route.ts`.

Aucune restructuration de la base n'est nécessaire : les champs `paymentMethod` et
`paymentStatus` existent déjà sur la commande.

## 7. Service Réparation & Promotions

- **`/reparation`** : le client choisit le modèle de son appareil et le type de panne (liste
  gérée par toi), voit un **devis indicatif instantané** (fourchette de prix), puis envoie sa
  demande avec ses coordonnées.
- Dans l'admin → **Réparations** (`/admin/reparations`) : tu gères la liste des types de panne
  et leurs fourchettes de prix, et tu suis chaque demande (Nouvelle → Contacté → En cours →
  Terminée).
- **`/promotions`** : affiche automatiquement tous les produits qui ont un "prix barré" renseigné
  dans leur fiche (champ "Prix barré (promo)").

## 8. Programme Vendeur (affiliation)

- N'importe qui peut créer un compte vendeur sur `/vendeur-inscription` (statut "En attente").
- Tu valides les demandes dans l'admin → **Programme Vendeur** (`/admin/vendeurs`) : Approuver,
  Refuser ou Suspendre. À l'approbation, un **code unique** est généré automatiquement pour ce
  vendeur (ex: `MOH4K7Q`).
- Le vendeur se connecte sur `/vendeur-connexion` et voit son code + ses gains sur `/vendeur`.
- Le montant gagné par le vendeur est défini **par produit**, pas par vendeur : ouvre une fiche
  produit dans l'admin et renseigne le champ **"Commission vendeur (DT)"** (ex: 5 ou 10 DT). Le
  même code d'un vendeur peut donc rapporter des montants différents selon le produit acheté.
- **Important** : la commission n'est générée que si la commande est payée **en ligne**
  (`paymentMethod = CARTE`). Tant que le paiement en ligne n'est pas activé (voir section 6),
  toutes les commandes sont en paiement à la livraison, donc **aucune commission n'est encore
  générée** — le code est bien accepté et enregistré sur la commande, mais le gain ne se
  déclenche qu'une fois le paiement en ligne actif. Aucun changement de code ne sera nécessaire
  ce jour-là : la logique est déjà en place dans `src/app/api/orders/route.ts`.
- Un vendeur de démonstration est créé par le seed : email `vendeur-demo@elitetech.tn`, mot de
  passe `Vendeur123!`, code `DEMO001`. Change-le ou supprime-le avant la mise en ligne réelle.

## 9. Lien avec ta future caisse

La base de données est le pont entre le site et la caisse :

- **`Product`** : un seul produit, un seul stock (`stock`), utilisé à la fois par le site et la
  caisse. Ajoute aussi `purchasePrice` (prix d'achat) et `tvaRate`, utiles pour la facturation.
- **`StockMovement`** : chaque mouvement de stock (vente site = `VENTE_SITE`, vente en
  magasin = `VENTE_CAISSE`, réception = `ENTREE`, correction = `AJUSTEMENT`) est journalisé
  avec sa source. Ta caisse n'a qu'à écrire dans cette même table pour rester synchronisée
  avec le site, et inversement.
- Le logiciel de caisse peut se connecter à la **même** `DATABASE_URL` (ou à un utilisateur
  PostgreSQL séparé avec les mêmes droits) et générer son propre client Prisma (ou tout autre
  ORM/SQL) à partir de `prisma/schema.prisma`.

## 10. Comptes et identifiants par défaut

- Admin : email et mot de passe définis dans `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), créés
  automatiquement lors du `npm run db:seed`.
- Pense à changer le mot de passe admin avant la mise en ligne définitive.

## 11. Structure du projet

```
src/app/                 pages du site (App Router Next.js)
  (site public)          /, /categories/..., /produits/..., /panier, /commande
  admin-login/           page de connexion admin
  admin/                 espace admin protégé (produits, catégories, stock, commandes)
  api/orders/            création de commande (décrémente le stock)
  api/admin/login/       authentification admin
src/components/          composants réutilisables (header, panier, cartes produit...)
src/lib/                 prisma, auth, i18n (dictionnaire FR/AR), formatage
prisma/schema.prisma     schéma de base de données (partagé avec la caisse)
prisma/seed.ts           données de démarrage (catégories, admin, produits d'exemple)
```

## 12. Prochaines améliorations possibles

- Upload de photos produits depuis l'admin (Vercel Blob/Cloudinary)
- Paiement en ligne (dès accord bancaire)
- Notifications SMS/WhatsApp automatiques à la confirmation de commande
- Filtres avancés (marque, prix, caractéristiques) sur les pages catégories
- Export des commandes/stock en Excel depuis l'admin
