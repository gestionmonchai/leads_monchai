'use strict';
const fs = require('node:fs');
const path = require('node:path');

function reference(site, template, slug, date, dateFr) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Article ou date invalide');
  if (!fs.existsSync(path.join(site, slug + '.html'))) throw new Error('Article non publié : référencement interdit');
  const card = fs.readFileSync(template, 'utf8').replaceAll('{{DATE_ISO}}', date).replaceAll('{{DATE_FR}}', dateFr);
  if (card.includes('{{DATE') || !card.includes(`href="${slug}.html"`) || !card.includes('data-categorie="oenotourisme-vente-directe"')) throw new Error('Carte invalide');
  const pages = [
    ['actualites-reglementaires.html', 'FILE-ATTENTE : les nouvelles cartes'],
    ['actualites-oenotourisme-vente-directe.html', 'FILE-ATTENTE : cartes de la catégorie']
  ];
  const updates = pages.map(([file, marker]) => {
    const filename = path.join(site, file);
    const html = fs.readFileSync(filename, 'utf8');
    const matches = html.match(/<article\b[\s\S]*?<\/article>/g) || [];
    const count = matches.filter(block => block.includes(`href="${slug}.html"`)).length;
    if (count > 1) throw new Error(`Cartes en double dans ${file}`);
    if (count === 1) return [filename, html];
    const position = html.indexOf(marker);
    const end = html.indexOf('-->', position);
    if (position < 0 || end < 0) throw new Error(`Repère absent dans ${file}`);
    const result = html.slice(0, end + 3) + '\n' + card + html.slice(end + 3);
    return [filename, result];
  });
  for (const [filename, html] of updates) fs.writeFileSync(filename, html);
  console.log(`${slug} référencé dans les actualités et la rubrique Œnotourisme & vente directe.`);
}

if (require.main === module) reference(...process.argv.slice(2));
module.exports = { reference };
