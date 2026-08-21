import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import UnitAccordion from './UnitAccordion.jsx';

const TRACKER_COLORS = {
  primary: '#66713f',
  accent: '#A3E635',
};

export default function SubjectChecklist({
  selectedSubject,
  onBack,
  checkedTopics,
  toggleTopic,
  getSubjectProgress,
}) {
  const progress = getSubjectProgress(selectedSubject);

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}
    >
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '0',
          marginBottom: '24px',
        }}
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      <div
        style={{
          marginBottom: '30px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '24px',
        }}
      >
        <h2
          style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '4px',
          }}
        >
          {selectedSubject.name}
        </h2>
        <div
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '15px',
            marginBottom: '20px',
          }}
        >
          {selectedSubject.code} • {selectedSubject.credits}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              flex: 1,
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                background:
                  progress.percentage === 100 ? TRACKER_COLORS.accent : TRACKER_COLORS.primary,
                borderRadius: '4px',
              }}
            />
          </div>
          <div
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: '16px',
              minWidth: '40px',
              textAlign: 'right',
            }}
          >
            {progress.percentage}%
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {selectedSubject.units.map((unit, index) => {
          const unitTopics = unit.topics;
          const subjectProgress = checkedTopics[selectedSubject.id] || {};
          const unitCheckedCount = unitTopics.filter((t) => subjectProgress[t.id]).length;
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
  );
}

SubjectChecklist.propTypes = {
  selectedSubject: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string,
    credits: PropTypes.string,
    units: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  checkedTopics: PropTypes.object.isRequired,
  toggleTopic: PropTypes.func.isRequired,
  getSubjectProgress: PropTypes.func.isRequired,
};
