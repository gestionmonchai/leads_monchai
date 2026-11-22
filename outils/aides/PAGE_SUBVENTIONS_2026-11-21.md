# Page de présentation des subventions viticoles

- Problème : l'adresse historique du moteur porte « aides-vignerons » ; Denis
  souhaite une entrée sur les subventions viticoles sans migration avant Vinitech.
- Règle : créer `/subventions-viticulture.html`, un guide de présentation autonome
  avec du contenu utile sur la démarche, le moteur et les données de gestion.
  Ses liens mènent au moteur historique. Ne renommer, rediriger, désindexer ni
  canoniser le catalogue vers la nouvelle page. Pas de redirection automatique.
- P2 : contenu et maillage ; aucune promesse de classement ou d'indexation rapide.

## Préconisation UX/UI

- Point d'entrée : Ressources, page des guides, catalogue et moteur de recherche.
- Hiérarchie : besoin de financement, action vers le moteur, démarche sourcée,
  mode d'emploi, projets, rôle du logiciel, questions fréquentes, action finale.
- États : page publique sans compte, liens fonctionnels avec ou sans JavaScript,
  questions repliées/dépliées. Pas de chargement applicatif, formulaire de demande,
  résultat personnalisé, permission ou état de droit à une subvention.
- Feedback : libellés explicites, destination annoncée, navigation par sommaire,
  retour du moteur vers la présentation. Les conditions sont celles des fiches.
- Données : nombre et date de veille issus du catalogue, date éditoriale séparée.
  Aucun nouveau montant, calendrier, taux ou droit. Les fonctions du logiciel
  présentées sont celles des pages Vigne, Stocks et Ventes existantes.
- Responsive : flux naturel, colonnes repliées sur téléphone, actions lisibles
  sans débordement à 320/390/768/1440 px et en paysage court.
- Accessibilité : un h1, titres structurés, vrais liens, sommaire nommé, images
  avec alternative, cibles de 44 px, focus visible, contraste crème/bordeaux.
- Cohérence : header/footer communs et polices existantes ; deux entrées claires
  dans Ressources : « Subventions viticoles » et « Moteur de subventions ».
- Observabilité : canonique propre et sitemap pour les deux pages, contrôle
  d'absence de refresh/redirection et de noindex, liens réciproques, tests
  navigateur. Après publication : suivre les deux pages et requêtes dans Search
  Console sur 7/28 jours ; le trafic avant Vinitech n'est pas garanti.

## Critères d'acceptation UX/UI

1. La nouvelle page se suffit à elle-même : démarche, utilisation, projets,
   rôle de Mon Chai, limites et FAQ lisibles avant toute navigation au moteur.
2. Le bouton principal ouvre `/aides-vignerons.html#recherche` et le moteur
   conserve sa canonique, ses fiches et ses liens ; pas de migration d'URL.
3. Header et guides donnent accès à la page ; le moteur reste accessible
   directement. Les deux URL figurent une seule fois dans le sitemap.
4. Même contenu visible et indexable sans JS ; FAQ utilisable au clavier,
   aucun débordement, erreur JS ou lien mort ; captures mobile et ordinateur.
5. Générateur reproductible, 257 pages cohérentes et header commun contrôlés.

Références : Google Search Central, migrations d'URL et règles sur les pages
satellites. Cette page comporte un contenu propre et des liens choisis par le
lecteur ; elle ne sert pas de relais automatique vers un autre écran.
https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=fr
https://developers.google.com/search/docs/essentials/spam-policies?hl=fr
