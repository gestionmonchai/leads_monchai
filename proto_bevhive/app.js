import {ParticleBottle,POINT_COUNT} from './particles.js';
import {sampleReference} from './vine.js';
import {STAGES} from './journey.js';
import {ServiceReveal,SERVICES} from './services.js';
import {ContextContact} from './contact.js';
import {bindDialog} from './dialogs.js';
import {setHeroTitle} from './title.js';
import {apiUrl} from './api.js';

const $=selector=>document.querySelector(selector);
const canvas=$('#bottle-canvas'),status=$('#render-status');
const bottle=new ParticleBottle(canvas,message=>{status.textContent=message;});
const slider=$('#dispersion'),scatter=$('#scatter'),pause=$('#pause');
const origin=$('#origin-trigger'),back=$('#back-to-bottle'),rail=$('#stage-list');
const feedback=$('#reference-feedback'),retry=$('#retry-figure');
const cache=new Map(),names={champagne:'Champagne',jade:'Jade',cobalt:'Cobalt'};
let current=-1,requested=-1,revision=0,loading=false;
const number=index=>String(index+1).padStart(2,'0');
const serviceReveal=new ServiceReveal($('#service-reveal'));
const contact=new ContextContact($('#partner-form'),{onStageChange:index=>selectStage(index)});
serviceReveal.setPaused(bottle.paused);
const conceptDialog=$('#concept-dialog');bindDialog(conceptDialog,document.querySelectorAll('a[href="#concept"]'));
conceptDialog.querySelector('a[href="#experience"]').addEventListener('click',event=>{event.preventDefault();conceptDialog.close();});
bindDialog($('#service-details-dialog'),[$('#open-service-details')]);

for(const [index,stage] of STAGES.entries()){
  const button=document.createElement('button');button.type='button';button.className='stage-button';button.dataset.stage=stage.id;
  button.setAttribute('aria-pressed','false');button.setAttribute('aria-controls','hero-description bottle-canvas');
  const count=document.createElement('span');count.textContent=number(index);button.append(count,document.createTextNode(stage.label));
  button.addEventListener('click',()=>selectStage(index));rail.append(button);
}
const stageButtons=[...rail.querySelectorAll('button')];
rail.addEventListener('keydown',event=>{
  const index=stageButtons.indexOf(document.activeElement);if(index<0)return;
  let next=index;if(event.key==='ArrowRight')next=Math.min(index+1,STAGES.length-1);else if(event.key==='ArrowLeft')next=Math.max(index-1,0);else if(event.key==='Home')next=0;else if(event.key==='End')next=STAGES.length-1;else return;
  event.preventDefault();stageButtons[next].focus();
});

function loadFigure(index,force=false){
  const stage=STAGES[index];if(!stage.asset)return Promise.resolve(null);
  if(force)cache.delete(stage.id);
  if(!cache.has(stage.id)){
    const image=new Image();image.src=new URL(`./assets/${stage.asset}${force?`?retry=${Date.now()}`:''}`,import.meta.url).href;
    const promise=sampleReference(image,POINT_COUNT,{organic:stage.id==='pepiniere',maxHeight:stage.id==='pepiniere'?3.3:3.05,maxWidth:2.0}).catch(error=>{cache.delete(stage.id);throw error;});
    cache.set(stage.id,promise);
  }
  return cache.get(stage.id);
}

function updateNavigation(){
  for(const [i,button] of stageButtons.entries()){
    const active=i===current;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
    const pending=loading&&i===requested;button.classList.toggle('loading',pending);if(pending)button.setAttribute('aria-busy','true');else button.removeAttribute('aria-busy');
  }
  $('#journey-current').textContent=loading?`Chargement : ${STAGES[requested].label}`:current<0?'Du cep à la rencontre':`${number(current)} / ${STAGES.length} · ${STAGES[current].label}`;
  $('#stage-prev').disabled=current<0;
  $('#stage-next').disabled=current===STAGES.length-1;
  origin.disabled=loading;
  contact.setLoading(loading);
  if(loading)origin.setAttribute('aria-busy','true');else origin.removeAttribute('aria-busy');
  const next=current+1;origin.querySelector('span:first-child').innerHTML=next<STAGES.length?STAGES[next].trigger:'Toutes ces expertises.<br>Un même collectif.';
  origin.setAttribute('aria-label',next<STAGES.length?STAGES[next].trigger.replace(/<br>/g,' '):'Revenir à la bouteille');
  $('#figure-number').textContent=current<0?'00':number(current);
  $('#figure-total').textContent=String(STAGES.length);
}

