(() => {
  document.querySelectorAll('.carte-outils').forEach((outils) => { outils.hidden = false; });
  let apercuActif;

  function fermerApercu(rendreFocus) {
    if (!apercuActif) return;
    const {carte, panneau, retour} = apercuActif;
    const lecteur = panneau.querySelector('[data-lecteur]');
    if (lecteur?.firstElementChild) {
      lecteur.firstElementChild.pause();
      lecteur.replaceChildren();
    }
    panneau.hidden = true;
    delete carte.dataset.apercuOuvert;
    apercuActif = null;
    if (rendreFocus) retour.focus({preventScroll: true});
  }

  function ouvrirApercu(declencheur) {
    const carte = declencheur.closest('.cuvee');
    const panneau = carte.querySelector('.carte-apercu');
    const mode = declencheur.dataset.apercu;
    const contenu = panneau.querySelector('[data-contenu="' + mode + '"]');
    if (!contenu) return;

    fermerApercu(false);
    const menu = declencheur.closest('.menu-produit');
    const retour = menu ? menu.querySelector('summary') : declencheur;
    if (menu) menu.open = false;

    panneau.querySelectorAll('[data-contenu]').forEach((section) => {
      section.hidden = section !== contenu;
    });
    carte.dataset.apercuOuvert = mode;
    panneau.hidden = false;
    panneau.querySelector('.carte-apercu-corps').scrollTop = 0;
    panneau.querySelector('[data-fermer-apercu]').focus({preventScroll: true});
    apercuActif = {carte, panneau, retour};

    const modele = contenu.querySelector('template');
    if (modele) {
      const lecteur = contenu.querySelector('[data-lecteur]');
      lecteur.append(modele.content.cloneNode(true));
      lecteur.querySelector('video').play().catch(() => {
        // Les commandes restent disponibles si le navigateur exige un second clic.
      });
    }
  }

  document.addEventListener('click', (event) => {
    const origine = event.target;
    if (!(origine instanceof Element)) return;
    if (origine.closest('[data-filtre]') && apercuActif?.carte.hidden) fermerApercu(false);

    const rotation = origine.closest('[data-retourner]');
    if (rotation) {
      const carte = rotation.closest('.cuvee');
      const verso = carte.toggleAttribute('data-verso');
      rotation.textContent = verso ? 'Face avant' : 'Contre-étiquette';
      carte.querySelector('[data-apercu="etiquette"]').hidden = !verso;
    }

    const declencheur = origine.closest('[data-apercu]');
    if (declencheur && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      ouvrirApercu(declencheur);
    }
    if (origine.closest('[data-fermer-apercu]')) fermerApercu(true);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !document.querySelector('dialog[open]') &&
        apercuActif?.panneau.contains(event.target)) {
      fermerApercu(true);
    }
  });
})();
