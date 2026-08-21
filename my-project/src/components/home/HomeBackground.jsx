import React, { useEffect } from 'react';

export default function HomeBackground() {
  useEffect(() => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width,
      height,
      particles = [],
      animId;

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      const n = Math.min(80, Math.floor((width * height) / 12000));
      for (let i = 0; i < n; i++)
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.5 + 0.5,
        });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j],
            d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 130) * 0.18})`;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: 'linear-gradient(135deg,#050a14 0%,#0b1528 100%)',
      }}
    >
      <canvas id="particles-canvas" style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            background: 'radial-gradient(circle,rgba(89,102,40,0.13) 0%,transparent 70%)',
            top: '-25%',
            left: '-12%',
            animation: 'blob-float-1 26s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle,rgba(74,93,115,0.18) 0%,transparent 70%)',
            bottom: '-15%',
            right: '-12%',
            animation: 'blob-float-2 32s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
