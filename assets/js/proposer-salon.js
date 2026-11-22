'use strict';
(() => {
  const form = document.getElementById('proposition-salon');
  if (!form) return;
  const get = id => document.getElementById(id);
  const submit = get('salon-envoyer');
  const feedback = get('salon-retour');
  const success = get('salon-succes');
  const initialLabel = submit.textContent;
  const opened = Date.now();
  const frequencyKey = 'monchai_contact_submissions';
  let sending = false;
  let sent = false;
  const fields = ['nom','organisateur','source','debut','fin','lieu','ville','code-postal','region','public','objectif','description','contact','email'];
  const value = name => get('salon-'+name).value.trim();
  function error(message, field) {
    feedback.textContent = message;
    feedback.hidden = false;
    if (field) {
      field.setAttribute('aria-invalid','true');
      field.focus();
    } else {
      feedback.tabIndex = -1;
      feedback.focus();
    }
  }
  function frequency() {
    try {
      const data = JSON.parse(localStorage.getItem(frequencyKey));
      return {a:Array.isArray(data?.a) ? data.a.filter(t=>Number.isFinite(t) && t<=Date.now() && Date.now()-t<300000) : [], b:Number.isFinite(data?.b) ? data.b : 0};
    } catch (_) { return {a:[],b:0}; }
  }
  function saveFrequency(data) {
    try {localStorage.setItem(frequencyKey,JSON.stringify(data));} catch (_) { /* Envoi possible sans stockage local. */ }
  }
  function busy(on) {
    sending = on;
    form.setAttribute('aria-busy',String(on));
    submit.disabled = on;
    submit.textContent = on ? 'Envoi en cours…' : initialLabel;
    form.querySelectorAll('fieldset').forEach(el=>{el.disabled=on;});
    get('salon-consent').disabled=on;
  }
  form.addEventListener('input',event=>{
    event.target.removeAttribute('aria-invalid');
    if (event.target.id==='salon-description') get('compteur-description').textContent = `${event.target.value.length} / 1 800`;
  });
  form.addEventListener('change',event=>event.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if (sending || sent) return;
    feedback.hidden=true;
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    if (get('salon-website').value) return;
    for (const name of fields) {
      const field=get('salon-'+name);
      if (!value(name) || !field.checkValidity() || (field.maxLength>0 && value(name).length>field.maxLength)) {
        const label=form.querySelector(`label[for="${field.id}"]`).textContent.replace(/\s*\*\s*$/,'');
        error(`Vérifiez le champ « ${label} ». Il est obligatoire et doit respecter le format indiqué.`,field);
        return;
      }
    }
    let source;
    try { source=new URL(value('source')); } catch (_) { /* Traité ci-dessous. */ }
    if (!source || !['https:','http:'].includes(source.protocol) || source.username || source.password) {
      error('Indiquez un lien officiel commençant par https:// ou http://, sans identifiants dans l’adresse.',get('salon-source'));
      return;
    }
    if (value('fin')<value('debut')) {
      error('La date de fin doit être le même jour que la date de début, ou après.',get('salon-fin'));
      return;
    }
    if (value('description').length<30) {
      error('Présentez le salon en au moins 30 caractères.',get('salon-description'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) {
      error('Indiquez une adresse e-mail complète et valide.',get('salon-email'));
      return;
    }
    if (!get('salon-consent').checked) {
      error('Confirmez l’autorisation de publication après validation et la lecture de la politique de confidentialité.',get('salon-consent'));
      return;
    }
    if (Date.now()-opened<2000) {error('Merci de relire les informations, puis de réessayer dans quelques secondes.');return;}
    const limits=frequency();
    const last=limits.a.length ? Math.max(...limits.a) : 0;
    const wait=Math.max(limits.b-Date.now(),last+30000-Date.now());
    if (wait>0 || limits.a.length>=5) {
      error('Plusieurs demandes viennent d’être envoyées. Patientez quelques minutes avant de réessayer, ou écrivez à contact@monchai.fr.');
      return;
    }
    const publicInfo=[
      'PROPOSITION DE SALON À EXAMINER AVANT PUBLICATION',
      '',`Nom du salon : ${value('nom')}`,`Organisateur : ${value('organisateur')}`,
      `Source officielle : ${source.href}`,`Début : ${value('debut')}`,`Fin : ${value('fin')}`,
      `Lieu : ${value('lieu')}`,`Commune : ${value('code-postal')} ${value('ville')}`,
      `Région : ${value('region')}`,`Public : ${value('public')}`,`Objectif : ${value('objectif')}`,
      '',`Description :\n${value('description')}`,
      '',`Conditions exposants :\n${value('exposants') || 'Non précisées ; à demander à l’organisateur.'}`,
      '', 'CONTACT PRIVÉ, À NE PAS PUBLIER',`Nom : ${value('contact')}`,`E-mail : ${value('email')}`,
      '', 'Publication autorisée après vérification par Mon Chai. Aucune inscription newsletter.',
      'Moteur : https://monchai.fr/salons-viticoles.html'
    ].join('\n');
    // Paramètres du gabarit de contact existant ; aucun destinataire fourni par le visiteur.
    const params={
      from_email:value('email'),prenom:value('contact'),nom:'',telephone:'',domaine:value('organisateur'),siret:'(sans objet)',
      activite:'Proposition de salon à valider : '+value('nom'),outil:'Annuaire Mon Chai, validation éditoriale requise',priorite:publicInfo,
      objet:'proposition_salon',objet_libelle:'Proposition de salon à valider',message:publicInfo,
      newsletter:'non',consentement:'oui',source:'monchai-salon-proposition-2026',sent_at:new Date().toISOString()
    };
    busy(true);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),25000);
    try {
      const response=await fetch('https://api.emailjs.com/api/v1.0/email/send',{
        method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',referrerPolicy:'strict-origin-when-cross-origin',
        signal:controller.signal,
        body:JSON.stringify({service_id:'service_dmflavl',template_id:'template_yajlaes',user_id:'SW76TlsTwVd5Z8v8y',template_params:params})
      });
      if (!response.ok) {
        if (response.status===429) saveFrequency({a:limits.a,b:Date.now()+60000});
        throw new Error('envoi_non_confirme');
      }
      sent=true;
      const current=frequency();current.a.push(Date.now());saveFrequency(current);
      form.hidden=true;
      get('sp-intro').hidden=true;
      success.hidden=false;
      success.focus();
      success.scrollIntoView({block:'nearest'});
    } catch (_) {
      error('L’envoi n’a pas pu être confirmé. Vos informations sont conservées dans ce formulaire. Réessayez ou écrivez à contact@monchai.fr.');
    } finally {
      clearTimeout(timeout);
      busy(false);
    }
  });
  form.hidden=false;
})();
