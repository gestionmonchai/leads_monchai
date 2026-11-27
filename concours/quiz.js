'use strict';
(() => {
  const $=id=>document.getElementById(id),Q=window.QuizMonChai;
  let game=null,origin=null;
  function show(id){
    for(const section of ['registration','ready','quiz','result'])$(section).hidden=section!==id;
    document.body.classList.toggle('in-game',id!=='registration');
    const focus=id==='registration'?$('firstname'):id==='quiz'?$('question-title'):$(id+'-title');focus.focus({preventScroll:true});
    if(id!=='registration')document.querySelector('main').scrollIntoView({block:'start',behavior:'instant'});
  }
  function render(){
    const question=Q.questions[game.current];
    $('question-number').textContent=`Question ${game.current+1} sur ${Q.questions.length}`;$('question-title').textContent=question.title;
    $('answer-options').replaceChildren();$('answer-feedback').hidden=true;$('next-question').hidden=true;
    question.options.forEach((text,i)=>{const b=document.createElement('button');b.type='button';b.className='answer';b.dataset.answer=i;b.textContent=text;b.addEventListener('click',()=>choose(i));$('answer-options').append(b);});
    updateScore();show('quiz');
  }
  function updateScore(){const s=Q.summary(game);$('personal-score').textContent=`${s.score} point${s.score>1?'s':''}`;$('quiz-progress').value=s.answered;}
  function choose(choice){
    if(game.answers[game.current]!==null)return;
    game=Q.answer(game,choice);const q=Q.questions[game.current],correct=choice===q.correct;
    for(const b of $('answer-options').children){b.disabled=true;const i=Number(b.dataset.answer);if(i===choice)b.classList.add('selected');if(i===q.correct){b.classList.add('correct');b.textContent=`✓ ${q.options[i]}`;}if(i===choice&&!correct){b.classList.add('incorrect');b.textContent=`Votre réponse : ${q.options[i]}`;}}
    $('answer-verdict').textContent=correct?'Bonne réponse !':`La réponse était : ${q.options[q.correct]}.`;$('answer-explanation').textContent=q.explanation;$('answer-feedback').hidden=false;
    $('next-question').textContent=game.current===Q.questions.length-1?'Voir mon résultat':'Question suivante';$('next-question').hidden=false;updateScore();$('next-question').focus({preventScroll:true});
  }
  function finish(){
    const s=Q.summary(game);$('score-box').hidden=s.answered===0;
    $('result-title').textContent=s.answered?'Merci d’avoir joué !':'Merci pour cet essai !';
    $('result-message').textContent=s.answered?'Une petite pause dans le salon, et peut-être une découverte.':'Vous avez choisi de passer le quiz. Le principe de participation reste identique.';
    $('final-score').textContent=`${s.score} / ${s.total}`;$('answered-count').textContent=`${s.answered} question${s.answered>1?'s':''} répondue${s.answered>1?'s':''} sur ${s.total}`;
    $('entry-count').textContent=`${s.participations} participation simulée`;
    show('result');
  }
  $('form-fields').disabled=false;
  $('sample-profile').addEventListener('click',()=>{for(const [id,v]of Object.entries({firstname:'Camille',lastname:'Martin',email:'camille@example.org'}))$(id).value=v;$('demo-consent').checked=true;$('concours-form').querySelector('[type=submit]').focus();});
  $('concours-form').addEventListener('submit',e=>{e.preventDefault();for(const id of ['firstname','lastname']){$(id).value=$(id).value.trim();if(!$(id).value){$(id).reportValidity();return;}}if(!$('concours-form').reportValidity())return;game=Q.create();show('ready');});
  $('start').addEventListener('click',render);$('skip-quiz').addEventListener('click',finish);$('stop-quiz').addEventListener('click',finish);
  $('next-question').addEventListener('click',()=>{if(game.current===Q.questions.length-1)finish();else{game=Q.next(game);render();}});
  $('replay').addEventListener('click',()=>{game=Q.replay(game);render();});$('restart').addEventListener('click',()=>show('registration'));$('edit-profile').addEventListener('click',()=>show('registration'));
  document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>{origin=b;$(b.dataset.dialog).showModal();}));
  $('rules-dialog').querySelectorAll('.close,.close-dialog').forEach(b=>b.addEventListener('click',()=>$('rules-dialog').close()));$('rules-dialog').addEventListener('close',()=>origin?.focus());
})();
