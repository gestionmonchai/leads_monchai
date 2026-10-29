'use strict';
// Contrat propre à la 2.1 ; les vérifications de la V1 restent inchangées.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(process.argv[2]||'.');
const dir=path.join(root,'demonstration-2-1');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const sandbox={};
for(const name of ['saisons.js','fonctions.js','guide.js']){
  const source=fs.readFileSync(path.join(dir,name),'utf8');
  assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|WebSocket)\b/);
  vm.runInNewContext(source,sandbox,{timeout:1000});
}
assert.equal(sandbox.MonChaiSaisons.length,4);
assert.deepEqual(Array.from(sandbox.MonChaiGuide.order),['vignes','terrain','jardin','chai','bureau','caveau']);
assert.equal(Object.keys(sandbox.MonChaiFonctions.places).length,9);
const features=sandbox.MonChaiFonctions.features;
const used=Object.values(sandbox.MonChaiFonctions.places).flatMap(p=>Array.from(p.slides));
assert.equal(new Set(used).size,used.length);
assert.equal(used.length,Object.keys(features).length);
for(const season of sandbox.MonChaiSaisons){
  assert.equal(Object.keys(season.stories).length,6);
  for(const story of Object.values(season.stories)){
    for(const field of ['title','p1','p2','peopleTitle','people'])assert.ok(story[field]);
    assert.ok(html.includes(story.p1.replace(/&/g,'&amp;').replace(/</g,'&lt;')),'Repli du récit absent');
  }
}
for(const f of Object.values(features)){
  for(const field of ['title','text','observation','conditions','availability','proof','stage'])assert.ok(f[field]);
  if(f.image)assert.ok(fs.existsSync(path.resolve(f.image.startsWith('/')?root:dir,'.'+(f.image.startsWith('/')?f.image:'/'+f.image))));
  if(f.availability.startsWith('Projet'))assert.equal(f.kind,'schema');
}
for(const id of ['story-dialog','mc-dialog','zoom-dialog','mc-observation','mc-conditions','conditions-21','recits-21'])assert.ok(html.includes(`id="${id}"`));
assert.doesNotMatch(html,/class="(?:site-header|demo-bar)"/);
assert.match(html,/domaine fictif/i);
const sizes=['sprite','vol','salut'].map(n=>fs.statSync(path.join(dir,'assets',`halbert-${n}.webp`)).size);
assert.ok(sizes.reduce((a,b)=>a+b)<350000,'Budget des trois planches du guide');
console.log(JSON.stringify({demonstration21:'OK',recits:24,fonctions:used.length,guide_octets:sizes.reduce((a,b)=>a+b)}));
