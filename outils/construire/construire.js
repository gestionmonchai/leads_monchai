'use strict';
/* =========================================================
   Mon Chai, optimisation du site au déploiement
   Lancé par les deux workflows qui publient le site (static.yml,
   publier-article.yml), sur la copie envoyée à GitHub Pages, jamais sur le
   dépôt : les fichiers sources restent lisibles et se modifient comme
   avant, sans étape à lancer à la main. Le dossier outils/ n'est pas
   publié.

   1. Minifie tous les .css (clean-css niveau 1 : espaces et commentaires,
      sans réorganiser les règles) et tous les .js (terser, les noms
      globaux sont conservés).
   2. Feuilles marquées data-lot="nom" dans une page HTML (aujourd'hui les
      trois feuilles de l'accueil) : elles sont fusionnées dans leur ordre,
      puis réparties en trois tranches de largeur d'écran, chacune gardant
      l'ordre exact des règles qui la concernent :
      - téléphone (moins de 700 px) : intégré à la page dans un <style>,
        aucune feuille externe à attendre ;
      - tablette (700 à 1199 px) et ordinateur (1200 px et plus) : fichiers
        nom-<tranche>-<empreinte>.css à côté de la page, chargés seulement
        dans leur tranche, en bloquant le rendu comme une feuille ordinaire.
      Une tranche reprend toutes les règles qui peuvent s'y appliquer,
      communes comprises : dans chaque tranche, la cascade est celle des
      feuilles sources. Les règles intégrées qui s'y appliquent aussi sont
      redites ensuite, à l'identique, et n'ont donc plus d'effet propre.
   Tout est calculé avant d'écrire : en cas d'erreur, rien n'est modifié
   et le site part tel quel (l'étape du workflow ne bloque pas le
   déploiement).
   ========================================================= */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const postcss = require('postcss');
const CleanCSS = require('clean-css');
const { minify: minifierJs } = require('terser');

const SITE = path.resolve(process.argv[2] || '.');
const IGNORES = new Set(['.git', '.github', 'node_modules', 'outils']);
// Tranches de largeur (px). La première est intégrée à la page.
const TRANCHES = [
  { nom: 'telephone', min: 0, max: 699 },
  { nom: 'tablette', min: 700, max: 1199 },
  { nom: 'ordinateur', min: 1200, max: Infinity }
];

function fichiers(dossier, extension, liste = []) {
  for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
    if (IGNORES.has(e.name)) continue;
    const p = path.join(dossier, e.name);
    if (e.isDirectory()) fichiers(p, extension, liste);
    else if (e.name.endsWith(extension)) liste.push(p);
  }
  return liste;
}
const relatif = p => path.relative(SITE, p).split(path.sep).join('/');
const ko = n => (n / 1024).toFixed(1) + ' Ko';

// Une media query peut-elle s'appliquer dans la tranche [min, max] ? Chaque
// partie (séparée par des virgules) donne un intervalle de largeurs d'après
// ses min-width / max-width en px ; tout autre critère (mouvement réduit,
// impression, « not », autre unité…) est tenu pour possible.
function concerne(params, t) {
  return params.split(',').some(partie => {
    if (/\bnot\b/i.test(partie)) return true;
    let bas = 0, haut = Infinity;
    for (const m of partie.matchAll(/\(\s*(min|max)-width\s*:\s*([\d.]+)px\s*\)/gi)) {
      if (m[1].toLowerCase() === 'min') bas = Math.max(bas, +m[2]);
      else haut = Math.min(haut, +m[2]);
    }
    return Math.max(bas, t.min) <= Math.min(haut, t.max);
  });
}
const mediaDe = t => t.max === Infinity ? '(min-width:' + t.min + 'px)' : '(min-width:' + t.min + 'px) and (max-width:' + t.max + 'px)';

function minifierCss(source, nom) {
  const r = new CleanCSS({ level: 1, inline: false, rebase: false }).minify(source);
  if (r.errors.length) throw new Error(nom + ' : ' + r.errors.join(' ; '));
  // Une déclaration que clean-css ne comprend pas serait retirée : dans ce
  // cas on garde le fichier d'origine plutôt que de risquer un écart.
  if (r.warnings.length) throw new Error(nom + ' : ' + r.warnings.join(' ; '));
  return r.styles;
}

