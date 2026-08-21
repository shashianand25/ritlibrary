import React from 'react';
import PropTypes from 'prop-types';
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
import { COLORS, electiveOptions } from './constants/searchData.js';
import UploadModal from './components/contribute/UploadModal.jsx';
import FolderCard from './components/contribute/FolderCard.jsx';
import FolderContents from './components/contribute/FolderContents.jsx';
import useContributeState from './hooks/useContributeState.js';
import { deleteResource } from './api/client.js';
import logger from './utils/logger.js';

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

Dropdown.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node,
};

export default function Contribute() {
  const { user, isAdmin } = useAuth();
  const canUpload = Boolean(user && (isAdmin || PUBLIC_UPLOADS_ENABLED));
  const canDelete = Boolean(isAdmin || PUBLIC_DELETES_ENABLED);

  const {
    mode,
    semester,
    branch,
    subject,
    subSubject,
    showElective,
    subjectCode,
    isAllSubjects,
    customFolders,
    setCustomFolders,
    showAddFolder,
    setShowAddFolder,
    newFolder,
    setNewFolder,
    allFiles,
    setAllFiles,
    uploadTarget,
    setUploadTarget,
    activeFolder,
    setActiveFolder,
    deletingFileId,
    setDeletingFileId,
    deleteError,
    setDeleteError,
    branches,
    subjects,
    handleSem,
    handleBranch,
    handleSubject,
    handleSubSubject,
    handleMode,
  } = useContributeState();

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
      await deleteResource(file.id, idToken);
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
    <div
      className="min-h-screen text-neutral-100 flex flex-col font-sans"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(163,230,53,0.15), transparent), #050a14',
      }}
    >
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Banner Alert */}
        <div className="mb-6 rounded-2xl p-4 border flex items-center justify-between gap-4 bg-lime-950/20 border-lime-500/20">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-lime-400 shrink-0" />
            <p className="text-xs text-lime-300">
              Files uploaded here are directly synchronized with Google Drive and verified by RIT
              student moderators.
            </p>
          </div>
        </div>

        {/* Action / Error Banner */}
        <AnimatePresence>
          {deleteError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-2xl p-4 border bg-red-950/30 border-red-500/30 text-red-300 flex items-center justify-between gap-4 text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteError('')}
                className="text-red-400 hover:text-white"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Controls Card */}
        <section style={glass} className="rounded-3xl p-6 mb-8">
          <div className="flex gap-2 p-1.5 rounded-2xl bg-neutral-900/60 border border-white/10 mb-6">
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
              {subjects.map(({ label, value }) => (
                <option key={value} value={value} className="bg-neutral-900 text-white">
                  {label}
                </option>
              ))}
            </Dropdown>

            {showElective ? (
              <Dropdown label="Elective Sub-Subject" value={subSubject} onChange={handleSubSubject}>
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
              isAdmin={canDelete}
              isDeleting={Boolean(deletingFileId)}
              onDelete={deleteFile}
              onUpload={() => setUploadTarget(activeFolder)}
              colors={C}
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
              category={mode === 'notes' ? 'Notes' : 'PYQ'}
              subjectCode={effectiveSubjectCode}
              branch={branch}
              onClose={() => setUploadTarget(null)}
              onSuccess={(newFile) => {
                if (newFile) setAllFiles((prev) => [newFile, ...prev]);
                setUploadTarget(null);
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
