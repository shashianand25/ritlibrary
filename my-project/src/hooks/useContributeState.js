import { useState, useEffect, useMemo, useCallback } from 'react';
import subjectsData from '../data/subjects.json';
import { branchGroups } from '../constants/searchData.js';
import { fetchFileIndex, deleteResource } from '../api/client.js';
import { useAuth } from '../lib/AuthContext.jsx';
import logger from '../utils/logger.js';

const PUBLIC_UPLOADS_ENABLED = import.meta.env.VITE_PUBLIC_UPLOADS_ENABLED !== 'false';
const PUBLIC_DELETES_ENABLED = import.meta.env.VITE_PUBLIC_DELETES_ENABLED === 'true';

export function getYearFromSem(sem) {
  const n = parseInt(sem, 10);
  if (isNaN(n)) return '';
  if (n <= 2) return '1st Year';
  if (n <= 4) return '2nd Year';
  if (n <= 6) return '3rd Year';
  return '4th Year';
}

export function normalizeSemKey(sem) {
  if (!sem) return '';
  const s = String(sem).trim();
  if (s.endsWith('Sem')) return s;
  const num = parseInt(s, 10);
  if (isNaN(num)) return s;
  const suffix = num === 1 ? '1st' : num === 2 ? '2nd' : num === 3 ? '3rd' : `${num}th`;
  return `${suffix} Sem`;
}

export function getSubjects(year, sem, branch) {
  if (!year || !sem || !branch) return [];
  const semKey = normalizeSemKey(sem);
  return (
    subjectsData?.[year]?.[semKey]?.[branch?.toLowerCase()] ||
    subjectsData?.[year]?.[sem]?.[branch?.toLowerCase()] ||
    []
  );
}

export function useContributeState() {
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

  const handleSem = useCallback((e) => {
    setSemester(e.target.value);
    setBranch('');
    setSubject('');
    setSubSubject('');
    setSubjectCode('');
    setShowElective(false);
    setIsAllSubjects(false);
    setActiveFolder('');
  }, []);

  const handleBranch = useCallback((e) => {
    setBranch(e.target.value);
    setSubject('');
    setSubSubject('');
    setSubjectCode('');
    setShowElective(false);
    setIsAllSubjects(false);
    setActiveFolder('');
  }, []);

  const handleSubject = useCallback(
    (e) => {
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
    },
    [subjects]
  );

  const handleSubSubject = useCallback((e) => {
    const val = e.target.value;
    setSubSubject(val);
    setSubjectCode(val);
    setActiveFolder('');
  }, []);

  useEffect(() => {
    fetchFileIndex()
      .then((data) => {
        let loaded = [];
        if (data?.files) loaded = data.files;
        else if (Array.isArray(data)) loaded = data;
        setAllFiles(loaded);
      })
      .catch((err) => {
        logger.warn('Failed to fetch current files index', err);
      });
  }, []);

  const handleMode = useCallback((m) => {
    setMode(m);
    setCustomFolders([]);
    setActiveFolder('');
  }, []);

  const addFolder = useCallback(
    (existingFolders = []) => {
      const name = newFolder.trim();
      if (!name || existingFolders.includes(name)) return;
      setCustomFolders((p) => [...p, name]);
      setNewFolder('');
      setShowAddFolder(false);
    },
    [newFolder]
  );

  const deleteFile = useCallback(
    async (file) => {
      if (!file?.id || !canDelete || deletingFileId) return;
      setDeletingFileId(file.id);
      setDeleteError('');
      try {
        const idToken = user ? await user.getIdToken() : '';
        await deleteResource(file.id, idToken);
        setAllFiles((prev) => prev.filter((item) => item.id !== file.id));
      } catch (e) {
        logger.error('File deletion failed', e);
        setDeleteError(e.message || 'File deletion failed');
      } finally {
        setDeletingFileId('');
      }
    },
    [user, canDelete, deletingFileId]
  );

  return {
    user,
    isAdmin,
    canUpload,
    canDelete,
    mode,
    setMode,
    semester,
    setSemester,
    branch,
    setBranch,
    subject,
    setSubject,
    subSubject,
    setSubSubject,
    showElective,
    setShowElective,
    subjectCode,
    setSubjectCode,
    isAllSubjects,
    setIsAllSubjects,
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
    deleteError,
    setDeleteError,
    branches,
    subjects,
    handleSem,
    handleBranch,
    handleSubject,
    handleSubSubject,
    handleMode,
    addFolder,
    deleteFile,
  };
}

export default useContributeState;
