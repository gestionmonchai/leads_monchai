/* A living vector scene: all wood, buds and cuts share one measured geometry. */
(() => {
  'use strict';
  const T=window.Taille,NS='http://www.w3.org/2000/svg';
  const el=(name,attrs={},parent)=>{const n=document.createElementNS(NS,name);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(parent)parent.append(n);return n;};
  const line=(parent,d,color,width,attrs={})=>el('path',{d,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',...attrs},parent);
  let scene,view,wood,cursor,active,scenario,selectHandler,zoom=1,pan={x:0,y:0},drag=null,showLabels=true;
  function random(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
  function curve(b,from=0,to=1,offset=0) {
    let d='';for(let j=0;j<=70;j++){const t=from+(to-from)*j/70,p=T.point(b,t),q=T.point(b,Math.min(1,t+.001)),r=T.point(b,Math.max(0,t-.001));const dx=q.x-r.x,dy=q.y-r.y,l=Math.hypot(dx,dy)||1;d+=`${j?'L':'M'}${(p.x-dy/l*offset).toFixed(2)} ${(p.y+dx/l*offset).toFixed(2)} `;}return d;
  }
  function bud(parent,b,node,index){
    const p=T.point(b,node.t),q=T.point(b,Math.min(1,node.t+.01)),a=Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI;
    const g=el('g',{'data-eye':`${b.id}-${index+1}`,transform:`translate(${p.x} ${p.y}) rotate(${a})`},parent),side=index%2?1:-1;
    el('ellipse',{cx:0,cy:0,rx:4.3,ry:7,fill:'#a88759',opacity:.8},g);
    line(g,'M-3 -6 Q-5 0 -2 6','#d5b27c',1.3);
    el('path',{d:`M-2 ${side*3} Q-7 ${side*5} -4 ${side*10} Q3 ${side*8} 3 ${side*4}Z`,fill:'url(#bud-shade)',stroke:'#493327','stroke-width':.7},g);
    line(g,`M-4 ${side*5} Q-5 ${side*7} -4 ${side*8}`,'#c3a078',.85);
    el('path',{d:`M3 ${-side*4} q3 ${-side*7} 5 ${-side*5} l-1 ${side*5}Z`,fill:'#73533b'},g);
  }
  function cane(parent,b,end=1,opacity=1){
    const g=el('g',{'data-branch':b.id,opacity},parent),width=b.diameter*.7;
    for(let i=0;i<16;i++){const from=end*i/16,to=end*(i+1)/16,w=width*(1-from*.65);line(g,curve(b,from,to),'#30251c',w+1);line(g,curve(b,from,to),'url(#cane-shade)',w);line(g,curve(b,from,to,-w*.22),'#d0a16d',w*.18,{opacity:.65});}
    const rng=random(187+b.id.charCodeAt(0));
    for(let i=0;i<19;i++){const a=rng()*end,z=Math.min(end,a+.025+rng()*.09);line(g,curve(b,a,z,(rng()-.5)*width*.6),i%2?'#62422b':'#d0a16d',.5+rng()*.55,{opacity:.65});}
    b.buds.forEach((n,i)=>{if(n.t<end)bud(g,b,n,i);});
    if(end<.995){const p=T.point(b,end),q=T.point(b,Math.max(0,end-.002)),a=Math.atan2(p.y-q.y,p.x-q.x)*180/Math.PI;el('ellipse',{cx:0,cy:0,rx:2,ry:width*.48,transform:`translate(${p.x} ${p.y}) rotate(${a})`,fill:'#f0d3a5',stroke:'#976c44','stroke-width':.8},g);}
    return g;
  }
  function oldWood(parent){
    const path='M410 678 C420 647 416 622 425 598 C433 574 420 551 421 528 C422 503 434 485 428 466 C422 447 412 438 411 420 L433 404 C441 411 452 405 460 399 L472 417 C456 438 451 447 454 465 C460 490 446 510 449 535 C451 563 445 581 448 604 C449 634 440 651 447 681 Z';
    el('path',{d:path,fill:'url(#trunk-shade)',stroke:'#342c25','stroke-width':2,filter:'url(#wood-relief)'},parent);
    const rng=random(77);for(let i=0;i<42;i++){
      const x=420+rng()*24,y=438+rng()*218;
      line(parent,`M${x} ${y} q${-9+rng()*18} ${10+rng()*15} ${-7+rng()*14} ${27+rng()*22}`,i%3?'#44362b':'#b19977',.7+rng()*2,{opacity:.75});
    }
    line(parent,'M430 455 Q449 478 436 514 T435 564 Q429 592 434 620','#c5b18d',2,{opacity:.7});
    el('ellipse',{cx:461,cy:413,rx:8,ry:5,transform:'rotate(-30 461 413)',fill:'#988064',stroke:'#46372d','stroke-width':3},parent);
    el('ellipse',{cx:461,cy:413,rx:3,ry:2,fill:'#68543e'},parent);
    // Old pruning scars are deliberately on permanent wood, never click targets.
    el('ellipse',{cx:427,cy:478,rx:7,ry:10,fill:'#4b392a',stroke:'#9b8060','stroke-width':2},parent);
    line(parent,'M425 478 Q431 473 430 484','#c1a479',1.3);
    el('ellipse',{cx:432,cy:680,rx:47,ry:10,fill:'#565744',opacity:.7},parent);
    for(let i=0;i<12;i++){const x=393+i*7;line(parent,`M${x} ${680+i%3} l${i%3-1} ${-3-i%5}`,i%2?'#a6a17c':'#3f4937',1,{opacity:.8});}
  }
  function environment(){
    scene.innerHTML=`<defs>
      <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#d9e1db"/><stop offset=".6" stop-color="#e5e4d2"/><stop offset="1" stop-color="#c5c7ad"/></linearGradient>
      <linearGradient id="earth" x2="0.3" y2="1"><stop stop-color="#9d9d7f"/><stop offset="1" stop-color="#4a5140"/></linearGradient>
      <linearGradient id="cane-shade"><stop stop-color="#4c3524"/><stop offset=".3" stop-color="#b58b54"/><stop offset=".54" stop-color="#91663f"/><stop offset="1" stop-color="#503925"/></linearGradient>
      <linearGradient id="trunk-shade"><stop stop-color="#302c25"/><stop offset=".32" stop-color="#947b57"/><stop offset=".58" stop-color="#65523b"/><stop offset=".8" stop-color="#a18a66"/><stop offset="1" stop-color="#3e362b"/></linearGradient>
      <linearGradient id="bud-shade"><stop stop-color="#d0b89c"/><stop offset=".4" stop-color="#72513b"/><stop offset="1" stop-color="#382c24"/></linearGradient>
      <radialGradient id="mist"><stop stop-color="#fffbe3" stop-opacity=".7"/><stop offset="1" stop-color="#fffbe3" stop-opacity="0"/></radialGradient>
      <filter id="distant"><feGaussianBlur stdDeviation="2.6"/></filter>
      <filter id="wood-relief" x="-10%" y="-5%" width="120%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".08 .25" numOctaves="3" seed="7" result="noise"/><feDiffuseLighting in="noise" lighting-color="#b4a183" surfaceScale="1.5" diffuseConstant=".6" result="light"><feDistantLight azimuth="220" elevation="50"/></feDiffuseLighting><feComposite in="light" in2="SourceGraphic" operator="in" result="relief"/><feBlend in="SourceGraphic" in2="relief" mode="multiply"/></filter>
    </defs>`;
    el('rect',{width:900,height:720,fill:'url(#sky)'},scene);
    el('path',{d:'M0 425 Q150 370 320 406 T650 383 T900 400 V720 H0Z',fill:'#989f84',opacity:.55},scene);
    el('path',{d:'M0 475 Q290 420 900 467 V720 H0Z',fill:'url(#earth)'},scene);
    const background=el('g',{filter:'url(#distant)',opacity:.46},scene);
    for(let row=0;row<4;row++)for(let i=0;i<9;i++){
      const x=i*135-row*25,y=452+row*51,s=.23+row*.13;
      line(background,`M${x} ${y} l${-8*s} ${-135*s} m0 15 l${-82*s} ${-58*s} m${82*s} ${58*s} l${92*s} ${-80*s}`,'#565847',5*s);
    }
    for(let i=0;i<30;i++){const x=i*39-130;line(background,`M${x} 720 L${410+(x-410)*.15} 432`,'#b4b59a',2,{opacity:.4});}
    el('ellipse',{cx:180,cy:190,rx:520,ry:400,fill:'url(#mist)'},scene);
    const rng=random(93);for(let i=0;i<210;i++){const x=rng()*900,y=580+rng()*140;line(scene,`M${x} ${y} l${rng()*12-6} ${-2-rng()*10}`,i%2?'#b6ac85':'#646449',.5+rng(),{opacity:.3});}
    view=el('g',{id:'vine-view'},scene);
    line(view,'M43 689 L53 238 M46 688 L51 240','#9a9b88',10);line(view,'M49 239 L53 688','#d0ceba',2);
    line(view,'M-400 437 L1300 437','#51594f',1.3,{opacity:.7});line(view,'M-400 223 L1300 223','#7f8779',.8,{opacity:.45});
    wood=el('g',{id:'wood'},view);cursor=el('g',{id:'cut-cursor','pointer-events':'none'},view);
    scene.addEventListener('pointerdown',pointerDown);
    scene.addEventListener('pointermove',pointerMove);
    scene.addEventListener('pointerup',pointerUp);
    scene.addEventListener('pointercancel',()=>drag=null);
  }
  function transform(){view.setAttribute('transform',`translate(${450+pan.x} ${400+pan.y}) scale(${zoom}) translate(-450 -400)`);document.getElementById('zoom-value').textContent=`${Math.round(zoom*100)} %`;}
  function render(){
    wood.replaceChildren();oldWood(el('g',scenario.index===1?{transform:'translate(900 0) scale(-1 1)'}:{},wood));
    scenario.branches.forEach(b=>{
      const end=T.parameter(b,b.cut);cane(wood,b,end);
      if(showLabels&&b.cut>35){const p=T.point(b,Math.min(end*.7,.61)),g=el('g',{'pointer-events':'none'},wood);el('circle',{cx:p.x+22,cy:p.y-7,r:15,fill:'#f9f6e9',stroke:'#8e7455','stroke-width':1},g);const n=el('text',{x:p.x+22,y:p.y-2,'text-anchor':'middle',fill:'#4b3424','font-size':14,'font-family':'Inter,Arial','font-weight':600},g);n.textContent=b.id;}
      if(active?.id===b.id){const t=T.parameter(b,Math.min(active.mm,b.cut));line(wood,curve(b,0,end),'#f0c57c',b.diameter*1.8,{opacity:.15,'pointer-events':'none'});line(wood,curve(b,t,end),'#f4ba68',b.diameter*1.4,{opacity:.36,'pointer-events':'none','stroke-dasharray':'5 6'});}
    });
    drawCursor();transform();
  }
  function drawCursor(){
    cursor.replaceChildren();if(!active)return;
    const b=scenario.branches.find(b=>b.id===active.id),t=T.parameter(b,active.mm),p=T.point(b,t),q=T.point(b,Math.min(1,t+.005)),r=T.point(b,Math.max(0,t-.005));
    const a=Math.atan2(q.y-r.y,q.x-r.x),nx=-Math.sin(a)*18,ny=Math.cos(a)*18;
    line(cursor,`M${p.x-nx} ${p.y-ny} L${p.x+nx} ${p.y+ny}`,'#fff4da',5);
    line(cursor,`M${p.x-nx} ${p.y-ny} L${p.x+nx} ${p.y+ny}`,'#a54c28',2.2);
    el('circle',{cx:p.x,cy:p.y,r:25,fill:'none',stroke:'#fff9e5','stroke-width':1.5,'stroke-dasharray':'3 5'},cursor);
    const g=el('g',{transform:`translate(${p.x+24} ${p.y+7}) rotate(-24)`},cursor);
    line(g,'M0 0 L18 -16 M0 0 L20 10','#eeeece',4);line(g,'M0 0 L-14 17 M0 0 L-19 -9','#852e26',5);
    el('circle',{cx:-16,cy:19,r:5,fill:'none',stroke:'#852e26','stroke-width':3},g);el('circle',{cx:-23,cy:-11,r:5,fill:'none',stroke:'#852e26','stroke-width':3},g);el('circle',{cx:0,cy:0,r:3,fill:'#e3d1ac',stroke:'#544b3e','stroke-width':1},g);
  }
  function local(event){const p=scene.createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform(view.getScreenCTM().inverse());}
  function nearest(p){let best=null;for(const b of scenario.branches){const end=T.parameter(b,b.cut);for(let i=1;i<=300;i++){const t=i/300*end,q=T.point(b,t),distance=Math.hypot(q.x-p.x,q.y-p.y);if(!best||distance<best.distance)best={b,t,distance};}}return best;}
  function pointerDown(e){if(e.button!==0)return;const p=local(e),n=nearest(p);if(n&&n.distance<24/zoom){selectHandler(n.b.id,Math.round(T.distance(n.b,n.t)));drag={mode:'cut',id:n.b.id};}else drag={mode:'pan',x:e.clientX,y:e.clientY,startX:pan.x,startY:pan.y};scene.setPointerCapture(e.pointerId);}
  function pointerMove(e){if(!drag)return;if(drag.mode==='pan'){const r=scene.getBoundingClientRect();pan.x=drag.startX+(e.clientX-drag.x)*900/r.width;pan.y=drag.startY+(e.clientY-drag.y)*720/r.height;transform();return;}const p=local(e),b=scenario.branches.find(b=>b.id===drag.id);let best=0,d=Infinity;for(let i=1;i<=400;i++){const t=i/400,q=T.point(b,t),v=Math.hypot(q.x-p.x,q.y-p.y);if(v<d){best=t;d=v;}}selectHandler(b.id,Math.round(T.distance(b,best)));}
  function pointerUp(){
    if(drag?.mode==='cut'&&matchMedia('(max-width:700px)').matches)document.getElementById('cut-details').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
    drag=null;
  }
  function loupe(b,mm){
    const svg=document.getElementById('cut-loupe');svg.replaceChildren();
    el('rect',{width:300,height:140,rx:8,fill:'#e8e4d5'},svg);
    const nearest=b.buds.filter(n=>n.mm<mm).at(-1),ref=nearest?nearest.mm:0,scale=2.1;
    const x=80+(mm-ref)*scale;
    line(svg,'M0 90 Q150 83 300 90','#493424',22);line(svg,'M0 86 Q150 79 300 86','#ba8d56',13);line(svg,'M0 81 Q150 74 300 81','#d2ad76',2);
    for(let i=0;i<20;i++)line(svg,`M${i*18} ${81+i%3} l13 ${i%2?2:-2}`,'#785232',.8);
    b.buds.forEach((n,i)=>{const bx=80+(n.mm-ref)*scale;if(bx<-30||bx>330)return;const g=el('g',{transform:`translate(${bx} 85)`},svg);el('ellipse',{cx:0,cy:0,rx:4,ry:15,fill:'#c1a073'},g);el('path',{d:'M-5 -8 Q-13 -24 -3 -31 Q9 -28 7 -10Z',fill:'url(#bud-shade)',stroke:'#4d3828','stroke-width':1},g);const t=el('text',{x:bx,y:122,'text-anchor':'middle','font-size':12,fill:'#66513e'},svg);t.textContent=`œil ${i+1}`;});
    // The point of cut stays inside the loupe even when the selected margin is large.
    if(x>275||x<20){const note=el('text',{x:150,y:25,'text-anchor':'middle','font-size':12,fill:'#5b4b3e'},svg);note.textContent='Coupe hors de cette zone agrandie';}
    else{line(svg,`M${x+7} 48 L${x-7} 110`,'#f9f4df',6);line(svg,`M${x+7} 48 L${x-7} 110`,'#a54c28',2);line(svg,`M80 38 H${x}`,'#665844',1,{'stroke-dasharray':'3 3'});const text=el('text',{x:(80+x)/2,y:29,'text-anchor':'middle','font-size':13,fill:'#563925'},svg);text.textContent=`${Math.round(mm-ref)} mm`;}
  }
  window.TailleScene={init(svg,onSelect){scene=svg;selectHandler=onSelect;environment();},load(s){scenario=s;active=null;zoom=1;pan={x:0,y:0};render();},select(id,mm){active={id,mm};render();loupe(scenario.branches.find(b=>b.id===id),mm);},refresh(){render();},clear(){active=null;render();},zoom(delta){zoom=T.clamp(zoom+delta,1,2.5);if(zoom===1)pan={x:0,y:0};transform();},reset(){zoom=1;pan={x:0,y:0};transform();},labels(value){showLabels=value;render();}};
})();
