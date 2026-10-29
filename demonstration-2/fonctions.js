'use strict';
globalThis.HallaisFonctions = {
  "features": {
    "parcelles": {
      "title": "Parcelles",
      "text": "Retrouver les cépages, les appellations et les surfaces, parcelle par parcelle.",
      "href": "/vigne-vendanges.html",
      "image": "assets/captures/parcelles.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "journal-cultural": {
      "title": "Journal cultural",
      "text": "Garder les interventions avec leur date et leur parcelle pour retrouver le travail réalisé dans les rangs.",
      "href": "/vigne-vendanges.html",
      "image": "assets/captures/journal-cultural.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "suivi-maturite": {
      "title": "Suivi de maturité",
      "text": "Rassembler les relevés de maturité pour accompagner la décision de récolte. Les mesures restent à interpréter au domaine.",
      "href": "/vigne-vendanges.html",
      "image": "assets/captures/suivi-maturite.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "vendanges": {
      "title": "Vendanges",
      "text": "Retrouver les réceptions, les poids et les encuvages pour suivre le passage du raisin au chai.",
      "href": "/vigne-vendanges.html",
      "image": "assets/captures/vendanges.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "plan-cave": {
      "title": "Plan de cave",
      "text": "Voir les cuves et leur remplissage pour situer les vins dans les contenants.",
      "href": "/cave-vinification.html",
      "image": "assets/captures/plan-cave.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "operations-cave": {
      "title": "Journal des opérations",
      "text": "Retrouver les opérations de cave et les lots concernés dans un même journal.",
      "href": "/cave-vinification.html",
      "image": "assets/captures/operations-cave.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "analyses-oenologiques": {
      "title": "Analyses œnologiques",
      "text": "Consulter les mesures et les états de surveillance des lots pour préparer les échanges et les décisions de cave.",
      "href": "/cave-vinification.html",
      "image": "assets/captures/analyses-oenologiques.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "commandes": {
      "title": "Commandes",
      "text": "Retrouver les commandes et leurs montants pour suivre ce qui a été convenu avec les clients.",
      "href": "/ventes-clients.html",
      "image": "assets/captures/commandes.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "clients": {
      "title": "Clients",
      "text": "Rassembler les fiches clients et leur segment, au retour d’un salon comme au domaine.",
      "href": "/ventes-clients.html",
      "image": "assets/captures/clients.webp",
      "kind": "capture",
      "proof": "Capture historique du logiciel · Données de démonstration",
      "availability": "Selon les modules activés"
    },
    "degustation": {
      "title": "Retrouver les sessions et les retours",
      "text": "Consulter les dégustations organisées, leur état et les retours recueillis. La rencontre garde une place dans le suivi du domaine.",
      "href": "/oenotourisme.html",
      "kind": "capture",
      "availability": "Selon les modules activés",
      "image": "assets/captures/degustation-sessions.webp",
      "proof": "Capture historique du logiciel · Données de démonstration"
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
      "video": true
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
      "video": true
    },
    "entretien": {
      "title": "Suivre les contenants et leur nettoyage",
      "text": "Retrouver les contenants et enregistrer leur nettoyage, sa date et son statut pour préparer leur prochaine utilisation.",
      "href": "/cave-vinification.html",
      "kind": "schema",
      "availability": "Selon les modules activés",
      "flow": [
        "Fiche du contenant",
        "Nettoyage réalisé",
        "Date et statut enregistrés",
        "Prochaine utilisation"
      ],
      "proof": "Schéma explicatif · Parcours à titre d’exemple"
    },
    "trace-aval": {
      "title": "Le dossier du lot, jusqu’aux sorties",
      "text": "Depuis les lots liés au vin, retrouver les destinations connues, les quantités et les pièces. Le dossier rassemble aussi les opérations et les informations manquantes, avec export CSV ou PDF.",
      "href": "/stocks-tracabilite.html",
      "kind": "capture",
      "availability": "Selon les modules activés",
      "image": "assets/captures/lots-commerciaux.webp",
      "proof": "Écran Lots commerciaux · Entrée vers les destinations et le dossier"
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
      "proof": "Projection · Connexion à construire"
    },
    "api-commandes": {
      "title": "Les ventes du site dans le même suivi",
      "text": "Les commandes validées du site pourraient rejoindre vos ventes dans Mon Chai, avec des quantités mises à jour selon les règles de validation. Une même information à suivre au caveau et sur le site : c’est l’objectif du futur raccordement.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "À venir · Intégration API",
      "flow": [
        "Commande sur le site",
        "Validation et suivi dans Mon Chai",
        "Quantités mises à jour"
      ],
      "proof": "Projection · Connexion à construire"
    },
    "api-reservations": {
      "title": "Les demandes de visite arrivent dans Mon Chai",
      "text": "Recevoir la date souhaitée et le nombre de personnes depuis le site, vérifier les places et confirmer la visite dans Mon Chai. L’agenda, ses capacités et cette connexion restent à construire.",
      "href": "/contact.html",
      "kind": "schema",
      "availability": "À venir · Intégration API",
      "flow": [
        "Demande depuis votre site",
        "Agenda et capacités dans Mon Chai",
        "Confirmation par le domaine"
      ],
      "proof": "Projection · Aucune réservation connectée dans cette démo"
    },
    "trace-matiere": {
      "title": "La traçabilité dans la fiche du vin",
      "text": "Retrouver les parcelles d’origine, les vendanges, les lots techniques et les mises qui aboutissent au produit fini. Les liens permettent de passer d’une étape à son détail.",
      "href": "/stocks-tracabilite.html",
      "kind": "capture",
      "image": "assets/captures/trace-produit-fiche.png",
      "proof": "Fiche produit · Onglet Traçabilité · Capture fournie",
      "availability": "Selon les modules activés",
      "wide": true
    },
    "degustation-creation": {
      "title": "Préparer une dégustation",
      "text": "Nommer la session et sélectionner les vins à faire découvrir au caveau, lors d’un salon ou d’une rencontre professionnelle.",
      "href": "/oenotourisme.html",
      "kind": "capture",
      "image": "assets/captures/degustation-creation.jpeg",
      "proof": "Créer une session de dégustation · Capture historique, données fictives",
      "availability": "Selon les modules activés"
    },
    "phyto": {
      "title": "Intrants et registre phytosanitaire",
      "text": "Retrouver les produits utilisés, les parcelles, les dates et les quantités enregistrées dans les interventions. Filtrer le registre par année ou parcelle et préparer son export. Les données affichées sont fictives.",
      "href": "/registre-phyto-numerique-2027.html",
      "kind": "capture",
      "image": "assets/captures/registre-phytosanitaire.webp",
      "proof": "Registre phytosanitaire · Données fictives de démonstration",
      "availability": "Selon les modules activés"
    }
  },
  "places": {
    "vignes": {
      "label": "Les vignes",
      "slides": [
        "parcelles",
        "journal-cultural"
      ],
      "intro": "Parcelles et interventions : garder la mémoire du travail dans les rangs."
    },
    "maison": {
      "label": "La maison",
      "slides": [
        "clients",
        "commandes",
        "api-commandes"
      ],
      "intro": "Retrouver les échanges commerciaux et imaginer le raccordement des ventes du site."
    },
    "chai": {
      "label": "Le chai",
      "slides": [
        "plan-cave",
        "operations-cave",
        "analyses-oenologiques"
      ],
      "intro": "Situer les vins, retrouver les opérations et partager les mesures de cave."
    },
    "caveau": {
      "label": "Le caveau",
      "slides": [
        "degustation-creation",
        "degustation"
      ],
      "intro": "Préparer les vins à faire découvrir et retrouver les retours après la rencontre."
    },
    "jardin": {
      "label": "Le jardin",
      "slides": [
        "phyto"
      ],
      "intro": "Des produits aux interventions enregistrées : retrouver l’usage des intrants et le registre phytosanitaire."
    },
    "eau": {
      "label": "Le bassin",
      "slides": [
        "entretien"
      ],
      "intro": "Autour des lavages, suivre les contenants et leur entretien. Le logiciel ne gère pas l’irrigation."
    },
    "recolte": {
      "label": "La récolte",
      "slides": [
        "annonce-vendanges",
        "annonce-materiel",
        "suivi-maturite",
        "vendanges"
      ],
      "intro": "Préparer l’équipe et le matériel, suivre la maturité, puis retrouver les apports reçus au chai."
    },
    "produits": {
      "label": "Du raisin à la bouteille",
      "slides": [
        "trace-matiere",
        "trace-aval",
        "api-catalogue"
      ],
      "intro": "Un exemple de lecture du logiciel, de l’origine du vin au dossier du lot. Les écrans présentés sont distincts du Domaine Hallais."
    },
    "reservation": {
      "label": "Du site à l’accueil au domaine",
      "slides": [
        "api-reservations"
      ],
      "intro": "Comment une future demande de visite pourrait rejoindre votre organisation dans Mon Chai."
    }
  }
};
