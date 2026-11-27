'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const T=require('../concours/millesime/taille-moteur.js');
test('Trois charges distinctes, courson bas à deux yeux et vieux bois hors du modèle de coupe',()=>{
  assert.deepEqual([0,1,2].map(i=>T.scenario(i).baguette),[6,7,5]);
  for(let i=0;i<3;i++){const s=T.scenario(i);assert.equal(s.branches.length,4);assert.equal(s.branches[0].target,2);assert.ok(s.branches[0].points[0][1]>s.branches[1].points[0][1]);}
});
test('Conservation des yeux déterminée par la coupe physique, y compris autour d’un bourgeon',()=>{
  const b=T.scenario(0).branches[0],second=b.buds[1].mm;
  assert.equal(T.metrics(b,second-1).eyes,1);assert.equal(T.metrics(b,second+1).eyes,2);
  assert.equal(T.metrics(b,second+1).nearBud,true);
  b.cut=second+15;assert.equal(T.assess(b).score,25);
  b.cut=second+1;assert.ok(T.assess(b).score<25);
  b.cut=b.buds[2].mm+15;assert.ok(T.assess(b).score<25);
});
test('Échelle en millimètres indépendante du zoom : conversion longueur/paramètre réversible',()=>{
  for(let i=0;i<3;i++)for(const b of T.scenario(i).branches)for(let mm=1;mm<b.length;mm+=17){assert.ok(Math.abs(T.distance(b,T.parameter(b,mm))-mm)<.01);}
});
test('Coupe rase pénalisée, chicot au moins égal au diamètre récompensé',()=>{
  const b=T.scenario(0).branches[2];b.cut=1;assert.ok(T.assess(b).score<25);
  b.cut=16;assert.equal(T.metrics(b).eyes,0);assert.equal(T.assess(b).score,25);
});
test('Un cep non taillé vaut zéro ; un cep conforme vaut 100, trois ceps valent 300',()=>{
  let total=0;for(let i=0;i<3;i++){const s=T.scenario(i);assert.equal(s.branches.reduce((sum,b)=>sum+T.assess(b).score,0),0);
    for(const b of s.branches)b.cut=Math.round(T.ideal(b));const score=s.branches.reduce((sum,b)=>sum+T.assess(b).score,0);assert.equal(score,100);total+=score;}
  assert.equal(total,300);
});
