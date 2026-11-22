'use strict';
// Garde commune : s'exécute avant les gestionnaires d'envoi des formulaires.
document.addEventListener('submit', event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.hasAttribute('data-honeypot-form')) return;
  const traps = Array.from(form.querySelectorAll('input[data-honeypot]'));
  if (traps.length && traps.every(field => field.value === '')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!traps.length) console.error('[Mon Chai] Formulaire protégé sans champ piège : envoi bloqué.');
}, true);
