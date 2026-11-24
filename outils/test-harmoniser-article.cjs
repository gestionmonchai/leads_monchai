'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { harmoniser } = require('./harmoniser-article.cjs');
const reference = fs.readFileSync(path.join(__dirname,'../actualites-reglementaires.html'),'utf8');
test('les articles futurs gardent le texte et reprennent les composants communs une fois', () => {
  const ancien = '<html><head></head><body><main><h1>Texte éditorial</h1><p>À conserver.</p></main><footer class="pied">Ancien pied</footer><script src="consent.js"></script></body></html>';
  const resultat = harmoniser(ancien, reference);
  assert.ok(resultat.includes('<main><h1>Texte éditorial</h1><p>À conserver.</p></main>'));
  assert.ok(resultat.includes('aides-vignerons.html'));
  assert.ok(resultat.includes('data-cookies'));
  assert.equal((resultat.match(/src="consent.js/g)||[]).length, 1);
  assert.equal((resultat.match(/src="assets\/js\/documents-legaux.js/g)||[]).length, 1);
  assert.equal(harmoniser(resultat, reference), resultat);
});
test('une structure inconnue échoue avant de remplacer un composant', () => {
  assert.throws(()=>harmoniser('<main>Sans footer</main>',reference));
  assert.throws(()=>harmoniser('<footer>Premier</footer><footer>Second</footer>',reference));
});
test('le bloc de consentement suit la référence et ne restaure pas les publicités', () => {
  const bloc='<!-- Mode consentement de Google -->\n<script>window.monchaiChargerGtm=function(){};var obsolete=true;</script><!-- End Google Tag Manager -->';
  const iframe='<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NDSQV6T7"></iframe></noscript>';
  const ancien='<html><head>'+bloc+'</head><body>'+iframe+'<main>Texte</main><footer>Ancien</footer></body></html>';
  const resultat=harmoniser(ancien,reference);
  assert.ok(!resultat.includes('var obsolete=true'));
  assert.ok(resultat.includes('assets/js/analytics.js?v=20261124-gtm'));
  assert.ok(!resultat.includes('monchaiChargerGtm'));
  assert.equal((resultat.match(/src="assets\/js\/analytics.js/g)||[]).length, 1);
  assert.ok(!resultat.includes('googletagmanager.com/gtag/js'));
  assert.ok(!resultat.includes('googletagmanager.com/ns.html'));
  assert.equal(harmoniser(resultat,reference),resultat);
});

test('les pages du sitemap chargent seulement les scripts locaux de consentement et de mesure', () => {
  const site = path.join(__dirname, '..');
  const sitemap = fs.readFileSync(path.join(site, 'sitemap.xml'), 'utf8');
  for (const [, adresse] of sitemap.matchAll(/<loc>(https:\/\/monchai\.fr\/[^<]*)<\/loc>/g)) {
    const route = new URL(adresse).pathname;
    const fichier = (route.endsWith('/') ? route + 'index.html' : route).slice(1);
    const page = fs.readFileSync(path.join(site, fichier), 'utf8');
    const scripts = [...page.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)];
    const mesure = scripts.filter(([, src]) => src.includes('assets/js/analytics.js'));
    const consentement = scripts.filter(([, src]) => src.includes('consent.js'));
    assert.equal(mesure.length, 1, adresse);
    assert.equal(consentement.length, 1, adresse);
    assert.match(mesure[0][1], /^(?:\.\.\/)?assets\/js\/analytics\.js\?v=20261124-gtm$/, adresse);
    assert.match(consentement[0][1], /^(?:\.\.\/)?consent\.js\?v=20261124-gtm$/, adresse);
    assert.doesNotMatch(page, /googletagmanager\.com|google-analytics\.com|\bdata-gtm\b/, adresse);
  }
});
