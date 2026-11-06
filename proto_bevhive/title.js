const mobile=matchMedia('(max-width:900px)');
const title=document.querySelector('#hero-title');

function fitTitle(){
 title.style.removeProperty('--mobile-title-size');
 if(!mobile.matches)return;
 const range=document.createRange();range.selectNodeContents(title);
 const width=range.getBoundingClientRect().width,available=title.clientWidth;
 if(width>available&&available>0){const size=parseFloat(getComputedStyle(title).fontSize);title.style.setProperty('--mobile-title-size',`${Math.floor(size*available/width*10)/10}px`);}
}

function paceWords(){
 const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 let delay=0;
 for(const node of nodes){
  const fragments=node.textContent.split(/(\s+)/u).filter(Boolean).map(text=>{
   if(/^\s+$/u.test(text))return document.createTextNode(text);
   const word=document.createElement('span');word.className='title-word';word.textContent=text;word.style.setProperty('--word-delay',`${delay}ms`);
   const letters=text.replace(/[^\p{L}\p{N}]/gu,'').length;
   delay+=Math.max(210,Math.min(450,140+letters*32))+(/[.!?…]$/.test(text)?220:/[,;:]$/.test(text)?100:0);
   return word;
  });
  node.replaceWith(...fragments);
 }
}

export function setHeroTitle(html){
 const [lead,...tail]=html.split(/<br\s*\/?\s*>/i);
 title.replaceChildren();
 const first=document.createElement('span');first.className='title-lead';first.innerHTML=lead;title.append(first);
 if(tail.length){const last=document.createElement('span');last.className='title-tail';last.innerHTML=tail.join(' ');title.append(document.createTextNode(' '),document.createElement('br'),last);}
 paceWords();fitTitle();
}

new ResizeObserver(fitTitle).observe(title.parentElement);
mobile.addEventListener('change',fitTitle);
document.fonts?.ready.then(fitTitle);
setHeroTitle(title.innerHTML);
