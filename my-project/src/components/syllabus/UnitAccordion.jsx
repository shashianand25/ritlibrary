import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

const TRACKER_COLORS = {
  primary: '#66713f',
  accent: '#A3E635',
};

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

export default function UnitAccordion({
  unit,
  index,
  isComplete,
  checkedCount,
  totalCount,
  subjectId,
  subjectProgress,
  toggleTopic,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,${isComplete ? '0.15' : '0.05'})`,
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: isComplete ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: isComplete ? TRACKER_COLORS.accent : 'rgba(255,255,255,0.1)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isComplete ? '#000' : '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {index + 1}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                color: '#fff',
                fontWeight: '600',
                fontSize: '16px',
                textDecoration: isComplete ? 'line-through' : 'none',
                opacity: isComplete ? 0.7 : 1,
              }}
            >
              {unit.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '2px' }}>
              {checkedCount} / {totalCount} Topics Completed
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={isMobile ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={isMobile ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 20px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {unit.topics.map((topic) => {
                const isChecked = !!subjectProgress[topic.id];
                return (
                  <div
                    key={topic.id}
                    onClick={() => toggleTopic(subjectId, topic.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      background: isChecked ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.03)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: isChecked
                        ? `1px solid ${TRACKER_COLORS.accent}40`
                        : '1px solid transparent',
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {isChecked ? (
                        <CheckCircle size={20} color={TRACKER_COLORS.accent} />
                      ) : (
                        <Circle size={20} color="rgba(255,255,255,0.3)" />
                      )}
                    </div>
                    <span
                      style={{
                        color: isChecked ? 'rgba(255,255,255,0.6)' : '#fff',
                        fontSize: '15px',
                        lineHeight: '1.4',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
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

UnitAccordion.propTypes = {
  unit: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    topics: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.string,
      })
    ),
  }).isRequired,
  index: PropTypes.number.isRequired,
  isComplete: PropTypes.bool.isRequired,
  checkedCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  subjectId: PropTypes.string.isRequired,
  subjectProgress: PropTypes.object.isRequired,
  toggleTopic: PropTypes.func.isRequired,
};
