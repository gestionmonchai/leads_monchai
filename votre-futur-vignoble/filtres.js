const boutons = document.querySelectorAll('[data-filtre]');
const cuvees = document.querySelectorAll('[data-couleur]');
const compteur = document.querySelector('#resultats-cuvees');

if (boutons.length && cuvees.length && compteur) {
  boutons[0].closest('.filtres').hidden = false;
  boutons.forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const filtre = bouton.dataset.filtre;
      let total = 0;

      boutons.forEach((item) => item.setAttribute('aria-pressed', String(item === bouton)));
      cuvees.forEach((cuvee) => {
        cuvee.hidden = filtre !== 'toutes' && filtre !== cuvee.dataset.couleur;
        if (!cuvee.hidden) total += 1;
      });
      compteur.textContent = total === 1 ? '1 cuvée' : `${total} cuvées`;
    });
  });
}
