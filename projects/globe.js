(function(){
  const c = document.getElementById('bgGlobe');
  if(!c) return;
  const ctx = c.getContext('2d');
  let dpr = window.devicePixelRatio || 1;
  let W, H, cx, cy, radius;
  function resize(){
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    c.style.width = W + 'px'; c.style.height = H + 'px';
    c.width = Math.max(1, Math.floor(W * dpr)); c.height = Math.max(1, Math.floor(H * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    radius = Math.min(W, H) * 0.36;
    cx = W/2 + W * 0.3; // shift globe a bit to the right
    cy = H - 0.7 * radius;
  }
  window.addEventListener('resize', resize);
  resize();

  const lonSteps = 36; const latSteps = 12;
  let angleY = 0; let angleX = 0; let glitchTimer = 0;
  const config = { speed: 0.006, tiltAmp: 0.18 };

  function project(x,y,z){
    const f = 0.9/(1 + z/(radius*2));
    return { x: cx + x * f, y: cy + y * f, z };
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // radial background
    const g = ctx.createRadialGradient(cx,cy,10,cx,cy,Math.max(W,H));
    g.addColorStop(0,'rgba(2,6,12,0.6)'); g.addColorStop(1,'rgba(0,0,0,0.95)');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

    // wireframe latitudes
    for(let latI=-latSteps; latI<=latSteps; latI++){
      const lat = (latI/latSteps) * (Math.PI/2);
      ctx.beginPath();
      for(let lonI=0; lonI<=lonSteps; lonI++){
        const lon = (lonI/ lonSteps) * Math.PI * 2;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        // rotate X then Y (tilt + spin)
        const ax = angleX;
        const ay = angleY;
        const x1 = x;
        const y1 = y * Math.cos(ax) - z * Math.sin(ax);
        const z1 = y * Math.sin(ax) + z * Math.cos(ax);
        const xr = x1 * Math.cos(ay) - z1 * Math.sin(ay);
        const zr = x1 * Math.sin(ay) + z1 * Math.cos(ay);
        const p = project(xr,y1,zr);
        let px = p.x, py = p.y;
        if(glitchTimer>0 && Math.random()<0.06) px += (Math.random()-0.5) * 40;
        if(lonI===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.strokeStyle = 'rgba(58,160,255,0.09)'; ctx.lineWidth = 1; ctx.stroke();
    }

    // wireframe longitudes
    for(let lonI=0; lonI<lonSteps; lonI+=3){
      const lon = (lonI/ lonSteps) * Math.PI * 2;
      ctx.beginPath();
      for(let latI=-latSteps; latI<=latSteps; latI++){
        const lat = (latI/latSteps) * (Math.PI/2);
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        const ax = angleX;
        const ay = angleY;
        const x1 = x;
        const y1 = y * Math.cos(ax) - z * Math.sin(ax);
        const z1 = y * Math.sin(ax) + z * Math.cos(ax);
        const xr = x1 * Math.cos(ay) - z1 * Math.sin(ay);
        const zr = x1 * Math.sin(ay) + z1 * Math.cos(ay);
        const p = project(xr,y1,zr);
        let px = p.x, py = p.y;
        if(glitchTimer>0 && Math.random()<0.05) px += (Math.random()-0.5) * 50;
        if(latI===-latSteps) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.strokeStyle = 'rgba(25,255,138,0.04)'; ctx.lineWidth = 1; ctx.stroke();
    }

    // occasional bright accent
    if(Math.random() < 0.02){
      ctx.beginPath(); const lat = (Math.random()-0.5) * (Math.PI/2);
      for(let lonI=0; lonI<=lonSteps; lonI++){
        const lon = (lonI/ lonSteps) * Math.PI * 2;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        const ax = angleX;
        const ay = angleY;
        const x1 = x;
        const y1 = y * Math.cos(ax) - z * Math.sin(ax);
        const z1 = y * Math.sin(ax) + z * Math.cos(ax);
        const xr = x1 * Math.cos(ay) - z1 * Math.sin(ay);
        const zr = x1 * Math.sin(ay) + z1 * Math.cos(ay);
        const p = project(xr,y1,zr);
        if(lonI===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
      }
      ctx.strokeStyle = 'rgba(58,200,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    }

    // scanline glitch flashes
    if(glitchTimer>0){
      for(let i=0;i<3;i++){
        const y = Math.random()*H; ctx.fillStyle = 'rgba(255,0,170,'+(0.02+Math.random()*0.06)+')'; ctx.fillRect(0,y,W,1+Math.random()*3);
      }
    }

    // update rotation angles
    angleY += config.speed; // continuous spin around Y
    // subtle oscillating tilt around X
    angleX = Math.sin(Date.now() * 0.0004) * config.tiltAmp;
    if(glitchTimer>0) glitchTimer = Math.max(0, glitchTimer-1);
    requestAnimationFrame(draw);
  }

  // periodic glitch bursts
  setInterval(()=>{ if(Math.random()<0.55) glitchTimer = 30 + Math.floor(Math.random()*60); }, 1800);
  draw();
})();
