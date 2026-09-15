import React, { useEffect, useRef } from 'react';

export const MythicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas starfield & drifting celestial particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const parent = canvas.parentElement || document.body;
    let width = (canvas.width = parent.clientWidth || window.innerWidth || 800);
    let height = (canvas.height = parent.clientHeight || window.innerHeight || 600);

    const updateSize = () => {
      if (!canvas) return;
      const w = parent.clientWidth || window.innerWidth || 800;
      const h = parent.clientHeight || window.innerHeight || 600;
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        width = canvas.width = w;
        height = canvas.height = h;
      }
    };

    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(parent);
    window.addEventListener('resize', updateSize);

    // Generate stars & golden stardust particles
    interface Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      alpha: number;
      speedY: number;
      speedX: number;
      pulseSpeed: number;
      pulseOffset: number;
    }

    const starCount = Math.min(100, Math.floor((width * height) / 14000));
    const particles: Particle[] = [];

    const goldColors = [
      'rgba(245, 158, 11, ', // amber-500
      'rgba(251, 191, 36, ', // amber-400
      'rgba(217, 119, 6, ',  // amber-600
      'rgba(216, 180, 254, ', // purple-300
      'rgba(192, 132, 252, ', // purple-400
      'rgba(255, 237, 213, ', // orange-100
    ];

    for (let i = 0; i < starCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        speedY: -(Math.random() * 0.15 + 0.05), // gentle upward drift like temple incense/sparks
        speedX: (Math.random() - 0.5) * 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Render cosmic particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const dynamicAlpha = Math.max(
          0.1,
          p.alpha * (0.6 + 0.4 * Math.sin(tick * p.pulseSpeed + p.pulseOffset))
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${dynamicAlpha})`;
        ctx.shadowBlur = p.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0a0710]">
      {/* 1. Deep Cosmic Nebula Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a1a] via-[#120a16] to-[#08050e]" />

      {/* 2. Ethereal Nebula Clouds (Gold, Indigo, Violet) */}
      <div className="absolute -top-32 left-1/4 w-[750px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] transform-gpu -rotate-12" />
      <div className="absolute top-1/3 -right-32 w-[650px] h-[700px] bg-purple-900/15 rounded-full blur-[160px] transform-gpu" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[500px] bg-indigo-950/20 rounded-full blur-[150px] transform-gpu" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-amber-500/[0.04] rounded-full blur-[180px] pointer-events-none" />

      {/* 3. Subtle Ancient Astrolabe / Sacred Mandala Rings (Slowly spinning watermark) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[900px] opacity-[0.045] select-none pointer-events-none animate-[spin_240s_linear_infinite]">
        <svg viewBox="0 0 400 400" className="w-full h-full text-amber-300 fill-none stroke-current stroke-[0.75]">
          {/* Outer astronomical rings */}
          <circle cx="200" cy="200" r="190" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="175" />
          <circle cx="200" cy="200" r="160" strokeDasharray="12 4 2 4" />
          <circle cx="200" cy="200" r="135" />
          <circle cx="200" cy="200" r="100" strokeDasharray="6 6" />
          <circle cx="200" cy="200" r="60" />
          <circle cx="200" cy="200" r="25" />

          {/* Radiating 12-fold star rays & celestial markers */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="200"
              y1="200"
              x2={200 + 175 * Math.cos((deg * Math.PI) / 180)}
              y2={200 + 175 * Math.sin((deg * Math.PI) / 180)}
              strokeWidth="0.5"
            />
          ))}

          {/* Sacred geometry octagram overlay */}
          <polygon
            points="200,65 240,160 335,200 240,240 200,335 160,240 65,200 160,160"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
        </svg>
      </div>

      {/* 4. Canvas Particle Stardust Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      {/* 5. Mythical Corner Filigree Accents (Top left & Top right) */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400 fill-none stroke-current stroke-1">
          <path d="M0,0 L45,0 C30,15 15,30 0,45 Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M5,5 L60,5 C40,20 20,40 5,60 Z" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <line x1="0" y1="0" x2="80" y2="0" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="80" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none transform -scale-x-100">
        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400 fill-none stroke-current stroke-1">
          <path d="M0,0 L45,0 C30,15 15,30 0,45 Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M5,5 L60,5 C40,20 20,40 5,60 Z" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <line x1="0" y1="0" x2="80" y2="0" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="80" strokeWidth="2" />
        </svg>
      </div>

      {/* 6. Subtle Vignette Border */}
      <div className="absolute inset-0 ring-1 ring-inset ring-amber-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,3,9,0.7)_100%)] pointer-events-none" />
    </div>
  );
};
