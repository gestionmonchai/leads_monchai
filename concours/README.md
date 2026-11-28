# Concours Vinitech : un cadeau dans la vigne

Version du 28 novembre 2026. Point d’entrée et QR inchangés : https://monchai.fr/concours/.

Le concours utilise des instants gagnants : un moment secret est tiré au hasard dans chaque heure d’ouverture, en heure de Paris. Le premier participant valide à partir de ce moment gagne, avec au maximum un gagnant par heure et sous réserve de stock. Un instant non remporté dans son heure n’est pas reporté. Les autres participations sont non gagnantes, sans débit de stock. Une participation par e-mail pour toute l’opération. Le résultat est enregistré immédiatement, gagnant ou non ; la vigne le révèle sans le modifier. Aucun score n’agit sur le tirage.

Le tirage reste fermé sans quantités réelles et sans modalités complètes. Les lots annoncés sont un mois Mon Chai, un emballage Bottleflow et une bouteille de champagne ; leurs références et conditions sont à renseigner par l’organisateur avant ouverture. Les visuels sont des évocations, sans marque de champagne ou caractéristique inventée.

## Service et organisation

Service : https://monchai-concours-vinitech.norbertmoutier.chatgpt.site ; administration : /admin, avec connexion ChatGPT du compte propriétaire autorisé. Source maintenue dans le dépôt privé Sites appgprj_6b0a9f6fe1608191a08a67bb9c0049cc, distinct de GitHub Pages et de Django. Ne pas placer les sources serveur, migrations ou réponses du quiz dans l’artefact public Pages.

L’organisateur ajoute les quantités physiques nouvelles, précise le début, la fin, les horaires quotidiens et les conditions, puis ouvre le concours. Les moments secrets sont préparés côté serveur et ne sont jamais retournés par les API publiques. Fermer puis rouvrir conserve les moments déjà enregistrés. Seul un gain réserve atomiquement une unité : unicité de l’e-mail, du jeton, du lot et de l’heure gagnante imposées par la base. Un double clic ou plusieurs requêtes simultanées ne créent pas de gain supplémentaire. Une participation non gagnante est conservée afin d’empêcher toute nouvelle évaluation après rechargement. Le stock et ses quantités sont privés ; les trois catégories de lots restent visibles sur la page dès l’accueil, sans compteur. Au retrait, rechercher l’e-mail ou la référence, vérifier la personne et marquer remis ; la seconde remise est refusée. Fermeture manuelle immédiate possible. Le public conserve un identifiant opaque dans l’onglet, sans coordonnées en stockage navigateur. Un rechargement retrouve le même résultat, y compris non gagnant ; masquer le résultat n’annule pas la participation.

Les coordonnées sont privées, sans newsletter. L’e-mail est dédoublonné mais sa possession n’est pas vérifiée ; l’unicité de personne doit être vérifiée au stand. Le honeypot et une limite de requêtes ne constituent pas une preuve d’identité. Les coordonnées sont anonymisées à la première utilisation du service après 90 jours suivant la clôture, sans remettre les unités anonymisées à disposition. Le classement exclut les pseudos après 30 jours.

## Les jeux, à part

- Défi chrono : cinq questions, progression du grand public à l’œnologie, saut technique sur le SO₂ moléculaire en question 5. Une question à la fois, correction expliquée et sourcée. Maximum 60 secondes par question, temps autoritaire du serveur. Bonne réponse : 20 × [1 − ln(1+t)/ln(61)], zéro pour erreur ou à 60 secondes, arrondi au centième ; total sur 100. Pseudo public volontaire, top 20 persistant, égalité de rang à score égal. Les premières parties terminées sont affichées d’abord. Rejouer est autorisé, sans avantage sur les cadeaux. Ce jeu ludique n’est pas un examen surveillé.
- Quel vigneron êtes-vous : le millésime guidé reste à /concours/millesime/, avec ses six ateliers et son profil. Il reste local et sans inscription réelle.

## Volet UX/UI

