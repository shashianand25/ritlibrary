import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const secondary = '#A3E635';

const tags = [
  'CSE',
  'ISE',
  'ECE',
  'EEE',
  'AIML',
  'AIDS',
  'Cyber Security',
  'Civil',
  'Mechanical',
  'IEM',
  'ETE',
  'EIE',
  'MLE',
  'Aerospace',
  'Chemical',
  'CIE1',
  'CIE2',
  'SEE',
  'Notes',
  'Lab Manuals',
  'Question Banks',
];

export default function HomeTagCloud({ onSelectTag }) {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 32px 120px',
        textAlign: 'center',
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          opacity: 0.35,
          textTransform: 'uppercase',
          marginBottom: 40,
        }}
      >
        Available for
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 12px',
          justifyContent: 'center',
        }}
      >
        {tags.map((tag, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.06, opacity: 1 }}
            onClick={() => onSelectTag(tag)}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '7px 16px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = secondary + '55';
              e.currentTarget.style.color = secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
            }}
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        style={{ fontSize: 14, opacity: 0.35, marginTop: 36, fontWeight: 500 }}
      >
        …and many more
      </motion.p>
    </div>
  );
}

HomeTagCloud.propTypes = {
  onSelectTag: PropTypes.func.isRequired,
};
