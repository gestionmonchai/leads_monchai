'use strict';
(() => {
  const wines = {
    roche: { name: 'La Roche', type: 'Rouge · 2024 · 75 cl', price: 1800, image: 'assets/cuvee-rouge.svg', profile: 'Fruit noir, épices douces, tanins souples.', pairing: 'Légumes rôtis, champignons, cuisine mijotée.', service: '16–18 °C', description: 'Une cuvée imaginaire tout en profondeur. Le fruit ouvre la conversation, les notes épicées la prolongent. Un rouge pensé pour les grandes tablées et les repas qui prennent leur temps.' },
    aube: { name: 'L’Aube', type: 'Blanc · 2025 · 75 cl', price: 1600, image: 'assets/cuvee-blanc.svg', profile: 'Agrumes, fleurs blanches, fraîcheur.', pairing: 'Poisson grillé, fromage frais, légumes croquants.', service: '10–12 °C', description: 'La clarté d’un matin, la vivacité d’un premier rayon de soleil. Ce blanc imaginaire explore les agrumes et les fleurs blanches, avec une finale fraîche et délicate.' },
    echappee: { name: 'L’Échappée', type: 'Rosé · 2025 · 75 cl', price: 1400, image: 'assets/cuvee-rose.svg', profile: 'Petits fruits rouges, notes florales.', pairing: 'Salade estivale, légumes grillés, cuisine méditerranéenne.', service: '8–10 °C', description: 'Un rosé imaginaire pour accompagner la simplicité des beaux jours. De petits fruits rouges, une touche florale et le plaisir d’un repas partagé à l’ombre.' }
  };
  const articles = {
    vigne: { title: 'Chaque saison a son geste.', paragraphs: ['Le vignoble ne se raconte pas seulement au moment des vendanges. Il se lit dans les jours courts de l’hiver, quand le geste de taille prépare la saison suivante. Il se devine au printemps, quand les bourgeons invitent à observer avant d’intervenir.', 'L’été donne un autre rythme. Regarder les feuilles, suivre la maturité des baies, comprendre ce que le temps imprime au raisin : autant de façons d’accompagner le vivant. Puis vient le choix de la récolte, qui appartient à chaque lieu et à chaque vigneron.', 'Les Aulnes sont un domaine fictif. Sur votre site, ce carnet donnerait la parole à vos pratiques réelles, à vos choix et aux personnes qui les font vivre. Des textes courts, des images à vous, une histoire qui continue au fil des saisons.'] },
    table: { title: 'Le plaisir des accords simples.', paragraphs: ['Un accord commence souvent par ce qui est déjà sur la table : une belle tomate, une poêlée de champignons, un poisson grillé. On peut chercher un écho entre la fraîcheur d’un plat et celle d’un vin, ou laisser une texture en rencontrer une autre.', 'Dans cette collection imaginaire, L’Aube accompagne la légèreté d’une cuisine végétale. La Roche évoque les saveurs rôties et mijotées. L’Échappée imagine une table d’été, à partager sans cérémonie.', 'Ces cuvées sont fictives : ces accords illustrent une manière de présenter vos conseils. Votre site pourrait proposer vos recettes, vos températures de service et les occasions que vous associez à chaque vin.'] }
  };
  const money = cents => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const cart = new Map(); // Démonstration éphémère : ni stockage local ni service distant.
  const cartDialog = document.querySelector('#cart-dialog');
  const productDialog = document.querySelector('#product-dialog');
  const visitDialog = document.querySelector('#visit-dialog');
  const articleDialog = document.querySelector('#article-dialog');
  const dialogs = [cartDialog, productDialog, visitDialog, articleDialog];
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
    document.querySelector('[data-cart]').setAttribute('aria-label', `Ouvrir le panier, ${count} bouteille${count > 1 ? 's' : ''}`);
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
  document.querySelector('#simulate-order').addEventListener('click', () => {
    const result = document.querySelector('#order-result');
    result.replaceChildren(make('strong', '', 'Vous venez d’essayer le parcours de commande.'), document.createTextNode('Sur votre futur site, cette étape pourrait transmettre une demande au domaine ou mener à un paiement. Ici, aucune commande n’a été envoyée et rien n’a été débité.'));
    result.hidden = false;
    result.scrollIntoView({ block: 'nearest' });
  });

  const filters = document.querySelector('.filters');
  filters.hidden = false;
  filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    document.querySelectorAll('[data-wine]').forEach(card => {
      card.hidden = button.dataset.filter !== 'tous' && card.dataset.color !== button.dataset.filter;
      if (!card.hidden) count += 1;
    });
    document.querySelector('[data-filter-status]').textContent = `${count} cuvée${count > 1 ? 's' : ''} affichée${count > 1 ? 's' : ''}.`;
  }));
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
  document.querySelectorAll('[data-article]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const article = articles[link.dataset.article];
    document.querySelector('#article-title').textContent = article.title;
    document.querySelector('#article-body').replaceChildren(...article.paragraphs.map(text => make('p', '', text)));
    open(articleDialog, link);
  }));
  document.querySelector('[data-discover]').addEventListener('click', () => articleDialog.close());
  document.querySelectorAll('.article-fallback').forEach(node => { node.hidden = true; });
  // Les fonctions interactives ne deviennent cliquables qu’après initialisation.
  document.querySelectorAll('[data-cart], [data-add], [data-detail], [data-visit], .menu-toggle').forEach(button => { button.disabled = false; });
  renderCart();
})();
