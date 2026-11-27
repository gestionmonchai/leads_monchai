const {test}=require('node:test');
const assert=require('node:assert/strict');
const Q=require('../concours/quiz-moteur.js');
function play(correct){let s=Q.create();for(let i=0;i<Q.questions.length;i++){s=Q.answer(s,correct?Q.questions[i].correct:(Q.questions[i].correct+1)%3);s=Q.next(s);}return s;}
test('cinq questions courtes, trois choix et une seule bonne réponse',()=>{assert.equal(Q.questions.length,5);for(const q of Q.questions){assert.equal(q.options.length,3);assert.ok(q.options[q.correct]);assert.ok(q.explanation);}});
test('le score ne modifie jamais le nombre de participations : 0/5, 5/5 ou quiz passé',()=>{const skipped=Q.summary(Q.create()),wrong=Q.summary(play(false)),right=Q.summary(play(true));assert.deepEqual([skipped.participations,wrong.participations,right.participations],[1,1,1]);assert.deepEqual([skipped.score,wrong.score,right.score],[0,0,5]);assert.equal(skipped.answered,0);});
test('une question ne peut créditer plusieurs réponses, même par double clic',()=>{const s=Q.answer(Q.create(),Q.questions[0].correct);const again=Q.answer(s,1);assert.equal(again,s);assert.equal(Q.summary(again).score,1);});
test('un choix invalide et un passage anticipé ne modifient pas l’état',()=>{const s=Q.create();for(const v of [-1,3,NaN,1.5,'0'])assert.equal(Q.answer(s,v),s);assert.equal(Q.next(s),s);});
test('rejouer remet le score à zéro sans ajouter de participation',()=>{let s=play(true);for(let i=0;i<20;i++){s=Q.replay(s);assert.equal(Q.summary(s).participations,1);assert.equal(Q.summary(s).score,0);assert.equal(s.current,0);assert.equal(Q.summary(s).answered,0);}});
test('arrêter après une question laisse le même accès au tirage proposé',()=>{const s=Q.answer(Q.create(),1),r=Q.summary(s);assert.equal(r.answered,1);assert.equal(r.participations,1);});
