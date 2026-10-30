'use strict';
(() => {
  const order = Object.freeze(['vignes','terrain','jardin','chai','bureau','caveau']);
  // Lignes de pose dans les quatre paysages 1536 × 1024 : les coordonnées
  // désignent les pieds, jamais le coin de la silhouette. Chaque alternative
  // reste sur une toiture ou une allée, même quand les boutons prennent plus
  // de place sur mobile.
  const perches = {
    vignes: [
      ['allee',188,289,211,309], ['allee',267,421,295,446],
      ['allee',365,480,391,488], ['allee',502,458,523,470]
    ],
    terrain: [
      ['allee',1001,808,1034,826], ['allee',1074,590,1112,606],
      ['muret',1359,699,1390,705], ['allee',1023,604,1043,614]
    ],
    jardin: [
      ['allee',838,501,858,495], ['allee',949,560,970,548],
      ['allee',787,596,813,608], ['allee',1015,575,1040,582],
      ['allee',1119,596,1126,600]
    ],
    chai: [
      ['toit',980,314,1004,322], ['toit',1168,402,1189,384],
      ['toit',1269,455,1290,461], ['allee',1015,575,1040,610],
      ['allee',1119,596,1126,600]
    ],
    bureau: [
      ['toit',586,144,623,159], ['toit',673,183,690,188],
      ['toit',470,258,496,249], ['terrasse',752,366,778,360],
      ['allee',607,463,622,469], ['allee',568,463,582,474]
    ],
    caveau: [
      ['toit',449,531,478,542], ['toit',600,570,625,559],
      ['terrasse',545,754,564,749], ['terrasse',530,775,556,780],
      ['terrasse',470,755,490,768]
    ]
  };
  const invitations = {
    vignes: 'Nous voilà dans les vignes, au 1 : du suivi des parcelles aux vendanges.',
    terrain: 'Avec vous au 1.1 : découvrez la saisie mobile.',
    jardin: 'Nous voilà au 2 : les intrants et le suivi des interventions.',
    chai: 'Avec vous au chai, au 3 : les vins, les opérations et leur suivi.',
    bureau: 'Nous voilà au bureau, au 4 : préparer les ventes et suivre les clients.',
    caveau: 'Avec vous au caveau, au 5 : la dégustation et les retours des visiteurs.'
  };
  globalThis.MonChaiGuide = {
    order,
    create({canvas, motionAllowed}) {
      const figure = canvas.querySelector('.halbert-guide');
      const message = document.querySelector('.guide-message');
      const caption = document.querySelector('#halbert-caption');
      let started = false, ready = false, failed = false, visited = 'vignes', target = 'vignes';
      let animation = null, departure = null, point = {x:0,y:0};
      let measuredWidth = 0, measuredHeight = 0;
      const images = [new Image(),new Image()];
      // Le salut est facultatif : son chargement ne bloque jamais le guide.
      const greeting = new Image();
      greeting.onload=()=>{figure.dataset.greeting='ready';};
      greeting.onerror=()=>{figure.dataset.greeting='unavailable';};
      greeting.src='assets/halbert-salut.png';
      let loaded = 0;
      const translate = p => `translate3d(${p.x}px,${p.y}px,0)`;
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
        figure.style.setProperty('--halbert-height',`${Math.max(36,Math.min(56,bounds.width*.115))*.9}px`);
        const style=getComputedStyle(figure);
        const width=parseFloat(style.width),height=parseFloat(style.height);
        const center = {x:(anchor.left+anchor.right)/2-bounds.left,y:(anchor.top+anchor.bottom)/2-bounds.top};
        const obstacles = [...canvas.querySelectorAll('.pin-number,.map-mc:not([hidden]),.map-film:not([hidden])')].map(node => {
          const r = node.getBoundingClientRect();
          return {left:r.left-bounds.left-2,top:r.top-bounds.top-2,right:r.right-bounds.left+2,bottom:r.bottom-bounds.top+2};
        });
        let best = null, bestScore = Infinity;
        function consider(surface,footX,footY) {
          const x=footX*bounds.width/1536-width/2;
          // Le dessin du salut a sept pixels transparents sous les pieds
          // pour 634 pixels de hauteur corporelle. Aligner les pieds au sol.
          const y=footY*bounds.height/1024-height+height*7/634;
          if (x<3 || y<3 || x+width>bounds.width-3 || y+height>bounds.height-3) return;
          let overlap = 0;
          for (const r of obstacles) overlap += Math.max(0,Math.min(x+width,r.right)-Math.max(x,r.left))*Math.max(0,Math.min(y+height,r.bottom)-Math.max(y,r.top));
          const distance = (x+width/2-center.x)**2+(y+height/2-center.y)**2;
          const score = overlap*1e6+distance;
          if (score<bestScore) { bestScore=score;best={x,y,surface,footX,footY}; }
        }
        for (const [surface,x1,y1,x2,y2] of perches[id]) {
          for (let step=0;step<=20;step++) {
            const t=step/20;
            consider(surface,x1+(x2-x1)*t,y1+(y2-y1)*t);
          }
        }
        // Conserver une pose physique même dans une taille de carte imprévue.
        // Les boutons passent au-dessus du guide et restent cliquables.
        if (!best) {
          const [surface,footX,footY]=perches[id][0];
          best={x:footX*bounds.width/1536-width/2,y:footY*bounds.height/1024-height+height*7/634,surface,footX,footY};
        }
        figure.dataset.perchSurface=best.surface;
        figure.dataset.perchFoot=`${best.footX},${best.footY}`;
        measuredWidth=canvas.clientWidth;measuredHeight=canvas.clientHeight;
        return best;
      }
      function land() {
        stop(); point=perch(target);
        figure.style.position='';figure.style.zIndex='';figure.dataset.guideOrigin='map';
        figure.style.transform=translate(point);
        figure.dataset.guideState=visited==='caveau'?'complete':'waiting';
        canvas.dispatchEvent(new Event('halbert-landed'));
      }
      function fly() {
        figure.dataset.guideMotion=motionAllowed()?'allowed':'paused';
        if (!started || !ready || failed) return;
        const from = currentPoint(); stop();
        const destination = perch(target);
        // Le premier vol traverse l'espace entre le titre et la carte.
        // Son repère est celui de la fenêtre ; les vols suivants restent
        // dans le repère de la carte pour suivre naturellement son défilement.
        const bounds=canvas.getBoundingClientRect();
        const to=figure.dataset.guideOrigin==='title'
          ? {x:destination.x+bounds.left,y:destination.y+bounds.top} : destination;
        point=to; figure.style.transform=translate(to);
        if (!motionAllowed() || (Math.abs(to.x-from.x)<1 && Math.abs(to.y-from.y)<1)) { land();return; }
        const baseY=figure.dataset.guideOrigin==='title'?(from.y+to.y)/2:Math.min(from.y,to.y);
        const middle = {x:(from.x+to.x)/2,y:Math.max(0,baseY-Math.min(50,canvas.clientHeight*.13))};
        const tilt = to.x>=from.x?7:-7;
        figure.dataset.guideState='flying';
        animation=figure.animate([
          {transform:translate(from)+' rotate(0deg)'},
          {transform:translate(middle)+` rotate(${tilt}deg)`,offset:.48},
          {transform:translate(to)+' rotate(0deg)'}
        ],{duration:1100,easing:'cubic-bezier(.32,.05,.25,1)'});
        animation.onfinish=()=>{ animation=null;land(); };
      }
      function describe() {
        target=visited;
        figure.dataset.guideCurrent=visited;
        figure.dataset.guideTarget=target;
        caption.textContent=invitations[target];
        if (failed) caption.textContent=`Vous explorez : ${globalThis.MonChaiFonctions.places[target].label}. Les repères restent accessibles.`;
        canvas.querySelectorAll('.map-pin').forEach(pin=>pin.classList.toggle('is-guide-current',pin.dataset.place===target));
      }
      function begin() {
        figure.dataset.guideMotion=motionAllowed()?'allowed':'paused';
        if (!started || !ready) return;
        figure.hidden=false;
        perch(target);
        figure.dataset.guideState='waiting';
        const title=document.querySelector('#halbert-departure');
        const bounds=title?.getBoundingClientRect();
        if (!motionAllowed() || !bounds || bounds.bottom<=0 || bounds.top>=innerHeight) { land();return; }
        const width=figure.getBoundingClientRect().width,height=figure.getBoundingClientRect().height;
        // Garder les ailes déployées sous la petite légende au-dessus du titre.
        point={x:Math.max(6,Math.min(innerWidth-width-6,bounds.right+6)),y:Math.max(6,bounds.bottom-height+7)};
        figure.style.position='fixed';figure.style.zIndex='6';figure.dataset.guideOrigin='title';
        figure.style.transform=translate(point);
        departure=setTimeout(fly,450);
      }
      addEventListener('scroll',()=>{
        if (started && ready && figure.dataset.guideOrigin==='title') land();
      },{passive:true});
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
          visited=id;describe();
          if (ready) fly();
        },
        reposition() {
          if (started && ready && (measuredWidth!==canvas.clientWidth || measuredHeight!==canvas.clientHeight)) land();
        },
        syncMotion() {
          figure.dataset.guideMotion=motionAllowed()?'allowed':'paused';
          if (started && ready && !motionAllowed()) land();
        }
      };
    }
  };
})();

