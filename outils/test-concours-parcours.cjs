const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../concours/parcours-moteur.js');
const ideal={taille:{score:100,lines:[]},vendanges:{samples:[1,3,4,5,7],read:true,day:0},chauffe:{temp:26,cooling:true,follow:true,read:true},derive:{sample:true,read:true,plan:['isoler','diagnostic','protocole']},controle:{compared:true,enzymatic:true,stabilize:true},ouillage:{clean:true,reserve:'F18',volume:6,closed:true}};
test('six ateliers complets donnent 600 points et un portrait équilibré',()=>{
  const records=P.steps.map(s=>P.evaluate(s.id,ideal[s.id]));assert.equal(records.length,6);records.forEach(r=>assert.equal(r.score,100));const p=P.profile(records);assert.equal(p.total,600);assert.deepEqual(p.axes,[100,100,100,100]);assert.equal(p.title,'L’esprit du millésime');
});
test('un prélèvement en bordure et une récolte tardive sont distingués du prélèvement représentatif',()=>{
  const good=P.evaluate('vendanges',ideal.vendanges),bad=P.evaluate('vendanges',{samples:[0,2,6,8,1],read:true,day:2});assert.ok(bad.score<good.score);assert.match(bad.observed,/1 zones intérieures/);
});
test('un réglage correct ne remplace ni le circuit actif ni la mesure de suivi',()=>{
  const noValve=P.evaluate('chauffe',{...ideal.chauffe,cooling:false});assert.equal(noValve.score,65);
  const noFollow=P.evaluate('chauffe',{...ideal.chauffe,follow:false});assert.equal(noFollow.score,80);
});
test('la dérive sur sucres ne récompense pas le lancement de malo ou l’assemblage',()=>{
  const good=P.evaluate('derive',ideal.derive),bad=P.evaluate('derive',{sample:true,read:true,plan:['lancer','assembler','attendre']});assert.equal(bad.score,25);assert.ok(bad.score<good.score);assert.match(bad.explain,/ne suffit pas/);
});
test('le papier seul ne vaut pas confirmation enzymatique',()=>{
  const paper=P.evaluate('controle',{compared:true,enzymatic:false,stabilize:true});assert.equal(paper.score,50);assert.ok(paper.score<P.evaluate('controle',ideal.controle).score);
});
test('ouillage : volume, réserve, matériel et fermeture comptent séparément',()=>{
  assert.equal(P.evaluate('ouillage',{...ideal.ouillage,volume:10}).score,60);assert.equal(P.evaluate('ouillage',{...ideal.ouillage,reserve:'inconnu'}).score,75);assert.equal(P.evaluate('ouillage',{...ideal.ouillage,clean:false,closed:false}).score,65);
});
test('portrait fondé sur les premiers scores, borné et indépendant des coordonnées',()=>{
  assert.equal(P.profile([]).title,'L’explorateur du millésime');const p=P.profile([{id:'taille',score:100},{id:'taille',score:0},{id:'vendanges',score:60},{id:'chauffe',score:60}]);assert.equal(p.total,220);assert.equal(p.title,'L’artisan du geste');assert.ok(p.axes.every(n=>n>=0&&n<=100));
});
