/* Mon Chai : petites invitations contextuelles, 20 secondes après l'ouverture.
   Une apparition par rubrique et par session ; un clic sur une action suspend
   toutes les invitations pour la session. Aucun déclenchement au défilement.
   La carte attend la fin du choix de cookies, des modales et de la saisie.
   Les événements de mesure restent soumis au consentement d'audience. */
(function () {
  'use strict';
  if (window.self !== window.top || window.monchaiCtaContextuelle) return;
  window.monchaiCtaContextuelle = true;

  var balise = document.currentScript;
  if (!balise || !balise.src) return;
  var racine = new URL('../../', balise.src);
  var chemin = decodeURIComponent(window.location.pathname).slice(racine.pathname.length);
  var langue = (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();
  var nom = chemin.replace(/^(en|de|it|zh)\//, '').replace(/\/$/, '/index.html');
  // Ne pas interrompre un parcours déjà engagé ou les documents légaux.
  if (/^(contact|essai-gratuit|cgu|mentions-legales|politique-confidentialite|monchainotes)\.html$/.test(nom) ||
      /^(demonstration(?:-2)?|visite-interactive|developpeurs)\//.test(nom)) return;

  // La surprise a sa fréquence et son délai propres, même si cette rubrique
  // a déjà montré sa carte contextuelle pendant la session.
  var cadeauVinitech = document.createElement('script');
  cadeauVinitech.src = new URL('cadeau-vinitech.js?v=20261110-compact-stable', balise.src).href;
  document.head.appendChild(cadeauVinitech);

  var CONTEXTES = [
    ['recolte', /^declaration-recolte(?:-|\.)/, 'Votre récolte, sans la soirée de saisie.', 'Vos vendanges déjà saisies, voyons comment l’IA prépare votre récapitulatif.'],
    ['tarifs', /^tarifs\.html$/, 'Moins d’outils. Plus de liberté.', 'Comparons vos abonnements actuels et ce que Mon Chai pourrait remplacer.'],
    ['drm', /^(drm-|dae-daes-|actualites-douane-)/, 'Votre DRM, sans les ressaisies.', 'Mouvements de cave, stocks, données déclaratives : partons du travail déjà enregistré pour préparer votre DRM.'],
    ['vigne', /^(vigne-vendanges|cahier-de-culture|registre-phyto|ift-viticulture|actualites-vigne)/, 'La vigne le jour. Vos soirées pour vous.', 'Réunissez interventions, parcelles et vendanges pour limiter les doubles saisies.'],
    ['cave', /^(cave-vinification|registre-de-cave|actualites-cave)/, 'Votre cave, simplement suivie.', 'Cuves, lots, opérations : retrouvons vos informations sans les recopier d’un fichier à l’autre.'],
    ['stocks', /^(stocks-tracabilite|tracabilite-lots)/, 'Vos stocks, au bout d’une question.', 'Posez une question à Claude et retrouvez vos stocks dans Mon Chai.'],
    ['mises', /^(mises-conditionnement|actualites-etiquetage|ppwr-vin)/, 'Votre mise, sans les tableaux à recoller.', 'Lots, matières sèches, bouteilles : relions la préparation de votre mise et le suivi de vos stocks.'],
    ['ventes', /^(ventes-clients|vente-directe|facturation-electronique|actualites-ventes|recommandation-sociale|vin-multigenerationnel|vin-low-alcool)/, 'Vos ventes suivies. Vos soirées libres.', 'Du client aux documents de vente, suivons le même dossier sans repartir de zéro à chaque étape.'],
    ['couts', /^(cout-|cout-de-|charges-indirectes|marge-vin|investir-leviers|activations-locales)/, 'Vos marges, enfin plus claires.', 'Production, charges, ventes : réunissons vos données pour comprendre ce que chaque vin vous coûte et vous rapporte.'],
    ['oenotourisme', /^(oenotourisme|actualites-oenotourisme)/, 'Après la dégustation, gardez le lien.', 'Reliez vos dégustations, vos clients et vos ventes au domaine. Regardons ensemble les tâches qui vous prennent du temps.'],
    ['assistant', /^(ia-au-service|ce-que-votre-assistant)/, 'Vos données vous répondent.', 'Dans le film MCP : des stocks, puis des impayés, interrogés avec Claude. À vous de choisir la prochaine question en démonstration.'],
    ['migration', /^(changer-de-logiciel|choisir-logiciel)/, 'Un domaine. Un outil. Moins de frais.', 'Faisons l’inventaire de vos outils, des données à reprendre et des abonnements que Mon Chai pourrait remplacer.'],
    ['aides', /^(aide-|aides-|dja-|s-installer)/, 'Chercher une aide prend du temps. Gérer le domaine aussi.', 'Gardez les sources et les conditions de cette fiche pour votre dossier. Voyons séparément comment alléger votre gestion quotidienne.'],
    ['reglementation', /^(actualites-reglementaires|paquet-vin-europeen)/, 'Le réglementaire bouge. Pas besoin de repartir de zéro.', 'Retrouvez vos opérations et vos documents dans un même outil. Vérifions ensemble ce que votre organisation peut simplifier.'],
    ['ressources', /^(ressources|faq)\.html$/, 'Une question de gestion ne devrait pas prendre votre soirée.', 'Partons de vos vrais cas : stocks, clients, cave ou documents. Mesurons ce qui peut être simplifié sur votre domaine.']
  ];
  var contexte = CONTEXTES.filter(function (c) { return c[1].test(nom); })[0] ||
    ['generale', null, 'Plus de temps pour votre domaine.', 'De la vigne à la vente, réunissez vos données. Puis mettons vos tâches réelles à l’épreuve en démonstration.'];

  var variante = contexte[0];
  var objectif = /^(tarifs|migration)$/.test(contexte[0]) ? 'budget' : contexte[0] === 'recolte' ? 'recolte' : 'temps';
  var variantesAides = [
    ['risques', /aide-(assurance|isn|fmse|secheresse|distillation|msa-difficultes|prets-consolidation|tfnb-sinistre|urgence|rearmement)/, 'Vous gérez déjà la crise. Évitons une couche de ressaisie.', 'Les aides de cette fiche ont leurs propres conditions. Pour vos stocks, opérations et justificatifs, regardons ce qu’une gestion réunie peut vous épargner.', 'temps'],
    ['installation', /^(dja-|s-installer)|aide-(acja|acre|arce|aita|dpb|installation|nouveaux-agriculteurs|msa-jeunes|tfnb-jeunes|abattement)/, 'Lancez votre domaine. Pas une collection de fichiers.', 'Parcelles, cave, clients, documents : prenez de bonnes habitudes de gestion dès le départ. Mesurons le temps que vous pourriez y consacrer.', 'temps'],
    ['investissement', /aide-(pve|pcae|investissement|petits-equipements|modernisation|credit-cuma|agences-eau|ademe|hydraulique|plantations|pepinieres|restructuration)/, 'Le matériel coûte assez cher. Vos logiciels aussi ?', 'Votre projet d’équipement et ses aides sont un sujet. Le budget de vos outils de gestion en est un autre : comparons les abonnements remplaçables.', 'budget'],
    ['emploi', /aide-(apprentissage|tode|remplacement|vivea)/, 'Vos équipes changent. Les informations ne doivent pas se perdre.', 'Interventions, suivis et données du domaine : voyons comment les réunir pour limiter les recherches et les ressaisies.', 'temps'],
    ['transmission', /aide-(arrachage|arp|fiscalite-transmission|transmission|reorientation)/, 'Votre domaine change. Votre gestion doit suivre.', 'Classez vos opérations et vos données pour préparer la suite. Les droits et conditions de cette fiche restent à vérifier auprès de l’organisme compétent.', 'temps'],
    ['transition', /aide-(bio|cab|hve|credit|ecoregime|maec|pse|haies|avenir|dephy|tfnb-bio|conseil-rse)/, 'Vos pratiques évoluent. Pas besoin de multiplier les fichiers.', 'Interventions, traçabilité, suivi : partons des données de votre domaine pour identifier les tâches répétées à simplifier.', 'temps'],
    ['commercial', /aide-(promotion|agrip|assurance-prospection|leader|diversification)/, 'Développez vos ventes. Sans multiplier la ressaisie.', 'Retrouvez clients, ventes, documents et stocks dans Mon Chai. Étudions votre organisation commerciale en démonstration.', 'temps']
  ];
  if (contexte[0] === 'aides') {
    var aide = variantesAides.filter(function (v) { return v[1].test(nom); })[0];
    if (aide) { contexte = contexte.slice(); contexte[2] = aide[2]; contexte[3] = aide[3]; objectif = aide[4]; variante = 'aides-' + aide[0]; }
  }

  // Les pages traduites gardent une invitation entièrement dans leur langue.
  var TEXTES = {
    fr: { titre: contexte[2], texte: contexte[3], essai: 'Essayer 30 jours', demo: objectif === 'recolte' ? 'Demander ma démo chronométrée' : 'Découvrir en démo', fermer: 'Fermer cette invitation', note: 'Objectif global à mesurer ensemble en démo, selon votre organisation.', objectif: 'Votre objectif : jusqu’à', defi: 'Le défi : jusqu’à', temps: 'économisées par semaine sur la gestion du domaine', budget: 'par mois à viser sur vos outils de gestion', annuel: 'Soit jusqu’à 200 € d’économies par mois.', recolte: 'pour préparer votre récapitulatif de récolte', limiteRecolte: 'Objectif à tester sur des données déjà saisies. Contrôle et dépôt officiel distincts.', video: 'Voir l’IA en action · 33 s', sujet: 'Le temps de votre domaine compte.' },
    en: { titre: 'Simplify your estate management', texte: 'From vineyard to sales, discover one accessible tool built with winegrowers.', essai: 'Try Mon Chai', demo: 'Request a demonstration', fermer: 'Close this invitation', note: 'Discover Mon Chai at your own pace.' },
    de: { titre: 'Verwalten Sie Ihr Weingut einfacher', texte: 'Vom Weinberg bis zum Verkauf: Entdecken Sie eine zugängliche Software, gemeinsam mit Winzern entwickelt.', essai: 'Mon Chai testen', demo: 'Vorführung anfragen', fermer: 'Diese Einladung schließen', note: 'Entdecken Sie Mon Chai in Ihrem eigenen Tempo.' },
    it: { titre: 'Semplifica la gestione della tua azienda', texte: 'Dalla vigna alla vendita, scopri un software accessibile, sviluppato con i viticoltori.', essai: 'Prova Mon Chai', demo: 'Richiedi una dimostrazione', fermer: 'Chiudi questo invito', note: 'Scopri Mon Chai al tuo ritmo.' },
    zh: { titre: '让酒庄管理更简单', texte: '从葡萄园到销售，了解与葡萄种植者共同打造的实用软件。', essai: '试用 Mon Chai', demo: '申请演示', fermer: '关闭此邀请', note: '按照自己的节奏了解 Mon Chai。' }
  };
  var T = TEXTES[langue] || TEXTES.fr;
  var OBJECTIFS = {
    en: {objectif:'Your target: up to',defi:'The challenge: up to',temps:'saved per week across estate management',budget:'per month to target on management tools',annuel:'Up to €200 saved per month.',recolte:'to prepare your harvest summary',limiteRecolte:'A target to test with data already entered. Review and official submission are separate.',note:'A whole-estate target to assess together against your own organisation.',video:'Watch the AI demo · 33 s',demo:'Request a demo',essai:'Try it for 30 days',sujet:'Make time for your estate.'},
    de: {objectif:'Ihr Ziel: bis zu',defi:'Die Herausforderung: bis zu',temps:'pro Woche bei der Betriebsverwaltung eingespart',budget:'pro Monat bei Ihren Verwaltungsprogrammen als Ziel',annuel:'Das entspricht bis zu 200 € Ersparnis pro Monat.',recolte:'zur Vorbereitung Ihrer Ernteübersicht',limiteRecolte:'Ziel zum Testen mit bereits erfassten Daten. Prüfung und amtliche Abgabe erfolgen separat.',note:'Ein betriebsweites Ziel, das wir anhand Ihrer Organisation gemeinsam prüfen.',video:'KI-Demo ansehen · 33 s',demo:'Vorführung anfragen',essai:'30 Tage testen',sujet:'Zeit für Ihr Weingut.'},
    it: {objectif:'Il tuo obiettivo: fino a',defi:'La sfida: fino a',temps:'risparmiate alla settimana sulla gestione aziendale',budget:'al mese come obiettivo sui tuoi software gestionali',annuel:'Fino a 200 € di risparmio al mese.',recolte:'per preparare il riepilogo della vendemmia',limiteRecolte:'Obiettivo da verificare su dati già inseriti. Controllo e invio ufficiale sono separati.',note:'Obiettivo sulla gestione complessiva, da verificare insieme sulla tua organizzazione.',video:'Guarda la demo IA · 33 s',demo:'Richiedi una dimostrazione',essai:'Prova per 30 giorni',sujet:'Tempo per la tua azienda.'},
    zh: {objectif:'您的目标：最多',defi:'计时挑战：最多',temps:'每周可节省的酒庄整体管理时间',budget:'每年管理软件费用的目标节省金额',annuel:'相当于每月最多节省200欧元。',recolte:'用于准备采收汇总',limiteRecolte:'使用已录入的数据共同测试目标。审核与正式申报另行完成。',note:'针对酒庄整体管理的目标，需要结合您的组织方式共同验证。',video:'观看AI演示 · 33秒',demo:'预约演示',essai:'试用30天',sujet:'把时间留给您的酒庄。'}
  };
  if (OBJECTIFS[langue]) Object.assign(T, OBJECTIFS[langue]);
  // Le sujet reste contextualisé aussi sur les pages traduites.
  var TITRES = {
    en: {recolte:'Your harvest should not take your whole evening.',tarifs:'Could one tool replace several subscriptions?',drm:'The DRM returns every month. Does the retyping?',vigne:'A day in the vineyard. An evening retyping?',cave:'Your wine moves forward. Your records should too.',stocks:'How many bottles? Ask your data.',mises:'Your next bottling, without merging three spreadsheets.',ventes:'Send your invoices. Keep your evenings.',couts:'Your margins deserve more than an approximate cost.',oenotourisme:'After the tasting, keep the customer. Skip the retyping.',assistant:'Ask your data, not for another spreadsheet.',migration:'Your tools add up. So do their bills.',aides:'Funding research takes time. Estate management does too.',reglementation:'Rules change. No need to start your records over.',ressources:'A management question should not take all evening.',generale:'Your estate day should not end in spreadsheets.'},
    de: {recolte:'Ihre Ernte sollte nicht den ganzen Abend kosten.',tarifs:'Kann ein Programm mehrere Abos ersetzen?',drm:'Die DRM kommt jeden Monat. Die Doppelerfassung auch?',vigne:'Tagsüber im Weinberg. Abends Daten nachtragen?',cave:'Ihr Wein entwickelt sich. Ihre Aufzeichnungen auch?',stocks:'Wie viele Flaschen? Fragen Sie Ihre Daten.',mises:'Die nächste Abfüllung ohne drei getrennte Tabellen.',ventes:'Rechnungen versenden. Den Feierabend behalten.',couts:'Ihre Marge verdient mehr als geschätzte Kosten.',oenotourisme:'Nach der Verkostung Kunden behalten, Daten nicht neu erfassen.',assistant:'Ihre Daten fragen, statt neue Tabellen anzulegen.',migration:'Mehr Programme. Mehr Rechnungen?',aides:'Fördermittel suchen kostet Zeit. Verwaltung auch.',reglementation:'Regeln ändern sich. Ihre Daten bleiben nutzbar.',ressources:'Eine Verwaltungsfrage sollte keinen Abend kosten.',generale:'Ihr Arbeitstag sollte nicht in Tabellen enden.'},
    it: {recolte:'La vendemmia non dovrebbe occupare tutta la serata.',tarifs:'Un software può sostituire più abbonamenti?',drm:'La DRM torna ogni mese. Anche i dati da ricopiare?',vigne:'Una giornata in vigna. Una serata a ricopiare?',cave:'Il vino evolve. I tuoi registri lo seguono?',stocks:'Quante bottiglie? Chiedilo ai tuoi dati.',mises:'Il prossimo imbottigliamento, senza unire tre fogli.',ventes:'Invia le fatture. Tieni libere le serate.',couts:'I tuoi margini meritano costi più precisi.',oenotourisme:'Dopo la degustazione, conserva il cliente, non la riscrittura.',assistant:'Interroga i dati, senza creare un altro foglio.',migration:'Aumentano i software. Anche le fatture?',aides:'Cercare aiuti richiede tempo. Anche gestire l’azienda.',reglementation:'Le regole cambiano. I tuoi dati restano utili.',ressources:'Una domanda di gestione non dovrebbe occupare una serata.',generale:'La giornata in azienda non dovrebbe finire nei fogli di calcolo.'},
    zh: {recolte:'采收申报，不该占据整个晚上。',tarifs:'一套软件，能否替代多项订阅？',drm:'每月都要申报，也要重复录入吗？',vigne:'白天在葡萄园，晚上还要重复录入？',cave:'酒在成熟，管理记录也应及时跟进。',stocks:'还有多少瓶？直接询问您的数据。',mises:'下一次装瓶，不必拼接三张表格。',ventes:'发出发票，把晚上留给自己。',couts:'了解利润，不该只靠成本估算。',oenotourisme:'品鉴结束，留下客户，不留重复录入。',assistant:'询问数据，而不是再建一张表。',migration:'软件越来越多，账单也越来越多？',aides:'寻找补助需要时间，管理酒庄也是。',reglementation:'规则在变，管理数据不必从头整理。',ressources:'一个管理问题，不该耗费整个晚上。',generale:'酒庄的一天，不该以整理表格结束。'}
  };
  if (TITRES[langue]) T.titre = TITRES[langue][contexte[0]] || TITRES[langue].generale;
  T.budget = {fr:'d’économies par an sur vos outils de gestion',en:'in annual savings to target on management tools',de:'Ersparnis pro Jahr bei Ihren Verwaltungsprogrammen als Ziel',it:'di risparmio all’anno sui tuoi software gestionali',zh:T.budget}[langue] || T.budget;
  T.valeur = objectif === 'recolte' ? (langue === 'zh' ? '30 秒' : '30 s') : objectif === 'budget' ? ({fr:'2 400 €',en:'€2,400',de:'2.400 €',it:'2.400 €',zh:'€2,400'}[langue] || '2 400 €') : (langue === 'zh' ? '7 小时' : '7 h');
  T.unite = T[objectif];
  T.prefixe = objectif === 'recolte' ? T.defi : T.objectif;
  if (objectif === 'recolte') T.note = T.limiteRecolte;
  var videoDisponible = /^(stocks|assistant|generale)$/.test(contexte[0]);
  var video = new URL('index.html#nouveaute-ia', racine);
  var contact = new URL((TEXTES[langue] && langue !== 'fr' ? langue + '/' : '') + 'contact.html?objet=demo#formulaire', racine);
  var CLE = 'monchai_cta_contextes_v1';
  var memoire = { vus: [], pause: false };
  function etat() {
    try {
      var lu = JSON.parse(sessionStorage.getItem(CLE));
      if (lu && Array.isArray(lu.vus)) memoire = lu;
    } catch (e) {}
    return memoire;
  }
  function dejaVue() {
    var e = etat();
    return e.pause || e.vus.indexOf(contexte[0]) !== -1;
  }
  function memoriser(action) {
    var e = etat();
    if (e.vus.indexOf(contexte[0]) === -1) e.vus.push(contexte[0]);
    if (action) e.pause = true;
    try { sessionStorage.setItem(CLE, JSON.stringify(e)); } catch (erreur) {}
  }
  window.addEventListener('monchai:cadeau-ouvert', function () {
    terminee = true;
    clearTimeout(timer);
    fermer();
    memoriser(true);
  });
  window.addEventListener('monchai:cadeau-affiche', function () {
    terminee = true;
    clearTimeout(timer);
  });
  if (dejaVue()) return;

  // Composition éditoriale : accroche métier, chiffre, explication, invitation.
  var logo = new URL('assets/img/logo-header-344.webp', racine).href;
  var signatures = {fr: 'Pensé avec les vignerons', en: 'Built with winegrowers', de: 'Mit Winzern entwickelt', it: 'Creato con i viticoltori', zh: '与葡萄种植者共同打造'};
  var photo = new URL('assets/img/cta-chai.webp', racine).href;
  var CSS = [
    ".mc-cta{position:fixed;right:20px;bottom:20px;z-index:290;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:64px minmax(0,1fr) auto;box-sizing:border-box;width:min(380px,calc(100vw - 40px));max-height:min(370px,55dvh,calc(100dvh - 32px));overflow:hidden;background:#FAF4EA;border:1px solid #D9C5AC;border-radius:12px;box-shadow:0 12px 36px #38251F26;color:#49372F;font-family:Inter,system-ui,sans-serif;animation:mc-cta-entree .3s ease-out;isolation:isolate}",
    ".mc-cta[hidden]{display:none}.mc-cta *{box-sizing:border-box}",
    ".mc-cta__bandeau{position:relative;isolation:isolate;grid-column:1;grid-row:1;min-width:0;overflow:hidden;background:#392B22;border-bottom:1px solid #D9C5AC}.mc-cta__bandeau::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#21160DB3,#21160D26)}.mc-cta__photo{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;object-position:50% 46%}.mc-cta__signature{position:absolute;left:142px;right:60px;top:50%;transform:translateY(-50%);margin:0;color:#FFF3DF;font-size:10px;line-height:1.4}",
    ".mc-cta__logo{position:absolute;top:12px;left:20px;z-index:1;width:104px;height:auto;padding:5px;margin:0;background:#FAF4EA;border:1px solid #D9C5AC;border-radius:3px}.mc-cta__contenu{grid-column:1;grid-row:2;min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;padding:18px 22px 14px;scrollbar-width:thin;scrollbar-color:#B5987C transparent}.mc-cta__titre{margin:0 0 12px;font:400 23px/1.18 'Playfair Display',Georgia,serif;letter-spacing:-.3px;color:#40291F;text-wrap:balance}",
    ".mc-cta__objectif{display:block;margin:0 0 12px;color:#752E33}.mc-cta__prefixe{display:block;margin-bottom:3px;color:#856347;font-size:11px;font-weight:500;line-height:1.4}.mc-cta__valeur{display:block;margin:0 0 4px;font:400 42px/1.05 'Playfair Display',Georgia,serif;letter-spacing:-1px;white-space:nowrap;color:#752E33}.mc-cta__unite{display:block;font-size:12px;font-weight:400;line-height:1.5;color:#5C4235}.mc-cta__annuel{display:block;margin-top:4px;color:#856347;font-size:11px;line-height:1.5}",
    ".mc-cta__texte{margin:0;color:#5F4A3D;font-size:12px;line-height:1.6}.mc-cta__note{margin:10px 0 0;padding-left:10px;border-left:2px solid #CEAF88;color:#766151;font-size:11px;line-height:1.5}",
    ".mc-cta__fermer{position:absolute;z-index:2;top:10px;right:10px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:1px solid #FFF3DF66;border-radius:50%;background:#FAF4EAF2;color:#57372B;font:23px/1 system-ui;cursor:pointer}.mc-cta__fermer:hover{background:#fff}",
    ".mc-cta__actions{grid-column:1;grid-row:3;display:grid;gap:2px;padding:0 22px 10px;background:#FAF4EA}.mc-cta__btn{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:10px 14px;border:1px solid #752E33;border-radius:7px;background:#752E33;color:#FFF9F1;text-decoration:none;text-align:left;font-size:12px;font-weight:500;line-height:1.4}.mc-cta__btn:hover{background:#5C2027}.mc-cta__fleche{font-size:20px;line-height:1;font-weight:400}.mc-cta__btn--secondaire{justify-content:center;padding:8px;border-color:transparent;border-radius:6px;background:transparent;color:#752E33;font-size:11px;font-weight:400;text-decoration:underline;text-decoration-color:#BE9A79;text-underline-offset:4px}.mc-cta__btn--secondaire:hover{background:#EFE4D6}.mc-cta :focus-visible{outline:2px solid #752E33;outline-offset:3px}",
    "@keyframes mc-cta-entree{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    "@media(max-width:639px){.mc-cta{left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));width:auto;max-height:min(320px,42dvh);grid-template-rows:48px minmax(0,1fr) auto}.mc-cta__logo{top:7px;left:18px;width:94px}.mc-cta__signature{left:130px;right:60px;font-size:9px}.mc-cta__fermer{top:2px;right:8px}.mc-cta__contenu{padding:15px 18px 12px}.mc-cta__titre{font-size:22px}.mc-cta__valeur{font-size:38px}.mc-cta__actions{padding:0 18px 8px}}",
    "@media(max-width:360px){.mc-cta__signature{display:none}.mc-cta__titre{font-size:21px}.mc-cta__valeur{font-size:36px}}",
    "@media(max-height:600px) and (min-width:640px){.mc-cta{grid-template-rows:56px minmax(0,1fr) auto}.mc-cta__logo{top:8px}.mc-cta__fermer{top:6px}}",
    "@media(prefers-reduced-motion:reduce){.mc-cta,.mc-cta__btn{animation:none;transition:none}}@media print{.mc-cta{display:none!important}}"
  ].join('\n');

  var carte = null, precedent = null, timer = null, terminee = false;
  function signaler(evenement) {
    if (!window.monchaiConsent || window.monchaiConsent.audience !== true) return;
    (window.dataLayer = window.dataLayer || []).push({ event: evenement, cta_campagne: contexte[0], cta_variante: variante, cta_objectif: objectif, cta_statut: 'objectif_a_mesurer' });
  }
  function fermer(raison) {
    if (!carte || carte.hidden) return;
    var focusDedans = carte.contains(document.activeElement);
    carte.hidden = true;
    if (focusDedans) {
      var cible = precedent && precedent.isConnected && precedent !== document.body ? precedent : document.querySelector('main h1, h1, main');
      if (cible) {
        var ancien = cible.getAttribute('tabindex');
        cible.setAttribute('tabindex', '-1');
        cible.focus({ preventScroll: true });
        if (ancien === null) cible.removeAttribute('tabindex');
        else cible.setAttribute('tabindex', ancien);
      }
    }
    if (raison !== 'navigation') signaler('cta_popup_ferme');
  }
  function construire() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    carte = document.createElement('aside');
    carte.className = 'mc-cta';
    carte.setAttribute('data-campagne', contexte[0]);
    carte.setAttribute('data-variante', variante);
    carte.setAttribute('data-objectif', objectif);
    carte.setAttribute('aria-labelledby', 'mcCtaTitre');
    carte.setAttribute('aria-describedby', 'mcCtaTexte mcCtaNote');
    carte.setAttribute('aria-live', 'polite');
    // Le film récolte n'existe pas encore : cette carte mène à une demande
    // de démo chronométrée. Le film existant montre stocks et impayés.
    var principal = videoDisponible ? {id:'video',texte:T.video,href:video.href} : {id:'demo',texte:T.demo,href:contact.href};
    var secondaire = videoDisponible ? {id:'demo',texte:T.demo,href:contact.href} : {id:'essai',texte:T.essai,href:'https://tester.monchai.fr'};
    // Les textes proviennent uniquement du catalogue statique ci-dessus.
    carte.innerHTML = '<button type="button" class="mc-cta__fermer" aria-label="' + T.fermer + '">&times;</button>' +
      '<div class="mc-cta__bandeau"><img class="mc-cta__photo" src="' + photo + '" alt="" width="1000" height="563" decoding="async"><p class="mc-cta__signature">' + (signatures[langue] || signatures.fr) + '</p></div>' +
      '<div class="mc-cta__contenu" role="group" aria-labelledby="mcCtaTitre" tabindex="0"><img class="mc-cta__logo" src="' + logo + '" alt="Mon Chai" width="344" height="111"><h2 class="mc-cta__titre" id="mcCtaTitre">' + T.titre + '</h2>' +
      '<p class="mc-cta__objectif"><span class="mc-cta__prefixe">' + T.prefixe + '</span><strong class="mc-cta__valeur">' + T.valeur + '</strong><span class="mc-cta__unite">' + T.unite + '</span>' + (objectif === 'budget' ? '<span class="mc-cta__annuel">' + T.annuel + '</span>' : '') + '</p>' +
      '<p class="mc-cta__texte" id="mcCtaTexte">' + T.texte + '</p>' +
      '<p class="mc-cta__note" id="mcCtaNote">' + T.note + '</p></div>' +
      '<div class="mc-cta__actions"><a class="mc-cta__btn" data-mc-cta="' + principal.id + '">' + principal.texte + '<span class="mc-cta__fleche" aria-hidden="true">&rarr;</span></a>' +
      '<a class="mc-cta__btn mc-cta__btn--secondaire" data-mc-cta="' + secondaire.id + '">' + secondaire.texte + '</a></div>';
    carte.querySelector('[data-mc-cta="' + principal.id + '"]').href = principal.href;
    carte.querySelector('[data-mc-cta="' + secondaire.id + '"]').href = secondaire.href;
    carte.querySelector('.mc-cta__fermer').addEventListener('click', fermer);
    carte.querySelectorAll('[data-mc-cta]').forEach(function (a) {
      a.addEventListener('click', function () {
        memoriser(true);
        signaler('cta_popup_' + a.getAttribute('data-mc-cta'));
        if (a.getAttribute('data-mc-cta') === 'video') fermer('navigation');
      });
    });
    precedent = document.activeElement;
    document.body.appendChild(carte);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ![].some.call(document.querySelectorAll('[aria-modal="true"], dialog[open]'), visible)) fermer();
    }, true);
  }
  function visible(el) {
    return !!el && !el.hidden && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
  function occupe() {
    if (document.visibilityState === 'hidden') return true;
    if (visible(document.getElementById('cookieBanner')) || visible(document.getElementById('cookieModal'))) return true;
    if ([].some.call(document.querySelectorAll('[aria-modal="true"], dialog[open], .hd.est-deploye'), visible)) return true;
    var focus = document.activeElement;
    return !!focus && (focus.matches('input, select, textarea') || focus.isContentEditable);
  }
  function declencher() {
    clearTimeout(timer);
    if (terminee || dejaVue()) return;
    if (occupe()) { timer = setTimeout(declencher, 1000); return; }
    terminee = true;
    construire();
    memoriser(false);
    signaler('cta_popup_affiche');
  }
  function demarrer() {
    clearTimeout(timer);
    var ecoule = window.performance ? performance.now() : 0;
    timer = setTimeout(declencher, Math.max(0, 20000 - ecoule));
  }
  window.addEventListener('pagehide', function () { clearTimeout(timer); });
  window.addEventListener('pageshow', function (e) { if (e.persisted && !terminee) demarrer(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer, { once: true });
  else demarrer();
})();
