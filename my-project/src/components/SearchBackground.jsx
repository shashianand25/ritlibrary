import React from "react";

export const GLOBAL_STYLE = `
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

export function ResourcesBg() {
  const primary = "#66713f";
  const accent = "#4A5D73";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* base gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg,#050a14 0%,#0d1120 50%,#0a0f0a 100%)",
      }} />
      {/* blobs */}
      {[
        { w: 600, h: 600, top: "-15%", left: "-10%", color: primary, op: 0.18, anim: "blob-float-1 24s ease-in-out infinite" },
        { w: 500, h: 500, top: "50%", right: "-12%", color: accent, op: 0.22, anim: "blob-float-2 28s ease-in-out infinite" },
        { w: 400, h: 400, top: "30%", left: "35%", color: "#84CC16", op: 0.10, anim: "blob-float-3 20s ease-in-out infinite" },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute", width: b.w, height: b.h,
          top: b.top, left: b.left, right: b.right,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
          opacity: b.op,
          animation: b.anim,
          filter: "blur(2px)",
        }} />
      ))}
      {/* noise texture overlay */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
    </div>
  );
}
