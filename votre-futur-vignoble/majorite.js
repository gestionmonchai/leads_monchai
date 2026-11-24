const verification = document.getElementById('verification-age');

if (typeof verification?.showModal === 'function') {
  const cle = 'sillons-vifs:majorite';
  const entree = verification.querySelector('[data-confirmer-age]');
  const sortie = verification.querySelector('[data-quitter-vitrine]');
  let confirme = false;

  try {
    confirme = sessionStorage.getItem(cle) === '1';
  } catch {
    // Le navigateur peut interdire le stockage de session.
  }

  if (!confirme) {
    entree.addEventListener('click', () => {
      try {
        sessionStorage.setItem(cle, '1');
      } catch {
        // Valider pour la page en cours si le stockage est indisponible.
      }
      verification.close();
      document.getElementById('contenu').focus({preventScroll: true});
    });

    verification.addEventListener('cancel', (event) => {
      event.preventDefault();
      sortie.click();
    });

    verification.showModal();
  }
}
