'use strict';

globalThis.MonChaiFonctions = {
  "features": {
    "parcelles": {
      "title": "Définir ses parcelles",
      "text": "Deux zones d’une même parcelle ne se conduisent pas toujours de la même façon. Sur le fond cadastral, Mon Chai permet de définir parcelles et sous-zones avec leurs caractéristiques, pour identifier précisément le lieu des travaux.",
      "image": "../demonstration-2/assets/captures/parcelle-parametrage.jpeg",
      "stage": "Définir",
      "kind": "capture",
      "href": "/vigne-vendanges.html",
      "proof": "Paramétrage de parcelles sur fond cadastral · Capture historique, parcelles de test",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "portrait": false,
      "conditions": "Selon les modules activés",
      "observation": "Repérez le contour de la parcelle et la fiche qui décrit ses caractéristiques."
    },
    "journal-cultural": {
      "title": "Retrouver les interventions",
      "text": "Quand les passages se succèdent, difficile de reconstituer la saison de mémoire. Le journal Mon Chai réunit dates, parcelles et travaux enregistrés pour retrouver l’historique des interventions.",
      "href": "/vigne-vendanges.html",
      "image": "../demonstration-2/assets/captures/journal-cultural.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Suivre les travaux",
      "conditions": "Selon les modules activés",
      "observation": "Retrouvez une intervention avec sa date et la parcelle concernée."
    },
    "annonce-materiel": {
      "title": "Chercher ou proposer du matériel",
      "text": "Quand il manque une pompe ou qu’un équipement peut être prêté, les caractéristiques et les conditions doivent être claires. Dans le pilote Annonces, préparez une page à partager pour préciser ce que vous cherchez ou proposez.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "Pilote · Sur activation",
      "flow": [
        "Matériel recherché ou proposé",
        "Caractéristiques et conditions",
        "Relecture",
        "Annonce partageable"
      ],
      "proof": "Schéma explicatif · Parcours à titre d’exemple",
      "stage": "Préparer le matériel",
      "conditions": "Annonces · Module pilote, selon activation",
      "observation": "Ce schéma explique le parcours ; il ne constitue pas une capture du logiciel."
    },
    "annonce-vendanges": {
      "title": "Préparer l’équipe des vendanges",
      "text": "Le poste, le lieu et les conditions des vendanges doivent être clairs pour les candidats. Le pilote Annonces vous aide à les préciser, à relire l’annonce puis à partager une page.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "Pilote · Sur activation",
      "flow": [
        "Besoin saisonnier",
        "Poste et conditions",
        "Relecture",
        "Page à partager"
      ],
      "proof": "Schéma explicatif · Parcours à titre d’exemple",
      "video": "annonces",
      "stage": "Préparer l’équipe",
      "conditions": "Annonces · Module pilote, selon activation",
      "observation": "Ce schéma explique le parcours ; il ne constitue pas une capture du logiciel."
    },
    "suivi-maturite": {
      "title": "Suivi de maturité",
      "text": "Choisir la date de récolte demande de reprendre les relevés au fil des passages. Mon Chai les rassemble pour suivre l’évolution de la maturité ; l’interprétation des mesures et la décision restent au domaine.",
      "href": "/vigne-vendanges.html",
      "image": "../demonstration-2/assets/captures/suivi-maturite.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Décider la récolte",
      "conditions": "Selon les modules activés",
      "observation": "Comparez les relevés enregistrés avant la discussion sur la récolte."
    },
    "vendanges": {
      "title": "Vendanges",
      "text": "Pendant les réceptions, perdre le lien entre un apport et son encuvage complique le suivi du vin. Mon Chai rassemble les réceptions, les poids et les encuvages pour retrouver le parcours enregistré du raisin.",
      "href": "/vigne-vendanges.html",
      "image": "../demonstration-2/assets/captures/vendanges.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Réceptionner",
      "conditions": "Selon les modules activés",
      "observation": "Repérez l’origine et le poids d’un apport, puis son encuvage enregistré."
    },
    "notes-dictee": {
      "title": "Dicter une opération",
      "text": "Une opération à noter alors que la suivante vous attend déjà : dictez ce qui a été fait depuis votre téléphone. Mon Chai Notes prépare une saisie à relire.",
      "image": "../demonstration-2/assets/captures/notes-dictee.png",
      "stage": "Dicter",
      "kind": "capture",
      "href": "/#nouveautes",
      "proof": "Mon Chai Notes · Android · Dictée d’une opération, exemple de transfert",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "portrait": true,
      "video": "notes",
      "conditions": "Selon les modules activés",
      "observation": "La dictée prépare une fiche ; elle ne valide pas encore l’opération."
    },
    "notes-completer": {
      "title": "Compléter la fiche",
      "text": "Une dictée peut laisser une référence ou une quantité à préciser. Mon Chai Notes signale les informations manquantes dans la fiche : vous la complétez avant de passer à la vérification.",
      "image": "../demonstration-2/assets/captures/notes-completer.png",
      "stage": "Compléter",
      "kind": "capture",
      "href": "/#nouveautes",
      "proof": "Mon Chai Notes · Android · Fiche individuelle à compléter",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "portrait": true,
      "conditions": "Selon les modules activés",
      "observation": "Les références et quantités manquantes sont à compléter avant la vérification."
    },
    "notes-verifier": {
      "title": "Vérifier, puis envoyer",
      "text": "Un contenant, un volume ou une date mal repris peuvent modifier le sens d’une opération. Mon Chai Notes vous laisse relire et corriger la fiche avant de valider son envoi dans l’application.",
      "image": "../demonstration-2/assets/captures/notes-verifier.png",
      "stage": "Vérifier et envoyer",
      "kind": "capture",
      "href": "/#nouveautes",
      "proof": "Mon Chai Notes · Android · Vérification d’un transfert avant envoi",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "portrait": true,
      "conditions": "Selon les modules activés",
      "observation": "Vérifiez contenants, volume et date avant de confirmer l’envoi."
    },
    "notes-activite": {
      "title": "Retrouver le statut de sa saisie",
      "text": "Après l’envoi, comment savoir si la saisie a été prise en compte ? L’activité de Mon Chai Notes distingue les éléments à vérifier, en attente, à corriger ou synchronisés ; vous retrouvez ce qu’il reste à reprendre.",
      "image": "../demonstration-2/assets/captures/notes-activite.png",
      "stage": "Retrouver le statut",
      "kind": "capture",
      "href": "/#nouveautes",
      "proof": "Mon Chai Notes · Android · État synchronisé d’une saisie",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "portrait": true,
      "conditions": "Selon les modules activés",
      "observation": "Le statut distingue une fiche à reprendre d’une saisie synchronisée."
    },
    "clients": {
      "title": "Préparer le prochain contact",
      "text": "Après un salon, une relance est plus utile quand on retrouve ce qui a été convenu. Dans Mon Chai, reprenez le contact, les vins recherchés et les échantillons à prévoir pour préparer la prochaine rencontre.",
      "stage": "Reprendre le contact",
      "kind": "schema",
      "flow": [
        "Contact et échanges",
        "Attentes à qualifier",
        "Rendez-vous et échantillons"
      ],
      "href": "/ventes-clients.html",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "proof": "Schéma explicatif · Préparation de la prospection",
      "conditions": "Selon les modules activés",
      "observation": "Ce schéma explique le parcours ; il ne constitue pas une capture du logiciel."
    },
    "mcp": {
      "title": "Vos stocks et vos impayés, dans Claude",
      "text": "Avant une proposition ou une relance, il faut retrouver les stocks et les factures impayées. Posez la question dans Claude : le connecteur MCP consulte les données de Mon Chai et restitue ces informations, en lecture seule.",
      "stage": "Consulter stocks et impayés",
      "kind": "capture",
      "image": "/assets/img/demo-mcp.webp",
      "video": "mcp",
      "href": "/#nouveautes",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "proof": "Film Mon Chai dans Claude · Stocks et impayés · 33 s",
      "portrait": true,
      "conditions": "Connecteur en lecture seule, selon activation",
      "observation": "Deux questions, deux résultats : les cuvées presque épuisées, puis les factures impayées. Lecture seule."
    },
    "devis": {
      "title": "Préparer une offre individuelle",
      "text": "Les prix et quantités convenus doivent devenir une offre que le client peut relire. Dans Mon Chai, préparez un devis avec le destinataire, les vins, les quantités, les prix et les conditions avant de le partager.",
      "image": "../demonstration-2/assets/captures/devis-individuel.webp",
      "stage": "Faire une offre",
      "kind": "capture",
      "href": "/ventes-clients.html",
      "proof": "Formulaire d’un devis · Capture historique, données de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "portrait": false,
      "conditions": "Selon les modules activés",
      "observation": "Retrouvez le destinataire, les vins, les quantités et les prix dans une même offre."
    },
    "commandes": {
      "title": "Retrouver les commandes convenues",
      "text": "Après plusieurs échanges, il faut retrouver la commande convenue et son montant. Mon Chai rassemble les commandes clients pour reprendre le suivi commercial à partir de ce qui a été enregistré.",
      "href": "/ventes-clients.html",
      "image": "../demonstration-2/assets/captures/commandes.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Suivre l’engagement",
      "conditions": "Selon les modules activés",
      "observation": "Retrouvez la commande et son montant à partir des informations enregistrées."
    },
    "plan-cave": {
      "title": "Plan de cave",
      "text": "Avant de déplacer un vin ou de préparer une réception, il faut savoir quels contenants sont occupés. Le plan de cave Mon Chai montre les cuves et leur remplissage pour situer les vins.",
      "href": "/cave-vinification.html",
      "image": "../demonstration-2/assets/captures/plan-cave.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Situer les vins",
      "conditions": "Selon les modules activés",
      "observation": "Repérez les contenants, leur occupation et leur remplissage enregistré."
    },
    "operations-cave": {
      "title": "Journal des opérations",
      "text": "Pour reprendre le suivi d’un lot, il faut comprendre ce qui a déjà été fait. Le journal Mon Chai rassemble les opérations de cave et les lots concernés pour retrouver les interventions enregistrées avant de préparer la suite.",
      "href": "/cave-vinification.html",
      "image": "../demonstration-2/assets/captures/operations-cave.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Suivre les opérations",
      "conditions": "Selon les modules activés",
      "observation": "Retrouvez les lots concernés par une opération déjà enregistrée."
    },
    "analyses-oenologiques": {
      "title": "Analyses œnologiques",
      "text": "Avant un échange avec l’œnologue, il faut retrouver les mesures du bon lot. Mon Chai rassemble les analyses et les états de surveillance pour préparer cet échange avec les résultats enregistrés.",
      "href": "/cave-vinification.html",
      "image": "../demonstration-2/assets/captures/analyses-oenologiques.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Contrôler les mesures",
      "conditions": "Selon les modules activés",
      "observation": "Rattachez le résultat consulté au bon lot, avant l’échange avec l’œnologue."
    },
    "degustation-creation": {
      "title": "Préparer une dégustation",
      "text": "Quand plusieurs vins et millésimes se succèdent, chaque avis doit rester associé à la bonne cuvée. Créez une session Mon Chai avec son nom et sa sélection de vins pour situer chaque dégustation.",
      "href": "/oenotourisme.html",
      "kind": "capture",
      "image": "../demonstration-2/assets/captures/degustation-creation.jpeg",
      "proof": "Créer une session de dégustation · Capture historique, données fictives",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Préparer la session",
      "conditions": "Selon les modules activés",
      "observation": "La sélection de vins rattache la session aux cuvées qui seront goûtées."
    },
    "degustation-visiteur": {
      "title": "Une dégustation courte ou guidée",
      "text": "Tout le monde n’a ni le même temps ni les mêmes mots pour parler d’un vin. Mon Chai propose une note rapide ou un parcours guidé — observation, arômes, bouche et avis — pour recueillir le ressenti de chacun.",
      "href": "/oenotourisme.html",
      "kind": "capture",
      "image": "../demonstration-2/assets/captures/degustation-visiteur.png",
      "portrait": true,
      "proof": "Parcours visiteur · Capture du site de test · 29 octobre 2026",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Faire déguster",
      "conditions": "Selon activation du module dégustation",
      "observation": "Le visiteur choisit une note rapide ou un parcours guidé avant de donner son avis."
    },
    "degustation": {
      "title": "Retrouver les sessions et les retours",
      "text": "Une fois les visiteurs repartis, les impressions recueillies peuvent être difficiles à retrouver. Mon Chai conserve les sessions et leurs retours pour reprendre la lecture des avis après la dégustation.",
      "href": "/oenotourisme.html",
      "kind": "capture",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "image": "../demonstration-2/assets/captures/degustation-sessions.webp",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "stage": "Retrouver les retours",
      "conditions": "Selon les modules activés",
      "observation": "Les sessions et retours permettent de reprendre la lecture après la rencontre."
    },
    "phyto": {
      "title": "Intrants et registre phytosanitaire",
      "text": "Reconstituer une intervention après la saison demande de retrouver produit, parcelle, date et quantité. Le registre Mon Chai rassemble les données enregistrées, avec des filtres par année ou parcelle et un export pour reprendre cet historique.",
      "href": "/registre-phyto-numerique-2027.html",
      "kind": "capture",
      "image": "../demonstration-2/assets/captures/registre-phytosanitaire.webp",
      "proof": "Registre phytosanitaire · Données fictives de démonstration",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "stage": "Retrouver les interventions",
      "conditions": "Selon les modules activés",
      "observation": "Les filtres et les lignes du registre rattachent produit, date, quantité et parcelle."
    },
    "trace-matiere": {
      "title": "La traçabilité dans une fiche de vin",
      "text": "Une origine à expliquer ? Ouvrez la fiche du vin : parcelles, vendanges, lots et mises y sont reliés jusqu’au produit fini.",
      "href": "/stocks-tracabilite.html",
      "kind": "capture",
      "image": "../demonstration-2/assets/captures/trace-produit-fiche.png",
      "proof": "Exemple logiciel · Cabernet d’Anjou 2022 · Onglet Traçabilité",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "wide": true,
      "stage": "Remonter à l’origine",
      "conditions": "Selon les modules activés",
      "observation": "Suivez les colonnes : parcelles → vendanges → lots techniques → mises → produit fini. C’est cette chaîne enregistrée que l’on peut examiner."
    },
    "trace-aval": {
      "title": "Ouvrir le dossier d’un lot",
      "text": "Un lot est parti : à quels destinataires et avec quelles pièces ? Depuis la liste, ouvrez son dossier pour retrouver les destinations, quantités et opérations enregistrées, puis exporter ces éléments en CSV ou PDF.",
      "href": "/stocks-tracabilite.html",
      "kind": "capture",
      "availability": "Fonction du logiciel · Conditions à vérifier",
      "image": "../demonstration-2/assets/captures/lots-commerciaux.webp",
      "proof": "Liste des lots commerciaux · Point d’entrée vers le dossier détaillé",
      "stage": "Suivre les sorties",
      "conditions": "Selon les modules activés",
      "observation": "La capture est la liste d’entrée. Le dossier détaillé et ses exports s’ouvrent ensuite dans le logiciel."
    },
    "api-catalogue": {
      "title": "Vos vins, du logiciel au site",
      "text": "Quand un prix change, le reprendre sur le site et dans le logiciel crée une double mise à jour. Une future API pourrait publier une sélection de vins, formats et tarifs depuis Mon Chai, selon des règles à construire.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "Projet · API à construire",
      "flow": [
        "Sélection dans Mon Chai",
        "Publication choisie",
        "Vins présentés sur le site"
      ],
      "proof": "Projection · Connexion à construire",
      "stage": "Publier les vins",
      "conditions": "À venir · Intégration API",
      "observation": "Ce schéma explique le parcours ; il ne constitue pas une capture du logiciel."
    },
    "api-commandes": {
      "title": "Les ventes du site dans le même suivi",
      "text": "Ressaisir dans le logiciel une commande reçue sur le site, c’est entrer deux fois les mêmes informations. Une future API pourrait transmettre les commandes validées à Mon Chai et mettre à jour les quantités selon des règles à construire.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "Projet · API à construire",
      "flow": [
        "Commande sur le site",
        "Validation et suivi dans Mon Chai",
        "Quantités mises à jour"
      ],
      "proof": "Projection · Connexion à construire",
      "stage": "Recevoir les ventes",
      "conditions": "À venir · Intégration API",
      "observation": "Ce schéma explique le parcours ; il ne constitue pas une capture du logiciel."
    },
    "api-reservations": {
      "title": "Relier les demandes de visite à Mon Chai",
      "text": "Entre les demandes reçues sur le site et l’accueil au domaine, il faut retrouver date et nombre de personnes. Une future API pourrait les réunir dans Mon Chai ; agenda, capacités et confirmations restent à développer.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "Projet · API à construire",
      "flow": [
        "Demande depuis votre site",
        "Agenda et capacités dans Mon Chai",
        "Confirmation par le domaine"
      ],
      "proof": "Projection · Aucune réservation connectée dans cette démo",
      "stage": "Recevoir les demandes",
      "conditions": "À venir · Intégration API",
      "observation": "Ce schéma explique le parcours ; il ne constitue pas une capture du logiciel."
    }
  },
  "places": {
    "vignes": {
      "label": "1 · Les vignes",
      "intro": "Les travaux se succèdent, les moyens se préparent et la date de récolte se précise. L’enjeu : garder le fil de chaque parcelle jusqu’à l’entrée du raisin au chai.",
      "slides": [
        "parcelles",
        "journal-cultural",
        "annonce-materiel",
        "annonce-vendanges",
        "suivi-maturite",
        "vendanges"
      ]
    },
    "terrain": {
      "label": "1.1 · Les vignes · saisie mobile",
      "intro": "Saisie mobile : une dictée devient une fiche relue, puis envoyée. Le cas montré est un transfert de cave.",
      "slides": [
        "notes-dictee",
        "notes-completer",
        "notes-verifier",
        "notes-activite"
      ]
    },
    "jardin": {
      "label": "2 · Les intrants",
      "intro": "Retrouver produit, date, quantité et parcelle après une intervention. Le repère se trouve dans les rangs.",
      "slides": [
        "phyto"
      ]
    },
    "chai": {
      "label": "3 · Le chai",
      "intro": "Les vins évoluent pendant que de nouvelles opérations se préparent. Pour décider de la suite, il faut retrouver leur emplacement, leur historique et leurs mesures.",
      "slides": [
        "plan-cave",
        "operations-cave",
        "analyses-oenologiques"
      ]
    },
    "bureau": {
      "label": "4 · Le bureau",
      "intro": "Entre les rencontres et les commandes, il faut pouvoir reprendre ce qui a été convenu. Mon Chai vous aide à préparer la suite avec les contacts, les vins disponibles et les offres enregistrées.",
      "slides": [
        "clients",
        "mcp",
        "devis",
        "commandes"
      ]
    },
    "caveau": {
      "label": "5 · Le caveau",
      "intro": "Après une rencontre au caveau, il reste à retrouver les vins goûtés et les avis. Mon Chai organise la session de dégustation, le parcours du visiteur et les retours.",
      "slides": [
        "degustation-creation",
        "degustation-visiteur",
        "degustation"
      ]
    },
    "produits": {
      "label": "De la parcelle à la bouteille",
      "intro": "Exemple de traçabilité : Cabernet d’Anjou 2022, données de démonstration. Ce vin de test est distinct de la boutique fictive.",
      "slides": [
        "trace-matiere",
        "trace-aval"
      ]
    },
    "ventes": {
      "label": "L’Aube · La vente sur votre site",
      "intro": "Quand le site et le logiciel sont mis à jour séparément, chaque vente et chaque tarif demandent d’être repris. Ces futures API viseraient à relier le catalogue et les commandes à Mon Chai.",
      "slides": [
        "api-catalogue",
        "api-commandes"
      ]
    },
    "reservation": {
      "label": "Du site à l’accueil au domaine",
      "intro": "Recevoir une demande en ligne, puis organiser l’accueil : deux moments à raccorder. Cette future connexion viserait à réunir les demandes dans Mon Chai avant leur confirmation par le domaine.",
      "slides": [
        "api-reservations"
      ]
    }
  },
  "videos": {
    "annonces": {
      "src": "/assets/video/creez-vos-annonces.mp4",
      "poster": "/assets/img/demo-annonces.webp",
      "title": "Préparer l’équipe des vendanges.",
      "context": "AUX VIGNES · LE RECRUTEMENT SAISONNIER",
      "caption": "27 secondes · Film sans son · Données fictives. Annonces : module pilote, selon activation.",
      "duration": "27 s",
      "steps": [
        "Choisir le recrutement saisonnier dans Mon Chai.",
        "Décrire le poste, le lieu et l’effectif recherché.",
        "Préciser les conditions et relire le récapitulatif.",
        "Confirmer la publication sur le banc de démonstration et consulter la page partageable."
      ],
      "note": "Démonstration du module de recrutement, filmée le 26 octobre 2026. La page d’annonce montrée utilise des données fictives."
    },
    "mcp": {
      "src": "/assets/video/monchai-mcp.mp4",
      "poster": "/assets/img/demo-mcp.webp",
      "title": "Interrogez vos stocks et vos impayés.",
      "context": "MON CHAI DANS CLAUDE · CONNECTEUR MCP",
      "caption": "33 secondes · Deux consultations dans Claude : les stocks de Mon Chai, puis les factures impayées.",
      "duration": "33 s",
      "steps": [
        "Demander quelles cuvées sont presque épuisées.",
        "Claude consulte les données Mon Chai et présente les stocks.",
        "Poser une seconde question sur les impayés.",
        "Retrouver les factures et montants concernés dans la réponse."
      ],
      "note": "Connecteur MCP en lecture seule, selon activation. Les réponses utilisent les données consultées dans Mon Chai ; le film présente un exemple d’utilisation."
    },
    "notes": {
      "src": "/assets/video/mon-chai-notes.mp4",
      "poster": "/assets/img/demo-mon-chai-notes.webp",
      "title": "Saisir, vérifier, envoyer.",
      "context": "SUR LE TÉLÉPHONE · LA SAISIE MOBILE",
      "caption": "24 secondes · Mon Chai Notes sur Android · Montage de captures, exemple de transfert de cave.",
      "duration": "24 s",
      "steps": [
        "Décrire une opération à la voix.",
        "Choisir les références concernées.",
        "Compléter et vérifier la fiche de transfert.",
        "Valider l’envoi puis retrouver son statut dans Activité."
      ],
      "note": "Montage de captures Android du 26 octobre 2026, illustrant la dictée, la relecture et l’envoi d’un transfert de cave."
    }
  }
};
