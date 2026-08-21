import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ImagePlus, MapPin, ExternalLink, Trash2 } from 'lucide-react';
import { COLORS } from '../../constants/searchData.js';

const categoryCopy = {
  event: 'Event',
  hackathon: 'Hackathon',
  challenge: 'Challenge',
};

const glass = {
  background: 'rgba(20,25,35,0.72)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
};

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventCard({ event, isAdmin, isDeleting, onDelete }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      style={{
        ...glass,
        borderRadius: 18,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 360,
      }}
    >
      <div
        style={{ aspectRatio: '16 / 9', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}
      >
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <ImagePlus size={40} />
          </div>
        )}
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: 999,
              background: `${COLORS.primary}24`,
              border: `1px solid ${COLORS.primary}55`,
              color: COLORS.secondary,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {categoryCopy[event.category] || 'Event'}
          </span>
          {event.date && (
            <span style={{ fontSize: 12, opacity: 0.55, fontWeight: 700 }}>
              {formatDate(event.date)}
            </span>
          )}
        </div>

        <div>
          <h2
            style={{ margin: 0, fontSize: 18, lineHeight: 1.25, fontWeight: 850, color: '#F3F4F6' }}
          >
            {event.title}
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, lineHeight: 1.6, opacity: 0.68 }}>
            {event.description}
          </p>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            fontSize: 12,
            opacity: 0.62,
          }}
        >
          {event.venue && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <MapPin size={13} /> {event.venue}
            </span>
          )}
          {event.createdBy && <span>Posted by {event.createdBy}</span>}
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: COLORS.secondary,
                fontWeight: 800,
                textDecoration: 'none',
                marginTop: 3,
              }}
            >
              Open link <ExternalLink size={13} />
            </a>
          )}
          {isAdmin && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(event)}
              style={{
                marginTop: 6,
                width: 'fit-content',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                border: '1px solid rgba(239,68,68,0.22)',
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                borderRadius: 10,
                padding: '7px 10px',
                fontSize: 12,
                fontWeight: 800,
                cursor: isDeleting ? 'wait' : 'pointer',
                opacity: isDeleting ? 0.55 : 1,
              }}
            >
              <Trash2 size={13} /> {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    date: PropTypes.string,
    venue: PropTypes.string,
    link: PropTypes.string,
    imageUrl: PropTypes.string,
    createdBy: PropTypes.string,
  }).isRequired,
  isAdmin: PropTypes.bool,
  isDeleting: PropTypes.bool,
  onDelete: PropTypes.func,
};
