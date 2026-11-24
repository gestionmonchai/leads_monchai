# Lot éditorial et mesure — 29 octobre 2026

Les pages publiées restent du HTML statique. Les scripts ne réalisent aucun dépôt
réglementaire et ne déterminent pas l’éligibilité à une aide.

Les sources métier et leurs dates figurent dans les contenus et les fichiers
`outils/aides/contenus.py`, `outils/recolte/interprofessions.json` et `parcours.json`.
Les questions et préparations proposées par Mon Chai sont séparées des règles.
Une date locale non confirmée reste à vérifier dans l’espace de l’organisme.

Après relecture métier des sources, depuis la racine (Python, `beautifulsoup4`) :

```text
python outils/editorial/finaliser-sources.py .
python outils/aides/generer.py .
python outils/editorial/generer-guides.py .
python outils/editorial/integrer-analytics.py .
python outils/editorial/finaliser-metadonnees.py .
python outils/verifier-coherence.py . --strict
node --test outils/test-harmoniser-article.cjs
```

Les scripts de correction des articles secondaires et traductions documentent le
correctif initial. Ils ne remplacent pas une nouvelle vérification du droit.

Sur les pages qui proposent les réglages des cookies, `consent.js` valide le
choix. GA4 `G-2VZ6WQSB52` et GTM `GTM-NDSQV6T7` attendent un accord à la mesure
d’audience, avec les trois autorisations publicitaires à l’état refusé. Les
acceptations antérieures sont renouvelées pour cette extension. Les refus
existants s’appliquent jusqu’à leur échéance.

Le conteneur publié a été vérifié sans balise active lors de l’intégration.
L’administration GTM peut changer ce que le conteneur exécute. Avant de publier
une version, vérifier les finalités, les destinataires et les durées, appliquer
le contrôle supplémentaire `analytics_storage` aux balises d’audience et
vérifier les requêtes dans Tag Assistant. Le flux GA4 direct est déjà configuré
sur le site. Une seconde configuration du même flux fausserait les mesures.

Le refus et l’acceptation sont présentés avec la même visibilité. Le réglage
reste disponible dans le pied de page. Le retrait arrête l’intégration,
supprime les cookies Google Analytics accessibles et recharge les pages déjà
actives, y compris dans les autres onglets. Le bandeau et ses contrôles restent
utilisables au clavier et sur mobile. La recette vérifie le blocage avant choix,
après refus et au retrait, ainsi que le chargement unique après accord.

Une vérification navigateur de la vraie bibliothèque a constaté un seul
`page_view` du flux après acceptation, avec requête de collecte interceptée.
Ce test ne démontre pas sa réception dans la propriété Google Analytics.
Les durées de conservation et fonctionnalités configurées côté Google doivent
être contrôlées dans cette propriété lors de son exploitation.

Les futurs articles passent par `outils/harmoniser-article.cjs` pour reprendre
le footer, les réglages et le chargement conditionnel courant.
