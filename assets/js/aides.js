'use strict';
(() => {
  const form = document.getElementById('form-aides');
  if (!form) return;
  const panel = document.getElementById('recherche');
  const query = document.getElementById('q-aides');
  const fields = ['etape', 'territoire', 'type', 'statut'];
  const controls = Object.fromEntries(fields.map(k => [k, document.getElementById(k + '-aides')]));
  const normalise = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’'\u2011-]/g, ' ');
  const generic = new Set(['aide', 'aides', 'financement', 'financements', 'dispositif', 'dispositifs', 'soutien', 'soutiens', 'viticole', 'viticoles', 'viticulture', 'vigneron', 'vignerons', 'pour', 'de', 'du', 'des', 'la', 'le', 'les', 'en']);
  const synonyms = {subvention: ['subvention', 'subventions', 'dotation', 'dotations'], pret: ['pret', 'prets', 'credit', 'credits'], exoneration: ['exoneration', 'exonerations', 'fiscal', 'fiscalite'], materiel: ['materiel', 'equipement', 'equipements'], plantation: ['plantation', 'plantations', 'planter']};
  const cards = Array.from(document.querySelectorAll('[data-aide]'), node => ({node, text: normalise(node.dataset.texte), zones: node.dataset.territoire.split(' ')}));
  const dom = new Set(['gua','guy','mar','may','reu']);
  const counter = document.getElementById('nombre-aides');
  const empty = document.getElementById('aides-vide');
  const summary = document.getElementById('filtres-actifs');
  const chips = document.getElementById('criteres-aides');
  const results = document.getElementById('resultats');
  function wordMatches(card, word) {
    if (generic.has(word)) return true;
    const group = Object.values(synonyms).find(values => values.includes(word));
    // Un prêt ne devient jamais une subvention parce que son texte en parle.
    if (group === synonyms.subvention) return card.node.dataset.type === 'subvention';
    return group ? group.some(w => card.text.includes(w)) : card.text.includes(word);
  }
  function chip(key, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'aides-critere';
    button.textContent = label + ' ×';
    button.setAttribute('aria-label', 'Retirer le critère : ' + label);
    button.addEventListener('click', () => {
      const control = key === 'q' ? query : controls[key];
      control.value = '';
      update();
      control.focus({preventScroll: true});
    });
    chips.append(button);
  }
  function update() {
    const words = normalise(query.value.trim()).split(/\s+/).filter(Boolean);
    const region = controls.territoire.value;
    let visible = 0;
    for (const card of cards) {
      const territory = !region || (region === 'national' ? card.zones.includes('fr') || card.zones.includes('metropole') : card.zones.includes(region) || card.zones.includes('fr') || (!dom.has(region) && card.zones.includes('metropole')));
      const matches = territory && words.every(w => wordMatches(card, w)) && ['etape','type','statut'].every(k => !controls[k].value || card.node.dataset[k] === controls[k].value);
      card.node.hidden = !matches;
      if (matches) visible++;
    }
    for (const section of document.querySelectorAll('.aides-etape')) section.hidden = !section.querySelector('[data-aide]:not([hidden])');
    empty.hidden = visible > 0;
    counter.textContent = `${visible} fiche${visible === 1 ? '' : 's'} sur ${cards.length}`;
    document.getElementById('nombre-action').textContent = visible;
    const count = ['type','statut'].filter(k => controls[k].value).length;
    summary.textContent = count ? `· ${count} critère${count > 1 ? 's' : ''}` : '';
    chips.replaceChildren();
    if (query.value.trim()) chip('q', query.value.trim());
    for (const key of fields) if (controls[key].value) chip(key, controls[key].selectedOptions[0].textContent);
    chips.hidden = !chips.childElementCount;
  }
  function reset() {
    query.value = '';
    for (const control of Object.values(controls)) control.value = '';
    update();
  }
  // Interception avant révélation : la recherche n'envoie aucune requête réseau.
  form.addEventListener('submit', event => {
    event.preventDefault();
    update();
    results.focus({preventScroll: true});
    results.scrollIntoView({block: 'start'});
  });
  query.addEventListener('input', update);
  for (const control of Object.values(controls)) control.addEventListener('change', update);
  form.addEventListener('reset', event => {
    event.preventDefault();
    reset();
    controls.etape.focus();
  });
  const examples = {subvention: {type: 'subvention'}, chai: {etape: 'investissement', q: 'chai'}, bio: {etape: 'transition', q: 'bio'}, dja: {etape: 'installation'}};
  for (const button of form.querySelectorAll('[data-exemple]')) button.addEventListener('click', () => {
    const region = controls.territoire.value;
    reset();
    controls.territoire.value = region;
    for (const [key, value] of Object.entries(examples[button.dataset.exemple])) (key === 'q' ? query : controls[key]).value = value;
    update();
  });
  // Un lien d'étape rétablit sa visibilité lorsque des filtres l'avaient masquée.
  for (const link of document.querySelectorAll('.aides-parcours a')) link.addEventListener('click', () => {
    reset();
  });
  update();
  for (const link of document.querySelectorAll('[data-recherche]')) link.href = '#recherche';
  document.getElementById('modifier-recherche').hidden = false;
  panel.hidden = false;
})();
