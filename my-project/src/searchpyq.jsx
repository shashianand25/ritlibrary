import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Code, BookOpen, FileText,
  ChevronDown, Sparkles, ExternalLink, Eye,
  BookMarked, GraduationCap, Layers
} from 'lucide-react';
import subjectsData from "./data/subjects.json";
import DrivePreview from "./pdf";
import Mozillapdf from "./mozillapdf";
import { pdfjs } from 'react-pdf';
import { PdfIcon, ImageIcon } from './svg.jsx';
import Header from './Header.jsx';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import { branchGroups, examTypesList, electiveOptions, COLORS } from "./constants/searchData.js";
import { ResourcesBg, GLOBAL_STYLE } from "./components/SearchBackground.jsx";
import { CircleLoader } from "./components/Loaders.jsx";
import { StyledSelect, PillBtn } from "./components/UIElements.jsx";
import { FileRow } from "./components/FileRow.jsx";

const FILES_JSON_URL = import.meta.env.VITE_WORKER_URL || "https://library-backend.ritlibrary.workers.dev/";

function normalizeSearch(str) {
  return (str || "").toLowerCase().replace(/[\s/_-]+/g, '');
}

function getFileCategory(file) {
  if (file.category) return file.category.toLowerCase();
  const first = file.name?.split(/[/\\]/).filter(Boolean)[0]?.toLowerCase() || "";
  if (first === "notes") return "notes";
  if (first === "pyq") return "pyq";
  return "";
}

function getFileSubjectCode(file) {
  if (file.subjectCode) return file.subjectCode;
  const parts = file.name?.split(/[/\\]/).filter(Boolean) || [];
  const first = parts[0]?.toLowerCase();
  if (first === "notes" || first === "pyq") return parts[4] || "";
  return parts[1] || "";
}

function getFileFolderName(file, currentSubjectCode = "") {
  if (file.folderName) return file.folderName;
  const parts = file.name?.split(/[/\\]/).filter(Boolean) || [];
  const first = parts[0]?.toLowerCase();
  if (first === "notes" || first === "pyq") return parts[5] || "";
  const codeIndex = parts.findIndex(p => p.toLowerCase() === currentSubjectCode.toLowerCase());
  return codeIndex > 0 ? parts[codeIndex - 1] : (parts[0] || "Other");
}

function getFileSection(file, currentSubjectCode = "") {
  if (file.section) return file.section;
  const parts = file.name?.split(/[/\\]/).filter(Boolean) || [];
  const first = parts[0]?.toLowerCase();
  if (first === "notes" || first === "pyq") return parts[6] || "Gen";
  const codeIndex = parts.findIndex(p => p.toLowerCase() === currentSubjectCode.toLowerCase());
  return codeIndex >= 0 ? (parts[codeIndex + 1] || "Gen") : "Gen";
}

function getFileLeafName(file, currentSubjectCode = "") {
  const parts = file.name?.split(/[/\\]/).filter(Boolean) || [];
  const first = parts[0]?.toLowerCase();
  if (first === "notes" || first === "pyq") return parts[7] || parts[parts.length - 1] || file.name;
  const codeIndex = parts.findIndex(p => p.toLowerCase() === currentSubjectCode.toLowerCase());
  return codeIndex >= 0 ? (parts[codeIndex + 2] || parts[parts.length - 1]) : (parts[parts.length - 1] || file.name);
}

