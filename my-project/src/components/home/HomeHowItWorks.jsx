import React from 'react';
import { motion } from 'framer-motion';

const primary = '#66713f';
const secondary = '#A3E635';

const steps = [
  {
    n: '01',
    title: 'Pick your subject',
    desc: 'Choose your semester, branch, and subject — or just paste the subject code directly.',
  },
  {
    n: '02',
    title: 'Choose exam type',
    desc: 'Filter by CIE1, CIE2, SEE, or browse Notes and Lab Manuals in one click.',
  },
  {
    n: '03',
    title: 'View or download',
    desc: 'Open PDFs right in the browser. No login, no downloads, no redirects.',
  },
];

export default function HomeHowItWorks() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px 60px' }}>
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
          textAlign: 'center',
          marginBottom: 64,
        }}
      >
        How it works
      </motion.p>

      <div className="steps-grid">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <span
              style={{
                fontSize: 'clamp(3rem,7vw,5rem)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                background: `linear-gradient(135deg,${secondary},${primary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              {s.n}
            </span>
            <div>
              <div
                style={{
                  fontSize: 'clamp(17px,2vw,20px)',
                  fontWeight: 800,
                  marginBottom: 10,
                  letterSpacing: '-0.02em',
                }}
              >
                {s.title}
              </div>
              <div style={{ fontSize: 14, opacity: 0.52, lineHeight: 1.75, maxWidth: 280 }}>
                {s.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
