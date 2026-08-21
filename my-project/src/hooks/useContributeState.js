import { useState, useEffect, useMemo, useCallback } from 'react';
import subjectsData from '../data/subjects.json';
import { branchGroups } from '../constants/searchData.js';
import { fetchFileIndex } from '../api/client.js';
import logger from '../utils/logger.js';

export function getYearFromSem(sem) {
  const n = parseInt(sem, 10);
  if (isNaN(n)) return '';
  if (n <= 2) return '1st Year';
  if (n <= 4) return '2nd Year';
  if (n <= 6) return '3rd Year';
  return '4th Year';
}

export function getSubjects(year, sem, branch) {
  return subjectsData?.[year]?.[sem]?.[branch?.toLowerCase()] || [];
}

export function useContributeState() {
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

  return {
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
  };
}

export default useContributeState;
