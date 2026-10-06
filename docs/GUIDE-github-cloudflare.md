# Mettre azurvolt.fr sur GitHub + déploiement auto Cloudflare

Durée : 20 à 30 min. Aucune ligne de commande.

---

## Étape 0 — Retrouver les fichiers du site
Il faut les fichiers actuels du site (`index.html`, dossiers des pages, images…).
- Si tu les as sur ton ordinateur : parfait, garde le dossier sous la main.
- Sinon : Cloudflare → **Workers & Pages** → projet azurvolt → **Deployments** → dernier déploiement → onglet **Assets** / « Download » si dispo.
- Si introuvable : dis-le-moi dans le fil, on trouve une autre solution.

## Étape 1 — Créer le dépôt GitHub (5 min)
1. Va sur https://github.com/new (connectée avec `maelysmanceau4-lang`).
2. **Repository name** : `azurvolt-site`
3. **Public** (ou Private, Cloudflare marche avec les deux. Private = ton code n'est pas visible).
4. Coche **Add a README file**.
5. Clique **Create repository**.

## Étape 2 — Mettre les fichiers dedans (10 min)
1. Dans le dépôt : bouton **Add file** → **Upload files**.
2. Glisse-dépose :
   - le dossier préparé `depot-azurvolt` (README, `public/`, `docs/`) fourni dans le fil ;
   - les fichiers du site **dans le dossier `public/`** (la page d'accueil doit être `public/index.html`).
   Astuce : sur ton ordi, copie d'abord les fichiers du site dans `depot-azurvolt/public/`, puis glisse le contenu de `depot-azurvolt` d'un coup.
3. En bas : **Commit changes**.

✅ Contrôle : en ouvrant le dépôt, tu vois `public/index.html`.

## Étape 3 — Connecter Cloudflare Pages (10 min)
> Un projet Pages créé par « glisser-déposer » ne peut pas être relié à GitHub après coup. On crée un **nouveau projet** relié à GitHub, puis on lui transfère le domaine. Le site actuel reste en ligne pendant ce temps.

1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → onglet **Pages** → **Connect to Git**.
2. **Connect GitHub** → autorise Cloudflare → choisis **Only select repositories** → `azurvolt-site` → **Install & Authorize**.
3. Sélectionne `azurvolt-site` → **Begin setup**.
4. Réglages :
   - **Project name** : `azurvolt-site`
   - **Production branch** : `main`
   - **Framework preset** : `None`
   - **Build command** : *(laisser vide)*
   - **Build output directory** : `public`
5. **Save and Deploy**. Attends le ✅ vert.
6. Teste l'adresse fournie (`azurvolt-site.pages.dev`) : le site doit s'afficher à l'identique.

## Étape 4 — Basculer le domaine (5 min)
1. Ancien projet Pages → **Custom domains** → retire `azurvolt.fr` et `www.azurvolt.fr`.
2. Nouveau projet `azurvolt-site` → **Custom domains** → **Set up a custom domain** → `azurvolt.fr`, puis `www.azurvolt.fr`.
3. Cloudflare configure le DNS tout seul (domaine déjà chez Cloudflare). Coupure : quelques minutes max.
4. Bonus SEO (audit) : domaine azurvolt.fr → **SSL/TLS** → **Edge Certificates** → **Always Use HTTPS** = ON (301 http → https).

## Étape 5 — Vérifier l'auto-déploiement
1. Sur GitHub, ouvre `README.md` → crayon ✏️ → ajoute un mot → **Commit changes**.
2. Cloudflare → `azurvolt-site` → **Deployments** : un nouveau déploiement apparaît en 1 à 2 min. ✅

## Étape 6 — Me donner accès
Dans le fil, écris : « dépôt créé : azurvolt-site ».
Je pourrai alors faire les modifs SEO directement (chacune passe par une demande de validation, tu restes maître de ce qui part en ligne).

---

## Checklist finale
- [ ] Fichiers du site retrouvés
- [ ] Dépôt `azurvolt-site` créé
- [ ] Fichiers dans `public/`, `public/index.html` présent
- [ ] Projet Cloudflare Pages relié à GitHub, déploiement ✅
- [ ] `azurvolt-site.pages.dev` identique au site actuel
- [ ] Domaine `azurvolt.fr` + `www` basculés sur le nouveau projet
- [ ] Always Use HTTPS activé
- [ ] Test d'auto-déploiement OK
- [ ] Nom du dépôt envoyé dans le fil
