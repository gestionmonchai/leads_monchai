'use strict';
(() => {
  const form = document.getElementById('form-aides');
  if (!form) return;
  const panel = document.getElementById('recherche');
  const query = document.getElementById('q-aides');
  const fields = ['etape', 'territoire', 'type', 'statut'];
  const controls = Object.fromEntries(fields.map(k => [k, document.getElementById(k + '-aides')]));
  const normalise = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’'\u2011-]/g, ' ');
  const cards = Array.from(document.querySelectorAll('[data-aide]'), node => ({node, text: normalise(node.dataset.texte), zones: node.dataset.territoire.split(' ')}));
  const dom = new Set(['gua','guy','mar','may','reu']);
  const counter = document.getElementById('nombre-aides');
  const empty = document.getElementById('aides-vide');
  const details = panel.querySelector('details');
  const summary = document.getElementById('filtres-actifs');
  function update() {
    const words = normalise(query.value.trim()).split(/\s+/).filter(Boolean);
    const region = controls.territoire.value;
    let visible = 0;
    for (const card of cards) {
      const territory = !region || (region === 'national' ? card.zones.includes('fr') || card.zones.includes('metropole') : card.zones.includes(region) || card.zones.includes('fr') || (!dom.has(region) && card.zones.includes('metropole')));
      const matches = territory && words.every(w => card.text.includes(w)) && ['etape','type','statut'].every(k => !controls[k].value || card.node.dataset[k] === controls[k].value);
      card.node.hidden = !matches;
      if (matches) visible++;
    }
    for (const section of document.querySelectorAll('.aides-etape')) section.hidden = !section.querySelector('[data-aide]:not([hidden])');
    empty.hidden = visible > 0;
    counter.textContent = `${visible} fiche${visible === 1 ? '' : 's'} sur ${cards.length}`;
    const count = fields.filter(k => controls[k].value).length;
    summary.textContent = count ? `· ${count} filtre${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}` : '';
  }
  // Interception avant révélation : la recherche n'envoie aucune requête réseau.
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  query.addEventListener('input', update);
  for (const control of Object.values(controls)) control.addEventListener('change', update);
  form.addEventListener('reset', event => {
    event.preventDefault();
    query.value = '';
    for (const control of Object.values(controls)) control.value = '';
    update();
    query.focus();
  });
  // Un lien d'étape rétablit sa visibilité lorsque des filtres l'avaient masquée.
  for (const link of document.querySelectorAll('.aides-parcours a')) link.addEventListener('click', () => {
    query.value = '';
    for (const control of Object.values(controls)) control.value = '';
    update();
    if (window.innerWidth < 900) details.open = false;
  });
  details.open = window.innerWidth >= 900;
  update();
  panel.hidden = false;
})();
