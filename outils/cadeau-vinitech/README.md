# Cadeau discret Vinitech-Sifel

Demande de Denis du 3 novembre 2026. Réservation dédiée fournie par Denis :
https://mon-chai.neetocal.com/demo-vinitech

## Règle et volet UX/UI

- Problème utilisateur : découvrir une invitation au salon et réserver une
  démonstration avec Mon Chai, par une petite surprise dans la lecture.
- Point d'entrée : bouton cadeau de 26 px dans une cible tactile de 44 px,
  placé aléatoirement dans la partie visible du contenu principal, entre 25 et
  30 secondes après le début de la navigation. Exclusions identiques aux
  pop-ups contextuelles : documents légaux, contact, essai, Notes, développeurs,
  démonstrations et iframes. Pas de déplacement d'un texte ou d'un lien existant.
- Hiérarchie : cadeau discret sans message automatique ; au clic, découverte
  volontaire d'une carte « Bien joué, vous l'avez attrapé ! », invitation au
  salon et bouton « Réserver mon créneau ». Le texte relie explicitement
  l'invitation à la réservation d'une démonstration. Aucun tirage au sort,
  montant gagné, compteur de gagnants ou envoi automatique n'est annoncé.
- États : attente ; report si cookies, formulaire, menu ou autre modale actifs,
  ou onglet masqué ; cadeau visible ; esquive ludique ; cadeau stable ; offre
  ouverte ; offre fermée ou agenda ouvert ; campagne terminée. Aucun état de
  chargement distant ou permission : interface publique autonome. Si aucune
  place sûre n'est disponible, le cadeau attend ; stockage indisponible :
  fonctionnement conservé dans le document courant.
- Interaction : à la souris seulement, trois petites esquives au maximum
  pendant au plus 2,5 secondes depuis la première approche. Ensuite le bouton
  reste cliquable. Aucun mouvement d'esquive au clavier, au toucher ou avec
  une préférence de mouvement réduit. Entrée/Espace ouvre immédiatement.
- Position : dans le contenu réellement visible, dans une respiration qui
  évite de masquer les mots, à distance du header, du footer, des liens,
  contrôles et cartes déjà affichés. Le redimensionnement
  recadre le cadeau. Le défilement ne déclenche aucune esquive.
- Feedback : apparition douce unique, cadeau qui s'ouvre et carte en forme
  d'invitation. Croix, Échap et clic sur le fond permettent de refermer.
  Le bouton de réservation ouvre l'agenda dédié dans un nouvel onglet ; aucun
  formulaire n'est envoyé par cette fonctionnalité.
- Fréquence : une apparition par document jusqu'à découverte. Dès l'ouverture
  ou la fermeture volontaire, le cadeau ne réapparaît plus pendant la session
  de l'onglet. L'ouverture ferme la pop-up contextuelle éventuelle et suspend
  les autres invitations commerciales de cette session.
- Responsive : cadeau identique et discret sur téléphone ; carte limitée au
  viewport avec défilement interne, aucun débordement horizontal.
- Accessibilité : label explicite, cible de 44 px, focus visible, aucun vol de
  focus à l'apparition, dialogue natif avec focus piégé et retour au contenu
  à la fermeture. SVG décoratif masqué aux lecteurs d'écran. Effets réduits
  selon `prefers-reduced-motion`. Contrastes bordeaux/crème du site.
- Cohérence : bordeaux, crème, cuivre, Poppins/Inter et arrondis du modèle de
  pop-up existant ; SVG natif, sans nouvelle image ni dépendance.
- Dates : campagne du 3 novembre au 3 décembre 2026 inclus, heure de Paris ;
  arrêt automatique à minuit le 4 décembre. Salon du 1er au 3 décembre 2026 à
  Bordeaux, vérifié sur [le site officiel](https://www.vinitech-sifel.com/).
- Observabilité : événements `cadeau_vinitech_affiche`, `cadeau_vinitech_ouvert`,
  `cadeau_vinitech_reservation`, `cadeau_vinitech_ferme` uniquement avec accord
  de mesure d'audience ; aucune coordonnée du pointeur ni donnée personnelle.
- Périmètre : site statique `leads_monchai`, aucun bouton ou parcours ajouté
  à l'application Django ni à son assistant de procédures.

## Critères d'acceptation

1. Aucun cadeau avant 25 secondes ; apparition au plus tard à 30 secondes si
   la lecture est disponible, avec positions et délais variables.
2. La souris provoque une brève esquive bornée ; clic ensuite fonctionnel.
   Au clavier, au toucher et en mouvement réduit : ouverture immédiate.
3. Le cadeau et sa carte restent dans le viewport sur mobile et ordinateur,
   hors contrôles existants. Croix, Échap et retour de focus fonctionnent.
4. La carte nomme l'invitation, la démonstration et l'agenda dédié exact.
   Elle suspend les pop-ups existantes et n'est plus proposée après découverte.
5. Cookies, saisie, autres modales et onglet masqué sont respectés ; refus de
   mesure sans événement. Pas de cadeau après la fin du salon ni en iframe.
6. Recette navigateur et captures de référence conservées. L'agenda est vérifié
   en lecture seule ; aucune réservation réelle ni envoi n'est effectué.

Recette : `python outils/cadeau-vinitech/verifier_navigateur.py --sortie DOSSIER`.
