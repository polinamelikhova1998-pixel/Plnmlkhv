(()=>{
 const stage=document.querySelector('.dz-smoked-stage');
 const canvas=stage?.querySelector('.dz-glass-canvas');
 if(!stage||!canvas||!window.requestAnimationFrame||!canvas.getContext)return;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(reduce.matches)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const img=new Image();img.src='smoked-glass-hd.png';
 let w=0,h=0,dpr=1,visible=true,active=true,frame=0;
 function resize(){const rect=stage.getBoundingClientRect();w=rect.width;h=rect.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 function draw(ms){if(!active)return;requestAnimationFrame(draw);if(!visible||document.hidden||!img.complete||!img.naturalWidth)return;
 // Frame limit around 30fps for mobile battery and smooth motion.
 if(ms-frame<30)return;frame=ms;
 ctx.clearRect(0,0,w,h);
 const t=ms/1000;
 const slices=100, sw=img.naturalWidth/slices;
 // Smooth bending across the ribbon, including subtle local vertical stretching.
 for(let i=0;i<slices;i++){
  const u=i/slices, x=u*w, width=w/slices+1.25;
  const wave=Math.sin(u*7.4-t*.72)*4.5+Math.sin(u*12.5+t*.47)*2.2;
  const sway=Math.sin(t*.5)*2;
  const stretch=1+0.018*Math.sin(u*8.8-t*.62);
  const dh=h*stretch;
  ctx.drawImage(img,i*sw,0,sw+1,img.naturalHeight,x,wave+sway+(h-dh)/2,width,dh);
 }
 }
 img.onload=()=>{resize();stage.classList.add('dz-motion-ready');requestAnimationFrame(draw)};
 img.onerror=()=>{stage.classList.remove('dz-motion-ready')};
 if(img.complete&&img.naturalWidth)img.onload();
 window.addEventListener('resize',resize,{passive:true});
 if('ResizeObserver'in window)new ResizeObserver(resize).observe(stage);
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{rootMargin:'150px'}).observe(stage);
 reduce.addEventListener?.('change',e=>{if(e.matches){active=false;stage.classList.remove('dz-motion-ready')}else if(!active){active=true;stage.classList.add('dz-motion-ready');requestAnimationFrame(draw)}});
})();