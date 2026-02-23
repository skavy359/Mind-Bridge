import { useState, useEffect, useRef } from "react";
import { Download, Smartphone, Database, Lock, Zap, Cloud, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";

const DeepSpace = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 500 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.1,
      t: Math.random() * Math.PI * 2,
      spd: Math.random() * 0.006 + 0.002,
      drift: (Math.random() - 0.5) * 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      [
        { x: 0.15, y: 0.3, r: 280, c: "rgba(20,80,180,0.06)" },
        { x: 0.8,  y: 0.6, r: 340, c: "rgba(10,50,140,0.05)" },
        { x: 0.5,  y: 0.85,r: 220, c: "rgba(30,100,200,0.04)" },
        { x: 0.3,  y: 0.7, r: 180, c: "rgba(8,40,120,0.07)"   },
      ].forEach(n => {
        const g = ctx.createRadialGradient(n.x*canvas.width, n.y*canvas.height, 0, n.x*canvas.width, n.y*canvas.height, n.r);
        g.addColorStop(0, n.c); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
      stars.forEach(s => {
        s.t += s.spd;
        s.x += s.drift;
        if (s.x > canvas.width) s.x = 0;
        if (s.x < 0) s.x = canvas.width;
        const a = 0.3 + 0.7 * Math.abs(Math.sin(s.t));
        const warmth = Math.sin(s.t * 0.5);
        const r2 = Math.floor(180 + 20*warmth); const g2 = Math.floor(210 + 25*warmth); const b2 = 255;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
};

const Wormhole = () => {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let raf;
    const tick = () => { setAngle(a => a + 0.35); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const rings = [200, 178, 155, 132, 110, 90, 72, 56, 42, 30, 20, 12];
  return (
    <div style={{
      position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
      width: "560px", height: "560px", zIndex: 1, pointerEvents: "none",
    }}>
      <svg viewBox="0 0 400 400" style={{ width: "100%", height: "100%", filter: "blur(0.4px)" }}>
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#000" />
            <stop offset="30%" stopColor="#00060f" />
            <stop offset="60%" stopColor="#002a4a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1a7fc4" stopOpacity="0" />
          </radialGradient>
          <filter id="wglow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {rings.map((rx, i) => {
          const ry = rx * 0.3;
          const rot = angle * (i % 2 === 0 ? 1 : -1) * (0.25 + i * 0.045);
          const alpha = 0.05 + (i / rings.length) * 0.25;
          const sw = i < 3 ? 1.8 : i < 7 ? 1 : 0.5;
          const col = i < 6 ? "#2a9fd4" : "#1a7fc4";
          return (
            <ellipse key={i} cx="200" cy="200" rx={rx} ry={ry}
              stroke={col} strokeWidth={sw} fill="none" opacity={alpha}
              transform={`rotate(${rot},200,200)`}
              filter={i < 4 ? "url(#wglow)" : undefined}
            />
          );
        })}
        <circle cx="200" cy="200" r="198" fill="url(#core)" opacity="0.92" />
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <ellipse key={`a${i}`} cx="200" cy="200" rx="196" ry="11"
            stroke="rgba(56,180,248,0.15)" strokeWidth="4" fill="none"
            transform={`rotate(${deg + angle * 0.25},200,200)`}
          />
        ))}
      </svg>
    </div>
  );
};

