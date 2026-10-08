"use client";

import { useEffect, useMemo, useRef } from "react";

type Particle = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  drift: number;
};

function makeParticles(count: number): Particle[] {
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: i,
      left: `${(i * 37 + 11) % 100}%`,
      top: `${(i * 53 + 7) % 100}%`,
      size: 2 + (i % 5),
      delay: -((i * 0.31) % 10),
      duration: 7 + (i % 8),
      drift: 50 + (i % 70),
    });
  }
  return list;
}

function FluidCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let t = 0;
    let last = 0;
    let hidden = document.hidden;
    const FPS = 20;
    const FRAME = 1000 / FPS;

    const blobs = Array.from({ length: 4 }, (_, i) => ({
      x: 0.2 + (i % 3) * 0.28,
      y: 0.25 + Math.floor(i / 3) * 0.4,
      r: 0.2 + (i % 2) * 0.06,
      sp: 0.12 + i * 0.03,
      ph: i * 1.7,
      cool: i % 2 === 1,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const paint = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const b of blobs) {
        const x = (b.x + Math.sin(t * b.sp + b.ph) * 0.1) * w;
        const y = (b.y + Math.cos(t * b.sp * 0.85 + b.ph) * 0.08) * h;
        const r = b.r * Math.min(w, h) * (1 + Math.sin(t * 0.5 + b.ph) * 0.08);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        if (b.cool) {
          g.addColorStop(0, "rgba(90, 200, 255, 0.16)");
          g.addColorStop(0.5, "rgba(40, 140, 200, 0.05)");
          g.addColorStop(1, "rgba(40, 140, 200, 0)");
        } else {
          g.addColorStop(0, "rgba(255, 210, 90, 0.2)");
          g.addColorStop(0.45, "rgba(255, 140, 40, 0.07)");
          g.addColorStop(1, "rgba(255, 140, 40, 0)");
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      if (hidden) {
        raf = 0;
        return;
      }
      if (now - last >= FRAME) {
        last = now;
        paint();
      }
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="site-bg__canvas" aria-hidden />;
}

export function AnimatedBg() {
  const particles = useMemo(() => makeParticles(18), []);

  return (
    <div className="site-bg" aria-hidden>
      <div className="site-bg__sky" />
      <FluidCanvas />
      <div className="site-bg__aurora site-bg__aurora--a" />
      <div className="site-bg__aurora site-bg__aurora--b" />
      <div className="site-bg__cloud" />
      <div className="site-bg__sun" />
      <div className="site-bg__halo" />
      <div className="site-bg__rays" />
      <div className="site-bg__beam site-bg__beam--a" />
      <div className="site-bg__beam site-bg__beam--b" />
      <div className="site-bg__orb site-bg__orb--a" />
      <div className="site-bg__orb site-bg__orb--b" />
      <div className="site-bg__dust" />
      <div className="site-bg__particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="site-bg__particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              ["--drift" as string]: `${p.drift}px`,
            }}
          />
        ))}
      </div>
      <div className="site-bg__vignette" />
      <div className="site-bg__noise" />
    </div>
  );
}
