# Mon Chai Concours : Le geste juste, démo de taille

Page autonome `/concours/`, non indexable, sans lien ajouté à la navigation
principale. Le QR code SVG téléchargeable pointe vers
`https://monchai.fr/concours/`. Aucun traceur, stockage ou envoi de coordonnées.
Le formulaire reste désactivé sans JavaScript. Les lots sont explicitement fictifs.

## Parcours et UX/UI

- Entrée : URL directe ou QR, aide « Comment jouer ? » disponible à toute étape.
- Hiérarchie : promesse, formulaire prénom/nom/e-mail, entreprise facultative,
  consentement à la démo obligatoire, option newsletter illustrative décochée.
  Un profil fictif permet l'essai sans donnée personnelle.
- États : formulaire vide/invalide/valide, règles, cep à tailler, sarment
  sélectionné, position de coupe, coupe confirmée, annulation, bilan, cep suivant,
  pause, temps écoulé, résultat, surprise fermée/ouverte et rejeu.
  Aucun chargement serveur ni compte requis ; données indisponibles sans JS.
- Feedback : 3 ceps prétaillés en Guyot simple, objectifs baguette/courson/superflus,
  compteur des yeux réellement conservés, distance de coupe en millimètres,
  loupe, avertissement si œil menacé, score détaillé et résultat fictif explicite.
  Les informations saisies ne sont jamais reproduites dans le résultat ou une URL.
- Responsive : formulaire sous la présentation sur téléphone ; scène et panneau
  de précision côte à côte sur ordinateur, empilés sur mobile. Scène zoomable et
  déplaçable, panneaux lisibles à 320/390/768/1440 px. Le réglage fin rend la
  précision indépendante de la taille de l'écran et du zoom.
- Accessibilité : contrôles natifs, labels, focus visible et transmis aux titres,
  dialogs fermables par Échap avec retour du focus, choix des sarments par boutons
  A/B/C/D, curseur accessible et boutons ±1 mm, feedback role=status ; chronomètre
  de 3 minutes facultatif, désactivé par défaut,
  pause manuelle ou automatique lors du changement d'onglet et ouverture d'aide.
  L'aide ferme sur une partie toujours en pause : reprise volontaire.
  Mouvement réduit respecté. Les animations ne conditionnent aucune action.
- Cohérence : logo, polices locales Inter/Playfair, crème et bordeaux Mon Chai,
  scène hivernale vert forêt et bois naturel. Visuel botanique BevHive à l'accueil,
  source IA et provenance conservées ; aucune déduction botanique depuis ce visuel.
  Aucun pop-up commercial pendant le jeu.
- Assistant : aide de procédure intégrée à la page pour chacun des boutons.
  Cette simulation publique du dépôt vitrine n'ajoute aucune route ni fonction
  à l'application Django et ne modifie pas sa banque ou ses artefacts de recherche.

## Acceptation et vérification

`outils/verifier-concours-taille.py --sortie CHEMIN` vérifie les formats et le
parcours réel dans Chromium : sélection par coordonnées à 150 % de zoom,
géométrie coupée et nombre d'yeux, annulation, pas de 1 mm, trois ceps à 300/300,
surprise, rejeu, dialogue de sortie, pause/reprise, expiration et aucun envoi.
`--public` reprend le contrôle sur la page publiée. Captures dans le dossier
de sortie ; test sans JavaScript du fieldset désactivé.

Le formulaire est classé local dans l'inventaire CI des honeypots.
Le QR est généré avec qrcode, sans service tiers.

Les lots, modalités de participation et attribution, collecte réelle et suivi
des gagnants restent à définir avant une version destinée aux participants.
Le score ne simule pas un mécanisme de tirage réel.

## Modèle de taille et limites de l'exercice

Les sarments, nœuds et bourgeons sont calculés à partir de courbes mesurées.
L'ancien bois fructifère est réputé retiré avant l'exercice. Le vieux bois
permanent est protégé des coupes. Les ceps demandent respectivement 6, 7 et 5 yeux
sur la baguette, 2 sur le courson. Ils illustrent trois objectifs de charge et
une disposition en miroir ; ce ne sont pas des prescriptions universelles.

Le nombre d'yeux est calculé sur la longueur effectivement restante du sarment.
La coupe est libre, sans aimantation sur une réponse. Réglage à 1 mm, loupe,
taille directe sur le bois et commandes clavier partagent le même modèle.
Le sarment est visuellement tronqué à la position choisie, avec section de coupe.
Les coupes se font après confirmation et peuvent être annulées avant validation.
La validation arrête le temps pendant le bilan. Aucun bonus de vitesse.

Par sarment : 14 points pour le bon nombre d'yeux (7 retirés par œil d'écart),
8 points pour une marge conforme, 3 points pour une coupe effectuée, 0 si non taillé.
Pour les bois conservés, l'objectif du jeu est une marge de 10 à 25 mm au-dessus
du dernier œil, hors zone de 4 mm autour d'un œil ; pour les suppressions,
chicot de 1 à 3 diamètres. Ces tolérances sont des choix de simulation explicités
dans l'interface. Pas de simulation d'angle 3D, flux de sève, vitalité ou maladie.

Référence primaire consultée le 27 novembre 2026 :
[IFV Occitanie, taille longue en Guyot](https://www.vignevin-occitanie.com/la-taille-longue-de-la-vigne-en-guyot/).
Repères repris : rôle du courson à deux yeux, position basse du renouvellement,
adaptation de la charge à la vigueur et évitement des plaies rases. Les marges
de précision et le barème ne constituent pas une norme IFV.

`node --test outils/test-concours-taille.cjs` vérifie les limites près des yeux,
les conversions géométriques, la coupe rase et les scores à 0/100/300.
