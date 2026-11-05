const mobile=matchMedia('(max-width:900px)');
const title=document.querySelector('#hero-title');

function fitTitle(){
 title.style.removeProperty('--mobile-title-size');
 if(!mobile.matches)return;
 const range=document.createRange();range.selectNodeContents(title);
 const width=range.getBoundingClientRect().width,available=title.clientWidth;
 if(width>available&&available>0){const size=parseFloat(getComputedStyle(title).fontSize);title.style.setProperty('--mobile-title-size',`${Math.floor(size*available/width*10)/10}px`);}
}

export function setHeroTitle(html){
 const [lead,...tail]=html.split(/<br\s*\/?\s*>/i);
 title.replaceChildren();
 const first=document.createElement('span');first.className='title-lead';first.innerHTML=lead;title.append(first);
 if(tail.length){const last=document.createElement('span');last.className='title-tail';last.innerHTML=tail.join(' ');title.append(document.createTextNode(' '),document.createElement('br'),last);}
 fitTitle();
}

new ResizeObserver(fitTitle).observe(title.parentElement);
mobile.addEventListener('change',fitTitle);
document.fonts?.ready.then(fitTitle);
setHeroTitle(title.innerHTML);
