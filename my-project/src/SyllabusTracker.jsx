import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle, Circle, BookOpen, Layers } from "lucide-react";
import syllabusData from "./data/syllabus.json";
import { StyledSelect } from "./components/UIElements.jsx";

const TRACKER_COLORS = {
  primary: "#66713f",
  accent: "#A3E635"
};
import Header from "./Header.jsx";
import { ResourcesBg, GLOBAL_STYLE } from "./components/SearchBackground.jsx";

export default function SyllabusTracker() {
  const [semester, setSemester] = useState(() => {
    try {
      const savedPrefs = localStorage.getItem("pyq_syllabus_prefs");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.semester === 3 || prefs.semester === 4) return prefs.semester;
      }
      const savedForm = localStorage.getItem("searchPYQForm");
      if (savedForm) {
        const form = JSON.parse(savedForm);
        if (form.semester === 3 || form.semester === 4) return form.semester;
      }
    } catch (e) {}
    return 3;
  });

  const [selectedSubject, setSelectedSubject] = useState(() => {
    try {
      const savedPrefs = localStorage.getItem("pyq_syllabus_prefs");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.semester && prefs.subjectId) {
          const semData = syllabusData.semesters.find(s => s.semester === prefs.semester);
          if (semData) return semData.subjects.find(s => s.id === prefs.subjectId) || null;
        }
      }
    } catch (e) {}
    return null;
  });

  const [checkedTopics, setCheckedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem("pyq_syllabus_tracker");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Save preferences to local storage
  useEffect(() => {
    const prefs = {
      semester: semester,
      subjectId: selectedSubject ? selectedSubject.id : null
    };
    localStorage.setItem("pyq_syllabus_prefs", JSON.stringify(prefs));
  }, [semester, selectedSubject]);

  // Save progress to local storage
  useEffect(() => {
    if (Object.keys(checkedTopics).length > 0) {
      localStorage.setItem("pyq_syllabus_tracker", JSON.stringify(checkedTopics));
    }
  }, [checkedTopics]);

  const toggleTopic = (subjectId, topicId) => {
    setCheckedTopics(prev => {
      const subjectProgress = prev[subjectId] || {};
      const newProgress = { ...subjectProgress, [topicId]: !subjectProgress[topicId] };
      return { ...prev, [subjectId]: newProgress };
    });
  };

  const currentSemesterData = syllabusData.semesters.find(s => s.semester === semester);
  const subjects = currentSemesterData ? currentSemesterData.subjects : [];

  const getSubjectProgress = (subject) => {
    const totalTopics = subject.units.reduce((acc, unit) => acc + unit.topics.length, 0);
    const subjectProgress = checkedTopics[subject.id] || {};
    const checkedCount = Object.values(subjectProgress).filter(Boolean).length;
    return { total: totalTopics, checked: checkedCount, percentage: totalTopics === 0 ? 0 : Math.round((checkedCount / totalTopics) * 100) };
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <ResourcesBg />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            {!selectedSubject ? (
              // DASHBOARD VIEW
              <div style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(12px)", borderRadius: "24px", padding: "30px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "20px" }}>
                  <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
                      <CheckCircle style={{ color: TRACKER_COLORS.accent }} />
                      <span style={{ background: `linear-gradient(135deg, ${TRACKER_COLORS.accent}, ${TRACKER_COLORS.primary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Syllabus Tracker
                      </span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>Track your preparation progress across all subjects.</p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "10px" }}>
                    <StyledSelect value="CSE" disabled onChange={() => {}} style={{ opacity: 0.7 }} colors={{...TRACKER_COLORS, text: "#fff"}}>
                      <option value="CSE">CSE Branch</option>
                    </StyledSelect>
                    
                    <StyledSelect value={semester} onChange={(e) => {
                      setSemester(Number(e.target.value));
                      setSelectedSubject(null);
                    }} colors={{...TRACKER_COLORS, text: "#fff"}}>
                      <option value={3}>3rd Semester</option>
                      <option value={4}>4th Semester</option>
                    </StyledSelect>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {subjects.map(subject => {
                    const progress = getSubjectProgress(subject);
                    return (
                      <motion.div 
                        key={subject.id}
                        whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.2)", background: "rgba(255,255,255,0.06)" }}
                        onClick={() => setSelectedSubject(subject)}
                        style={{ cursor: "pointer", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", transition: "all 0.2s" }}
                      >
                        <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "600", marginBottom: "5px", lineHeight: "1.3" }}>{subject.name}</h3>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "20px" }}>
                          <span>{subject.code}</span>
                          <span>{progress.checked} / {progress.total} Topics</span>
                        </div>
                        
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ height: "100%", background: progress.percentage === 100 ? TRACKER_COLORS.accent : TRACKER_COLORS.primary, borderRadius: "3px" }}
                          />
                        </div>
                        <div style={{ textAlign: "right", marginTop: "8px", color: progress.percentage === 100 ? TRACKER_COLORS.accent : TRACKER_COLORS.primary, fontSize: "13px", fontWeight: "600" }}>
                          {progress.percentage}%
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // SUBJECT CHECKLIST VIEW
              <div style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(12px)", borderRadius: "24px", padding: "30px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                <button 
                  onClick={() => setSelectedSubject(null)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "14px", padding: "0", marginBottom: "24px" }}
                >
                  <ChevronLeft size={16} /> Back to Dashboard
                </button>
                
                {(() => {
                  const progress = getSubjectProgress(selectedSubject);
                  return (
                    <div style={{ marginBottom: "30px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "24px" }}>
                      <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>{selectedSubject.name}</h2>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", marginBottom: "20px" }}>{selectedSubject.code} • {selectedSubject.credits}</div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${progress.percentage}%` }} 
                            transition={{ duration: 0.5 }}
                            style={{ height: "100%", background: progress.percentage === 100 ? TRACKER_COLORS.accent : TRACKER_COLORS.primary, borderRadius: "4px" }}
                          />
                        </div>
                        <div style={{ color: "#fff", fontWeight: "600", fontSize: "16px", minWidth: "40px", textAlign: "right" }}>{progress.percentage}%</div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {selectedSubject.units.map((unit, index) => {
                    const unitTopics = unit.topics;
                    const subjectProgress = checkedTopics[selectedSubject.id] || {};
                    const unitCheckedCount = unitTopics.filter(t => subjectProgress[t.id]).length;
                    const isUnitComplete = unitCheckedCount === unitTopics.length && unitTopics.length > 0;
                    
                    return (
                      <UnitAccordion 
                        key={unit.id} 
                        unit={unit} 
                        index={index}
                        isComplete={isUnitComplete}
                        checkedCount={unitCheckedCount}
                        totalCount={unitTopics.length}
                        subjectId={selectedSubject.id}
                        subjectProgress={subjectProgress}
                        toggleTopic={toggleTopic}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
          </motion.div>
        </main>
      </div>
    </>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function UnitAccordion({ unit, index, isComplete, checkedCount, totalCount, subjectId, subjectProgress, toggleTopic }) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,${isComplete ? '0.15' : '0.05'})`, borderRadius: "16px", overflow: "hidden" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: isComplete ? "rgba(34, 197, 94, 0.05)" : "transparent", border: "none", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: isComplete ? TRACKER_COLORS.accent : "rgba(255,255,255,0.1)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: isComplete ? "#000" : "#fff", fontWeight: "bold", fontSize: "14px" }}>
            {index + 1}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#fff", fontWeight: "600", fontSize: "16px", textDecoration: isComplete ? "line-through" : "none", opacity: isComplete ? 0.7 : 1 }}>{unit.title}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "2px" }}>{checkedCount} / {totalCount} Topics Completed</div>
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={isMobile ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={isMobile ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 20px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {unit.topics.map((topic) => {
                const isChecked = !!subjectProgress[topic.id];
                return (
                  <div 
                    key={topic.id}
                    onClick={() => toggleTopic(subjectId, topic.id)}
                    style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: isChecked ? "rgba(34, 197, 94, 0.05)" : "rgba(255,255,255,0.03)", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", border: isChecked ? `1px solid ${TRACKER_COLORS.accent}40` : "1px solid transparent" }}
                  >
                    <div style={{ marginTop: "2px" }}>
                      {isChecked ? (
                        <CheckCircle size={20} color={TRACKER_COLORS.accent} />
                      ) : (
                        <Circle size={20} color="rgba(255,255,255,0.3)" />
                      )}
                    </div>
                    <span style={{ color: isChecked ? "rgba(255,255,255,0.6)" : "#fff", fontSize: "15px", lineHeight: "1.4", textDecoration: isChecked ? "line-through" : "none", transition: "all 0.2s" }}>
                      {topic.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
