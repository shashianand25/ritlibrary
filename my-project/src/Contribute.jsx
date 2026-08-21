import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Plus,
  FolderOpen,
  ShieldAlert,
  AlertCircle,
  BookOpen,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import Header from './Header.jsx';
import { useAuth } from './lib/AuthContext.jsx';
import subjectsData from './data/subjects.json';
import { branchGroups, COLORS, electiveOptions } from './constants/searchData.js';
import UploadModal from './components/contribute/UploadModal.jsx';
import FolderCard from './components/contribute/FolderCard.jsx';
import FolderContents from './components/contribute/FolderContents.jsx';
import logger from './utils/logger.js';

const WORKER = import.meta.env.VITE_WORKER_URL || 'https://library-backend.ritlibrary.workers.dev';
const FILES_JSON_URL = WORKER;
const PUBLIC_UPLOADS_ENABLED = import.meta.env.VITE_PUBLIC_UPLOADS_ENABLED !== 'false';
const PUBLIC_DELETES_ENABLED = import.meta.env.VITE_PUBLIC_DELETES_ENABLED === 'true';
const C = COLORS;

const NOTE_FOLDERS = [
  'Unit 1',
  'Unit 2',
  'Unit 3',
  'Unit 4',
  'Unit 5',
  'Lab Materials',
  'Books',
  'Others',
];
const PYQ_FOLDERS = ['2022-23', '2023-24', '2024-25', '2025-26', '2026-27', '2027-28', '2028-29'];

const glass = {
  background: 'rgba(20,25,35,0.75)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};

function getYearFromSem(sem) {
  const n = parseInt(sem, 10);
  if (isNaN(n)) return '';
  if (n <= 2) return '1st Year';
  if (n <= 4) return '2nd Year';
  if (n <= 6) return '3rd Year';
  return '4th Year';
}

function getSubjects(year, sem, branch) {
  return subjectsData?.[year]?.[sem]?.[branch?.toLowerCase()] || [];
}

function matchesFolder(file, category, subjectCode, folder) {
  if (file.category) {
    return (
      file.category.toLowerCase() === category.toLowerCase() &&
      file.subjectCode?.toLowerCase() === subjectCode.toLowerCase() &&
      file.folderName?.toLowerCase() === folder.toLowerCase()
    );
  }
  const parts = file.name?.split('/') || [];
  return (
    file.name?.startsWith(`${category}/`) &&
    parts[4]?.toLowerCase() === subjectCode.toLowerCase() &&
    parts[5]?.toLowerCase() === folder.toLowerCase()
  );
}

function Dropdown({ label, value, onChange, disabled, children }) {
  return (
    <div className="flex-1">
      <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium outline-none ${
            disabled
              ? 'opacity-30 cursor-not-allowed text-neutral-500'
              : 'text-neutral-100 cursor-pointer'
          }`}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-lime-400 ${
            disabled ? 'opacity-20' : 'opacity-50'
          }`}
        />
      </div>
    </div>
  );
}

