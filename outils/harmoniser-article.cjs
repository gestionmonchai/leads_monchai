'use strict';
// La file éditoriale garde ses textes ; ses composants suivent le site courant.
const fs = require('node:fs');

function unique(source, expression, nom) {
  const matches = [...source.matchAll(expression)];
  if (matches.length !== 1) throw new Error(`${nom} : un seul composant attendu`);
  return matches[0][0];
}
function harmoniser(article, reference) {
  const footer = /<footer\b[^>]*>[\s\S]*?<\/footer>/g;
  const consentement = /<!-- Mode consentement de Google[\s\S]*?<!-- End Google Tag Manager -->/g;
  const nouveau = unique(reference, footer, 'footer de référence');
  if (!nouveau.includes('mc-site-footer') || !nouveau.includes('politique-confidentialite.html') || !nouveau.includes('data-cookies')) {
    throw new Error('Footer de référence incomplet');
  }
  unique(article, footer, 'footer article');
  let resultat = article.replace(footer, () => nouveau);
  // Les anciens articles en attente reprennent le chargement conditionnel courant.
  resultat = resultat.replace(consentement, '');
  resultat = resultat.replace(/<noscript\b[^>]*>[\s\S]*?googletagmanager\.com\/ns\.html[\s\S]*?<\/noscript>/g, '');
  resultat = resultat.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, bloc =>
    /monchaiChargerGtm|GTM-NDSQV6T7|googletagmanager\.com\/(?:gtag|gtm)|assets\/js\/analytics\.js/.test(bloc) ||
    (/gtag\(/.test(bloc) && /(?:consent|config)/.test(bloc)) ? '' : bloc);
  const analytics = unique(reference, /<script\b[^>]*src="assets\/js\/analytics\.js[^\"]*"[^>]*><\/script>/g, 'mesure de référence');
  resultat = resultat.replace(/<link\b[^>]*href=["']assets\/css\/footer-commun\.css[^"']*["'][^>]*>\s*/g, '');
  if (!resultat.includes('</head>') || !resultat.includes('</body>')) throw new Error('Document incomplet');
  resultat = resultat.replace('</head>', '<link rel="stylesheet" href="assets/css/footer-commun.css?v=20261028-footer">\n</head>');
  resultat = resultat.replace('</head>', analytics + '\n</head>');
  for (const fichier of ['consent.js', 'assets/js/documents-legaux.js']) {
    const rx = new RegExp('<script\\b[^>]*src=["\\\']' + fichier.replaceAll('.', '\\.') + '(?:\\?[^"\\\']*)?["\\\'][^>]*>\\s*</script>\\s*', 'g');
    resultat = resultat.replace(rx, '');
    const version = fichier === 'consent.js' ? '20261029-ga4' : '20261028-footer';
    resultat = resultat.replace('</body>', `<script src="${fichier}?v=${version}" defer></script>\n</body>`);
  }
  return resultat;
}
if (require.main === module) {
  const [article, reference] = process.argv.slice(2);
  if (!article || !reference) throw new Error('Chemins article et référence requis');
  fs.writeFileSync(article, harmoniser(fs.readFileSync(article, 'utf8'), fs.readFileSync(reference, 'utf8')));
}
module.exports = { harmoniser };
