import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { ExternalLink, Eye } from "lucide-react";
import { FileIcon, Dots } from "./UIElements.jsx";

/* ────────── file row ────────── */
export function FileRow({ file, index, openMenuId, setOpenMenuId, openPreview, isSmallScreen, colors }) {
  const isOpen = openMenuId === file.id;
  const sectionLabel = file.section && file.section.toLowerCase() !== "gen" ? file.section.toUpperCase() : "Gen";
  const meta = [sectionLabel, file.uploaderName ? `by ${file.uploaderName}` : ""].filter(Boolean).join(" · ");
  return (
    <motion.div
      key={file.id}
      initial={isSmallScreen ? { opacity: 0 } : { opacity: 0, x: -16 }}
      animate={isSmallScreen ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={isSmallScreen ? { duration: 0.15 } : { delay: Math.min(index * 0.05, 0.4) }}
      onClick={e => { e.stopPropagation(); openPreview(file, 'drive'); }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 14px", borderRadius: 14, cursor: "pointer",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: isSmallScreen ? "none" : "blur(8px)",
        transition: "background 0.2s, box-shadow 0.2s",
        userSelect: "none",
        position: "relative",
      }}
      whileHover={{
        background: "rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <FileIcon fileName={file.name} mimeType={file.mimeType} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, opacity: 0.88, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.displayName || file.view || file.name}
          </div>
          {meta && (
            <div style={{ marginTop: 2, fontSize: 11, opacity: 0.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {meta}
            </div>
          )}
        </div>
      </div>

      <ThreeDotMenu
        file={file}
        isOpen={isOpen}
        setOpenMenuId={setOpenMenuId}
        openPreview={openPreview}
        colors={colors}
      />
    </motion.div>
  );
}

/* ────────── three-dot button + portal dropdown ────────── */
function ThreeDotMenu({ file, isOpen, setOpenMenuId, openPreview, colors }) {
  const btnRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpenMenuId(isOpen ? null : file.id);
  };

  const menu = isOpen ? ReactDOM.createPortal(
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: "fixed",
        top: menuPos.top,
        right: menuPos.right,
        zIndex: 9999,
        minWidth: 180,
        borderRadius: 14,
        overflow: "hidden",
        background: "#1e2433",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        animation: "fadeInMenu 0.12s ease",
      }}
    >
      <style>{`
        @keyframes fadeInMenu {
          from { opacity: 0; transform: scale(0.94) translateY(-4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
      <MenuRow
        icon={ExternalLink}
        label="Open in Drive"
        onClick={() => { window.open(`https://drive.google.com/file/d/${file.id}/view`, "_blank"); setOpenMenuId(null); }}
        colors={colors}
      />
      {file.mimeType === "application/pdf" && (
        <>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
          <MenuRow
            icon={Eye}
            label="Mozilla Viewer"
            onClick={() => { openPreview(file, 'mozilla'); setOpenMenuId(null); }}
            colors={colors}
          />
        </>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ flexShrink: 0 }}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        style={{
          width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
          background: isOpen ? "rgba(255,255,255,0.15)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Dots color="rgba(255,255,255,0.65)" />
      </button>
      {menu}
    </div>
  );
}

/* ────────── menu item ────────── */
export function MenuRow({ icon: Icon, label, onClick, colors }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "11px 16px", border: "none", cursor: "pointer",
        background: hover ? "rgba(255,255,255,0.08)" : "transparent",
        color: colors.text, fontSize: 13.5, fontWeight: 500, textAlign: "left",
        transition: "background 0.15s",
      }}
    >
      <Icon size={15} style={{ opacity: 0.7 }} /> {label}
    </button>
  );
}