const Tesseract = () => {
  const lines = 16;
  return (
    <div style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: "68px",
      zIndex: 1, pointerEvents: "none", overflow: "hidden",
      borderRight: "1px solid rgba(26,127,196,0.1)",
    }}>
      <style>{`
        @keyframes tPulse0{0%,100%{opacity:0.1;transform:scaleX(0.2)}50%{opacity:0.9;transform:scaleX(1)}}
        @keyframes tPulse1{0%,100%{opacity:0.1;transform:scaleX(0.2)}50%{opacity:0.7;transform:scaleX(1)}}
        @keyframes tPulse2{0%,100%{opacity:0.1;transform:scaleX(0.2)}50%{opacity:0.85;transform:scaleX(1)}}
        @keyframes tPulse3{0%,100%{opacity:0.1;transform:scaleX(0.2)}50%{opacity:0.6;transform:scaleX(1)}}
        @keyframes tPulse4{0%,100%{opacity:0.1;transform:scaleX(0.2)}50%{opacity:0.95;transform:scaleX(1)}}
        @keyframes tPulse5{0%,100%{opacity:0.1;transform:scaleX(0.2)}50%{opacity:0.75;transform:scaleX(1)}}
      `}</style>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} style={{
          position: "absolute", left: 0, right: 0,
          top: `${(i / lines) * 100}%`, height: "1px",
          background: `rgba(26,127,196,${i % 4 === 0 ? 0.18 : 0.06})`,
        }} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <div key={`p${i}`} style={{
          position: "absolute", left: "10px", right: "10px",
          top: `${8 + i * 14}%`, height: "2px",
          background: "linear-gradient(90deg,transparent,rgba(26,127,196,0.6),transparent)",
          transformOrigin: "left center",
          animation: `tPulse${i} ${1.8 + i * 0.45}s ease-in-out ${i * 0.4}s infinite`,
        }} />
      ))}
      <div style={{
        position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)",
        fontFamily: "'Courier New',monospace", fontSize: "7px",
        color: "rgba(26,127,196,0.3)", letterSpacing: "0.12em",
        writingMode: "vertical-lr", textTransform: "uppercase",
      }}>TESSERACT</div>
    </div>
  );
};

const TARSBar = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1200); return () => clearInterval(t); }, []);
  const metrics = [
    { k: "HONESTY", v: "90%" }, { k: "HUMOR", v: "75%" },
    { k: "SYNC", v: tick % 2 === 0 ? "LINKED" : "ACTIVE" }, { k: "UPTIME", v: "100%" },
  ];
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 20,
      height: "40px", display: "flex", alignItems: "center",
      padding: "0 80px 0 88px",
      background: "rgba(0,3,12,0.88)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(26,127,196,0.2)",
    }}>
      <span style={{
        fontFamily: "'Courier New',monospace", fontSize: "10px",
        color: "rgba(26,127,196,0.85)", letterSpacing: "0.28em",
        textTransform: "uppercase", paddingRight: "22px",
        borderRight: "1px solid rgba(26,127,196,0.18)", marginRight: "22px", flexShrink: 0,
      }}>TARS · MK.I</span>
      <div style={{ display: "flex", gap: "28px", flex: 1, overflow: "hidden" }}>
        {metrics.map(m => (
          <div key={m.k} style={{ display: "flex", gap: "7px", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "9px", color: "rgba(26,127,196,0.35)", letterSpacing: "0.18em" }}>{m.k}</span>
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "10px", color: "rgba(26,127,196,0.8)" }}>{m.v}</span>
          </div>
        ))}
      </div>
      <span style={{ fontFamily: "'Courier New',monospace", fontSize: "9px", color: "rgba(26,127,196,0.3)", letterSpacing: "0.12em", flexShrink: 0 }}>
        {new Date().toISOString().slice(0, 19).replace("T", "  ")}
      </span>
    </div>
  );
};

const screenshots = [
  "/images/ss1.jpeg", "/images/ss2.jpeg", "/images/ss3.jpeg",
  "/images/ss4.jpeg", "/images/ss5.jpeg", "/images/ss6.jpeg",
];

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

const FeatureCard = ({ Icon, title, body, code }) => (
  <div
    style={{
      border: "none", borderTop: "2px solid rgba(26,127,196,0.45)",
      background: "rgba(0,5,18,0.8)", backdropFilter: "blur(8px)",
      padding: "32px 28px", transition: "all 0.3s ease", cursor: "default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = "rgba(0,9,28,0.95)";
      e.currentTarget.style.transform = "translateY(-5px)";
      e.currentTarget.style.boxShadow = "0 24px 64px rgba(26,127,196,0.14)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "rgba(0,5,18,0.8)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ fontFamily: "'Courier New',monospace", fontSize: "9px", color: "rgba(26,127,196,0.35)", letterSpacing: "0.22em", marginBottom: "18px" }}>{code}</div>
    <div style={{
      width: "34px", height: "34px", border: "1px solid rgba(26,127,196,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px",
    }}>
      <Icon size={14} color="#1a7fc4" />
    </div>
    <h3 style={{
      fontFamily: "'Courier New',monospace", fontSize: "14px", color: "#90d9ff",
      letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 12px", textShadow: "0 0 15px rgba(144,217,255,0.25)",
    }}>{title}</h3>
    <p style={{ fontSize: "15px", color: "#6a9fbe", lineHeight: 1.85, margin: 0, fontFamily: "Georgia,serif", textShadow: "0 0 10px rgba(106,159,190,0.15)" }}>{body}</p>
  </div>
);

