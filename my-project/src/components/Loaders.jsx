import React from "react";

export function CircleLoader({ size = 44, color = "#596628" }) {
  const rings = [
    { s: size, top: "0%", left: "0%", delay: "0s" },
    { s: size * 0.90, top: "1.75%", left: "0.875%", delay: "0.2s" },
    { s: size * 0.80, top: "3.5%", left: "1.75%", delay: "0.4s" },
    { s: size * 0.70, top: "5.25%", left: "2.625%", delay: "0.6s" },
    { s: size * 0.60, top: "7%", left: "3.5%", delay: "0.8s" },
  ];
  return (
    <span style={{ display: "inline-block", position: "relative", width: size, height: size }}>
      {rings.map((r, i) => (
        <span key={i} style={{
          position: "absolute", height: r.s, width: r.s,
          borderTop: `1.5px solid ${color}`, borderBottom: "none",
          borderLeft: `1.5px solid ${color}`, borderRight: "none",
          borderRadius: "100%",
          top: r.top, left: r.left,
          animation: `ritlib-circle 1s linear ${r.delay} infinite`,
        }} />
      ))}
    </span>
  );
}