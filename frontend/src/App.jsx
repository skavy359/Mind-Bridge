import { useState, useEffect, useRef, useMemo } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
};
import { Download, Smartphone, Database, Lock, Zap, Cloud, BookOpen, Users, Share2, Github, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";

const screenshots = [
  "/images/ss1.png",
  "/images/ss2.png",
  "/images/ss3.png",
  "/images/ss4.png",
  "/images/ss5.png",
  "/images/ss6.png",
];

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", handleMouse);

    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.3,
      baseA: Math.random() * 0.4 + 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particlesRef.current.forEach(p => {
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const glow = dist < 200 ? 0.6 : p.baseA;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,157,${glow})`;
        ctx.fill();
      });

      const ps = particlesRef.current;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(0,255,157,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} style={{
    position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.6,
  }} />;
};

const ScrollReveal = ({ children, delay = 0, direction = "up", style = {} }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const transforms = {
    up: "translateY(60px)",
    down: "translateY(-60px)",
    left: "translateX(-60px)",
    right: "translateX(60px)",
    scale: "scale(0.85)",
  };

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) translateX(0) scale(1)" : transforms[direction],
      transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
};

const TypeWriter = ({ text, delay = 0, speed = 30, style = {} }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setStarted(true), delay); obs.unobserve(el); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let idx = 0;
    const iv = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [started, text, speed]);

  return (
    <span ref={ref} style={style}>
      {displayed}
      {started && displayed.length < text.length && (
        <span style={{ animation: "blink 0.6s step-end infinite", color: "var(--primary)" }}>▌</span>
      )}
    </span>
  );
};

const AnimatedCounter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          obs.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const StudentIllustration = () => (
  <div style={{ animation: "heroFloat 5s ease-in-out infinite" }}>
    <svg viewBox="0 0 200 280" width="180" height="252" style={{
      filter: "drop-shadow(0 0 30px rgba(0,255,157,0.2))"
    }}>
      <circle cx="100" cy="55" r="30" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.8">
        <animate attributeName="r" values="30;31;30" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="50" r="2.5" fill="var(--primary)" opacity="0.7" />
      <circle cx="110" cy="50" r="2.5" fill="var(--primary)" opacity="0.7" />
      <path d="M88 65 Q100 75 112 65" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.6" />
      <line x1="100" y1="85" x2="100" y2="170" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />
      <path d="M100 120 Q60 100 50 110" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.5">
        <animate attributeName="d" values="M100 120 Q60 100 50 110;M100 120 Q55 95 45 105;M100 120 Q60 100 50 110" dur="4s" repeatCount="indefinite" />
      </path>
      <path d="M100 120 Q140 100 155 110" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.5" />
      <rect x="140" y="100" width="25" height="18" rx="3" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.35">
        <animate attributeName="opacity" values="0.35;0.6;0.35" dur="2s" repeatCount="indefinite" />
      </rect>
      <line x1="100" y1="170" x2="70" y2="260" stroke="var(--primary)" strokeWidth="2" opacity="0.4" />
      <line x1="100" y1="170" x2="130" y2="260" stroke="var(--primary)" strokeWidth="2" opacity="0.4" />
      <path d="M65 40 L100 25 L135 40 L100 55 Z" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.25" />
    </svg>
  </div>
);

const MiniStickman = ({ pose = "wave", size = 60, opacity = 0.12, glowSize = 15 }) => {
  const poses = {
    study: (
      <>
        <circle cx="50" cy="20" r="12" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
        <line x1="50" y1="32" x2="50" y2="65" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M50 45 Q30 50 25 40" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <path d="M50 45 Q70 50 75 40" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <line x1="50" y1="65" x2="35" y2="90" stroke="var(--primary)" strokeWidth="1.5" />
        <line x1="50" y1="65" x2="65" y2="90" stroke="var(--primary)" strokeWidth="1.5" />
        <rect x="62" y="34" width="16" height="12" rx="2" fill="none" stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
      </>
    ),
    walk: (
      <>
        <circle cx="50" cy="20" r="12" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
        <line x1="50" y1="32" x2="50" y2="65" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M50 45 Q30 35 22 42" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <path d="M50 45 Q70 38 78 45" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <path d="M50 65 Q35 78 28 92" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <path d="M50 65 Q65 78 72 92" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
      </>
    ),
    wave: (
      <>
        <circle cx="50" cy="20" r="12" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
        <line x1="50" y1="32" x2="50" y2="65" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M50 45 Q30 50 25 40" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <path d="M50 45 Q70 30 78 18" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <line x1="50" y1="65" x2="35" y2="90" stroke="var(--primary)" strokeWidth="1.5" />
        <line x1="50" y1="65" x2="65" y2="90" stroke="var(--primary)" strokeWidth="1.5" />
      </>
    ),
    think: (
      <>
        <circle cx="50" cy="20" r="12" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
        <line x1="50" y1="32" x2="50" y2="65" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M50 45 Q35 35 38 18" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <path d="M50 45 Q68 55 72 62" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <line x1="50" y1="65" x2="38" y2="90" stroke="var(--primary)" strokeWidth="1.5" />
        <line x1="50" y1="65" x2="62" y2="90" stroke="var(--primary)" strokeWidth="1.5" />
        <text x="60" y="12" fill="var(--primary)" fontSize="14" opacity="0.6">?</text>
      </>
    ),
    celebrate: (
      <>
        <circle cx="50" cy="20" r="12" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M44 17 Q50 24 56 17" stroke="var(--primary)" strokeWidth="1" fill="none" opacity="0.6" />
        <line x1="50" y1="32" x2="50" y2="65" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M50 42 Q25 25 20 12" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <path d="M50 42 Q75 25 80 12" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
        <line x1="50" y1="65" x2="35" y2="88" stroke="var(--primary)" strokeWidth="1.5" />
        <line x1="50" y1="65" x2="65" y2="88" stroke="var(--primary)" strokeWidth="1.5" />
        <text x="12" y="10" fill="var(--primary)" fontSize="10" opacity="0.4">✦</text>
        <text x="78" y="8" fill="var(--primary)" fontSize="8" opacity="0.3">✦</text>
      </>
    ),
  };

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{
      filter: `drop-shadow(0 0 ${glowSize}px rgba(0,255,157,0.4))`,
      opacity,
    }}>
      {poses[pose]}
    </svg>
  );
};

const GlowingStickmen = () => {
  const stickmen = [
    { pose: "wave", x: "5%", y: "25%", size: 55, opacity: 0.08, speed: 7, delay: 0 },
    { pose: "study", x: "92%", y: "35%", size: 50, opacity: 0.06, speed: 9, delay: 1 },
    { pose: "think", x: "8%", y: "55%", size: 45, opacity: 0.07, speed: 8, delay: 2 },
    { pose: "celebrate", x: "90%", y: "65%", size: 50, opacity: 0.09, speed: 6, delay: 0.5 },
    { pose: "walk", x: "15%", y: "80%", size: 40, opacity: 0.06, speed: 10, delay: 1.5 },
    { pose: "wave", x: "85%", y: "15%", size: 48, opacity: 0.07, speed: 7.5, delay: 3 },
    { pose: "think", x: "3%", y: "92%", size: 42, opacity: 0.05, speed: 11, delay: 2.5 },
    { pose: "celebrate", x: "95%", y: "88%", size: 45, opacity: 0.06, speed: 8.5, delay: 1.8 },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {stickmen.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: s.x, top: s.y,
          animation: `stickFloat ${s.speed}s ease-in-out ${s.delay}s infinite alternate`,
          transition: "all 0.5s ease",
        }}>
          <MiniStickman pose={s.pose} size={s.size} opacity={s.opacity} />
        </div>
      ))}
    </div>
  );
};
const GlowCard = ({ children, style = {}, glowColor = "0,255,157" }) => {
  const ref = useRef(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setGlow(g => ({ ...g, active: false }))}
      className="ultra-glass grain"
      style={{
        position: "relative", padding: "35px 30px", overflow: "hidden",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
        transform: glow.active ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: glow.active
          ? `0 20px 60px rgba(${glowColor},0.15), 0 0 0 1px rgba(${glowColor},0.3)`
          : "0 8px 32px rgba(0,0,0,0.8)",
        ...style,
      }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(${glowColor},${glow.active ? 0.08 : 0}), transparent 60%)`,
        transition: "opacity 0.3s", opacity: glow.active ? 1 : 0,
      }} />
      <div className="hud-corner corner-tl" />
      <div className="hud-corner corner-tr" />
      <div className="hud-corner corner-bl" />
      <div className="hud-corner corner-br" />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
};

