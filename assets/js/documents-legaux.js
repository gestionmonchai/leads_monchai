/* Les URLs autonomes restent la source des documents et le repli sans JS. */
(function () {
  'use strict';
  if (window.self !== window.top || !window.HTMLDialogElement) return;
  var noms = ['cgu.html', 'mentions-legales.html', 'politique-confidentialite.html'];
  var langue = (document.documentElement.lang || 'fr').slice(0, 2);
  var textes = {
    fr: ['Fermer', 'Page complète', 'Chargement du document…', 'Le document ne peut pas être chargé. Vous pouvez ouvrir la page complète.'],
    en: ['Close', 'Full page', 'Loading document…', 'The document could not be loaded. You can open the full page.'],
    de: ['Schließen', 'Vollständige Seite', 'Dokument wird geladen…', 'Das Dokument konnte nicht geladen werden. Öffnen Sie die vollständige Seite.'],
    it: ['Chiudi', 'Pagina completa', 'Caricamento…', 'Impossibile caricare il documento. Puoi aprire la pagina completa.'],
    zh: ['关闭', '完整页面', '正在加载文档…', '无法加载文档。您可以打开完整页面。']
  };
  var t = textes[langue] || textes.fr;
  var dialog = document.createElement('dialog');
  dialog.className = 'mc-legal-dialog';
  dialog.setAttribute('aria-labelledby', 'mc-legal-title');
  dialog.innerHTML = '<div class="mc-legal-dialog__head"><h1 id="mc-legal-title"></h1><a class="mc-legal-dialog__page" data-legal-page></a><button type="button" class="mc-legal-dialog__close" autofocus>×</button></div><div class="mc-legal-dialog__body" aria-live="polite"></div>';
  document.body.appendChild(dialog);
  var titre = dialog.querySelector('#mc-legal-title');
  var complet = dialog.querySelector('a');
  var fermer = dialog.querySelector('button');
  var corps = dialog.querySelector('.mc-legal-dialog__body');
  complet.textContent = t[1] + ' ↗';
  complet.target = '_blank';
  complet.rel = 'noopener';
  var onglets = {fr:'nouvel onglet',en:'new tab',de:'neuer Tab',it:'nuova scheda',zh:'新标签页'};
  complet.setAttribute('aria-label', t[1] + ' (' + (onglets[langue] || onglets.fr) + ')');
  fermer.setAttribute('aria-label', t[0]);
  var avant, controleur, debordement;

  function terminer() {
    if (controleur) controleur.abort();
    document.body.style.overflow = debordement || '';
    if (avant && avant.isConnected) avant.focus();
  }
  dialog.addEventListener('close', terminer);
  fermer.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var elements = Array.from(dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(function (el) { return el.getClientRects().length; });
    var premier = elements[0], dernier = elements[elements.length - 1];
    if (!premier) return;
    if (event.shiftKey && document.activeElement === premier) { event.preventDefault(); dernier.focus(); }
    else if (!event.shiftKey && document.activeElement === dernier) { event.preventDefault(); premier.focus(); }
  });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) {
    var r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  } });

  document.addEventListener('click', async function (event) {
    var lien = event.target.closest && event.target.closest('a[href]');
    if (!lien || lien.hasAttribute('data-legal-page') || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var url = new URL(lien.href, location.href);
    if (url.origin !== location.origin || !noms.includes(url.pathname.split('/').pop())) return;
    // Les ancres du document déjà ouvert restent dans sa zone de lecture.
    if (dialog.open && corps.contains(lien) && url.pathname === new URL(complet.href).pathname && url.hash) {
      var ancre = corps.querySelector('[id="' + CSS.escape(decodeURIComponent(url.hash.slice(1))) + '"]');
      if (ancre) { event.preventDefault(); ancre.scrollIntoView(); return; }
    }
    event.preventDefault();
    if (controleur) controleur.abort();
    controleur = new AbortController();
    var courant = controleur;
    if (!dialog.open) {
      avant = lien;
      debordement = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      fermer.focus();
    }
    titre.textContent = lien.textContent.trim();
    complet.href = url.href;
    corps.textContent = t[2];
    corps.setAttribute('aria-busy', 'true');
    var delaiDepasse = false;
    var attente = window.setTimeout(function () { delaiDepasse = true; courant.abort(); }, 10000);
    try {
      var response = await fetch(url.href, { signal: courant.signal, credentials: 'same-origin' });
      if (!response.ok) throw new Error('document');
      var doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      var main = doc.querySelector('main.legal');
      if (!main) throw new Error('contenu');
      main.querySelectorAll('script,iframe,object,embed,form').forEach(function (el) { el.remove(); });
      main.querySelectorAll('a[href]').forEach(function (a) { a.href = new URL(a.getAttribute('href'), url.href).href; });
      if (courant !== controleur || !dialog.open) return;
      corps.replaceChildren(document.importNode(main, true));
      var h1 = corps.querySelector('h1');
      if (h1) { titre.textContent = h1.textContent.trim(); h1.remove(); }
      dialog.scrollTop = 0;
      if (url.hash) {
        var cible = corps.querySelector('[id="' + CSS.escape(decodeURIComponent(url.hash.slice(1))) + '"]');
        if (cible) cible.scrollIntoView();
      }
    } catch (error) {
      if ((error.name !== 'AbortError' || delaiDepasse) && courant === controleur && dialog.open) corps.textContent = t[3];
    } finally {
      window.clearTimeout(attente);
      if (courant === controleur) corps.removeAttribute('aria-busy');
    }
  });
})();
