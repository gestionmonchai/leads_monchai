# Protection des formulaires publics, 22 novembre 2026

Demande : protéger les formulaires du site contre le remplissage automatique.
Les sept formulaires d'envoi Mon Chai possèdent déjà un piège : demande d'accès,
Contact dans cinq langues et proposition de salon. Le prototype Passerelle possède
un champ `fax`. Ce lot ajoute une garde commune et un inventaire bloquant en CI.

## Volet UX/UI

- Entrée : formulaires publics d'envoi existants, sans nouveau bouton visible.
- Hiérarchie : champs et actions inchangés ; le piège reste hors écran, hors
  tabulation, exclu des lecteurs d'écran et de l'autocomplétion.
- États : piège vide, rempli, absent par erreur de gabarit ; saisie normale et
  erreurs du formulaire conservent leur fonctionnement. La garde bloque avant
  les gestionnaires d'envoi, sans confirmation trompeuse ni requête réseau.
- Feedback : aucun changement pour un humain. Un formulaire mal configuré produit
  une erreur de configuration en console, sans coordonnées ; le contrôle de
  couverture empêche sa publication. Un piège rempli est ignoré silencieusement.
- Responsive/accessibilité : aucune place occupée dans la page, aucun focus ou
  champ annoncé en plus. Vérifications clavier et mobile/ordinateur.
- Données : aucune donnée du piège n'est collectée par la garde et aucun événement
  d'analyse n'est envoyé. Les champs métier réels, notamment le site web du
  prototype, ne servent jamais de piège.
- Acceptation : un piège rempli n'entraîne aucun appel EmailJS/API ; une saisie
  normale reste envoyable ; retirer le piège bloque l'envoi et fait échouer la
  couverture ; chaque nouveau formulaire doit être protégé ou explicitement
  classé comme recherche/simulation locale, sans transmission.

Les recherches de subventions/salons et les deux simulations de visite ne
transmettent pas de demande et sont classées comme locales. Les formulaires métier
de l'application authentifiée ne sont pas modifiés par le script de la vitrine.
Le contrôle serveur du contact Django et le piège avec jeton signé de l'inscription
ont été vérifiés dans le dépôt applicatif ; leurs protections sont conservées.

Un honeypot réduit les robots qui remplissent tous les champs ; il ne garantit
pas l'absence de spam. Les délais et limites de fréquence existants restent actifs.
Un script appelant directement le prestataire peut contourner une garde JavaScript.
Aucun formulaire privé ou service d'e-mail n'est reconfiguré dans ce lot.

Le script `outils/verifier-honeypots.py` couvre tous les fichiers HTML du site et
teste les formulaires dans Chromium en interceptant les envois. Aucun message réel
n'est transmis. Exécuter avec `--inventaire` pour le contrôle statique en CI.
