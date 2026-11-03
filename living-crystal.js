// DERZKO Living Crystal: actual animated 3D surface, no animated raster texture.
const stage = document.querySelector('.dz-smoked-stage');
if (stage && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  start().catch(err => console.warn('Living Crystal fallback:', err));
}
async function start() {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, 0, 11.8);
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, powerPreference:'high-performance'});
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.domElement.className='dz-living-canvas';
  stage.appendChild(renderer.domElement);
  const segX=220, segY=28, width=15.8;
  const geometry=new THREE.BufferGeometry();
  const positions=new Float32Array((segX+1)*(segY+1)*3);
  const indices=[];
  for(let i=0;i<segX;i++)for(let j=0;j<segY;j++){
    let a=i*(segY+1)+j,b=(i+1)*(segY+1)+j;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(indices);
  // Translucent crystal with angle-dependent Fresnel rim and studio reflections.
  const material=new THREE.ShaderMaterial({
    transparent:true, side:THREE.DoubleSide, depthWrite:false,
    uniforms:{uTime:{value:0}},
    vertexShader:`
      varying vec3 vNormal; varying vec3 vView; varying vec2 vUv;
      void main(){
        vUv=uv;
        vec4 world=modelMatrix*vec4(position,1.);
        vNormal=normalize(mat3(modelMatrix)*normal);
        vView=normalize(cameraPosition-world.xyz);
        gl_Position=projectionMatrix*viewMatrix*world;
      }`,
    fragmentShader:`
      precision highp float;
      varying vec3 vNormal; varying vec3 vView; varying vec2 vUv;
      uniform float uTime;
      void main(){
        vec3 N=normalize(vNormal);
        vec3 V=normalize(vView);
        vec3 R=reflect(-V,N);
        float facing=abs(dot(N,V));
        float fres=pow(1.0-facing,3.1);
        float borderDist=1.0-abs(vUv.y*2.0-1.0);
        // Razor-thin optical rim with a second softer internal reflection.
        float rim=exp(-borderDist*145.0);
        float innerRim=exp(-borderDist*28.0);
        float bandA=pow(max(dot(R,normalize(vec3(-0.68,0.25,0.68))),0.0),34.0);
        float bandB=pow(max(dot(R,normalize(vec3(0.78,-0.18,0.62))),0.0),48.0);
        float bandC=pow(max(dot(R,normalize(vec3(0.05,0.93,0.36))),0.0),65.0);
        float studio=bandA*.80+bandB*.72+bandC*.36;
        // Restrained wine-colored volume with elongated studio light streaks.
        vec3 smoke=vec3(.105,.025,.064);
        vec3 wine=vec3(.37,.078,.18);
        vec3 silver=vec3(.99,.88,.94);
        float glassLight=clamp(fres*.75+innerRim*.38+studio*.82,0.0,1.0);
        vec3 color=mix(smoke,wine,clamp(.25+fres*.44+studio*.28,0.0,1.0));
        color=mix(color,silver,clamp(glassLight*.65+rim*.94,0.0,1.0));
        float alpha=clamp(.095+fres*.46+innerRim*.24+studio*.28+rim*.50,.08,.95);
        gl_FragColor=vec4(color,alpha);
      }`
  });
  const mesh=new THREE.Mesh(geometry,material);
  scene.add(mesh);
  scene.add(new THREE.AmbientLight(0xffffff,0.25));
  const pink=new THREE.DirectionalLight(0xffb5d4,0.65);pink.position.set(-3,4,6);scene.add(pink);
  const white=new THREE.DirectionalLight(0xffffff,0.85);white.position.set(4,1,5);scene.add(white);
  function deform(t){
    for(let i=0;i<=segX;i++){
      const u=i/segX, x=(u-.5)*width;
      const center=0.78*Math.sin(u*Math.PI*3.0+.15)+.20*Math.sin(u*Math.PI*5.3-.7);
      const phase=u*Math.PI*2.5+.45*Math.sin(u*Math.PI*2)+t*.24;
      const twist=1.48*Math.sin(phase)+.42*Math.sin(u*11-t*.19);
      for(let j=0;j<=segY;j++){
        const v=(j/segY-.5)*2;
        const idx=(i*(segY+1)+j)*3;
        const half=1.18+.20*Math.sin(u*Math.PI*2.2);
        positions[idx]=x;
        positions[idx+1]=center+v*half*Math.cos(twist)+.07*Math.sin(t*.43+u*8);
        positions[idx+2]=v*half*Math.sin(twist)+.20*Math.sin(u*9+t*.26);
      }
    }
    geometry.attributes.position.needsUpdate=true;
    geometry.computeVertexNormals();
  }
  let running=true,visible=true,last=0;
  const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting},{rootMargin:'200px'});
  observer.observe(stage);
  function resize(){
    const w=stage.clientWidth,h=stage.clientHeight;
    if(!w||!h)return;
    camera.aspect=w/h;
    // Fit horizontal span to viewport, with both ribbon ends extending beyond its edges.
    const fov=THREE.MathUtils.degToRad(camera.fov);
    const desiredVisibleWidth=width*.62;
    camera.position.z=desiredVisibleWidth/(2*Math.tan(fov/2)*camera.aspect);
    camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  }
  window.addEventListener('resize',resize,{passive:true});resize();deform(0);
  renderer.render(scene,camera);
  stage.classList.add('dz-3d-ready');
  function frame(ms){
    if(!running)return;
    requestAnimationFrame(frame);
    if(!visible||document.hidden||ms-last<30)return;
    last=ms;material.uniforms.uTime.value=ms*.001;deform(ms*.001);renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
  window.addEventListener('pagehide',()=>{running=false;observer.disconnect();geometry.dispose();material.dispose();renderer.dispose()},{once:true});
}
