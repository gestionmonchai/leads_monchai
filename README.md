# Branche `file-attente` — publication automatique des articles

Cette branche N'EST PAS déployée (GitHub Pages ne publie que `main`).
Elle contient la file d'attente des articles de la section
« Actualités réglementaires » de monchai.fr, publiés automatiquement.

## Comment ça marche

Chaque **lundi à 06:30 UTC**, le workflow `publier-article.yml` (sur `main`) :
1. lit `manifest.json` et prend le premier article `en_attente` dont la date
   `prevu` est atteinte (un seul par exécution) ;
2. remplace `{{DATE_FR}}` / `{{DATE_ISO}}` par la date du jour dans la page
   et la carte ;
3. copie la page à la racine de `main`, insère la carte en tête de
   `actualites-reglementaires.html` ET du hub de sa catégorie
   `actualites-<categorie>.html` (repères `FILE-ATTENTE`), puis l'URL dans
   `sitemap.xml` ;
4. marque l'article `publie_<date>` dans le manifeste, pousse les deux
   branches et déploie GitHub Pages.

File vide ou aucun article dû → le workflow ne fait rien.
Déclenchement manuel possible depuis l'onglet Actions (avec un mode
« test à blanc » qui montre le diff sans rien pousser).

## Contenu de la branche

- `manifest.json` — ordre, dates prévues, statuts et métadonnées SEO.
- `articles/NN-slug.html` — pages complètes prêtes à publier (dates en
  placeholders) ; `articles/NN-slug.carte.html` — cartes pour l'index.
- `fragments/` + `gabarit/` + `outils/assembler.ps1` — pour produire de
  nouveaux articles : écrire un fragment, compléter le manifeste, lancer
  `pwsh outils/assembler.ps1`.
- `LIGNE-EDITORIALE.md` — garde-fous copyright et règles de rédaction
  (à lire avant d'écrire quoi que ce soit).
- `MOTS-CLES.md` — stratégie mots-clés, suivi Search Console, protocole de
  veille tendances.

## Ajouter des articles à la file

1. Lire `LIGNE-EDITORIALE.md`.
2. Écrire `fragments/NN-slug.html` (structure identique aux existants).
3. Ajouter l'entrée dans `manifest.json` (ordre suivant, `prevu` au lundi
   voulu, `statut: "en_attente"`, `categorie` + `categorie_nom` parmi les six
   catégories existantes — le hub `actualites-<categorie>.html` doit exister
   sur `main`).
4. `pwsh outils/assembler.ps1`, vérifier le rendu, committer sur cette
   branche. C'est tout : la publication suivra le calendrier.

## ⚠ Règle de cohérence avec les déploiements manuels

Le workflow modifie `actualites-reglementaires.html`, `sitemap.xml` et
ajoute des pages à la racine de `main`. **Avant tout déploiement manuel
depuis le dossier de travail local, faire un `git pull` et repartir des
versions du dépôt pour ces fichiers** — sinon le déploiement manuel
effacerait les cartes et URL des articles publiés automatiquement.
