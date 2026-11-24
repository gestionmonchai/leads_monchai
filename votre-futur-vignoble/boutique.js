(() => {
  const panier = document.getElementById('panier');
  if (typeof panier?.showModal !== 'function') return;

  const cle = 'sillons-vifs:panier';
  const euros = new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'});
  const prix = (centimes) => euros.format(centimes / 100);
  const liste = document.getElementById('panier-lignes');
  const compteur = document.querySelector('[data-panier-nombre]');
  const total = document.querySelector('[data-panier-total]');
  const vide = document.getElementById('panier-vide');
  const menus = [...document.querySelectorAll('.menu-produit')];

  let lignes = [];
  try {
    const sauvegarde = JSON.parse(sessionStorage.getItem(cle));
    if (Array.isArray(sauvegarde)) {
      lignes = sauvegarde.filter((ligne) => ligne && typeof ligne.id === 'string' &&
        typeof ligne.nom === 'string' && Number.isSafeInteger(ligne.prix) &&
        Number.isSafeInteger(ligne.quantite) && ligne.quantite > 0);
    }
  } catch {
    // Quand le stockage est indisponible, le panier fonctionne sur la page ouverte.
  }

  function afficherPanier() {
    liste.replaceChildren();
    lignes.forEach((ligne) => {
      const item = document.createElement('li');
      item.className = 'panier-ligne';

      const texte = document.createElement('div');
      const nom = document.createElement('strong');
      nom.textContent = ligne.nom;
      const detail = document.createElement('p');
      detail.textContent = ligne.reservation ? ligne.detail : ligne.quantite + ' × ' + ligne.detail;
      texte.append(nom, detail);

      const montant = document.createElement('strong');
      montant.textContent = prix(ligne.prix * ligne.quantite);
      const retirer = document.createElement('button');
      retirer.type = 'button';
      retirer.textContent = 'Retirer';
      retirer.setAttribute('aria-label', 'Retirer ' + ligne.nom);
      retirer.addEventListener('click', () => {
        lignes = lignes.filter((autre) => autre !== ligne);
        conserverPanier();
        const boutonSuivant = liste.querySelector('button') || panier.querySelector('[data-fermer]');
        boutonSuivant.focus();
      });

      item.append(texte, montant, retirer);
      liste.append(item);
    });
    vide.hidden = lignes.length > 0;
    compteur.textContent = lignes.reduce((somme, ligne) => somme + ligne.quantite, 0);
    total.textContent = prix(lignes.reduce((somme, ligne) => somme + ligne.prix * ligne.quantite, 0));
  }

  function conserverPanier() {
    try {
      sessionStorage.setItem(cle, JSON.stringify(lignes));
    } catch {
      // L'affichage garde le panier en mémoire pour la page ouverte.
    }
    afficherPanier();
  }

  function ouvrirPanier() {
    if (!panier.open) panier.showModal();
  }

  document.querySelector('[data-panier-ouvrir]').addEventListener('click', ouvrirPanier);
  document.querySelectorAll('[data-panier-ouvrir], [data-ajouter], [data-reserver]').forEach((bouton) => {
    bouton.hidden = false;
  });
  afficherPanier();

  document.addEventListener('click', (event) => {
    menus.forEach((menu) => {
      if (!menu.contains(event.target)) menu.open = false;
    });

    const fermeture = event.target.closest('[data-fermer]');
    if (fermeture) fermeture.closest('dialog').close();

    const bouton = event.target.closest('[data-ajouter]');
    if (!bouton) return;
    const {ajouter: id, nom, prix: montant, format: detail} = bouton.dataset;
    const ligne = lignes.find((article) => article.id === id);
    if (ligne) {
      ligne.quantite += 1;
    } else {
      lignes.push({id, nom, prix: Number(montant), quantite: 1, detail});
    }
    conserverPanier();
    const menu = bouton.closest('.menu-produit');
    if (menu) {
      menu.open = false;
      menu.querySelector('summary').focus({preventScroll: true});
    }
    ouvrirPanier();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
    const menu = menus.find((element) => element.open);
    if (menu) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });

  const reservation = document.getElementById('reservation');
  if (!reservation) return;
  const date = document.getElementById('reservation-date');
  const personnes = document.getElementById('reservation-personnes');
  const nuits = document.getElementById('reservation-nuits');
  const totalReservation = reservation.querySelector('.reservation-total');
  const titre = document.getElementById('titre-reservation');
  const formatDate = new Intl.DateTimeFormat('fr-FR', {dateStyle: 'long', timeZone: 'UTC'});
  let offre;

  function estSejour() {
    return offre.unite === 'nuit';
  }

  function estimation() {
    const quantite = estSejour() ? nuits.valueAsNumber : personnes.valueAsNumber;
    return quantite * Number(offre.prix);
  }

  function afficherEstimation() {
    const montant = estimation();
    totalReservation.textContent = montant >= 0 && Number.isSafeInteger(montant) ?
      'Total estimé ' + prix(montant) : '';
  }

  const maintenant = new Date();
  const deuxChiffres = (entier) => String(entier).padStart(2, '0');
  date.min = [maintenant.getFullYear(), deuxChiffres(maintenant.getMonth() + 1),
    deuxChiffres(maintenant.getDate())].join('-');

  document.querySelectorAll('[data-reserver]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      offre = bouton.dataset;
      titre.textContent = offre.nom;
      date.value = '';
      personnes.max = offre.capacite;
      personnes.value = Math.min(Number(offre.capacite), 2);
      nuits.value = 1;
      reservation.querySelector('[data-champ-nuits]').hidden = !estSejour();
      afficherEstimation();
      reservation.showModal();
      date.focus();
    });
  });

  reservation.addEventListener('input', afficherEstimation);
  reservation.querySelector('[data-reservation-ajouter]').addEventListener('click', () => {
    if (!date.reportValidity() || !personnes.reportValidity() || (estSejour() && !nuits.reportValidity())) return;
    const montant = estimation();
    if (!Number.isSafeInteger(montant)) return;
    const participants = personnes.valueAsNumber;
    const nombreNuits = estSejour() ? nuits.valueAsNumber : 0;
    const id = [offre.reserver, date.value, participants, nombreNuits].join(':');
    const debut = formatDate.format(date.valueAsDate);
    const duree = estSejour() ? nombreNuits + (nombreNuits === 1 ? ' nuit' : ' nuits') : offre.horaire;
    const detail = debut + ' · ' + participants + (participants === 1 ? ' personne' : ' personnes') + ' · ' + duree;
    const ligne = {id, nom: offre.nom, detail, prix: montant, quantite: 1, reservation: true};
    lignes = lignes.filter((article) => article.id !== id);
    lignes.push(ligne);
    conserverPanier();
    reservation.close();
    ouvrirPanier();
  });
})();
