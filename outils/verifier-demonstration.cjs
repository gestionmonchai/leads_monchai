'use strict';
// Contrat de la démonstration autonome : ressources locales, ancres valides,
// absence de transmission et de stockage, signalement explicite des simulations.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(process.argv[2] || '.');
const folderName = process.argv[3] || 'demonstration';
assert.match(folderName, /^[a-z0-9-]+$/, 'Nom de dossier de démonstration invalide');
const folder = path.join(root, folderName);
const html = fs.readFileSync(path.join(folder, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(folder, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(folder, 'site.js'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Identifiant HTML dupliqué');
assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Un seul titre principal attendu');
assert.match(html, /name="robots" content="noindex, nofollow"/, 'La fiction ne doit pas être indexée');
assert.match(html, /domaine fictif/i);
assert.match(html, /aucun achat/i);
assert.match(html, /réservation simulée/i);
assert.match(html, /class="saas-bridge"/, 'Volet professionnel commun attendu');
assert.match(html, /Projection — futures API à construire/, 'Les connexions futures doivent être annoncées comme telles');
assert.match(html, /Cette démo n’est pas connectée au logiciel/, 'Aucune connexion réelle ne doit être suggérée');
assert.doesNotMatch(js, /\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|WebSocket)\b/, 'La démo ne transmet ni ne persiste de données');
assert.doesNotMatch(html, /<form\b[^>]*\baction\s*=/, 'Aucun destinataire de formulaire dans une simulation');
let resources = 0;
function check(ref, from) {
  if (/^(?:https?:|mailto:|tel:|data:)/i.test(ref)) return;
  const [filePart, fragment] = ref.split('#');
  const file = decodeURIComponent(filePart.split('?')[0]);
  let target = file.startsWith('/') ? path.resolve(root, '.' + file) : path.resolve(path.dirname(from), file || path.basename(from));
  assert.ok(target === root || target.startsWith(root + path.sep), 'Ressource hors du site : ' + ref);
  assert.ok(fs.existsSync(target), 'Ressource absente : ' + ref);
  if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  assert.ok(fs.existsSync(target), 'Index absent : ' + ref);
  if (fragment && target.endsWith('.html')) {
    const content = fs.readFileSync(target, 'utf8');
    assert.ok(content.includes(`id="${fragment}"`), 'Ancre absente : ' + ref);
  }
  resources++;
}
for (const [, ref] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) check(ref, path.join(folder, 'index.html'));
for (const [, ref] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) check(ref, path.join(folder, 'style.css'));
console.log(JSON.stringify({demonstration:'OK', dossier:folderName, ressources_et_liens:resources, identifiants:ids.length, sans_transmission:true, sans_stockage:true}));