- Point d’entrée : QR /concours/. En premier, le cadeau et le statut réel ; ensuite les jeux et le tableau.
- Hiérarchie : participer, formulaire court, feuillage à éclaircir, cadeau et référence. Quiz dans un écran séparé, une question à la fois. Le profil possède sa page propre.
- États : vérification réseau, non configuré, fermé, épuisé, formulaire invalide, réservation, progression de six rameaux avec sécateur animé, résultat gagnant/non gagnant, reprise, essai sans participation, question ouverte/verrouillée/expirée, score privé/publié, classement vide/chargé/erreur. Administration anonyme ou non autorisée refusée côté serveur.
- Feedback : liste des lots sans quantités, statut du concours, confirmation et référence, question N/5, chrono et score, explication après réponse, publication confirmée. Le sécateur suit la souris sur une surface tactile précise et se referme au clic ; sur téléphone, il apparaît brièvement au toucher. Les boutons sont désactivés pendant les demandes. Les premiers résultats serveur sont conservés lors des reprises.
- Données : points au centième, chrono en secondes, fin en heure de Paris, pseudos publics séparés des coordonnées privées, quantités en unités, sources OIV/IFV après correction.
- Responsive : deux colonnes puis une ; jeux empilés sur téléphone ; dialogues défilants. Vérifié à 320/390/768/1440 pixels sans débordement horizontal.
- Accessibilité : contrôles natifs, labels, focus visible, Échap pour fermer les dialogues, texte avec les couleurs de correction, mouvement réduit. Alternatives clavier Éclaircir un rameau et Révéler directement. Le chrono est réservé au défi facultatif ; aucun délai de manipulation dans le concours.
- Cohérence : logo et polices locales Mon Chai, vocabulaire du vigneron. Le lien Besoin d’un coup de main enseigne chaque commande. Des unités d’assistant applicatif et le réentraînement dense accompagnent cette livraison, sans nouvelle route Django.

Critères d’acceptation : aucun cadeau sans configuration ; 45 participations simultanées après un instant donnent exactement un gagnant et 44 non-gagnants, pour un seul lot décompté ; e-mail et reprise uniques ; double retrait refusé ; aucun score ou chrono client accepté ; cinq questions progressives et correction entre chaque ; publication d’un pseudo uniquement après accord ; aucun e-mail ou nom dans le tableau public ; parcours complet sur les quatre largeurs ; captures de référence dans le dossier de livraison.

## Direction visuelle et provenance

Inspiration éditoriale : Teso La Monja par Miguel Recio (https://miguelrecio.es/projects/tesolamonja), composition viticole Masseto (https://www.behance.net/gallery/168227819/Wine-Website-Design). Interprétation originale : bordeaux profond, titres amples, vert végétal et tons papier. Aucun asset tiers copié. Les objets cadeaux sont dessinés en CSS.

Feuillage original généré avec la compétence imagegen et le moteur intégré, fond transparent conservé. Asset servi : assets/feuilles-vigne.png ; prompt et provenance : assets/provenance-feuilles.json. Le bois et les fils sont un SVG natif ; douze rameaux indépendants, six gestes pour découvrir le centre. Le bouton d’essai révèle uniquement une confirmation de geste, jamais un faux lot.

## Validation

Syntaxe JS, tests du millésime et cohérence du site dans CI. Recette navigateur : outils/verifier-concours-vigne.py (lecture publique et essai sans attribution par défaut ; parcours local complet via --api loopback). Service : trois tests de barème et exposition, TypeScript, build Vinext, recette HTTP des réservations concurrentes et de l’administration. Aucun lot ni pseudo de QA publié sur le service hébergé. Les fixtures de temps sont exclusivement locales et ne modifient jamais l’horloge système.

## Sécateur animé et instants gagnants

Un SVG natif en deux parties constitue le pointeur sécateur. Les deux lames pivotent autour de la vis à chaque coupe, avec un éclat bref. Le pointeur reste décoratif (pointer-events:none), masqué hors feuillage, à l’ouverture d’un dialogue, au défilement et à la perte de focus. Les commandes clavier et la révélation directe restent disponibles. Le mouvement réduit remplace l’animation par une fermeture instantanée. Aucun asset raster supplémentaire n’est requis.

Critères ajoutés : aucune quantité dans le DOM de statut ou la réponse publique ; aucun moment secret exposé ; un maximum d’un gain par heure même avec demandes concurrentes et anciens gains ; résultat non gagnant stable après le passage de l’instant ; horaires hiver/été en heure de Paris ; migration additive, ancien stock et anciennes réservations conservés.