const MagneticButton = ({ children, style }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div ref={ref}
      onMouseMove={(e) => {
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        setPos({ x: (e.clientX - (left + width / 2)) * 0.15, y: (e.clientY - (top + height / 2)) * 0.15 });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)",
        display: "inline-block", ...style,
      }}
    >{children}</div>
  );
};

const FeatureIcon = ({ type }) => {
  const icons = {
    notes: (
      <svg viewBox="0 0 60 60" width="50" height="50">
        <rect x="12" y="8" width="36" height="44" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2">
          <animate attributeName="strokeDashoffset" from="160" to="0" dur="1.5s" fill="freeze" />
          <animate attributeName="strokeDasharray" from="0 160" to="160 0" dur="1.5s" fill="freeze" />
        </rect>
        <line x1="20" y1="20" x2="40" y2="20" stroke="var(--primary)" strokeWidth="1.5" opacity="0.5">
          <animate attributeName="x2" from="20" to="40" dur="0.8s" begin="0.5s" fill="freeze" />
        </line>
        <line x1="20" y1="28" x2="36" y2="28" stroke="var(--primary)" strokeWidth="1.5" opacity="0.4" />
        <line x1="20" y1="36" x2="30" y2="36" stroke="var(--primary)" strokeWidth="1.5" opacity="0.3" />
      </svg>
    ),
    groups: (
      <svg viewBox="0 0 60 60" width="50" height="50">
        <circle cx="20" cy="22" r="8" fill="none" stroke="var(--primary)" strokeWidth="2">
          <animate attributeName="r" values="8;9;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="22" r="8" fill="none" stroke="var(--primary)" strokeWidth="2">
          <animate attributeName="r" values="8;9;8" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="42" r="8" fill="none" stroke="var(--primary)" strokeWidth="2">
          <animate attributeName="r" values="8;9;8" dur="2s" begin="1s" repeatCount="indefinite" />
        </circle>
        <line x1="26" y1="27" x2="34" y2="37" stroke="var(--primary)" strokeWidth="1" opacity="0.3" />
        <line x1="34" y1="27" x2="26" y2="37" stroke="var(--primary)" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
    sync: (
      <svg viewBox="0 0 60 60" width="50" height="50">
        <circle cx="30" cy="30" r="18" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="8s" repeatCount="indefinite" />
        </circle>
        <path d="M22 30 L30 22 L38 30" stroke="var(--primary)" strokeWidth="2" fill="none" />
        <path d="M22 34 L30 42 L38 34" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
    ),
    secure: (
      <svg viewBox="0 0 60 60" width="50" height="50">
        <rect x="16" y="24" width="28" height="24" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <path d="M22 24 V18 A8 8 0 0 1 38 18 V24" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <circle cx="30" cy="36" r="3" fill="var(--primary)" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    mobile: (
      <svg viewBox="0 0 60 60" width="50" height="50">
        <rect x="18" y="6" width="24" height="48" rx="5" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <line x1="18" y1="14" x2="42" y2="14" stroke="var(--primary)" strokeWidth="1" opacity="0.3" />
        <line x1="18" y1="46" x2="42" y2="46" stroke="var(--primary)" strokeWidth="1" opacity="0.3" />
        <circle cx="30" cy="50" r="2" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.5" />
        <rect x="22" y="18" width="16" height="24" rx="2" fill="rgba(0,255,157,0.05)" stroke="none">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
        </rect>
      </svg>
    ),
    brain: (
      <svg viewBox="0 0 60 60" width="50" height="50">
        <path d="M30 12 C38 12 44 18 44 26 C44 32 40 36 36 38 C34 39 33 41 33 43 C33 45 31 47 29 47 C27 47 25 45 25 43 C25 41 24 39 22 38 C18 36 14 32 14 26 C14 18 20 12 28 12" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <line x1="30" y1="12" x2="30" y2="35" stroke="var(--primary)" strokeWidth="1" opacity="0.4" />
        <circle cx="30" cy="52" r="2" fill="var(--primary)" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  };
  return icons[type] || null;
};

const GodStickman = () => {
  return (
    <div style={{
      position: "relative",
      display: "inline-block",
      zIndex: 10,
      filter: "drop-shadow(0 0 20px rgba(0,255,157,0.4))"
    }}>
      <div style={{
        position: "absolute", top: "20%", left: "50%",
        transform: "translateX(-50%)", width: "200px", height: "200px",
        zIndex: 0, opacity: 0.3
      }}>
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) - 90;
          return (
            <div key={i} style={{
              position: "absolute", top: "0", left: "50%",
              width: "1px", height: "120px",
              background: `linear-gradient(180deg, rgba(0,255,157,${0.15 - i * 0.01}), transparent 80%)`,
              transformOrigin: "top center",
              transform: `translateX(-50%) rotate(${angle}deg)`,
              filter: "blur(2px)",
              animation: "divineGlowPulse 4s ease-in-out infinite alternate"
            }} />
          );
        })}
      </div>

      <div style={{
        position: "absolute",
        top: "-40px",
        right: "-100px",
        background: "rgba(0,255,157,0.1)",
        border: "1px solid var(--primary)",
        padding: "8px 12px",
        borderRadius: "15px 15px 15px 0",
        backdropFilter: "blur(10px)",
        color: "var(--primary)",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: "bold",
        whiteSpace: "nowrap",
        animation: "heroFloat 3s ease-in-out infinite",
        boxShadow: "0 0 20px rgba(0,255,157,0.2)"
      }}>
        Mind-Bridge !! ⚡
      </div>

      <svg viewBox="0 0 220 320" width="140" height="180">
        <ellipse cx="110" cy="35" rx="45" ry="12" fill="none"
          stroke="var(--primary)" strokeWidth="2" opacity="0.8"
          style={{ animation: "haloSpin 4s linear infinite" }} />
        <ellipse cx="110" cy="35" rx="38" ry="15" fill="none"
          stroke="var(--primary)" strokeWidth="1" opacity="0.4"
          style={{ animation: "haloSpin 6s linear infinite reverse" }} />

        <circle cx="110" cy="70" r="28" fill="rgba(2,2,2,0.8)" stroke="var(--primary)" strokeWidth="2" />
        <path d="M100 65 Q110 70 120 65" stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M102 82 Q110 88 118 82" stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M110 100 L65 280 L155 280 Z"
          fill="rgba(0,255,157,0.05)" stroke="var(--primary)" strokeWidth="2" opacity="0.4" />
        <path d="M110 100 L90 260" stroke="var(--primary)" strokeWidth="1" opacity="0.2" />
        <path d="M110 100 L130 260" stroke="var(--primary)" strokeWidth="1" opacity="0.2" />

        <path d="M85 130 Q45 120 25 90"
          stroke="var(--primary)" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"
          style={{ animation: "armGesture 3s ease-in-out infinite alternate" }} />
        <path d="M135 130 Q175 120 195 90"
          stroke="var(--primary)" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"
          style={{ animation: "armGesture 3s ease-in-out 0.5s infinite alternate" }} />
      </svg>
    </div>
  );
};

