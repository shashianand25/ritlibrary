import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, ShieldAlert, Plus, X } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext.jsx';
import { COLORS } from '../../constants/searchData.js';
import logger from '../../utils/logger.js';
import { createEvent } from '../../api/client.js';

const glass = {
  background: 'rgba(20,25,35,0.72)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
};

const fieldStyle = {
  width: '100%',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.06)',
  color: '#F3F4F6',
  outline: 'none',
  padding: '10px 12px',
  fontSize: 13,
  boxSizing: 'border-box',
};

export default function AdminEventForm({ onCreated }) {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'event',
    date: '',
    venue: '',
    link: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!image) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!image || status === 'uploading') return;
    setStatus('uploading');
    setError('');
    try {
      const idToken = user ? await user.getIdToken() : '';
      const body = new FormData();
      body.append('image', image);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append('createdBy', user?.displayName || user?.email || 'Admin');

      const data = await createEvent(body, idToken);
      onCreated(data.event);
      setImage(null);
      setForm({ title: '', description: '', category: 'event', date: '', venue: '', link: '' });
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setOpen(false);
      }, 900);
    } catch (err) {
      logger.error('Failed to submit event', err);
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <section style={{ ...glass, borderRadius: 18, padding: 18, marginBottom: 22 }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: 'none',
          background: 'transparent',
          color: '#F3F4F6',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 850 }}>
          <ShieldAlert size={17} style={{ color: COLORS.secondary }} />
          Event upload
        </span>
        {open ? <X size={18} /> : <Plus size={18} />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={submit}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 18,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  aspectRatio: '16 / 10',
                  borderRadius: 14,
                  border: `1.5px dashed ${COLORS.primary}88`,
                  background: preview ? `url(${preview}) center / cover` : 'rgba(255,255,255,0.04)',
                  color: COLORS.secondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                {!preview && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ImagePlus size={20} /> Image
                  </span>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 10,
                }}
              >
                <input
                  name="title"
                  value={form.title}
                  onChange={update}
                  required
                  placeholder="Title"
                  style={fieldStyle}
                />
                <select name="category" value={form.category} onChange={update} style={fieldStyle}>
                  <option value="event">Event</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="challenge">Challenge</option>
                </select>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={update}
                  required
                  placeholder="Text / description"
                  rows={4}
                  style={{ ...fieldStyle, gridColumn: '1 / -1', resize: 'vertical' }}
                />
                <input
                  name="date"
                  value={form.date}
                  onChange={update}
                  type="date"
                  style={fieldStyle}
                />
                <input
                  name="venue"
                  value={form.venue}
                  onChange={update}
                  placeholder="Venue"
                  style={fieldStyle}
                />
                <input
                  name="link"
                  value={form.link}
                  onChange={update}
                  placeholder="Registration or details link"
                  style={{ ...fieldStyle, gridColumn: '1 / -1' }}
                />
                {error && (
                  <p
                    style={{
                      gridColumn: '1 / -1',
                      margin: 0,
                      color: '#ef4444',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!image || status === 'uploading'}
                  style={{
                    gridColumn: '1 / -1',
                    border: 'none',
                    borderRadius: 12,
                    padding: '11px 14px',
                    cursor: image && status !== 'uploading' ? 'pointer' : 'not-allowed',
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}cc)`,
                    color: '#fff',
                    fontWeight: 850,
                    opacity: image && status !== 'uploading' ? 1 : 0.5,
                  }}
                >
                  {status === 'uploading'
                    ? 'Publishing...'
                    : status === 'success'
                      ? 'Published'
                      : 'Publish event'}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}

AdminEventForm.propTypes = {
  onCreated: PropTypes.func.isRequired,
};
