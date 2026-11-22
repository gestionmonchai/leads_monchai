# Salons viticoles et cinq guides

Implémentation autorisée par Denis le 22 novembre 2026. Le lot ajoute une page
`salons-viticoles.html`, enrichie de 36 à 73 éditions françaises dont 24 initiatives locales,
cinq guides, le lien Ressources,
la carte des guides et le maillage/sitemap. Aucune route ni fonction Django.

Sources : `evenements.json`, `evenements-locaux.json`, `evenements-valides.json`,
`articles.json` et les cinq fichiers `guide-*.html`.
Les textes de préparation sont des méthodes Mon Chai. Les données d'accès et de
calendrier sont issues des organisateurs, avec un lien et une date de contrôle.
La liste n'est pas exhaustive. Aucun formulaire d'inscription n'est transmis.

## Publication des résultats de veille : contrat UX/UI du 22 novembre 2026

- Problème : la veille produisait un rapport tandis que le moteur public restait
  limité à 36 éditions. Ce lot publie 37 éditions relues sur les sites officiels.
- Entrée et hiérarchie : même moteur, compteur réel, objectifs, région, période,
  commune/département/organisateur, puis fiches et leurs sources. La région
  Bourgogne-Franche-Comté devient disponible pour le rendez-vous de Dijon.
- Données : treize Aux Vignobles!, neuf Mer et Vigne, trois Vitisaveurs et douze
  autres rendez-vous. Les descriptions et conseils sont rédigés par Mon Chai.
  Millésime BIO, Grigny et SITEVI ne sont pas republiés en double. Les pages Mer
  et Vigne d'automne encore datées de 2026 ne deviennent pas des éditions 2027.
  Champagne Week reste un programme de rencontres avec accès 2027 à confirmer ;
  Contrastes garde son lieu annoncé comme incertain.
- États et feedback : compteur et filtres calculés sur les fiches rendues ; dates
  annoncées ou incertaines, lieu à confirmer, admission restreinte, archives, zéro
  résultat, retrait de critère et retour au formulaire de proposition préservés.
- Responsive/accessibilité : composants existants, mêmes fiches et contrôles
  natifs ; recette clavier et cinq formats d'écran. Aucun nouveau parcours ni
  nouvelle route de l'application : son assistant enseigne déjà ce moteur.
- Acceptation : 73 fiches et éléments de liste structurée, aucune ID répétée,
  recherche Aux Vignobles!/Mer et Vigne/Vitisaveurs, région de Dijon correcte,
  commune de La Tour-de-Salvagny distincte de Lyon, mêmes fiches sans JS ; après
  déploiement, vérifier le compteur public et les nouvelles fiches sur mobile.
- Exploitation : le catalogue validé est chargé par le générateur ET la veille,
  puis recopié dans l'outil local. Un rapport de collecte n'est jamais présenté
  comme une publication. La publication suit génération, vérifications et Pages.

## Proposer un salon : contrat UX/UI du 22 novembre 2026

- Problème : un organisateur ne peut pas transmettre un salon absent du moteur.
- Entrée : bouton « Créer un salon » dans le moteur et son état vide ; page
  autonome `proposer-salon.html`, avec retour au moteur.
- Hiérarchie : promesse « proposition → vérification → publication », informations
  du salon, public/conditions exposants, coordonnées privées, récapitulatif relu
  dans le formulaire et envoi explicite. Aucune publication automatique.
- Données : nom, organisateur, source officielle, dates, lieu/commune/code postal,
  région, public, objectif, description et conditions ; nom/e-mail du proposant
  réservés au suivi. Transmission à la messagerie de l'équipe via le service
  EmailJS déjà utilisé par le contact. Aucun ajout dans `evenements*.json` à l'envoi.
  Le formulaire porte `data-hs-do-not-collect` pour être exclu de la collecte
  automatique des formulaires par HubSpot, y compris après consentement audience.
- États : champs requis/invalides, dates incohérentes, envoi en cours, succès après
  réponse positive du service, erreur récupérable avec saisie conservée, fréquence
  excessive, absence de JavaScript. Une erreur réseau n'affiche jamais de succès.
- Feedback : libellés et aides, premier champ invalide ciblé, bouton désactivé
  pendant l'envoi, annonce accessible et confirmation rappelant la validation.
  Après erreur, réessayer ou contacter l'équipe par e-mail.
- Responsive/accessibilité : mêmes couleurs et typographies, trois sections dans
  le flux, une colonne sur mobile, labels natifs/fieldset/legend, focus visible,
  cibles 44 px, compteur de caractères descriptif, pas de fenêtre modale.
- Acceptation : accès depuis le moteur, saisie clavier, refus d'un URL hors HTTP(S),
  d'un e-mail invalide et d'une fin antérieure au début ; un seul envoi en cours ;
  payload contenant tous les champs ; nom/e-mail absents des fiches publiques ;
  échec/réessai et succès vérifiés par interception réseau ; aucune donnée réelle
  transmise par les tests. Recette 320/390/768/1440 px et sans JavaScript.
- Exploitation : l'équipe reçoit une proposition identifiable avec le lien du
  moteur et la source officielle ; après contrôle, elle ajoute la fiche au jeu
  éditorial existant et publie par le circuit du site. Pas de nouvel outil admin.

```sh
python outils/salons/generer.py .
python outils/header/generer.py .
python outils/verifier-coherence.py . --strict --output CHEMIN_TEMPORAIRE/coherence.json
python outils/salons/verifier_navigateur.py --sortie CHEMIN_TEMPORAIRE
node --check assets/js/salons.js
```