// Fusionne les feuilles d'un lot et réécrit leurs url() relatives pour
// qu'elles partent du dossier de la page.
function fusionner(feuilles, dossierPage) {
  const racine = postcss.root();
  for (const f of feuilles) {
    const arbre = postcss.parse(f.source, { from: f.chemin });
    const dossierFeuille = path.posix.dirname(f.chemin);
    arbre.walkDecls(d => {
      d.value = d.value.replace(/url\((['"]?)([^'")]+)\1\)/g, (tout, q, u) => {
        if (/^(data:|[a-z]+:|\/|#)/i.test(u)) return tout;
        const cible = path.posix.normalize(path.posix.join(dossierFeuille, u));
        return 'url(' + q + (path.posix.relative(dossierPage, cible) || '.') + q + ')';
      });
    });
    racine.append(arbre.nodes);
  }
  return racine;
}

function tranche(racine, t) {
  const copie = racine.clone();
  copie.walkAtRules('media', a => { if (!concerne(a.params, t)) a.remove(); });
  return copie.toString();
}

async function construire() {
  const ecritures = new Map(); // chemin absolu -> contenu
  const bilan = [];

  // 1. Feuilles en lots, lues dans leur version source.
  for (const page of fichiers(SITE, '.html')) {
    let html = fs.readFileSync(page, 'utf8');
    const balises = [...html.matchAll(/<link\b[^>]*\bdata-lot="([^"]+)"[^>]*>[ \t]*\r?\n?/g)];
    if (!balises.length) continue;
    const dossierPage = path.posix.dirname(relatif(page));
    const lots = new Map();
    for (const b of balises) {
      const href = (b[0].match(/\bhref="([^"]+)"/) || [])[1];
      if (!href || /^[a-z]+:|^\//i.test(href)) throw new Error(relatif(page) + ' : lien de feuille non relatif ' + b[0]);
      const chemin = path.posix.normalize(path.posix.join(dossierPage, href));
      if (!lots.has(b[1])) lots.set(b[1], []);
      lots.get(b[1]).push({ balise: b[0], chemin, source: fs.readFileSync(path.join(SITE, chemin), 'utf8') });
    }
    for (const [nom, feuilles] of lots) {
      const fusion = fusionner(feuilles, dossierPage);
      const parts = TRANCHES.map(t => ({ t, media: mediaDe(t), css: minifierCss(tranche(fusion, t), nom + ' (' + t.nom + ')') }));
      const [integree, ...externes] = parts;
      if (/<\/style/i.test(integree.css)) throw new Error(nom + ' : « </style » dans le CSS');
      for (const p of externes) {
        p.fichier = nom + '-' + p.t.nom + '-' + crypto.createHash('sha256').update(p.css).digest('hex').slice(0, 10) + '.css';
        ecritures.set(path.join(SITE, dossierPage, p.fichier), p.css);
      }
      const liste = JSON.stringify(externes.map(p => [p.media, p.fichier]));
      const remplacement =
        // Préchargement limité à chaque tranche : le téléchargement part dès
        // la lecture de l'en-tête, sans attendre le script ci-dessous, et rien
        // n'est téléchargé hors de la tranche.
        externes.map(p => '<link rel="preload" as="style" href="' + p.fichier + '" media="' + p.media + '">\n').join('') +
        '<style data-lot="' + nom + '">' + integree.css + '</style>\n' +
        // Tranche active : feuille écrite par le parseur, donc bloquante comme
        // une feuille ordinaire. Changement de tranche (rotation, fenêtre
        // redimensionnée) : la feuille de la nouvelle tranche est ajoutée.
        '<script>' + liste + '.forEach(function(l){var m=matchMedia(l[0]),f;' +
        'if(m.matches){document.write(\'<link rel="stylesheet" href="\'+l[1]+\'" media="\'+l[0]+\'">\');return;}' +
        'f=function(e){if(!e.matches)return;var k=document.createElement("link");k.rel="stylesheet";k.href=l[1];k.media=l[0];document.head.appendChild(k);' +
        'm.removeEventListener?m.removeEventListener("change",f):m.removeListener(f);};m.addEventListener?m.addEventListener("change",f):m.addListener(f);});</script>\n' +
        '<noscript>' + externes.map(p => '<link rel="stylesheet" href="' + p.fichier + '" media="' + p.media + '">').join('') + '</noscript>\n';
      html = html.replace(feuilles[0].balise, () => remplacement);
      for (const f of feuilles.slice(1)) html = html.replace(f.balise, '');
      bilan.push(relatif(page) + ' : lot « ' + nom + ' » (' + feuilles.length + ' feuilles) ' +
        parts.map(p => p.t.nom + ' ' + ko(p.css.length) + (p.fichier ? ' (' + p.fichier + ')' : ' intégré')).join(', '));
    }
    if (/<link\b[^>]*\bdata-lot=/.test(html)) throw new Error(relatif(page) + ' : lien data-lot restant');
    ecritures.set(page, html);
  }

  // 2. Minification de tous les CSS et JS.
  let avant = 0, apres = 0;
  const ignores = [];
  for (const f of fichiers(SITE, '.css')) {
    const source = fs.readFileSync(f, 'utf8');
    try {
      const m = minifierCss(source, relatif(f));
      if (m.length < source.length) { ecritures.set(f, m); avant += source.length; apres += m.length; }
    } catch (e) { ignores.push(e.message.slice(0, 200)); }
  }
  for (const f of fichiers(SITE, '.js')) {
    const source = fs.readFileSync(f, 'utf8');
    try {
      const r = await minifierJs(source, { compress: true, mangle: true, format: { comments: /^!/ } });
      if (r.code && r.code.length < source.length) { ecritures.set(f, r.code); avant += source.length; apres += r.code.length; }
    } catch (e) { ignores.push(relatif(f) + ' : ' + e.message.slice(0, 200)); }
  }
  bilan.push('CSS et JS minifiés : ' + ko(avant) + ' -> ' + ko(apres));

  // 3. Écriture : nouveaux fichiers et feuilles d'abord, pages en dernier.
  const ordre = [...ecritures.keys()].sort((a, b) => (a.endsWith('.html') ? 1 : 0) - (b.endsWith('.html') ? 1 : 0));
  for (const f of ordre) fs.writeFileSync(f, ecritures.get(f));
  console.log(bilan.join('\n'));
  if (ignores.length) console.log('Laissés tels quels :\n  ' + ignores.join('\n  '));
}

construire().catch(e => { console.error('Optimisation abandonnée, rien n\'a été écrit : ' + e.message); process.exit(1); });
