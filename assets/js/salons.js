'use strict';
(() => {
  const form = document.getElementById('form-salons');
  if (!form) return;
  const panel = document.getElementById('recherche-salons');
  const region = document.getElementById('region-salons');
  const period = document.getElementById('periode-salons');
  const query = document.getElementById('q-salons');
  const archives = document.getElementById('archives-salons');
  const local = document.getElementById('locaux-salons');
  const counter = document.getElementById('nombre-salons');
  const chips = document.getElementById('criteres-salons');
  const empty = document.getElementById('salons-vide');
  const heading = document.getElementById('titre-resultats-salons');
  const clean = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’'\u2011-]/g, ' ');
  const generic = new Set(['salon','salons','vin','vins','viticole','viticoles','vigneron','vignerons','de','du','des','pour']);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const ranges = {'2026':['2026-01-01','2026-12-31'], '2027-t1':['2027-01-01','2027-03-31'], '2027-t2':['2027-04-01','2027-06-30'], '2027-s2':['2027-07-01','2027-12-31']};
  const cards = Array.from(document.querySelectorAll('[data-salon]'), node => ({node, text:clean(node.dataset.texte), organizer:clean(node.dataset.organisateur || ''), past:node.dataset.fin ? node.dataset.fin < today : Number(node.dataset.annee) < now.getFullYear()}));
  for (const card of cards) card.node.querySelector('.sl-past').hidden = !card.past;
  function chip(label, control, clear) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label + ' ×';
    button.setAttribute('aria-label', 'Retirer le critère : ' + label);
    button.addEventListener('click', () => { clear(); update(); control.focus({preventScroll:true}); });
    chips.append(button);
  }
  function update() {
    const goal = form.querySelector('[name=objectif]:checked');
    const words = clean(query.value.trim()).split(/\s+/).filter(w => w && !generic.has(w));
    const phrase = clean(query.value.trim()).replace(/\s+/g, ' ');
    const namedOrganizer = phrase && cards.some(card => card.organizer.includes(phrase));
    const interval = ranges[period.value];
    let count = 0;
    for (const card of cards) {
      const d = card.node.dataset;
      const dates = !period.value || (period.value === 'incertain' ? d.statut !== 'annoncees' : !!d.debut && d.debut <= interval[1] && d.fin >= interval[0]);
      const textMatch = namedOrganizer ? card.text.includes(phrase) : words.every(w => card.text.includes(w));
      const match = (!goal.value || d.objectif === goal.value) && (!region.value || d.region === region.value) && (!local.checked || d.local === 'oui') && dates && (archives.checked || !card.past) && textMatch;
      card.node.hidden = !match;
      if (match) count++;
    }
    counter.textContent = `${count} édition${count===1?'':'s'} sur ${cards.length}`;
    document.getElementById('quantite-salons').textContent = count;
    empty.hidden = count>0;
    document.getElementById('inclure-archives-vides').hidden = count>0 || archives.checked || !cards.some(c=>c.past);
    chips.replaceChildren();
    if (goal.value) chip(goal.parentElement.textContent, form.querySelector('[name=objectif][value=""]'), () => { form.querySelector('[name=objectif][value=""]').checked=true; });
    for (const control of [region, period]) if (control.value) chip(control.selectedOptions[0].textContent, control, () => {control.value='';});
    if (query.value.trim()) chip(query.value.trim(), query, () => {query.value='';});
    if (archives.checked) chip('Éditions passées incluses', archives, () => {archives.checked=false;});
    if (local.checked) chip('Événements locaux', local, () => {local.checked=false;});
    chips.hidden = !chips.childElementCount;
  }
  function reset() {
    form.querySelector('[name=objectif][value=""]').checked=true;
    region.value=period.value=query.value='';
    archives.checked=false;
    local.checked=false;
    update();
  }
  form.addEventListener('change',update);
  query.addEventListener('input',update);
  form.addEventListener('submit',event => {event.preventDefault();update();heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});});
  form.addEventListener('reset',event => {event.preventDefault();reset();form.querySelector('[name=objectif][value=""]').focus();});
  document.getElementById('inclure-archives-vides').addEventListener('click',()=>{archives.checked=true;update();heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});});
  function revealHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (target && target.matches('[data-salon]')) {
      reset();
      if (cards.find(c=>c.node===target).past) { archives.checked=true;update(); }
      target.scrollIntoView({block:'start'});
    }
  }
  update();
  panel.hidden=false;
  document.getElementById('modifier-salons').hidden=false;
  for (const link of document.querySelectorAll('[data-ouvrir-recherche]')) link.href='#recherche-salons';
  window.addEventListener('hashchange',revealHash);
  revealHash();
})();
