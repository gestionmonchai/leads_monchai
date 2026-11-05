import {STAGES} from './journey.js';
import {SERVICES} from './services.js';
import {bindDialog} from './dialogs.js';
import {apiUrl} from './api.js';

export class ContextContact{
 constructor(form,{onStageChange,onSelectionChange}={}){
  this.form=form;this.onStageChange=onStageChange;this.onSelectionChange=onSelectionChange;this.drafts=new Map();this.stage=null;this.pending=false;this.loading=false;this.completed=false;this.lastFingerprint='';this.requestId='';
  this.select=form.querySelector('[name=stage]');this.options=form.querySelector('#contact-service-options');this.status=form.querySelector('#contact-status');this.submit=form.querySelector('[type=submit]');
  this.step=0;this.steps=[...form.querySelectorAll('[data-contact-step]')];this.next=form.querySelector('#contact-next');
  this.dialog=bindDialog(form.closest('dialog'),[document.querySelector('#open-contact')],{onOpen:()=>this.showStep(this.step,true)});
  this.next.addEventListener('click',()=>this.nextStep());form.querySelector('#contact-back').addEventListener('click',()=>this.showStep(0,true));
  for(const stage of STAGES){const option=document.createElement('option');option.value=stage.id;option.textContent=stage.label;this.select.append(option);}
  this.select.addEventListener('change',()=>this.onStageChange?.(STAGES.findIndex(stage=>stage.id===this.select.value)));
  form.addEventListener('input',()=>{if(this.completed){this.completed=false;this.status.hidden=true;this.updateButton();}});
  form.addEventListener('submit',event=>{event.preventDefault();this.send();});
 }
 setLoading(loading){this.loading=loading;this.updateButton();}
 updateButton(){this.submit.disabled=this.pending||this.loading||this.completed;this.next.disabled=this.pending||this.loading;this.submit.querySelector('span').textContent=this.pending?'Enregistrement…':this.loading?'Chargement du métier…':this.completed?'Proposition enregistrée':'Envoyer ma proposition';this.form.setAttribute('aria-busy',String(this.pending));}
 showStep(step,focus=false){
  this.step=step;for(const [index,fieldset] of this.steps.entries())fieldset.hidden=index!==step;
  this.form.querySelector('#contact-step-label').textContent=step===0?'01 / VOTRE EXPERTISE':'02 / FAISONS CONNAISSANCE';
  this.form.querySelector('#contact-dialog-title').innerHTML=step===0?'Votre place dans<br>le <em>collectif.</em>':'Faisons<br><em>connaissance.</em>';
  this.form.querySelector('#contact-context-description').textContent=step===0?(this.stage?`Votre expertise en ${this.stage.label.toLowerCase()}. Choisissez vos services.`:'Choisissez votre métier et les services que vous proposez.'):`Votre proposition : ${this.stage?.label||'le projet Passerelle'}. Quelques mots pour commencer l’échange.`;
  if(focus)(step===0?this.select:this.form.querySelector('[name=name]')).focus({preventScroll:true});
 }
 nextStep(){
  if(this.pending||this.loading||!this.select.reportValidity())return;
  if(!this.selected().length){const error=this.form.querySelector('#contact-services-error');error.textContent='Choisissez au moins un service que vous proposez.';error.hidden=false;this.options.querySelector('input')?.focus();return;}
  this.showStep(1,true);
 }
 setContext(stage){
  const changed=this.stage?.id!==stage?.id;this.stage=stage;this.select.value=stage?.id||'';this.options.replaceChildren();this.completed=false;this.updateButton();this.showStep(changed?0:this.step);
  this.form.querySelector('#contact-services-error').hidden=true;
  this.form.querySelector('[name=message]').placeholder=stage?`Présentez votre activité en ${stage.label.toLowerCase()} et la collaboration que vous imaginez avec les vignerons…`:'Votre activité, votre idée de collaboration, les domaines que vous accompagnez…';
  if(!stage){const p=document.createElement('p');p.className='services-placeholder';p.textContent='Choisissez un métier pour préciser vos services.';this.options.append(p);this.onSelectionChange?.([]);return;}
  if(!this.drafts.has(stage.id))this.drafts.set(stage.id,new Set());
  for(const service of SERVICES[stage.id]){
   const label=document.createElement('label');label.className='service-option';const input=document.createElement('input');input.type='checkbox';input.name='services';input.value=service.id;input.checked=this.drafts.get(stage.id).has(service.id);
   const span=document.createElement('span');span.textContent=service.label;label.append(input,span);input.addEventListener('change',()=>{const set=this.drafts.get(stage.id);if(input.checked)set.add(service.id);else set.delete(service.id);this.form.querySelector('#contact-services-error').hidden=true;this.onSelectionChange?.([...set]);});this.options.append(label);
  }
  this.onSelectionChange?.(this.selected());
 }
 selected(){return this.stage?[...(this.drafts.get(this.stage.id)||[])]:[];}
 readPayload(){const data=new FormData(this.form),payload=Object.fromEntries(['stage','name','company','email','website','message','fax'].map(key=>[key,String(data.get(key)||'').trim()]));payload.services=this.selected();payload.consent=data.get('consent')==='on';return payload;}
 toggleService(stageId,id){
  if(this.stage?.id!==stageId)return;const input=[...this.options.querySelectorAll('input')].find(el=>el.value===id);if(!input)return;
  input.checked=!input.checked;input.dispatchEvent(new Event('change'));this.completed=false;this.updateButton();
  this.status.hidden=false;this.status.className='contact-status field-full subtle';this.status.textContent=input.checked?`${input.nextElementSibling.textContent} ajouté à votre proposition.`:`${input.nextElementSibling.textContent} retiré de votre proposition.`;
 }
 async send(){
  if(this.pending||this.loading||this.completed)return;
  if(this.step===0){this.nextStep();return;}
  if(!this.form.reportValidity())return;
  const services=this.selected();if(!services.length){const error=this.form.querySelector('#contact-services-error');error.textContent='Choisissez au moins un service que vous proposez.';error.hidden=false;this.options.querySelector('input')?.focus();return;}
  const payload=this.readPayload();
  const fingerprint=JSON.stringify(payload);if(fingerprint!==this.lastFingerprint){this.lastFingerprint=fingerprint;this.requestId=crypto.randomUUID();}payload.requestId=this.requestId;
  this.pending=true;this.updateButton();this.status.hidden=false;this.status.className='contact-status field-full';this.status.textContent='Votre proposition est en cours d’enregistrement…';
  try{
   const response=await fetch(apiUrl('/api/contact'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(20000)});const result=await response.json();
   if(!response.ok){this.status.className='contact-status field-full error';this.status.textContent=result.message||'L’enregistrement n’a pas abouti. Votre saisie est conservée.';if(result.field){if(['stage','services'].includes(result.field)){this.showStep(0);const error=this.form.querySelector('#contact-services-error');error.textContent=this.status.textContent;error.hidden=false;}const field=this.form.elements.namedItem(result.field);if(typeof field?.focus==='function')field.focus();else if(result.field==='services')this.options.querySelector('input')?.focus();}return;}
   this.completed=JSON.stringify(this.readPayload())===fingerprint;this.status.className='contact-status field-full success';this.status.textContent=`Merci ${payload.name}. Votre proposition « ${STAGES.find(stage=>stage.id===payload.stage).label} » est enregistrée. Référence : ${result.reference}.`;this.status.focus({preventScroll:true});
  }catch{this.status.className='contact-status field-full error';this.status.textContent='La confirmation n’a pas pu être reçue. Votre saisie est conservée ; vous pouvez réessayer.';}
  finally{this.pending=false;this.updateButton();}
 }
}
