# azurvolt.fr

Site vitrine d'Azur Volt, électricien à Cannes et alentours.
Hébergé sur **Cloudflare Pages**, déployé automatiquement à chaque modification de la branche `main`.

## Organisation

```
public/                  ← tout ce qui est en ligne (dossier publié par Cloudflare)
  index.html             ← page d'accueil
  electricien-cannes/    ← une page = un dossier avec son index.html
  ...                    ← autres pages services, villes, tarifs, zones, légales
  styles.css, script.js  ← feuille de style et script (styles-v14 / script-v14 : refonte non publiée)
  *.webp, *.png          ← photos, logo
  merci.html             ← page après envoi du formulaire (noindex)
  robots.txt
  sitemap.xml
  _headers               ← règles Cloudflare (noindex pages légales, cache)
  _redirects             ← redirections 301
docs/                    ← notes, audits, guides (non publiés)
```

Le formulaire de contact est traité par le Worker Cloudflare `azurvolt-form` (hors dépôt) : ne pas le supprimer.

```
```

## Publier une modification
1. Modifier un fichier dans `public/` (sur github.com : crayon ✏️ → « Commit changes »).
2. Cloudflare publie tout seul en 1 à 2 minutes.
3. Vérifier sur https://azurvolt.fr/

## Revenir en arrière
Cloudflare → Workers & Pages → projet → Deployments → choisir une ancienne version → « Rollback ».
