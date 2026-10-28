# La lettre réglementaire — exploitation sans abonnement supplémentaire

Le site public est statique. Les adresses restent dans Brevo ; aucune liste
d'abonnés, adresse de destinataire ou clé API ne doit entrer dans ce dépôt public.
Ce code ne collecte pas les inscriptions et n'envoie jamais de campagne : il
produit l'e-mail et peut créer un **brouillon** dans le compte Brevo.

## Première activation (nouveau compte Free)

1. Créer le compte Brevo Free pour HALLAIS & BERTHELOT, sans paiement ni achat de
   crédits. Vérifier le compte, l'adresse d'expédition et le domaine monchai.fr.
   Reprendre les enregistrements DKIM demandés et le DMARC existant avec le
   gestionnaire DNS ; ne pas remplacer une politique DNS déjà en place à l'aveugle.
2. Créer une liste dédiée `Lettre réglementaire — inscriptions confirmées`, et un
   formulaire hébergé : e-mail obligatoire, aucune date de naissance, ni téléphone,
   ni demande de justificatif. Case spécifique décochée : « Je souhaite recevoir
   gratuitement la lettre réglementaire Mon Chai du lundi. Je peux me désinscrire
   dans chaque e-mail. » Lien vers la politique de confidentialité.
3. Activer la confirmation double opt-in : aucun abonnement avant le clic reçu
   par e-mail. Une page de confirmation, pas d'e-mail de bienvenue supplémentaire
   si non nécessaire ; les confirmations consomment le quota quotidien. Vérifier
   la preuve de consentement, les refus, doublons et adresses non confirmées.
4. Configurer le désabonnement en français et tester son effet sur la liste et les
   campagnes. Ne jamais réimporter une personne opposée ; conserver seulement la
   preuve d'opposition nécessaire pour l'éviter, à accès limité. Convenir d'une
   purge des inscriptions non confirmées sous 30 jours, des abonnements retirés
   et des preuves. Consigner et vérifier les purges dans l'exploitation.
5. Vérifier contrat/DPA, lieux et sous-traitants effectivement applicables, garanties
   de transfert, conservation et statistiques. Désactiver les suivis d'ouverture
   et de clic si disponibles ; vérifier le message reçu. Le générateur n'ajoute
   ni pixel ni image distante ; il ne contrôle pas les ajouts de Brevo.
6. Avec des adresses de l'équipe : inscription → confirmation → campagne test →
   désabonnement → contrôle de non-réception. Aucun test avec des prospects.
7. Avant l'ouverture, compléter la politique (cinq fichiers contenant le texte
   français), retirer son état « inscriptions pas encore ouvertes » et documenter
   les durées / prestataire validés. Dans `assets/data/newsletter.json`, renseigner
   seulement l'URL HTTPS du formulaire officiel `*.sibforms.com`. Une URL publique
   de formulaire n'est pas une clé API. Tester le lien et publier par la procédure
   habituelle. Aucun formulaire tiers ne se charge avant le clic sur le site.

## Préparer et relire une édition

Copier `exemple.json` vers `editions/AAAA-MM-JJ.json` (date du lundi), puis remplacer
la démonstration par une vraie veille. Aucun exemple n'est une édition validée.
Le statut `relue`, `demonstration: false`, la personne et la date de relecture ne
se renseignent qu'après contrôle. Une source ajoutée dans le JSON n'est pas
automatiquement consultée par le programme : l'éditeur doit réellement la lire.

Sources de départ : Légifrance et JO, EUR-Lex, ministère/BO Agri, Douane,
FranceAgriMer, INAO, ANSES/E-Phy, DGFiP ; compléter les sources régionales et ODG
pertinentes en indiquant le périmètre. Pas de promesse de surveillance exhaustive.
Les domaines autorisés dans le générateur sont une aide de validation, pas une
certification de la pertinence d'un texte.

Pour chaque point : `titre`, `resume`, `statut` (`adopte`, `en_vigueur`, `echeance`,
`projet`, `rappel`), `perimetre`, `publication`, `verification`, `application`,
`action`, `sources` (URLs officielles). La date d'application peut être une date
ou « non adoptée », jamais inventée. La date de publication n'est pas une date
d'entrée en vigueur. `sources_consultees` liste `nom`, `url`, `verifie_le`.
Pour une période sans point notable, rédiger `aucun_changement` en limitant le
bilan aux sources réellement consultées. Au plus dix points ; une lettre lisible.

