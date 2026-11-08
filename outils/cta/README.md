# Invitations contextuelles du site vitrine

## Formulations du 8 novembre 2026

Demande de Denis : utiliser « économies » et « heures économisées », y compris
dans les actions, sans employer « gain » dans les cartes. Le budget annuel
2 400 € devient le chiffre principal, avec son équivalent 200 €/mois ; les
unités indiquent explicitement la période. Le bouton propose « Découvrir en
démo » et ses traductions ; la récolte conserve sa démo chronométrée.

La composition visuelle validée le 8 novembre, les conditions, la portée des
objectifs, les liens et la fréquence restent ceux décrits. Vérifier la largeur
du montant annuel à 320/390/768/1440 px et sur écran court. La recette contrôle
le texte rendu, la période, le calcul annuel/mensuel et les libellés traduits.
Les descriptions ci-dessous constituent l'historique des versions précédentes.

## Version du 7 novembre 2026

Cette version remplace les textes génériques par une accroche de problème,
un grand chiffre explicitement qualifié d'objectif, sa portée et une action.
La description du 2 novembre ci-dessous est historique ; les critères de
fréquence, consentement, exclusions et clavier restent applicables.

Objectifs : 7 h/semaine sur la gestion globale, 200 €/mois sur les outils
remplaçables (2 400 €/12 mois), défi de préparation de récolte en 30 s sur
données déjà saisies. Ce ne sont pas des résultats mesurés par cette recette.
Le contrôle et le dépôt officiel sont distincts. La vidéo récolte n'existant
pas encore, cette carte mène à une demande de démonstration chronométrée.
Le film MCP de 33 s, stocks/impayés, est proposé pour Stocks, Assistant et
présentation générale. La fermeture d'une carte vidéo accompagne sa navigation.

### UX/UI et acceptation

Sujet et douleur en tête, objectif en grand bloc bordeaux, condition lisible
avant le mécanisme, puis démo personnalisée ou vidéo réelle. Sept sous-thèmes
d'aides ; pas de promesse d'attribution ou de nouvelle échéance. Le chiffre des
gains hebdomadaires reste global au domaine, jamais additionné par module.

Carte crème/bordeaux de 480 px sur ordinateur, marges de 12 px sur téléphone,
sans colonne photo. Hauteur plafonnée ; corps défilant sur écran court, fermeture
et deux actions toujours disponibles. La portée n'est jamais masquée sur mobile.
Titres, labels, annonce polie, focus non volé, retour de focus, cibles de 44 px,
contraste et préférence de mouvement sont conservés. Sans vidéo, aucune
destination fictive ; contacts et essai utilisent leurs parcours existants.

Accepter uniquement si les scénarios de la recette passent : 15 rubriques,
7 sous-thèmes d'aides, réglementation et ressources, chiffres/portées, vidéo et
hash de diapositive, langue, consentement, stockage refusé, focus et fermeture,
320/390/768/1440 px et écrans courts. Les événements consentis ajoutent la
variante et le type d'objectif ; le clic vidéo est distinct du clic démo.

La campagne Vinitech, le délai de 20 s et les exclusions restent ceux existants.
Aucune nouvelle fonction ni route dans Django ; aucun envoi de formulaire
n'est réalisé par les tests. Aucun média vidéo n'est préchargé par une invitation.

## Description historique du 2 novembre

Modification du 2 novembre 2026 : `assets/js/cta-popup.js` remplace la carte
générique par une invitation adaptée à la rubrique. Les pages existantes
chargent la version `20261103-invitation-7s`. Les fiches d'aides sont aussi couvertes.

## Comportement et UX/UI

- Point d'entrée : pages publiques du site, 20 secondes après le début de la
  navigation. Le défilement et la sortie de souris ne déclenchent rien.
- Hiérarchie : titre métier, une phrase explicative, « Essayer Mon Chai », puis
  « Demander une démonstration ». L'essai rejoint le parcours applicatif existant ;
  la démonstration ouvre le formulaire de contact, objet « démonstration » déjà
  sélectionné, dans la langue de la page. Rien à saisir dans l'encart lui-même.
