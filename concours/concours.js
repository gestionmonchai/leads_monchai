'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const sections = ['registration', 'ready', 'game', 'result'];
  const symbols = [{id:'grape',name:'Raisin'},{id:'barrel',name:'Tonneau'},{id:'leaf',name:'Feuille de vigne'},{id:'bottle',name:'Bouteille'}];
  let cards = [], selected = [], pairs = 0, paused = false, busy = false, finished = false;
  let remaining = 30000, deadline = 0, interval = null, mismatch = null, started = false;
  let dialogOrigin = null, pausedByDialog = false;
  const icon = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  function stopTimers() { clearInterval(interval); clearTimeout(mismatch); interval = null; mismatch = null; }
  function show(name) {
    sections.forEach(id => $(id).hidden = id !== name);
    document.querySelectorAll('.steps li').forEach((li,i) => {
      li.removeAttribute('aria-current');
      if (i === (name === 'registration' ? 0 : name === 'result' ? 2 : 1)) li.setAttribute('aria-current','step');
    });
    const focus = name === 'registration' ? $('firstname') : $(name + '-title');
    focus.focus({preventScroll:true});
    if (name !== 'registration') $('main').scrollIntoView({block:'start',behavior:'instant'});
  }
  function shuffle(items) {
    const result = [...items];
    for (let i=result.length-1;i>0;i--) {const a=new Uint32Array(1);crypto.getRandomValues(a);const j=a[0]%(i+1);[result[i],result[j]]=[result[j],result[i]];}
    return result;
  }
  function paintCard(index) {
    const card = cards[index], button = $('board').children[index];
    const visible = card.up || card.matched;
    button.classList.toggle('flipped',visible); button.classList.toggle('matched',card.matched);
    button.disabled = paused || finished || card.matched;
    button.setAttribute('aria-label',`Carte ${index+1} : ${visible ? card.name : 'face cachée'}${card.matched ? ', paire trouvée' : ''}`);
    button.setAttribute('aria-pressed',String(visible));
    button.innerHTML = icon(visible ? card.id : 'spark') + (card.matched ? '<span class="match-tick" aria-hidden="true">✓</span>' : '');
  }
  function paintBoard() {cards.forEach((_,i)=>paintCard(i));}
  function paintTime() {
    $('time').textContent = $('untimed').checked ? '∞' : String(Math.ceil(remaining/1000));
    $('time-unit').textContent = $('untimed').checked ? 'à votre rythme' : 'secondes';
    $('time').parentElement.classList.toggle('urgent',!$('untimed').checked && remaining <= 10000);
  }
  function tick() {
    if (paused || finished || $('untimed').checked) return;
    remaining = Math.max(0,deadline-performance.now());paintTime();
    if (remaining===0) finish();
  }
  function hideMismatch() {
    selected.forEach(i=>cards[i].up=false); selected=[];busy=false;paintBoard();
  }
  function flip(index) {
    tick();
    if (finished || paused || busy || cards[index].up || cards[index].matched) return;
    cards[index].up=true;selected.push(index);paintCard(index);
    if(selected.length===1){$('game-status').textContent=`${cards[index].name}. Choisissez une deuxième carte.`;return;}
    const [a,b]=selected;
    if(cards[a].id===cards[b].id){
      cards[a].matched=cards[b].matched=true;pairs++;selected=[];
      $('pairs').textContent=pairs;$('game-status').textContent=`Bien joué ! ${pairs} paire${pairs>1?'s':''} retrouvée${pairs>1?'s':''}.`;
      paintBoard();
      const next = [...$('board').children].find(b=>!b.disabled);
      if(pairs===4) finish(); else if(next) next.focus({preventScroll:true});
    }else{
      busy=true;$('game-status').textContent=`${cards[a].name} et ${cards[b].name} : essayez une autre paire.`;
      mismatch=setTimeout(hideMismatch,900);
    }
  }
  function start() {
    stopTimers();selected=[];pairs=0;paused=false;busy=false;finished=false;remaining=30000;started=true;
    cards=shuffle([...symbols,...symbols]).map(s=>({...s,up:false,matched:false}));
    $('board').replaceChildren();cards.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.className='memory-card';b.addEventListener('click',()=>flip(i));$('board').append(b);});
    $('pairs').textContent='0';$('pause-panel').hidden=true;$('board').hidden=false;$('pause').hidden=false;
    $('game-status').textContent='Choisissez deux cartes pour commencer.';
    paintBoard();paintTime();show('game');deadline=performance.now()+remaining;interval=setInterval(tick,100);
  }
  function pause() {
    if(paused || finished || !started)return;
    tick();if(finished)return;paused=true;
    clearTimeout(mismatch);if(busy)hideMismatch();
    $('board').hidden=true;$('pause-panel').hidden=false;$('pause').hidden=true;
    $('game-status').textContent='Partie en pause. Le chronomètre est arrêté.';
  }
  function resume() {
    if(!paused || finished)return;
    paused=false;deadline=performance.now()+remaining;$('board').hidden=false;$('pause-panel').hidden=true;$('pause').hidden=false;
    paintBoard();$('game-status').textContent='La partie reprend. Choisissez deux cartes.';
    [...$('board').children].find(b=>!b.disabled)?.focus();
  }
  function finish() {
    if(finished)return;finished=true;started=false;stopTimers();
    $('result-pairs').textContent=`${pairs} / 4`;
    $('result-title').textContent=pairs===4?'Vous avez la mémoire du chai !':'Une jolie pause dans le chai.';
    $('result-summary').textContent=pairs===4?'Les quatre paires sont réunies. Bravo !':'Le temps est écoulé. Merci d’avoir joué, la surprise de démonstration vous attend quand même.';
    $('surprise-closed').hidden=false;$('surprise-open').hidden=true;show('result');
  }
  $('form-fields').disabled=false;
  $('sample-profile').addEventListener('click',()=>{
    $('firstname').value='Camille';$('lastname').value='Martin';$('email').value='camille@example.org';$('estate').value='Domaine de démonstration';$('demo-consent').checked=true;$('news').checked=false;
    $('concours-form').querySelector('[type=submit]').focus();
  });
  $('concours-form').addEventListener('submit',e=>{
    e.preventDefault();
    for(const id of ['firstname','lastname']) {$(id).value=$(id).value.trim();if(!$(id).value){$(id).reportValidity();return;}}
    if(!$('concours-form').reportValidity())return;
    $('player-name').textContent=$('firstname').value;show('ready');
  });
  $('start').addEventListener('click',start);
  $('pause').addEventListener('click',()=>{pause();if(paused)$('resume').focus();});
  $('resume').addEventListener('click',resume);
  $('replay').addEventListener('click',()=>show('ready'));
  function back() {stopTimers();started=false;show('registration');}
  $('restart').addEventListener('click',back);
  document.querySelectorAll('.back-registration').forEach(b=>b.addEventListener('click',back));
  $('reveal').addEventListener('click',()=>{
    $('surprise-closed').hidden=true;$('surprise-open').hidden=false;$('surprise-open').setAttribute('tabindex','-1');$('surprise-open').focus();
  });
  document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>{
    dialogOrigin=b;pausedByDialog=started&&!paused;if(pausedByDialog)pause();$(b.dataset.dialog).showModal();
  }));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelectorAll('.close,.close-dialog').forEach(b=>b.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('close',()=>{dialogOrigin?.focus();if(pausedByDialog){pausedByDialog=false;$('resume').focus();}});
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
})();
