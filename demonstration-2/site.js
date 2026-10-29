'use strict';
(() => {
  const wines = {
    roche: { name: 'La Roche', type: 'Rouge · 2025 · 75 cl', price: 1800, image: 'assets/cuvee-rouge.svg', story: '#lieu-chai', profile: 'Fruit noir, épices douces, tanins souples.', pairing: 'Légumes rôtis, champignons, cuisine mijotée.', service: '16–18 °C', description: 'Cette cuvée imaginaire prolonge les essais d’assemblage racontés au chai : chercher le fruit et la tenue en bouche, goûter à plusieurs, reprendre le choix. Son profil et son prix illustrent une fiche de vin.' },
    aube: { name: 'L’Aube', type: 'Blanc · 2025 · 75 cl', price: 1600, image: 'assets/cuvee-blanc.svg', story: '#lieu-vignes', profile: 'Agrumes, fleurs blanches, fraîcheur.', pairing: 'Poisson grillé, fromage frais, légumes croquants.', service: '10–12 °C', description: 'Ce blanc imaginaire relie la fraîcheur recherchée dans le verre au travail dans les vignes et au choix du moment de récolte. Retournez au lieu pour retrouver le début de ce récit.' }
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
    event.preventDefault();
    const place = event.currentTarget.hash.replace('#lieu-', '');
    productDialog.close();
    requestAnimationFrame(() => {
      showPlace(place, { focus: true, reveal: true });
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
    menuButton.querySelector('span').textContent = '+';
  }
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('is-open', expanded);
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Fermer le menu' : 'Ouvrir le menu');
    menuButton.querySelector('span').textContent = expanded ? '−' : '+';
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) { event.preventDefault(); closeMenu(); menuButton.focus(); }
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
  // Les lieux existent aussi en HTML : les mêmes ancres fonctionnent sans script.
  const places = {
    vignes: [351, 185], maison: [616, 242], chai: [1054, 349],
    caveau: [512, 556], jardin: [800, 544], eau: [1398, 547], recolte: [1088, 682]
  };
  const steps = [
    { label: 'Hiver', place: 'vignes', text: 'Tailler, transmettre le geste, préparer ce qui poussera. Pendant ce temps, un autre millésime continue son élevage.' },
    { label: 'Printemps', place: 'eau', text: 'Observer ce qui change et revoir le programme. Les prévisions, l’état des parcelles et l’organisation se rencontrent.' },
    { label: 'Vendanges', place: 'recolte', text: 'Choisir le moment, réunir l’équipe, accompagner le raisin de la parcelle au chai.' },
    { label: 'Au chai', place: 'chai', text: 'Suivre les lots, goûter et assembler. Le travail du vin se poursuit alors que la vigne prépare déjà la suite.' }
  ];
  const panel = document.querySelector('#story-panel');
  const directory = document.querySelector('.places-directory');
  // En HTML seul, la liste précède les récits ; le panneau interactif la range ensuite en bas.
  panel.append(directory);
  const toolbar = document.querySelector('.story-toolbar');
  const welcome = document.querySelector('#panel-welcome');
  const tourContext = document.querySelector('#tour-context');
  const tourControls = document.querySelector('.tour-controls');
  const backMap = document.querySelector('.back-map');
  let selectedPlace = null;
  let selectedStep = null;
  let lastRoute = '';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const moveTo = node => node.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });

  function routeKey() { return `${location.hash}|${history.state?.demo2?.step ?? ''}`; }
  function setAddress(place, step) {
    const hash = place ? `#lieu-${place}` : '#domaine';
    const state = { ...(history.state || {}), demo2: { place, step } };
    if (location.hash !== hash || history.state?.demo2?.step !== step) history.pushState(state, '', hash);
    lastRoute = routeKey();
  }
  function setRouteLine(step) {
    let path = '';
    if (step !== null && step > 0) {
      const points = steps.slice(0, step + 1).map(item => places[item.place]);
      path = `M ${points[0][0]} ${points[0][1]}`;
      for (let index = 1; index < points.length; index += 1) {
        const [x0, y0] = points[index - 1];
        const [x1, y1] = points[index];
        path += ` Q ${(x0 + x1) / 2} ${Math.min(y0, y1) - 70}, ${x1} ${y1}`;
      }
    }
    document.querySelector('#route-path').setAttribute('d', path);
    document.querySelector('#map-description').textContent = path
      ? 'Les pointillés relient les étapes du récit, sans indiquer un chemin de visite.'
      : 'Une carte imaginée, sept portes d’entrée. Les repères ouvrent le récit de chaque lieu.';
  }
  function showPlace(place, { step = null, address = true, focus = true, reveal = false } = {}) {
    if (!Object.hasOwn(places, place)) return;
    selectedPlace = place;
    selectedStep = Number.isInteger(step) && steps[step]?.place === place ? step : null;
    welcome.hidden = true;
    toolbar.hidden = false;
    backMap.hidden = false;
    panel.classList.add('has-selection');
    directory.open = false;
    document.querySelectorAll('[data-story]').forEach(article => article.classList.toggle('is-active', article.dataset.story === place));
    document.querySelectorAll('.map-pin, .places-directory a').forEach(link => {
      const current = link.dataset.place === place;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === selectedStep)));
    tourContext.hidden = selectedStep === null;
    tourControls.hidden = selectedStep === null;
    document.querySelector('#story-context').textContent = selectedStep === null ? 'LE DOMAINE, LIEU PAR LIEU' : 'AU FIL DE L’ANNÉE';
    if (selectedStep !== null) {
      document.querySelector('#tour-label').textContent = `${selectedStep + 1} / 4 · ${steps[selectedStep].label.toUpperCase()}`;
      document.querySelector('#tour-text').textContent = steps[selectedStep].text;
      document.querySelector('#tour-count').textContent = `${selectedStep + 1} / 4`;
      document.querySelector('#tour-prev').disabled = selectedStep === 0;
      document.querySelector('#tour-next').disabled = selectedStep === steps.length - 1;
    }
    setRouteLine(selectedStep);
    if (address) setAddress(place, selectedStep);
    if (focus) {
      const title = document.querySelector(`#lieu-${place} h2`);
      title.focus({ preventScroll: true });
      const bounds = panel.getBoundingClientRect();
      if (reveal || matchMedia('(max-width:680px)').matches || bounds.top < -30 || bounds.top > innerHeight * .7) moveTo(panel);
    }
  }
  function resetMap({ address = true, focus = true } = {}) {
    const previous = selectedPlace;
    selectedPlace = null;
    selectedStep = null;
    welcome.hidden = false;
    toolbar.hidden = true;
    backMap.hidden = true;
    tourContext.hidden = true;
    tourControls.hidden = true;
    panel.classList.remove('has-selection');
    directory.open = true;
    document.querySelectorAll('[data-story]').forEach(article => article.classList.remove('is-active'));
    document.querySelectorAll('.map-pin, .places-directory a').forEach(link => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    setRouteLine(null);
    if (address) setAddress(null, null);
    if (focus) {
      const pin = previous ? document.querySelector(`.map-pin[data-place="${previous}"]`) : document.querySelector('.map-pin');
      pin.focus({ preventScroll: true });
      moveTo(document.querySelector('.map-area'));
    }
  }
  function readRoute({ focus = true } = {}) {
    const key = routeKey();
    if (key === lastRoute) return;
    lastRoute = key;
    const match = /^#lieu-([a-z]+)$/.exec(location.hash);
    if (match && Object.hasOwn(places, match[1])) {
      const step = history.state?.demo2?.step;
      showPlace(match[1], { step, address: false, focus });
    } else resetMap({ address: false, focus: false });
  }
  document.querySelectorAll('[data-place]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    showPlace(link.dataset.place, { reveal: Boolean(link.closest('.wine-card')) });
  }));
  document.querySelectorAll('[data-close-place]').forEach(button => button.addEventListener('click', () => resetMap()));
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    const step = Number(button.dataset.step);
    showPlace(steps[step].place, { step, reveal: true });
  }));
  document.querySelector('#tour-prev').addEventListener('click', () => {
    if (selectedStep > 0) showPlace(steps[selectedStep - 1].place, { step: selectedStep - 1 });
  });
  document.querySelector('#tour-next').addEventListener('click', () => {
    if (selectedStep !== null && selectedStep < steps.length - 1) showPlace(steps[selectedStep + 1].place, { step: selectedStep + 1 });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !event.defaultPrevented && selectedPlace && !dialogs.some(dialog => dialog.open) && !menu.classList.contains('is-open')) resetMap();
  });
  addEventListener('popstate', () => readRoute());
  addEventListener('hashchange', () => readRoute());
  // Les fonctions interactives ne deviennent cliquables qu’après initialisation.
  document.body.classList.add('js-ready');
  document.querySelectorAll('[data-cart], [data-add], [data-detail], [data-visit], .menu-toggle').forEach(button => { button.disabled = false; });
  document.querySelectorAll('[data-step], [data-close-place]').forEach(button => { button.disabled = false; });
  renderCart();
  readRoute({ focus: Boolean(location.hash.startsWith('#lieu-')) });
})();
