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

La mesure GA4 `G-2VZ6WQSB52` est centralisée dans `assets/js/analytics.js`.
La bibliothèque Google ne charge qu’après accord audience ; la publicité reste
refusée. Une ancienne acceptation doit être renouvelée pour la version GA4.
Le refus enregistré reste respecté. Le conteneur GTM historique est conservé
uniquement sur les pages déjà concernées (`data-gtm`). Ne pas y ajouter une
seconde configuration du même flux. Les démonstrations fictives ne sont pas
instrumentées. `consent.js` porte les réglages et le retrait.

Une vérification navigateur de la vraie bibliothèque a constaté un seul
`page_view` du flux après acceptation, avec requête de collecte interceptée.
Ce test ne démontre pas sa réception dans la propriété Google Analytics.
Les durées de conservation et fonctionnalités configurées côté Google doivent
être contrôlées dans cette propriété lors de son exploitation.

Les futurs articles passent par `outils/harmoniser-article.cjs` pour reprendre
le footer, les réglages et le chargement conditionnel courant.
