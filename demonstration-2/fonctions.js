'use strict';

globalThis.MonChaiFonctions = {
  "features": {
    "parcelles": {
      "title": "Définir ses parcelles",
      "text": "Délimiter une parcelle ou une sous-zone sur le fond cadastral et renseigner ses caractéristiques. Chaque parcelle devient le point de départ des travaux à suivre.",
      "image": "assets/captures/parcelle-parametrage.jpeg",
      "stage": "Définir",
      "kind": "capture",
      "href": "/vigne-vendanges.html",
      "proof": "Paramétrage de parcelles sur fond cadastral · Capture historique, parcelles de test",
      "availability": "Selon les modules activés",
      "portrait": false
    },
    "journal-cultural": {
      "title": "Retrouver les interventions",
      "text": "Après les passages dans les rangs, retrouver les dates, les parcelles et les travaux enregistrés. Cette vue d’ensemble complète les fiches de saisie du point 1.1.",
      "href": "/vigne-vendanges.html",
      "image": "assets/captures/journal-cultural.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés",
      "stage": "Suivre les travaux"
    },
    "annonce-materiel": {
      "title": "Chercher ou proposer du matériel",
      "text": "Exprimer un besoin de matériel viticole ou proposer un équipement à vendre, louer ou prêter : cuve, pompe, pressoir ou matériel des rangs.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "Annonces · Module pilote, selon activation",
      "flow": [
        "Matériel recherché ou proposé",
        "Caractéristiques et conditions",
        "Relecture",
        "Annonce partageable"
      ],
      "proof": "Schéma explicatif · Parcours à titre d’exemple",
      "stage": "Préparer le matériel"
    },
    "annonce-vendanges": {
      "title": "Préparer l’équipe des vendanges",
      "text": "Décrire le poste, l’effectif recherché, le lieu et les conditions ; relire l’annonce avant de créer une page partageable.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "Annonces · Module pilote, selon activation",
      "flow": [
        "Besoin saisonnier",
        "Poste et conditions",
        "Relecture",
        "Page à partager"
      ],
      "proof": "Schéma explicatif · Parcours à titre d’exemple",
      "video": "annonces",
      "stage": "Préparer l’équipe"
    },
    "suivi-maturite": {
      "title": "Suivi de maturité",
      "text": "Rassembler les relevés de maturité pour accompagner la décision de récolte. Les mesures restent à interpréter au domaine.",
      "href": "/vigne-vendanges.html",
      "image": "assets/captures/suivi-maturite.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés",
      "stage": "Décider la récolte"
    },
    "vendanges": {
      "title": "Vendanges",
      "text": "Retrouver les réceptions, les poids et les encuvages pour suivre le passage du raisin au chai.",
      "href": "/vigne-vendanges.html",
      "image": "assets/captures/vendanges.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés",
      "stage": "Réceptionner"
    },
    "notes-dictee": {
      "title": "Dicter une opération",
      "text": "Décrire le travail réalisé depuis le téléphone. Mon Chai Notes prépare une saisie à relire ; le film et les écrans montrent ici un exemple de transfert de cave.",
      "image": "assets/captures/notes-dictee.png",
      "stage": "Dicter",
      "kind": "capture",
      "href": "/#nouveautes",
      "proof": "Mon Chai Notes · Android · Dictée d’une opération, exemple de transfert",
      "availability": "Selon les modules activés",
      "portrait": true,
      "video": "notes"
    },
    "notes-completer": {
      "title": "Compléter la fiche",
      "text": "Retrouver une fiche individuelle avec les informations manquantes signalées. Préciser les références et les quantités avant la vérification.",
      "image": "assets/captures/notes-completer.png",
      "stage": "Compléter",
      "kind": "capture",
      "href": "/#nouveautes",
      "proof": "Mon Chai Notes · Android · Fiche individuelle à compléter",
      "availability": "Selon les modules activés",
      "portrait": true
    },
    "notes-verifier": {
      "title": "Vérifier, puis envoyer",
      "text": "Relire les contenants, le volume et la date. Modifier si nécessaire, puis valider l’envoi dans l’application. Cette capture ne déclenche aucune opération.",
      "image": "assets/captures/notes-verifier.png",
      "stage": "Vérifier et envoyer",
      "kind": "capture",
      "href": "/#nouveautes",
      "proof": "Mon Chai Notes · Android · Vérification d’un transfert avant envoi",
      "availability": "Selon les modules activés",
      "portrait": true
    },
    "notes-activite": {
      "title": "Retrouver le statut de sa saisie",
      "text": "Consulter l’activité pour distinguer une saisie à vérifier, en attente, à corriger ou synchronisée. L’exemple affiché concerne un transfert enregistré.",
      "image": "assets/captures/notes-activite.png",
      "stage": "Retrouver le statut",
      "kind": "capture",
      "href": "/#nouveautes",
      "proof": "Mon Chai Notes · Android · État synchronisé d’une saisie",
      "availability": "Selon les modules activés",
      "portrait": true
    },
    "clients": {
      "title": "Préparer le prochain contact",
      "text": "Avant un appel ou un salon, retrouver le contact et reprendre ses attentes : vins recherchés, échantillons et rendez-vous à préparer. La rencontre suivante part de ce qui a déjà été convenu.",
      "stage": "Reprendre le contact",
      "kind": "schema",
      "flow": [
        "Contact et échanges",
        "Attentes à qualifier",
        "Rendez-vous et échantillons"
      ],
      "href": "/ventes-clients.html",
      "availability": "Selon les modules activés",
      "proof": "Schéma explicatif · Préparation de la prospection"
    },
    "mcp": {
      "title": "Vos stocks et vos impayés, dans Claude",
      "text": "Quelles cuvées restent disponibles ? Quelles factures attendent un règlement ? Posez vos questions dans Claude : le connecteur MCP consulte les données de Mon Chai et restitue les stocks et les impayés. La vidéo montre ces deux consultations, en 33 secondes.",
      "stage": "Consulter stocks et impayés",
      "kind": "capture",
      "image": "/assets/img/demo-mcp.webp",
      "video": "mcp",
      "href": "/#nouveautes",
      "availability": "Connecteur en lecture seule, selon activation",
      "proof": "Film Mon Chai dans Claude · Stocks et impayés · 33 s",
      "portrait": true
    },
    "devis": {
      "title": "Préparer une offre individuelle",
      "text": "Sélectionner le destinataire, les vins, les quantités et les prix dans un devis. Relire les conditions avant de partager l’offre avec le client.",
      "image": "assets/captures/devis-individuel.webp",
      "stage": "Faire une offre",
      "kind": "capture",
      "href": "/ventes-clients.html",
      "proof": "Formulaire d’un devis · Capture historique, données de démonstration",
      "availability": "Selon les modules activés",
      "portrait": false
    },
    "commandes": {
      "title": "Retrouver les commandes convenues",
      "text": "Retrouver les commandes et leurs montants pour suivre ce qui a été convenu avec les clients.",
      "href": "/ventes-clients.html",
      "image": "assets/captures/commandes.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés",
      "stage": "Suivre l’engagement"
    },
    "plan-cave": {
      "title": "Plan de cave",
      "text": "Voir les cuves et leur remplissage pour situer les vins dans les contenants.",
      "href": "/cave-vinification.html",
      "image": "assets/captures/plan-cave.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés",
      "stage": "Situer les vins"
    },
    "operations-cave": {
      "title": "Journal des opérations",
      "text": "Retrouver les opérations de cave et les lots concernés dans un même journal.",
      "href": "/cave-vinification.html",
      "image": "assets/captures/operations-cave.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés",
      "stage": "Suivre les opérations"
    },
    "analyses-oenologiques": {
      "title": "Analyses œnologiques",
      "text": "Consulter les mesures et les états de surveillance des lots pour préparer les échanges et les décisions de cave.",
      "href": "/cave-vinification.html",
      "image": "assets/captures/analyses-oenologiques.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés",
      "stage": "Contrôler les mesures"
    },
    "degustation-creation": {
      "title": "Préparer une dégustation",
      "text": "Nommer la session et sélectionner les vins à faire découvrir au caveau, lors d’un salon ou d’une rencontre professionnelle.",
      "href": "/oenotourisme.html",
      "kind": "capture",
      "image": "assets/captures/degustation-creation.jpeg",
      "proof": "Créer une session de dégustation · Capture historique, données fictives",
      "availability": "Selon les modules activés",
      "stage": "Préparer la session"
    },
    "degustation-visiteur": {
      "title": "Une dégustation courte ou guidée",
      "text": "La personne choisit une note rapide ou un parcours guidé : observer le vin, découvrir ses arômes avant et après aération, goûter, puis donner son avis. Ces réponses prolongent la rencontre au caveau.",
      "href": "/oenotourisme.html",
      "kind": "capture",
      "image": "assets/captures/degustation-visiteur.png",
      "portrait": true,
      "proof": "Parcours visiteur · Capture du site de test · 29 octobre 2026",
      "availability": "Selon activation du module dégustation",
      "stage": "Faire déguster"
    },
    "degustation": {
      "title": "Retrouver les sessions et les retours",
      "text": "Consulter les dégustations organisées, leur état et les retours recueillis. La rencontre garde une place dans le suivi du domaine.",
      "href": "/oenotourisme.html",
      "kind": "capture",
      "availability": "Selon les modules activés",
      "image": "assets/captures/degustation-sessions.webp",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "stage": "Retrouver les retours"
    },
    "phyto": {
      "title": "Intrants et registre phytosanitaire",
      "text": "Retrouver les produits utilisés, les parcelles, les dates et les quantités enregistrées dans les interventions. Filtrer le registre par année ou parcelle et préparer son export. Les données affichées sont fictives.",
      "href": "/registre-phyto-numerique-2027.html",
      "kind": "capture",
      "image": "assets/captures/registre-phytosanitaire.webp",
      "proof": "Registre phytosanitaire · Données fictives de démonstration",
      "availability": "Selon les modules activés",
      "stage": "Retrouver les interventions"
    },
    "trace-matiere": {
      "title": "La traçabilité dans une fiche de vin",
      "text": "Retrouver les parcelles d’origine, les vendanges, les lots techniques et les mises qui aboutissent au produit fini. Les liens permettent de passer d’une étape à son détail.",
      "href": "/stocks-tracabilite.html",
      "kind": "capture",
      "image": "assets/captures/trace-produit-fiche.png",
      "proof": "Exemple logiciel · Cabernet d’Anjou 2022 · Onglet Traçabilité",
      "availability": "Selon les modules activés",
      "wide": true,
      "stage": "Remonter à l’origine"
    },
    "trace-aval": {
      "title": "Ouvrir le dossier d’un lot",
      "text": "Depuis cette liste, choisir un lot puis ouvrir son dossier : destinations connues, quantités, pièces et opérations associées. Le dossier détaillé peut être exporté en CSV ou PDF.",
      "href": "/stocks-tracabilite.html",
      "kind": "capture",
      "availability": "Selon les modules activés",
      "image": "assets/captures/lots-commerciaux.webp",
      "proof": "Liste des lots commerciaux · Point d’entrée vers le dossier détaillé",
      "stage": "Suivre les sorties"
    },
    "api-catalogue": {
      "title": "Vos vins, du logiciel au site",
      "text": "Une sélection de produits, formats et prix pourrait alimenter le site depuis Mon Chai. Vous choisiriez ce qui devient public ; les disponibilités et les règles de mise à jour resteraient à définir.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "À venir · Intégration API",
      "flow": [
        "Sélection dans Mon Chai",
        "Publication choisie",
        "Vins présentés sur le site"
      ],
      "proof": "Projection · Connexion à construire",
      "stage": "Publier les vins"
    },
    "api-commandes": {
      "title": "Les ventes du site dans le même suivi",
      "text": "Après le choix d’un vin sur votre site, les commandes validées pourraient rejoindre vos ventes dans Mon Chai. Les quantités seraient mises à jour selon des règles de validation à construire avec vous.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "À venir · Intégration API",
      "flow": [
        "Commande sur le site",
        "Validation et suivi dans Mon Chai",
        "Quantités mises à jour"
      ],
      "proof": "Projection · Connexion à construire",
      "stage": "Recevoir les ventes"
    },
    "api-reservations": {
      "title": "Relier les demandes de visite à Mon Chai",
      "text": "Une future connexion pourrait transmettre la date souhaitée et le nombre de personnes du site à Mon Chai. L’agenda, les capacités d’accueil et les confirmations restent à développer.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "À venir · Intégration API",
      "flow": [
        "Demande depuis votre site",
        "Agenda et capacités dans Mon Chai",
        "Confirmation par le domaine"
      ],
      "proof": "Projection · Aucune réservation connectée dans cette démo",
      "stage": "Recevoir les demandes"
    }
  },
  "places": {
    "vignes": {
      "label": "1 · Les vignes",
      "intro": "Définir la parcelle, suivre les travaux, préparer les moyens, décider de la récolte puis réceptionner.",
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
      "label": "1.1 · Saisir sur le terrain",
      "intro": "Du travail réalisé à une saisie vérifiée. Mon Chai Notes accompagne la saisie mobile ; les écrans montrent un exemple de transfert de cave.",
      "slides": [
        "notes-dictee",
        "notes-completer",
        "notes-verifier",
        "notes-activite"
      ]
    },
    "bureau": {
      "label": "2 · Le bureau",
      "intro": "Reprendre un contact, consulter stocks et règlements en cours, préparer une offre puis suivre les commandes.",
      "slides": [
        "clients",
        "mcp",
        "devis",
        "commandes"
      ]
    },
    "chai": {
      "label": "3 · Le chai",
      "intro": "Situer les vins, suivre leur travail au chai puis partager les mesures qui éclairent les décisions.",
      "slides": [
        "plan-cave",
        "operations-cave",
        "analyses-oenologiques"
      ]
    },
    "caveau": {
      "label": "4 · Le caveau",
      "intro": "Préparer les vins à faire découvrir, accompagner la dégustation et retrouver les retours après la rencontre.",
      "slides": [
        "degustation-creation",
        "degustation-visiteur",
        "degustation"
      ]
    },
    "jardin": {
      "label": "5 · Le jardin",
      "intro": "Le jardin est un repère illustré pour présenter les intrants utilisés dans les vignes et les interventions du registre phytosanitaire.",
      "slides": [
        "phyto"
      ]
    },
    "produits": {
      "label": "La Roche · Comprendre la traçabilité",
      "intro": "La capture montre un Cabernet d’Anjou 2022 de démonstration. Elle illustre le suivi d’un vin, pas l’historique de la cuvée fictive La Roche.",
      "slides": [
        "trace-matiere",
        "trace-aval"
      ]
    },
    "ventes": {
      "label": "L’Aube · La vente sur votre site",
      "intro": "Une future liaison entre les vins publiés, les commandes du site et votre suivi commercial dans Mon Chai.",
      "slides": [
        "api-catalogue",
        "api-commandes"
      ]
    },
    "reservation": {
      "label": "Du site à l’accueil au domaine",
      "intro": "Comment une future demande de visite pourrait rejoindre votre organisation dans Mon Chai.",
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
