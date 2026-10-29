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
if (folderName === 'demonstration-2') {
  const seasonSource = fs.readFileSync(path.join(folder, 'saisons.js'), 'utf8');
  assert.doesNotMatch(seasonSource, /\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|WebSocket)\b/);
  const sandbox = {};
  require('node:vm').runInNewContext(seasonSource, sandbox, {timeout:1000});
  const seasons = sandbox.HallaisSaisons;
  assert.deepEqual(Array.from(seasons, item => item.id), ['hiver','printemps','ete','automne']);
  const names = ['vignes','maison','chai','caveau','jardin','eau','recolte'];
  const escape = text => text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  for (const season of seasons) {
    assert.equal(Object.keys(season.stories).length, 7);
    for (const name of names) {
      const story = season.stories[name];
      for (const field of ['title','p1','p2','people']) assert.ok(story[field]?.trim(), `Récit absent : ${season.id}/${name}/${field}`);
      assert.ok(html.includes(escape(story.p1)), `Repli sans JS incomplet : ${season.id}/${name}`);
    }
  }
  for (const name of names) assert.equal(new Set(seasons.map(s=>s.stories[name].title)).size, 4);
  assert.ok(html.indexOf('saisons.js') < html.indexOf('site.js'), 'Données de saison à charger avant la navigation');
  assert.match(html, /id="pause-season"/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  const functionSource = fs.readFileSync(path.join(folder, 'fonctions.js'), 'utf8');
  assert.doesNotMatch(functionSource, /\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|WebSocket)\b/);
  require('node:vm').runInNewContext(functionSource, sandbox, {timeout:1000});
  const functions = sandbox.HallaisFonctions;
  assert.equal(Object.keys(functions.places).length, 9);
  assert.ok(html.indexOf('fonctions.js') < html.indexOf('site.js'));
  for (const season of seasons) assert.ok(fs.existsSync(path.join(folder, `assets/domaine-${season.id}.webp`)), 'Paysage absent');
  for (const name of names) {
    assert.ok(functions.places[name].slides.length >= 1);
    assert.equal([...html.matchAll(new RegExp(`data-mc="${name}"`, 'g'))].length, 2);
    for (const id of functions.places[name].slides) assert.ok(functions.features[id], `Fonction absente : ${id}`);
  }
  for (const place of Object.values(functions.places)) for (const id of place.slides) assert.ok(functions.features[id]);
  assert.equal([...html.matchAll(/data-mc="produits"/g)].length, 1);
  assert.match(html, /Domaine Hallais/);
  assert.doesNotMatch(html, /aulnes|>\s*MC\s*</i);
  for (const bottle of ['cuvee-rouge.svg','cuvee-blanc.svg']) assert.doesNotMatch(fs.readFileSync(path.join(folder,'assets',bottle),'utf8'), /aulnes/i);
  const usedFeatures = Object.values(functions.places).flatMap(place => Array.from(place.slides));
  assert.equal(new Set(usedFeatures).size, usedFeatures.length, 'Une fonction ne doit pas être répétée dans plusieurs contextes');
  assert.equal(usedFeatures.length, Object.keys(functions.features).length);
  assert.equal([...html.matchAll(/data-mc="reservation"/g)].length, 1);
  for (const feature of Object.values(functions.features)) {
    assert.ok(feature.title && feature.text && feature.href && feature.availability && feature.proof);
    if (feature.kind === 'capture') assert.ok(fs.existsSync(path.join(folder, feature.image)));
    else { assert.equal(feature.kind, 'schema'); assert.ok(feature.flow.length >= 3); }
    if (feature.availability.startsWith('À venir')) assert.equal(feature.kind, 'schema', 'Ne pas inventer une capture de la future API');
    assert.ok(html.includes(escape(feature.text)), 'Repli sans JS des fonctions incomplet');
  }
  assert.match(html, /id="mc-dialog"/);
  assert.match(html, /id="retry-landscape"/);
  assert.match(html, /id="film-dialog"/);
  assert.match(html, /Lire les étapes de la vidéo/);
  assert.match(html, /Annonces.*Module pilote/);
  assert.doesNotMatch(html, /<video[^>]*\bautoplay\b/);
  assert.deepEqual(Array.from(functions.places.caveau.slides), ['degustation-creation','degustation-visiteur','degustation']);
  assert.deepEqual(Array.from(functions.places.jardin.slides), ['phyto']);
  assert.match(functions.features['trace-matiere'].image, /trace-produit-fiche\.png$/);
  assert.deepEqual(Array.from(functions.places.recolte.slides).slice(0,2), ['annonce-vendanges','annonce-materiel']);
}
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
for (const [, ref] of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) check(ref, path.join(folder, 'index.html'));
for (const [, ref] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) check(ref, path.join(folder, 'style.css'));
console.log(JSON.stringify({demonstration:'OK', dossier:folderName, ressources_et_liens:resources, identifiants:ids.length, sans_transmission:true, sans_stockage:true}));