const Carousel = () => {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = () => setSlide(p => (p + 1) % screenshots.length);
  const prev = () => setSlide(p => (p === 0 ? screenshots.length - 1 : p - 1));

  useEffect(() => { if (paused) return; const t = setInterval(next, 3600); return () => clearInterval(t); }, [paused]);
  useEffect(() => {
    const fn = e => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "22px" }}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          position: "relative",
          background: "linear-gradient(160deg,#000c1a,#00050f)",
          borderRadius: "50px", padding: "12px",
          border: "1px solid rgba(26,127,196,0.5)",
          boxShadow: "0 0 80px rgba(26,127,196,0.22),0 0 200px rgba(26,127,196,0.07),inset 0 0 40px rgba(0,0,0,0.9)",
        }}>
        <div style={{
          position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)",
          width: "68px", height: "7px", borderRadius: "4px",
          background: "rgba(26,127,196,0.3)", zIndex: 5,
        }} />
        <div style={{ width: "340px", height: "680px", borderRadius: "42px", overflow: "hidden", background: "#000", position: "relative" }}>
          {screenshots.map((src, i) => (
            <img key={i} src={src} alt={`App screen ${i + 1}`}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                opacity: slide === i ? 1 : 0, transition: "opacity 0.9s ease",
              }}
              onError={e => e.currentTarget.style.display = "none"}
            />
          ))}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.025) 0px,rgba(0,0,0,0.025) 1px,transparent 1px,transparent 3px)",
          }} />
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(145deg,rgba(80,180,255,0.08) 0%,transparent 55%,rgba(201,100,0,0.05) 100%)",
          }} />
        </div>
        {[{ top: "140px", h: "78px" }, { top: "238px", h: "56px" }].map((b, i) => (
          <div key={i} style={{
            position: "absolute", right: "-6px", top: b.top,
            width: "4px", height: b.h, background: "rgba(26,127,196,0.28)", borderRadius: "2px",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(26,127,196,0.45)", padding: 0, lineHeight: 0 }}>
          <ChevronLeft size={16} />
        </button>
        {screenshots.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} style={{
            height: "4px", width: slide === i ? "28px" : "4px", borderRadius: "2px",
            border: "none", cursor: "pointer", padding: 0,
            background: slide === i ? "linear-gradient(90deg,#1a7fc4,#38b8f8)" : "rgba(255,255,255,0.12)",
            transition: "all 0.35s ease",
          }} />
        ))}
        <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(26,127,196,0.45)", padding: 0, lineHeight: 0 }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handle = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, height: "3px", zIndex: 200,
      width: `${progress}%`, background: "var(--primary)",
      boxShadow: "0 0 15px rgba(0,255,157,0.5)", transition: "width 0.1s",
    }} />
  );
};

