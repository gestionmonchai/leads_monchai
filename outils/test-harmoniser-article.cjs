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
  const ancien='<html><head>'+bloc+'</head><body><main>Texte</main><footer>Ancien</footer></body></html>';
  const resultat=harmoniser(ancien,reference);
  assert.ok(!resultat.includes('var obsolete=true'));
  assert.ok(resultat.includes("t='denied'"));
  assert.equal(harmoniser(resultat,reference),resultat);
});