const App = ({ onBack }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const fi = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(30px)",
    transition: `opacity 1.1s ease ${delay}s, transform 1.1s ease ${delay}s`,
  });

  const techStack = [
    { name: "Flutter", Icon: Smartphone }, { name: "Firebase", Icon: Zap },
    { name: "Firestore", Icon: Database }, { name: "Google Auth", Icon: Lock },
  ];

  const features = [
    { Icon: Smartphone, code: "SYS.01", title: "Flutter Native",    body: "Pixel-perfect Android UI. Hardware-accelerated. No compromises on performance or fidelity." },
    { Icon: Database,   code: "SYS.02", title: "Real-Time Notes",   body: "Upload, share, and access study materials instantly. PDF, images, and notes synchronized across all devices in real-time." },
    { Icon: Lock,       code: "SYS.03", title: "Secure Auth",       body: "Google Sign-In via Firebase. Identity verified. Data sealed behind cryptographic walls." },
    { Icon: Cloud,      code: "SYS.04", title: "Opportunities Hub", body: "Discover collaborative study groups, internships, and educational resources. Connect with peers and mentors instantly." },
  ];

  const appFeatures = [
    { title: "Dashboard", desc: "Unified workspace. Access notes, opportunities, and collaborate with peers. Your personal study hub." },
    { title: "Study Notes", desc: "Upload, organize, and share course materials. Real-time synchronization with classmates." },
    { title: "Opportunities", desc: "Browse internships, scholarships, and study groups. Connect with opportunities tailored to you." },
    { title: "User Profiles", desc: "Showcase your academic journey. Track achievements and connect with like-minded students." },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#00030a",
      color: "#d0e8f8", fontFamily: "Georgia,'Times New Roman',serif",
      overflowX: "hidden", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Courier+Prime:wght@400;700&display=swap');
        html,body{background:#00030a;margin:0;padding:0;overflow-x:hidden;}
        *{box-sizing:border-box;}
        ::selection{background:rgba(26,127,196,0.3);color:#a8d8f8;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#000;}
        ::-webkit-scrollbar-thumb{background:rgba(26,127,196,0.25);}

        .cta-btn{
          display:inline-flex;align-items:center;gap:12px;
          padding:14px 38px;
          background:rgba(26,127,196,0.1);
          border:1px solid rgba(26,127,196,0.55);
          color:#90ccf5;
          font-family:'Courier New',monospace;font-size:11px;
          letter-spacing:0.24em;text-transform:uppercase;
          text-decoration:none;cursor:pointer;
          transition:all 0.3s ease;
          box-shadow:0 0 30px rgba(26,127,196,0.08);
        }
        .cta-btn:hover{
          background:rgba(26,127,196,0.24);
          border-color:rgba(255,180,50,0.85);
          box-shadow:0 0 60px rgba(26,127,196,0.28),0 0 120px rgba(26,127,196,0.1);
          transform:translateY(-2px);color:#a8d8f8;
        }
        .back-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:9px 18px;background:transparent;
          border:1px solid rgba(26,127,196,0.25);
          color:rgba(26,127,196,0.6);
          font-family:'Courier New',monospace;font-size:10px;
          letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;
          transition:all 0.25s;
        }
        .back-btn:hover{border-color:rgba(26,127,196,0.65);color:#90ccf5;background:rgba(26,127,196,0.06);}

        @keyframes flicker{0%,89%,91%,93%,96%,100%{opacity:1}90%{opacity:0.55}92%{opacity:0.85}95%{opacity:0.7}}
        @keyframes titleGlow{0%,100%{text-shadow:0 0 40px rgba(160,210,255,0.12)}50%{text-shadow:0 0 80px rgba(160,210,255,0.22)}}

        @media (max-width: 1024px) {
          .content-wrapper { padding: 60px 30px 60px 50px !important; }
        }

        @media (max-width: 768px) {
          html,body { background:#00030a; margin:0; padding:0; overflow-x:hidden; }
          .content-wrapper { padding: 40px 16px 50px 16px !important; }
          .cta-btn { padding:10px 24px; font-size:9px; }
          .back-btn { padding:7px 14px; font-size:8px; }
          
          /* Hero section - stack vertically */
          section { grid-template-columns: 1fr !important; gap: 30px !important; }
          
          /* Download/Download sections */
          div[style*="grid"] { grid-template-columns: 1fr !important; }
          div[style*="borderRight"] { border-right: none !important; border-bottom: 1px solid rgba(26,127,196,0.12) !important; padding-right: inherit !important; }
        }

        @media (max-width: 480px) {
          html,body { background:#00030a; margin:0; padding:0; }
          .content-wrapper { padding: 30px 12px 40px 12px !important; }
          .cta-btn { padding:8px 18px; font-size:8px; gap:8px; }
          .back-btn { padding:6px 12px; font-size:7px; }
          
          h1 { font-size: clamp(36px, 10vw, 68px) !important; }
          h2 { font-size: clamp(16px, 5vw, 32px) !important; }
          h3 { font-size: clamp(11px, 3vw, 14px) !important; }
          p { font-size: clamp(12px, 3vw, 15px) !important; }
          
          section { gap: 20px !important; }
        }

        @media (max-height: 600px) {
          section { min-height: auto !important; padding-bottom: 30px !important; }
        }
      `}</style>

      <DeepSpace />
      <Wormhole />
      <Tesseract />
      <TARSBar />

      <div style={{
        position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.018) 0px,rgba(0,0,0,0.018) 1px,transparent 1px,transparent 4px)",
      }} />

      <div style={{
        position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,0.7) 100%)",
        animation: "flicker 9s ease-in-out infinite",
      }} />

      <div style={{
        position: "relative", zIndex: 10,
        width: "100%",
        padding: "80px 40px 80px 60px",
        overflowX: "hidden",
      }} className="content-wrapper">

        <div style={{ ...fi(0), marginBottom: "44px" }}>
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              <ArrowLeft size={11} /> Back to Projects
            </button>
          )}
        </div>

        <section style={{
          display: "grid", gridTemplateColumns: "1.6fr 0.4fr",
          gap: "20px", alignItems: "center", minHeight: "85vh", paddingBottom: "56px", width: "100%",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

            <div style={{ ...fi(0.1), display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "36px", height: "1px", background: "rgba(26,127,196,0.6)", boxShadow: "0 0 8px rgba(26,127,196,0.4)" }} />
              <span style={{ fontFamily: "'Courier New',monospace", fontSize: "10px", letterSpacing: "0.3em", color: "rgba(26,127,196,0.55)", textTransform: "uppercase" }}>
                Collaborative Platform · v1.0
              </span>
            </div>

            <div style={fi(0.2)}>
              <h1 style={{
                fontFamily: "'Cinzel',serif", fontWeight: 800,
                fontSize: "clamp(68px,8.5vw,110px)",
                lineHeight: 0.88, margin: 0, letterSpacing: "0.06em",
                animation: "titleGlow 5s ease-in-out infinite",
              }}>
                <span style={{ display: "block", color: "#d0e8f8" }}>MIND</span>
                <span style={{
                  display: "block",
                  background: "linear-gradient(130deg,#003a6a 0%,#1a7fc4 30%,#38b8f8 50%,#70c0f0 70%,#1a7fc4 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 35px rgba(26,127,196,0.55))",
                }}>BRIDGE</span>
              </h1>
              <div style={{
                marginTop: "14px", height: "1px", width: "55%",
                background: "linear-gradient(90deg,#1a7fc4,rgba(26,127,196,0.25),transparent)",
                boxShadow: "0 0 16px rgba(26,127,196,0.4)",
              }} />
            </div>

            <p style={{ ...fi(0.3), fontSize: "19px", lineHeight: 1.8, color: "#a8dff5", fontStyle: "italic", margin: 0, maxWidth: "460px", textShadow: "0 0 20px rgba(168,223,245,0.2)" }}>
              "We are now a multi-device species. Knowledge must travel with us —
              seamless, secure, and real-time."
            </p>

            <p style={{ ...fi(0.38), fontSize: "15px", lineHeight: 2, color: "#7eb3d4", margin: 0, maxWidth: "420px", fontFamily: "'Courier New',monospace", letterSpacing: "0.04em", textShadow: "0 0 12px rgba(126,179,212,0.15)" }}>
              Seamless sharing of notes, PDFs, and images with real-time
              synchronization. Built on Flutter and Firebase for collaborative minds.
            </p>

            <div style={{ ...fi(0.46), display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {techStack.map(({ name, Icon }) => (
                <div key={name}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "7px 16px",
                    border: "1px solid rgba(26,127,196,0.22)",
                    background: "rgba(26,127,196,0.04)",
                    fontFamily: "'Courier New',monospace", fontSize: "10px",
                    color: "rgba(26,127,196,0.7)", letterSpacing: "0.12em",
                    transition: "all 0.25s", cursor: "default",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(26,127,196,0.58)"; e.currentTarget.style.color = "#90ccf5"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(26,127,196,0.22)"; e.currentTarget.style.color = "rgba(26,127,196,0.7)"; }}
                >
                  <Icon size={11} /> {name}
                </div>
              ))}
            </div>

            <div style={fi(0.54)}>
              <a href="https://github.com/skavy359/Mind-Bridge/releases/download/v1.0/MindBridge-v1.0.0.apk"
                target="_blank" rel="noopener noreferrer" className="cta-btn">
                <Download size={13} /> Download APK
              </a>
            </div>

            <div style={{
              ...fi(0.62),
              padding: "18px 22px",
              borderLeft: "2px solid rgba(26,127,196,0.4)",
              background: "rgba(0,5,18,0.7)",
              fontFamily: "'Courier New',monospace", fontSize: "11px",
              color: "rgba(26,127,196,0.4)", lineHeight: 2, letterSpacing: "0.04em",
            }}>
              <div>TARS: Android only · demo/testing build</div>
              <div>TARS: Real-time features require active internet</div>
              <div>TARS: Install on trusted devices only</div>
            </div>
          </div>

          <div style={{ ...fi(0.22), display: "flex", justifyContent: "center" }}>
            <Carousel />
          </div>
        </section>

        <div style={{
          ...fi(0.65), height: "1px", marginBottom: "80px",
          background: "linear-gradient(90deg,transparent,rgba(26,127,196,0.35) 30%,rgba(26,127,196,0.55) 50%,rgba(26,127,196,0.35) 70%,transparent)",
          boxShadow: "0 0 18px rgba(26,127,196,0.2)",
        }} />

        <section style={fi(0.7)}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "10px", color: "rgba(144,217,255,0.65)", letterSpacing: "0.35em", textTransform: "uppercase", textShadow: "0 0 10px rgba(144,217,255,0.2)" }}>
              ── Core Systems ──
            </span>
            <h2 style={{
              fontFamily: "'Cinzel',serif", fontWeight: 600,
              fontSize: "clamp(20px,2.8vw,32px)", color: "#d0e8f8",
              marginTop: "14px", letterSpacing: "0.1em",
              textShadow: "0 0 40px rgba(26,127,196,0.18)",
            }}>
              What MindBridge Transmits
            </h2>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: "1px", background: "rgba(26,127,196,0.1)",
            border: "1px solid rgba(26,127,196,0.1)",
          }}>
            {features.map(f => (
              <div key={f.title} style={{ background: "#00030a" }}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </section>

        <section style={fi(0.72)}>
          <div style={{ textAlign: "center", marginBottom: "52px", marginTop: "80px" }}>
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "10px", color: "rgba(144,217,255,0.65)", letterSpacing: "0.35em", textTransform: "uppercase", textShadow: "0 0 10px rgba(144,217,255,0.2)" }}>
              ── Inside MindBridge ──
            </span>
            <h2 style={{
              fontFamily: "'Cinzel',serif", fontWeight: 600,
              fontSize: "clamp(20px,2.8vw,32px)", color: "#d0e8f8",
              marginTop: "14px", letterSpacing: "0.1em",
              textShadow: "0 0 40px rgba(26,127,196,0.18)",
            }}>
              Core Features
            </h2>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1px", background: "rgba(26,127,196,0.1)",
            border: "1px solid rgba(26,127,196,0.1)",
          }}>
            {appFeatures.map(f => (
              <div key={f.title} style={{
                background: "#00030a",
                padding: "32px 28px",
                display: "flex", flexDirection: "column", gap: "12px",
              }}>
                <h3 style={{
                  fontFamily: "'Courier New',monospace", fontSize: "13px", color: "#70e0ff",
                  letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, textShadow: "0 0 12px rgba(112,224,255,0.2)",
                }}>{f.title}</h3>
                <p style={{ fontSize: "14px", color: "#7eb4d8", lineHeight: 1.8, margin: 0, fontFamily: "Georgia,serif", textShadow: "0 0 8px rgba(126,180,216,0.12)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          ...fi(0.76), marginTop: "80px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0",
          border: "1px solid rgba(26,127,196,0.18)",
        }}>
          <div style={{
            padding: "56px 48px",
            borderRight: "1px solid rgba(26,127,196,0.12)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse at 0% 100%,rgba(26,127,196,0.07) 0%,transparent 65%)",
            }} />
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "10px", color: "rgba(26,127,196,0.4)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              ── Transmission Ready ──
            </span>
            <h3 style={{
              fontFamily: "'Cinzel',serif", fontWeight: 600,
              fontSize: "clamp(18px,2.2vw,26px)", color: "#d0e8f8",
              marginTop: "18px", marginBottom: "14px", letterSpacing: "0.08em",
            }}>
              Try the Android App
            </h3>
            <p style={{ color: "#304860", fontSize: "14px", lineHeight: 1.9, margin: "0 0 32px", fontStyle: "italic" }}>
              Download the demo APK. Explore the interface, test real-time sync,
              and experience collaborative learning at the speed of data.
            </p>
            <a href="https://github.com/skavy359/Mind-Bridge/releases/download/v1.0/MindBridge-v1.0.0.apk"
              target="_blank" rel="noopener noreferrer" className="cta-btn">
              <Download size={13} /> Download APK · v1.0
            </a>
          </div>

          <div style={{ padding: "56px 48px", background: "rgba(0,5,18,0.8)", fontFamily: "'Courier New',monospace" }}>
            <div style={{ fontSize: "10px", color: "rgba(26,127,196,0.35)", letterSpacing: "0.25em", marginBottom: "24px", textTransform: "uppercase" }}>
              TARS // Build Log
            </div>
            {[
              { t: "00:00:01", m: "MindBridge APK build initiated" },
              { t: "00:00:04", m: "Flutter framework compiled" },
              { t: "00:00:09", m: "Firebase modules linked" },
              { t: "00:00:12", m: "Auth service online" },
              { t: "00:00:15", m: "Firestore sync enabled" },
              { t: "00:00:17", m: "APK package sealed" },
              { t: "00:00:18", m: "TRANSMISSION READY" },
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "10px", fontSize: "11px", lineHeight: 1.7 }}>
                <span style={{ color: "rgba(26,127,196,0.3)", flexShrink: 0 }}>{line.t}</span>
                <span style={{ color: i === 6 ? "rgba(26,127,196,0.9)" : "rgba(26,127,196,0.45)", fontWeight: i === 6 ? "bold" : "normal" }}>{line.m}</span>
              </div>
            ))}
            <div style={{
              marginTop: "28px", padding: "14px 16px",
              border: "1px solid rgba(26,127,196,0.15)",
              fontSize: "11px", color: "rgba(26,127,196,0.3)", lineHeight: 1.9,
            }}>
              <div>PLATFORM  · Android</div>
              <div>PURPOSE   · Demo / Portfolio</div>
              <div>NETWORK   · Required</div>
              <div>DEVICES   · Trusted only</div>
            </div>
          </div>
        </section>

        <footer style={{
          ...fi(0.82), marginTop: "60px", paddingTop: "22px",
          borderTop: "1px solid rgba(26,127,196,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
        }}>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: "9px", color: "rgba(26,127,196,0.2)", letterSpacing: "0.18em" }}>
            MINDBRIDGE · PORTFOLIO DEMO · {new Date().getFullYear()}
          </span>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: "9px", color: "rgba(26,127,196,0.18)", letterSpacing: "0.1em", fontStyle: "italic" }}>
            "Love is the one thing that transcends time and space."
          </span>
        </footer>
      </div>
      <Analytics />
    </div>
  );
};

export default App;