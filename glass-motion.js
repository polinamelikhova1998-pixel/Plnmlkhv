/* DERZKO 10.0 — single-surface GPU glass motion, no sliced images */
(()=>{
 const stage=document.querySelector('.dz-smoked-stage'); if(!stage)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches)return;
 const canvas=document.createElement('canvas');canvas.className='dz-glass-webgl';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'default'});
 if(!gl)return;
 const vertex=`attribute vec2 aPos;attribute vec2 aUv;uniform float uTime;varying vec2 vUv;void main(){vUv=aUv;float x=aPos.x;float envelope=sin(3.14159265*(x*.5+.5));float sway=0.042*sin(uTime*.62+x*3.2)*envelope;float twist=0.023*cos(uTime*.46+x*5.0)*envelope;gl_Position=vec4(x, aPos.y+sway+twist*aPos.y,0.,1.);}`;
 const fragment=`precision highp float;varying vec2 vUv;uniform sampler2D uImage;uniform float uTime;void main(){vec4 c=texture2D(uImage,vUv);if(c.a<0.012)discard;float gleam=0.985+0.035*sin(uTime*.75+vUv.x*7.0);c.rgb*=gleam;gl_FragColor=c;}`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');}catch(e){return}
 gl.useProgram(program);
 const vertices=[],indices=[],cols=72,rows=24;
 for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){let u=x/cols,v=y/rows;vertices.push(u*2-1,1-v*2,u,v)}
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){let i=y*(cols+1)+x;indices.push(i,i+cols+1,i+1,i+1,i+cols+1,i+cols+2)}
 const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
 const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'aPos'),uv=gl.getAttribLocation(program,'aUv');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const img=new Image();img.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);stage.appendChild(canvas);stage.classList.add('dz-webgl-ready');start()};img.onerror=()=>{};img.src='smoked-glass-hd.png';
 let raf=0,active=true,visible=true;const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)start();else cancelAnimationFrame(raf)},{threshold:0});observer.observe(stage);
 function resize(){const r=stage.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}}
 const startAt=performance.now(),timeLoc=gl.getUniformLocation(program,'uTime');
 function frame(now){raf=0;if(!visible||!active||reduced.matches)return;resize();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(timeLoc,(now-startAt)/1000);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);raf=requestAnimationFrame(frame)}
 function start(){if(!raf&&visible&&active&&!reduced.matches)raf=requestAnimationFrame(frame)}
 document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active)start();else cancelAnimationFrame(raf)});
 reduced.addEventListener?.('change',()=>{if(reduced.matches){canvas.style.display='none';stage.classList.remove('dz-webgl-ready');cancelAnimationFrame(raf)}else{canvas.style.display='block';stage.classList.add('dz-webgl-ready');start()}});
})();
