# Quel viticulteur êtes-vous ? Un millésime Mon Chai

Démo publique `/concours/`, non indexable, sans entrée ajoutée dans la navigation
principale. Le QR existant garde sa destination. Le parcours remplace le défi de
trois ceps par six ateliers concrets et un portrait ludique. Formulaire local,
aucun compte, abonnement, suivi d'audience, enregistrement ou envoi de coordonnées.

## Parcours livré

1. **Taille** : un cep prétaillé en Guyot simple ; couper librement les sarments,
   régler à 1 mm, conserver 2 yeux sur le courson et 6 sur la baguette, supprimer
   les deux superflus en laissant un chicot. Zoom, loupe, clavier et annulation.
2. **Vendanges** : cinq zones de prélèvement parmi neuf, consultation du bilan,
   décision de récolte selon l'objectif de ce lot fictif et sa météo.
3. **Cuve chaude** : lecture des mesures, vanne de refroidissement à ouvrir,
   consigne à régler, contrôle suivant à programmer. La projection n'est pas une
   mesure ni un modèle cinétique réel.
4. **Alerte pendant la malo** : échantillon identifié, analyses à consulter,
   trois actions à ordonner. FA arrêtée, sucres présents et volatile croissante
   sont des signaux d'alerte ; aucune certitude diagnostique ni dose de traitement.
5. **Contrôle de fin de malo** : sur un autre lot où elle était recherchée,
   comparer le papier aux témoins puis demander la confirmation enzymatique.
   Le schéma de chromatographie n'est pas un protocole expérimental.
6. **Ouillage** : matériel et réserve, volume à régler et fermeture à prévoir.
   Une coupe schématique montre le niveau projeté ; élevage sans recherche de voile.

Chaque atelier aboutit à un débrief avec action observée, explication,
enseignement, score et source primaire. Le réessai conserve le premier score,
annoncé dans les règles, le débrief et le résultat. Aucun bonus de vitesse.

Le portrait calcule quatre axes : observation (vendanges et contrôle de malo),
précision (taille), sang-froid (cuve et alerte), préservation (ouillage).
Chaque atelier vaut 100 points, total 600. Les axes sont les moyennes des premiers
scores concernés. Un axe dominant produit un portrait associé ; égalité : portrait
équilibré ; total inférieur à 180 : explorateur. Ce résultat ne caractérise pas
la personne en dehors du jeu et ne mesure pas une compétence professionnelle.

Le résultat réunit les six débriefs consultables, un portrait téléchargeable en
texte sans nom ni e-mail et une surprise explicitement fictive. Le téléchargement
reste sur l'appareil, sans requête réseau. Rejouer remet les scores à zéro.

## Volet UX/UI

- **Entrée** : même QR et même URL ; accueil « Quel viticulteur êtes-vous ? »,
  formulaire prénom, nom, e-mail, domaine facultatif ; profil fictif en un clic.
  Confirmation de démo obligatoire ; option newsletter illustrative décochée.
- **Hiérarchie** : présentation, carte du parcours, situation et geste attendu,
  scène manipulable et outils, validation, explication, étape suivante, portrait.
  Le fil des saisons et le compteur montrent la progression réelle.
- **États** : formulaire vide/invalide, prêt, geste incomplet/valide, paramètres
  inadéquats, débrief correct/partiel/erreur, réessai, pause/reprise, dialogue de
  sortie, résultat et surprise. Le score ne transforme pas une erreur en succès.
  Aucune attente serveur ni permission de compte ; sans JS, formulaire désactivé.
- **Feedback** : compteurs de prélèvement, vanne et consigne visibles, analyses
  débloquées après prélèvement, actions numérotées, mesure enzymatique affichée,
  niveau et dépassement du fût, détails des gestes dans le bilan. Rien ne prétend
  qu'un vin réel a été traité ou qu'un lot a été gagné.
- **Responsive** : scène et outils côte à côte sur grand écran, empilés sur
  téléphone ; validations accessibles sans zone tronquée à 320/390/768/1440 px.
  Les gestes précis sont possibles avec des contrôles numériques au clavier.
