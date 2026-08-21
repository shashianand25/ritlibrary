import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Sparkles,
  BookMarked,
  GraduationCap,
  Layers,
  ChevronDown,
} from 'lucide-react';
import subjectsData from './data/subjects.json';
import DrivePreview from './pdf.jsx';
import Mozillapdf from './mozillapdf.jsx';
import Header from './Header.jsx';
import { branchGroups, examTypesList, electiveOptions, COLORS } from './constants/searchData.js';
import { ResourcesBg, GLOBAL_STYLE } from './components/SearchBackground.jsx';
import { CircleLoader } from './components/Loaders.jsx';
import { PillBtn } from './components/UIElements.jsx';
import SearchFilters from './components/search/SearchFilters.jsx';
import NotesResults from './components/search/NotesResults.jsx';
import PyqResults from './components/search/PyqResults.jsx';
import {
  getFileCategory,
  isAllSubjectsPyq,
  getFileSubjectCode,
  getFileFolderName,
  getFileSection,
  getFileLeafName,
} from './utils/fileHelpers.js';
import logger from './utils/logger.js';

const FILES_JSON_URL =
  import.meta.env.VITE_WORKER_URL || 'https://library-backend.ritlibrary.workers.dev/';

const glass = {
  background: 'rgba(20,25,35,0.75)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 12px 40px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
};

function normalizeSearch(str) {
  return (str || '').toLowerCase().replace(/[\s/_-]+/g, '');
}

