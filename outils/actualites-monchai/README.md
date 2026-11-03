# Quatre articles pour l'actualité de Mon Chai

Publication demandée par Denis le 3 novembre 2026 : Mon Chai Notes, incubation
au Poool, WineTech Coffee et présence à Vinitech-Sifel.

## Volet UX/UI

- Point d'entrée : les quatre cartes secondaires « Notre actualité » de
  l'accueil français. Chaque titre et chaque carte mènent à un article.
- Hiérarchie : fil d'Ariane, catégorie, dates, titre, introduction, illustration,
  intertitres courts, informations pratiques, une action adaptée, sources et
  liens vers les trois autres actualités. La page produit Mon Chai Notes reste
  accessible depuis son article et conserve son URL de téléchargement.
- États : articles publics statiques, lisibles sans JavaScript et sans compte.
  Pas de chargement, permission ou erreur métier ajoutés. Les liens externes
  sont nommés et aucun formulaire, téléchargement ou agenda n'est déclenché
  automatiquement. Une image indisponible conserve son alternative textuelle.
- Feedback : carte soulignée au survol, focus clavier visible, lien de retour
  vers les actualités. Les libellés masqués de la navigation latérale restent
  hors de la zone cliquable des cartes. Pas de bouton inactif pour un replay
  non confirmé.
- Données : nouvelles publications datées du 3 novembre 2026 ; l'article Poool
  conserve sa publication du 13 octobre et affiche sa mise à jour. Les dates
  des événements et de disponibilité sont distinguées des dates des articles.
- Responsive : gabarit éditorial fluide existant, images bornées, titres de
  cartes pouvant revenir à la ligne, aucune grille de texte figée.
- Accessibilité : un h1 par page, hiérarchie h2 cohérente, lien d'évitement,
  focus visible, contrastes de la charte, dimensions d'images déclarées et
  légendes qui distinguent les illustrations des images des partenaires.
- Cohérence : header, footer, consentement et styles des articles existants.
  Actualités de l'entreprise séparées des actualités réglementaires ; aucune
  nouvelle catégorie réglementaire ni route Django.
- Observabilité : liens, ancres, ressources et footer contrôlés par la garde
  de cohérence existante ; parcours accueil vers quatre articles, retours et
  affichage vérifiés dans un navigateur sur mobile et ordinateur.
- Périmètre linguistique : articles et cartes de l'accueil français. Les autres
  versions du site ne reçoivent pas de traduction non demandée.

## Critères d'acceptation

1. Chaque carte de l'accueil français ouvre son propre article et les quatre
   articles figurent au sitemap et se relient entre eux.
2. L'article Notes explique la validation, l'accès Android et le besoin de
   connexion pour transcription et envoi, avec lien vers la page produit.
3. Le Poool et La WineTech sont présentés avec des sources officielles ; le
   WineTech Coffee n'est plus annoncé comme futur, sans promesse de replay
   YouTube dont l'URL n'est pas confirmée.
4. Vinitech-Sifel affiche les dates et le lieu officiels ainsi que l'agenda
   dédié fourni par Denis. Aucun numéro de stand nouveau n'est extrapolé.
5. Aucun tarif ou avantage de l'offre close le 31 octobre n'est présenté comme
   encore disponible dans les contenus modifiés. La carte principale de
   l'actualité renvoie à l'essai courant.
6. Pas de débordement à 320, 390, 768 et 1440 px ; cartes accessibles au
   clavier, images et liens valides, métadonnées Article cohérentes.

## Sources relues le 3 novembre 2026

- Notes : `monchainotes.html`, page produit actuellement publiée. Compte et
  accès mobile requis ; validation explicite ; transcription et envoi en ligne.
- Poool : [annonce de la 9e promotion du 29 septembre](https://lepoool.tech/9-projets-innovants-integrent-la-9e-promo-dincubation-du-poool-x-french-tech-rennes-st-malo/),
  [programme d'incubation](https://lepoool.tech/incubation-x-le-poool/) et
  [mission de l'association](https://lepoool.tech/notre-mission/).
- WineTech Coffee : [compte rendu publié le 8 octobre par La WineTech](https://fr.linkedin.com/pulse/nous-avons-particip%C3%A9-au-winetech-coffee-voici-ce-quil-faut-17qoe),
  [publication de l'organisateur avec intervention de Denis](https://fr.linkedin.com/posts/la-winetech_winetech-monchai-winerebelion-activity-7513870416403156992-4E1z)
  et [présentation de La WineTech](https://fr.linkedin.com/company/la-winetech/).
  La participation est passée ; la date exacte de diffusion et un lien direct
  YouTube ne sont pas déduits. Le compte rendu écrit est proposé directement.
- Vinitech-Sifel : [site officiel, 1er au 3 décembre 2026 à Bordeaux](https://www.vinitech-sifel.com/).
  Réservation : https://mon-chai.neetocal.com/demo-vinitech, lien fourni par Denis.
