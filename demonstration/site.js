'use strict';
(() => {
  const wines = {
    roche: { name: 'La Roche', type: 'Rouge · 2025 · 75 cl', price: 1800, image: 'assets/cuvee-rouge.svg', story: '#assemblage', profile: 'Fruit noir, épices douces, tanins souples.', pairing: 'Légumes rôtis, champignons, cuisine mijotée.', service: '16–18 °C', description: 'Dans ce scénario, La Roche prolonge le travail des essais d’assemblage : chercher le fruit et la tenue en bouche, goûter à plusieurs, reprendre le choix. Cette cuvée et ses caractéristiques sont imaginaires.' },
    aube: { name: 'L’Aube', type: 'Blanc · 2025 · 75 cl', price: 1600, image: 'assets/cuvee-blanc.svg', story: '#recolte', profile: 'Agrumes, fleurs blanches, fraîcheur.', pairing: 'Poisson grillé, fromage frais, légumes croquants.', service: '10–12 °C', description: 'Cette cuvée imaginaire permet de relier la fraîcheur recherchée dans un blanc au choix du moment de récolte. Retrouvez les observations et les contraintes du chapitre, sans y voir la fiche technique d’un vin réel.' }
  };
  const money = cents => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const cart = new Map(); // Démonstration éphémère : ni stockage local ni service distant.
  const cartDialog = document.querySelector('#cart-dialog');
  const productDialog = document.querySelector('#product-dialog');
  const visitDialog = document.querySelector('#visit-dialog');
  const dialogs = [cartDialog, productDialog, visitDialog];
  const lastFocus = new WeakMap();
  const toast = document.querySelector('.toast');
  let toastTimer;
  let activeWine = null;

  function announce(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
  }
  function open(dialog, trigger) {
    closeMenu();
    for (const other of dialogs) if (other.open) other.close();
    lastFocus.set(dialog, trigger || document.activeElement);
    dialog.showModal();
  }
  for (const dialog of dialogs) {
    dialog.addEventListener('close', () => {
      const trigger = lastFocus.get(dialog);
      if (trigger && trigger.isConnected && !trigger.hidden) trigger.focus({ preventScroll: true });
    });
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  }
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function invalidateOrder() {
    const result = document.querySelector('#order-result');
    result.hidden = true;
    result.textContent = '';
  }
  function renderCart() {
    const count = [...cart.values()].reduce((sum, q) => sum + q, 0);
    document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = count; });
    document.querySelector('[data-cart]').setAttribute('aria-label', `Panier, ${count} bouteille${count > 1 ? 's' : ''}`);
    const list = document.querySelector('#cart-lines');
    list.replaceChildren();
    document.querySelector('.cart-summary').hidden = count === 0;
    if (!count) {
      const empty = make('div', 'empty-cart');
      empty.append(make('p', '', 'Votre découverte commence ici.'), make('p', '', 'Ajoutez une cuvée pour essayer le panier.'));
      list.append(empty);
    }
    for (const [id, quantity] of cart) {
      const wine = wines[id];
      const line = make('div', 'cart-line');
      const image = make('img');
      image.src = wine.image;
      image.alt = '';
      image.width = 45;
      image.height = 110;
      const info = make('div');
      const title = make('div', 'cart-line-title');
      title.append(make('h3', '', wine.name), make('span', 'cart-line-price', money(wine.price * quantity)));
      const row = make('div', 'quantity-row');
      const controls = make('div', 'quantity-control');
      const less = make('button', '', '−');
      less.type = 'button';
      less.setAttribute('aria-label', `Retirer une bouteille de ${wine.name}`);
      const output = make('output', '', String(quantity));
      output.setAttribute('aria-label', `Quantité de ${wine.name}`);
      const more = make('button', '', '+');
      more.type = 'button';
      more.setAttribute('aria-label', `Ajouter une bouteille de ${wine.name}`);
      more.disabled = quantity >= 24;
      const remove = make('button', 'remove-line', 'Retirer');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Retirer ${wine.name} du panier`);
      const change = (next, focusLabel) => {
        if (next <= 0) cart.delete(id); else cart.set(id, Math.min(next, 24));
        invalidateOrder();
        renderCart();
        const focus = [...list.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === focusLabel && !button.disabled);
        (focus || cartDialog.querySelector('[data-close]')).focus();
        announce(next <= 0 ? `${wine.name} retiré du panier.` : `${wine.name} : ${Math.min(next, 24)} bouteille${next > 1 ? 's' : ''}.`);
      };
      less.addEventListener('click', () => change(quantity - 1, less.getAttribute('aria-label')));
      more.addEventListener('click', () => change(quantity + 1, more.getAttribute('aria-label')));
      remove.addEventListener('click', () => change(0, ''));
      controls.append(less, output, more);
      row.append(controls, remove);
      info.append(title, make('p', 'cart-line-type', `${wine.type} · ${money(wine.price)} / bouteille`), row);
      line.append(image, info);
      list.append(line);
    }
    const total = [...cart.entries()].reduce((sum, [id, q]) => sum + wines[id].price * q, 0);
    document.querySelector('#cart-total').textContent = money(total);
  }
  function addWine(id) {
    if (!Object.hasOwn(wines, id)) return;
    const quantity = cart.get(id) || 0;
    if (quantity >= 24) { announce('La démonstration est limitée à 24 bouteilles par cuvée.'); return; }
    cart.set(id, quantity + 1);
    invalidateOrder();
    renderCart();
    announce(`${wines[id].name} ajouté au panier. ${quantity + 1} bouteille${quantity > 0 ? 's' : ''} de cette cuvée.`);
  }
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addWine(button.dataset.add)));
  document.querySelector('[data-cart]').addEventListener('click', event => { renderCart(); open(cartDialog, event.currentTarget); });
  document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => {
    activeWine = button.dataset.detail;
    const wine = wines[activeWine];
    const image = document.querySelector('#product-image');
    image.src = wine.image;
    image.alt = `Illustration de la cuvée ${wine.name}`;
    document.querySelector('#product-title').textContent = wine.name;
    document.querySelector('#product-type').textContent = wine.type;
    document.querySelector('#product-description').textContent = wine.description;
    document.querySelector('#product-story').href = wine.story;
    document.querySelector('#product-profile').textContent = wine.profile;
    document.querySelector('#product-pairing').textContent = wine.pairing;
    document.querySelector('#product-service').textContent = wine.service;
    document.querySelector('.product-disclaimer').textContent = 'Cuvée fictive · Achat simulé';
    const price = document.querySelector('#product-price');
    price.replaceChildren(document.createTextNode(`${money(wine.price)} `), make('small', '', 'TTC / bouteille de 75 cl'));
    document.querySelector('#product-add').setAttribute('aria-label', `Ajouter ${wine.name} au panier`);
    open(productDialog, button);
  }));
  document.querySelector('#product-add').addEventListener('click', () => {
    addWine(activeWine);
    const result = document.querySelector('.product-disclaimer');
    result.textContent = `${wines[activeWine].name} : ${cart.get(activeWine)} bouteille(s) dans votre panier simulé.`;
    result.setAttribute('role', 'status');
  });
  document.querySelector('#product-story').addEventListener('click', event => {
    const target = document.querySelector(event.currentTarget.getAttribute('href'));
    productDialog.close();
    // Après le retour normal au déclencheur, déplacer le focus vers le récit choisi.
    requestAnimationFrame(() => {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  });
  document.querySelector('#simulate-order').addEventListener('click', () => {
    const result = document.querySelector('#order-result');
    result.replaceChildren(make('strong', '', 'Vous venez d’essayer le parcours de commande.'), document.createTextNode('Sur votre futur site, cette étape pourrait transmettre une demande au domaine ou mener à un paiement. Ici, aucune commande n’a été envoyée et rien n’a été débité.'));
    result.hidden = false;
    result.scrollIntoView({ block: 'nearest' });
  });

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.navigation');
  function closeMenu() {
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Ouvrir le menu');
  }
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('is-open', expanded);
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); menuButton.focus(); }
  });
  matchMedia('(max-width:760px)').addEventListener('change', closeMenu);

  const visitDate = document.querySelector('#visit-date');
  const date = new Date();
  const minimum = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  visitDate.min = iso(minimum);
  document.querySelector('[data-visit]').addEventListener('click', event => open(visitDialog, event.currentTarget));
  document.querySelector('#visit-guests').addEventListener('change', event => {
    document.querySelector('#visit-total').textContent = money(Number(event.target.value) * 1800);
    document.querySelector('#visit-result').hidden = true;
  });
  visitDate.addEventListener('input', () => { document.querySelector('#visit-result').hidden = true; });
  document.querySelector('#visit-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const guests = Number(document.querySelector('#visit-guests').value);
    const wishedDate = new Date(`${visitDate.value}T12:00:00`);
    const formatted = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(wishedDate);
    const result = document.querySelector('#visit-result');
    result.replaceChildren(make('strong', '', 'Votre visite, pour l’exemple.'), make('p', '', `${formatted} · ${guests} adulte${guests > 1 ? 's' : ''} · ${money(guests * 1800)} au tarif illustratif.`), make('p', '', 'Ceci est une simulation : aucune réservation n’a été effectuée et aucune information n’a été envoyée. Sur votre futur site, la demande pourrait être confirmée par le domaine.'));
    result.hidden = false;
    result.scrollIntoView({ block: 'nearest' });
  });
  // Le sommaire reste une navigation d'ancres native ; son état actif est un complément visuel.
  const chapterLinks = [...document.querySelectorAll('.year-navigation nav a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      chapterLinks.forEach(link => {
        const current = link.hash === `#${visible.target.id}`;
        link.classList.toggle('is-current', current);
        if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-20% 0px -55% 0px' });
    document.querySelectorAll('[data-chapter]').forEach(section => observer.observe(section));
  }
  // Les fonctions interactives ne deviennent cliquables qu’après initialisation.
  document.body.classList.add('js-ready');
  document.querySelectorAll('[data-cart], [data-add], [data-detail], [data-visit], .menu-toggle').forEach(button => { button.disabled = false; });
  renderCart();
})();
