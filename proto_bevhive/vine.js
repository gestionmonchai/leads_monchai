// Transparent source images supply silhouettes and light variations for every métier.
// The scene displays only sampled points, never the source images.

export async function sampleReference(image,count,{organic=false,maxHeight=3.3,maxWidth=2.5}={}){
  await image.decode();
  const canvas=document.createElement('canvas');
  const ratio=768/Math.max(image.naturalWidth,image.naturalHeight);
  canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));
  const context=canvas.getContext('2d',{willReadFrequently:true});
  if(!context)throw new Error('Lecture de la référence botanique indisponible.');
  context.drawImage(image,0,0,canvas.width,canvas.height);
  const {data}=context.getImageData(0,0,canvas.width,canvas.height);
  const candidates=[],weights=[];let total=0,minX=canvas.width,minY=canvas.height,maxX=0,maxY=0;
  // Retain fine root hairs and leaf edges, without sampling the transparent background.
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    const offset=(y*canvas.width+x)*4,alpha=data[offset+3]/255;
    if(alpha<.34)continue;
    const green=data[offset+1]>data[offset]*1.07;
    const luminance=(data[offset]*.2126+data[offset+1]*.7152+data[offset+2]*.0722)/255;
    // Preserve fine roots and let highlights/veins shape the distribution of dots.
    total+=alpha*(organic?(green?.70:1.8):1)*(.55+luminance*1.6);candidates.push(offset);weights.push(total);
    minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
  }
  if(!candidates.length)throw new Error('La référence botanique ne contient aucun point exploitable.');
  const vine=new Float32Array(count*4),colors=new Float32Array(count*3);
  let seed=1407;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const scale=Math.min(maxHeight/(maxY-minY+1),maxWidth/(maxX-minX+1)),centerX=(minX+maxX)/2,centerY=(minY+maxY)/2;
  for(let i=0;i<count;i++){
    const target=random()*total;let low=0,high=weights.length-1;
    while(low<high){const mid=(low+high)>>>1;if(weights[mid]<target)low=mid+1;else high=mid;}
    const offset=candidates[low],pixel=offset/4,x=pixel%canvas.width,y=Math.floor(pixel/canvas.width);
    const r=data[offset]/255,g=data[offset+1]/255,b=data[offset+2]/255;
    const px=(x+random()-.5-centerX)*scale,py=(centerY-y+random()-.5)*scale;
    const luminance=r*.2126+g*.7152+b*.0722;
    const depth=Math.sin(py*2.3+px*3)*.065+(luminance-.4)*.12;
    vine.set([px,py,depth,g>r*1.07?3:1],i*4);
    colors.set([r,g,b],i*3);
  }
  return {vine,colors,samples:candidates.length};
}
