import { useState, useEffect, useMemo, useCallback } from 'react';
import subjectsData from '../data/subjects.json';
import { fetchFileIndex } from '../api/client.js';
import logger from '../utils/logger.js';

export function useSearchPyqState() {
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

  const [showElective, setShowElective] = useState(false);
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
  const [allData, setAllData] = useState([]);

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
        const data = await fetchFileIndex();
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
      }
    })();
  }, []);

  const getYearFromSemester = useCallback((sem) => {
    const n = parseInt(sem, 10);
    if (isNaN(n)) return '';
    if (n <= 2) return '1st Year';
    if (n <= 4) return '2nd Year';
    if (n <= 6) return '3rd Year';
    return '4th Year';
  }, []);

  const branchSubjects = useMemo(() => {
    if (!form.year || !form.semester || !form.branch) return [];
    return subjectsData?.[form.year]?.[form.semester]?.[form.branch.toLowerCase()] || [];
  }, [form.year, form.semester, form.branch]);

  const handleBranch = useCallback((e) => {
    setForm((p) => ({ ...p, branch: e.target.value, subject: '', subSubject: '' }));
    setShowElective(false);
  }, []);

  const handleSemester = useCallback(
    (e) => {
      const sem = e.target.value;
      const computedYear = getYearFromSemester(sem);
      setForm((p) => ({
        ...p,
        semester: sem,
        year: computedYear,
        branch: '',
        subject: '',
        subSubject: '',
      }));
      setShowElective(false);
    },
    [getYearFromSemester]
  );

  const handleSubject = useCallback(
    (e) => {
      const val = e.target.value;
      const selected = branchSubjects.find((s) => s.name === val);
      if (selected && selected.elective && selected.options) {
        setShowElective(true);
        setForm((p) => ({ ...p, subject: val, subSubject: '' }));
      } else {
        setShowElective(false);
        setForm((p) => ({ ...p, subject: val, subSubject: '' }));
      }
    },
    [branchSubjects]
  );

  const handleSubSubject = useCallback((e) => {
    setForm((p) => ({ ...p, subSubject: e.target.value }));
  }, []);

  return {
    isSmallScreen,
    form,
    setForm,
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
    currentSubjectCode,
    setCurrentSubjectCode,
    allData,
    branchSubjects,
    handleBranch,
    handleSemester,
    handleSubject,
    handleSubSubject,
  };
}

export default useSearchPyqState;