```powershell
python outils/newsletter/lettre.py outils/newsletter/exemple.json --sortie CHEMIN_TEMPORAIRE
python -m unittest discover -s outils/newsletter -p 'test_*.py' -v
```

Les fichiers `lettre.html` et `lettre.txt` sont des aperçus. Le marqueur de
désabonnement `{{ unsubscribe }}` est résolu par Brevo, pas dans un navigateur.
Le texte accompagne l'HTML pour la relecture ; vérifier/configurer la version
texte dans Brevo lors de l'import ou du contrôle du brouillon.

## Créer le brouillon puis programmer le lundi

GitHub → Settings → Secrets and variables → Actions : secret `BREVO_API_KEY` ;
variables `BREVO_LIST_ID` et `BREVO_SENDER_EMAIL` (expéditeur @monchai.fr validé).
Ne jamais transmettre la clé dans une conversation ou l'inscrire dans un fichier.
Activer la variable `NEWSLETTER_BREVO_ACTIVE=true` seulement après la recette.
Le workflow du vendredi ou son déclenchement manuel lit l'édition relue du lundi.
Il ne remplace pas la relecture éditoriale. Une édition absente ou invalide est
signalée dans Actions et aucun brouillon n'est créé. Sans activation, le job est
ignoré. Les crons GitHub peuvent être retardés ou désactivés après inactivité :
vérifier le résultat dans Actions chaque semaine, utiliser le lancement manuel.

Le script refuse une liste vide, un compte inconnu ou plus de **270 contacts**
(30 envois de marge sur les 300/jour gratuits). Il ne lit jamais les adresses.
Il ne vérifie pas le solde réel du lundi : avant programmation, vérifier dans
Brevo le quota disponible, la taille actuelle de la liste et les autres envois.
Au-delà, ne pas lancer une campagne partielle ni acheter un plan automatiquement.
Le même nom `veille-vignerons-AAAA-MM-JJ` empêche la création d'un autre brouillon,
même après relance. Si le contenu a changé, reprendre explicitement le brouillon
dans Brevo ; le programme ne l'écrase pas. Une panne réseau à la création peut
laisser un résultat indéterminé : regarder Brevo avant toute relance.

Brevo → Marketing → Campagnes → brouillon correspondant : vérifier destinataires,
statuts juridiques, source/date, rendu mobile/desktop, expéditeur, texte brut,
désabonnement et quota. Programmer le lundi à **09:00 Europe/Paris** ; Brevo gère
le changement d'heure. En cas de relecture tardive, utiliser le déclenchement manuel
puis programmer avant le lundi. Si l'information est insuffisante, ne pas envoyer
une lettre non relue pour tenir une cadence.

Ne pas mélanger les inscrits de la lettre produit et ceux de la veille. Les
éventuelles options d'achat ou d'augmentation de quota ne font pas partie du lot.

## Offre installation : traitement manuel

Contact, objet installation → vérifier SIREN, date effective d'installation/reprise
et rôle → demander seulement un justificatif utile si nécessaire → décision écrite.
Consigner dans le dossier commercial à accès limité : SIREN/exploitation, contrôle
effectué, date de demande, attribution antérieure, début/fin des 12 mois et prix de
sortie. Supprimer les pièces après décision, sous 90 jours au plus tard hors litige,
et contrôler cette suppression ; ne pas conserver un dossier MSA ou DJA complet.
L'équipe configure ensuite la facturation convenue dans son outil habituel, avant
de faire accepter la souscription. Ce site ne modifie pas le prix d'un compte.
Un changement de SIRET ne suffit pas à renouveler une attribution.

## UX/UI et recette

Point d'entrée footer / actualités, page autonome sans popup. Inscription fermée
ou lien externe validé, état explicite sans fausse confirmation. Prix et conditions
visibles avant Contact ; accord écrit distinct de l'envoi du formulaire. Design
éditorial Mon Chai, liens natifs et focus, mobile sans débordement. Critères :
configuration nulle/erronée/valide, aucun tiers avant clic, offre → Contact objet
présélectionné et newsletter décochée, erreurs réessayables, fenêtres légales sans
navigation dupliquée. Le guide détaillé et les captures sont archivés dans le
workspace Mon Chai, dossier `docs/editorial/newsletter-installation-2026-10-28`.

Sources : [Free](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan),
[API campagnes](https://developers.brevo.com/reference/create-email-campaign),
[désabonnement](https://help.brevo.com/hc/en-us/articles/209553645-Insert-a-custom-unsubscribe-link-in-your-emails),
[CNIL](https://www.cnil.fr/la-prospection-commerciale-par-courrier-electronique).
