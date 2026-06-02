import { motion } from "framer-motion";
import { Github, BookOpen, Database, Layers, Cpu, Zap, Heart } from "lucide-react";
import Header from "./Header.jsx";

const GLOBAL_STYLE = `
@keyframes ritlib-circle {
  from { transform: rotate(0deg);   }
  to   { transform: rotate(360deg); }
}
@keyframes blob-float-1 {
  0%,100%{ transform:translate(0,0) scale(1); }
  33%    { transform:translate(30px,-50px) scale(1.1); }
  66%    { transform:translate(-20px,20px) scale(0.9); }
}
@keyframes blob-float-2 {
  0%,100%{ transform:translate(0,0) scale(1); }
  33%    { transform:translate(-40px,60px) scale(1.15); }
  66%    { transform:translate(20px,-30px) scale(0.95); }
}
@keyframes blob-float-3 {
  0%,100%{ transform:translate(0,0) scale(1); }
  33%    { transform:translate(50px,30px) scale(0.9); }
  66%    { transform:translate(-30px,-40px) scale(1.1); }
}
`;

const primary   = "#66713f";
const secondary = "#A3E635";
const text      = "#F3F4F6";

function PageBg() {
  const accent = "#4A5D73";
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      <div style={{
        position:"absolute", inset:0,
        background: "linear-gradient(135deg,#050a14 0%,#0d1120 50%,#0a0f0a 100%)",
      }}/>
      {[
        { w:700, h:700, top:"-20%", left:"-15%",  color:primary, op:0.15, anim:"blob-float-1 26s ease-in-out infinite" },
        { w:500, h:500, bottom:"-15%", right:"-10%", color:accent, op:0.20, anim:"blob-float-2 30s ease-in-out infinite" },
        { w:350, h:350, top:"40%",  left:"40%",   color:"#84CC16", op:0.09, anim:"blob-float-3 22s ease-in-out infinite" },
      ].map((b,i)=>(
        <div key={i} style={{
          position:"absolute", width:b.w, height:b.h,
          top:b.top, left:b.left, right:b.right, bottom:b.bottom,
          borderRadius:"50%",
          background:`radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
          opacity:b.op, animation:b.anim, filter:"blur(2px)",
        }}/>
      ))}
    </div>
  );
}

const TECH = [
  { icon: Layers,    label: "React 19",         color: "#61dafb" },
  { icon: Zap,       label: "Vite 6",            color: "#bd34fe" },
  { icon: BookOpen,  label: "Framer Motion",     color: "#ff4fe6" },
  { icon: Database,  label: "Cloudflare R2 + KV", color: "#f6821f" },
  { icon: Cpu,       label: "Google Drive API",  color: "#4285f4" },
  { icon: Github,    label: "Firebase Auth",     color: "#ffca28" },
];

const CREATORS = [
  {
    name: "Shashi",
    role: "Full Stack · Product · Infrastructure",
    desc: "Built the public notes and PYQ upload flow, Drive storage, Cloudflare Worker APIs, R2 indexes, Firebase login, events board, and subject search experience.",
    color: "#596628",
    gradient: "linear-gradient(135deg,#596628,#84CC16)",
    initials: "S",
  },
];

const glass = {
  background: "rgba(20,25,35,0.7)",
  backdropFilter:"blur(24px)",
  border:"1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
  borderRadius:24,
};

export default function About() {
  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ minHeight:"100vh", color:text, position:"relative", fontFamily:"'Inter',system-ui,sans-serif" }}>
        <PageBg />
        <div style={{ position:"relative", zIndex:10 }}>
          <Header/>

          <div style={{ maxWidth:860, margin:"0 auto", padding:"20px 24px 80px" }}>

            {/* ── Hero ── */}
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
              style={{ textAlign:"center", marginBottom:60, padding:"0 20px" }}>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"6px 18px", borderRadius:999, marginBottom:20,
                background:`${primary}1a`,
                border:`1px solid ${primary}44`,
                fontSize:12, fontWeight:700, letterSpacing:"0.08em", color:secondary, textTransform:"uppercase",
              }}>
                <Heart size={12}/> Open source · Free forever
              </div>
              <h1 style={{
                fontSize:"clamp(2rem, 5vw, 3rem)", fontWeight:900, margin:"0 0 16px",
                background:`linear-gradient(135deg,${primary},${secondary})`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              }}>
                About RIT Library
              </h1>
              <p style={{ fontSize:17, opacity:0.65, lineHeight:1.7, maxWidth:520, margin:"0 auto" }}>
                A student-built platform where RIT students can find, upload, and keep notes,
                PYQs, and campus opportunities organized — completely free.
              </p>
            </motion.div>

            {/* ── Creator cards ── */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.5 }}>
              <SectionLabel>Built by</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px,1fr))", gap:18, marginBottom:48 }}>
                {CREATORS.map((c, i) => (
                  <motion.div key={c.name}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2+i*0.1 }}
                    whileHover={{ y:-5 }}
                    style={{ ...glass, padding:28 }}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
                      <div style={{
                        width:54, height:54, borderRadius:18, flexShrink:0,
                        background:c.gradient,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:22, fontWeight:900, color:"#fff",
                        boxShadow:`0 6px 20px ${c.color}44`,
                      }}>
                        {c.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight:800, fontSize:18 }}>{c.name}</div>
                        <div style={{ fontSize:12, opacity:0.55, fontWeight:600, letterSpacing:"0.04em", marginTop:2 }}>{c.role}</div>
                      </div>
                    </div>
                    <p style={{ fontSize:14, opacity:0.7, lineHeight:1.65, margin:0 }}>{c.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Mission ── */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              style={{ ...glass, padding:32, marginBottom:48 }}>
              <SectionLabel>Mission</SectionLabel>
              <p style={{ fontSize:16, lineHeight:1.8, opacity:0.75, margin:0 }}>
                Every student at RIT deserves quick access to useful academic material without digging
                through scattered links and forwarded files. RIT Library now lets students upload notes
                and PYQs directly into subject folders, tag them by section or mark them for everyone,
                search by subject code, and discover events, hackathons, and challenges from the same place.
                No paywalls. No clutter. Just shared resources that stay easy to find.
              </p>
            </motion.div>

            {/* ── Tech stack ── */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
              <SectionLabel>Tech Stack</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:14 }}>
                {TECH.map((t, i) => (
                  <motion.div key={t.label}
                    initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.45+i*0.06 }}
                    whileHover={{ y:-4, scale:1.02 }}
                    style={{
                      ...glass, padding:"16px 20px",
                      display:"flex", alignItems:"center", gap:14,
                      cursor:"default",
                    }}
                  >
                    <div style={{
                      width:38, height:38, borderRadius:12, flexShrink:0,
                      background:`${t.color}18`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <t.icon size={18} style={{ color:t.color }}/>
                    </div>
                    <span style={{ fontWeight:700, fontSize:14 }}>{t.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Footer ── */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
              style={{ textAlign:"center", marginTop:64, opacity:0.4, fontSize:13, fontWeight:500 }}>
              RIT Library · Made with <Heart size={11} style={{ display:"inline", verticalAlign:"middle", color:"#ef4444" }}/> for students, by students
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize:11, fontWeight:700, letterSpacing:"0.14em", opacity:0.45,
      textTransform:"uppercase", marginBottom:16,
    }}>
      {children}
    </p>
  );
}