export default function SearchPYQ() {
  const colors = COLORS;

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const h = () => setIsSmallScreen(window.innerWidth < 768);
    h();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const [form, setForm] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = localStorage.getItem('searchSettings');
        return s
          ? JSON.parse(s)
          : { year: '', branch: '', semester: '', subject: '', subSubject: '' };
      } catch (e) {
        logger.warn('Failed to parse search settings from localStorage', e);
      }
    }
    return { year: '', branch: '', semester: '', subject: '', subSubject: '' };
  });

  const [cycleTag, setCycleTag] = useState('');
  const [showElective, setShowElective] = useState(false);
  const [examTypes, setExamTypes] = useState(['CIE1', 'CIE2', 'SEE']);
  const [searchMode, setSearchMode] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('searchMode') || 'guided' : 'guided'
  );
  const [subjectCode, setSubjectCode] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('lastSubjectCode') || '' : ''
  );
  const [codeError, setCodeError] = useState('');

  const [pdfFiles, setPdfFiles] = useState([]);
  const [notesFiles, setNotesFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsLoading, setShowResultsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [currentSubjectCode, setCurrentSubjectCode] = useState('');
  const [resultsPanelRef, setResultsPanelRef] = useState(null);

  const [allData, setAllData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('searchSettings', JSON.stringify(form));
  }, [form]);
  useEffect(() => {
    localStorage.setItem('searchMode', searchMode);
  }, [searchMode]);
  useEffect(() => {
    localStorage.setItem('lastSubjectCode', subjectCode);
  }, [subjectCode]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${FILES_JSON_URL}?t=${Date.now()}`);
        const data = await res.json();
        let loadedData = [];
        if (data?.files) loadedData = data.files;
        else if (Array.isArray(data)) loadedData = data;
        setAllData(loadedData);

        const urlParams = new URLSearchParams(window.location.search);
        const vId = urlParams.get('v');
        if (vId && loadedData.length > 0) {
          const target = loadedData.find((f) => f.id === vId);
          if (target) {
            setPreviewFile({
              id: target.id,
              mimeType: target.mimeType,
              viewerType: 'drive',
              name: target.name,
              view: target.view || target.name,
            });
          }
        }
      } catch (e) {
        logger.error('Failed to load file index', e);
      } finally {
        setIsDataLoading(false);
      }
    })();
  }, []);

  const getYearFromSemester = (sem) => {
    const n = parseInt(sem, 10);
    if (isNaN(n)) return '';
    if (n <= 2) return '1st Year';
    if (n <= 4) return '2nd Year';
    if (n <= 6) return '3rd Year';
    return '4th Year';
  };

  const branchSubjects = useMemo(() => {
    if (!form.year || !form.semester || !form.branch) return [];
    return subjectsData?.[form.year]?.[form.semester]?.[form.branch.toLowerCase()] || [];
  }, [form.year, form.semester, form.branch]);

  const handleBranch = (e) => {
    setForm((p) => ({ ...p, branch: e.target.value, subject: '', subSubject: '' }));
    setShowElective(false);
  };

  const handleSemester = (e) => {
    const value = e.target.value;
    setForm((p) => ({
      ...p,
      semester: value,
      year: getYearFromSemester(value),
      branch: '',
      subject: '',
      subSubject: '',
    }));
    setShowElective(false);
  };

  const handleSubject = (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, subject: value, subSubject: '' }));
    const s = branchSubjects.find((subj) => subj.value === value);
    setShowElective(Boolean(s?.elective));
  };

  const handleSubSubject = (e) => {
    setForm((p) => ({ ...p, subSubject: e.target.value }));
  };

  const openPreview = (file, viewer = 'drive') => {
    setPreviewFile({
      id: file.id,
      mimeType: file.mimeType,
      viewerType: viewer,
      name: file.name,
      view: `${currentSubjectCode} ${file.view || file.name}`,
    });
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setIsSearching(true);
    setShowResultsLoading(true);

    let finalCode = '';
    if (searchMode === 'code') {
      finalCode = subjectCode.trim();
      if (!finalCode || finalCode.length < 3) {
        setIsSearching(false);
        setCodeError('Subject code must be at least 3 characters');
        setTimeout(() => setCodeError(''), 3000);
        return;
      }
    } else {
      const sel = branchSubjects.find((s) => s.value === form.subject);
      finalCode = sel?.elective ? form.subSubject : sel?.code || sel?.value;
      if (!finalCode) {
        setIsSearching(false);
        return;
      }
    }

    setCurrentSubjectCode(finalCode);
    const code = normalizeSearch(finalCode);

    const pyq = allData.filter((file) => {
      if (getFileCategory(file) !== 'pyq') return false;
      const fileCode = normalizeSearch(getFileSubjectCode(file));
      if (fileCode !== code && fileCode !== 'all') return false;
      return true;
    });

    const notes = allData.filter((file) => {
      if (getFileCategory(file) !== 'notes') return false;
      const fileCode = normalizeSearch(getFileSubjectCode(file));
      if (fileCode !== code && fileCode !== 'all') return false;
      return true;
    });

    setPdfFiles(pyq);
    setNotesFiles(notes);
    setIsSearching(false);
    setShowResultsLoading(false);
  };

  const groupedNotes = useMemo(() => {
    const map = {};
    notesFiles.forEach((file) => {
      const folder = getFileFolderName(file, currentSubjectCode);
      if (!map[folder]) map[folder] = [];
      map[folder].push(file);
    });
    return Object.entries(map);
  }, [notesFiles, currentSubjectCode]);

  const groupedPDFs = useMemo(() => {
    const map = {};
    pdfFiles.forEach((file) => {
      const folder = file.year || getFileFolderName(file, currentSubjectCode);
      if (!map[folder]) map[folder] = [];
      map[folder].push(file);
    });
    return Object.entries(map);
  }, [pdfFiles, currentSubjectCode]);

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div className="relative min-h-screen bg-[#0a0d14] text-white font-sans overflow-x-hidden">
        <ResourcesBg />
        <Header />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Search Controls Panel */}
            <div className="lg:col-span-5 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ ...glass, borderRadius: 24, padding: 24 }}
              >
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                  Academic Resources
                </h1>
                <p className="text-sm text-neutral-400 mb-6">
                  Access official lecture notes, modules, and previous year examination question
                  papers.
                </p>

                <SearchFilters
                  searchMode={searchMode}
                  setSearchMode={setSearchMode}
                  form={form}
                  setForm={setForm}
                  subjectCode={subjectCode}
                  setSubjectCode={setSubjectCode}
                  codeError={codeError}
                  handleSearch={handleSearch}
                  isSearching={isSearching}
                  cycleTag={cycleTag}
                  showElective={showElective}
                  branchSubjects={branchSubjects}
                  handleBranch={handleBranch}
                  handleSemester={handleSemester}
                  handleSubject={handleSubject}
                  handleSubSubject={handleSubSubject}
                  isSmallScreen={isSmallScreen}
                />
              </motion.div>
            </div>

            {/* Results Display Panel */}
            <div className="lg:col-span-7" ref={setResultsPanelRef}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ ...glass, borderRadius: 24, padding: 24, minHeight: 520 }}
              >
                {submitted ? (
                  <div>
                    {/* Navigation Tabs */}
                    <div className="flex gap-2 p-1.5 rounded-2xl bg-neutral-900/60 border border-white/10 mb-6">
                      <button
                        type="button"
                        onClick={() => setActiveTab('notes')}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          activeTab === 'notes'
                            ? 'bg-lime-400 text-neutral-950 shadow-md'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <BookMarked size={16} /> Notes ({notesFiles.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('pyqs')}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          activeTab === 'pyqs'
                            ? 'bg-lime-400 text-neutral-950 shadow-md'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <GraduationCap size={16} /> PYQs ({pdfFiles.length})
                      </button>
                    </div>

                    {/* Results Container */}
                    {showResultsLoading ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <CircleLoader size={40} color={colors.primary} />
                        <p className="text-sm text-neutral-400">Loading resources...</p>
                      </div>
                    ) : activeTab === 'notes' ? (
                      <NotesResults
                        groupedNotes={groupedNotes}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        openPreview={openPreview}
                        isSmallScreen={isSmallScreen}
                        colors={colors}
                      />
                    ) : (
                      <PyqResults
                        pdfFiles={pdfFiles}
                        groupedPDFs={groupedPDFs}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        openPreview={openPreview}
                        isSmallScreen={isSmallScreen}
                        colors={colors}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
                      <BookOpen size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Select Course Parameters</h3>
                      <p className="text-sm text-neutral-400 max-w-sm mt-1">
                        Use the search form on the left to select your semester and branch or enter
                        a subject code.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modal Preview */}
        {previewFile &&
          createPortal(
            <div className="fixed inset-0 z-50">
              {previewFile.viewerType === 'mozilla' &&
              previewFile.mimeType === 'application/pdf' ? (
                <Mozillapdf
                  fileId={previewFile.id}
                  fileName={previewFile.view}
                  onClose={closePreview}
                />
              ) : (
                <DrivePreview
                  fileId={previewFile.id}
                  fileName={previewFile.view}
                  originalFileName={previewFile.name}
                  mimeType={previewFile.mimeType}
                  onClose={closePreview}
                />
              )}
            </div>,
            document.body
          )}
      </div>
    </>
  );
}
