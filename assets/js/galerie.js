/* =========================================================
   MOSAÏQUE + CARROUSEL
   =========================================================

   Amélioration progressive. Dans le document, chaque vue est un <a> qui pointe
   vers son image : sans JavaScript, un clic ouvre l'image, et les moteurs de
   recherche atteignent les six fichiers. Ce script intercepte le clic et
   ouvre un carrousel à la place.

   Les images pleines ne sont pas dans le document : six captures de 90 Ko
   chargées d'avance pour une page qui n'en montre qu'au clic, c'est le genre
   de poids qui se paie sur le LCP. Elles sont créées à la demande, et seules
   les voisines immédiates sont préchargées.

   Balisage attendu :

     <div class="mos" data-galerie>
       <a class="mos__t" href="vue.webp" data-legende="…"><img …></a>
       … trois autres …
       <span class="mos__compte">6 écrans</span>
       <ul class="mos__reste">
         <li><a href="vue5.webp" data-legende="…">…</a></li>
       </ul>
     </div>
   ========================================================= */

(function () {
  'use strict';

  var galeries = document.querySelectorAll('[data-galerie]');
  if (!galeries.length) return;

  // Un seul carrousel pour toute la page, construit au premier clic.
  var boite = null, image = null, legende = null, compteur = null,
      pastilles = null, precedent = null, suivant = null, fermeture = null;
  var vues = [], index = 0, ouvreur = null;

  var ICONES = {
    gauche: 'M15 5l-7 7 7 7',
    droite: 'M9 5l7 7-7 7'
  };

  function fleche(sens, libelle) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'car__fleche';
    b.setAttribute('aria-label', libelle);
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + ICONES[sens] + '"/></svg>';
    return b;
  }

  function construire() {
    boite = document.createElement('div');
    boite.className = 'car';
    boite.setAttribute('role', 'dialog');
    boite.setAttribute('aria-modal', 'true');
    boite.setAttribute('aria-label', 'Captures du logiciel');

    var barre = document.createElement('div');
    barre.className = 'car__barre';
    compteur = document.createElement('p');
    compteur.className = 'car__compteur';
    // Le compteur change à chaque vue : annoncé poliment, il ne coupe pas la
    // lecture de la légende.
    compteur.setAttribute('aria-live', 'polite');
    fermeture = document.createElement('button');
    fermeture.type = 'button';
    fermeture.className = 'car__fermer';
    fermeture.setAttribute('aria-label', 'Fermer');
    fermeture.innerHTML = '&times;';
    barre.append(compteur, fermeture);

    var scene = document.createElement('div');
    scene.className = 'car__scene';
    precedent = fleche('gauche', 'Vue précédente');
    suivant = fleche('droite', 'Vue suivante');
    var cadre = document.createElement('figure');
    cadre.className = 'car__cadre';
    image = document.createElement('img');
    image.decoding = 'async';
    legende = document.createElement('figcaption');
    legende.className = 'car__legende';
    cadre.append(image, legende);
    scene.append(precedent, cadre, suivant);

    pastilles = document.createElement('div');
    pastilles.className = 'car__pastilles';

    boite.append(barre, scene, pastilles);
    document.body.appendChild(boite);

    fermeture.addEventListener('click', fermer);
    precedent.addEventListener('click', function () { aller(index - 1); });
    suivant.addEventListener('click', function () { aller(index + 1); });
    // Le clic sur le fond ferme ; sur l'image ou les commandes, non.
    boite.addEventListener('click', function (e) {
      if (e.target === boite || e.target.classList.contains('car__scene')) fermer();
    });
    boite.addEventListener('keydown', auClavier);
  }

  function poserPastilles() {
    pastilles.textContent = '';
    vues.forEach(function (v, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'car__pastille';
      b.setAttribute('aria-label', 'Vue ' + (i + 1) + ' : ' + v.legende);
      b.addEventListener('click', function () { aller(i); });
      pastilles.appendChild(b);
    });
  }

  function precharger(i) {
    var v = vues[i];
    if (!v || v.prechargee) return;
    v.prechargee = true;
    new Image().src = v.src;
  }

  function aller(n) {
    // Le carrousel boucle : après la dernière on revient à la première.
    index = (n + vues.length) % vues.length;
    var v = vues[index];
    image.src = v.src;
    image.alt = v.legende;
    legende.textContent = v.legende;
    compteur.textContent = (index + 1) + ' / ' + vues.length;
    Array.prototype.forEach.call(pastilles.children, function (b, i) {
      b.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
    precharger(index + 1);
    precharger(index - 1 < 0 ? vues.length - 1 : index - 1);
  }

  function auClavier(e) {
    if (e.key === 'Escape') { fermer(); return; }
    if (e.key === 'ArrowLeft') { aller(index - 1); return; }
    if (e.key === 'ArrowRight') { aller(index + 1); return; }
    if (e.key === 'Home') { e.preventDefault(); aller(0); return; }
    if (e.key === 'End') { e.preventDefault(); aller(vues.length - 1); return; }
    if (e.key !== 'Tab') return;

    // Piège à tabulation : le carrousel recouvre la page, la tabulation ne
    // doit pas partir se promener dans le contenu qui est dessous.
    var focalisables = boite.querySelectorAll('button');
    var premier = focalisables[0];
    var dernier = focalisables[focalisables.length - 1];
    if (e.shiftKey && document.activeElement === premier) {
      e.preventDefault(); dernier.focus();
    } else if (!e.shiftKey && document.activeElement === dernier) {
      e.preventDefault(); premier.focus();
    }
  }

  function ouvrir(liste, depart, source) {
    if (!boite) construire();
    vues = liste;
    ouvreur = source;
    poserPastilles();
    aller(depart);
    boite.classList.add('est-ouvert');
    // Sans cela, la page défile derrière le carrousel.
    document.body.style.overflow = 'hidden';
    fermeture.focus();
  }

  function fermer() {
    boite.classList.remove('est-ouvert');
    document.body.style.overflow = '';
    // Rendre le focus à la tuile d'où l'on vient : sinon il retombe en haut
    // du document et il faut refaire tout le chemin au clavier.
    if (ouvreur) ouvreur.focus();
    ouvreur = null;
  }

  Array.prototype.forEach.call(galeries, function (galerie) {
    var liens = galerie.querySelectorAll('a[href]');
    var liste = Array.prototype.map.call(liens, function (a) {
      return {
        src: a.getAttribute('href'),
        legende: a.getAttribute('data-legende') || a.textContent.trim()
      };
    });
    if (liste.length < 2) return;

    Array.prototype.forEach.call(liens, function (a, i) {
      a.addEventListener('click', function (e) {
        // Un clic du milieu, ou avec une touche de modification, doit garder
        // son comportement : ouvrir l'image dans un onglet.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        ouvrir(liste, i, a);
      });
    });
  });
})();
