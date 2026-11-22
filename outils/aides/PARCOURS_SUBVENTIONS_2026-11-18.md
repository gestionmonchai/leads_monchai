# Subventions, recherche guidée et visite interactive

Problème : le vocabulaire « aides » domine les portes d'entrée et le moteur
arrive après la veille. Les critères sont peu hiérarchisés. L'invitation
commerciale ne conduit pas directement à la visite interactive existante.

P2 : enrichir les titres, descriptions, contenu visible et liens avec le champ
lexical des subventions et financements, sans transformer un prêt ou une
exonération en subvention. Conserver les URL canoniques. Aucune nouvelle revue
réglementaire : dates de contrôle et sources restent celles des fiches.

## Préconisation UX/UI

- Point d'entrée : Ressources, Google, liens du dossier ; invitation contextuelle.
- Hiérarchie : présentation courte, accès au moteur, projet et région en premier,
  mot-clé facultatif, exemples, critères complémentaires, résultats puis fiche
  et source officielle. La veille datée devient secondaire.
- États : tous les résultats, sélection partielle, critères combinés, aucun
  résultat, critères retirés, remise à zéro et JavaScript désactivé. Aucun
  chargement distant ni calcul d'éligibilité ; pas de permission requise.
- Feedback : compteur annoncé, critères supprimables, bouton vers les résultats,
  consigne pour poursuivre auprès du financeur et récupération du résultat vide.
- Données : types de financement distincts, territoires nationaux compatibles,
  outre-mer préservé, statuts et dates vérifiées visibles. La date éditoriale
  du 18 novembre n'est pas une actualisation des dispositifs.
- Responsive : moteur non collant ; seul le repère de résultats reste sous le
  header. Une colonne sur téléphone, deux sur ordinateur, aucun écran recouvert.
- Accessibilité : vrais labels, cibles de 44 px, focus visible, compteur poli,
  clavier et ancre vers les résultats. Sans JS, fiches et liens restent lisibles.
- Cohérence : crème, bordeaux, typographie et cartes du site. Invitation compacte
  existante, croix/Échap, cookies/saisie/modales et fréquence conservés.
- Invitation : visite interactive comme action principale, contact secondaire ;
  explication honnête du domaine fictif, visite en français signalée dans les
  autres langues. Aucun chiffre d'économie dans cette nouvelle invitation.
- Observabilité : événements d'affichage, fermeture et clic visite soumis au
  consentement existant ; aucune recherche ou région envoyée. Comparer le taux
  de clic visite aux affichages consentis. SEO : requêtes subvention(s), aides,
  financement(s), pages, impressions/clics/positions sur 7 et 28 jours complets.

## Critères d'acceptation UX/UI

1. Le moteur précède la veille ; projet/région et exemples conduisent aux fiches.
2. « subvention chai » trouve des subventions pertinentes ; « aides » et
   « financements » restent utilisables. Les prêts gardent leur nature.
3. Combinaisons, aucun résultat, suppression individuelle, reset et liens
   d'étapes fonctionnent. L'outre-mer n'hérite pas des dispositifs métropolitains.
4. Contrôler 320/390/768/1440 px, paysage court, clavier, sans JS et captures.
5. L'invitation mène à /visite-interactive/, attend cookies/saisie, se ferme et
   respecte la session. Aucun tiers contacté sans consentement.
6. Génération reproductible, header commun, cohérence, syntaxe et recette
   navigateur passent avant publication.

Méthode SEO : https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=fr