/* ════════════════════════════════════════
   Main component
════════════════════════════════════════ */
export default function SearchPYQ() {
  /* ── always dark ── */
  const colors = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
  };

  /* ── responsive ── */
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const h = () => setIsSmallScreen(window.innerWidth < 768);
    h(); window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ── form state (persisted) ── */
  const [form, setForm] = useState(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem("searchSettings");
      return s ? JSON.parse(s) : { year: "", branch: "", semester: "", subject: "", subSubject: "" };
    }
    return { year: "", branch: "", semester: "", subject: "", subSubject: "" };
  });
  const [cycleTag, setCycleTag] = useState("");
  const [showElective, setShowElective] = useState(false);
  const [examTypes, setExamTypes] = useState(["CIE1", "CIE2", "SEE"]);
  const [searchMode, setSearchMode] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem("searchMode") || "guided" : "guided"));
  const [subjectCode, setSubjectCode] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem("lastSubjectCode") || "" : ""));
  const [codeError, setCodeError] = useState("");

  /* ── results ── */
  const [pdfFiles, setPdfFiles] = useState([]);
  const [notesFiles, setNotesFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSyncBtn, setShowSyncBtn] = useState(false);
  const [showSyncRight, setShowSyncRight] = useState(false);
  const [showResultsLoading, setShowResultsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [currentSubjectCode, setCurrentSubjectCode] = useState("");
  const [resultsPanelRef, setResultsPanelRef] = useState(null);

  /* ── data from github ── */
  const [allData, setAllData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  /* persist settings */
  useEffect(() => { localStorage.setItem("searchSettings", JSON.stringify(form)); }, [form]);
  useEffect(() => { localStorage.setItem("searchMode", searchMode); }, [searchMode]);
  useEffect(() => { localStorage.setItem("lastSubjectCode", subjectCode); }, [subjectCode]);

  /* load github data */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(FILES_JSON_URL);
        const data = await res.json();
        let loadedData = [];
        if (data?.files) { loadedData = data.files; if (data.lastUpdated) setLastUpdated(data.lastUpdated); }
        else if (Array.isArray(data)) loadedData = data;
        setAllData(loadedData);

        const urlParams = new URLSearchParams(window.location.search);
        const vId = urlParams.get('v');
        if (vId && loadedData.length > 0) {
          const targetFile = loadedData.find(f => f.id === vId);
          if (targetFile) {
            setPreviewFile({
              id: targetFile.id, mimeType: targetFile.mimeType, viewerType: 'drive',
              name: targetFile.name, view: targetFile.view || targetFile.name,
            });
            window.history.replaceState({ deepLink: true }, '', `?v=${targetFile.id}`);
          }
        }
      } catch (e) { console.error("Failed to load GitHub database", e); }
      finally { setIsDataLoading(false); }
    })();
  }, []);

  /* load exam types */
  useEffect(() => {
    const s = localStorage.getItem("examTypes");
    if (s) { try { setExamTypes(JSON.parse(s)); } catch { setExamTypes([s]); } }
  }, []);

  /* cycle tag */
  useEffect(() => {
    if (form.year === "1st Year" && form.semester && form.branch) {
      const isCS = form.branch === "cs", is1st = form.semester === "1st Sem";
      const cycle = (isCS && is1st) || (!isCS && !is1st) ? "Phys Cycle" : "Chem Cycle";
      setCycleTag(cycle);
      const t = setTimeout(() => setCycleTag(""), 3000);
      return () => clearTimeout(t);
    }
  }, [form.year, form.branch, form.semester]);

  /* helpers */
  const getYearFromSemester = sem => {
    const n = parseInt(sem);
    if (isNaN(n)) return "";
    if (n <= 2) return "1st Year";
    if (n <= 4) return "2nd Year";
    if (n <= 6) return "3rd Year";
    return "4th Year";
  };
  const getSubjectsFromJSON = (year, semester, branch) =>
    subjectsData?.[year]?.[semester]?.[branch.toLowerCase()] || [];
  const subjects = (form.year && form.semester && form.branch)
    ? getSubjectsFromJSON(form.year, form.semester, form.branch) : [];

  useEffect(() => {
    if (form.subject && subjects.length > 0) {
      const s = subjects.find(s => s.value === form.subject);
      setShowElective(s?.elective || false);
    }
  }, [form.subject, subjects]);

  /* close menu on outside click */
  useEffect(() => {
    const h = () => setOpenMenuId(null);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  /* popstate → close preview */
  useEffect(() => {
    if (previewFile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [previewFile]);

  useEffect(() => {
    const h = () => setPreviewFile(null);
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "") { setForm({ year: value, branch: "", semester: "", subject: "", subSubject: "" }); setShowElective(false); return; }
    if (name === "semester") { setForm(p => ({ ...p, semester: value, year: getYearFromSemester(value), branch: "", subject: "", subSubject: "" })); setShowElective(false); return; }
    if (name === "branch") { setForm(p => ({ ...p, branch: value, subject: "", subSubject: "" })); setShowElective(false); return; }
    if (name === "subject") {
      setForm(p => ({ ...p, subject: value, subSubject: "" }));
      const s = subjects.find(s => s.value === value);
      setShowElective(s?.elective || false);
      return;
    }
    setForm(p => ({ ...p, [name]: value }));
  };

  const scrollToResults = () => {
    if (isSmallScreen) setTimeout(() => {
      if (resultsPanelRef) resultsPanelRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollBy({ top: 900, behavior: 'smooth' });
    }, 150);
  };

  const openPreview = (file, viewer = 'drive') => {
    const fileData = {
      id: file.id, mimeType: file.mimeType, viewerType: viewer,
      name: file.name,
      view: `${currentSubjectCode} ${file.view || file.name}${file.year ? ` (${file.year})` : ''}`,
    };
    window.history.pushState({ modal: true }, '', `?v=${file.id}`);
    setPreviewFile(fileData);
    setOpenMenuId(null);
  };

  const closePreview = () => {
    if (window.history.state?.modal) {
      window.history.back();
    } else {
      window.history.pushState({}, '', window.location.pathname);
      setPreviewFile(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitted(true);
    setIsSearching(true);
    setShowResultsLoading(true);
    if (isSmallScreen) setTimeout(scrollToResults, 300);
    setTimeout(() => setShowResultsLoading(false), 600);

    let finalCode;
    if (searchMode === "code") {
      finalCode = subjectCode.trim();
      if (!finalCode || finalCode.length < 4) {
        setIsSearching(false);
        setCodeError("Subject code must be at least 4 characters");
        setTimeout(() => setCodeError(""), 3000);
        return;
      }
    } else {
      const sel = subjects.find(s => s.value === form.subject);
      finalCode = sel?.elective ? form.subSubject : (sel?.code || sel?.value);
      if (!finalCode) { setIsSearching(false); return; }
    }
    if (examTypes.length === 0) { setIsSearching(false); return; }

    if (lastUpdated && !isRefreshing) {
      const diff = Date.now() - new Date(lastUpdated).getTime();
      if (diff > 10 * 60 * 1000) { // 10 minutes
        setIsRefreshing(true);
        setShowSyncBtn(true);
        setShowSyncRight(true);

        fetch("/api/cron/sync-drive", { keepalive: true })
          .then(res => res.json())
          .then(data => console.log("Cache refresh response:", data))
          .finally(() => setIsRefreshing(false))
          .catch(err => console.error("Cache refresh error:", err));

        // Visual timers (just for show)
        setTimeout(() => setShowSyncRight(false), 1000);
        setTimeout(() => setShowSyncBtn(false), 3000);
      }
    }

    try {
      setCurrentSubjectCode(finalCode);
      const code = normalizeSearch(finalCode);

      const pyqResults = allData.filter(file => {
        if (getFileCategory(file) !== "pyq") return false;
        
        const fileCode = normalizeSearch(getFileSubjectCode(file));
        if (fileCode !== code) {
          if (fileCode === "all") {
             if (form.sem && form.branch) {
               if (file.sem !== form.sem || file.branch !== form.branch) return false;
             }
          } else {
            return false;
          }
        }
        
        const searchable = normalizeSearch(`${file.name} ${file.view || ""} ${file.folderName || ""}`);
        return examTypes.some(t => searchable.includes(normalizeSearch(t)));
      });
      const notesResults = allData.filter(file => {
        if (getFileCategory(file) !== "notes") return false;
        
        const fileCode = normalizeSearch(getFileSubjectCode(file));
        if (fileCode !== code) {
          if (fileCode === "all") {
             if (form.sem && form.branch) {
               if (file.sem !== form.sem || file.branch !== form.branch) return false;
             }
          } else {
            return false;
          }
        }
        return true;
      });

      setPdfFiles(Array.from(new Map(pyqResults.map(f => [f.id, f])).values()));
      setNotesFiles(Array.from(new Map(notesResults.map(f => [f.id, f])).values()));
    } catch (err) {
      console.error(err);
      setPdfFiles([]); setNotesFiles([]);
    } finally {
      setIsSearching(false);
    }
  };

  const capitalizeWords = str => str.replace(/\b\w/g, c => c.toUpperCase());

  const groupedNotes = useMemo(() => {
    if (!notesFiles?.length) return [];
    const grouped = {};
    notesFiles.forEach(file => {
      let folder = getFileFolderName(file, currentSubjectCode);
      folder = folder.replace(/\.[^/.]+$/, '').trim();
      const generic = ["notes", "important notes", "book", "books", "lab codes", "queston bank", "question bank", (currentSubjectCode || "").toLowerCase()];
      if (!folder || generic.includes(folder.toLowerCase())) {
        const nl = (file.view || "").toLowerCase();
        if (/\bunit[-\s]?\d+/i.test(nl) || nl.includes("unit") || nl.includes("module")) folder = "Units";
        else if (nl.includes("tutorial") || nl.includes("tut") || nl.includes("exercise")) folder = "Tutorials";
        else if (nl.includes("book") || nl.includes("reference")) folder = "Books";
        else if (nl.includes("lab") || nl.includes("manual") || nl.includes("experiment")) folder = "Lab Manuals";
        else if (nl.includes("question") || nl.includes("paper") || nl.includes("qb")) folder = "Question Papers";
        else if (nl.includes("syllabus") || nl.includes("curriculum")) folder = "Syllabus";
        else if (nl.includes("note") || nl.includes("material")) folder = "Notes";
        else folder = capitalizeWords(folder) || "Other";
      }
      if (!grouped[folder]) grouped[folder] = [];
      const fileName = getFileLeafName(file, currentSubjectCode);
      const structuredSection = getFileSection(file, currentSubjectCode);
      const sectionPrefix = structuredSection && structuredSection.toLowerCase() !== "gen" ? `${structuredSection.toUpperCase()} · ` : "";
      grouped[folder].push({
        ...file,
        displayName: `${sectionPrefix}${file.view || fileName.replace(/\.[^/.]+$/, '')}`,
      });
    });
    return Object.entries(grouped).sort(([a], [b]) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();

      const isAUnit = aLower.includes('unit');
      const isBUnit = bLower.includes('unit');

      if (isAUnit && !isBUnit) return -1;
      if (!isAUnit && isBUnit) return 1;

      const priority = { notes: 1, tutorials: 2, books: 3, 'lab manuals': 4, 'question papers': 5, syllabus: 6, other: 99 };
      return (priority[aLower] ?? 98) - (priority[bLower] ?? 98);
    });
  }, [notesFiles, currentSubjectCode]);

  const groupedPDFs = useMemo(() => {
    if (!pdfFiles?.length) return [];
    return Object.entries(
      pdfFiles.reduce((acc, f) => {
        const group = f.folderName || f.year || "PYQ";
        const section = getFileSection(f, currentSubjectCode);
        const sectionPrefix = section && section.toLowerCase() !== "gen" ? `${section.toUpperCase()} · ` : "";
        const leafName = getFileLeafName(f, currentSubjectCode);
        acc[group] = acc[group] || [];
        acc[group].push({
          ...f,
          displayName: `${sectionPrefix}${f.view || leafName.replace(/\.[^/.]+$/, '')}`,
        });
        return acc;
      }, {})
    ).sort(([a], [b]) => parseInt(b.split("-")[0]) - parseInt(a.split("-")[0]));
  }, [pdfFiles, currentSubjectCode]);

  /* ── shared panel style ── */
  const glass = {
    background: "rgba(20,25,35,0.7)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>

      <div style={{ minHeight: "100vh", color: colors.text, position: "relative", fontFamily: "'Inter',system-ui,sans-serif" }}>
        <ResourcesBg />

        <div style={{ position: "relative", zIndex: 10 }}>
          <Header />

          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px 40px", display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: 20, alignItems: "stretch" }}>

            {/* ══════════ LEFT: Search Form ══════════ */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                ...glass, borderRadius: 24, padding: 28,
                flexShrink: 0, width: isSmallScreen ? "100%" : 340,
                display: "flex", flexDirection: "column", gap: 20,
              }}
            >
              {/* Mode toggle */}
              <div style={{
                display: "flex", borderRadius: 14, padding: 4,
                background: "rgba(255,255,255,0.06)",
              }}>
                {[
                  { id: "guided", icon: BookOpen, label: "Guided" },
                  { id: "code", icon: Code, label: "Code" },
                ].map(m => (
                  <motion.button
                    key={m.id} type="button"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSearchMode(m.id)}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "10px 0", borderRadius: 11, border: "none", cursor: "pointer",
                      fontWeight: 700, fontSize: 14,
                      background: searchMode === m.id ? colors.primary : "transparent",
                      color: searchMode === m.id ? "#fff" : colors.text,
                      opacity: searchMode === m.id ? 1 : 0.6,
                      transition: "all 0.2s",
                    }}
                  >
                    <m.icon size={16} /> {m.label}
                  </motion.button>
                ))}
              </div>

              {/* Exam type pills */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.5, marginBottom: 8 }}>
                  Exam Type
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                  {examTypesList.map(type => (
                    <PillBtn key={type} active={examTypes.includes(type)} colors={colors}
                      onClick={() => setExamTypes(prev => {
                        const n = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
                        localStorage.setItem("examTypes", JSON.stringify(n));
                        return n;
                      })}>
                      {type}
                    </PillBtn>
                  ))}
                </div>
              </div>

              {/* Form fields */}
              <AnimatePresence mode="wait">
                {searchMode === "guided" ? (
                  <motion.div key="guided" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    <StyledSelect label="Semester" name="semester" value={form.semester} onChange={handleChange} required colors={colors}>
                      <option value="" disabled hidden>Select Semester</option>
                      {["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </StyledSelect>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.6, marginBottom: 6 }}>
                        Branch {cycleTag && <span style={{ color: "#60a5fa", fontWeight: 600, fontSize: 11, marginLeft: 6 }}>({cycleTag})</span>}
                      </label>
                      <div style={{ position: "relative" }}>
                        <select name="branch" value={form.branch} onChange={handleChange} required disabled={!form.year}
                          style={{
                            width: "100%", appearance: "none", cursor: !form.year ? "not-allowed" : "pointer",
                            padding: "10px 36px 10px 14px", borderRadius: 12,
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: !form.year ? "rgba(255,255,255,0.3)" : colors.text,
                            fontSize: 14, fontWeight: 500, outline: "none",
                          }}>
                          <option value="" disabled hidden>Select Branch</option>
                          {form.year && branchGroups[form.year]?.map(({ label, value }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5, color: colors.primary }} />
                      </div>
                    </div>

                    <StyledSelect label="Subject" name="subject" value={form.subject} onChange={handleChange} required disabled={!form.semester} colors={colors}>
                      <option value="" disabled hidden>Select Subject</option>
                      {subjects.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
                    </StyledSelect>

                    <AnimatePresence>
                      {showElective && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                          <StyledSelect label="Elective Topic" name="subSubject" value={form.subSubject} onChange={handleChange} required colors={colors}>
                            <option value="" disabled hidden>Select Elective</option>
                            {electiveOptions[form.subject]?.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
                          </StyledSelect>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div key="code" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>
                      Subject Code
                    </p>
                    <input
                      type="text" value={subjectCode} autoFocus
                      onChange={e => setSubjectCode(e.target.value)}
                      placeholder="e.g.  MAE11"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 14, fontWeight: 500,
                        background: "rgba(255,255,255,0.06)",
                        border: `1.5px solid ${codeError ? "#ef4444" : "rgba(255,255,255,0.12)"}`,
                        color: colors.text, outline: "none", boxSizing: "border-box",
                      }}
                    />
                    {codeError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ fontSize: 12, color: "#ef4444", marginTop: 6, fontWeight: 500 }}>
                        {codeError}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isDataLoading || showSyncBtn}
                whileHover={{ scale: (isDataLoading || showSyncBtn) ? 1 : 1.02, boxShadow: (isDataLoading || showSyncBtn) ? "none" : `0 12px 28px ${colors.primary}55` }}
                whileTap={{ scale: (isDataLoading || showSyncBtn) ? 1 : 0.97 }}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
                  cursor: (isDataLoading || showSyncBtn) ? "not-allowed" : "pointer",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}cc)`,
                  color: "#fff", fontWeight: 800, fontSize: 15,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: (isDataLoading || showSyncBtn) ? "none" : `0 6px 20px ${colors.primary}44`,
                  opacity: (isDataLoading || showSyncBtn) ? 0.7 : 1,
                }}
              >
                {(isDataLoading || showSyncBtn)
                  ? <><CircleLoader size={20} color="#fff" /> {isDataLoading ? "Connecting..." : "Updating Cache..."}</>
                  : <><Sparkles size={18} /> Search Resources</>
                }
              </motion.button>

              {/* Data freshness */}
              {lastUpdated && (
                <p style={{ fontSize: 11, opacity: 0.4, textAlign: "center", fontWeight: 500 }}>
                  Data updated {new Date(lastUpdated).toLocaleDateString()}
                </p>
              )}
            </motion.form>

            {/* ══════════ RIGHT: Results ══════════ */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <AnimatePresence mode="wait">
                {showSyncRight && !submitted ? (
                  <motion.div
                    key="syncing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      ...glass, borderRadius: 24, padding: 24,
                      minHeight: 500, height: isSmallScreen ? "auto" : "85vh",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 20, textAlign: "center"
                    }}
                  >
                    <CircleLoader size={64} color={colors.primary} />
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px 0" }}>Syncing Database</h3>
                      <p style={{ fontSize: 14, opacity: 0.6, margin: 0 }}>Waking up the server & updating files...</p>
                    </div>
                  </motion.div>
                ) : submitted ? (
                  <motion.div
                    key="results"
                    ref={setResultsPanelRef}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      ...glass, borderRadius: 24, padding: 24,
                      minHeight: 500, height: isSmallScreen ? "auto" : "85vh",
                      display: "flex", flexDirection: "column",
                    }}
                  >
                    {/* tabs */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 20, padding: 4, borderRadius: 14, background: "rgba(255,255,255,0.05)" }}>
                      {[
                        { id: "notes", icon: BookMarked, label: "Notes" },
                        { id: "pyqs", icon: GraduationCap, label: "PYQs" },
                      ].map(tab => (
                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                          style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                            padding: "9px 0", borderRadius: 11, border: "none", cursor: "pointer",
                            fontWeight: 700, fontSize: 13.5,
                            background: activeTab === tab.id ? colors.primary : "transparent",
                            color: activeTab === tab.id ? "#fff" : colors.text,
                            opacity: activeTab === tab.id ? 1 : 0.55,
                            transition: "all 0.2s",
                            position: "relative",
                          }}
                        >
                          {(showSyncBtn || isRefreshing) && activeTab === tab.id ? (
                            <CircleLoader size={14} color={activeTab === tab.id ? "#fff" : colors.primary} />
                          ) : (
                            <tab.icon size={15} />
                          )}
                          {tab.label}
                          {/* count badge */}
                          {!isSearching && !isRefreshing && (
                            <span style={{
                              position: "absolute", top: 6, right: 16,
                              fontSize: 10, fontWeight: 800,
                              background: activeTab === tab.id ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)",
                              color: activeTab === tab.id ? "#fff" : colors.text,
                              borderRadius: 999, padding: "1px 6px", minWidth: 18, textAlign: "center",
                            }}>
                              {tab.id === "notes" ? notesFiles.length : pdfFiles.length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* scroll area */}
                    <div style={{ flex: 1, overflowY: "auto" }}>
                      {showResultsLoading || isSearching ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20, opacity: 0.8 }}>
                          <CircleLoader size={52} color={colors.primary} />
                          <p style={{ fontWeight: 600, fontSize: 15 }}>{showResultsLoading ? "Loading Resources..." : "Searching..."}</p>
                        </div>
                      ) : activeTab === "notes" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                          {(() => {
                            const isSingleFolder = groupedNotes.length === 1;
                            return groupedNotes.length > 0 ? (
                              groupedNotes.map(([folder, files]) => (
                                <FolderSection key={folder} title={capitalizeWords(folder)} count={files.length} icon={Layers} color={colors.secondary} initialOpen={isSingleFolder} isSmallScreen={isSmallScreen}>
                                  {files.map((file, i) => (
                                    <FileRow key={file.id} file={file} index={i}
                                      openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}
                                      openPreview={openPreview} isSmallScreen={isSmallScreen}
                                      colors={colors} />
                                  ))}
                                </FolderSection>
                              ))
                            ) : (
                              <EmptyState icon={BookMarked} label="Notes" colors={colors} />
                            );
                          })()}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                          {pdfFiles.length > 0 ? (
                            (() => {
                              const isSingleFolder = groupedPDFs.length === 1;

                              return groupedPDFs.map(([year, files]) => (
                                year !== "null" ? (
                                  <FolderSection key={year} title={year} count={files.length} icon={GraduationCap} color={colors.primary} initialOpen={isSingleFolder} isSmallScreen={isSmallScreen}>
                                    {files.map((file, i) => (
                                      <FileRow key={file.id} file={file} index={i}
                                        openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}
                                        openPreview={openPreview} isSmallScreen={isSmallScreen}
                                        colors={colors} />
                                    ))}
                                  </FolderSection>
                                ) : (
                                  <div key={year} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {files.map((file, i) => (
                                      <FileRow key={file.id} file={file} index={i}
                                        openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}
                                        openPreview={openPreview} isSmallScreen={isSmallScreen}
                                        colors={colors} />
                                    ))}
                                  </div>
                                )
                              ));
                            })()
                          ) : (
                            <EmptyState icon={GraduationCap} label="PYQs" colors={colors} />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /* ── welcome panel ── */
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="hidden md:flex"
                    style={{
                      ...glass, borderRadius: 24, padding: 48,
                      minHeight: 500, height: "85vh",
                      display: isSmallScreen ? "none" : "flex",
                      flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 20,
                    }}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        width: 96, height: 96, borderRadius: 28,
                        background: `${colors.primary}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 0 40px ${colors.primary}33`,
                        marginBottom: 8,
                      }}
                    >
                      <BookOpen size={52} style={{ color: colors.primary }} strokeWidth={1.4} />
                    </motion.div>

                    <h3 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>RIT Library Resources</h3>
                    <p style={{ fontSize: 16, opacity: 0.6, maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
                      Select your{" "}
                      <span style={{ color: colors.primary, fontWeight: 700 }}>Semester</span> and{" "}
                      <span style={{ color: colors.primary, fontWeight: 700 }}>Branch</span>{" "}
                      to access Notes and Previous Year Question Papers.
                    </p>

                    <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
                      {["CIE1", "CIE2", "SEE", "Notes", "Lab Manuals"].map(tag => (
                        <span key={tag} style={{
                          fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                          background: `${colors.accent}18`, color: colors.accent,
                          border: `1px solid ${colors.accent}33`,
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Preview modal ── */}
        {previewFile && createPortal(
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
            }}
          >
            {previewFile.viewerType === 'mozilla' && previewFile.mimeType === "application/pdf" ? (
              <Mozillapdf fileId={previewFile.id} fileName={previewFile.view} mimeType={previewFile.mimeType} onClose={closePreview} />
            ) : (
              <DrivePreview fileId={previewFile.id} fileName={previewFile.view} originalFileName={previewFile.name} mimeType={previewFile.mimeType} onClose={closePreview} />
            )}
          </motion.div>,
          document.body
        )}
      </div>
    </>
  );
}

function EmptyState({ icon: Icon, label, colors }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 14, opacity: 0.5, textAlign: "center" }}>
      <Icon size={44} style={{ color: colors.primary, opacity: 0.4 }} />
      <p style={{ fontWeight: 600, fontSize: 15 }}>No {label} found for this subject</p>
      <p style={{ fontSize: 13, opacity: 0.7 }}>Try a different subject or exam type</p>
    </motion.div>
  );
}

function FolderSection({ title, count, icon: Icon, color, initialOpen = false, isSmallScreen, children }) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: isOpen ? "14px 14px 0 0" : 14,
          border: "none", cursor: "pointer", transition: "all 0.2s"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={16} style={{ color: color, opacity: 0.9 }} />
          <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#fff", opacity: 0.8 }}>
            {title}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, background: `${color}22`, color: color, borderRadius: 999, padding: "2px 8px" }}>
            {count}
          </span>
        </div>
        <ChevronDown size={16} style={{ color: "#fff", opacity: 0.5, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={isSmallScreen ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={isSmallScreen ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={isSmallScreen ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 6 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
