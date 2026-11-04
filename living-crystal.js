// DERZKO Living Crystal: actual animated 3D surface, no animated raster texture.
const stage = document.querySelector('.dz-smoked-stage');
if (stage && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  start().catch(err => { console.error('DERZKO crystal failed:',err); stage.dataset.crystalStatus='error'; });
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
  const uvs=new Float32Array((segX+1)*(segY+1)*2);
  for(let i=0;i<=segX;i++)for(let j=0;j<=segY;j++){
    const k=(i*(segY+1)+j)*2;uvs[k]=i/segX;uvs[k+1]=j/segY;
  }
  for(let i=0;i<segX;i++)for(let j=0;j<segY;j++){
    let a=i*(segY+1)+j,b=(i+1)*(segY+1)+j;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(indices);
  geometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));
  // Clear crystal: nearly invisible interior, concentrated optical highlights.
  // A custom optical shader avoids the opaque pastel fill on mobile Safari.
  const material=new THREE.ShaderMaterial({
    transparent:true, side:THREE.DoubleSide, depthWrite:false,
    blending:THREE.NormalBlending,
    uniforms:{uTime:{value:0}},
    vertexShader:`varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vWorld;
      void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;
        vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);
        gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`precision highp float;
      varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vWorld;
      uniform float uTime;
      void main(){
        vec3 N=normalize(vN), V=normalize(vV);
        float ndv=abs(dot(N,V));
        float fres=pow(1.0-ndv,3.7);
        float d=min(vUv.y,1.0-vUv.y);
        // Crystal-clear core; precise bright perimeter and a narrow inner caustic.
        float edge=exp(-d*285.0);
        float bevel=exp(-d*73.0);
        float caustic=exp(-pow((d-.035)*105.0,2.0));
        vec3 R=reflect(-V,N);
        // Narrow elongated studio reflections instead of diffuse white blobs.
        float a=pow(max(dot(R,normalize(vec3(-.63,.48,.61))),0.0),105.0);
        float b=pow(max(dot(R,normalize(vec3(.72,-.22,.66))),0.0),120.0);
        float c=pow(max(dot(R,normalize(vec3(.14,.88,.46))),0.0),145.0);
        float streak=clamp(a*.95+b*.86+c*.56,0.0,1.0);
        float wine=clamp(b*.72+fres*.16+bevel*.10,0.0,1.0);
        vec3 silver=vec3(.91,.94,1.0);
        vec3 color=mix(silver,vec3(.65,.27,.42),wine*.32);
        color=mix(color,vec3(1.0,.98,1.0),clamp(edge*.86+streak*.62,0.0,1.0));
        float alpha=clamp(.009+fres*.37+edge*.79+bevel*.14+caustic*.065+streak*.31,.009,.86);
        gl_FragColor=vec4(color,alpha);
      }`
  });
  // Thin, physically shaped side facets follow the same animated edge curves.
  // They add a visible glass thickness without changing the ribbon silhouette.
  const edgeThickness=.085;
  const edgeGeometry=new THREE.BufferGeometry();
  const edgePositions=new Float32Array((segX+1)*2*2*3);
  const edgeIndices=[];
  for(let side=0;side<2;side++){
    const base=side*(segX+1)*2;
    for(let i=0;i<segX;i++){
      const a=base+i*2,b=a+2;
      edgeIndices.push(a,b,a+1,b,b+1,a+1);
    }
  }
  edgeGeometry.setAttribute('position',new THREE.BufferAttribute(edgePositions,3).setUsage(THREE.DynamicDrawUsage));
  edgeGeometry.setIndex(edgeIndices);
  const facetMaterial=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`varying vec3 vN; varying vec3 vV; varying float vX;
      void main(){vec4 w=modelMatrix*vec4(position,1.0);vX=position.x;
      vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);
      gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`precision highp float;
      varying vec3 vN; varying vec3 vV; varying float vX;
      void main(){
        vec3 N=normalize(vN),V=normalize(vV);
        float f=pow(1.0-abs(dot(N,V)),2.0);
        float glimmer=.5+.5*sin(vX*1.7);
        vec3 c=mix(vec3(.36,.14,.27),vec3(.96,.96,1.0),.65+f*.25);
        gl_FragColor=vec4(c,clamp(.12+f*.56+glimmer*.06,.0,.70));
      }`
  });
  const facetMesh=new THREE.Mesh(edgeGeometry,facetMaterial);
  facetMesh.renderOrder=2;
  scene.add(facetMesh);
  const mesh=new THREE.Mesh(geometry,material);
  scene.add(mesh);
  const backMaterial=material.clone();backMaterial.side=THREE.BackSide;
  backMaterial.opacity=.12;
  const backMesh=new THREE.Mesh(geometry,backMaterial);
  backMesh.position.z=-.075;
  scene.add(backMesh);
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
    // Sidewalls track the exact same front-surface vertices at both edges.
    for(let side=0;side<2;side++)for(let i=0;i<=segX;i++){
      const vIndex=i*(segY+1)+(side===0?0:segY);
      const src=vIndex*3, out=(side*(segX+1)*2+i*2)*3;
      edgePositions[out]=positions[src];edgePositions[out+1]=positions[src+1];edgePositions[out+2]=positions[src+2];
      edgePositions[out+3]=positions[src];edgePositions[out+4]=positions[src+1];edgePositions[out+5]=positions[src+2]-edgeThickness;
    }
    edgeGeometry.attributes.position.needsUpdate=true;
    edgeGeometry.computeVertexNormals();
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
  stage.classList.add('dz-3d-ready'); stage.dataset.crystalStatus='running';
  function frame(ms){
    if(!running)return;
    requestAnimationFrame(frame);
    if(!visible||document.hidden||ms-last<30)return;
    last=ms;material.uniforms.uTime.value=ms*.001;deform(ms*.001);renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
  window.addEventListener('pagehide',()=>{running=false;observer.disconnect();geometry.dispose();edgeGeometry.dispose();facetMaterial.dispose();material.dispose();backMaterial.dispose();renderer.dispose()},{once:true});
}
