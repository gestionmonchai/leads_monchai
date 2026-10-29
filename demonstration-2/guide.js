'use strict';
(() => {
  const order = Object.freeze(['vignes','terrain','jardin','chai','bureau','caveau']);
  const invitations = {
    terrain: 'Je vous attends au 1.1 pour la saisie mobile dans les vignes.',
    jardin: 'Direction les intrants : rejoignez-moi au 2.',
    chai: 'Passons au chai. Je vous attends au 3.',
    bureau: 'Préparons les ventes au bureau : rendez-vous au 4.',
    caveau: 'Retrouvons les visiteurs au caveau, au 5.'
  };
  globalThis.MonChaiGuide = {
    order,
    create({canvas, motionAllowed}) {
      const figure = canvas.querySelector('.halbert-guide');
      const message = document.querySelector('.guide-message');
      const caption = document.querySelector('#halbert-caption');
      let started = false, ready = false, failed = false, visited = 'vignes', target = 'terrain';
      let animation = null, departure = null, initial = true, point = {x:0,y:0};
      let measuredWidth = 0, measuredHeight = 0;
      const images = [new Image(),new Image()];
      let loaded = 0;
      const translate = p => `translate3d(${p.x}px,${p.y}px,0)`;
      const next = id => order[Math.min(order.indexOf(id)+1,order.length-1)];
      function currentPoint() {
        const transform = getComputedStyle(figure).transform;
        if (animation && transform !== 'none' && globalThis.DOMMatrixReadOnly) {
          const matrix = new DOMMatrixReadOnly(transform);
          return {x:matrix.m41,y:matrix.m42};
        }
        return point;
      }
      function stop() {
        clearTimeout(departure); departure = null;
        if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
      }
      function perch(id) {
        const bounds = canvas.getBoundingClientRect();
        const anchor = canvas.querySelector(`.map-pin[data-place="${id}"]`).getBoundingClientRect();
        figure.style.setProperty('--halbert-height',`${Math.max(36,Math.min(56,bounds.width*.115))}px`);
        const width = figure.offsetWidth, height = figure.offsetHeight;
        const center = {x:(anchor.left+anchor.right)/2-bounds.left,y:(anchor.top+anchor.bottom)/2-bounds.top};
        const obstacles = [...canvas.querySelectorAll('.pin-number,.map-mc:not([hidden]),.map-film:not([hidden])')].map(node => {
          const r = node.getBoundingClientRect();
          return {left:r.left-bounds.left-2,top:r.top-bounds.top-2,right:r.right-bounds.left+2,bottom:r.bottom-bounds.top+2};
        });
        let best = null, bestScore = Infinity;
        function consider(x,y) {
          x = Math.max(3,Math.min(x,bounds.width-width-3));
          y = Math.max(3,Math.min(y,bounds.height-height-3));
          let overlap = 0;
          for (const r of obstacles) overlap += Math.max(0,Math.min(x+width,r.right)-Math.max(x,r.left))*Math.max(0,Math.min(y+height,r.bottom)-Math.max(y,r.top));
          const distance = (x+width/2-center.x)**2+(y+height/2-center.y)**2;
          const score = overlap*1e6+distance;
          if (score<bestScore) { bestScore=score;best={x,y}; }
        }
        for (let y=3;y<=bounds.height-height-3;y+=6) for (let x=3;x<=bounds.width-width-3;x+=6) consider(x,y);
        consider(center.x-width/2,center.y-height-30);
        measuredWidth=canvas.clientWidth;measuredHeight=canvas.clientHeight;
        return best || {x:3,y:3};
      }
      function land() {
        stop(); point=perch(target); figure.style.transform=translate(point);
        figure.dataset.guideState=visited==='caveau'?'complete':'waiting';
      }
      function fly() {
        if (!started || !ready || failed) return;
        const from = currentPoint(); stop();
        const to = perch(target);
        point=to; figure.style.transform=translate(to);
        if (!motionAllowed() || (Math.abs(to.x-from.x)<1 && Math.abs(to.y-from.y)<1)) { land();return; }
        const middle = {x:(from.x+to.x)/2,y:Math.max(0,Math.min(from.y,to.y)-Math.min(50,canvas.clientHeight*.13))};
        const tilt = to.x>=from.x?7:-7;
        figure.dataset.guideState='flying';
        animation=figure.animate([
          {transform:translate(from)+' rotate(0deg)'},
          {transform:translate(middle)+` rotate(${tilt}deg)`,offset:.48},
          {transform:translate(to)+' rotate(0deg)'}
        ],{duration:1100,easing:'cubic-bezier(.32,.05,.25,1)'});
        animation.onfinish=()=>{ animation=null;figure.dataset.guideState=visited==='caveau'?'complete':'waiting'; };
      }
      function describe() {
        target=next(visited);
        figure.dataset.guideCurrent=visited;
        figure.dataset.guideTarget=target;
        caption.textContent=visited==='caveau'?'Nous voilà au 5, le caveau. Vous pouvez poursuivre la visite librement.':invitations[target];
        if (failed) caption.textContent=`Prochaine étape : ${globalThis.MonChaiFonctions.places[target].label}. Les repères restent accessibles.`;
        canvas.querySelectorAll('.map-pin').forEach(pin=>pin.classList.toggle('is-guide-next',visited!=='caveau' && pin.dataset.place===target));
      }
      function begin() {
        if (!started || !ready) return;
        figure.hidden=false;
        point=perch(visited);figure.style.transform=translate(point);
        figure.dataset.guideState='waiting';
        if (!motionAllowed()) { land();return; }
        if (initial) { departure=setTimeout(fly,350);initial=false; }
        else fly();
      }
      for (const [index,image] of images.entries()) {
        image.onload=()=>{if(failed)return;if(++loaded===images.length){ready=true;figure.dataset.asset='ready';begin();}};
        image.onerror=()=>{failed=true;ready=false;figure.hidden=true;figure.dataset.asset='unavailable';stop();if(started)describe();};
        image.src=index===0?figure.dataset.sprite:figure.dataset.flightSprite;
      }
      return {
        start(id) {
          if (started) return;
          started=true;visited=order.includes(id)?id:'vignes';message.hidden=false;describe();
          if (ready) begin();
        },
        advance(id) {
          if (!started || !order.includes(id)) return;
          visited=id;initial=false;describe();
          if (ready) fly();
        },
        reposition() {
          if (started && ready && (measuredWidth!==canvas.clientWidth || measuredHeight!==canvas.clientHeight)) land();
        },
        syncMotion() {
          if (started && ready && !motionAllowed()) land();
        }
      };
    }
  };
})();