async function selectStage(index,force=false){
  if(index<0){showBottle();return;}if(index>=STAGES.length)return;
  if(index===current&&!force&&!loading)return;
  const ticket=++revision;requested=index;loading=true;feedback.hidden=true;retry.hidden=true;updateNavigation();
  status.textContent=`Chargement de la silhouette : ${STAGES[index].label}.`;
  try{
    const reference=await loadFigure(index,force);if(ticket!==revision)return;
    current=index;const stage=STAGES[index];
    setDispersion(0);bottle.setFigure(stage.id,reference);showContent(stage,index);
    status.textContent=`${number(index)} sur ${STAGES.length} : ${stage.label}. ${stage.subject}, en 18 000 points lumineux. Le texte de gauche présente les partenaires recherchés.`;
    const selected=stageButtons[index];const x=selected.offsetLeft-rail.offsetLeft-(rail.clientWidth-selected.clientWidth)/2;rail.scrollTo({left:x,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    if(document.activeElement===retry)selected.focus({preventScroll:true});
  }catch{
    if(ticket!==revision)return;
    feedback.querySelector('span').textContent=`La silhouette « ${STAGES[index].label} » n’a pas pu être chargée. La scène précédente reste disponible.`;feedback.hidden=false;retry.hidden=false;
    status.textContent='Le chargement a échoué. Utilisez Réessayer pour reprendre.';
    contact.select.value=current<0?'':STAGES[current].id;
  }finally{if(ticket===revision){loading=false;updateNavigation();}}
}

function showContent(stage,index){
  $('.hero-copy').classList.add('is-vine');$('.visual').classList.add('is-vine');
  setHeroTitle(stage.title);$('#hero-eyebrow').innerHTML=`<span class="small-line"></span> ${number(index)} / ${stage.label.toUpperCase()}`;
  $('#hero-description').replaceChildren(document.createTextNode(stage.pitch));
  contact.setContext(stage);serviceReveal.setStage(stage);
  $('#service-details-title').textContent=stage.label;$('#service-details-list').replaceChildren();for(const service of SERVICES[stage.id]){const item=document.createElement('li'),title=document.createElement('h3'),detail=document.createElement('p');title.textContent=service.label;detail.textContent=service.detail;item.append(title,detail);$('#service-details-list').append(item);}
  const tags=$('#partner-tags');tags.replaceChildren();tags.hidden=false;
  for(const tag of stage.tags){const span=document.createElement('span');span.textContent=tag;tags.append(span);}
  $('#connection-copy').textContent=stage.connection;$('#connection').hidden=false;
  $('#hero-link-label').textContent='L’esprit du projet collaboratif';
  $('#edition-label').replaceChildren(document.createTextNode(stage.label.toUpperCase()));const small=document.createElement('span');small.textContent='Une expertise à relier.';$('#edition-label').append(small);
  $('.visual-coordinate').textContent=`FIG. ${number(index)} / ${stage.label.toUpperCase()}`;$('#shape-note').textContent=stage.caption;
  $('#drag-label').textContent=stage.asset?'Faites glisser pour changer de perspective':'Faites glisser pour explorer';
  canvas.setAttribute('aria-label',`${stage.subject}, dessiné uniquement en 18 000 points lumineux. Faites glisser ou utilisez les flèches du clavier pour changer de perspective.`);
  back.hidden=false;
}

function showBottle(){
  revision++;current=-1;requested=-1;loading=false;feedback.hidden=true;retry.hidden=true;
  bottle.setFigure('bottle');setDispersion(0);$('.hero-copy').classList.remove('is-vine');$('.visual').classList.remove('is-vine');
  contact.setContext(null);serviceReveal.setStage(null);
  setHeroTitle('L’esprit<br>prend <em>forme.</em>');$('#hero-eyebrow').innerHTML='<span class="small-line"></span> DES EXPERTISES. UN COLLECTIF.';
  $('#hero-description').innerHTML='Des métiers complémentaires.<br>Un service unifié pour les vignerons.<br>Et si nous le construisions ensemble ?';
  $('#partner-tags').hidden=true;$('#connection').hidden=true;$('#hero-link-label').textContent='Découvrir le projet Passerelle';
  $('#edition-label').innerHTML='PROJET PASSERELLE<span>Relier les savoir-faire.</span>';
  $('.visual-coordinate').textContent='FIG. 000 / MATIÈRE VIVANTE';$('#shape-note').textContent='18 000 points de vue.';$('#drag-label').textContent='Faites glisser pour explorer';
  canvas.setAttribute('aria-label','Bouteille en 3D composée de 18 000 particules. Faites glisser pour tourner, ou utilisez les flèches du clavier.');back.hidden=true;updateNavigation();status.textContent='Les points reprennent la forme de la bouteille.';
}

origin.addEventListener('click',()=>current+1<STAGES.length?selectStage(current+1):showBottle());
back.addEventListener('click',()=>{showBottle();origin.focus({preventScroll:true});});
$('#stage-prev').addEventListener('click',()=>selectStage(current-1));$('#stage-next').addEventListener('click',()=>selectStage(current+1));
retry.addEventListener('click',()=>selectStage(requested,true));

function setDispersion(value){
  slider.value=value;slider.style.setProperty('--value',`${value}%`);$('#dispersion-value').value=`${value} %`;
  slider.setAttribute('aria-valuetext',`${value} %${value===0?', silhouette formée':''}`);
  scatter.setAttribute('aria-pressed',String(value>0));$('#scatter-label').textContent=value>0?'Reformer la silhouette':'Libérer les particules';bottle.setSpread(value/100);
}
slider.addEventListener('input',()=>setDispersion(Number(slider.value)));
scatter.addEventListener('click',()=>{const value=Number(slider.value)>0?0:100;setDispersion(value);status.textContent=value?'Les particules sont libérées. Utilisez Reformer la silhouette pour les rassembler.':'Les points reprennent la forme de la silhouette.';});
document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-theme]').forEach(item=>{const active=item===button;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',String(active));});
  $('#theme-label').textContent=names[button.dataset.theme];bottle.setTheme(button.dataset.theme);
}));
function updatePause(){pause.setAttribute('aria-pressed',String(bottle.paused));pause.setAttribute('aria-label',bottle.paused?'Reprendre l’animation':'Mettre l’animation en pause');pause.innerHTML=bottle.paused?'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg>';}
pause.addEventListener('click',()=>{bottle.setPaused(!bottle.paused);serviceReveal.setPaused(bottle.paused);updatePause();});updatePause();
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{bottle.setPaused(event.matches);serviceReveal.setPaused(bottle.paused);updatePause();});
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)document.querySelectorAll('.nav-link').forEach(link=>{const active=link.hash===`#${entry.target.id}`;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});},{rootMargin:'-15% 0px -45% 0px'});
['experience','concept'].forEach(id=>observer.observe(document.getElementById(id)));
updateNavigation();loadFigure(0).catch(()=>{});
if(new URL(apiUrl('/api/contact')).origin===location.origin)fetch(apiUrl('/api/contact/admin-status')).then(response=>response.ok?response.json():null).then(result=>{if(result?.canReview){$('#admin-link').hidden=false;$('#admin-link-footer').hidden=false;}}).catch(()=>{});
