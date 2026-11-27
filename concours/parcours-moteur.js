(function(root){
  'use strict';
  const steps=[
    {id:'taille',season:'Hiver',title:'Le geste juste',subtitle:'Préparer la prochaine récolte',mission:'Un cep prétaillé en Guyot simple : gardez 2 yeux sur A, 6 sur B, retirez C et D sans coupe rase.',action:'Placez vos coupes, puis validez le cep.',source:['IFV · Taille en Guyot','https://www.vignevin-occitanie.com/la-taille-longue-de-la-vigne-en-guyot/'],axes:[0,1,0,0]},
    {id:'vendanges',season:'Fin d’été',title:'Le bon moment',subtitle:'Une récolte commence par un bon prélèvement',mission:'Vous recherchez un rouge fruité, entre 12,5 et 13,5 % vol. potentiels dans ce scénario. Une pluie importante est annoncée dans 48 heures.',action:'Prélevez dans cinq zones différentes, lisez le bilan et programmez la récolte.',source:['IFV · Prélèvement de raisins','https://www.vignevin-occitanie.com/prelevement-de-raisins/'],axes:[1,0,0,0]},
    {id:'chauffe',season:'Vendanges',title:'La cuve monte',subtitle:'Garder la main sur la fermentation',mission:'Le rouge de la cuve C12 fermente. La température atteint 33 °C et continue de monter. Le protocole de ce lot vise 26 °C, avec une tolérance de 1 °C.',action:'Lisez le suivi, réglez le refroidissement et prévoyez le contrôle suivant.',source:['IFV · Arrêts de fermentation','https://www.vignevin-occitanie.com/les-arrets-de-fermentation-alcoolique/'],axes:[0,0,1,0]},
    {id:'derive',season:'Après vendanges',title:'La malo… ou une alerte ?',subtitle:'Ne pas confondre évolution et dérive',mission:'Dans C07, la fermentation alcoolique s’est arrêtée. Il reste des sucres, l’acide malique baisse et la volatile augmente. Vous devez organiser la réaction.',action:'Prélevez, consultez les analyses, puis construisez un plan en trois actions.',source:['OIV · Suivi des fermentations','https://www.oiv.int/fr/standards/review-of-practices-for-the-reduction-of-so2-doses-used-in-winemaking-'],axes:[0,0,1,0]},
    {id:'controle',season:'Fin d’automne',title:'C’est fini, la malo ?',subtitle:'Vérifier avant de conclure',mission:'Un autre lot, C03, a terminé sa fermentation alcoolique. Sa malo était recherchée. Le papier de suivi ne montre plus de tache malique nette.',action:'Comparez les témoins, demandez le contrôle de fin et préparez la suite.',source:['IFV · Fermentation malolactique','https://www.vignevin.com/publications/fiches-pratiques/fermentation-malolactique/'],axes:[1,0,0,0]},
    {id:'ouillage',season:'Élevage',title:'La part des anges',subtitle:'Préserver le vin jusqu’au prochain rendez-vous',mission:'Le fût F18 de 225 L contient 219 L d’un rouge en élevage classique, sans recherche de voile. Une réserve saine du même lot est disponible.',action:'Vérifiez le matériel, choisissez la réserve, ajustez le volume et refermez.',source:['OIV · Ouillage','https://www.oiv.int/public/medias/3519/f-code-ii-34-341.pdf'],axes:[0,0,0,1]}
  ];
  const sampling=[
    {label:'Bordure, côté soleil',interior:false,x:16,y:20},{label:'Intérieur, face ombragée, haut de grappe',interior:true,x:50,y:18},{label:'Bordure, bout de rang',interior:false,x:84,y:20},
    {label:'Intérieur, face soleil, bas de grappe',interior:true,x:23,y:47},{label:'Intérieur, milieu de grappe',interior:true,x:50,y:45},{label:'Intérieur, face ombragée, bas de grappe',interior:true,x:77,y:47},
    {label:'Bordure, entrée de rang',interior:false,x:16,y:76},{label:'Intérieur, face soleil, haut de grappe',interior:true,x:50,y:74},{label:'Bordure, côté ombre',interior:false,x:84,y:76}
  ];
  const plans=[{id:'isoler',label:'Repérer C07 et suspendre les transferts vers les autres lots'},{id:'diagnostic',label:'Transmettre analyses et observations à l’œnologue pour un diagnostic urgent'},{id:'protocole',label:'Organiser la maîtrise microbienne et la reprise de FA selon son protocole'},{id:'attendre',label:'Attendre une semaine sans suivi supplémentaire'},{id:'lancer',label:'Favoriser la malo comme si la FA était terminée'},{id:'assembler',label:'Assembler avec une cuve saine pour diluer le problème'}];
  const limit=n=>Math.max(0,Math.min(100,Math.round(n)));
  function evaluate(id,s){
    let score=0,observed='',explain='',takeaway='';
    if(id==='taille'){
      score=limit(s.score);observed=s.lines.map(l=>`${l.id} : ${l.reason}`).join(' ');
      explain='Le courson prépare le renouvellement, la baguette porte la charge retenue pour ce cep. Les coupes trop proches des yeux ou rasant le vieux bois ne servent pas l’objectif. Les tolérances de cette scène sont des paramètres de jeu.';
      takeaway='Observer le bois et les yeux avant de couper. La charge réelle dépend du cep et du contexte.';
    }else if(id==='vendanges'){
      const picks=[...new Set(s.samples)].filter(i=>sampling[i]),inside=picks.filter(i=>sampling[i].interior).length;
      score=limit(inside*12+(Number(s.day)===0?30:Number(s.day)===1?12:0)+(s.read?10:0));
      observed=`${inside} zones intérieures sur ${picks.length} prélèvements. Récolte choisie : ${['demain matin','dans 3 jours','dans 6 jours'][s.day]}.`;
      explain='Dans ce lot fictif, analyses et dégustation correspondent déjà au style demandé ; la pluie annoncée fait pencher la décision vers demain. Prélever seulement les grappes les plus accessibles peut fausser la lecture de la parcelle. Les cinq zones représentent une campagne de prélèvements, pas cinq baies suffisantes à une analyse réelle.';
      takeaway='Échantillonner de façon représentative, puis croiser analyses, dégustation, météo et objectif de vin.';
    }else if(id==='chauffe'){
      const delta=Math.abs(Number(s.temp)-26);
      score=limit((s.cooling?35:0)+(delta<=1?35:delta<=3?15:0)+(s.follow?20:0)+(s.read?10:0));
      observed=`Circuit ${s.cooling?'ouvert':'fermé'}, consigne ${s.temp} °C, ${s.follow?'contrôle rapproché prévu':'aucun contrôle programmé'}.`;
      explain='La consigne seule ne refroidit rien si le circuit n’est pas actif. Ici, le bon geste est de revenir progressivement vers le protocole du lot et de vérifier la réponse de la cuve. Les températures extrêmes peuvent perturber les levures ; un arrêt éventuel demande un diagnostic, pas un réglage universel.';
      takeaway='Associer mesure, action sur l’équipement et nouveau contrôle. La courbe affichée est une projection pédagogique.';
    }else if(id==='derive'){
      const expected=['isoler','diagnostic','protocole'];
      score=limit((s.sample?15:0)+(s.read?10:0)+expected.reduce((n,v,i)=>n+(s.plan[i]===v?25:0),0));
      observed=`Votre plan : ${s.plan.map(v=>plans.find(p=>p.id===v)?.label||'action manquante').join(' ; ')}.`;
      explain='Cette association de sucres résiduels, FA arrêtée et volatile en hausse est une alerte compatible avec une activité microbienne indésirable ; elle ne suffit pas à poser un diagnostic. Encourager la malo sans éclaircir la situation expose le lot. Le plan du jeu : sécuriser les transferts, faire interpréter les analyses, puis suivre un protocole de maîtrise et de reprise adapté.';
      takeaway='Ne pas banaliser une baisse du malique quand des sucres restent. Aucun traitement ni dosage ne se décide sur ces seuls chiffres.';
    }else if(id==='controle'){
      score=limit((s.compared?20:0)+(s.enzymatic?50:0)+(s.stabilize?30:0));
      observed=`Témoins ${s.compared?'comparés':'non comparés'}, dosage enzymatique ${s.enzymatic?'demandé':'non demandé'}, suite du lot ${s.stabilize?'planifiée':'non planifiée'}.`;
      explain='La FML transforme l’acide malique en acide lactique. Le papier aide à suivre l’évolution, mais une tache peu visible ne prouve pas à elle seule la fin de malo. Le dosage enzymatique et son interprétation au laboratoire apportent la confirmation dans cette scène. Une fois la fin confirmée, la stabilisation et la protection du lot sont définies selon son contexte.';
      takeaway='La fin se confirme par une mesure adaptée. Une FML recherchée et une dérive sur sucres ne se pilotent pas de la même manière.';
    }else if(id==='ouillage'){
      const error=Math.abs(Number(s.volume)-6);
      score=limit((s.clean?20:0)+(s.reserve==='F18'?25:0)+(error<=.1?40:error<=.5?25:error<=1?10:0)+(s.closed?15:0));
      observed=`${s.volume} L ajoutés, réserve ${s.reserve==='F18'?'du même lot':'non identifiée'}, matériel ${s.clean?'vérifié':'non vérifié'}, fût ${s.closed?'refermé':'ouvert'}.`;
      explain='Il manque ici 6 L : 225 − 219. Pour cet élevage sans voile, l’ouillage réduit l’espace d’air au-dessus du vin. La réserve doit être saine et compatible ; le matériel et la fermeture comptent autant que le volume. Le jeu simplifie la mesure du niveau et ne reproduit pas le comportement réel d’un fût.';
      takeaway='Choisir le bon vin, compenser le manque sans débordement et refermer après contrôle.';
    }else throw new Error('Atelier inconnu');
    return {id,score,observed,explain,takeaway};
  }
  const axisNames=['Observation','Précision','Sang-froid','Préservation'];
  const portraits=[
    {title:'L’œil du vignoble',text:'Dans vos décisions, vous cherchez les indices avant de vous engager. Votre force de jeu : relier ce que vous observez à ce que vous faites.'},
    {title:'L’artisan du geste',text:'Vous vous exprimez dans les réglages fins et les gestes mesurés. Votre force de jeu : transformer une intention en une action précise.'},
    {title:'Le chef d’orchestre du chai',text:'Face à une alerte, vous organisez la réponse et son suivi. Votre force de jeu : garder un fil clair quand plusieurs paramètres évoluent.'},
    {title:'Le gardien du millésime',text:'Vous êtes attentif à ce qui préserve le lot jusqu’à la prochaine étape. Votre force de jeu : soigner les détails et éviter les raccourcis.'}
  ];
  function profile(records){
    const sums=[0,0,0,0],counts=[0,0,0,0];let total=0;
    steps.forEach(step=>{const r=records.find(r=>r.id===step.id);if(!r)return;const score=limit(Number(r.score)||0);total+=score;step.axes.forEach((w,i)=>{sums[i]+=score*w;counts[i]+=w;});});
    const axes=sums.map((sum,i)=>Math.round(sum/(counts[i]||1))),best=Math.max(...axes),winners=axes.flatMap((v,i)=>v===best?[i]:[]);
    const portrait=total<180?{title:'L’explorateur du millésime',text:'Vous avez ouvert les portes du vignoble et du chai. Les explications rencontrées sont vos premiers repères : le prochain essai sera l’occasion de les mettre en pratique.'}:winners.length>1?{title:'L’esprit du millésime',text:'Votre jeu mêle plusieurs forces : observation, geste, réaction et soin du vin. Votre signature est l’équilibre entre ces attentions.'}:portraits[winners[0]];
    return {...portrait,axes,total,names:axisNames};
  }
  const api={steps,sampling,plans,evaluate,profile};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Parcours=api;
})(globalThis);
