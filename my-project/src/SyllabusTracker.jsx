import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import syllabusData from './data/syllabus.json';
import Header from './Header.jsx';
import { ResourcesBg, GLOBAL_STYLE } from './components/SearchBackground.jsx';
import SyllabusDashboard from './components/syllabus/SyllabusDashboard.jsx';
import SubjectChecklist from './components/syllabus/SubjectChecklist.jsx';
import logger from './utils/logger.js';

export default function SyllabusTracker() {
  const [semester, setSemester] = useState(() => {
    try {
      const savedPrefs =
        typeof window !== 'undefined' ? localStorage.getItem('pyq_syllabus_prefs') : null;
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.semester === 3 || prefs.semester === 4) return prefs.semester;
      }
      const savedForm =
        typeof window !== 'undefined' ? localStorage.getItem('searchPYQForm') : null;
      if (savedForm) {
        const form = JSON.parse(savedForm);
        if (form.semester === 3 || form.semester === 4) return form.semester;
      }
    } catch (e) {
      logger.warn('Failed to parse saved syllabus semester from localStorage', e);
    }
    return 3;
  });

  const [selectedSubject, setSelectedSubject] = useState(() => {
    try {
      const savedPrefs =
        typeof window !== 'undefined' ? localStorage.getItem('pyq_syllabus_prefs') : null;
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.semester && prefs.subjectId) {
          const semData = syllabusData.semesters.find((s) => s.semester === prefs.semester);
          if (semData) return semData.subjects.find((s) => s.id === prefs.subjectId) || null;
        }
      }
    } catch (e) {
      logger.warn('Failed to parse saved syllabus subject preference', e);
    }
    return null;
  });

  const [checkedTopics, setCheckedTopics] = useState(() => {
    try {
      const saved =
        typeof window !== 'undefined' ? localStorage.getItem('pyq_syllabus_tracker') : null;
      if (saved) return JSON.parse(saved);
    } catch (e) {
      logger.warn(
        'Failed to parse syllabus tracker topics from localStorage, resetting to clean state',
        e
      );
    }
    return {};
  });

  // Save preferences to local storage
  useEffect(() => {
    const prefs = {
      semester: semester,
      subjectId: selectedSubject ? selectedSubject.id : null,
    };
    localStorage.setItem('pyq_syllabus_prefs', JSON.stringify(prefs));
  }, [semester, selectedSubject]);

  // Save progress to local storage
  useEffect(() => {
    if (Object.keys(checkedTopics).length > 0) {
      localStorage.setItem('pyq_syllabus_tracker', JSON.stringify(checkedTopics));
    }
  }, [checkedTopics]);

  const toggleTopic = (subjectId, topicId) => {
    setCheckedTopics((prev) => {
      const subjectProgress = prev[subjectId] || {};
      const newProgress = { ...subjectProgress, [topicId]: !subjectProgress[topicId] };
      return { ...prev, [subjectId]: newProgress };
    });
  };

  const currentSemesterData = syllabusData.semesters.find((s) => s.semester === semester);
  const subjects = currentSemesterData ? currentSemesterData.subjects : [];

  const getSubjectProgress = (subject) => {
    if (!subject || !subject.units) return { total: 0, checked: 0, percentage: 0 };
    const totalTopics = subject.units.reduce(
      (acc, unit) => acc + (unit.topics ? unit.topics.length : 0),
      0
    );
    const subjectProgress = checkedTopics[subject.id] || {};
    const checkedCount = Object.values(subjectProgress).filter(Boolean).length;
    return {
      total: totalTopics,
      checked: checkedCount,
      percentage: totalTopics === 0 ? 0 : Math.round((checkedCount / totalTopics) * 100),
    };
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <ResourcesBg />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />

        <main className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {!selectedSubject ? (
              <SyllabusDashboard
                semester={semester}
                setSemester={(sem) => {
                  setSemester(sem);
                  setSelectedSubject(null);
                }}
                subjects={subjects}
                getSubjectProgress={getSubjectProgress}
                onSelectSubject={setSelectedSubject}
              />
            ) : (
              <SubjectChecklist
                selectedSubject={selectedSubject}
                onBack={() => setSelectedSubject(null)}
                checkedTopics={checkedTopics}
                toggleTopic={toggleTopic}
                getSubjectProgress={getSubjectProgress}
              />
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
}
