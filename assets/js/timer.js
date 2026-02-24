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
