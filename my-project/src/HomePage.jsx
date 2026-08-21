import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';
import HomeBackground from './components/home/HomeBackground.jsx';
import HomeHero from './components/home/HomeHero.jsx';
import HomeHowItWorks from './components/home/HomeHowItWorks.jsx';
import HomeTagCloud from './components/home/HomeTagCloud.jsx';

const text = '#F3F4F6';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          color: text,
          position: 'relative',
          fontFamily: "'Outfit',system-ui,sans-serif",
        }}
      >
        <HomeBackground />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <Header />

          {/* Hero Section */}
          <HomeHero
            onBrowse={() => navigate('/resources')}
            onSyllabus={() => navigate('/syllabus')}
          />

          {/* How It Works Section */}
          <HomeHowItWorks />

          {/* Tag Cloud Section */}
          <HomeTagCloud onSelectTag={() => navigate('/resources')} />

          {/* Footer */}
          <footer
            style={{
              textAlign: 'center',
              padding: '24px',
              fontSize: 12,
              opacity: 0.28,
              fontWeight: 500,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            RIT Library · Built for students, by students
          </footer>
        </div>
      </div>

      <style>{`
        /* Stats strip */
        .stats-strip {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
        }
        .stat-cell {
          padding: 36px 24px;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .stat-cell:last-child { border-right: none; }

        /* Steps grid */
        .steps-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 48px;
        }

        /* Mobile */
        @media (max-width: 600px) {
          .stats-strip {
            grid-template-columns: 1fr 1fr;
            max-width: 340px;
            margin: 0 auto;
          }
          .stat-cell {
            padding: 24px 14px;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .stat-cell:nth-child(odd)  { border-right: 1px solid rgba(255,255,255,0.06); }
          .stat-cell:nth-last-child(-n+2) { border-bottom: none; }
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 52px;
          }
        }
      `}</style>
    </>
  );
}
