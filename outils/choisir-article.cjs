'use strict';
const fs = require('node:fs');
const START = '2026-10-19';
const END = '2026-10-25';
const SERIES = 'leviers-2026-10';
const SPECIAL_SCHEDULES = ['0 9 19-24 10 *', '0 10 25 10 *'];

function choose(manifest, { today, force = '', event = '', schedule = '' }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('Date ISO absente ou invalide');
  const articles = manifest.articles;
  if (!Array.isArray(articles)) throw new Error('Manifeste sans tableau articles');
  const specialWeek = today >= START && today <= END;
  // Les crons d’octobre sont annuels : cette garde les neutralise après 2026.
  if (!force && event === 'schedule' && SPECIAL_SCHEDULES.includes(schedule) && !specialWeek) {
    return { reason: 'Déclenchement ponctuel hors de la semaine spéciale' };
  }
  if (!force && articles.some(a => a.statut === `publie_${today}`)) {
    return { reason: 'Un article est déjà publié aujourd’hui' };
  }
  let eligible = articles.filter(a => a.statut === 'en_attente');
  if (force) eligible = eligible.filter(a => a.slug === force);
  else if (specialWeek) eligible = eligible.filter(a => a.serie === SERIES && a.prevu === today);
  else eligible = eligible.filter(a => a.serie !== SERIES && a.prevu <= today);
  eligible.sort((a, b) => a.ordre - b.ordre);
  if (!eligible.length) return { reason: specialWeek ? 'Aucun épisode dû pour ce jour ; aucun remplacement par le backlog' : 'Aucun article dû' };
  const article = eligible[0];
  // Les valeurs sont passées au workflow et utilisées dans des chemins shell.
  for (const key of ['slug', 'fichier']) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article[key])) throw new Error(`Champ ${key} invalide`);
  }
  const destination = article.destination || 'actualites';
  if (!['actualites', 'ressources'].includes(destination)) throw new Error('Destination invalide');
  for (const key of ['categorie', 'pilier']) {
    if (article[key] && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article[key])) throw new Error(`Champ ${key} invalide`);
  }
  return { article, destination };
}

if (require.main === module) {
  const today = process.env.AUJOURDHUI;
  const result = choose(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), {
    today, force: process.env.FORCER || '', event: process.env.EVENT_NAME || '', schedule: process.env.SCHEDULE || ''
  });
  let output = 'publier=non\n';
  if (result.article) {
    const a = result.article;
    output = `publier=oui\nslug=${a.slug}\nfichier=${a.fichier}\ncategorie=${a.categorie || ''}\ndestination=${result.destination}\npilier=${a.pilier || ''}\nserie=${a.serie || ''}\ndate=${today}\n`;
    console.log(`Article à publier : ${a.slug} (${result.destination})`);
  } else console.log(`::notice::${result.reason}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
  else process.stdout.write(output);
}
module.exports = { choose };
