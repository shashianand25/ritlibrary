import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { PdfIcon, ImageIcon } from "../svg.jsx";

/* ────────── file icon ────────── */
export const FileIcon = ({ fileName, mimeType }) => {
  if (mimeType === "application/pdf") return <PdfIcon />;
  if (mimeType?.startsWith("image/")) return <ImageIcon />;
  const ext = fileName?.toLowerCase().split('.').pop();
  if (ext === 'pdf') return <PdfIcon />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return <ImageIcon />;
  return <PdfIcon />;
};

/* ────────── styled select ────────── */
export function StyledSelect({ label, name, value, onChange, disabled, required, children, colors }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.6, marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          name={name} value={value} onChange={onChange}
          disabled={disabled} required={required}
          style={{
            width: "100%", appearance: "none", cursor: disabled ? "not-allowed" : "pointer",
            padding: "10px 36px 10px 14px", borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: disabled ? "rgba(255,255,255,0.3)" : colors.text,
            fontSize: 14, fontWeight: 500,
            outline: "none", transition: "border 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => { e.target.style.border = `1px solid ${colors.primary}`; e.target.style.boxShadow = `0 0 0 3px ${colors.primary}22`; }}
          onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
        >
          {children}
        </select>
        <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5, color: colors.primary }} />
      </div>
    </div>
  );
}

/* ────────── pill toggle button ────────── */
export function PillBtn({ active, onClick, children, colors }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: "7px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700,
        border: `2px solid ${active ? colors.accent : (colors.accent + "55")}`,
        background: active ? colors.accent : "transparent",
        color: active ? "#fff" : colors.accent,
        cursor: "pointer", transition: "all 0.2s",
      }}
    >
      {children}
    </motion.button>
  );
}

/* ────────── three-dot menu ────────── */
export function Dots({ size = 20, color = "#888" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" style={{ width: size, height: size, color }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}