Pour régénérer aussi les lots de subventions, exécuter leurs générateurs avant
celui des salons, puis terminer par le header commun. Les modifications de dates
doivent découler d'une vérification réelle ; ne pas mettre à jour seulement le
champ `verifie`. Les pages d'édition ont priorité sur un agenda général, mais
les contradictions observées restent affichées tant qu'elles sont présentes.

## Contrat UX/UI en vigueur

### Extension locale du 22 novembre 2026

- Entrée : même page et même URL, avec accès direct « Événements locaux » dans
  le moteur. Le filtre désigne une initiative d'association ou de vignerons,
  sans promettre une taille, une proximité calculée ni une place d'exposant.
- Hiérarchie : objectif, région/période, recherche par commune, département ou
  organisateur, option locale, compteur et fiches chronologiques. Département
  et organisateur sont lisibles ; lieu et conditions dans le détail.
- États/feedback : option combinable, critère retirable, reset, résultat vide,
  archives et dates non publiées gardent leur fonctionnement. Compteur annoncé.
- Responsive/accessibilité : case native avec label, aide associée, focus
  visible, contrôles dans le flux, aucune nouvelle barre fixe ; recette clavier,
  320 à 1440 px et sans JavaScript.
- Acceptation : recherche « 56 », « Morbihan », « VIN sur VIN » ; combinaison
  local/région/période ; retrait du seul filtre local ; admission restreinte
  explicite ; aucun report automatique d'une date annuelle de 2026 à 2027.
- Sources : organisateurs, communes et offices de tourisme identifiés par fiche.
  La date de vérification appartient au lot contrôlé. Les anciennes fiches
  conservent leur date. Les méthodes de préparation restent éditoriales.
- État partiel : INTERVIN 2027 annoncé sans jours ni lieu ; ne pas reprendre les
  dates 2026 restées sur la page. Les Angles conserve une alerte mars/avril.
  Aucun chargement distant ni permission nécessaire pour filtrer ; une liste
  vide est un résultat de recherche, jamais un échec de collecte masqué.
- Pistes non publiées : VinoTours retenu sur son propre site malgré un annuaire
  encore sans dates ; dates extrapolées des fêtes annuelles refusées. Tournus
  non ajouté à ce lot (site organisateur inaccessible, relais tourisme avec
  deux années différentes). Pont-Audemer non ajouté faute de programme viticole
  assez précis dans les sources consultées. Edern, Cléden-Poher et Quimperlé
  restent hors sélection faute d'édition suffisamment documentée dans ce lot.

- Entrée : Ressources → Salons viticoles ; les cinq guides sont aussi reliés
  depuis les ressources et entre eux. Consultation publique, sans compte.
- Hiérarchie : objectif (particuliers/pros/équipement), région, période, mot-clé,
  compteur, résultats chronologiques, public, détail des conditions et sources.
- États : tous les résultats, critères combinés, zéro résultat, critères
  supprimables, reset, dates annoncées/à reconfirmer/non publiées, édition passée.
- Feedback : nombre dans le bouton et annonce polie ; récupération du vide et
  lien de retour au moteur. Les inscriptions restent chez l'organisateur.
- Données : jours du salon séparés des éventuels délais exposants. SITEVI n'a
  pas de jours inventés. Cinq éditions VI conservent une alerte de contradiction.
  Les coûts non repris restent à demander, sans transformer le badge en stand.
- Archives : le navigateur compare la fin du salon au jour local ; les éditions
  passées sont masquées sauf choix explicite. Un lien direct révèle sa fiche.
  Sans JS, toutes les éditions restent lisibles avec leurs dates.
- Responsive : radios et filtres dans le flux ; une colonne sur téléphone,
  deux sur tablette, trois sur ordinateur. Aucun grand formulaire collant.
- Accessibilité : fieldset/legend, labels, radios natifs, cibles de 44 px,
  focus visible, compteur annoncé, détails natifs et navigation au clavier.
- Guides : titre, introduction, sommaire, intertitres, sources et liens utiles.
  Exemple économique et calcul de stock explicitement fictifs. Les repères
  de prospection sont reliés à la CNIL ; aucune campagne n'est envoyée.
- Cohérence : polices, header, footer, crème/bordeaux et invitation vers la visite
  interactive existants. Aucune recherche transmise par les filtres locaux.

## Acceptation

1. Chaque objectif renvoie les salons pertinents ; le public et l'admission
   restent visibles et ne sont pas déduits d'un nom ou d'un lieu.
2. Une date incertaine conserve sa mention ; le filtre de période n'invente pas
   de mois pour SITEVI. Le passage du temps et la révélation d'archives sont testés.
3. Recherche, retrait d'un critère, reset, zéro résultat et accès au détail
   fonctionnent au clavier. L'index et les guides restent lisibles sans JS.
4. Vérifier 320/390/768/1440 px et paysage 844 × 390, sans débordement ni erreur
   JavaScript ; captures du moteur, du résultat vide et d'un guide.
5. Vérifier les liens, les six canoniques, les métadonnées, le sitemap, la
   génération stable et la version optimisée avant toute publication.

Suivi après publication : requêtes/pages dans Search Console, usages et clics
consentis de la visite selon la mesure existante ; aucun volume SEO ni taux de
conversion n'est promis. La veille automatisée est documentée dans
[veille/README.md](veille/README.md) : collecte quotidienne, rapport et propositions
à valider ; aucune modification automatique des fiches éditoriales.
