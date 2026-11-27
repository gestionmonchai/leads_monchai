'use strict';
(() => {
  const $=id=>document.getElementById(id),T=window.Taille,scene=window.TailleScene;
  let current=null,index=0,selection=null,history=[],started=false,paused=false,inReview=false;
  let onFinish=null;
  function branch(id){return current.branches.find(b=>b.id===id);}
  function message(text){$('game-status').textContent=text;}
  function select(id,mm){
    if(!started||paused||inReview)return;
    if(!id){message('Visez un sarment d’un an. Le bois permanent est protégé dans cet exercice.');return;}
    const b=branch(id);selection={id,mm:Math.round(T.clamp(mm,1,Math.floor(b.cut)-1))};
    const m=T.metrics(b,selection.mm),assessment=T.assess({...b,cut:selection.mm});
    $('cut-empty').hidden=true;$('cut-details').hidden=false;
    $('selected-label').textContent=`${b.id} · ${b.name}`;$('cut-length').textContent=`Ø ${b.diameter} mm`;
    $('eyes-left').textContent=m.eyes;$('bud-margin').textContent=`${Math.round(m.margin)} mm`;
    $('margin-label').textContent=m.eyes?'au-dessus du dernier œil':'depuis l’insertion';
    $('cut-position').max=Math.floor(b.cut)-1;$('cut-position').value=selection.mm;
    $('cut-position-value').textContent=`${selection.mm} mm`;
    $('cut-advice').textContent=assessment.perfect?'Placement conforme à l’objectif de ce sarment.':assessment.reason;
    $('cut-advice').classList.toggle('good',assessment.perfect);
    $('confirm-cut').disabled=b.cut<=2;
    for(const button of $('branch-buttons').children)button.setAttribute('aria-pressed',String(button.dataset.branch===id));
    scene.select(id,selection.mm);
  }
  function clearSelection(){selection=null;$('cut-empty').hidden=false;$('cut-details').hidden=true;for(const button of $('branch-buttons').children)button.setAttribute('aria-pressed','false');scene.clear();}
  function missions(){
    $('mission-list').replaceChildren();
    for(const b of current.branches){const a=T.assess(b),line=document.createElement('div');line.className='mission-line';const marker=document.createElement('span');marker.className='branch-marker';marker.textContent=b.id;
      const text=document.createElement('span');text.textContent=b.kind==='remove'?'Retirer, sans coupe rase':`${b.name} : ${b.target} yeux`;
      const state=document.createElement('span');state.className='mission-state';state.textContent=b.cut>=b.length-1?'À tailler':a.perfect?'✓':'À revoir';line.append(marker,text,state);$('mission-list').append(line);
    }
    $('undo').disabled=history.length===0;
  }
  function loadVine(){
    current=T.scenario(index);history=[];selection=null;inReview=false;
    $('vine-number').textContent=`CEP ${index+1} / 3`;$('mission-title').textContent=current.name;
    $('mission-summary').textContent=`Conservez ${current.baguette} yeux sur la baguette et 2 sur le courson. Les deux autres sarments sont à retirer.`;
    $('workspace').hidden=false;$('vine-review').hidden=true;$('pause-panel').hidden=true;$('pause').hidden=false;
    $('cut-empty').hidden=false;$('cut-details').hidden=true;
    $('branch-buttons').replaceChildren();
    document.querySelector('.scene-caption p').textContent='Touchez un sarment, puis affinez le point de coupe.';
    for(const b of current.branches){const button=document.createElement('button');button.className='branch-button';button.dataset.branch=b.id;button.setAttribute('aria-pressed','false');button.textContent=`${b.id} · ${b.kind==='remove'?'Superflu':b.kind==='spur'?'Courson':'Baguette'}`;button.addEventListener('click',()=>select(b.id,b.cut*.48));$('branch-buttons').append(button);}
    scene.load(current);scene.labels($('show-labels').checked);missions();message('Observez les yeux et sélectionnez votre premier point de coupe.');

  }
  function start(callback){onFinish=callback;index=0;started=true;paused=false;loadVine();}
  function cut(){
    if(!started||paused||inReview||!selection)return;
    const b=branch(selection.id),old=b.cut;b.cut=selection.mm;history.push({id:b.id,cut:old});
    const a=T.assess(b);clearSelection();missions();scene.refresh();message(`${b.id} : coupe à ${Math.round(b.cut)} mm. ${a.reason}`);
    document.querySelector('.scene-caption p').textContent=`${b.id} : ${a.reason}`;
    $('branch-buttons').querySelector(`[data-branch="${b.id}"]`).focus({preventScroll:true});
    if(matchMedia('(max-width:700px)').matches)$('vine-scene').scrollIntoView({block:'start',behavior:'instant'});
  }
  function undo(){
    if(!started||paused||inReview||!history.length)return;const prev=history.pop();branch(prev.id).cut=prev.cut;clearSelection();missions();scene.refresh();message(`Dernière coupe sur ${prev.id} annulée. Le sarment est restauré.`);
  }
  function validate(){if(!started||paused)return;started=false;const lines=current.branches.map(T.assess);onFinish({score:lines.reduce((n,a)=>n+a.score,0),lines});}
  function pause(){paused=true;}
  function resume(){paused=false;}
  scene.init($('vine-svg'),select);
  $('confirm-cut').addEventListener('click',cut);$('undo').addEventListener('click',undo);
  $('cut-position').addEventListener('input',()=>{if(selection)select(selection.id,Number($('cut-position').value));});
  $('cut-less').addEventListener('click',()=>{if(selection)select(selection.id,selection.mm-1);});$('cut-more').addEventListener('click',()=>{if(selection)select(selection.id,selection.mm+1);});
  $('validate-vine').addEventListener('click',validate);
  $('zoom-in').addEventListener('click',()=>scene.zoom(.25));$('zoom-out').addEventListener('click',()=>scene.zoom(-.25));$('reset-view').addEventListener('click',()=>scene.reset());
  $('show-labels').addEventListener('change',()=>scene.labels($('show-labels').checked));
  window.AtelierTaille={start,pause,resume,stop(){started=false;paused=false;}};
})();
