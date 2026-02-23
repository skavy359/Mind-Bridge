import { useState, useEffect, useRef } from "react";

const StarField = ({ phase }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    starsRef.current = Array.from({ length: 600 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.1,
      t: Math.random() * Math.PI * 2,
      spd: Math.random() * 0.004 + 0.001,
      z: Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nebulas = [
        { x: 0.2, y: 0.3, r: 320, c: "rgba(10,50,160,0.07)" },
        { x: 0.75, y: 0.55, r: 380, c: "rgba(5,30,120,0.06)" },
        { x: 0.5, y: 0.8, r: 250, c: "rgba(20,70,200,0.05)" },
        { x: 0.85, y: 0.15, r: 200, c: "rgba(30,80,180,0.04)" },
        { x: 0.1, y: 0.75, r: 180, c: "rgba(8,40,140,0.06)" },
      ];
      nebulas.forEach(n => {
        const g = ctx.createRadialGradient(
          n.x * canvas.width, n.y * canvas.height, 0,
          n.x * canvas.width, n.y * canvas.height, n.r
        );
        g.addColorStop(0, n.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      starsRef.current.forEach(s => {
        s.t += s.spd;
        const a = (0.2 + 0.8 * Math.abs(Math.sin(s.t))) * (0.4 + s.z * 0.6);
        const blue = Math.floor(220 + 35 * Math.sin(s.t * 0.3));
        const green = Math.floor(200 + 40 * Math.sin(s.t * 0.5));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.5 + s.z * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,${green},${blue},${a})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
};

const WormholeCenter = ({ phase }) => {
  const [angle, setAngle] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      setAngle(a => a + (phase === "entering" ? 1.2 : phase === "active" ? 0.5 : 0.2));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const rings = [
    { rx: 220, ry: 66, spd: 1.0, col: "#38b8f8" },
    { rx: 195, ry: 58, spd: -1.4, col: "#1a7fc4" },
    { rx: 170, ry: 51, spd: 0.8,  col: "#2a9fd4" },
    { rx: 145, ry: 43, spd: -1.1, col: "#38b8f8" },
    { rx: 120, ry: 36, spd: 1.6,  col: "#1a7fc4" },
    { rx: 96,  ry: 29, spd: -0.9, col: "#60c8ff" },
    { rx: 74,  ry: 22, spd: 2.0,  col: "#38b8f8" },
    { rx: 54,  ry: 16, spd: -1.8, col: "#1a7fc4" },
    { rx: 36,  ry: 11, spd: 2.4,  col: "#90d8ff" },
    { rx: 20,  ry: 6,  spd: -3.0, col: "#38b8f8" },
    { rx: 10,  ry: 3,  spd: 3.5,  col: "#b8e8ff" },
  ];

  return (
    <div style={{
      position: "absolute",
      left: "50%", top: "50%",
      transform: "translate(-50%,-50%)",
      width: "520px", height: "520px",
      zIndex: 2, pointerEvents: "none",
    }}>
      <svg viewBox="0 0 500 500" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <radialGradient id="bhCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#000005" />
            <stop offset="35%" stopColor="#00020a" />
            <stop offset="65%" stopColor="#001830" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1a7fc4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#38b8f8" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#1a7fc4" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="coreGlow">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx="250" cy="250" r="245" fill="url(#innerGlow)" />

        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <ellipse key={`streak${i}`}
            cx="250" cy="250" rx="240" ry="14"
            stroke={`rgba(56,184,248,${0.06 + (i % 3) * 0.03})`}
            strokeWidth="6" fill="none"
            transform={`rotate(${deg + angle * 0.18},250,250)`}
            filter="url(#ringGlow)"
          />
        ))}

        {rings.map((ring, i) => (
          <ellipse key={i}
            cx="250" cy="250"
            rx={ring.rx} ry={ring.ry}
            stroke={ring.col}
            strokeWidth={i < 3 ? 1.5 : i < 6 ? 0.9 : 0.5}
            fill="none"
            opacity={0.08 + (i / rings.length) * 0.28}
            transform={`rotate(${angle * ring.spd * 0.4},250,250)`}
            filter={i < 5 ? "url(#ringGlow)" : undefined}
          />
        ))}

        <circle cx="250" cy="250" r="248" fill="url(#bhCore)" />

        <ellipse cx="250" cy="250" rx="48" ry="14"
          stroke="rgba(144,216,255,0.6)" strokeWidth="2" fill="none"
          filter="url(#ringGlow)"
          transform={`rotate(${angle * 2},250,250)`}
        />
        <ellipse cx="250" cy="250" rx="38" ry="11"
          stroke="rgba(56,184,248,0.8)" strokeWidth="1.5" fill="none"
          filter="url(#coreGlow)"
          transform={`rotate(${-angle * 2.5},250,250)`}
        />
      </svg>
    </div>
  );
};

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [textStep, setTextStep] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const lines = [
    { text: "INITIALIZING MINDBRIDGE", delay: 600 },
    { text: "ESTABLISHING QUANTUM SYNC", delay: 1400 },
    { text: "TRAVERSING THE WORMHOLE", delay: 2200 },
    { text: "TRANSMISSION READY", delay: 3000 },
  ];

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("entering"), 300);
    const t1 = setTimeout(() => setPhase("active"), 1800);

    lines.forEach((line, i) => {
      setTimeout(() => setTextStep(i + 1), line.delay);
    });

    let w = 0;
    const barInterval = setInterval(() => {
      w += 0.6;
      if (w >= 100) { w = 100; clearInterval(barInterval); }
      setBarWidth(w);
    }, 28);

    const c1 = setTimeout(() => setCountdown(2), 1500);
    const c2 = setTimeout(() => setCountdown(1), 2500);
    const c3 = setTimeout(() => setCountdown(0), 3500);

    const tFade = setTimeout(() => setFadeOut(true), 4200);
    const tDone = setTimeout(() => { if (onComplete) onComplete(); }, 5000);

    return () => {
      [t0, t1, c1, c2, c3, tFade, tDone].forEach(clearTimeout);
      clearInterval(barInterval);
    };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#00030a",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      opacity: fadeOut ? 0 : 1,
      transition: fadeOut ? "opacity 0.8s ease" : "none",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Courier+Prime:wght@400;700&display=swap');

        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0%,88%,90%,92%,100% { opacity: 1; }
          89% { opacity: 0.4; }
          91% { opacity: 0.7; }
        }
        @keyframes textReveal {
          from { opacity: 0; letter-spacing: 0.5em; transform: translateY(6px); }
          to   { opacity: 1; letter-spacing: 0.28em; transform: translateY(0); }
        }
        @keyframes logLine {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes warpIn {
          from { opacity: 0; transform: translate(-50%,-50%) scale(0.2); filter: blur(20px); }
          to   { opacity: 1; transform: translate(-50%,-50%) scale(1);   filter: blur(0); }
        }
        @keyframes cornerPulse {
          0%,100% { opacity: 0.3; } 50% { opacity: 0.7; }
        }
        @keyframes horizonGlow {
          0%,100% { opacity: 0.5; } 50% { opacity: 1; }
        }

        @media (max-width: 768px) {
          body { margin: 0; padding: 0; }
        }

        @media (max-width: 480px) {
          body { margin: 0; padding: 0; font-size: 14px; }
        }
      `}</style>

      <StarField phase={phase} />

      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.022) 0px,rgba(0,0,0,0.022) 1px,transparent 1px,transparent 4px)",
        animation: "flicker 7s ease-in-out infinite",
      }} />

      <div style={{
        position: "absolute", left: 0, right: 0, height: "3px", zIndex: 3,
        background: "linear-gradient(90deg,transparent,rgba(56,184,248,0.12),transparent)",
        animation: "scanline 6s linear infinite",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)",
      }} />

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px", zIndex: 4,
        background: "linear-gradient(90deg,transparent,rgba(56,184,248,0.5) 40%,rgba(56,184,248,0.8) 50%,rgba(56,184,248,0.5) 60%,transparent)",
        boxShadow: "0 0 20px rgba(56,184,248,0.3)",
        animation: "horizonGlow 3s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", zIndex: 4,
        background: "linear-gradient(90deg,transparent,rgba(26,127,196,0.3) 40%,rgba(26,127,196,0.5) 50%,rgba(26,127,196,0.3) 60%,transparent)",
      }} />

      {[
        { top: "24px", left: "24px",  borderTop: "1px solid", borderLeft: "1px solid" },
        { top: "24px", right: "24px", borderTop: "1px solid", borderRight: "1px solid" },
        { bottom: "24px", left: "24px",  borderBottom: "1px solid", borderLeft: "1px solid" },
        { bottom: "24px", right: "24px", borderBottom: "1px solid", borderRight: "1px solid" },
      ].map((s, i) => (
        <div key={i} style={{
          position: "absolute", width: "28px", height: "28px", zIndex: 5,
          borderColor: "rgba(56,184,248,0.35)", ...s,
          animation: `cornerPulse ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}

      <div style={{
        position: "absolute", left: "50%", top: "50%",
        animation: phase === "idle" ? "none" : "warpIn 1.4s cubic-bezier(0.16,1,0.3,1) forwards",
      }}>
        <WormholeCenter phase={phase} />
      </div>

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "0", textAlign: "center",
        width: "100%", maxWidth: "680px",
        padding: "0 40px",
      }}>

        <div style={{
          fontFamily: "'Courier New',monospace", fontSize: "10px",
          color: "rgba(56,184,248,0.45)", letterSpacing: "0.4em",
          textTransform: "uppercase", marginBottom: "32px",
          opacity: textStep >= 1 ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}>
          TARS · NAVIGATION SYSTEM · ONLINE
        </div>

        <h1 style={{
          fontFamily: "'Cinzel',serif", fontWeight: 800,
          fontSize: "clamp(52px,9vw,110px)",
          lineHeight: 0.88, margin: 0,
          letterSpacing: "0.1em",
          opacity: textStep >= 1 ? 1 : 0,
          animation: textStep >= 1 ? "textReveal 1s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        }}>
          <span style={{ display: "block", color: "#d0e8f8", textShadow: "0 0 60px rgba(160,210,255,0.2)" }}>
            MIND
          </span>
          <span style={{
            display: "block",
            background: "linear-gradient(130deg,#003a6a 0%,#1a7fc4 30%,#38b8f8 52%,#90d8ff 72%,#1a7fc4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 40px rgba(56,184,248,0.6))",
            animation: "pulse 3s ease-in-out infinite",
          }}>
            BRIDGE
          </span>
        </h1>

        <div style={{
          marginTop: "20px", height: "1px", width: "60%",
          background: "linear-gradient(90deg,transparent,rgba(56,184,248,0.6) 40%,rgba(56,184,248,0.9) 50%,rgba(56,184,248,0.6) 60%,transparent)",
          boxShadow: "0 0 20px rgba(56,184,248,0.35)",
          opacity: textStep >= 1 ? 1 : 0,
          transition: "opacity 0.8s ease 0.4s",
        }} />

        <p style={{
          marginTop: "20px",
          fontFamily: "Georgia,serif", fontSize: "15px", fontStyle: "italic",
          color: "rgba(160,200,240,0.65)", letterSpacing: "0.06em",
          opacity: textStep >= 2 ? 1 : 0, transition: "opacity 0.8s ease",
        }}>
          A Collaborative Learning Platform
        </p>

        <div style={{
          marginTop: "40px", width: "100%", maxWidth: "360px",
          height: "1px", background: "rgba(26,127,196,0.15)",
          position: "relative",
          opacity: textStep >= 1 ? 1 : 0, transition: "opacity 0.5s ease",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${barWidth}%`,
            background: "linear-gradient(90deg,#1a7fc4,#38b8f8,#90d8ff)",
            boxShadow: "0 0 12px rgba(56,184,248,0.6)",
            transition: "width 0.05s linear",
          }} />
          {[25, 50, 75].map(pct => (
            <div key={pct} style={{
              position: "absolute", left: `${pct}%`, top: "-3px",
              width: "1px", height: "7px",
              background: "rgba(56,184,248,0.3)",
              transform: "translateX(-50%)",
            }} />
          ))}
        </div>

        <div style={{
          marginTop: "32px",
          width: "100%", maxWidth: "420px",
          display: "flex", flexDirection: "column", gap: "6px",
          fontFamily: "'Courier New',monospace", fontSize: "11px",
          textAlign: "left",
        }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              display: "flex", gap: "14px", alignItems: "center",
              opacity: textStep > i ? 1 : 0,
              transform: textStep > i ? "translateX(0)" : "translateX(-10px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}>
              <span style={{ color: "rgba(56,184,248,0.35)", flexShrink: 0, fontSize: "10px" }}>
                {`0${i + 1}`}
              </span>
              <span style={{
                color: i === lines.length - 1 && textStep > i
                  ? "rgba(144,216,255,0.9)"
                  : "rgba(56,184,248,0.5)",
                letterSpacing: "0.12em",
                fontWeight: i === lines.length - 1 ? "bold" : "normal",
              }}>
                {line.text}
              </span>
              {textStep > i && (
                <span style={{
                  color: "rgba(56,184,248,0.6)", fontSize: "10px",
                  marginLeft: "auto",
                }}>
                  {i < lines.length - 1 ? "✓" : "▶"}
                </span>
              )}
            </div>
          ))}
          {textStep < lines.length && (
            <div style={{
              color: "rgba(56,184,248,0.6)", fontSize: "13px",
              animation: "blink 0.8s step-end infinite",
              marginTop: "4px", marginLeft: "24px",
            }}>_</div>
          )}
        </div>

        <button
          onClick={() => { setFadeOut(true); setTimeout(() => { if (onComplete) onComplete(); }, 800); }}
          style={{
            marginTop: "40px",
            fontFamily: "'Courier New',monospace", fontSize: "10px",
            color: "rgba(56,184,248,0.25)", letterSpacing: "0.22em",
            textTransform: "uppercase", background: "none", border: "none",
            cursor: "pointer", transition: "opacity 0.5s ease, color 0.25s ease",
            opacity: textStep >= 2 ? 1 : 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(56,184,248,0.65)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(56,184,248,0.25)"}
        >
          [ SKIP TRANSMISSION ]
        </button>
      </div>

      <div style={{
        position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)",
        fontFamily: "'Courier New',monospace", fontSize: "9px",
        color: "rgba(26,127,196,0.3)", letterSpacing: "0.2em",
        zIndex: 5, whiteSpace: "nowrap",
        opacity: textStep >= 1 ? 1 : 0, transition: "opacity 0.6s ease",
      }}>
        {`LAT: 28.9465°N  ·  LON: 74.6196°E  ·  ALT: 1.2AU  ·  VEL: 0.00c`}
      </div>

      <div style={{
        position: "absolute", left: "36px", top: "50%", transform: "translateY(-50%) rotate(-90deg)",
        fontFamily: "'Courier New',monospace", fontSize: "8px",
        color: "rgba(26,127,196,0.2)", letterSpacing: "0.25em",
        zIndex: 5, transformOrigin: "center center",
        opacity: textStep >= 1 ? 1 : 0, transition: "opacity 0.6s ease",
      }}>
        ENDURANCE · MISSION LOG · 2067.204
      </div>
      <div style={{
        position: "absolute", right: "36px", top: "50%", transform: "translateY(-50%) rotate(90deg)",
        fontFamily: "'Courier New',monospace", fontSize: "8px",
        color: "rgba(26,127,196,0.2)", letterSpacing: "0.25em",
        zIndex: 5, transformOrigin: "center center",
        opacity: textStep >= 1 ? 1 : 0, transition: "opacity 0.6s ease",
      }}>
        SYSTEM STATUS · NOMINAL · SYNC ACTIVE
      </div>
    </div>
  );
};

export { SplashScreen };