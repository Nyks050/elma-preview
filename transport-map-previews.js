(()=>{
  if(window.elmaRenderMapPreview)return;
  const NS='http://www.w3.org/2000/svg';
  const tile='https://tile.openstreetmap.org/';
  const dataURL='assets/amasya-transit-data.json?v=20260925-line6-last2235';
  window.elmaGetTransitData=()=>{
    if(window.elmaTransitData)return Promise.resolve(window.elmaTransitData);
    if(!window.elmaTransitDataPromise)window.elmaTransitDataPromise=fetch(dataURL)
      .then(response=>{if(!response.ok)throw Error('Hat verisi yüklenemedi');return response.json()})
      .then(data=>(window.elmaTransitData=data))
      .catch(error=>{window.elmaTransitDataPromise=null;throw error});
    return window.elmaTransitDataPromise;
  };
  window.elmaGetMapLibre=()=>{
    if(window.maplibregl)return Promise.resolve(window.maplibregl);
    if(window.elmaMapLibrePromise)return window.elmaMapLibrePromise;
    window.elmaMapLibrePromise=new Promise((resolve,reject)=>{
      if(!document.getElementById('elmaMapLibreCSS')){
        const css=document.createElement('link');css.id='elmaMapLibreCSS';css.rel='stylesheet';
        css.href='https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.css';document.head.appendChild(css);
      }
      const script=document.createElement('script');script.src='https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.js';
      script.onload=()=>window.maplibregl?resolve(window.maplibregl):reject(Error('MapLibre'));
      script.onerror=()=>reject(Error('MapLibre'));document.head.appendChild(script);
    }).catch(error=>{window.elmaMapLibrePromise=null;throw error});
    return window.elmaMapLibrePromise;
  };
  function project(lat,lng,zoom){
    const scale=256*2**zoom,sin=Math.sin(lat*Math.PI/180);
    return{x:(lng+180)/360*scale,y:(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*scale};
  }
  function node(name,attributes){
    const element=document.createElementNS(NS,name);
    for(const [key,value] of Object.entries(attributes))element.setAttribute(key,String(value));
    return element;
  }
  function render(element,points,stops=[]){
    if(!element?.isConnected||!Array.isArray(points)||points.length<2)return;
    const width=Math.max(element.clientWidth,120),height=Math.max(element.clientHeight,70);
    const lat=points.map(point=>point[0]),lng=points.map(point=>point[1]);
    const south=Math.min(...lat),north=Math.max(...lat),west=Math.min(...lng),east=Math.max(...lng);
    let zoom=15;
    while(zoom>3){
      const nw=project(north,west,zoom),se=project(south,east,zoom);
      if(se.x-nw.x<=width-27&&se.y-nw.y<=height-24)break;
      zoom--;
    }
    const nw=project(north,west,zoom),se=project(south,east,zoom);
    const centerX=(nw.x+se.x)/2,centerY=(nw.y+se.y)/2;
    const svg=node('svg',{viewBox:`0 0 ${width} ${height}`,'aria-hidden':'true',preserveAspectRatio:'none'});
    svg.style.cssText='display:block;width:100%;height:100%;background:#edf0eb';
    const firstX=Math.floor((centerX-width/2)/256),lastX=Math.floor((centerX+width/2)/256);
    const firstY=Math.floor((centerY-height/2)/256),lastY=Math.floor((centerY+height/2)/256);
    for(let y=firstY;y<=lastY;y++)for(let x=firstX;x<=lastX;x++){
      const image=node('image',{href:`${tile}${zoom}/${x}/${y}.png`,x:x*256-centerX+width/2,y:y*256-centerY+height/2,width:256,height:256});
      svg.appendChild(image);
    }
    const xy=point=>{const p=project(point[0],point[1],zoom);return[(p.x-centerX+width/2).toFixed(1),(p.y-centerY+height/2).toFixed(1)]};
    const stride=Math.max(1,Math.floor(points.length/400));
    const sampled=points.filter((_,i)=>i%stride===0);
    if(sampled[sampled.length-1]!==points[points.length-1])sampled.push(points[points.length-1]);
    const d=sampled.map((point,i)=>{const [x,y]=xy(point);return`${i?'L':'M'}${x} ${y}`}).join(' ');
    svg.appendChild(node('path',{d,fill:'none',stroke:'#fff','stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round'}));
    svg.appendChild(node('path',{d,fill:'none',stroke:'#111','stroke-width':3.5,'stroke-linecap':'round','stroke-linejoin':'round'}));
    if(stops.length){
      const stride=Math.max(1,Math.ceil(stops.length/28));
      stops.forEach((stop,i)=>{if(i%stride)return;const [x,y]=xy([stop.lat,stop.lng]);svg.appendChild(node('circle',{cx:x,cy:y,r:2.5,fill:'#fff',stroke:'#111','stroke-width':1.2}))});
    }else for(const point of [points[0],points[points.length-1]]){
      const [x,y]=xy(point);svg.appendChild(node('circle',{cx:x,cy:y,r:5,fill:'#fff',stroke:'#111','stroke-width':2}));
    }
    const credit=node('text',{x:width-4,y:height-4,'text-anchor':'end','font-size':8,fill:'#111',stroke:'#fff','stroke-width':2,'paint-order':'stroke'});
    credit.textContent='© OpenStreetMap';svg.appendChild(credit);
    element.replaceChildren(svg);
  }
  window.elmaRenderMapPreview=render;
})();
