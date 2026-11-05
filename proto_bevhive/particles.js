export const POINT_COUNT = 18000;
export const THEMES = {champagne:[.90,.84,.63], jade:[.51,.79,.64], cobalt:[.48,.62,.97]};

// A surface of revolution, including the heel, shoulders, neck and lip.
export function bottleRadius(y){
  if(y < -1.48) return .47 + Math.sqrt(Math.max(0,1-((-1.48-y)/.12)**2))*.09;
  if(y < .38) return .56;
  if(y < .87){const t=(y-.38)/.49;return .56-(.56-.19)*(t*t*(3-2*t));}
  if(y < 1.48) return .19;
  if(y < 1.59) return .225;
  return .19;
}

export function createParticles(){
  let seed=819;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const points=new Float32Array(POINT_COUNT*3), scatter=new Float32Array(POINT_COUNT*3), details=new Float32Array(POINT_COUNT*2);
  for(let i=0;i<POINT_COUNT;i++){
    let y,angle=random()*Math.PI*2;
    const part=random();
    if(part<.69)y=-1.59+random()*1.97;
    else if(part<.85)y=.38+random()*.49;
    else if(part<.97)y=.87+random()*.72;
    else y=random()<.5?-1.57:1.58;
    let radius=bottleRadius(y);
    if(part>=.97)radius*=Math.sqrt(random());
    else if(random()<.13)radius*=.78+random()*.22;
    const k=i*3;points[k]=Math.cos(angle)*radius;points[k+1]=y;points[k+2]=Math.sin(angle)*radius;
    const a=random()*Math.PI*2,z=random()*2-1,r=1.0+random()*2.1;
    scatter[k]=Math.sqrt(1-z*z)*Math.cos(a)*r;scatter[k+1]=z*r*.85;scatter[k+2]=Math.sqrt(1-z*z)*Math.sin(a)*r;
    details[i*2]=random();details[i*2+1]=.65+random()*.7;
  }
  const vine=new Float32Array(POINT_COUNT*4);
  for(let i=0;i<POINT_COUNT;i++)vine.set([...points.subarray(i*3,i*3+3),1],i*4);
  return {points,scatter,details,vine,vineColors:new Float32Array(POINT_COUNT*3),fromColors:new Float32Array(POINT_COUNT*3)};
}

const vertex=`
precision highp float;
attribute vec3 aPosition;
attribute vec3 aScatter;
attribute vec2 aDetail;
attribute vec4 aVine;
attribute vec3 aVineColor;
attribute vec3 aFromColor;
uniform float uTime,uRotation,uTilt,uSpread,uAspect,uDpr,uMorph,uFromStyle,uToStyle;
uniform vec3 uColor;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec3 p=mix(aPosition,aVine.xyz,uMorph);
  float style=mix(uFromStyle,uToStyle,uMorph);
  p+=aScatter*uSpread;
  p+=sin(uTime*.65+aDetail.x*30.)*.009*(1.+uSpread*4.)*(1.-style*.9);
  float c=cos(uRotation),s=sin(uRotation);
  p.xz=mat2(c,-s,s,c)*p.xz;
  c=cos(uTilt);s=sin(uTilt);
  p.xy=mat2(c,-s,s,c)*p.xy;
  float depth=5.1+p.z;
  gl_Position=vec4(p.x/(.40*uAspect),(p.y+.025)/.40,depth-.2,depth);
  gl_PointSize=clamp(mix(1.25+aDetail.y*.7,1.10+aDetail.y*.55,style)*uDpr*5./depth,.8,5.5);
  float front=1.-smoothstep(-.6,.6,p.z);
  vec3 surface=mix(aPosition,aVine.xyz,uMorph);
  float edge=clamp(pow(abs(surface.x)/.57,2.),0.,1.);
  float label=step(-.62,surface.y)*step(surface.y,-.02);
  float lip=step(1.47,surface.y);
  vColor=mix(uColor,vec3(.97,.97,.87),edge*.35+label*.18+lip*.30);
  float luminance=dot(mix(aFromColor,aVineColor,uMorph),vec3(.2126,.7152,.0722));
  vec3 vineColor=uColor*(.78+sqrt(luminance)*.42);
  vColor=mix(vColor,vineColor,style);
  float bottleAlpha=(.16+front*.53+edge*.17)*aDetail.y;
  float vineAlpha=(.45+sqrt(luminance)*.43)*aDetail.y;
  vAlpha=mix(bottleAlpha,vineAlpha,style);
}`;
const fragment=`
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-vec2(.5))*2.;
  if(d>1.)discard;
  float glow=pow(1.-d,1.5);
  gl_FragColor=vec4(vColor,vAlpha*glow);
}`;