const App = () => {
  const isMobile = useIsMobile();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const features = [
    { icon: "notes", title: "Smart Notes", desc: "Upload PDFs, images, and handwritten notes. Share with classmates instantly.", emoji: "📄", glow: "0,255,157" },
    { icon: "sync", title: "Cloud Sync", desc: "Powered by Appwrite. Your data syncs across all devices seamlessly.", emoji: "☁️", glow: "0,255,157" },
    { icon: "secure", title: "Secure Vault", desc: "End-to-end encryption. Your study materials are protected at all times.", emoji: "🔒", glow: "189,0,255" },
    { icon: "mobile", title: "Native Mobile", desc: "Built with Flutter for a buttery-smooth 60fps experience on any device.", emoji: "📱", glow: "0,255,157" },
    { icon: "brain", title: "AI Summaries", desc: "Get instant summaries of long lectures. Master complex topics in minutes.", emoji: "🧠", glow: "0,255,157" },
    { icon: "groups", title: "Study Groups", desc: "Collaborate with peers. Share notes and learn together in real-time.", emoji: "👥", glow: "0,255,157" },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <ScrollProgress />
      <ParticleCanvas />
      <GlowingStickmen />

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "var(--bg-dark)" }}>
        <div className="noise-overlay" />
        <div className="aura-blob" style={{ width: "900px", height: "900px", top: "-25%", left: "-15%", background: "var(--bg-royale)", opacity: 0.35 }} />
        <div className="aura-blob" style={{ width: "600px", height: "600px", bottom: "15%", right: "-10%", background: "var(--primary)", opacity: 0.05, animationDelay: "-10s" }} />
        <div className="aura-blob" style={{ width: "400px", height: "400px", top: "50%", left: "50%", background: "var(--accent-blue)", opacity: 0.03, animationDelay: "-15s" }} />
      </div>

      <style>{`
        @keyframes phoneTilt { 0%,100% { transform: perspective(600px) rotateY(0deg); } 50% { transform: perspective(600px) rotateY(5deg); } }
        @keyframes orbitSpin { 0% { transform: rotate(0deg) translateX(60px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes scanLine { 0% { top: -2px; } 100% { top: 100%; } }
        @keyframes navScan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes logoSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes statusPulse { 0%,100% { opacity: 1; box-shadow: 0 0 8px var(--primary); } 50% { opacity: 0.4; box-shadow: 0 0 2px var(--primary); } }
        @keyframes stickFloat { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-30px) rotate(5deg); } }
        @keyframes haloSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes armGesture { 0% { transform: rotate(0deg); } 100% { transform: rotate(10deg); } }
        @keyframes divineGlowPulse { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
        html { scroll-behavior: smooth; }
      `}</style>

      <main style={{ position: "relative", zIndex: 10, padding: isMobile ? "0 20px" : "0 40px", maxWidth: "1200px", margin: "0 auto" }}>

        <section style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", textAlign: "center", flexDirection: "column",
          padding: isMobile ? "100px 0 60px" : "0",
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: isMobile ? "20px" : "40px",
            transform: isMobile ? "scale(0.8)" : "scale(1)", 
            transformOrigin: "center",
            flexDirection: isMobile ? "column" : "row"
          }}>
            <StudentIllustration />
            <div style={{ transform: "scale(0.7)", marginTop: isMobile ? "-40px" : "0" }}>
              <GodStickman />
            </div>
          </div>

          <ScrollReveal delay={0.1}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "5px",
              color: "var(--primary)", marginBottom: "20px", marginTop: "20px",
            }}>FOR STUDENTS, BY STUDENTS</div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <h1 style={{ margin: 0, fontSize: "clamp(42px, 9vw, 95px)", fontWeight: 900, lineHeight: 1.05 }}>
              Your Study Notes,{" "}
              <span style={{
                background: "linear-gradient(135deg, var(--primary), var(--accent-blue))",
                backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
                backgroundSize: "200% 200%", animation: "gradientShift 4s ease infinite",
              }}>Connected.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p style={{
              fontSize: "14px", color: "rgba(255,255,255,0.35)", maxWidth: "520px",
              marginTop: "30px", lineHeight: 1.8, fontFamily: "var(--font-mono)",
            }}>
              <TypeWriter text="Stop searching. Start studying. MindBridge connects you to the notes and resources you need — instantly." speed={20} />
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div style={{
              display: "flex", gap: isMobile ? "15px" : "20px", marginTop: isMobile ? "40px" : "50px",
              flexWrap: "wrap", justifyContent: "center", flexDirection: isMobile ? "column" : "row",
              width: isMobile ? "100%" : "auto",
            }}>
              <MagneticButton>
                <a href="/mindbridge.apk" style={{
                  background: "linear-gradient(135deg, var(--primary), #00D1FF)",
                  backgroundSize: "200% 200%", animation: "gradientShift 3s ease infinite",
                  color: "#020202", padding: "16px 36px", borderRadius: "14px",
                  fontSize: "14px", fontWeight: 800, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 0 40px rgba(0,255,157,0.2)",
                }}>Get the App <ArrowRight size={16} /></a>
              </MagneticButton>
            </div>
          </ScrollReveal>

          <div style={{
            position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            animation: "heroFloat 2s ease-in-out infinite",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "3px", color: "rgba(0,255,157,0.3)" }}>SCROLL</div>
            <ChevronRight size={16} color="rgba(0,255,157,0.3)" style={{ transform: "rotate(90deg)" }} />
          </div>
        </section>

        <section style={{ padding: isMobile ? "40px 0" : "60px 0" }}>
          <ScrollReveal>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: isMobile ? "30px" : "60px",
              justifyContent: "center",
            }}>
              {[
                { num: 100, suffix: "+", label: "Students" },
                { num: 500, suffix: "+", label: "Notes Shared" },
                { num: 100, suffix: "+", label: "Opportunities" },
                { num: 99, suffix: "%", label: "Uptime" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: "42px", fontWeight: 900, color: "var(--primary)",
                    filter: "drop-shadow(0 0 10px rgba(0,255,157,0.3))",
                  }}>
                    <AnimatedCounter end={s.num} suffix={s.suffix} />
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: "11px",
                    color: "rgba(255,255,255,0.3)", letterSpacing: "2px", marginTop: "8px",
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        <section id="story" style={{ padding: "120px 0" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: "80px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "4px", color: "var(--primary)", marginBottom: "15px" }}>
                THE PROBLEM WE SOLVE
              </div>
              <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, margin: 0 }}>
                Every student knows <span style={{ color: "var(--primary)" }}>the struggle.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
            {[
              { emoji: "😩", title: "Lost Notes", desc: "That PDF your friend shared 3 months ago? Gone. Buried in WhatsApp.", glow: "255,100,100" },
              { emoji: "🔍", title: "Endless Searching", desc: "Scrolling through 47 Google Drive folders to find last semester's notes.", glow: "255,200,0" },
              { emoji: "😩", title: "Secure Auth", desc: "Sign-In via AppWrite. Identity verified. Data sealed behind cryptographic walls.", glow: "255,100,100" },
              { emoji: "😱", title: "Exam Panic", desc: "That moment when you realize you missed a crucial topic just before the final.", glow: "255,80,80" },
              { emoji: "📚", title: "Info Overload", desc: "Drowning in research papers and lecture slides with no clear starting point.", glow: "100,200,255" },
              { emoji: "💼", title: "Opportunities Hub", desc: "Scrolling through multiple websites to find opportunities, jobs, internships, and educational resources.", glow: "255,200,0" },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={0.15 * i} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                <GlowCard glowColor={item.glow} style={{ height: "100%" }}>
                  <div style={{
                    fontSize: "48px", marginBottom: "20px",
                    animation: `pulse 3s ease-in-out ${i * 0.5}s infinite`,
                  }}>{item.emoji}</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 12px 0", color: "var(--primary)" }}>{item.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: "14px", lineHeight: 1.8 }}>{item.desc}</p>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div style={{ textAlign: "center", marginTop: "80px" }}>
              <GlowCard style={{
                display: "inline-flex", alignItems: "center", gap: "15px",
                padding: "20px 40px", background: "rgba(0,255,157,0.03)",
              }}>
                <span style={{ fontSize: "28px", animation: "pulse 2s ease-in-out infinite" }}>💡</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: "var(--primary)", fontWeight: 700 }}>
                  MindBridge fixes all of this.
                </span>
              </GlowCard>
            </div>
          </ScrollReveal>
        </section>

        <section id="features" style={{ padding: isMobile ? "60px 0" : "100px 0" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "60px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "4px", color: "var(--primary)", marginBottom: "15px" }}>
                CAPABILITIES
              </div>
              <h2 style={{ fontSize: isMobile ? "32px" : "48px", fontWeight: 900, margin: 0 }}>
                Built for how you <span style={{ color: "var(--primary)" }}>actually study.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={0.1 * i} direction={i % 2 === 0 ? "left" : "right"}>
                <GlowCard glowColor={f.glow} style={{ height: "100%" }}>
                  <div style={{ marginBottom: "20px" }}><FeatureIcon type={f.icon} /></div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "22px" }}>{f.emoji}</span> {f.title}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: "14px", lineHeight: 1.8 }}>{f.desc}</p>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section id="app" style={{ padding: isMobile ? "60px 0" : "100px 0" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "60px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "4px", color: "var(--primary)", marginBottom: "15px" }}>
                THE APP
              </div>
              <h2 style={{ fontSize: isMobile ? "32px" : "48px", fontWeight: 900, margin: 0 }}>
                See it <span style={{ color: "var(--primary)" }}>in action.</span>
              </h2>
            </div>
          </ScrollReveal>
          <Carousel />
        </section>

        <section style={{ padding: isMobile ? "80px 0 100px" : "120px 0 160px", textAlign: "center" }}>
          <ScrollReveal direction="scale">
            <GlowCard style={{
              padding: isMobile ? "60px 20px" : "80px 40px",
              background: "rgba(0,255,157,0.03)",
              display: "flex", flexDirection: "column", alignItems: "center"
            }}>
              <BookOpen size={isMobile ? 40 : 60} color="var(--primary)" style={{ opacity: 0.5, marginBottom: "30px" }} />
              <h2 style={{ fontSize: isMobile ? "32px" : "54px", fontWeight: 900, margin: "0 0 20px 0", lineHeight: 1.1 }}>
                Ready to <span style={{ color: "var(--primary)" }}>bridge the gap?</span>
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: isMobile ? "15px" : "18px",
                maxWidth: "1000px", margin: "0 0 40px 0", lineHeight: 1.6,
                fontFamily: "var(--font-mono)"
              }}>
                Join students who stopped struggling and started studying smarter with Mind-Bridge.
              </p>
              <MagneticButton>
                <a href="/mindbridge.apk" target="_blank" rel="noreferrer" style={{
                  background: "linear-gradient(135deg, var(--primary), #00D1FF)",
                  backgroundSize: "200% 200%", animation: "gradientShift 3s ease infinite",
                  color: "#020202", padding: "18px 44px", borderRadius: "14px",
                  fontSize: "15px", fontWeight: 800, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  boxShadow: "0 0 50px rgba(0,255,157,0.25)",
                }}>Download MindBridge <Download size={18} /></a>
              </MagneticButton>
            </GlowCard>
          </ScrollReveal>
        </section>

        <footer style={{
          padding: "60px 0", borderTop: "1px solid rgba(0,255,157,0.08)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: "rgba(255,255,255,0.2)", fontSize: "12px", fontFamily: "var(--font-mono)",
          flexWrap: "wrap", gap: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={14} color="var(--primary)" />
            <span>MindBridge © 2026</span>
          </div>
          <div style={{ display: "flex", gap: "30px" }}>
            <a href="/mindbridge.apk" target="_blank" rel="noreferrer"
              style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
              <Github size={12} /> Kavy Sharma
            </a>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default App;