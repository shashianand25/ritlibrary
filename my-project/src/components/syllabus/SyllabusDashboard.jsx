import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { StyledSelect } from '../UIElements.jsx';

const TRACKER_COLORS = {
  primary: '#66713f',
  accent: '#A3E635',
};

export default function SyllabusDashboard({
  semester,
  setSemester,
  subjects,
  getSubjectProgress,
  onSelectSubject,
}) {
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: 0,
            }}
          >
            <CheckCircle style={{ color: TRACKER_COLORS.accent }} />
            <span
              style={{
                background: `linear-gradient(135deg, ${TRACKER_COLORS.accent}, ${TRACKER_COLORS.primary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Syllabus Tracker
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>
            Track your preparation progress across all subjects.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <StyledSelect
            value="CSE"
            disabled
            onChange={() => {}}
            style={{ opacity: 0.7 }}
            colors={{ ...TRACKER_COLORS, text: '#fff' }}
          >
            <option value="CSE">CSE Branch</option>
          </StyledSelect>

          <StyledSelect
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            colors={{ ...TRACKER_COLORS, text: '#fff' }}
          >
            <option value={3}>3rd Semester</option>
            <option value={4}>4th Semester</option>
          </StyledSelect>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {subjects.map((subject) => {
          const progress = getSubjectProgress(subject);
          return (
            <motion.div
              key={subject.id}
              whileHover={{
                y: -5,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                background: 'rgba(255,255,255,0.06)',
              }}
              onClick={() => onSelectSubject(subject)}
              style={{
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.2s',
              }}
            >
              <h3
                style={{
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  lineHeight: '1.3',
                }}
              >
                {subject.name}
              </h3>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                  marginBottom: '20px',
                }}
              >
                <span>{subject.code}</span>
                <span>
                  {progress.checked} / {progress.total} Topics
                </span>
              </div>

              <div
                style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background:
                      progress.percentage === 100 ? TRACKER_COLORS.accent : TRACKER_COLORS.primary,
                    borderRadius: '3px',
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: 'right',
                  marginTop: '8px',
                  color:
                    progress.percentage === 100 ? TRACKER_COLORS.accent : TRACKER_COLORS.primary,
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {progress.percentage}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

SyllabusDashboard.propTypes = {
  semester: PropTypes.number.isRequired,
  setSemester: PropTypes.func.isRequired,
  subjects: PropTypes.array.isRequired,
  getSubjectProgress: PropTypes.func.isRequired,
  onSelectSubject: PropTypes.func.isRequired,
};
