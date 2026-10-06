# Mettre azurvolt.fr sur Cloudflare Pages (déploiement auto depuis GitHub)

Aucune ligne de commande. Le site actuel reste en ligne jusqu'à l'étape 4.

> Aujourd'hui, azurvolt.fr est servi par le Worker **tiny-mountain-eba4** (fichiers glissés-déposés).
> Le Worker **azurvolt-form** gère le formulaire de contact : **ne jamais le supprimer**.

---

## Étape 1 — Ajouter les 5 fichiers absents de la copie (5 min)
La copie du site (HTTrack) n'a pas récupéré ces fichiers. Sans eux : pas de page « merci » après le formulaire, pas de page 404, logo Google et icônes cassés.

Dans Chrome, pour chaque lien : ouvrir → clic droit → **Enregistrer sous…** (pour les pages : type « Page Web, HTML uniquement »). Garder exactement le nom.
1. https://azurvolt.fr/merci.html → `merci.html`
2. https://azurvolt.fr/404.html → `404.html` (si la page n'existe pas, passer)
3. https://azurvolt.fr/logo-azur-volt-google.jpg
4. https://azurvolt.fr/icon-192.png
5. https://azurvolt.fr/icon-512.png

Puis GitHub → dépôt `azurvolt-site` → ouvrir le dossier **public** → **Add file → Upload files** → glisser les 5 fichiers → **Commit changes**.

## Étape 2 — Créer le projet Cloudflare Pages (10 min)
1. https://dash.cloudflare.com → **Workers & Pages** → **Create** (bouton bleu).
2. Onglet **Pages** → **Import an existing Git repository** (ou « Connect to Git »).
3. **Connect GitHub** → autoriser Cloudflare → **Only select repositories** → `azurvolt-site` → **Install & Authorize**.
4. Choisir `azurvolt-site` → **Begin setup**.
5. Réglages :
   - **Project name** : `azurvolt-site`
   - **Production branch** : `main`
   - **Framework preset** : `None`
   - **Build command** : *(vide)*
   - **Build output directory** : `public`
6. **Save and Deploy** → attendre « Success ».

## Étape 3 — Tester sur l'adresse provisoire (5 min)
Ouvrir `https://azurvolt-site.pages.dev` et vérifier :
- [ ] Accueil identique au site actuel (logo, photos, polices)
- [ ] Menu : 3-4 pages au hasard s'ouvrent (Tarifs, Électricien Cannes, Mandelieu…)
- [ ] `https://azurvolt-site.pages.dev/merci.html` s'affiche
- [ ] Une adresse bidon (`/test-xyz`) affiche la page 404, pas l'accueil

⚠️ Le formulaire **ne marche pas** sur l'adresse `.pages.dev` (sécurité : il n'accepte que azurvolt.fr). Normal. On le teste à l'étape 5.

## Étape 4 — Basculer le domaine (5 min, coupure de 1 à 5 min)
1. **Workers & Pages** → Worker `tiny-mountain-eba4` → **Settings** → **Domains & Routes** → supprimer `azurvolt.fr` et `www.azurvolt.fr` (icône ⋯ → Remove/Delete).
2. **Workers & Pages** → projet `azurvolt-site` → onglet **Custom domains** → **Set up a custom domain** → `azurvolt.fr` → **Continue** → **Activate domain**.
3. Recommencer avec `www.azurvolt.fr`.
4. Attendre le statut **Active** (quelques minutes, SSL compris).
5. Bonus SEO : domaine azurvolt.fr → **SSL/TLS** → **Edge Certificates** → **Always Use HTTPS** = ON.

En cas de souci : remettre les domaines sur `tiny-mountain-eba4` (même menu) → l'ancien site revient.

## Étape 5 — Vérifier en vrai (5 min)
- [ ] https://azurvolt.fr s'affiche (navigation privée pour éviter le cache)
- [ ] https://www.azurvolt.fr s'affiche
- [ ] http://azurvolt.fr redirige vers https
- [ ] Formulaire : envoyer une demande test → page « merci » + e-mail reçu sur contact@azurvolt.fr
- [ ] Test auto-déploiement : GitHub → `README.md` → ✏️ → ajouter un mot → Commit → nouveau déploiement dans Cloudflare → `azurvolt-site` → **Deployments** en 1-2 min

## Étape 6 — Ménage (après 1 semaine sans souci)
- Supprimer le Worker `tiny-mountain-eba4` (Settings → tout en bas → **Delete**).
- **Garder** `azurvolt-form`.
- Google Search Console → **Sitemaps** → soumettre `https://azurvolt.fr/sitemap.xml`.

---

## Ce qui a été corrigé dans la copie du site
- Liens internes propres (`/tarifs/` au lieu de `../tarifs/index.html`)
- Balises canonical et og:url remises en adresses complètes (`https://azurvolt.fr/...`)
- Doublons HTTrack supprimés (`index0de4.html`…), commentaires HTTrack retirés
- `sitemap.xml` recréé (sans les pages légales)
- Pages légales passées en `noindex` via `_headers` (audit, action 5)
