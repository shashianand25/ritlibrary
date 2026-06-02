import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles, BookOpen, CheckCircle } from 'lucide-react';
import Header from './Header.jsx';

const primary   = "#66713f";
const secondary = "#A3E635";
const text      = "#F3F4F6";

/* ─── Background ─── */
function AnimatedBackground() {
  useEffect(() => {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, particles = [], animId;

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      const n = Math.min(80, Math.floor((width * height) / 12000));
      for (let i = 0; i < n; i++)
        particles.push({ x: Math.random()*width, y: Math.random()*height, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4, r:Math.random()*1.5+.5 });
    };

    const draw = () => {
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      particles.forEach((p,i) => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>width)p.vx*=-1;
        if(p.y<0||p.y>height)p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        for(let j=i+1;j<particles.length;j++){
          const q=particles[j], d=Math.hypot(p.x-q.x,p.y-q.y);
          if(d<130){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
            ctx.strokeStyle=`rgba(255,255,255,${(1-d/130)*.18})`; ctx.stroke(); }
        }
      });
      animId = requestAnimationFrame(draw);
    };

    init(); draw();
    window.addEventListener("resize", init);
    return () => { window.removeEventListener("resize", init); cancelAnimationFrame(animId); };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none", background:"linear-gradient(135deg,#050a14 0%,#0b1528 100%)" }}>
      <canvas id="particles-canvas" style={{ width:"100%", height:"100%", display:"block" }} />
      <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:900, height:900, background:"radial-gradient(circle,rgba(89,102,40,0.13) 0%,transparent 70%)", top:"-25%", left:"-12%", animation:"blob-float-1 26s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:700, height:700, background:"radial-gradient(circle,rgba(74,93,115,0.18) 0%,transparent 70%)", bottom:"-15%", right:"-12%", animation:"blob-float-2 32s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

const steps = [
  { n:"01", title:"Pick your subject", desc:"Choose your semester, branch, and subject — or just paste the subject code directly." },
  { n:"02", title:"Choose exam type", desc:"Filter by CIE1, CIE2, SEE, or browse Notes and Lab Manuals in one click." },
  { n:"03", title:"View or download", desc:"Open PDFs right in the browser. No login, no downloads, no redirects." },
];

const tags = [
  "CSE","ISE","ECE","EEE","AIML","AIDS","Cyber Security","Civil","Mechanical",
  "IEM","ETE","EIE","MLE","Aerospace","Chemical",
  "CIE1","CIE2","SEE","Notes","Lab Manuals","Question Banks",
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div style={{ minHeight:"100vh", color:text, position:"relative", fontFamily:"'Outfit',system-ui,sans-serif" }}>
        <AnimatedBackground />

        <div style={{ position:"relative", zIndex:10 }}>
          <Header />

          {/* ════════════════════════════════════════
              HERO  — tight vertical spacing
          ════════════════════════════════════════ */}
          <div style={{
            display:"flex", flexDirection:"column",
            alignItems:"center",
            textAlign:"center", padding:"30px 24px 40px",
          }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
              style={{
                display:"inline-flex", alignItems:"center", gap:7,
                padding:"5px 16px", borderRadius:999, marginBottom:36,
                background:`${primary}1e`, border:`1px solid ${primary}40`,
                fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:secondary, textTransform:"uppercase",
              }}
            >
              <Sparkles size={11}/> For RIT Students
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25, duration:0.7 }}
              style={{ fontSize:"clamp(3rem,7vw,5.5rem)", fontWeight:900, lineHeight:1.04, letterSpacing:"-0.04em", marginBottom:0, maxWidth:820 }}
            >
              Your Academic
            </motion.h1>

            <motion.h1
              initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35, duration:0.7 }}
              style={{ fontSize:"clamp(3rem,7vw,5.5rem)", fontWeight:900, lineHeight:1.04, letterSpacing:"-0.04em", marginBottom:36, maxWidth:820 }}
            >
              <span style={{ display:"inline-block", background:`linear-gradient(135deg,${primary} 20%,${secondary} 80%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Resource Hub.
              </span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
              style={{ fontSize:"clamp(15px,2.2vw,18px)", opacity:0.58, lineHeight:1.8, marginBottom:52, maxWidth:500 }}
            >
              Question papers, notes &amp; lab manuals for every RIT subject —<br/>
              one search away, always free.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55 }}
              style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:96 }}
            >
              <motion.button
                whileHover={{ scale:1.04, boxShadow:`0 16px 36px ${primary}55` }}
                whileTap={{ scale:0.97 }}
                onClick={() => navigate('/resources')}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"15px 36px", borderRadius:14,
                  background:`linear-gradient(135deg,${primary},${secondary}cc)`,
                  color:"#fff", fontWeight:700, fontSize:16,
                  border:"none", cursor:"pointer",
                  boxShadow:`0 6px 24px ${primary}44`,
                  letterSpacing:"-0.01em",
                }}
              >
                <Search size={18}/> Browse Resources <ArrowRight size={16}/>
              </motion.button>

              <motion.button
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                onClick={() => navigate('/syllabus')}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"15px 28px", borderRadius:14,
                  background:"rgba(255,255,255,0.07)",
                  backdropFilter:"blur(14px)",
                  color:text, fontWeight:700, fontSize:16,
                  border:"1px solid rgba(255,255,255,0.13)",
                  cursor:"pointer", letterSpacing:"-0.01em",
                }}
              >
                <CheckCircle size={18}/> Syllabus Tracker
              </motion.button>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
              className="stats-strip"
              style={{ borderTop:"1px solid rgba(255,255,255,0.06)", width:"100%", maxWidth:800 }}
            >
              {[
                { value:"2,400+", label:"Question Papers" },
                { value:"800+",   label:"Study Notes"     },
                { value:"120+",   label:"Subjects"        },
                { value:"Live",   label:"Always Fresh"    },
              ].map((s, i) => (
                <div key={i} className="stat-cell" style={{ textAlign:"center" }}>
                  <div style={{
                    fontSize:"clamp(24px,3vw,34px)", fontWeight:800, marginBottom:6,
                    display:"inline-block",
                    background:`linear-gradient(135deg,${secondary},${primary})`,
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  }}>{s.value}</div>
                  <div style={{ fontSize:10.5, opacity:0.38, fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ════════════════════════════════════════
              HOW IT WORKS — numbered steps
          ════════════════════════════════════════ */}
          <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 32px 60px" }}>
            <motion.p
              initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
              style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", opacity:0.35, textTransform:"uppercase", textAlign:"center", marginBottom:64 }}
            >
              How it works
            </motion.p>

            <div className="steps-grid">
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.12, duration:0.6 }}
                  style={{ display:"flex", flexDirection:"column", gap:16 }}
                >
                  <span style={{
                    fontSize:"clamp(3rem,7vw,5rem)", fontWeight:900, lineHeight:1,
                    letterSpacing:"-0.04em",
                    background:`linear-gradient(135deg,${secondary},${primary})`,
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                    display:"inline-block",
                  }}>{s.n}</span>
                  <div>
                    <div style={{ fontSize:"clamp(17px,2vw,20px)", fontWeight:800, marginBottom:10, letterSpacing:"-0.02em" }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize:14, opacity:0.52, lineHeight:1.75, maxWidth:280 }}>
                      {s.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════
              AVAILABLE FOR — tag cloud
          ════════════════════════════════════════ */}
          <div style={{ maxWidth:900, margin:"0 auto", padding:"0 32px 120px", textAlign:"center" }}>
            <motion.p
              initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
              style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", opacity:0.35, textTransform:"uppercase", marginBottom:40 }}
            >
              Available for
            </motion.p>

            <motion.div
              initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.1 }}
              style={{ display:"flex", flexWrap:"wrap", gap:"10px 12px", justifyContent:"center" }}
            >
              {tags.map((tag, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity:0, scale:0.9 }}
                  whileInView={{ opacity:1, scale:1 }}
                  viewport={{ once:true }}
                  transition={{ delay:i*0.03 }}
                  whileHover={{ scale:1.06, opacity:1 }}
                  onClick={() => navigate('/resources')}
                  style={{
                    fontSize:13, fontWeight:600,
                    padding:"7px 16px", borderRadius:999,
                    border:"1px solid rgba(255,255,255,0.1)",
                    color:"rgba(255,255,255,0.55)",
                    cursor:"pointer",
                    transition:"border-color 0.2s, color 0.2s",
                    letterSpacing:"0.01em",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = secondary+"55"; e.currentTarget.style.color = secondary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.5 }}
              style={{ fontSize:14, opacity:0.35, marginTop:36, fontWeight:500 }}
            >
              …and many more
            </motion.p>
          </div>

          {/* ════════════════════════════════════════
              FOOTER
          ════════════════════════════════════════ */}
          <div style={{
            textAlign:"center", padding:"24px",
            fontSize:12, opacity:0.28, fontWeight:500,
            borderTop:"1px solid rgba(255,255,255,0.05)",
          }}>
            RIT Library · Built for students, by students
          </div>
        </div>
      </div>

      <style>{`
        /* ── Stats strip ── */
        .stats-strip {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
        }
        .stat-cell {
          padding: 36px 24px;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .stat-cell:last-child { border-right: none; }

        /* ── Steps grid ── */
        .steps-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 48px;
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .stats-strip {
            grid-template-columns: 1fr 1fr;
            max-width: 340px;
            margin: 0 auto;
          }
          .stat-cell {
            padding: 24px 14px;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .stat-cell:nth-child(odd)  { border-right: 1px solid rgba(255,255,255,0.06); }
          .stat-cell:nth-last-child(-n+2) { border-bottom: none; }
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 52px;
          }
        }
      `}</style>
    </>
  );
}
