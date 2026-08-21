import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

const primary = '#66713f';
const secondary = '#A3E635';
const text = '#F3F4F6';

export default function HomeHero({ onBrowse, onSyllabus }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '30px 24px 40px',
      }}
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '5px 16px',
          borderRadius: 999,
          marginBottom: 36,
          background: `${primary}1e`,
          border: `1px solid ${primary}40`,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: secondary,
          textTransform: 'uppercase',
        }}
      >
        <Sparkles size={11} /> For RIT Students
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        style={{
          fontSize: 'clamp(3rem,7vw,5.5rem)',
          fontWeight: 900,
          lineHeight: 1.04,
          letterSpacing: '-0.04em',
          marginBottom: 0,
          maxWidth: 820,
        }}
      >
        Your Academic
      </motion.h1>

      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7 }}
        style={{
          fontSize: 'clamp(3rem,7vw,5.5rem)',
          fontWeight: 900,
          lineHeight: 1.04,
          letterSpacing: '-0.04em',
          marginBottom: 36,
          maxWidth: 820,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: `linear-gradient(135deg,${primary} 20%,${secondary} 80%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Resource Hub.
        </span>
      </motion.h1>

      {/* Sub-copy */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{
          fontSize: 'clamp(15px,2.2vw,18px)',
          opacity: 0.58,
          lineHeight: 1.8,
          marginBottom: 52,
          maxWidth: 500,
        }}
      >
        Question papers, notes &amp; lab manuals for every RIT subject —<br />
        one search away, always free.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 96,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: `0 16px 36px ${primary}55` }}
          whileTap={{ scale: 0.97 }}
          onClick={onBrowse}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '15px 36px',
            borderRadius: 14,
            background: `linear-gradient(135deg,${primary},${secondary}cc)`,
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 6px 24px ${primary}44`,
            letterSpacing: '-0.01em',
          }}
        >
          <Search size={18} /> Browse Resources <ArrowRight size={16} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSyllabus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '15px 28px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(14px)',
            color: text,
            fontWeight: 700,
            fontSize: 16,
            border: '1px solid rgba(255,255,255,0.13)',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
          }}
        >
          <CheckCircle size={18} /> Syllabus Tracker
        </motion.button>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="stats-strip"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          width: '100%',
          maxWidth: 800,
        }}
      >
        {[
          { value: '2,400+', label: 'Question Papers' },
          { value: '800+', label: 'Study Notes' },
          { value: '120+', label: 'Subjects' },
          { value: 'Live', label: 'Always Fresh' },
        ].map((s, i) => (
          <div key={i} className="stat-cell" style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 'clamp(24px,3vw,34px)',
                fontWeight: 800,
                marginBottom: 6,
                display: 'inline-block',
                background: `linear-gradient(135deg,${secondary},${primary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 10.5,
                opacity: 0.38,
                fontWeight: 700,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

HomeHero.propTypes = {
  onBrowse: PropTypes.func.isRequired,
  onSyllabus: PropTypes.func.isRequired,
};
