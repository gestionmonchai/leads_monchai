# Mon Chai Concours : démo Vinitech

Page autonome `/concours/`, non indexable, sans lien ajouté à la navigation
principale. Le QR code SVG téléchargeable pointe vers
`https://monchai.fr/concours/`. Aucun traceur, stockage ou envoi de coordonnées.
Le formulaire reste désactivé sans JavaScript. Les lots sont explicitement fictifs.

## Parcours et UX/UI

- Entrée : URL directe ou QR, aide « Comment jouer ? » disponible à toute étape.
- Hiérarchie : promesse, formulaire prénom/nom/e-mail, entreprise facultative,
  consentement à la démo obligatoire, option newsletter illustrative décochée.
  Un profil fictif permet l'essai sans donnée personnelle.
- États : formulaire vide/invalide/valide, règles, partie active, paire trouvée,
  erreur de paire, pause, temps écoulé, victoire, surprise fermée/ouverte et rejeu.
  Aucun chargement serveur ni compte requis ; données indisponibles sans JS.
- Feedback : 4 paires à trouver en 30 secondes, cartes nommées lorsqu'elles sont
  retournées, progression annoncée, score et résultat de démo explicites.
  Les informations saisies ne sont jamais reproduites dans le résultat ou une URL.
- Responsive : formulaire sous la présentation sur téléphone ; grille 4 × 2,
  boutons tactiles, contrôles conservés à 320/390/768/1440 px.
- Accessibilité : contrôles natifs, labels, focus visible et transmis aux titres,
  dialogs fermables par Échap avec retour du focus, symboles SVG accompagnés de
  noms, état retourné via aria-pressed, feedback role=status ; chronomètre évitable,
  pause manuelle ou automatique lors du changement d'onglet et ouverture d'aide.
  L'aide ferme sur une partie toujours en pause : reprise volontaire.
  Mouvement réduit respecté. Les animations ne conditionnent aucune action.
- Cohérence : logo, polices locales Inter/Playfair, crème et bordeaux Mon Chai.
  Aucun pop-up commercial pendant le jeu.
- Assistant : aide de procédure intégrée à la page pour chacun des boutons.
  Cette simulation publique du dépôt vitrine n'ajoute aucune route ni fonction
  à l'application Django et ne modifie pas sa banque ou ses artefacts de recherche.

## Acceptation et vérification

`outils/verifier-concours.py --sortie CHEMIN` vérifie les formats et le parcours
réel dans Chromium : validation, coordonnées fictives, aide, mode sans durée,
pause/reprise, victoire, surprise, rejeu, expiration et absence de transmission.
`--public` reprend le contrôle sur la page publiée. Captures dans le dossier
de sortie ; test sans JavaScript du fieldset désactivé.

Le formulaire est classé local dans l'inventaire CI des honeypots.
Le QR est généré avec qrcode, sans service tiers.

Les lots, modalités de participation et attribution, collecte réelle et suivi
des gagnants restent à définir avant une version destinée aux participants.
Le score ne simule pas un mécanisme de tirage réel.
