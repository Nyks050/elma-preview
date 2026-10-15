/* Animate the approved artwork itself. No replacement illustration or camera zoom. */
(() => {
  'use strict';
  const vertex = `attribute vec2 position;
    varying vec2 uv;
    void main(){uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision mediump float;
    varying vec2 uv;
    uniform sampler2D artwork;
    uniform float time;
    uniform float aspect;
    float region(vec2 p,vec2 center,vec2 radius){
      return 1.-smoothstep(.35,1.,length((p-center)/radius));
    }
    void main(){
      // Crop only the white presentation margin, keeping the approved composition.
      vec2 fitted=uv;
      float pictureAspect=1705./769.;
      if(aspect<pictureAspect){float scale=aspect/pictureAspect;fitted.x=uv.x*scale+(1.-scale)*.8;}
      else{fitted.y=(uv.y-.5)*pictureAspect/aspect+.5;}
      vec2 p=mix(vec2(36./1774.,55./887.),vec2(1741./1774.,824./887.),fitted);
      vec2 source=p;
      float wag=sin(time*6.4)*.065;
      vec2 pivot=vec2(.844,.355);
      vec2 delta=p-pivot;
      vec2 rotated=vec2(cos(wag)*delta.x-sin(wag)*delta.y,
                        sin(wag)*delta.x+cos(wag)*delta.y)+pivot;
      float tail=region(p,vec2(.881,.225),vec2(.074,.17));
      source+= (rotated-p)*tail;
      float breath=sin(time*1.65);
      float body=region(p,vec2(.771,.442),vec2(.108,.177));
      source.y+=breath*.0017*body;
      // A small paired sniff, with a quiet pause between cycles.
      float cycle=mod(time,5.5);
      float sniff=sin(cycle*6.283)*smoothstep(0.,.3,cycle)*(1.-smoothstep(1.7,2.2,cycle));
      float head=region(p,vec2(.637,.643),vec2(.116,.185));
      source.y+=sniff*.0034*head;
      source.x+=sniff*.0009*head;
      // Keep the ear roots attached while the tips gently lift and settle.
      float earBeat=sin(time*2.8);
      float leftEar=region(p,vec2(.566,.533),vec2(.042,.079));
      float rightEar=region(p,vec2(.713,.625),vec2(.046,.101));
      float leftTip=smoothstep(.455,.565,p.y);
      float rightTip=smoothstep(.505,.69,p.y);
      source.y+=earBeat*.010*leftEar*leftTip;
      source.x+=earBeat*.003*leftEar*leftTip;
      source.y+=sin(time*2.8-.4)*.012*rightEar*rightTip;
      source.x-=sin(time*2.8-.4)*.004*rightEar*rightTip;
      vec4 color=texture2D(artwork,source);
      float glint=pow(max(0.,sin(time*1.142-1.)),20.)*.17;
      float key=region(p,vec2(.540,.781),vec2(.009,.016));
      color.rgb+=vec3(glint*key);
      gl_FragColor=color;
    }`;

  window.elmaMountCityScene = function mountCityScene(scene) {
    if (!scene || scene.dataset.animatedArtwork) return;
    scene.dataset.animatedArtwork = '1';
    const image = scene.querySelector('img');
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0';
    scene.appendChild(canvas);
    const gl = canvas.getContext('webgl', {alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
    if (!gl) { canvas.remove(); return; }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const panel = scene.closest('[data-panel]');
    let frame=0, previous=0, elapsed=0, visible=false, ready=false, disposed=false, pageActive=true;
    let program, buffer, texture, timeLocation, aspectLocation, intersection, resize, panelObserver;
    function stop(){cancelAnimationFrame(frame);frame=0;previous=0;}
    function isActive(){return ready && visible && pageActive && !document.hidden && !reduced.matches && (!panel || panel.classList.contains('active'));}
    function hide(){pageActive=false;stop();}
    function show(){pageActive=true;sync();}
    function draw(time){
      const width=Math.max(1,Math.min(960,Math.round(scene.clientWidth*Math.min(devicePixelRatio||1,2))));
      const aspect=Math.max(1,scene.clientWidth)/Math.max(1,scene.clientHeight);
      const height=Math.max(1,Math.round(width/aspect));
      if(canvas.width!==width || canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
      gl.uniform1f(timeLocation,time);
      gl.uniform1f(aspectLocation,aspect);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
    function tick(now){
      frame=0;
      if(!scene.isConnected){dispose();return;}
      if(!isActive())return;
      if(!previous || now-previous>=1000/30){
        if(previous)elapsed+=Math.min((now-previous)/1000,.1);
        previous=now;draw(elapsed);
      }
      frame=requestAnimationFrame(tick);
    }
    function sync(){
      if(disposed)return;
      if(!scene.isConnected){dispose();return;}
      if(!isActive()){stop();if(ready){draw(0);canvas.style.opacity='1';}return;}
      if(!frame)frame=requestAnimationFrame(tick);
    }
    function dispose(){
      if(disposed)return;disposed=true;stop();
      intersection?.disconnect();resize?.disconnect();panelObserver?.disconnect();
      document.removeEventListener('visibilitychange',sync);
      window.removeEventListener('pagehide',hide);
      window.removeEventListener('pageshow',show);
      reduced.removeEventListener('change',sync);
      image.removeEventListener('load',initialize);
      if(texture)gl.deleteTexture(texture);
      if(buffer)gl.deleteBuffer(buffer);
      if(program)gl.deleteProgram(program);
      canvas.remove();
    }
    function compile(type,source){
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Artwork shader unavailable');}
      return shader;
    }
    function initialize(){
      if(ready || disposed || !image.naturalWidth)return;
      try{
        const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment);
        program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
        gl.deleteShader(vs);gl.deleteShader(fs);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Artwork program unavailable');
        gl.useProgram(program);
        buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
        const location=gl.getAttribLocation(program,'position');
        gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
        texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        timeLocation=gl.getUniformLocation(program,'time');
        aspectLocation=gl.getUniformLocation(program,'aspect');
        ready=true;draw(0);canvas.style.opacity='1';sync();
      }catch(_){dispose();}
    }
    intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});intersection.observe(scene);
    resize=new ResizeObserver(()=>{if(ready)draw(reduced.matches?0:elapsed);});resize.observe(scene);
    if(panel){panelObserver=new MutationObserver(sync);panelObserver.observe(panel,{attributes:true,attributeFilter:['class']});}
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('pagehide',hide);window.addEventListener('pageshow',show);
    reduced.addEventListener('change',sync);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();dispose();},{once:true});
    image.addEventListener('load',initialize,{once:true});
    if(image.complete)initialize();
  };
})();
