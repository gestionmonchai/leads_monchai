'use strict';
(() => {
  const wines = {
    roche: { name: 'La Roche', type: 'Rouge · 2025 · 75 cl', price: 1800, image: 'assets/cuvee-rouge.svg', story: '#lieu-chai', profile: 'Fruit noir, épices douces, tanins souples.', pairing: 'Légumes rôtis, champignons, cuisine mijotée.', service: '16–18 °C', description: 'Dans ce scénario, La Roche se construit avec le suivi des lots, les dégustations et les essais d’assemblage. Choisir les proportions engage un goût recherché et des volumes à préparer. Retrouvez au chai le travail qui précède cette bouteille fictive.' },
    aube: { name: 'L’Aube', type: 'Blanc · 2025 · 75 cl', price: 1600, image: 'assets/cuvee-blanc.svg', story: '#lieu-vignes', profile: 'Agrumes, fleurs blanches, fraîcheur.', pairing: 'Poisson grillé, fromage frais, légumes croquants.', service: '10–12 °C', description: 'Ce blanc imaginaire relie la fraîcheur recherchée dans le verre au travail dans les vignes et au choix du moment de récolte. Retournez au lieu pour retrouver le début de ce récit.' }
  };
  const money = cents => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const cart = new Map(); // Démonstration éphémère : ni stockage local ni service distant.
  const cartDialog = document.querySelector('#cart-dialog');
  const productDialog = document.querySelector('#product-dialog');
  const visitDialog = document.querySelector('#visit-dialog');
  const mcDialog = document.querySelector('#mc-dialog');
  const dialogs = [cartDialog, productDialog, visitDialog, mcDialog];
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
      else if (dialog === mcDialog && trigger?.dataset.mc) document.querySelector(`.map-pin[data-place="${trigger.dataset.mc}"]`)?.focus({preventScroll:true});
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
  const steps = globalThis.AulnesSaisons;
  const panel = document.querySelector('#story-panel');
  const directory = document.querySelector('.places-directory');
  panel.append(directory);
  const toolbar = document.querySelector('.story-toolbar');
  const welcome = document.querySelector('#panel-welcome');
  const tourContext = document.querySelector('#tour-context');
  const tourControls = document.querySelector('.tour-controls');
  const backMap = document.querySelector('.back-map');
  const scene = document.querySelector('.map-area');
  const particles = document.querySelector('.season-particles');
  const sceneControls = document.querySelector('.scene-controls');
  const pauseButton = document.querySelector('#pause-season');
  const seasonStatus = document.querySelector('#season-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = matchMedia('(max-width:680px)');
  const baseStories = new Map([...document.querySelectorAll('[data-story]')].map(article => [article.dataset.story, {
    title: article.querySelector('h2').innerHTML,
    paragraphs: [...article.querySelectorAll(':scope > p:not(.place-index)')].map(p => p.textContent),
    people: article.querySelector('.people-note p').textContent,
    peopleTitle: article.querySelector('.people-note h3').textContent
  }]));
  const baseSaas = document.querySelector('#saas-season').textContent;
  const baseWelcome = welcome.querySelector('h2').innerHTML;
  const baseWelcomeText = welcome.querySelector('p:last-child').textContent;
  let selectedPlace = null;
  let selectedStep = null;
  let lastRoute = '';
  let drawnSeason = null;
  let motionPaused = false;
  let mapVisible = true;
  const moveTo = node => node.scrollIntoView({ block:'start', behavior:reducedMotion.matches ? 'instant' : 'smooth' });

  const canvas = document.querySelector('.map-canvas');
  const landscape = canvas.querySelector(':scope > img');
  const baseAlt = landscape.alt;
  const landscapeStatus = document.querySelector('#landscape-status');
  const retryLandscape = document.querySelector('#retry-landscape');
  const landscapeAlts = {
    hiver: 'Le domaine en hiver : ceps sans feuilles, neige sur les rangs, les terrasses et les toits, arbres défeuillés.',
    printemps: 'Le domaine au printemps : jeunes pousses vert tendre dans les rangs et feuillage naissant autour des bâtiments.',
    ete: 'Le domaine en été : vignes au feuillage vert abondant et terrasses ensoleillées.',
    automne: 'Le domaine en automne : rangs de vigne rouges, cuivrés et ocres, arbres aux couleurs d’automne.'
  };
  let landscapeKey = null;
  let landscapeRequest = 0;
  const loadedLandscapes = new Map();
  function setLandscape(src, alt) {
    landscape.src = src;
    landscape.alt = alt;
    document.querySelector('.enlarge-map').href = src;
  }
  async function updateLandscape(key, force = false) {
    if (key === landscapeKey && !force) return;
    landscapeKey = key;
    const request = ++landscapeRequest;
    if (document.activeElement === retryLandscape) document.querySelector(`[data-step="${selectedStep}"]`)?.focus({preventScroll:true});
    retryLandscape.hidden = true;
    if (!key) {
      setLandscape('assets/domaine.webp', baseAlt);
      landscapeStatus.hidden = true;
      return;
    }
    landscapeStatus.textContent = `Chargement du paysage : ${steps.find(s => s.id === key).label}…`;
    landscapeStatus.hidden = false;
    // Une image de l’ancienne saison ne doit pas passer pour la nouvelle.
    setLandscape('assets/domaine.webp', baseAlt);
    const src = `assets/domaine-${key}.webp`;
    if (!loadedLandscapes.has(src)) {
      loadedLandscapes.set(src, new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(src);
        image.onerror = () => reject(new Error('Paysage indisponible'));
        image.src = src;
      }));
    }
    try {
      await loadedLandscapes.get(src);
      if (request !== landscapeRequest) return;
      setLandscape(src, landscapeAlts[key]);
      landscapeStatus.textContent = `Paysage : ${steps.find(s => s.id === key).label}.`;
      landscapeStatus.hidden = true;
    } catch {
      loadedLandscapes.delete(src);
      if (request !== landscapeRequest) return;
      setLandscape('assets/domaine.webp', baseAlt);
      landscapeStatus.textContent = 'Paysage de saison indisponible. La vue générale et les récits restent accessibles.';
      retryLandscape.hidden = false;
    }
  }
  retryLandscape.addEventListener('click', () => updateLandscape(landscapeKey, true));

  const functions = globalThis.AulnesFonctions;
  let mcPlace = 'vignes';
  let mcIndex = 0;
  let mcTrigger = null;
  const mcScreen = document.querySelector('#mc-screen');
  const mcImageStatus = document.querySelector('#mc-image-status');
  function positionMc() {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    const compact = width < 700;
    const current = selectedPlace || 'vignes';
    const centers = Object.entries(places).map(([id, p]) => ({id, x:p[0]/1536*width, y:p[1]/1024*height}));
    for (const button of canvas.querySelectorAll('[data-mc]')) {
      const id = button.dataset.mc;
      button.hidden = compact && id !== current;
      const center = centers.find(p => p.id === id);
      const candidates = [[44,0],[-44,0],[0,44],[0,-44]];
      const score = ([dx,dy]) => {
        const x=center.x+dx,y=center.y+dy;
        let cost = Math.max(0,22-x,22-y,x+22-width,y+22-height)*10000;
        for (const pin of centers) cost += Math.max(0,44-Math.abs(pin.x-x))*Math.max(0,44-Math.abs(pin.y-y));
        return cost;
      };
      candidates.sort((a,b)=>score(a)-score(b));
      const [dx,dy]=candidates[0];
      button.style.left=`${center.x+dx}px`;
      button.style.top=`${center.y+dy}px`;
    }
  }
  function positionPopover() {
    const rect = mcTrigger?.getBoundingClientRect();
    const width=mcDialog.offsetWidth, height=mcDialog.offsetHeight;
    const margin=12;
    const left=innerWidth < 680 ? (innerWidth-width)/2 : Math.max(margin,Math.min((rect?.right || innerWidth/2)+8,innerWidth-width-margin));
    const top=innerWidth < 680 ? Math.max(margin,(innerHeight-height)/2) : Math.max(margin,Math.min((rect?.top || 100)-20,innerHeight-height-margin));
    mcDialog.style.left=`${left}px`;
    mcDialog.style.top=`${top}px`;
  }
  function renderMc() {
    const place=functions.places[mcPlace];
    const feature=functions.features[place.slides[mcIndex]];
    document.querySelector('#mc-place').textContent=place.label;
    document.querySelector('#mc-intro').textContent=place.intro;
    document.querySelector('#mc-feature').textContent=feature.title;
    document.querySelector('#mc-description').textContent=feature.text;
    mcImageStatus.textContent='Chargement de la capture…';
    mcScreen.hidden=false;
    mcScreen.alt=`Capture Mon Chai : ${feature.title} ; données de démonstration`;
    mcScreen.src=feature.image;
    const enlarge=document.querySelector('#mc-enlarge');
    enlarge.href=feature.image;
    enlarge.setAttribute('aria-label',`Agrandir la capture ${feature.title}, nouvel onglet`);
    document.querySelector('#mc-discover').href=feature.href;
    document.querySelector('#mc-count').textContent=`${mcIndex+1} / ${place.slides.length}`;
    document.querySelector('#mc-prev').disabled=mcIndex===0;
    document.querySelector('#mc-next').disabled=mcIndex===place.slides.length-1;
    if (mcScreen.complete && mcScreen.naturalWidth) mcImageStatus.textContent='';
    if (mcDialog.open) positionPopover();
  }
  mcScreen.addEventListener('load',()=>{ mcImageStatus.textContent=''; positionPopover(); });
  mcScreen.addEventListener('error',()=>{ mcScreen.hidden=true; mcImageStatus.textContent='Capture indisponible. Essayez le lien « Agrandir la capture ».'; positionPopover(); });
  document.querySelectorAll('[data-mc]').forEach(button => button.addEventListener('click',()=>{
    mcPlace=button.dataset.mc;
    mcIndex=0;
    mcTrigger=button;
    renderMc();
    open(mcDialog,button);
    positionPopover();
  }));
  function moveMc(delta) {
    const next=mcIndex+delta;
    if (next<0 || next>=functions.places[mcPlace].slides.length) return;
    mcIndex=next;
    const focused=document.activeElement;
    renderMc();
    // Une flèche devenue désactivée ne doit pas laisser le focus hors du dialogue.
    if (focused.disabled) document.querySelector(delta>0?'#mc-prev':'#mc-next').focus();
  }
  document.querySelector('#mc-prev').addEventListener('click',()=>moveMc(-1));
  document.querySelector('#mc-next').addEventListener('click',()=>moveMc(1));
  mcDialog.addEventListener('keydown',event=>{
    if (event.key==='Tab') {
      const targets=[...mcDialog.querySelectorAll('button:not(:disabled),a[href]')].filter(node=>node.checkVisibility());
      const first=targets[0], last=targets[targets.length-1];
      if (event.shiftKey && document.activeElement===first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement===last) { event.preventDefault(); first.focus(); }
    }
    if (event.key==='ArrowLeft' || event.key==='ArrowRight') { event.preventDefault(); moveMc(event.key==='ArrowLeft'?-1:1); }
  });

  function routeKey() { return `${location.search}|${location.hash}`; }
  function setAddress(place) {
    const url = new URL(location.href);
    if (selectedStep === null) url.searchParams.delete('saison');
    else url.searchParams.set('saison', steps[selectedStep].id);
    url.hash = place ? `lieu-${place}` : 'domaine';
    if (url.href !== location.href) history.pushState(null, '', url);
    lastRoute = routeKey();
  }
  function updateMotion() {
    const active = selectedStep !== null;
    const running = active && !motionPaused && !reducedMotion.matches && !document.hidden && mapVisible;
    scene.dataset.running = String(running);
    scene.dataset.paused = String(motionPaused || reducedMotion.matches);
    sceneControls.hidden = !active;
    pauseButton.disabled = reducedMotion.matches;
    pauseButton.setAttribute('aria-pressed', String(motionPaused || reducedMotion.matches));
    pauseButton.textContent = reducedMotion.matches ? 'Mouvements réduits' : motionPaused ? 'Reprendre les animations' : 'Mettre les animations en pause';
    const label = active ? steps[selectedStep].label : 'Vue d’ensemble';
    const motion = !active ? 'Choisissez une saison pour faire évoluer les récits.'
      : reducedMotion.matches ? 'Décor immobile selon votre préférence de mouvements réduits.'
      : motionPaused ? 'Animations en pause.' : 'Ambiance illustrée animée.';
    seasonStatus.textContent = `${label} · ${motion}`;
  }
  function buildParticles() {
    particles.replaceChildren();
    if (selectedStep === null || reducedMotion.matches) return;
    const count = smallScreen.matches ? 16 : 28;
    const summer = steps[selectedStep].id === 'ete';
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const p = document.createElement('i');
      p.className = 'season-particle';
      // Répartition déterministe : pas de calcul à chaque image de l'animation.
      p.style.setProperty('--left', `${5 + ((index * 37) % 90)}%`);
      p.style.setProperty('--size', `${summer ? 2 + index % 3 : 4 + index % 5}px`);
      p.style.setProperty('--duration', `${summer ? 17 + index % 8 : 10 + index % 9}s`);
      p.style.setProperty('--delay', `${-((index * 2.7) % 19)}s`);
      p.style.setProperty('--drift', `${(index % 2 ? 1 : -1) * (22 + index % 7 * 9)}px`);
      p.style.setProperty('--turn', `${index % 2 ? 230 : -190}deg`);
      p.style.setProperty('--tone', String(index % 3));
      fragment.append(p);
    }
    particles.append(fragment);
  }
  function applySeason() {
    const season = selectedStep === null ? null : steps[selectedStep];
    const key = season?.id || '';
    scene.dataset.season = key;
    document.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === selectedStep)));
    document.querySelector('#map-description').textContent = season ? season.caption : 'Une carte imaginée, sept portes d’entrée. Les repères ouvrent le récit de chaque lieu.';
    document.querySelector('#saas-season').textContent = season ? season.saas : baseSaas;
    for (const article of document.querySelectorAll('[data-story]')) {
      const story = season?.stories[article.dataset.story];
      const base = baseStories.get(article.dataset.story);
      const title = article.querySelector('h2');
      if (story) title.textContent = story.title; else title.innerHTML = base.title;
      article.querySelectorAll(':scope > p:not(.place-index)').forEach((p,index) => { p.textContent = story ? [story.p1,story.p2][index] : base.paragraphs[index]; });
      article.querySelector('.people-note p').textContent = story ? story.people : base.people;
      article.querySelector('.people-note h3').textContent = story ? 'Les personnes et les décisions' : base.peopleTitle;
    }
    if (key !== drawnSeason) {
      drawnSeason = key;
      buildParticles();
    }
    if (season) welcome.querySelector('h2').textContent = `${season.label}, lieu par lieu.`;
    else welcome.querySelector('h2').innerHTML = baseWelcome;
    welcome.querySelector('p:last-child').textContent = season ? season.text : baseWelcomeText;
    tourContext.hidden = selectedStep === null || selectedPlace === null;
    tourControls.hidden = selectedStep === null || selectedPlace === null;
    document.querySelector('#story-context').textContent = season ? `${season.label.toUpperCase()} · LE DOMAINE, LIEU PAR LIEU` : 'LE DOMAINE, LIEU PAR LIEU';
    if (season) {
      document.querySelector('#tour-label').textContent = `${selectedStep + 1} / 4 · ${season.label.toUpperCase()}`;
      document.querySelector('#tour-text').textContent = season.text;
      document.querySelector('#tour-count').textContent = `${selectedStep + 1} / 4`;
      document.querySelector('#tour-prev').disabled = selectedStep === 0;
      document.querySelector('#tour-next').disabled = selectedStep === steps.length - 1;
    }
    updateLandscape(key);
    positionMc();
    updateMotion();
  }
  function showPlace(place, { address=true, focus=true, reveal=false } = {}) {
    if (!Object.hasOwn(places,place)) return;
    selectedPlace = place;
    welcome.hidden = true;
    toolbar.hidden = false;
    backMap.hidden = false;
    panel.classList.add('has-selection');
    directory.open = false;
    document.querySelectorAll('[data-story]').forEach(article => article.classList.toggle('is-active',article.dataset.story === place));
    document.querySelectorAll('.map-pin, .places-directory a').forEach(link => {
      const current = link.dataset.place === place;
      link.classList.toggle('is-active',current);
      if (current) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
    applySeason();
    if (address) setAddress(place);
    if (focus) {
      document.querySelector(`#lieu-${place} h2`).focus({preventScroll:true});
      const bounds = panel.getBoundingClientRect();
      if (reveal || smallScreen.matches || bounds.top < -30 || bounds.top > innerHeight * .7) moveTo(panel);
    }
  }
  function resetMap({ address=true, focus=true, overview=false } = {}) {
    const previous = selectedPlace;
    selectedPlace = null;
    if (overview) selectedStep = null;
    welcome.hidden = false;
    toolbar.hidden = true;
    backMap.hidden = true;
    panel.classList.remove('has-selection');
    directory.open = true;
    document.querySelectorAll('[data-story]').forEach(article => article.classList.remove('is-active'));
    document.querySelectorAll('.map-pin, .places-directory a').forEach(link => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    applySeason();
    if (address) setAddress(null);
    if (focus) {
      const target = overview ? document.querySelector('[data-step]') : previous ? document.querySelector(`.map-pin[data-place="${previous}"]`) : document.querySelector('.map-pin');
      target.focus({preventScroll:true});
      moveTo(overview ? document.querySelector('.year-path') : scene);
    }
  }
  function chooseSeason(step) {
    if (!steps[step]) return;
    selectedStep = step;
    // Le bouton garde le focus : sur mobile, la carte animée reste devant le récit.
    showPlace(selectedPlace || steps[step].place,{focus:false});
  }
  function readRoute({ focus=true } = {}) {
    const key = routeKey();
    if (key === lastRoute) return;
    lastRoute = key;
    const season = new URL(location.href).searchParams.get('saison');
    const index = steps.findIndex(step => step.id === season);
    selectedStep = index < 0 ? null : index;
    const match = /^#lieu-([a-z]+)$/.exec(location.hash);
    if (match && Object.hasOwn(places,match[1])) showPlace(match[1],{address:false,focus});
    else if (!location.hash && selectedStep !== null) showPlace(steps[selectedStep].place,{address:false,focus});
    else resetMap({address:false,focus:false});
  }
  document.querySelectorAll('[data-place]').forEach(link => link.addEventListener('click',event => {
    event.preventDefault();
    showPlace(link.dataset.place,{reveal:Boolean(link.closest('.wine-card'))});
  }));
  document.querySelectorAll('[data-close-place]').forEach(button => button.addEventListener('click',() => resetMap()));
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click',() => chooseSeason(Number(button.dataset.step))));
  document.querySelector('#tour-prev').addEventListener('click',() => { if (selectedStep > 0) chooseSeason(selectedStep - 1); });
  document.querySelector('#tour-next').addEventListener('click',() => { if (selectedStep !== null && selectedStep < steps.length - 1) chooseSeason(selectedStep + 1); });
  document.querySelector('#clear-season').addEventListener('click',() => resetMap({overview:true}));
  pauseButton.addEventListener('click',() => { motionPaused = !motionPaused; updateMotion(); });
  reducedMotion.addEventListener('change',() => { buildParticles(); updateMotion(); });
  smallScreen.addEventListener('change',buildParticles);
  document.addEventListener('visibilitychange',updateMotion);
  const measureScene = () => { scene.style.setProperty('--travel',`${document.querySelector('.map-canvas').clientHeight + 32}px`); positionMc(); if (mcDialog.open) positionPopover(); };
  measureScene();
  addEventListener('resize',measureScene,{passive:true});
  if ('IntersectionObserver' in globalThis) new IntersectionObserver(entries => {
    mapVisible = entries[0].isIntersecting;
    updateMotion();
  },{threshold:0}).observe(document.querySelector('.map-canvas'));
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && !event.defaultPrevented && selectedPlace && !dialogs.some(dialog => dialog.open) && !menu.classList.contains('is-open')) resetMap();
  });
  addEventListener('popstate',() => readRoute());
  addEventListener('hashchange',() => readRoute());
  document.body.classList.add('js-ready');
  document.querySelectorAll('[data-cart], [data-add], [data-detail], [data-visit], .menu-toggle, [data-step], [data-close-place], #clear-season, [data-mc]').forEach(button => { button.disabled = false; });
  renderCart();
  readRoute({focus:Boolean(location.hash.startsWith('#lieu-'))});
  applySeason();
})();
