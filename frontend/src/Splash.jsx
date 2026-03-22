import { useState, useEffect, useRef } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
};

const ParticleField = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,157,${p.a})`;
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }} />;
};

const FloatingPapers = ({ visible }) => {
  const items = [
    { x: "12%", y: "18%", rot: -20, d: 0, icon: "📄" },
    { x: "78%", y: "12%", rot: 25, d: 0.2, icon: "📘" },
    { x: "20%", y: "68%", rot: -30, d: 0.5, icon: "📝" },
    { x: "82%", y: "55%", rot: 35, d: 0.15, icon: "❓" },
    { x: "45%", y: "8%", rot: 12, d: 0.4, icon: "📋" },
    { x: "8%", y: "42%", rot: -18, d: 0.3, icon: "❓" },
    { x: "88%", y: "30%", rot: 20, d: 0.1, icon: "📄" },
    { x: "55%", y: "78%", rot: -22, d: 0.6, icon: "📚" },
    { x: "30%", y: "82%", rot: 28, d: 0.25, icon: "❓" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
      {items.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: p.x, top: p.y, fontSize: "26px",
          opacity: visible ? 0.9 : 0,
          transform: visible ? `rotate(${p.rot}deg) scale(1)` : `rotate(0deg) scale(0.3) translateY(50px)`,
          transition: `all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${p.d}s`,
          animation: visible ? `paperDrift 4s ease-in-out ${p.d}s infinite alternate` : "none",
          filter: "drop-shadow(0 0 10px rgba(0,255,157,0.25))",
        }}>{p.icon}</div>
      ))}
    </div>
  );
};

const Stickman = ({ confused, lookingUp }) => {
  const headTilt = confused ? -8 : lookingUp ? -15 : 0;
  const bodyLean = confused ? 3 : 0;

  return (
    <svg viewBox="0 0 260 380" width={window.innerWidth < 768 ? "160" : "220"} height={window.innerWidth < 768 ? "230" : "320"} style={{
      filter: "drop-shadow(0 0 25px rgba(0,255,157,0.15))",
      transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      transform: `rotate(${bodyLean}deg)`,
    }}>
      <rect x="30" y="248" width="200" height="6" rx="3"
        fill="rgba(0,255,157,0.08)" stroke="var(--primary)" strokeWidth="1" opacity="0.4" />
      <line x1="50" y1="254" x2="50" y2="340" stroke="var(--primary)" strokeWidth="2" opacity="0.2" />
      <line x1="210" y1="254" x2="210" y2="340" stroke="var(--primary)" strokeWidth="2" opacity="0.2" />
      <g style={{ transition: "all 0.5s ease" }}>
        <rect x="95" y="225" width="56" height="23" rx="3"
          fill="rgba(0,255,157,0.04)" stroke="var(--primary)" strokeWidth="1.5" opacity="0.5" />
        <rect x="88" y="248" width="70" height="4" rx="2"
          fill="rgba(0,255,157,0.06)" stroke="var(--primary)" strokeWidth="1" opacity="0.3" />
        <rect x="99" y="229" width="48" height="15" rx="1"
          fill="rgba(0,255,157,0.06)" opacity="0.5" />
      </g>
      <path d="M80 250 Q80 290 85 320" stroke="var(--primary)" strokeWidth="1.5" opacity="0.15" fill="none" />
      <path d="M180 250 Q180 290 175 320" stroke="var(--primary)" strokeWidth="1.5" opacity="0.15" fill="none" />
      <path d="M75 250 Q130 260 185 250" stroke="var(--primary)" strokeWidth="1" opacity="0.1" fill="none" />

      <g style={{ transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <line x1="130" y1="148" x2="130" y2="250" stroke="var(--primary)" strokeWidth="2.5" opacity="0.7"
          strokeLinecap="round" />

        <line x1="100" y1="165" x2="160" y2="165" stroke="var(--primary)" strokeWidth="2" opacity="0.5"
          strokeLinecap="round" />

        <path
          d={confused
            ? "M100 165 Q85 140 95 105"  
            : lookingUp
              ? "M100 165 Q80 175 70 200" 
              : "M100 165 Q85 195 90 230"  
          }
          stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"
          style={{ transition: "d 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />

        <path
          d={lookingUp
            ? "M160 165 Q178 175 185 200"
            : "M160 165 Q175 200 150 235"
          }
          stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"
          style={{ transition: "d 0.8s ease" }}
        />

        <path d="M130 250 Q115 280 95 320" stroke="var(--primary)" strokeWidth="2.5" opacity="0.5" fill="none" strokeLinecap="round" />
        <path d="M130 250 Q145 280 165 320" stroke="var(--primary)" strokeWidth="2.5" opacity="0.5" fill="none" strokeLinecap="round" />
        <line x1="95" y1="320" x2="80" y2="322" stroke="var(--primary)" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
        <line x1="165" y1="320" x2="180" y2="322" stroke="var(--primary)" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      </g>

      <g style={{
        transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        transformOrigin: "130px 120px",
        transform: `rotate(${headTilt}deg)`,
      }}>
        <circle cx="130" cy="100" r="38" fill="rgba(0,18,9,0.6)" stroke="var(--primary)" strokeWidth="2" opacity="0.85" />

        <path d="M95 85 Q130 60 165 85" stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity="0.3" />

        {confused ? (
          <>
            <g style={{ animation: "eyeLookAround 2s ease-in-out infinite" }}>
              <circle cx="118" cy="95" r="4" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.7" />
              <circle cx="118" cy="95" r="1.5" fill="var(--primary)" opacity="0.8" />
              <circle cx="142" cy="95" r="4" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.7" />
              <circle cx="142" cy="95" r="1.5" fill="var(--primary)" opacity="0.8" />
            </g>
            <line x1="110" y1="82" x2="122" y2="85" stroke="var(--primary)" strokeWidth="1.5" opacity="0.5" />
            <line x1="150" y1="82" x2="138" y2="85" stroke="var(--primary)" strokeWidth="1.5" opacity="0.5" />
          </>
        ) : (
          <>
            <circle cx="118" cy="95" r="3" fill="var(--primary)" opacity="0.7" />
            <circle cx="142" cy="95" r="3" fill="var(--primary)" opacity="0.7" />
          </>
        )}

        {confused ? (
          <path d="M118 115 Q130 110 142 115" stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity="0.5" />
        ) : lookingUp ? (
          <circle cx="130" cy="114" r="4" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.4" />
        ) : (
          <path d="M120 112 Q130 120 140 112" stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity="0.5" />
        )}
      </g>

      {confused && (
        <>
          <text x="170" y="70" fill="var(--primary)" fontSize="28" fontWeight="bold" opacity="0.8"
            style={{ animation: "questionFloat 1.2s ease-in-out infinite alternate" }}>?</text>
          <text x="80" y="55" fill="var(--primary)" fontSize="22" fontWeight="bold" opacity="0.5"
            style={{ animation: "questionFloat 1.5s ease-in-out 0.3s infinite alternate" }}>?</text>
          <text x="155" y="40" fill="var(--primary)" fontSize="18" fontWeight="bold" opacity="0.35"
            style={{ animation: "questionFloat 1.8s ease-in-out 0.6s infinite alternate" }}>?</text>
        </>
      )}
    </svg>
  );
};

const DivineFigure = ({ visible }) => (
  <div style={{
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    display: "flex", flexDirection: "column", alignItems: "center",
    opacity: visible ? 1 : 0,
    transition: "opacity 1.5s ease",
    zIndex: 5, pointerEvents: "none",
    transform: window.innerWidth < 768 ? "scale(0.8)" : "scale(1)",
    transformOrigin: "center top",
  }}>
    <div style={{
      position: "absolute", top: "-10%", left: "50%",
      transform: "translateX(-50%)",
      width: "200vw", height: "120vh",
      zIndex: 0,
    }}>
      <div style={{
        position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)",
        width: window.innerWidth < 768 ? "400px" : "800px", height: window.innerWidth < 768 ? "400px" : "800px",
        background: "radial-gradient(circle, rgba(0,255,157,0.12) 0%, rgba(0,255,157,0.04) 40%, transparent 70%)",
        borderRadius: "50%",
        animation: visible ? "divineGlowPulse 3s ease-in-out infinite" : "none",
      }} />

      {[...Array(16)].map((_, i) => {
        const angle = (i * 22.5) - 90;
        return (
          <div key={i} style={{
            position: "absolute",
            top: "8%", left: "50%",
            width: "3px", height: visible ? "90vh" : "0",
            background: `linear-gradient(180deg, rgba(0,255,157,${0.25 - i * 0.01}), transparent 80%)`,
            transformOrigin: "top center",
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transition: `height 2s cubic-bezier(0.16, 1, 0.3, 1) ${0.05 * i}s`,
            filter: "blur(2px)",
          }} />
        );
      })}

      {[...Array(8)].map((_, i) => {
        const angle = (i * 45) - 90;
        return (
          <div key={`thick-${i}`} style={{
            position: "absolute",
            top: "8%", left: "50%",
            width: "8px", height: visible ? "70vh" : "0",
            background: `linear-gradient(180deg, rgba(0,255,157,0.15), transparent 60%)`,
            transformOrigin: "top center",
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transition: `height 2.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 * i + 0.3}s`,
            filter: "blur(6px)",
          }} />
        );
      })}
    </div>

    <div style={{
      position: "absolute", top: "5%", left: "50%",
      transform: `translateX(-50%) translateY(${visible ? "0" : "-120px"}) scale(${visible ? 1 : 0.5})`,
      transition: "all 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
      zIndex: 2,
    }}>
      <svg viewBox="0 0 220 320" width="180" height="260" style={{
        filter: `drop-shadow(0 0 40px rgba(0,255,157,0.5)) drop-shadow(0 0 80px rgba(0,255,157,0.2))`,
      }}>
        <ellipse cx="110" cy="32" rx="48" ry="14" fill="none"
          stroke="var(--primary)" strokeWidth="2.5" opacity="0.9"
          style={{ animation: visible ? "haloSpin 3s linear infinite" : "none" }} />
        <ellipse cx="110" cy="32" rx="55" ry="10" fill="none"
          stroke="var(--primary)" strokeWidth="1" opacity="0.4"
          style={{ animation: visible ? "haloSpin 4s linear infinite reverse" : "none" }} />
        <ellipse cx="110" cy="32" rx="42" ry="16" fill="none"
          stroke="var(--primary)" strokeWidth="1.5" opacity="0.6"
          style={{ animation: visible ? "haloSpin 5s linear infinite" : "none" }} />

        <circle cx="110" cy="68" r="32" fill="rgba(0,18,9,0.5)" stroke="var(--primary)" strokeWidth="2.5" />
        <path d="M96 64 Q100 68 104 64" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.8" />
        <path d="M116 64 Q120 68 124 64" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.8" />
        <path d="M100 80 Q110 90 120 80" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.6" />

        <path d="M110 100 L50 300 L170 300 Z"
          fill="rgba(0,255,157,0.03)" stroke="var(--primary)" strokeWidth="2" opacity="0.5" />
        <path d="M110 100 L80 280" stroke="var(--primary)" strokeWidth="1" opacity="0.2" />
        <path d="M110 100 L140 280" stroke="var(--primary)" strokeWidth="1" opacity="0.2" />
        <path d="M110 100 L95 270" stroke="var(--primary)" strokeWidth="0.8" opacity="0.15" />
        <path d="M110 100 L125 270" stroke="var(--primary)" strokeWidth="0.8" opacity="0.15" />
        <line x1="75" y1="170" x2="145" y2="170" stroke="var(--primary)" strokeWidth="1.5" opacity="0.3" />

        <path d="M85 140 Q40 130 15 100"
          stroke="var(--primary)" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"
          style={{ animation: visible ? "armGesture 3s ease-in-out infinite alternate" : "none" }} />
        <path d="M135 140 Q180 130 205 100"
          stroke="var(--primary)" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"
          style={{ animation: visible ? "armGesture 3s ease-in-out 0.5s infinite alternate" : "none" }} />
        <circle cx="15" cy="100" r="6" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.5" />
        <circle cx="205" cy="100" r="6" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  </div>
);

const TypeWriter = ({ text, visible, delay = 0, speed = 45, style = {} }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!visible) { setDisplayed(""); setStarted(false); return; }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [visible, delay]);

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
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: "28px", opacity: visible ? 1 : 0,
      transition: "opacity 0.5s ease", ...style,
    }}>
      {displayed}
      {started && displayed.length < text.length && (
        <span style={{ animation: "blink 0.6s step-end infinite", color: "var(--primary)" }}>▌</span>
      )}
    </div>
  );
};

const OrganizedGrid = ({ visible }) => {
  const items = ["📄", "📘", "📝", "📋", "📚", "📄"];
  return (
    <div style={{
      position: "absolute", bottom: window.innerWidth < 768 ? "10%" : "12%", left: "50%", transform: "translateX(-50%)",
      display: "grid", gridTemplateColumns: "repeat(3, 44px)", gap: "8px",
      opacity: visible ? 1 : 0, transition: "all 1s ease 0.8s", zIndex: 6,
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          width: window.innerWidth < 768 ? "44px" : "52px", height: window.innerWidth < 768 ? "44px" : "52px", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: window.innerWidth < 768 ? "16px" : "20px", borderRadius: "10px",
          background: "rgba(0,255,157,0.05)", border: "1px solid rgba(0,255,157,0.25)",
          backdropFilter: "blur(10px)",
          transform: visible ? "scale(1) rotate(0deg)" : "scale(0) rotate(180deg)",
          transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.9 + i * 0.08}s`,
          boxShadow: "0 0 15px rgba(0,255,157,0.1)",
        }}>{item}</div>
      ))}
    </div>
  );
};