export class ParticleBottle{
  constructor(canvas,onStatus){
    this.canvas=canvas;this.onStatus=onStatus;this.data=createParticles();
    this.spread=0;this.targetSpread=0;this.rotation=.40;this.tilt=-.14;this.targetTilt=-.14;this.color=[...THEMES.champagne];this.targetColor=THEMES.champagne;
    this.shape='bottle';this.morph=0;this.burst=0;this.transition=null;this.fromStyle=0;this.toStyle=0;
    this.bottlePoints=this.data.points.slice();
    this.time=0;this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.last=0;this.dragging=false;this.frame=0;this.visible=true;
    this.gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
    try{if(this.gl)this.setupGL();else this.setupFallback();}catch(error){console.warn('Rendu 3D indisponible',error);this.failed=true;onStatus('Le rendu 3D est indisponible sur cet appareil. Essayez un autre navigateur.');return;}
    this.resizeObserver=new ResizeObserver(()=>{this.resize();this.requestDraw();});this.resizeObserver.observe(canvas);
    this.intersectionObserver=new IntersectionObserver(([entry])=>{this.visible=entry.isIntersecting;if(this.visible)this.requestDraw();});this.intersectionObserver.observe(canvas);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){this.last=0;this.requestDraw();}});
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(this.frame);this.frame=0;this.contextLost=true;onStatus('L’affichage 3D a été interrompu. Restauration en cours.');});
    canvas.addEventListener('webglcontextrestored',()=>{this.contextLost=false;this.setupGL();this.resize();onStatus('La bouteille 3D est à nouveau disponible.');this.requestDraw();});
    this.bindInteraction();this.resize();this.requestDraw();
  }
  setupGL(){
    const gl=this.gl;
    const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
    const program=gl.createProgram(),vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);this.program=program;
    this.buffers={};
    for(const [name,values,size] of [['aPosition',this.data.points,3],['aScatter',this.data.scatter,3],['aDetail',this.data.details,2],['aVine',this.data.vine,4],['aVineColor',this.data.vineColors,3],['aFromColor',this.data.fromColors,3]]){
      const buffer=gl.createBuffer();this.buffers[name]=buffer;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0);
    }
    this.uniforms=Object.fromEntries(['uTime','uRotation','uTilt','uSpread','uAspect','uDpr','uColor','uMorph','uFromStyle','uToStyle'].map(name=>[name,gl.getUniformLocation(program,name)]));
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);
  }
  setupFallback(){
    this.ctx=this.canvas.getContext('2d');if(!this.ctx)throw new Error('Canvas indisponible');
    this.onStatus('Affichage simplifié actif. La rotation, la teinte et la dispersion restent disponibles.');
  }
  resize(){const rect=this.canvas.getBoundingClientRect();this.width=rect.width;this.height=rect.height;this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(rect.width*this.dpr);this.canvas.height=Math.round(rect.height*this.dpr);if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height);}
  bindInteraction(){
    let startX=0,startY=0;
    this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.dragging=true;startX=e.clientX;startY=e.clientY;this.canvas.setPointerCapture(e.pointerId);this.canvas.classList.add('dragging');this.requestDraw();});
    this.canvas.addEventListener('pointermove',e=>{if(!this.dragging)return;this.rotation+=(e.clientX-startX)*.008;this.targetTilt=Math.max(-.55,Math.min(.55,this.targetTilt+(e.clientY-startY)*.002));startX=e.clientX;startY=e.clientY;this.requestDraw();});
    const release=()=>{this.dragging=false;this.canvas.classList.remove('dragging');};
    this.canvas.addEventListener('pointerup',release);this.canvas.addEventListener('pointercancel',release);this.canvas.addEventListener('lostpointercapture',release);
    this.canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')this.rotation-=.15;if(e.key==='ArrowRight')this.rotation+=.15;if(e.key==='ArrowUp')this.targetTilt=Math.max(-.55,this.targetTilt-.1);if(e.key==='ArrowDown')this.targetTilt=Math.min(.55,this.targetTilt+.1);this.requestDraw();});
  }
  setTheme(theme){this.targetColor=THEMES[theme];this.requestDraw();}
  setSpread(value){this.targetSpread=value;this.requestDraw();}
  setPaused(value){this.paused=value;this.last=0;this.requestDraw();}
  setFigure(shape,reference=null){
    if(this.shape===shape)return;
    const m=this.morph;
    for(let i=0;i<POINT_COUNT;i++){const p=i*3,v=i*4;for(let j=0;j<3;j++){this.data.points[p+j]=this.data.points[p+j]*(1-m)+this.data.vine[v+j]*m;this.data.fromColors[p+j]=this.data.fromColors[p+j]*(1-m)+this.data.vineColors[p+j]*m;}}
    this.fromStyle=this.fromStyle*(1-m)+this.toStyle*m;this.toStyle=reference?1:0;
    if(reference){this.data.vine=reference.vine;this.data.vineColors=reference.colors;}
    else{const target=new Float32Array(POINT_COUNT*4);for(let i=0;i<POINT_COUNT;i++)target.set([...this.bottlePoints.subarray(i*3,i*3+3),1],i*4);this.data.vine=target;this.data.vineColors=new Float32Array(POINT_COUNT*3);}
    if(this.gl&&!this.contextLost){for(const [name,data] of [['aPosition',this.data.points],['aFromColor',this.data.fromColors],['aVine',this.data.vine],['aVineColor',this.data.vineColors]]){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffers[name]);this.gl.bufferData(this.gl.ARRAY_BUFFER,data,this.gl.STATIC_DRAW);}}
    this.shape=shape;this.targetSpread=0;this.rotation=reference?0:.20;this.targetTilt=reference?0:-.14;this.morph=0;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){this.morph=1;this.burst=0;this.transition=null;}
    else this.transition={from:0,to:1,elapsed:0};
    this.last=0;this.requestDraw();
  }
  requestDraw(){if(!this.frame&&!this.failed&&!this.contextLost)this.frame=requestAnimationFrame(t=>this.draw(t));}
  draw(timestamp){
    this.frame=0;if(document.hidden||!this.width||!this.height)return;
    const dt=this.last?Math.min((timestamp-this.last)/1000,.04):1/60;this.last=timestamp;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ease=reduced?1:1-Math.exp(-dt*5);
    if(this.transition){
      const transition=this.transition;transition.elapsed+=dt;
      const progress=reduced?1:Math.min(transition.elapsed/2.15,1);
      const t=Math.max(0,Math.min((progress-.18)/.74,1));
      this.morph=transition.from+(transition.to-transition.from)*t*t*(3-2*t);
      this.burst=Math.sin(progress*Math.PI)*.82;
      if(progress===1){this.morph=transition.to;this.burst=0;this.transition=null;}
    }
    if(!this.paused){this.time+=dt;if(!this.dragging){if(this.toStyle===1)this.rotation+=(Math.sin(this.time*.25)*.09-this.rotation)*ease;else this.rotation+=dt*.075;}}
    if(this.toStyle===1){this.rotation=Math.max(-.28,Math.min(.28,this.rotation));this.targetTilt=Math.max(-.10,Math.min(.10,this.targetTilt));}
    this.spread+=(this.targetSpread-this.spread)*ease;this.tilt+=(this.targetTilt-this.tilt)*ease;
    this.color=this.color.map((v,i)=>v+(this.targetColor[i]-v)*ease);
    if(this.gl)this.drawGL();else this.draw2D();
    const settling=Math.abs(this.targetSpread-this.spread)>.0001||Math.abs(this.targetTilt-this.tilt)>.0001||this.color.some((v,i)=>Math.abs(v-this.targetColor[i])>.0001);
    if(this.visible&&(!this.paused||settling||this.transition))this.requestDraw();
  }
  drawGL(){const gl=this.gl,u=this.uniforms;gl.clear(gl.COLOR_BUFFER_BIT);for(const [name,value] of Object.entries({uTime:this.time,uRotation:this.rotation,uTilt:this.tilt,uSpread:this.spread+this.burst,uAspect:this.width/this.height,uDpr:this.dpr,uMorph:this.morph,uFromStyle:this.fromStyle,uToStyle:this.toStyle}))gl.uniform1f(u[name],value);gl.uniform3fv(u.uColor,this.color);gl.drawArrays(gl.POINTS,0,POINT_COUNT);}
  draw2D(){
    const ctx=this.ctx;ctx.clearRect(0,0,this.canvas.width,this.canvas.height);ctx.save();ctx.scale(this.dpr,this.dpr);
    const c=Math.cos(this.rotation),s=Math.sin(this.rotation),ct=Math.cos(-this.tilt),st=Math.sin(-this.tilt);const rgb=this.color.map(v=>Math.round(v*255));
    ctx.fillStyle=`rgb(${rgb.join(',')})`;
    for(let i=0;i<POINT_COUNT;i+=2){
      const k=i*3,v=i*4,m=this.morph,spread=this.spread+this.burst,style=this.fromStyle*(1-m)+this.toStyle*m;
      let x=this.data.points[k]*(1-m)+this.data.vine[v]*m+this.data.scatter[k]*spread,y=this.data.points[k+1]*(1-m)+this.data.vine[v+1]*m+this.data.scatter[k+1]*spread,z=this.data.points[k+2]*(1-m)+this.data.vine[v+2]*m+this.data.scatter[k+2]*spread;
      const sample=j=>this.data.fromColors[k+j]*(1-m)+this.data.vineColors[k+j]*m;
      const luminance=sample(0)*.2126+sample(1)*.7152+sample(2)*.0722,light=.78+Math.sqrt(luminance)*.42;
      ctx.fillStyle=`rgb(${rgb.map(value=>Math.min(255,Math.round(value*(1-style)+value*light*style))).join(',')})`;
      const rx=x*c+z*s;z=-x*s+z*c;x=rx*ct-y*st;y=rx*st+y*ct;const scale=this.height/(.8*(5.1+z));
      ctx.globalAlpha=Math.max(.12,.45-z*.35)*(1-style)+(.38+Math.sqrt(luminance)*.3)*style;
      ctx.fillRect(this.width/2+x*scale,this.height/2-(y+.025)*scale,1.1,1.1);
    }
    ctx.restore();
  }
}
