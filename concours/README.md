# Concours Vinitech : quiz simple, tirage indépendant

Demande du 27 novembre 2026 : mettre le parcours de métier de côté, présenter
les trois lots annoncés et revenir à un jeu très simple. Denis souligne le risque
que les participants confondent performance et chances de gagner.

Le quiz est une animation facultative de cinq questions, sans chronomètre.
Une bonne réponse donne un point personnel, accompagné d'une courte explication.
Aucun classement, rang ou highscore public n'est affiché.

## Principe proposé et état de démonstration

Une participation valide par personne, indépendamment du score, du fait de jouer
ou non, du nombre de parties et de la vitesse. Le formulaire précède le quiz.
Passer le quiz, obtenir 0/5 ou 5/5 et rejouer conservent chacun le même indicateur
de participation simulée. Le résultat rappelle que seul le futur tirage attribue
les lots. Aucun « ticket bonus », seuil de bonnes réponses, faux gagnant ou lot
attribué immédiatement.

Cette version reste une démo : les coordonnées ne sont ni envoyées ni stockées,
aucune participation réelle n'est enregistrée, aucun tirage n'est exécuté.
Le compteur vaut un dans l'onglet, ce n'est pas un mécanisme serveur d'unicité.
Le règlement, dates, dédoublonnage, conservation des participations, tirage
auditable, notification et caractéristiques précises des lots restent à établir
pour l'opération réelle. Ne pas présenter la démo comme un concours ouvert.

Lots annoncés par Denis, distincts des anciens exemples du parcours archivé :

- Un mois Mon Chai offert : formule et conditions à préciser.
- Un emballage Bottleflow : format et quantité à préciser.
- Une bouteille de champagne : référence à préciser.

Aucune valeur, marque de champagne, formule d'abonnement, quantité Bottleflow
ou condition d'attribution supplémentaire n'est inventée. L'essai demande une
confirmation de majorité, vu le lot alcoolisé, sans collecter de date de naissance.
Il n'y a aucun abonnement marketing dans cette démo.

## Volet UX/UI et acceptation

- **Entrée** : même `/concours/` et même QR. Logo et charte Mon Chai ; message
  score/tirage visible avant le formulaire, avant le quiz, à chaque question et
  au résultat. Les lots sont présentés comme ceux de la future opération.
- **Hiérarchie** : coordonnées, participation simulée, choix de jouer ou passer,
  une question avec trois réponses, explication courte, résultat. Les commandes
  principales ont une seule fonction explicite. Aucun système de guidage à apprendre.
- **États** : formulaire vide/invalide/valide, prêt, quiz passé, question ouverte,
  réponse correcte/incorrecte verrouillée, suite, arrêt anticipé, résultat et rejeu.
  La démo est explicitement nommée ; sans JS les champs et l'envoi restent désactivés.
- **Feedback** : question N sur 5, score personnel, réponse expliquée après le clic,
  texte et couleur pour distinguer le résultat, aucun passage automatique. Toutes
  les fins montrent le même principe de participation ; score masqué si quiz passé.
- **Récupération** : aide accessible partout et fermable par Échap, modification
  des coordonnées, arrêt du quiz à tout moment, rejeu sans créer de bonus.
- **Responsive** : accueil sur deux colonnes puis une sur mobile ; carte de quiz
  centrée, choix tactiles de 44 px minimum, pas de débordement à 320/390/768/1440 px.
- **Accessibilité** : contrôles natifs, labels, focus visible et transmis au titre
  puis à l'action suivante, résultat annoncé, progression nommée, pas de timer,
  mouvement réduit respecté. Le score ne dépend pas d'une rapidité de manipulation.
- **Assistant** : « Le principe du jeu » enseigne formulaire, profil fictif,
  jouer/passer, répondre, continuer, arrêter, rejouer et revenir au formulaire.
  Aucune nouvelle fonction ou route de l'application Django ni changement de sa banque.
- **Critères** : vérification navigateur des trois issues 0/5, 5/5 et quiz passé,
  toutes avec une participation simulée ; arrêt, rejeu, aide, téléchargement QR,
  absence de requête d'envoi/stockage et archive accessible sans ressource manquante.

## Ancien parcours conservé

Le millésime guidé est conservé en entier sous `/concours/millesime/`, sans lien
ajouté à la navigation principale. Sources, assets, modèle, explications et
provenances sont déplacés, avec adaptation des liens et des polices communes.
Ses tests de modèle restent en CI ; son script de recette cible désormais cette
URL. Son ancien contenu et ses lots d'exemple restent ceux de cette archive.

## Vérifications

`node --test outils/test-concours-quiz.cjs` vérifie l'indépendance entre score et
participation, le quiz passé, le rejeu, le verrouillage et les entrées invalides.
Les 12 tests du millésime et de la taille restent exécutés sur les sources archivées.

`outils/verifier-concours-quiz.py --sortie CHEMIN` teste les quatre formats,
les trois scores/choix, l'arrêt, le rejeu et l'aide ; contrôle aucun envoi,
stockage ou erreur JS, blocage sans JS et démarrage réel de l'archive.
`--public` reprend les contrôles sur les fichiers servis.

## Références de conception

Le choix de ne pas afficher de highscore est un choix de clarté dans cette
opération, pas l'affirmation qu'un classement serait interdit. La présentation
doit rester cohérente avec le mécanisme annoncé. Repère consulté le 27/11/2026 :
[DGCCRF, loteries publicitaires et loyauté](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/loterie-des-pratiques-commerciales-reglementees?language=fr).
La future collecte devra informer les participants de ses conditions ; aucune
prospection ne doit être imposée pour jouer :
[CNIL, organisation de jeux-concours](https://www.cnil.fr/fr/cnil-direct/question/organisation-de-jeux-concours-que-faire),
[CNIL, parrainage et jeux-concours](https://www.cnil.fr/sites/cnil/files/atoms/files/commerce-donnees_perso_parrainage_jeux_concours.pdf).

Les questions s'appuient sur les repères déjà vérifiés pour le millésime : taille
et prélèvements IFV, fermentation alcoolique, ouillage OIV, et positionnement de
Mon Chai sur le site vitrine. Elles n'impliquent aucun geste œnologique à réaliser.
