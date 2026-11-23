# Publier sur la page Facebook d'EliteTech

Guide pas à pas pour autoriser la publication automatique, **sans jamais partager
votre mot de passe Facebook**. Le jeton obtenu ne permet que de publier et de lire
les statistiques de la page.

> ⚠️ Un jeton d'accès est un secret, comme un mot de passe. Il ne doit jamais être
> envoyé par message, e-mail ou capture d'écran.

---

## 1. Préparer le compte

Il faut :

- une **page Facebook** (pas un profil personnel) ;
- un **portefeuille Business** : <https://business.facebook.com> ;
- un **compte développeur** : <https://developers.facebook.com>.

Si la page n'est pas encore dans le portefeuille Business :
**Paramètres de l'entreprise → Comptes → Pages → Ajouter → Ajouter une page**.

---

## 2. Créer l'application Meta

1. Ouvrez <https://developers.facebook.com/apps>.
2. **Créer une app** → type **Business** → nom : `EliteTech Publication`.
3. Une fois créée, notez l'**App ID** (visible en haut du tableau de bord).

Aucun produit supplémentaire n'est nécessaire : la publication sur une page que
vous gérez fonctionne sans validation (App Review) tant que c'est votre page.

---

## 3. Créer un utilisateur système

1. <https://business.facebook.com/settings> → **Utilisateurs → Utilisateurs système**.
2. **Ajouter** → nom : `EliteTech Publisher` → rôle **Employé** → Créer.
3. Sélectionnez `EliteTech Publisher` → **Ajouter des actifs**.
4. Onglet **Pages** → cochez votre page → permission **Gérer la page** → Enregistrer.

---

## 4. Générer le jeton

1. Toujours dans `EliteTech Publisher` → **Générer un nouveau jeton**.
2. Application : `EliteTech Publication`.
3. Durée : **60 jours** (ou « jamais » si proposé).
4. Cochez uniquement :
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
5. **Générer le jeton**, puis copiez-le immédiatement (il n'est affiché qu'une fois).

---

## 5. Renseigner le fichier local

Ouvrez `.env.local` à la racine du projet et complétez :

```bash
FB_PAGE_ID="identifiant_de_la_page"
FB_PAGE_TOKEN="le_jeton_copié"
GRAPH_VERSION="v23.0"
```

Pour trouver l'identifiant de la page :

- Business Suite → votre page → **Paramètres de la page → Transparence de la page**,
  ou
- lancez `npm run fb:check` : si `FB_PAGE_ID` est vide et le jeton est un jeton
  utilisateur, le script liste les pages accessibles avec leurs identifiants.

---

## 6. Vérifier la connexion

```bash
npm run fb:check
```

Résultat attendu :

```
Jeton valide. Compte lié : EliteTech (…)
Page : EliteTech (…) — … abonné(s)
Tout est prêt. Simulation : npm run fb:dry | Publication : npm run fb:publish
```

Le script n'affiche jamais le jeton.

---

## 7. Prévisualiser puis publier

Les publications sont décrites dans `scripts/social/posts.json` :

```json
[
  {
    "message": "Texte du post…",
    "images": ["https://www.elitetech.tn/images/products/…webp"],
    "scheduledAt": "2026-11-25T18:00:00+01:00"
  }
]
```

- `scheduledAt` est optionnel : sans date, le post part immédiatement.
- Les images doivent être des **URL publiques** (celles du site conviennent).

Commandes :

```bash
npm run fb:dry      # simulation, rien n'est envoyé
npm run fb:publish  # publication / programmation réelle
```

---

## 8. Révoquer l'accès

À tout moment :

- Business Suite → **Utilisateurs → Utilisateurs système → EliteTech Publisher →
  Révoquer le jeton**, ou
- supprimer l'utilisateur système.

La page et votre compte personnel ne sont pas affectés.

---

## TikTok

La publication automatique TikTok n'utilise pas ce jeton. Elle nécessite :

1. un compte développeur TikTok (<https://developers.tiktok.com>) ;
2. une app avec le produit **Content Posting API**, validée par TikTok ;
3. une autorisation OAuth du compte TikTok.

En attendant la validation, les vidéos verticales et les textes peuvent être
préparés localement puis publiés manuellement depuis l'application TikTok.