- Données affichées : messages fixes, adaptés à la récolte (dont ses 23 fiches
  régionales), aux tarifs, à la DRM, à la vigne, à la cave, aux stocks, aux mises,
  aux ventes, aux coûts, à l'œnotourisme, à l'assistant, au changement de logiciel
  et aux aides. Les traductions proposent une invitation générale localisée.
  Aucun gain chiffré, prix ou promotion datée n'est ajouté.
- États : attente initiale ; report pendant une saisie, un choix de cookies,
  une modale ou une navigation mobile ouverte, ou dans un onglet masqué ; carte
  visible ; fermeture définitive pour la rubrique pendant la session ; pause
  de toutes les cartes après un clic d'essai ou de démonstration. Pas d'état
  vide, chargement distant, lecture seule ou permission : contenu public fixe.
- Feedback : croix et touche Échap referment immédiatement la carte. Une
  navigation vers l'action choisie utilise le parcours existant, qui gère ses
  propres erreurs. Aucune fenêtre bloquante ni fermeture de page.
- Fréquence : une apparition par rubrique et par session d'onglet, quel que
  soit le changement de langue. Le stockage indisponible n'empêche pas le
  fonctionnement ; la limitation reste alors valable pour le document courant.
- Responsive : carte en bas à droite sur ordinateur (510 px, volet visuel et
  contenu), marges de 12 px sur téléphone et volet visuel converti en bandeau.
  Hauteur maximale de 45 % de l'écran, 55 % sur les téléphones de moins de
  700 px de haut ; défilement interne si nécessaire.
- Accessibilité : fermeture et liens d'au moins 44 px, focus visible, annonce
  polie, pas de déplacement de focus à l'apparition. Si le focus est dans la
  carte à la fermeture, il revient au contenu. Mouvement réduit respecté.
- Cohérence : reprise du modèle local « Pop-up inscription.png » : fond crème,
  vigne estompée dans un volet, titre Poppins bordeaux et accent cuivre,
  séparateurs fins, boutons en pilule et ombre diffuse. Les visuels et le logo
  proviennent des assets déjà publiés. Sans image chargée, le fond crème et le
  texte restent lisibles. Les images décoratives sont masquées aux lecteurs
  d'écran. Le bouton principal porte une flèche décorative.
- Exclusions : contact, essai, documents légaux, Mon Chai Notes, développeurs,
  démonstrations, visite interactive et pages incluses dans une iframe.
- Observabilité : `cta_popup_affiche`, `cta_popup_essai`, `cta_popup_demo`,
  `cta_popup_ferme` avec `cta_campagne` ; uniquement si le consentement de
  mesure d'audience est donné. Le refus des cookies n'empêche pas la carte.
- Périmètre : site statique `leads_monchai`, aucune route ni fonction ajoutée
  dans l'application Django ou son assistant de procédures.

## Critères d'acceptation

1. Avant 20 secondes, aucune carte, même après défilement ou sortie de souris.
2. Après 20 secondes, bon titre pour la rubrique et deux destinations valides.
3. Cookies, formulaire et modale actifs retardent la carte ; elle peut ensuite
   apparaître. Les pages exclues n'en montrent jamais.
4. Croix, Échap, retour de focus et fréquence par rubrique fonctionnent ; un
   clic d'action suspend les invitations restantes pour la session.
5. La carte tient dans les viewports de 320, 390, 768 et 1440 px, avec des
   contrôles accessibles et sans déplacement de focus à son apparition.
6. Le refus d'audience bloque les événements ; les quatre langues secondaires
   et le stockage indisponible restent utilisables.

Recette reproductible : `python outils/cta/verifier_navigateur.py --sortie DOSSIER`.
Elle utilise Playwright déjà installé, un serveur local temporaire, une horloge
contrôlée et bloque toutes les requêtes externes. Aucun formulaire n'est envoyé.
