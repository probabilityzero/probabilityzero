/* ===== DEEP TIME COUNTER ===== */
(function(){
  const el=document.getElementById('dtc');
  if(!el)return;
  const start=new Date('1998-01-01T00:00:00');
  function update(){
    const diff=Date.now()-start.getTime();
    const d=Math.floor(diff/86400000);
    const h=Math.floor((diff%86400000)/3600000);
    const m=Math.floor((diff%3600000)/60000);
    const s=Math.floor((diff%60000)/1000);
    el.textContent=String(d).padStart(4,'0')+':'+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }
  update();
  setInterval(update,1000);
})();

(function(){
  const el = document.getElementById('ctc');
  if (!el) return;
  function update(){
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    el.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
})();


/* ===== CURSOR TRAIL ===== */
(function(){
  const cur = document.getElementById('cur');
  let trails = [];
  for(let i=0;i<8;i++){
    const t = document.createElement('div');
    t.className='cursor-trail';
    t.style.opacity='0';
    document.body.appendChild(t);
    trails.push({el:t,x:0,y:0});
  }
  let mx=0,my=0;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    cur.style.left=(mx-4)+'px';
    cur.style.top=(my-4)+'px';
    cur.style.opacity='1';
  });
  function animTrails(){
    let px=mx,py=my;
    trails.forEach((t,i)=>{
      setTimeout(()=>{
        t.el.style.left=(px-4)+'px';
        t.el.style.top=(py-4)+'px';
        t.el.style.opacity=((8-i)/16)+'';
      },i*30);
    });
    requestAnimationFrame(animTrails);
  }
  animTrails();
})();
