import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Trophy, Upload, Sparkles, AlertCircle } from 'lucide-react';
import Header from './Header.jsx';
import { useAuth } from './lib/AuthContext.jsx';
import { COLORS } from './constants/searchData.js';
import EventCard from './components/events/EventCard.jsx';
import AdminEventForm from './components/events/AdminEventForm.jsx';
import logger from './utils/logger.js';

const WORKER = import.meta.env.VITE_WORKER_URL || 'https://library-backend.ritlibrary.workers.dev';
const PUBLIC_UPLOADS_ENABLED = import.meta.env.VITE_PUBLIC_UPLOADS_ENABLED !== 'false';
const PUBLIC_DELETES_ENABLED = import.meta.env.VITE_PUBLIC_DELETES_ENABLED === 'true';

const categories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'event', label: 'Events', icon: CalendarDays },
  { id: 'hackathon', label: 'Hackathons', icon: Upload },
  { id: 'challenge', label: 'Challenges', icon: Trophy },
];

export default function Events() {
  const { user, isAdmin } = useAuth();
  const canUpload = Boolean(user && (isAdmin || PUBLIC_UPLOADS_ENABLED));
  const canDelete = Boolean(isAdmin || PUBLIC_DELETES_ENABLED);
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetch(`${WORKER}/api/events`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
      })
      .then((data) => setEvents(data.events || []))
      .catch((err) => {
        logger.warn('Failed to load events list', err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteEvent = async (event) => {
    if (!event?.id || deletingId) return;
    const ok = window.confirm(`Delete "${event.title}"?`);
    if (!ok) return;
    setDeletingId(event.id);
    setDeleteError('');
    try {
      const idToken = user ? await user.getIdToken() : '';
      const res = await fetch(`${WORKER}/api/events/${encodeURIComponent(event.id)}`, {
        method: 'DELETE',
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setEvents((prev) => prev.filter((item) => item.id !== event.id));
    } catch (err) {
      logger.error('Failed to delete event', err);
      setDeleteError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  const filtered = useMemo(() => {
    if (active === 'all') return events;
    return events.filter((item) => item.category === active);
  }, [events, active]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#050a14 0%,#0d1120 50%,#0a0f0a 100%)',
        color: '#F3F4F6',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <Header />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '18px 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 28 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              background: `${COLORS.primary}22`,
              border: `1px solid ${COLORS.primary}44`,
              color: COLORS.secondary,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            <Sparkles size={14} /> Campus Updates
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
            }}
          >
            Events, Hackathons & Challenges
          </h1>
          <p
            style={{
              margin: '10px auto 0',
              maxWidth: 640,
              fontSize: 15,
              opacity: 0.65,
              lineHeight: 1.6,
            }}
          >
            Stay in the loop with student events, technical competitions, and college activities
            across RIT.
          </p>
        </motion.div>

        {canUpload && (
          <AdminEventForm onCreated={(newEvent) => setEvents((prev) => [newEvent, ...prev])} />
        )}

        {deleteError && (
          <div
            style={{
              marginBottom: 18,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}
          >
            <AlertCircle size={16} /> {deleteError}
          </div>
        )}

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = active === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActive(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 12,
                  border: isSelected
                    ? `1px solid ${COLORS.primary}`
                    : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? `${COLORS.primary}25` : 'rgba(255,255,255,0.05)',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={15} style={{ color: isSelected ? COLORS.secondary : 'inherit' }} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
            <p>Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <CalendarDays
              size={42}
              style={{ color: COLORS.secondary, opacity: 0.35, marginBottom: 12 }}
            />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>No entries found</h3>
            <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.5 }}>
              Check back soon for new hackathons and campus announcements.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            <AnimatePresence>
              {filtered.map((item) => (
                <EventCard
                  key={item.id}
                  event={item}
                  isAdmin={canDelete}
                  isDeleting={deletingId === item.id}
                  onDelete={deleteEvent}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