export default function Contribute() {
  const { user, isAdmin } = useAuth();
  const canUpload = Boolean(user && (isAdmin || PUBLIC_UPLOADS_ENABLED));
  const canDelete = Boolean(isAdmin || PUBLIC_DELETES_ENABLED);

  const [mode, setMode] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('contributeMode') || 'notes' : 'notes'
  );
  const [semester, setSemester] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('contributeSem') || '' : ''
  );
  const [branch, setBranch] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('contributeBranch') || '' : ''
  );
  const [subject, setSubject] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('contributeSubject') || '' : ''
  );
  const [subSubject, setSubSubject] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('contributeSubSubject') || '' : ''
  );
  const [showElective, setShowElective] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('contributeShowElective') === 'true'
      : false
  );
  const [subjectCode, setSubjectCode] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('contributeSubjectCode') || '' : ''
  );
  const [isAllSubjects, setIsAllSubjects] = useState(false);

  const [customFolders, setCustomFolders] = useState([]);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolder, setNewFolder] = useState('');

  const [allFiles, setAllFiles] = useState([]);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [activeFolder, setActiveFolder] = useState('');
  const [deletingFileId, setDeletingFileId] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    localStorage.setItem('contributeMode', mode);
  }, [mode]);
  useEffect(() => {
    localStorage.setItem('contributeSem', semester);
  }, [semester]);
  useEffect(() => {
    localStorage.setItem('contributeBranch', branch);
  }, [branch]);
  useEffect(() => {
    localStorage.setItem('contributeSubject', subject);
  }, [subject]);
  useEffect(() => {
    localStorage.setItem('contributeSubSubject', subSubject);
  }, [subSubject]);
  useEffect(() => {
    localStorage.setItem('contributeShowElective', String(showElective));
  }, [showElective]);
  useEffect(() => {
    localStorage.setItem('contributeSubjectCode', subjectCode);
  }, [subjectCode]);

  const year = semester ? getYearFromSem(semester) : '';
  const branches = year ? branchGroups[year] || [] : [];
  const subjects = useMemo(
    () => (year && semester && branch ? getSubjects(year, semester, branch) : []),
    [year, semester, branch]
  );

  useEffect(() => {
    if (subject && subjects.length > 0) {
      const s = subjects.find((subj) => subj.value === subject);
      setShowElective(Boolean(s?.elective));
    }
  }, [subject, subjects]);

  const handleSem = (e) => {
    setSemester(e.target.value);
    setBranch('');
    setSubject('');
    setSubSubject('');
    setShowElective(false);
    setSubjectCode('');
    setActiveFolder('');
  };

  const handleBranch = (e) => {
    setBranch(e.target.value);
    setSubject('');
    setSubSubject('');
    setShowElective(false);
    setSubjectCode('');
    setActiveFolder('');
  };

  const handleSubject = (e) => {
    const val = e.target.value;
    setSubject(val);
    setIsAllSubjects(false);
    const sel = subjects.find((s) => s.value === val);
    if (sel?.elective) {
      setShowElective(true);
      setSubSubject('');
      setSubjectCode('');
    } else {
      setShowElective(false);
      setSubSubject('');
      setSubjectCode(sel?.code || sel?.value || '');
    }
    setActiveFolder('');
  };

  const handleSubSubject = (e) => {
    const val = e.target.value;
    setSubSubject(val);
    setSubjectCode(val);
    setActiveFolder('');
  };

  useEffect(() => {
    fetch(FILES_JSON_URL)
      .then((r) => r.json())
      .then((d) => setAllFiles(Array.isArray(d) ? d : []))
      .catch((err) => {
        logger.warn('Failed to fetch current files index', err);
      });
  }, []);

  const handleMode = (m) => {
    setMode(m);
    setCustomFolders([]);
    setActiveFolder('');
  };

  const baseFolders = mode === 'notes' ? NOTE_FOLDERS : PYQ_FOLDERS;
  const allFolders = [...baseFolders, ...customFolders];
  const selectionDone = Boolean(semester && branch && subject && subjectCode);
  const effectiveSubjectCode = isAllSubjects ? 'ALL' : subjectCode;

  const folderFiles = (folder) => {
    const category = mode === 'notes' ? 'Notes' : 'PYQ';
    return allFiles.filter((f) => matchesFolder(f, category, effectiveSubjectCode, folder));
  };

  const deleteFile = async (file) => {
    if (!file?.id || !canDelete || deletingFileId) return;
    const ok = window.confirm(
      `Delete "${file.view || file.name}" from Drive and the library index?`
    );
    if (!ok) return;
    setDeletingFileId(file.id);
    setDeleteError('');
    try {
      const idToken = user ? await user.getIdToken() : '';
      const res = await fetch(`${WORKER}/api/files/${encodeURIComponent(file.id)}`, {
        method: 'DELETE',
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setAllFiles((prev) => prev.filter((item) => item.id !== file.id));
    } catch (e) {
      logger.error('File deletion failed', e);
      setDeleteError(e.message);
    } finally {
      setDeletingFileId('');
    }
  };

  const addFolder = () => {
    const name = newFolder.trim();
    if (!name || allFolders.includes(name)) return;
    setCustomFolders((p) => [...p, name]);
    setNewFolder('');
    setShowAddFolder(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 font-sans relative overflow-x-hidden">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-300 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldAlert size={14} /> Academic Contribution Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Contribute Resources</h1>
          <p className="text-sm text-neutral-400 max-w-md mx-auto mt-2">
            Upload lecture notes, assignment solutions, and question papers directly to the student
            repository.
          </p>
        </motion.div>

        {deleteError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {deleteError}
          </div>
        )}

        {/* Form Selection Card */}
        <section style={{ ...glass, borderRadius: 24, padding: '24px 28px', marginBottom: 32 }}>
          {/* Mode Switcher */}
          <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 mb-6">
            <button
              type="button"
              onClick={() => handleMode('notes')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'notes'
                  ? 'bg-lime-400 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen size={16} /> Course Notes
            </button>
            <button
              type="button"
              onClick={() => handleMode('pyq')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                mode === 'pyq'
                  ? 'bg-lime-400 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <GraduationCap size={16} /> Question Papers
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Dropdown label="Semester" value={semester} onChange={handleSem}>
              <option value="" disabled hidden>
                Select Semester
              </option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s} className="bg-neutral-900 text-white">
                  Semester {s}
                </option>
              ))}
            </Dropdown>

            <Dropdown label="Branch" value={branch} onChange={handleBranch} disabled={!semester}>
              <option value="" disabled hidden>
                Select Branch
              </option>
              {branches.map(({ label, value }) => (
                <option key={value} value={value} className="bg-neutral-900 text-white">
                  {label}
                </option>
              ))}
            </Dropdown>

            <Dropdown label="Subject" value={subject} onChange={handleSubject} disabled={!branch}>
              <option value="" disabled hidden>
                Select Subject
              </option>
              {subjects.map(({ label, value, code }) => (
                <option key={value} value={value} className="bg-neutral-900 text-white">
                  {label} {code ? `(${code})` : ''}
                </option>
              ))}
            </Dropdown>

            {showElective ? (
              <Dropdown
                label="Elective Topic"
                value={subSubject}
                onChange={handleSubSubject}
                disabled={!subject}
              >
                <option value="" disabled hidden>
                  Select Elective
                </option>
                {electiveOptions[subject]?.map(({ label, value }) => (
                  <option key={value} value={value} className="bg-neutral-900 text-white">
                    {label}
                  </option>
                ))}
              </Dropdown>
            ) : null}
          </div>
        </section>

        {/* Folders Grid */}
        {selectionDone ? (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Resource Directories</h2>
              <button
                type="button"
                onClick={() => setShowAddFolder(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition-all"
              >
                <Plus size={14} /> Add Folder
              </button>
            </div>

            {showAddFolder && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom folder name..."
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white outline-none"
                />
                <button
                  type="button"
                  onClick={addFolder}
                  className="px-4 py-2 rounded-xl bg-lime-400 text-neutral-950 font-bold text-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFolder(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-neutral-400 font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allFolders.map((fName) => (
                <FolderCard
                  key={fName}
                  name={fName}
                  count={folderFiles(fName).length}
                  isAdmin={isAdmin}
                  isCustom={customFolders.includes(fName)}
                  isActive={activeFolder === fName}
                  onView={() => setActiveFolder(activeFolder === fName ? '' : fName)}
                  onUpload={() =>
                    canUpload
                      ? setUploadTarget(fName)
                      : alert('Please sign in to contribute resources.')
                  }
                  onRemove={() => setCustomFolders((p) => p.filter((x) => x !== fName))}
                />
              ))}
            </div>

            <FolderContents
              activeFolder={activeFolder}
              folderFiles={activeFolder ? folderFiles(activeFolder) : []}
              isAdmin={isAdmin}
              isDeleting={Boolean(deletingFileId)}
              onDelete={deleteFile}
            />
          </section>
        ) : (
          <div className="text-center py-16 opacity-40">
            <FolderOpen size={48} className="mx-auto mb-2 text-lime-400" />
            <p className="text-sm">
              Select your Semester, Branch, and Subject above to begin contributing.
            </p>
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {uploadTarget && (
            <UploadModal
              folder={uploadTarget}
              subjectCode={effectiveSubjectCode}
              category={mode === 'notes' ? 'Notes' : 'PYQ'}
              year={year}
              sem={semester}
              branch={branch}
              allSubjects={isAllSubjects}
              onClose={() => setUploadTarget(null)}
              onSuccess={(newFile) => {
                if (newFile) setAllFiles((prev) => [newFile, ...prev]);
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
