'use strict';
(() => {
  const $=id=>document.getElementById(id);
  let activity='',getState=()=>({}),step=0,active=false,touched=new Set(),target=null;
  const made=(s,id)=>s.branches?.find(b=>b.id===id)?.made;
  const configurations={
    taille:[
      {title:'Commencez par le sarment A',text:'Choisissez A sur le cep ou avec son bouton. Réglez la coupe pour conserver deux yeux, puis cliquez sur « Couper ici ».',word:'Un œil est un bourgeon. Le courson est le sarment court conservé pour le renouvellement.',ids:['A'],done:s=>made(s,'A'),target:s=>s.selection==='A'?'#cut-details':'.branch-button[data-branch="A"]',feedback:s=>`A est coupé : ${s.branches?.find(b=>b.id==='A')?.eyes} yeux conservés. Vous pouvez ajuster ou annuler avant de continuer.`},
      {title:'Passez au sarment B',text:'Choisissez B. Cette fois, gardez six yeux sur la baguette, puis confirmez la coupe.',word:'La baguette est le bois long conservé pour porter la récolte prévue dans cet exercice.',ids:['B'],done:s=>made(s,'B'),target:s=>s.selection==='B'?'#cut-details':'.branch-button[data-branch="B"]',feedback:s=>`B est coupé : ${s.branches?.find(b=>b.id==='B')?.eyes} yeux conservés.`},
      {title:'Retirez C et D',text:'Coupez les deux sarments superflus près de leur départ, en laissant un petit chicot. Faites une coupe, puis l’autre.',word:'Le chicot est le petit morceau de bois laissé à la base après la suppression du sarment. Le jeu indique sa marge de coupe.',ids:['C','D'],done:s=>made(s,'C')&&made(s,'D'),target:s=>s.selection&&['C','D'].includes(s.selection)?'#cut-details':`.branch-button[data-branch="${made(s,'C')?'D':'C'}"]`,feedback:()=> 'C et D ont été coupés. Les quatre gestes sont prêts à être relus.'},
      {title:'Regardez le cep obtenu',text:'Vos coupes sont terminées. Le bilan va expliquer les yeux conservés et les marges de coupe. Vous pouvez revenir au geste précédent pour corriger.',ids:[],done:s=>['A','B','C','D'].every(id=>made(s,id)),target:()=> '#mission-list',final:'#validate-vine'}
    ],
    vendanges:[
      {title:'Prélevez dans cinq zones',text:'Cliquez sur cinq grappes de la scène. Répartissez votre prélèvement dans la parcelle, plutôt que sur les seules bordures.',word:'Chaque zone symbolise plusieurs prélèvements, pas une seule baie. Un échantillon doit représenter la parcelle.',done:s=>s.samples.length===5,target:()=> '.vineyard-panorama',feedback:s=>`${s.samples.length} zones prélevées sur 5. Le bilan peut maintenant être consulté.`},
      {title:'Ouvrez le bilan du prélèvement',text:'Consultez les analyses, la dégustation et la météo. Prenez le temps de les lire avant de choisir la récolte.',done:s=>s.read,target:()=> '#read-harvest',feedback:()=> 'Le bilan est ouvert. Vous pourrez encore le consulter au moment du choix.'},
      {title:'Choisissez quand récolter',text:'Relisez le bilan ci-dessous, puis choisissez un créneau. Le bilan de votre décision viendra juste après.',done:s=>s.day!==null,target:()=> '#harvest-day',final:'#check-mission'}
    ],
    chauffe:[
      {title:'Lisez ce qui arrive dans la cuve',text:'Ouvrez le suivi. Comparez la température mesurée et l’objectif donné pour ce lot.',word:'La fermentation alcoolique, ou FA, est la transformation des sucres en alcool par les levures.',done:s=>s.read,target:()=> '#read-monitor',feedback:()=> 'Le suivi est ouvert. L’objectif de ce lot est 26 °C, avec une tolérance de 1 °C.'},
      {title:'Réglez le refroidissement',text:'Le protocole de ce lot vise 26 °C. Choisissez l’état du circuit avec la vanne ou la case, puis déplacez le curseur. Vérifiez les deux réglages.',done:()=> (touched.has('valve')||touched.has('cooling'))&&touched.has('target-temp'),target:()=> !touched.has('valve')&&!touched.has('cooling')?'#cooling':'#target-temp',feedback:s=>`Circuit ${s.cooling?'ouvert':'fermé'}, consigne réglée à ${s.temp} °C.`},
      {title:'Prévoyez la vérification suivante',text:'Décidez si vous programmez un nouveau contrôle après le réglage. Puis découvrez ce que vos choix changent.',done:()=>true,target:()=> '#follow',final:'#check-mission'}
    ],
    derive:[
      {title:'Commencez par prélever C07',text:'Cliquez sur le bouton de prélèvement sur la cuve. L’échantillon sera identifié C07.',word:'Ce lot a encore des sucres après un arrêt de fermentation alcoolique. Les observations demandent à être éclaircies.',done:s=>s.sample,target:()=> '#take-sample',feedback:()=> 'L’échantillon C07 est identifié. Vous pouvez passer aux analyses.'},
      {title:'Consultez les trois indicateurs',text:'Ouvrez les analyses. Regardez les sucres, l’évolution du malique et celle de la volatile, ensemble.',word:'Malique : acide suivi pendant la malo. Volatile : paramètre d’analyse dont une hausse peut alerter. Ces chiffres seuls ne posent pas un diagnostic.',done:s=>s.read,target:()=> '#read-lab',feedback:()=> 'Les analyses sont ouvertes. La prochaine étape est d’organiser votre réaction.'},
      {title:'Construisez votre plan en trois actions',text:'Cliquez sur trois actions dans l’ordre où vous souhaitez les organiser. « Retirer la dernière action » permet de modifier votre plan.',done:s=>s.plan.length===3,target:()=> '.plan-options',final:'#check-mission'}
    ],
    controle:[
      {title:'Comparez le vin aux témoins',text:'Cliquez sur « Comparer aux témoins » sur le papier. Repérez la position des taches malique et lactique.',word:'La malo, ou FML, transforme l’acide malique en acide lactique. Ici, elle était recherchée sur C03, un autre lot.',done:s=>s.compared,target:()=> '#compare-paper',feedback:()=> 'Les positions des témoins sont repérées. Choisissez maintenant comment conclure.'},
      {title:'Choisissez comment confirmer la fin',text:'Demandez un dosage enzymatique, ou choisissez de conclure avec le papier seul. Lisez le résultat de votre choix avant de continuer.',word:'Le dosage enzymatique est une analyse qui permet de mesurer l’acide malique restant.',done:s=>s.decided,target:()=> '.method-actions',feedback:s=>s.enzymatic?'Le résultat du laboratoire est affiché.':'Vous avez choisi le papier seul. Ce choix sera expliqué dans le bilan.'},
      {title:'Préparez la suite de ce lot',text:'Décidez si vous préparez sa stabilisation et sa protection après confirmation de fin. Puis ouvrez le bilan.',done:()=>true,target:()=> '#stabilize',final:'#check-mission'}
    ],
    ouillage:[
      {title:'Vérifiez le matériel et la réserve',text:'Commencez par confirmer que le matériel est propre et que le vin de réserve a été contrôlé sain.',word:'L’ouillage consiste à compléter un récipient avec du vin pour compenser le manque. Ce fût est en élevage classique sans voile.',done:s=>s.clean,target:()=> '#clean',feedback:()=> 'La vérification est faite. Choisissez maintenant le vin à utiliser.'},
      {title:'Choisissez le vin de réserve',text:'Sélectionnez le vin que vous allez employer pour compléter F18.',done:s=>!!s.reserve,target:()=> '#reserve',feedback:s=>s.reserve==='F18'?'La réserve du même lot est sélectionnée.':'Vous avez sélectionné le bidon non identifié.'},
      {title:'Ajustez le volume à ajouter',text:'Le fût de 225 L contient 219 L. Déplacez le curseur, ou préparez le volume par pas de 0,5 L sur la scène.',done:()=>touched.has('fill-volume')||touched.has('pump'),target:()=> '#fill-volume',feedback:s=>`Vous prévoyez d’ajouter ${s.volume.toLocaleString('fr-FR')} L.`},
      {title:'Terminez votre tournée',text:'Décidez si vous prévoyez de remettre la bonde après contrôle du niveau. Le bilan va reprendre tout le geste.',done:()=>true,target:()=> '#closed',final:'#check-mission'}
    ]
  };
  function wrap(phase,first,last=first){
    if(!first||first.parentElement.hasAttribute('data-guide-phases'))return;
    const g=document.createElement('div');g.dataset.guidePhases=String(phase);first.parentElement.insertBefore(g,first);
    let n=first;while(n){const next=n.nextSibling;g.append(n);if(n===last)break;n=next;}
  }
  function prepare(id){
    const label=id=>$(id)?.closest('label');
    if(id==='vendanges'){
      wrap('0',$('reset-samples'));wrap('1,2',$('harvest-report'));wrap('1',$('read-harvest'));wrap('2',document.querySelector('label[for="harvest-day"]'),$('harvest-day'));
    }else if(id==='chauffe'){
      wrap('0',$('read-monitor'),$('monitor-report'));wrap('1',label('cooling'),$('thermal-projection'));wrap('2',label('follow'));
    }else if(id==='derive'){
      wrap('1,2',$('alert-lab'));wrap('1',$('read-lab'));wrap('2',document.querySelector('#scenario-controls > .instruction'),$('undo-plan'));
    }else if(id==='controle'){
      wrap('1',document.querySelector('.method-actions'),$('paper-conclusion'));wrap('2',label('stabilize'));
    }else if(id==='ouillage'){
      wrap('0',label('clean'));wrap('1',document.querySelector('label[for="reserve"]'),$('reserve'));wrap('2',document.querySelector('label[for="fill-volume"]'),$('overflow-note'));wrap('3',label('closed'));
    }
  }
  function snapshot(){return activity==='taille'?window.AtelierTaille.status():getState();}
  function focusTarget(){
    if(!target)return;target.scrollIntoView({block:'center',behavior:'instant'});if(!target.matches('input,select,button,a'))target.tabIndex=-1;target.focus({preventScroll:true});
  }
  function update(){
    if(!active)return;
    if(activity==='taille'){
      const s=snapshot();
      if(step>0&&!made(s,'A'))step=0;
      else if(step>1&&!made(s,'B'))step=1;
      else if(step>2&&(!made(s,'C')||!made(s,'D')))step=2;
    }
    const config=configurations[activity][step],s=snapshot(),done=!!config.done(s);
    const chapter=window.Parcours.steps.findIndex(s=>s.id===activity)+1;
    $('guide-count').textContent=`Atelier ${chapter} / 6 · Geste ${step+1} / ${configurations[activity].length}`;
    $('guide-title').textContent=config.title;$('guide-text').textContent=config.text;
    $('guide-words').hidden=!config.word;$('guide-word-text').textContent=config.word||'';
    const feedback=done&&!config.final?(config.feedback?.(s)||'Ce geste est fait. Vous pouvez continuer.'):activity==='taille'&&!config.final?s.feedback:'Vous pouvez prendre votre temps.';
    if($('guide-feedback').textContent!==feedback)$('guide-feedback').textContent=feedback;
    $('guide-back').disabled=step===0;
    $('guide-action').textContent=done?(config.final?'Voir l’explication':'Continuer'):'Me montrer où agir';
    document.querySelectorAll('[data-guide-phases]').forEach(g=>g.hidden=!g.dataset.guidePhases.split(',').includes(String(step)));
    document.querySelectorAll('.guide-target').forEach(n=>n.classList.remove('guide-target'));
    if(activity==='taille'){
      window.AtelierTaille.allow(config.ids);$('pruning-stage').classList.toggle('guide-review',!!config.final);
      const title=$('mission-title');title.textContent=config.final?'Votre cep, après les coupes':config.title;$('mission-summary').textContent=config.final?'Le bilan va reprendre les quatre sarments.':config.text;
    }else{
      const scene=document.querySelector('#scenario-scene');scene.querySelectorAll('.vineyard-panorama,.tank-room,.lab-bench,#pump').forEach(n=>{n.inert=!(activity==='vendanges'?step===0:activity==='chauffe'?step===1:activity==='derive'?step===0:activity==='controle'?step===0:step===2);});
    }
    target=document.querySelector(config.target(s));
    if(target&&!target.closest('[hidden]')&&!target.disabled&&(!config.final||!done))target.classList.add('guide-target');
    $('campaign').dataset.guideActivity=activity;$('campaign').dataset.guideStep=step;
  }
  $('guide-action').addEventListener('click',()=>{
    if(!active)return;const config=configurations[activity][step],done=config.done(snapshot());
    if(!done){focusTarget();return;}
    if(config.final){const button=document.querySelector(config.final);if(button&&!button.disabled)button.click();return;}
    step++;update();$('guide-title').focus({preventScroll:true});$('guide-card').scrollIntoView({block:'start',behavior:'instant'});
  });
  $('guide-back').addEventListener('click',()=>{if(!active||step===0)return;step--;update();$('guide-title').focus({preventScroll:true});});
  for(const type of ['click','input','change'])document.addEventListener(type,e=>{
    if(!active||!e.target.closest('#campaign-content'))return;
    const control=e.target.closest('button,input,select');
    if(control?.id)touched.add(control.id);
    queueMicrotask(update);
  },true);
  document.addEventListener('taille:change',()=>{queueMicrotask(update);});
  window.Guidage={mount(id,state){activity=id;getState=state;step=0;touched=new Set();active=true;$('campaign').classList.add('guided');prepare(id);update();},refresh:update,stop(){active=false;document.querySelectorAll('.guide-target').forEach(n=>n.classList.remove('guide-target'));}};
})();
