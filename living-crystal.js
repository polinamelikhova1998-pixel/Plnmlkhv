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
  // Procedural studio light environment, reflected and refracted by physical glass.
  const ew=512,eh=256;
  const pixels=new Uint8Array(ew*eh*4);
  const soft=(x,y,cx,cy,sx,sy)=>Math.exp(-((x-cx)/sx)**8-((y-cy)/sy)**4);
  for(let y=0;y<eh;y++)for(let x=0;x<ew;x++){
    const u=x/ew,v=y/eh;
    const strip=1.00*soft(u,v,.18,.39,.032,.23)+.85*soft(u,v,.71,.42,.018,.32)+.58*soft(u,v,.48,.22,.16,.028);
    const wine=.15*soft(u,v,.89,.61,.16,.27);
    const k=(y*ew+x)*4;
    pixels[k]=Math.min(255,9+strip*224+wine*115);
    pixels[k+1]=Math.min(255,5+strip*210+wine*20);
    pixels[k+2]=Math.min(255,12+strip*229+wine*57);
    pixels[k+3]=255;
  }
  const envTexture=new THREE.DataTexture(pixels,ew,eh,THREE.RGBAFormat);
  envTexture.mapping=THREE.EquirectangularReflectionMapping;
  envTexture.colorSpace=THREE.SRGBColorSpace;
  envTexture.needsUpdate=true;
  const pmrem=new THREE.PMREMGenerator(renderer);
  const env=pmrem.fromEquirectangular(envTexture);
  scene.environment=env.texture;
  const material=new THREE.MeshPhysicalMaterial({
    color:0x713449,
    metalness:0,
    roughness:.055,
    transmission:.94,
    thickness:.85,
    ior:1.49,
    attenuationColor:new THREE.Color(0x5e1b36),
    attenuationDistance:2.8,
    envMapIntensity:2.1,
    clearcoat:1,
    clearcoatRoughness:.035,
    side:THREE.DoubleSide,
    transparent:false
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
    last=ms;deform(ms*.001);renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
  window.addEventListener('pagehide',()=>{running=false;observer.disconnect();geometry.dispose();material.dispose();envTexture.dispose();env.dispose();pmrem.dispose();renderer.dispose()},{once:true});
}
