const Charts = {
  drawLine(canvas, data, opts={}) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = opts.pad || 30;
    ctx.clearRect(0,0,W,H);
    if(!data||data.length===0){ctx.fillStyle='#ffffff20';ctx.fillRect(0,0,W,H);return;}
    const vals = data.map(d=>d.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max-min||1;
    const pts = data.map((d,i)=>({
      x: pad + (i/(data.length-1||1))*(W-pad*2),
      y: H - pad - ((d.value-min)/range)*(H-pad*2)
    }));
    // gradient fill
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, opts.color1||'rgba(79,156,249,0.4)');
    grad.addColorStop(1, 'rgba(79,156,249,0)');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H-pad);
    pts.forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.lineTo(pts[pts.length-1].x, H-pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    // line
    ctx.beginPath();
    pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.strokeStyle = opts.color||'#4f9cf9';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    // dots
    pts.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,4,0,Math.PI*2);
      ctx.fillStyle='#4f9cf9';
      ctx.fill();
      ctx.strokeStyle='#0a0e1a';
      ctx.lineWidth=2;
      ctx.stroke();
    });
  },
  drawBar(canvas, data, opts={}) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = 30, gap = 6;
    ctx.clearRect(0,0,W,H);
    if(!data||data.length===0) return;
    const max = Math.max(...data.map(d=>d.value))||1;
    const bw = (W - pad*2 - gap*(data.length-1)) / data.length;
    data.forEach((d,i)=>{
      const x = pad + i*(bw+gap);
      const bh = ((d.value/max)*(H-pad*2))||2;
      const y = H - pad - bh;
      const grad = ctx.createLinearGradient(0,y,0,H-pad);
      grad.addColorStop(0,opts.color||'#4f9cf9');
      grad.addColorStop(1,'#6b5ce7');
      ctx.beginPath();
      ctx.roundRect(x,y,bw,bh,4);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.fillStyle = '#ffffff60';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(d.label||'', x+bw/2, H-8);
    });
  }
};
