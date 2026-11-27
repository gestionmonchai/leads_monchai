'use strict';
(() => {
  const $=id=>document.getElementById(id),T=window.Taille,scene=window.TailleScene;
  let current=null,index=0,selection=null,history=[],reviews=[],started=false,paused=false,inReview=false;
  let remaining=180000,deadline=0,timer=null,dialogOrigin=null;
  function show(name){
    for(const id of ['registration','ready','game','result'])$(id).hidden=id!==name;
    document.body.classList.toggle('playing',name==='game');
    document.querySelectorAll('.steps li').forEach((li,i)=>{li.removeAttribute('aria-current');if(i===(name==='registration'?0:name==='result'?2:1))li.setAttribute('aria-current','step');});
    const focus=name==='registration'?$('firstname'):$(name+'-title');focus.focus({preventScroll:true});
    if(name!=='registration')$(name).scrollIntoView({block:'start',behavior:'instant'});
  }
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
    deadline=performance.now()+remaining;
  }
  function tick(){
    if(!started||paused||inReview)return;
    if(!$('timed').checked){$('time').textContent='À votre rythme';return;}
    remaining=Math.max(0,deadline-performance.now());const seconds=Math.ceil(remaining/1000);$('time').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
    $('time').classList.toggle('urgent',seconds<=30);
    if(!remaining)finish(true);
  }
  function start(){
    clearInterval(timer);index=0;reviews=[];remaining=180000;started=true;paused=false;$('time').classList.remove('urgent');loadVine();show('game');tick();timer=setInterval(tick,100);
  }
  function cut(){
    tick();if(!started||paused||inReview||!selection)return;
    const b=branch(selection.id),old=b.cut;b.cut=selection.mm;history.push({id:b.id,cut:old});
    const a=T.assess(b);clearSelection();missions();scene.refresh();message(`${b.id} : coupe à ${Math.round(b.cut)} mm. ${a.reason}`);
    document.querySelector('.scene-caption p').textContent=`${b.id} : ${a.reason}`;
    $('branch-buttons').querySelector(`[data-branch="${b.id}"]`).focus({preventScroll:true});
    if(matchMedia('(max-width:700px)').matches)$('vine-scene').scrollIntoView({block:'start',behavior:'instant'});
  }
  function undo(){
    if(!started||paused||inReview||!history.length)return;const prev=history.pop();branch(prev.id).cut=prev.cut;clearSelection();missions();scene.refresh();message(`Dernière coupe sur ${prev.id} annulée. Le sarment est restauré.`);
  }
  function record(){return {name:current.name,index,lines:current.branches.map(T.assess)};}
  function validate(){
    tick();if(!started||paused||inReview)return;
    inReview=true;reviews[index]=record();const r=reviews[index],score=r.lines.reduce((sum,a)=>sum+a.score,0);
    $('workspace').hidden=true;$('vine-review').hidden=false;$('pause').hidden=true;
    $('review-title').textContent=`${score} / 100 · ${score===100?'Le geste juste.':'Votre cep, coupe par coupe.'}`;
    $('review-lines').replaceChildren();
    for(const a of r.lines){const line=document.createElement('p');const title=document.createElement('strong');title.textContent=`${a.id} · ${a.name} : ${a.score} / 25`;const text=document.createElement('span');text.textContent=a.reason;line.append(title,text);$('review-lines').append(line);}
    $('next-vine').textContent=index===2?'Voir mon résultat':'Passer au cep suivant';$('review-title').focus();
  }
  function next(){if(index===2){finish();return;}index++;loadVine();$('game-title').focus();}
  function pause(){
    if(!started||paused||inReview)return;tick();if(!started)return;paused=true;$('workspace').hidden=true;$('pause-panel').hidden=false;$('pause').hidden=true;
  }
  function resume(){if(!started||!paused)return;paused=false;deadline=performance.now()+remaining;$('workspace').hidden=false;$('pause-panel').hidden=true;$('pause').hidden=false;$('game-title').focus();}
  function finish(expired=false){
    if(!started)return;if(!inReview)reviews[index]=record();started=false;paused=false;clearInterval(timer);
    const score=reviews.reduce((sum,r)=>sum+r.lines.reduce((n,a)=>n+a.score,0),0);
    $('result-score').textContent=`${score} / 300`;$('result-title').textContent=score>=270?'Vous avez le geste juste.':score>=180?'Un beau coup de sécateur.':'Le vignoble vous attend encore.';
    $('result-summary').textContent=(expired?'Le temps est écoulé. ':'')+`${reviews.length} cep${reviews.length>1?'s':''} travaillé${reviews.length>1?'s':''}. Le score récompense les yeux conservés et les marges de coupe de l’exercice.`;
    $('final-breakdown').replaceChildren();
    for(let i=0;i<3;i++){const p=document.createElement('p');p.textContent=reviews[i]?`Cep ${i+1} · ${reviews[i].name} : ${reviews[i].lines.reduce((n,a)=>n+a.score,0)} / 100`:`Cep ${i+1} · Non travaillé : 0 / 100`;$('final-breakdown').append(p);}
    $('surprise-closed').hidden=false;$('surprise-open').hidden=true;show('result');
  }
  function back(){started=false;paused=false;clearInterval(timer);show('registration');}
  scene.init($('vine-svg'),select);
  $('form-fields').disabled=false;
  $('sample-profile').addEventListener('click',()=>{for(const [id,value]of Object.entries({firstname:'Camille',lastname:'Martin',email:'camille@example.org',estate:'Domaine de démonstration'}))$(id).value=value;$('demo-consent').checked=true;$('news').checked=false;$('concours-form').querySelector('[type=submit]').focus();});
  $('concours-form').addEventListener('submit',e=>{e.preventDefault();for(const id of ['firstname','lastname']){$(id).value=$(id).value.trim();if(!$(id).value){$(id).reportValidity();return;}}if(!$('concours-form').reportValidity())return;$('player-name').textContent=$('firstname').value;show('ready');});
  $('start').addEventListener('click',start);$('confirm-cut').addEventListener('click',cut);$('undo').addEventListener('click',undo);
  $('cut-position').addEventListener('input',()=>{if(selection)select(selection.id,Number($('cut-position').value));});
  $('cut-less').addEventListener('click',()=>{if(selection)select(selection.id,selection.mm-1);});$('cut-more').addEventListener('click',()=>{if(selection)select(selection.id,selection.mm+1);});
  $('validate-vine').addEventListener('click',validate);$('next-vine').addEventListener('click',next);
  $('zoom-in').addEventListener('click',()=>scene.zoom(.25));$('zoom-out').addEventListener('click',()=>scene.zoom(-.25));$('reset-view').addEventListener('click',()=>scene.reset());
  $('show-labels').addEventListener('change',()=>scene.labels($('show-labels').checked));
  $('pause').addEventListener('click',()=>{pause();if(paused)$('resume').focus();});$('resume').addEventListener('click',resume);
  $('leave-game').addEventListener('click',()=>{pause();$('exit-dialog').showModal();});
  $('exit-confirm').addEventListener('click',()=>{$('exit-dialog').close();back();});$('exit-cancel').addEventListener('click',()=>{$('exit-dialog').close();if(paused)$('resume').focus();});
  $('replay').addEventListener('click',()=>show('ready'));$('restart').addEventListener('click',back);document.querySelector('.back-registration').addEventListener('click',back);
  $('reveal').addEventListener('click',()=>{$('surprise-closed').hidden=true;$('surprise-open').hidden=false;$('surprise-open').tabIndex=-1;$('surprise-open').focus();});
  document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>{dialogOrigin=b;pause();$(b.dataset.dialog).showModal();}));
  document.querySelectorAll('dialog').forEach(d=>{d.querySelectorAll('.close,.close-dialog').forEach(b=>b.addEventListener('click',()=>d.close()));d.addEventListener('close',()=>{if(paused)$('resume').focus();else dialogOrigin?.focus();});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
})();
