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
  renderer.toneMappingExposure = 1.55;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.domElement.className='dz-living-canvas';
  stage.appendChild(renderer.domElement);
  const segX=180, segY=22, width=12.6;
  const geometry=new THREE.BufferGeometry();
  const positions=new Float32Array((segX+1)*(segY+1)*3);
  const indices=[];
  for(let i=0;i<segX;i++)for(let j=0;j<segY;j++){
    let a=i*(segY+1)+j,b=(i+1)*(segY+1)+j;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(indices);
  const material=new THREE.MeshPhysicalMaterial({
    color:0x9d3156,metalness:0.12,roughness:0.085,
    transmission:0.72,thickness:0.9,ior:1.47,
    transparent:true,opacity:0.93,side:THREE.DoubleSide,
    clearcoat:1,clearcoatRoughness:0.045,
    specularIntensity:1.0,envMapIntensity:1.7,depthWrite:false
  });
  // Procedural studio environment for reflections; no external image assets.
  const envScene=new THREE.Scene();
  envScene.background=new THREE.Color(0x12060e);
  const makePanel=(color,x,y,z,sx,sy,rz=0)=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(sx,sy),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
    m.position.set(x,y,z);m.rotation.z=rz;envScene.add(m);
  };
  makePanel(0xffffff,-3.7,3,-3,1.0,8,.23);
  makePanel(0xffb8d1,4.3,1,-2,1.3,7,-.26);
  makePanel(0x7e173c,0,-4,-2,12,2);
  makePanel(0xffffff,0,4,-3,10,.25);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const env=pmrem.fromScene(envScene,0.08).texture;
  material.envMap=env;
  const mesh=new THREE.Mesh(geometry,material);
  scene.add(mesh);
  scene.add(new THREE.AmbientLight(0xffffff,1.5));
  const pink=new THREE.DirectionalLight(0xffb5d4,3.3);pink.position.set(-3,4,6);scene.add(pink);
  const white=new THREE.DirectionalLight(0xffffff,3);white.position.set(4,1,5);scene.add(white);
  function deform(t){
    for(let i=0;i<=segX;i++){
      const u=i/segX, x=(u-.5)*width;
      const center=0.78*Math.sin(u*Math.PI*3.0+.15)+.20*Math.sin(u*Math.PI*5.3-.7);
      const phase=u*Math.PI*2.5+.45*Math.sin(u*Math.PI*2)+t*.24;
      const twist=.86*Math.sin(phase)+.25*Math.sin(u*11-t*.19);
      for(let j=0;j<=segY;j++){
        const v=(j/segY-.5)*2;
        const idx=(i*(segY+1)+j)*3;
        const half=1.0+.17*Math.sin(u*Math.PI*2.2);
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
    camera.position.z=window.innerWidth<700?15.2:11.8;
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
  window.addEventListener('pagehide',()=>{running=false;observer.disconnect();env.dispose();pmrem.dispose();geometry.dispose();material.dispose();renderer.dispose()},{once:true});
}
