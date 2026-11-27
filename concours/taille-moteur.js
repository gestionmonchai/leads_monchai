/* Geometry and scoring shared by the scene, precise controls and tests. */
(function(root) {
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function point(b,t) {
    const s=1-t,p=b.points;
    return {x:s*s*s*p[0][0]+3*s*s*t*p[1][0]+3*s*t*t*p[2][0]+t*t*t*p[3][0],
      y:s*s*s*p[0][1]+3*s*s*t*p[1][1]+3*s*t*t*p[2][1]+t*t*t*p[3][1]};
  }
  function prepare(b) {
    b.table=[0];let previous=point(b,0);
    for(let i=1;i<=400;i++){const p=point(b,i/400);b.table.push(b.table[i-1]+Math.hypot(p.x-previous.x,p.y-previous.y)*2);previous=p;}
    b.length=b.table[400];b.cut=b.length;
    b.buds=b.nodes.map(t=>({t,mm:distance(b,t)}));return b;
  }
  function distance(b,t) {const n=clamp(t,0,1)*400,i=Math.floor(n);return i===400?b.table[400]:b.table[i]+(b.table[i+1]-b.table[i])*(n-i);}
  function parameter(b,mm) {
    mm=clamp(mm,0,b.length);let lo=0,hi=400;
    while(lo<hi){const m=(lo+hi)>>1;if(b.table[m]<mm)lo=m+1;else hi=m;}
    if(lo===0)return 0;return (lo-1+(mm-b.table[lo-1])/(b.table[lo]-b.table[lo-1]))/400;
  }
  function scenario(index) {
    const mirror=index===1;const shift=index===2?15:0;
    const specs=[
      {id:'A',name:'Courson de rappel',kind:'spur',target:2,diameter:8,points:[[418,444],[365,370],[320,255],[270,100]],nodes:[.12,.29,.46,.63,.79,.95]},
      {id:'B',name:'Baguette à fruit',kind:'cane',target:[6,7,5][index],diameter:9,points:[[452,414],[499,320],[630,210],[710,58]],nodes:[.10,.22,.34,.46,.58,.70,.82,.94]},
      {id:'C',name:'Sarment superflu haut',kind:'remove',target:0,diameter:8,points:[[418,424],[326,405],[191,306],[88,211]],nodes:[.13,.29,.45,.62,.78,.94]},
      {id:'D',name:'Sarment superflu bas',kind:'remove',target:0,diameter:7,points:[[438,535],[530,520],[671,432],[809,359]],nodes:[.13,.29,.46,.62,.78,.94]}
    ];
    specs.forEach((b,i)=>{b.points=b.points.map(([x,y],j)=>[mirror?900-x:x+shift*(j?Math.sin(i+j):0),y+(index===2&&j?Math.sin(i+j)*13:0)]);prepare(b);});
    return {index,branches:specs,baguette:[6,7,5][index],name:['Le cep équilibré','Le cep en miroir','Le cep à charge réduite'][index]};
  }
  function metrics(b,mm=b.cut) {
    const kept=b.buds.filter(n=>n.mm<mm),last=kept.at(-1);
    return {eyes:kept.length,margin:last?mm-last.mm:mm,nearBud:b.buds.some(n=>Math.abs(n.mm-mm)<4),mm};
  }
  function assess(b) {
    const m=metrics(b),made=b.cut<b.length-1;
    const rightEyes=m.eyes===b.target;
    const min=b.kind==='remove'?b.diameter:10,max=b.kind==='remove'?b.diameter*3:25;
    const safe=m.margin>=min&&m.margin<=max&&!m.nearBud;
    const score=made?Math.max(0,14-Math.abs(m.eyes-b.target)*7)+(safe?8:0)+3:0;
    let reason;
    if(!made)reason='Sarment non taillé.';
    else if(!rightEyes)reason=`${m.eyes} yeux conservés ; objectif : ${b.target}.`;
    else if(m.nearBud)reason='La coupe est trop proche d’un œil.';
    else if(!safe)reason=b.kind==='remove'?`Chicot de ${Math.round(m.margin)} mm ; objectif de l’exercice : ${min} à ${max} mm.`:`Marge de ${Math.round(m.margin)} mm ; objectif de l’exercice : 10 à 25 mm.`;
    else reason=b.kind==='remove'?'Sarment retiré, chicot préservé.':`${m.eyes} yeux conservés, marge de coupe respectée.`;
    return {id:b.id,name:b.name,score,perfect:score===25,reason,metrics:m};
  }
  function ideal(b) {return b.target?b.buds[b.target-1].mm+15:b.diameter*2;}
  const api={clamp,point,distance,parameter,scenario,metrics,assess,ideal};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Taille=api;
})(globalThis);