- **Accessibilité** : boutons et champs natifs nommés, labels, focus visible,
  titres ciblés lors des transitions, état de vanne annoncé, score en texte,
  progressions nommées, explications repliables natives. Dialogues fermables par
  Échap, retour du focus, pause sur aide et changement d'onglet. Aucun chronomètre.
  Mouvement réduit respecté. Les scènes ont leurs alternatives fonctionnelles.
- **Cohérence** : logo et polices locales Mon Chai, crème/bordeaux pour l'accueil,
  vert forêt pour le parcours ; photographies détourées BevHive et scènes natives
  coordonnées aux commandes. Provenances IA conservées avec les assets réutilisés.
- **Assistant** : procédure complète pour tous les gestes et boutons dans l'aide
  servie à toute étape. Aucune nouvelle route ni fonction dans l'application
  Django de Mon Chai ; sa banque et ses artefacts ne sont pas modifiés.

## Références et limites pédagogiques

Sources primaires consultées le 27 novembre 2026, liées au débrief de l'atelier :

- [IFV : taille en Guyot](https://www.vignevin-occitanie.com/la-taille-longue-de-la-vigne-en-guyot/).
- [IFV : prélèvement de raisins](https://www.vignevin-occitanie.com/prelevement-de-raisins/).
- [IFV : arrêts de fermentation](https://www.vignevin-occitanie.com/les-arrets-de-fermentation-alcoolique/).
- [OIV : suivi des fermentations et protection des vins](https://www.oiv.int/fr/standards/review-of-practices-for-the-reduction-of-so2-doses-used-in-winemaking-).
- [IFV : fermentation malolactique](https://www.vignevin.com/publications/fiches-pratiques/fermentation-malolactique/).
- [IFV : suivi par chromatographie](https://www.vignevin-occitanie.com/suivi-de-la-fermentation-malolactique-ou-fml-dans-les-vins-par-chromatographie/).
- [Notice du fabricant ALLA France, lecture du papier](https://b2b.carles-france.com/upload/products_data/files/Fiche%20techinque%20Chromatographie%20FML.pdf) : ordre des taches du schéma, lactique au-dessus du malique.
- [OIV : ouillage](https://www.oiv.int/public/medias/3519/f-code-ii-34-341.pdf).

Les chiffres, délais, tolérances, barèmes et scénarios sont inventés pour le jeu.
Ils ne sont pas des normes IFV/OIV ni une recommandation d'intervention sur un lot
réel. Le choix de demain pour la récolte répond uniquement à l'ensemble des
conditions fictives données. Les cinq zones symbolisent une campagne de
prélèvements, pas cinq baies. La consigne de 26 °C est le protocole de ce lot,
pas une valeur universelle. L'alerte malo appelle un diagnostic et un protocole
adapté ; le dosage de fin sur l'autre lot est accompagné d'une conclusion de
laboratoire fictive, pas d'un seuil général. L'ouillage est celui d'un élevage
classique sans voile.

La taille conserve le modèle géométrique antérieur : longueur mesurée le long
des sarments, yeux conservés selon la position de coupe ; marge de jeu de 10 à
25 mm sur les bois gardés, chicot de 1 à 3 diamètres pour les suppressions.
Pas de simulation 3D des angles, flux de sève, vitalité ou diagnostic de maladie.

## Vérification

`node --test outils/test-concours-taille.cjs outils/test-concours-parcours.cjs`
vérifie le modèle de taille, les six barèmes, les erreurs de gestes, la distinction
alerte/fin de malo et le calcul borné du portrait. Ces tests tournent dans la CI.

`outils/verifier-concours-parcours.py --sortie CHEMIN` parcourt les six ateliers
sur quatre formats, de l'accueil au portrait : coupe réelle, échantillonnage,
vanne, suivi, plan ordonné et annulation, confirmation enzymatique, volume et
réserve, débriefs, premier score conservé après réessai, téléchargement sans PII,
pause, aide, sortie, aucun stockage ou envoi et formulaire bloqué sans JS.
`--public` reprend le contrôle sur les fichiers publiés. Captures par atelier.

Le formulaire reste explicitement local dans l'inventaire CI des honeypots.
Le vrai concours, ses lots, son règlement, sa collecte et son mécanisme
d'attribution restent distincts de cette démo.
