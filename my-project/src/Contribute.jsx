import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Plus, X, FolderOpen, ShieldAlert,
  CheckCircle, AlertCircle, BookOpen, GraduationCap, ChevronDown,
  FileText, ExternalLink, Trash2, Eye
} from "lucide-react";
import Header from "./Header.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import subjectsData from "./data/subjects.json";
import { branchGroups, COLORS, sectionCountsByBranch } from "./constants/searchData.js";

const WORKER = import.meta.env.VITE_WORKER_URL || "";
const FILES_JSON_URL = import.meta.env.VITE_FILES_JSON_URL || "/api/files.json";
const PUBLIC_UPLOADS_ENABLED = true;
const PUBLIC_DELETES_ENABLED = true;
const C = COLORS;

const NOTE_FOLDERS = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5", "Lab Materials", "Books", "Others"];
const PYQ_FOLDERS = ["2022-23", "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];

const glass = {
  background: "rgba(20,25,35,0.75)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
};

/* ── helpers ── */
function getYearFromSem(sem) {
  const n = parseInt(sem);
  if (n <= 2) return "1st Year";
  if (n <= 4) return "2nd Year";
  if (n <= 6) return "3rd Year";
  return "4th Year";
}
function getSubjects(year, sem, branch) {
  return subjectsData?.[year]?.[sem]?.[branch?.toLowerCase()] || [];
}
function getSectionOptions(branch) {
  const count = sectionCountsByBranch[branch?.toLowerCase()] || 0;
  return [
    { label: "All Sections (Gen)", value: "Gen" },
    ...Array.from({ length: count }, (_, i) => {
      const section = String.fromCharCode(65 + i);
      return { label: `Section ${section}`, value: section };
    }),
  ];
}
function getFileDisplayName(file) {
  const raw = file.view || file.name?.split("/").pop() || "Untitled file";
  return String(raw).replace(/\.[^/.]+$/, "");
}
function getFileSection(file) {
  if (file.section) return file.section;
  const parts = file.name?.split("/") || [];
  return parts.length >= 4 ? parts[parts.length - 2] : "Gen";
}
function matchesFolder(file, category, subjectCode, folder) {
  if (file.category) {
    return file.category.toLowerCase() === category.toLowerCase()
      && file.subjectCode?.toLowerCase() === subjectCode.toLowerCase()
      && file.folderName?.toLowerCase() === folder.toLowerCase();
  }
  const parts = file.name?.split("/") || [];
  return file.name?.startsWith(`${category}/`)
    && parts[4]?.toLowerCase() === subjectCode.toLowerCase()
    && parts[5]?.toLowerCase() === folder.toLowerCase();
}

/* ── Dropdown ── */
function Dropdown({ label, value, onChange, disabled, children }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5, marginBottom: 6, color: "#F3F4F6" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value} onChange={onChange} disabled={disabled}
          style={{
            width: "100%", appearance: "none",
            padding: "11px 36px 11px 14px", borderRadius: 12,
            background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`,
            color: disabled ? "rgba(255,255,255,0.25)" : "#F3F4F6",
            fontSize: 14, fontWeight: 500, outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {children}
        </select>
        <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: disabled ? 0.2 : 0.5, color: C.primary }} />
      </div>
    </div>
  );
}

/* ── Folder Card ── */
function FolderCard({ name, count, isAdmin, isCustom, isActive, onUpload, onRemove, onView }) {
  const isYear = /^\d{4}-\d{2}$/.test(name);
  const color = isYear ? C.primary : C.secondary;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        ...glass,
        borderRadius: 18,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        border: isActive ? `1px solid ${color}88` : glass.border,
      }}
    >
      {isCustom && (
        <button onClick={onRemove} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 2, lineHeight: 0 }}>
          <X size={13} />
        </button>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FolderOpen size={18} style={{ color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#F3F4F6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{count} file{count !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: count ? "1fr 1fr" : "1fr", gap: 8 }}>
          {count > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onView(name)}
              style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: `1px solid ${color}44`, background: `${color}0d`, color, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Eye size={13} /> View
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onUpload(name)}
            style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: `1px dashed ${color}55`, background: `${color}0d`, color, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Upload size={13} /> Upload
          </motion.button>
        </div>
      )}
      {!isAdmin && count > 0 && (
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => onView(name)}
          style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: `1px solid ${color}44`, background: `${color}0d`, color, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Eye size={13} /> View files
        </motion.button>
      )}
    </motion.div>
  );
}

function FolderFilesPanel({ folder, files, isAdmin, deletingFileId, deleteError, onClose, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 190, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.section
        initial={{ scale: 0.94, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 18 }}
        style={{ ...glass, borderRadius: 22, padding: 18, width: "100%", maxWidth: 640, maxHeight: "78vh", overflow: "auto" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 850, color: "#F3F4F6" }}>{folder}</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, opacity: 0.45 }}>{files.length} uploaded file{files.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", lineHeight: 0, padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {deleteError && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 12px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)", color: "#ef4444", fontSize: 12, marginBottom: 12 }}>
            <AlertCircle size={14} /> {deleteError}
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          {files.map(file => {
            const section = getFileSection(file);
            const isDeleting = deletingFileId === file.id;
            return (
              <div key={file.id || file.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: "11px 12px", borderRadius: 12, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.primary}17`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText size={16} style={{ color: C.secondary }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getFileDisplayName(file)}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, opacity: 0.48, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {section || "Gen"}{file.uploaderName ? ` · by ${file.uploaderName}` : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {file.previewUrl && (
                    <a href={file.previewUrl} target="_blank" rel="noreferrer" title="Open file" style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: C.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => onDelete(file)}
                      title="Delete stale file"
                      style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: isDeleting ? "wait" : "pointer", opacity: isDeleting ? 0.55 : 1 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}

/* ── Upload Modal ── */
function UploadModal({ folder, subjectCode, category, year, sem, branch, onClose, onSuccess }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const [section, setSection] = useState("Gen");
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef();
  const sectionOptions = getSectionOptions(branch);

  const handleDrop = (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); };

  const upload = async () => {
    if (!file || status === "uploading") return;
    if (!file) {
      alert('Please select a file.');
    }
    setStatus("uploading"); setErr("");
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("year", year);
      formData.append("sem", sem);
      formData.append("branch", branch);
      formData.append("subjectCode", subjectCode);
      formData.append("folderName", folder);
      formData.append("section", section);
      formData.append("uploaderName", user.displayName || user.email || "Unknown");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${WORKER}/api/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      };

      xhr.onload = () => {
        try {
          const uploadData = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus("success");
            setTimeout(() => { onSuccess(uploadData.file); onClose(); }, 1100);
          } else {
            throw new Error(uploadData.error || "Upload failed");
          }
        } catch (e) {
          setErr(e.message || "Upload failed");
          setStatus("error");
        }
      };

      xhr.onerror = () => {
        setErr("Network error during upload");
        setStatus("error");
      };

      xhr.send(formData);
    } catch (e) {
      setErr(e.message);
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
        style={{ ...glass, borderRadius: 24, padding: 32, width: "100%", maxWidth: 460, color: "#F3F4F6" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Upload to "{folder}"</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.45 }}>{subjectCode} · {category} · {section}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", lineHeight: 0, padding: 4 }}><X size={20} /></button>
        </div>

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle size={52} style={{ color: C.secondary, margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>Uploaded!</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Dropdown label="Section" value={section} onChange={e => setSection(e.target.value)}>
                {sectionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </Dropdown>
              <p style={{ margin: "8px 0 0", fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.45)" }}>
                Replacing old material? Delete the outdated file first so this folder stays useful.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{ border: `2px dashed ${drag ? C.secondary : "rgba(255,255,255,0.15)"}`, borderRadius: 16, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: drag ? `${C.secondary}08` : "transparent", marginBottom: 16, transition: "all 0.2s" }}
            >
              <Upload size={32} style={{ color: drag ? C.secondary : "rgba(255,255,255,0.3)", margin: "0 auto 10px", display: "block" }} />
              {file ? (
                <>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.secondary }}>{file.name}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.45 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Drop file or click to browse</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.45 }}>PDF, PPTX, DOCX, images…</p>
                </>
              )}
              <input ref={inputRef} type="file" style={{ display: "none" }} onChange={e => e.target.files[0] && setFile(e.target.files[0])} />
            </div>

            {status === "error" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13, marginBottom: 14 }}>
                <AlertCircle size={15} /> {err}
              </div>
            )}

            <motion.button
              whileHover={{ scale: file && status !== "uploading" ? 1.02 : 1 }} whileTap={{ scale: file && status !== "uploading" ? 0.97 : 1 }}
              onClick={upload} disabled={!file || status === "uploading"}
              style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "none", cursor: (!file || status === "uploading") ? "not-allowed" : "pointer", background: !file ? "rgba(255,255,255,0.07)" : (status === "uploading" ? "rgba(255,255,255,0.15)" : `linear-gradient(135deg,${C.primary},${C.secondary}cc)`), color: "#fff", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !file ? 0.45 : 1, position: "relative", overflow: "hidden" }}
            >
              {status === "uploading" && (
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${uploadProgress}%`, background: `linear-gradient(135deg,${C.primary},${C.secondary}cc)`, transition: "width 0.2s linear", zIndex: 0 }} />
              )}
              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                {status === "uploading"
                  ? <><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> Uploading {uploadProgress}%</>
                  : <><Upload size={16} /> Upload File</>
                }
              </div>
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   MAIN PAGE
═══════════════════════════════════ */
export default function Contribute() {
  const { user, isAdmin } = useAuth();
  const canUpload = Boolean(user && (isAdmin || PUBLIC_UPLOADS_ENABLED));
  const canDelete = Boolean(isAdmin || PUBLIC_DELETES_ENABLED);

  const [mode, setMode] = useState(() => localStorage.getItem("contributeMode") || "notes");
  const [semester, setSemester] = useState(() => localStorage.getItem("contributeSem") || "");
  const [branch, setBranch] = useState(() => localStorage.getItem("contributeBranch") || "");
  const [subject, setSubject] = useState(() => localStorage.getItem("contributeSubject") || "");
  const [subjectCode, setSubjectCode] = useState(() => localStorage.getItem("contributeSubjectCode") || "");

  const [customFolders, setCustomFolders] = useState([]);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolder, setNewFolder] = useState("");

  const [allFiles, setAllFiles] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [activeFolder, setActiveFolder] = useState("");
  const [deletingFileId, setDeletingFileId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  /* Persist selections */
  useEffect(() => { localStorage.setItem("contributeMode", mode); }, [mode]);
  useEffect(() => { localStorage.setItem("contributeSem", semester); }, [semester]);
  useEffect(() => { localStorage.setItem("contributeBranch", branch); }, [branch]);
  useEffect(() => { localStorage.setItem("contributeSubject", subject); }, [subject]);
  useEffect(() => { localStorage.setItem("contributeSubjectCode", subjectCode); }, [subjectCode]);


  /* Cascade */
  const year = semester ? getYearFromSem(semester) : "";
  const branches = year ? (branchGroups[year] || []) : [];
  const subjects = (year && semester && branch) ? getSubjects(year, semester, branch) : [];

  const handleSem = (e) => { setSemester(e.target.value); setBranch(""); setSubject(""); setSubjectCode(""); setActiveFolder(""); };
  const handleBranch = (e) => { setBranch(e.target.value); setSubject(""); setSubjectCode(""); setActiveFolder(""); };
  const handleSubject = (e) => {
    const val = e.target.value;
    setSubject(val);
    const sel = subjects.find(s => s.value === val);
    setSubjectCode(sel?.code || sel?.value || "");
    setActiveFolder("");
  };

  /* Load files from Worker */
  useEffect(() => {

    fetch(FILES_JSON_URL)
      .then(r => r.json())
      .then(d => setAllFiles(Array.isArray(d) ? d : []))
      .catch(() => { });
  }, []);

  /* On mode change, clear custom folders */
  const handleMode = (m) => { setMode(m); setCustomFolders([]); setActiveFolder(""); };

  const allDisplayFiles = [...allFiles, ...localFiles];
  const baseFolders = mode === "notes" ? NOTE_FOLDERS : PYQ_FOLDERS;
  const allFolders = [...baseFolders, ...customFolders];
  const selectionDone = semester && branch && subject && subjectCode;

  const folderFiles = (folder) => {
    const category = mode === "notes" ? "Notes" : "PYQ";
    return allDisplayFiles.filter(f => matchesFolder(f, category, subjectCode, folder));
  };
  const fileCount = (folder) => folderFiles(folder).length;

  const deleteFile = async (file) => {
    if (!file?.id || !canDelete || deletingFileId) return;
    const ok = window.confirm(`Delete "${getFileDisplayName(file)}" from Drive and the library index?`);
    if (!ok) return;
    setDeletingFileId(file.id);
    setDeleteError("");
    try {
      const idToken = user ? await user.getIdToken() : "";
      const res = await fetch(`${WORKER}/api/files/${encodeURIComponent(file.id)}`, {
        method: "DELETE",
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setAllFiles(prev => prev.filter(item => item.id !== file.id));
      setLocalFiles(prev => prev.filter(item => item.id !== file.id));
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeletingFileId("");
    }
  };

  const addFolder = () => {
    const name = newFolder.trim();
    if (!name || allFolders.includes(name)) return;
    setCustomFolders(p => [...p, name]);
    setNewFolder(""); setShowAddFolder(false);
  };

  const activeFolderFiles = activeFolder ? folderFiles(activeFolder) : [];

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: "100vh", color: "#F3F4F6", background: "linear-gradient(135deg,#050a14 0%,#0d1120 50%,#0a0f0a 100%)", fontFamily: "'Inter',system-ui,sans-serif", position: "relative" }}>
        {/* Ambient blobs */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          {[{ w: 600, h: 600, top: "-10%", left: "-12%", c: C.primary, o: 0.13 },
          { w: 500, h: 500, top: "55%", right: "-10%", c: C.accent, o: 0.17 },
          { w: 350, h: 350, top: "20%", left: "40%", c: "#84CC16", o: 0.07 }].map((b, i) => (
            <div key={i} style={{ position: "absolute", width: b.w, height: b.h, top: b.top, left: b.left, right: b.right, borderRadius: "50%", background: `radial-gradient(circle,${b.c} 0%,transparent 70%)`, opacity: b.o, filter: "blur(2px)" }} />
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 10 }}>
          <Header />

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 24px 80px" }}>

            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "5px 16px", borderRadius: 999, background: `${C.primary}1a`, border: `1px solid ${C.primary}44`, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.secondary, textTransform: "uppercase" }}>
                {canUpload ? <><ShieldAlert size={12} /> Contributor Access</> : <><BookOpen size={12} /> Library Contribute</>}
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 900, margin: "0 0 8px", background: `linear-gradient(135deg,${C.primary},${C.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Contribute to RIT Library
              </h1>
              <p style={{ fontSize: 14, opacity: 0.55, maxWidth: 440, margin: "0 auto", lineHeight: 1.7 }}>
                {canUpload ? "Select a subject, then upload files into any folder below." : "Browse by subject — sign in to upload for the showcase."}
              </p>
            </motion.div>

            {/* ══ Selector bar ══ */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              style={{ ...glass, borderRadius: 20, padding: "20px 24px", marginBottom: 24 }}>
              {/* Mode tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 18, padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 12, width: "fit-content" }}>
                {[{ id: "notes", icon: BookOpen, label: "Notes" }, { id: "pyq", icon: GraduationCap, label: "PYQ" }].map(m => (
                  <button key={m.id} onClick={() => handleMode(m.id)} type="button"
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: mode === m.id ? C.primary : "transparent", color: mode === m.id ? "#fff" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }}>
                    <m.icon size={14} /> {m.label}
                  </button>
                ))}
              </div>

              {/* 3 selectors in a row */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Dropdown label="Semester" value={semester} onChange={handleSem}>
                  <option value="" disabled hidden>Select Semester</option>
                  {["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Dropdown>

                <Dropdown label="Branch" value={branch} onChange={e => handleBranch(e)} disabled={!year}>
                  <option value="" disabled hidden>Select Branch</option>
                  {branches.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
                </Dropdown>

                <Dropdown label="Subject" value={subject} onChange={handleSubject} disabled={!branch}>
                  <option value="" disabled hidden>Select Subject</option>
                  {subjects.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
                </Dropdown>
              </div>

              {selectionDone && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 14, padding: "8px 14px", borderRadius: 10, background: `${C.primary}15`, border: `1px solid ${C.primary}33`, display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.secondary }}>{subjectCode}</span>
                  <span style={{ fontSize: 12, opacity: 0.55 }}>·</span>
                  <span style={{ fontSize: 12, opacity: 0.6 }}>{subjects.find(s => s.value === subject)?.label}</span>
                </motion.div>
              )}
            </motion.div>

            {/* ══ Folders section ══ */}
            <AnimatePresence mode="wait">
              {!selectionDone ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ ...glass, borderRadius: 20, padding: "52px 24px", textAlign: "center", opacity: 0.6 }}>
                  <FolderOpen size={48} style={{ color: C.primary, margin: "0 auto 14px", display: "block", opacity: 0.4 }} />
                  <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Select semester, branch and subject above</p>
                  <p style={{ fontSize: 13, opacity: 0.55, marginTop: 6 }}>Folder structure will appear here</p>
                </motion.div>
              ) : (
                <motion.div key="folders" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* Folder bar header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.4 }}>
                      {mode === "notes" ? "Notes Folders" : "PYQ Year Folders"} — {subjectCode}
                    </p>
                    {canUpload && (
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setShowAddFolder(p => !p)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1px solid ${C.primary}44`, background: `${C.primary}0d`, color: C.secondary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        <Plus size={13} /> Add Folder
                      </motion.button>
                    )}
                  </div>

                  {/* Add folder input */}
                  <AnimatePresence>
                    {showAddFolder && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden", marginBottom: 14 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input value={newFolder} onChange={e => setNewFolder(e.target.value)} onKeyDown={e => e.key === "Enter" && addFolder()}
                            placeholder="Folder name (e.g. Assignment, Syllabus)"
                            autoFocus
                            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: `1.5px solid ${C.primary}55`, color: "#F3F4F6", fontSize: 13, outline: "none" }} />
                          <button onClick={addFolder} style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.primary},${C.secondary}cc)`, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Add</button>
                          <button onClick={() => { setShowAddFolder(false); setNewFolder(""); }} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", lineHeight: 0 }}><X size={15} /></button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14 }}>
                    {allFolders.map(folder => (
                      <FolderCard
                        key={folder} name={folder}
                        count={fileCount(folder)}
                        isAdmin={canUpload}
                        isCustom={customFolders.includes(folder)}
                        isActive={activeFolder === folder}
                        onUpload={setUploadTarget}
                        onView={setActiveFolder}
                        onRemove={() => setCustomFolders(p => p.filter(x => x !== folder))}
                      />
                    ))}
                  </div>

                  <AnimatePresence>
                    {activeFolder && activeFolderFiles.length > 0 && (
                      <FolderFilesPanel
                        folder={activeFolder}
                        files={activeFolderFiles}
                        isAdmin={canDelete}
                        deletingFileId={deletingFileId}
                        deleteError={deleteError}
                        onClose={() => { setActiveFolder(""); setDeleteError(""); }}
                        onDelete={deleteFile}
                      />
                    )}
                  </AnimatePresence>

                  {/* Not admin hint */}
                  {user && !canUpload && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ marginTop: 20, padding: "11px 16px", borderRadius: 12, background: "rgba(102,113,63,0.08)", border: "1px solid rgba(102,113,63,0.2)", fontSize: 12, opacity: 0.7, display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldAlert size={14} style={{ color: C.secondary, flexShrink: 0 }} />
                      Your account is not in the admin list — contact a library admin to get upload access.
                    </motion.div>
                  )}
                  {!user && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ marginTop: 20, padding: "11px 16px", borderRadius: 12, background: "rgba(102,113,63,0.08)", border: "1px solid rgba(102,113,63,0.2)", fontSize: 12, opacity: 0.7, display: "flex", alignItems: "center", gap: 8 }}>
                      <ShieldAlert size={14} style={{ color: C.secondary, flexShrink: 0 }} />
                      Sign in with Google from the header to unlock uploads.
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Upload modal */}
        <AnimatePresence>
          {uploadTarget && (
            <UploadModal
              folder={uploadTarget}
              subjectCode={subjectCode}
              category={mode === "notes" ? "Notes" : "PYQ"}
              year={year} sem={semester} branch={branch}
              onClose={() => setUploadTarget(null)}
              onSuccess={file => { setLocalFiles(p => [...p, file]); setUploadTarget(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
