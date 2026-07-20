# Devbook — landing page monchai.fr

Chantier ouvert le 2026-07-16 sur contre-expertise d'un diagnostic ChatGPT.
Source de travail : `Desktop\landing_mail\` (une copie divergente `landing_mail_work/`
existe dans le repo Mon Chai — index.html y diffère ; versions antérieures :
`landing_mail_old`, `landing_final_episode_2`).

## Décision de stratégie (Denis, 2026-07-16)

**Hotfix d'abord, puis refonte mobile, desktop en dernier.**
1. Lot 1 — correctifs mécaniques sans changement visuel (fait, voir ci-dessous).
2. Lot 2 — remettre au premier plan le HTML mobile natif (déjà présent dans
   index.html, `main` masqué par le CSS) et retirer les SVG-maquettes mobiles
   (28 Mo, texte vectorisé : ni sélectionnable, ni indexable, ni accessible).
3. Lot 3 — desktop HTML/CSS responsive sur la même base (**fait**).

## Lot 1 — livré le 2026-07-16

| Correctif | Détail |
|---|---|
| Ancres mortes | `#fonctionnalites`→`#pourquoi`, `#connexion`→`https://tester.monchai.fr/`, zone `FR` (`#langue`) retirée, `#beta`→`#tarifs` (fallback sans JS ; le clic reste intercepté par la modale) |
| Consentement unifié | Nouveau `consent.js` = source unique (remplace `hubspot-consent.js` supprimé + section 11 de `script.js`). Il pousse `doNotTrack` AVANT le traceur HubSpot puis injecte bandeau + panneau de réglages + styles sur les 4 pages. « Gérer mes cookies » fonctionne désormais sur les pages légales (avant : crash JS + modale absente) |
| script.js | Gardes d'existence (`page`, `header`, `barre`, `modal`) ; retiré des 3 pages légales (il ne sert que la landing) |
| HTML invalide | `</body` tronqué de mentions-legales.html corrigé |
| CSS corrompu/mort | styles.css : bloc FAQ (l.1048-1140) supprimé — il était tronqué en plein sélecteur, ce qui avalait la règle `.modal__france` (la ligne 🇫🇷 de la modale est de nouveau stylée) ; règles `.mobile-module-card` contradictoires simplifiées ; CSS cookies déplacé dans consent.js |
| Poids desktop | `loading="lazy"` sur les 6 SVG mobiles : jamais téléchargés en desktop (ils l'étaient malgré `display:none`) |

### Mesures avant / après (harnais `_verification/verif_landing.py`)

| Mesure | Avant | Après |
|---|---|---|
| Poids transféré desktop 1440 px | ~37 Mo | **8,2 Mo** |
| Erreurs JS pages légales | TypeError (script mort) | **0** |
| « Gérer mes cookies » pages légales | aucun effet | panneau ouvre, choix persisté |
| Clic « Découvrir les fonctionnalités » | rien | scroll vers Fonctionnalités |
| Poids mobile 390 px | 27,4 Mo | 27,4 Mo (inchangé → lot 2) |

## Ce qui ne se lit pas dans le diff

- **« Me connecter » pointe sur `https://tester.monchai.fr/`** (l'URL bêta actuelle,
  cf. CSRF_TRUSTED_ORIGINS du repo). À ajuster si l'app change de domaine.
- **Pourquoi consent.js injecte son propre CSS** : les pages légales chargent
  `legal.css`, pas `styles.css` ; le bandeau doit être autosuffisant partout.
  Conséquence : le bandeau s'affiche désormais aussi au premier chargement des
  pages légales (conforme CNIL — avant il n'y apparaissait jamais).
- **Pourquoi `loading="lazy"` suffit côté desktop** : une image lazy jamais
  intersectée (le bloc mobile est `display:none` au-dessus de 820 px) n'est
  jamais téléchargée. Les background-image CSS desktop, eux, n'étaient déjà
  pas téléchargés en mobile (élément non peint).
- **Faute gravée dans footer.svg** : « Mention légales » (sans s). Le SVG n'a
  aucune balise `<text>` (tout est vectorisé) → incorrigeable sans réexport
  Figma. À régler au lot 3 (footer HTML).
- Le formulaire bêta demande le SIRET : **choix assumé** (bêta fermée, le SIRET
  filtre l'éligibilité professionnelle). Ne pas « simplifier » sans décision.

## Lot 2 — livré le 2026-07-16 (mobile 100 % HTML natif)

Cadrage Denis : préserver palette / promesse hero / progression bénéfices →
modules → assistant → offre → à propos / taxonomie des 9 modules / photo
viticole / CTA bêta. Reconstruire librement le reste. `assets/mobile/`
supprimé une fois la parité obtenue.

Fait :
- **Contenu extrait des maquettes avant suppression** (SVG vectorisés rendus
  en PNG puis lus) : textes bénéfices (Centraliser/Suivre/Gagner du temps),
  offre complète (3 étapes, inclusions, **Offre Primeurs 49 € HT/mois pendant
  1 an puis 59 €, +15 €/utilisateur**), assistant (4 puces + conversation
  « cuvée Tradition »), À propos (texte fondateurs + citation). Les
  **portraits de Denis et Laura** ont été extraits des bitmaps base64 du SVG
  (`assets/img/portrait-*.jpg`, 9-11 Ko).
- index.html : bloc `.mobile-reference` supprimé, `main` natif enrichi
  (hero + mini-dashboard, bénéfices, **9 modules en accordéons**, assistant,
  offre 0 € + Primeurs, **À propos créé**, final), nav retargetée + À propos,
  footer enrichi (réseaux sociaux, CGUV, mail).
- script.js : accordéons modules accessibles clavier (aria-expanded, un seul
  ouvert, Échap ferme) ; la taxonomie vit dans le HTML, plus dans le JS.
- consent.js : bandeau compact (12-16 % du viewport, exigence ≤ 25 %),
  « Refuser » = même bouton plein que « Tout accepter » (mesuré identique),
  « Personnaliser » en lien dans le texte.
- Images : variantes compressées `hero-mobile.jpg` (79 Ko) et
  `vignes-mobile.jpg` (100 Ko) pour les fonds mobiles ; les originaux restent
  pour le desktop et l'og:image.
- Emoji 🇫🇷 remplacé par un drapeau SVG inline (s'affichait « FR » sous
  Windows) — aussi dans la modale desktop.
- `assets/mobile/` supprimé : **assets 39 Mo → 12 Mo**.

### Mesures finales (harnais)

| Critère | Résultat |
|---|---|
| Poids initial mobile (cible < 2 Mo) | **0,38 Mo** (était 27,4 Mo) |
| Débordement horizontal 320/360/390/768/820 | aucun |
| Assets maquette chargés | 0 requête |
| Bandeau cookies (cible ≤ ~25 %) | 12-16 % du viewport |
| Refuser vs Tout accepter | dimensions strictement identiques |
| Clavier : cookies, menu, nav, modules, formulaire | tous OK |
| États : menu / module / modale / erreur / succès | tous visibles (captures `etat_*.png`) |
| Desktop 1440 + 3 pages légales | intacts, 0 erreur JS |

Comparaisons avant/après : `_verification/avant_<largeur>.png` vs
`_verification/apres_<largeur>.png` (5 largeurs, pleine page).

## Reste à faire

- Conversion (P1 du diagnostic) : témoignages, FAQ à recréer — à cadrer avec
  la note de positionnement (`Desktop\Note de positionnement et landing\`).
- À la mise en ligne : vérifier `sitemap.xml`/`robots.txt` et l'URL du lien
  « Me connecter » (pointe sur tester.monchai.fr).

## Lot 3 — livré le 2026-07-16 (desktop HTML natif)

- Le contenu HTML enrichi au lot 2 est désormais la source unique sur toutes
  les largeurs. Les textes fonctionnalités, modules, assistant, offre,
  Primeurs, À propos et footer sont présents directement dans le DOM.
- `native-desktop.css` apporte les grilles et la hiérarchie desktop sans
  `transform:scale()` ni positions absolues héritées du canvas 1920 px.
- Les anciens écrans Figma sont conservés temporairement dans
  `<template id="legacyDesktopReference">` pour comparaison : ce contenu est
  inerte, absent de l'arbre rendu et ne déclenche aucune requête d'asset.
- Le header, le footer et leurs libellés sont maintenant du HTML visible. La
  faute gravée dans `footer.svg` n'est donc plus exposée.
- `sitemap.xml` a été actualisé au 16 juillet 2026.

### Mesures finales du harnais

| Critère | Résultat |
|---|---|
| Poids initial desktop 1440 px | **1,78 Mo** |
| Anciens grands SVG chargés | **0 requête** |
| Erreurs JavaScript landing / pages légales | **0** |
| Débordement 320/360/390/768/820 | **aucun** |
| Poids initial mobile | **0,39 Mo** |
| Parcours clavier et états | **tous validés** |

## Lot 4 — livré le 2026-07-16 (audit du lot 3, correctif nav, purge legacy)

Audit contradictoire du lot 3 (rien pris sur parole, tout rejoué) :
l'état annoncé était **conforme** (source unique native, templates inertes,
1 seul h1, 0 asset maquette chargé, doNotTrack avant consentement, hiérarchie
H1→H2→H3 propre, contenu commercial complet sans JavaScript), **sauf un bug** :

- **Débordement horizontal à 821-1080 px** : la nav horizontale du header
  (8 entrées) faisait 958 px de large. Corrigé en gardant le menu burger
  jusqu'à 1199 px ; la nav horizontale n'arrive qu'à `min-width:1200px`
  (elle ne tenait pas non plus à 1081). Vérifié sans débordement à
  821/1024/1199/1200/1280/1440/1920.

Purge du legacy (parité de contenu confirmée par captures avant suppression) :
- index.html : les 3 `<template>` (chrome, dot-nav, écrans Figma) supprimés
  — 37,3 Ko → 26,6 Ko.
- styles.css : canvas 1920 px purgé (.page/.stage, hero absolu, dash-cards,
  #parcours/pq-*, site-header, reading-bar, dot-nav, apropos-faq, #actualite,
  site-footer/footer-liens/.social-links) — 1071 → 457 lignes.
- script.js : fit/scale, header auto-masquant, barre de lecture, dot-nav,
  pq-slots supprimés — 391 → ~250 lignes.
- native-desktop.css : règles `display:none` du legacy retirées.
- Assets orphelins supprimés après vérification globale des références
  (grep sur tous les html/css/js, pages légales incluses) : tout
  `assets/svg/` (9,2 Mo, y compris footer.svg et sa faute « Mention
  légales » désormais sans objet) + `dash-card-bg.png`.
  **assets/ : 12 Mo → 1,9 Mo** (39 Mo au début du chantier).
  Conservés : logo (4 pages), moritz (hero desktop), hero-mobile,
  vignes_2 (og:image + fonds desktop), vignes-mobile, 2 portraits.

### Mesures finales (harnais, après purge)

| Critère | Résultat |
|---|---|
| Poids initial mobile / desktop | **0,35 Mo / 1,74 Mo** |
| Débordement 320→1440 (9 largeurs) | aucun |
| `<h1>` visibles | 1 (hiérarchie H2/H3 logique) |
| Éléments legacy dans le DOM (templates inclus) | 0 |
| Assets maquette chargés | 0 requête |
| Contenu commercial sans JavaScript | complet (tarifs, 9 modules, bénéfices) |
| `_hsq` avant consentement | `[["doNotTrack"]]` |
| Clavier + états + pages légales | tous OK |

### Fichiers à déployer sur monchai.fr

`index.html`, `styles.css`, `native-desktop.css`, `script.js`, `consent.js`,
`legal.css`, `cgu.html`, `mentions-legales.html`,
`politique-confidentialite.html`, `robots.txt`, `sitemap.xml`, `assets/img/`
(7 images). **Ne pas déployer** : `_verification/`, `DEVBOOK.md`.

### Après déploiement

- Vérifier la propriété dans Google Search Console et soumettre
  `https://monchai.fr/sitemap.xml`.
- Contrôler l'URL « Me connecter » (pointe sur https://tester.monchai.fr/).
- Les maquettes Figma restent récupérables dans `landing_mail_old/` et
  `landing_final_episode_2/` sur le Bureau si besoin.

## Vérification

Rejouer : `PYTHONUTF8=1 <repo Mon Chai>/.venv/Scripts/python.exe _verification/verif_landing.py`
(balaye 320/360/390/768/820 px mobile + 821/1024/1200/1440 px desktop :
débordements, poids, h1, legacy DOM, bandeau, parcours clavier, états du
formulaire — EmailJS stubé ; + les 3 pages légales ; captures écrites dans
`_verification/`).
`_verification/` ne doit pas être déployé sur monchai.fr.

## Lot 5 — livré le 2026-07-16 (fidélité Figma en HTML natif)

La direction artistique des exports locaux `landing_final_episode_2` a été
réappliquée sans revenir aux écrans-image : panneau ivoire du hero, formes à
angle droit et grand arrondi, palette bordeaux/or, neuf cartes fonctionnalités,
assistant sur fond végétal, composition photographique À propos, offre en
panneaux et footer bordeaux. Les textes restent tous présents dans le DOM.

FAQ et actualités, visibles dans la maquette mais absentes du lot 4, ont été
ajoutées en HTML sémantique. La FAQ utilise des `details/summary` natifs ; elle
reste lisible sans JavaScript et expose un état ouvert explicite.

### Volet UX/UI

- **Point d’entrée** : navigation sticky desktop et menu burger tablette/mobile,
  avec ancres Pourquoi Mon Chai, Fonctionnalités, Tarifs, À propos et FAQ.
- **Hiérarchie** : promesse et preuve produit dans le hero, bénéfices, neuf
  modules, assistant, offre, fondateurs, réassurance FAQ puis actualités et CTA.
- **États et feedback** : focus clavier conservé, modules et FAQ affichent un
  chevron ou un signe plus/moins, boutons et liens gardent leur retour visuel,
  formulaire et consentement conservent erreur, succès et préférences.
- **Responsive** : cartes empilées sur mobile, grilles intermédiaires sur
  tablette, neuf modules en ligne seulement à partir de 1200 px ; composition
  À propos empilée à 821-1080 px pour éviter tout débordement.
- **Accessibilité** : un seul H1, titres ordonnés, navigation nommée, boutons
  natifs, FAQ native, contenus non essentiels masqués à l’assistance, contraste
  texte/fond maintenu par panneaux opaques ou voiles photo.

### Critères d’acceptation rejoués

| Critère | Résultat |
|---|---|
| Poids initial mobile / desktop | **0,47 Mo / 0,87 Mo** |
| Débordement 320→1440 (9 largeurs) | aucun |
| Erreurs JavaScript | 0 |
| H1 visible / legacy DOM / assets maquette | 1 / 0 / 0 requête |
| Menu, modules, consentement et formulaire au clavier | validés |
| Pages légales et réglages cookies | validés sur les 3 pages |

Les fonds `pourquoi-fond.webp` (79 Ko) et `vignes_2.webp` (107 Ko) sont des
variantes de diffusion optimisées ; `vignes_2.jpg` reste conservé pour
`og:image`. À déployer en plus du lot 4 : les deux WebP dans `assets/img/`.

## Lot 6 — livré le 2026-07-16 (parité avec `landing_final_episode_2`)

La cible réellement présente est `index.html` (`index.htm` n'existe pas). La
référence `landing_final_episode_2/index.html` est restée strictement en lecture
seule : SHA-256
`4c8ce00b401dd7a128ea9c6b66e492ca54344fe28ac1cfa90f7b8f0de01e82c7`.

- Header desktop reproduit depuis l'asset de référence, avec zones de navigation
  HTML nommées et cliquables, barre de lecture et navigation latérale. Il se
  masque à la descente, revient à la remontée et se réinitialise au changement
  de breakpoint.
- Hero et huit séquences desktop recalés sur la scène 1920 px : bénéfices et
  neuf modules, assistant IA, programme bêta/Primeurs, À propos, FAQ,
  Actualité et footer. Le contenu commercial reste du HTML indexable ; les
  photos et pictogrammes ne portent aucun texte essentiel.
- `reference-fidelity.css` isole la composition de référence à partir de
  1200 px. La base mobile/tablette continue d'utiliser le flux natif de
  `styles.css` et `native-desktop.css`.
- Actualité et footer reconstruits en HTML sémantique ; lien CGUV réel, aucun
  lien `#` factice. La FAQ conserve des `details/summary` et une seule question
  ouverte à la fois.
- HubSpot n'est plus présent directement dans aucun HTML. `consent.js` injecte
  `https://js-eu1.hs-scripts.com/147891073.js` uniquement après accord de mesure
  d'audience. Refus et acceptation ont des boutons de dimensions identiques.
- EmailJS est absent au chargement et à l'ouverture de la modale ; il n'est
  demandé qu'après validation complète du formulaire. Les modales bêta et
  cookies piègent le focus, ferment avec Échap et rendent le focus au point de
  départ.

### Volet UX/UI

- **Point d'entrée** : header de référence à partir de 1200 px ; header natif et
  menu burger en dessous. Toutes les entrées ciblent une ancre existante.
- **Hiérarchie** : promesse + preuve produit, clarification des bénéfices,
  modules, assistant, offre, équipe, réassurance FAQ, actualité puis footer.
- **États** : header visible/masqué, repère latéral actif, modules et FAQ
  fermé/ouvert, modales ouverte/fermée, formulaire erreur/envoi/succès,
  consentement absent/refusé/accepté/personnalisé.
- **Feedback** : progression de lecture, focus visible, signes plus/chevrons,
  boutons actifs, erreurs textuelles et confirmation d'envoi.
- **Responsive** : matrice rejouée à 320, 360, 390, 768, 820, 821, 1024,
  1200, 1440 et 1920 px ; aucune barre horizontale. Le canvas proportionnel
  n'est utilisé que pour le chrome/hero desktop, pas pour le texte des sections.
- **Accessibilité** : un H1 visible, titres structurés, contenus essentiels dans
  le DOM, navigation et modales nommées, focus enfermé/restauré, FAQ et modules
  utilisables au clavier, images informatives dotées d'un texte alternatif.

### Critères d'acceptation rejoués

| Critère | Résultat |
|---|---|
| Poids initial mobile / desktop | **0,70 Mo / 1,51 Mo** |
| Débordement 320→1920 (10 largeurs) | **aucun** |
| Erreurs JavaScript | **0** |
| H1 visible | **1** |
| Header, barre et nav latérale desktop | **validés** |
| Menu, modules, FAQ, modales, formulaire | **validés au clavier** |
| HubSpot avant choix / après accord | **0 / 1 injection HTTPS** |
| EmailJS avant action / ouverture / envoi valide | **0 / 0 / 1** |
| Pages légales + réglages cookies | **3/3 validées** |
| Référence source | **hash inchangé** |

Rejouer :
`PYTHONUTF8=1 <repo Mon Chai>/.venv/Scripts/python.exe _verification/verif_landing.py`.
Comparer : `_verification/compare_reference.py` produit les captures 1440/1920,
les superpositions et la différence du hero. Ne pas déployer `_verification/`.

À déployer pour ce lot : `index.html`, `styles.css`, `native-desktop.css`,
`reference-fidelity.css`, `script.js`, `consent.js`, les trois pages légales et
leurs styles, `assets/img/` et `assets/ui/header.svg`. Point d'exploitation à
traiter séparément : auto-héberger les polices si l'objectif devient zéro appel
tiers avant consentement (Google Fonts reste actuellement chargé par le HTML).

## Lot 7 — livré le 2026-07-16 (pictogrammes, typographies et états modules)

Les écarts de finition signalés sur la séquence « Pourquoi Mon Chai » ont été
repris depuis les sources vectorielles de `landing_final_episode_2`, toujours
laissées en lecture seule.

- Les trois cartes Centraliser, Suivre et Gagner du temps utilisent désormais
  leurs assets Figma exacts `pourquoi-carte-1/2/3.svg`. Le texte équivalent
  reste dans le DOM pour l'indexation et les technologies d'assistance.
- Les neuf cartes modules desktop utilisent les 18 SVG exacts, état normal et
  état survolé. La flèche, le trait animé et le panneau à ergot réemploient
  également `fleche.svg` et `encadre.svg` de la référence.
- Le clic fige un module, un second clic le referme, un clic extérieur ou
  Échap ferme l'état. Le survol et `focus-within` exposent le même feedback.
- Sous 1200 px, les accordéons tactiles sont conservés mais les neuf dessins
  simplifiés ont été remplacés par les pictogrammes de la maquette.
- La typographie a été réidentifiée sur les contours vectoriels : Poppins 600
  pour le titre principal de la séquence, Manrope 500 pour son introduction,
  Manrope 700 pour les modules et leurs panneaux. Les cartes vectorielles
  garantissent directement leurs glyphes exacts.
- Inter, Manrope, Playfair Display et Poppins sont maintenant auto-hébergées en
  WOFF2 sous-ensemble dans `assets/fonts/`. Les appels Google Fonts ont été
  retirés de la landing et des trois pages légales.

### Volet UX/UI

- **Point d'entrée** : la navigation Fonctionnalités mène toujours à la
  séquence bénéfices puis modules, sans modifier les ancres existantes.
- **Hiérarchie** : titre, explication, trois bénéfices, séparateur « De la
  vigne à la vente », puis neuf modules ; aucun texte commercial n'est retiré.
- **États** : normal, survol, focus clavier et clic figé sur desktop ; fermé et
  ouvert sur mobile/tablette ; un seul module peut être figé ou ouvert.
- **Feedback** : voile beige, disparition de la flèche, apparition du trait et
  panneau descriptif à ergot sur desktop ; rotation du chevron et déploiement
  du contenu sur mobile.
- **Responsive** : cartes Figma complètes à partir de 1200 px ; pictogrammes
  exacts redimensionnés et accordéons natifs de 320 à 1199 px, sans dépendance
  au survol.
- **Accessibilité** : boutons natifs, `aria-expanded` synchronisé, contenus de
  panneaux présents en HTML, focus visible, fermeture Échap et aucun état
  exclusivement accessible à la souris.

### Critères d'acceptation rejoués

| Critère | Résultat |
|---|---|
| Pictogrammes bénéfices | **3/3 assets exacts** |
| Modules normal / survol | **9/9 + 9/9 assets exacts** |
| Mobile/tablette | **9/9 pictogrammes de la maquette** |
| Survol, focus, clic figé, clic extérieur, Échap | **validés** |
| Polices tierces au chargement | **0 requête** |
| Poids initial mobile / seuil desktop | **1,04 Mo / < 3 Mo** |
| Débordement 320→1920 / erreurs JavaScript | **aucun / 0** |
| Consentement, formulaire et pages légales | **validés** |
| Référence source | **hash inchangé** |

Comparer avec `_verification/compare_reference.py` : captures dédiées de la
séquence, du survol desktop et des modules mobiles ouverts/fermés. Rejouer le
contrôle complet avec `_verification/verif_landing.py`.

À déployer en plus du lot 6 : `fonts.css`, `assets/fonts/`, `assets/svg/`, puis
les versions mises à jour de `index.html`, `reference-fidelity.css`,
`script.js`, `consent.js` et des trois pages légales.
