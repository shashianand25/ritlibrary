import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, BookMarked, GraduationCap, BookOpen } from 'lucide-react';
import DrivePreview from './pdf.jsx';
import Mozillapdf from './mozillapdf.jsx';
import Header from './Header.jsx';
import { COLORS } from './constants/searchData.js';
import { ResourcesBg, GLOBAL_STYLE } from './components/SearchBackground.jsx';
import { CircleLoader } from './components/Loaders.jsx';
import { PillBtn } from './components/UIElements.jsx';
import SearchFilters from './components/search/SearchFilters.jsx';
import NotesResults from './components/search/NotesResults.jsx';
import PyqResults from './components/search/PyqResults.jsx';
import { getFileCategory, getFileSubjectCode, getFileFolderName } from './utils/fileHelpers.js';
import useSearchPyqState from './hooks/useSearchPyqState.js';
import { glassCard } from './constants/sharedStyles.js';

function normalizeSearch(str) {
  return (str || '').toLowerCase().replace(/[\s/_-]+/g, '');
}

export default function SearchPYQ() {
  const colors = COLORS;

  const {
    isSmallScreen,
    form,
    showElective,
    searchMode,
    setSearchMode,
    subjectCode,
    setSubjectCode,
    codeError,
    setCodeError,
    pdfFiles,
    setPdfFiles,
    notesFiles,
    setNotesFiles,
    submitted,
    setSubmitted,
    isSearching,
    setIsSearching,
    showResultsLoading,
    setShowResultsLoading,
    previewFile,
    setPreviewFile,
    openMenuId,
    setOpenMenuId,
    activeTab,
    setActiveTab,
    setCurrentSubjectCode,
    allData,

    branchSubjects,
    handleBranch,
    handleSemester,
    handleSubject,
    handleSubSubject,
  } = useSearchPyqState();

  const handleSearch = () => {
    let targetCode = '';
    if (searchMode === 'code') {
      if (!subjectCode.trim()) {
        setCodeError('Please enter a subject code');
        return;
      }
      targetCode = subjectCode.trim().toUpperCase();
      setCodeError('');
    } else {
      if (!form.semester || !form.branch || !form.subject) return;
      if (showElective && !form.subSubject) return;

      const selSub = branchSubjects.find((s) => s.name === form.subject);
      targetCode = showElective ? form.subSubject : selSub?.code || form.subject;
    }

    setIsSearching(true);
    setShowResultsLoading(true);
    setCurrentSubjectCode(targetCode);

    const normTarget = normalizeSearch(targetCode);

    setTimeout(() => {
      const matchedPyqs = allData.filter((file) => {
        const cat = getFileCategory(file);
        if (cat !== 'pyq') return false;
        const code = normalizeSearch(getFileSubjectCode(file));
        return code === normTarget || code.includes(normTarget);
      });

      const matchedNotes = allData.filter((file) => {
        const cat = getFileCategory(file);
        if (cat !== 'notes') return false;
        const code = normalizeSearch(getFileSubjectCode(file));
        return code === normTarget || code.includes(normTarget);
      });

      setPdfFiles(matchedPyqs);
      setNotesFiles(matchedNotes);
      setSubmitted(true);
      setIsSearching(false);
      setShowResultsLoading(false);
    }, 350);
  };

  const groupedPDFs = useMemo(() => {
    const groups = {};
    pdfFiles.forEach((file) => {
      const folder = getFileFolderName(file) || 'General';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(file);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [pdfFiles]);

  const groupedNotes = useMemo(() => {
    const groups = {};
    notesFiles.forEach((file) => {
      const folder = getFileFolderName(file) || 'General';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(file);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [notesFiles]);

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <ResourcesBg />

      <div className="relative min-h-screen flex flex-col z-10 font-sans text-neutral-100">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Filter Controls Panel */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ ...glassCard, padding: 24 }}
              >
                <SearchFilters
                  searchMode={searchMode}
                  setSearchMode={setSearchMode}
                  form={form}
                  subjectCode={subjectCode}
                  setSubjectCode={setSubjectCode}
                  codeError={codeError}
                  handleSearch={handleSearch}
                  isSearching={isSearching}
                  showElective={showElective}
                  branchSubjects={branchSubjects}
                  handleBranch={handleBranch}
                  handleSemester={handleSemester}
                  handleSubject={handleSubject}
                  handleSubSubject={handleSubSubject}
                />
              </motion.div>
            </div>

            {/* Results Display Panel */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ ...glassCard, padding: 24, minHeight: 520 }}
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
                        <BookMarked size={16} />
                        Study Notes
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                          {notesFiles.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('pyq')}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          activeTab === 'pyq'
                            ? 'bg-lime-400 text-neutral-950 shadow-md'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <GraduationCap size={16} />
                        Question Papers
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                          {pdfFiles.length}
                        </span>
                      </button>
                    </div>

                    {showResultsLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
                        <CircleLoader size={36} color={colors.accent} />
                        <span className="text-xs font-medium">Filtering resources...</span>
                      </div>
                    ) : activeTab === 'notes' ? (
                      <NotesResults
                        groupedNotes={groupedNotes}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        openPreview={(file) => setPreviewFile(file)}
                        isSmallScreen={isSmallScreen}
                        colors={colors}
                      />
                    ) : (
                      <PyqResults
                        pdfFiles={pdfFiles}
                        groupedPDFs={groupedPDFs}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        openPreview={(file) => setPreviewFile(file)}
                        isSmallScreen={isSmallScreen}
                        colors={colors}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-28 text-center text-neutral-400">
                    <div className="w-16 h-16 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 mb-4">
                      <BookOpen size={32} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base mb-1">Find Course Materials</h4>
                      <p className="text-xs text-neutral-400 max-w-xs">
                        Select your semester and branch on the left to browse organized notes and
                        previous year question papers.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* PDF Modal Viewer */}
      {previewFile &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-5xl h-[85vh] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-neutral-900">
                <span className="text-sm font-semibold text-neutral-200 truncate max-w-md">
                  {previewFile.view || previewFile.name}
                </span>
                <PillBtn
                  active={false}
                  onClick={() => setPreviewFile(null)}
                  style={{ padding: '6px 16px', fontSize: 13 }}
                >
                  Close
                </PillBtn>
              </div>
              <div className="flex-1 w-full bg-neutral-950 relative">
                {previewFile.viewerType === 'mozilla' ? (
                  <Mozillapdf fileId={previewFile.id} fileName={previewFile.view} />
                ) : (
                  <DrivePreview
                    fileId={previewFile.id}
                    fileName={previewFile.view || previewFile.name}
                    mimeType={previewFile.mimeType}
                  />
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