const LogoReveal = ({ visible }) => (
  <div style={{
    position: "absolute", inset: 0, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", zIndex: 10,
    opacity: visible ? 1 : 0, transition: "opacity 1s ease",
  }}>
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(circle, rgba(0,255,157,0.08) 0%, transparent 60%)",
      animation: visible ? "neonFlash 0.6s ease-out" : "none",
    }} />
    <h1 style={{
      fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "clamp(60px, 10vw, 100px)",
      color: "var(--primary)", margin: 0, letterSpacing: "-3px",
      filter: "drop-shadow(0 0 50px rgba(0,255,157,0.4))",
      transform: visible ? "scale(1)" : "scale(0.3)",
      transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>MINDBRIDGE</h1>
    <div style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: "14px",
      color: "rgba(0,255,157,0.6)", letterSpacing: "5px", marginTop: "25px",
      opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.6s",
    }}>YOUR STUDY UNIVERSE, CONNECTED.</div>
  </div>
);

const SplashScreen = ({ onComplete }) => {
  const isMobile = useIsMobile();
  const [scene, setScene] = useState(0);
  const [confused, setConfused] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setScene(1), 300),
      setTimeout(() => setConfused(true), 800),
      setTimeout(() => setScene(2), 3800),
      setTimeout(() => { setConfused(false); setLookingUp(true); }, 4200),
      setTimeout(() => setScene(3), 7500),
      setTimeout(() => setLookingUp(false), 7500),
      setTimeout(() => setFadeOut(true), 9500),
      setTimeout(() => onComplete && onComplete(), 10300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#020202", overflow: "hidden",
      opacity: fadeOut ? 0 : 1, transition: "opacity 0.8s ease",
    }}>
      <style>{`
        @keyframes paperDrift {
          0% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          100% { transform: translateY(-18px) rotate(calc(var(--rot, 0deg) + 8deg)); }
        }
        @keyframes questionFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-12px) scale(1.1); opacity: 0.9; }
        }
        @keyframes eyeLookAround {
          0%, 100% { transform: translateX(0); }
          30% { transform: translateX(-3px); }
          70% { transform: translateX(3px); }
        }
        @keyframes divineGlowPulse {
          0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
        }
        @keyframes haloSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes armGesture {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes neonFlash { 0% { opacity: 0.9; } 100% { opacity: 0; } }
        @keyframes scanDown { 0% { top: -2px; } 100% { top: 100%; } }
      `}</style>

      <div className="noise-overlay" style={{ opacity: 0.04 }} />
      <ParticleField />

      <div style={{
        position: "absolute", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, var(--primary), transparent)",
        opacity: 0.12, zIndex: 20, pointerEvents: "none",
        animation: "scanDown 5s linear infinite",
      }} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: scene >= 1 && scene < 3 ? 1 : 0,
        transition: "opacity 1s ease",
        transform: scene === 3 ? "scale(0.7)" : "scale(1)",
      }}>
        <FloatingPapers visible={scene === 1} />

        <div style={{
          transform: scene === 2 ? "translateY(100px) scale(0.75)" : "translateY(0)",
          transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 4,
        }}>
          <Stickman confused={confused && scene === 1} lookingUp={lookingUp} />
        </div>

        <TypeWriter
          text='"Where are those notes...?"'
          visible={scene === 1}
          delay={1200}
          style={{ marginTop: "20px", color: "rgba(255,255,255,0.45)", fontSize: "16px", zIndex: 4, position: "relative" }}
        />
      </div>

      <DivineFigure visible={scene === 2} />

      <div style={{
        position: "absolute", top: "40%", left: "50%", transform: "translateX(-50%)",
        zIndex: 8, textAlign: "center",
        opacity: scene === 2 ? 1 : 0,
        transition: "opacity 0.8s ease 0.5s",
      }}>
        <div style={{
          background: "rgba(0,255,157,0.06)",
          border: "1px solid rgba(0,255,157,0.3)",
          borderRadius: "20px", padding: window.innerWidth < 768 ? "12px 20px" : "18px 35px",
          backdropFilter: "blur(15px)",
          boxShadow: "0 0 30px rgba(0,255,157,0.1)",
        }}>
          <TypeWriter
            text='"Try MindBridge."'
            visible={scene === 2}
            delay={1200}
            speed={60}
            style={{ color: "var(--primary)", fontSize: window.innerWidth < 768 ? "18px" : "24px", fontWeight: "bold" }}
          />
        </div>
      </div>

      <OrganizedGrid visible={scene === 2} />

      <LogoReveal visible={scene === 3} />

      <div style={{
        position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
        color: "rgba(0,255,157,0.2)", letterSpacing: "3px", zIndex: 15,
      }}>
        {scene === 1 && "SCENE_01 // THE_STRUGGLE"}
        {scene === 2 && "SCENE_02 // THE_REVELATION"}
        {scene === 3 && "INITIALIZING PROTOCOL // v1.0.0"}
      </div>
    </div>
  );
};

export { SplashScreen };