import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Trophy, Upload, ImagePlus, MapPin,
  ShieldAlert, Plus, X, ExternalLink, Sparkles, Trash2, AlertCircle
} from "lucide-react";
import Header from "./Header.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { COLORS } from "./constants/searchData.js";

const WORKER = import.meta.env.VITE_WORKER_URL || "https://library-backend.ritlibrary.workers.dev";
const PUBLIC_UPLOADS_ENABLED = true;
const PUBLIC_DELETES_ENABLED = true;

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "event", label: "Events", icon: CalendarDays },
  { id: "hackathon", label: "Hackathons", icon: Upload },
  { id: "challenge", label: "Challenges", icon: Trophy },
];

const categoryCopy = {
  event: "Event",
  hackathon: "Hackathon",
  challenge: "Challenge",
};

const glass = {
  background: "rgba(20,25,35,0.72)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
};

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function EventCard({ event, isAdmin, isDeleting, onDelete }) {
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
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 360,
      }}
    >
      <div style={{ aspectRatio: "16 / 9", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)" }}>
            <ImagePlus size={40} />
          </div>
        )}
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: 999,
            background: `${COLORS.primary}24`,
            border: `1px solid ${COLORS.primary}55`,
            color: COLORS.secondary,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            {categoryCopy[event.category] || "Event"}
          </span>
          {event.date && (
            <span style={{ fontSize: 12, opacity: 0.55, fontWeight: 700 }}>{formatDate(event.date)}</span>
          )}
        </div>

        <div>
          <h2 style={{ margin: 0, fontSize: 18, lineHeight: 1.25, fontWeight: 850, color: "#F3F4F6" }}>
            {event.title}
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.6, opacity: 0.68 }}>
            {event.description}
          </p>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7, fontSize: 12, opacity: 0.62 }}>
          {event.venue && (
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <MapPin size={13} /> {event.venue}
            </span>
          )}
          {event.createdBy && (
            <span>Posted by {event.createdBy}</span>
          )}
          {event.link && (
            <a href={event.link} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: COLORS.secondary, fontWeight: 800, textDecoration: "none", marginTop: 3 }}>
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
                width: "fit-content",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid rgba(239,68,68,0.22)",
                background: "rgba(239,68,68,0.08)",
                color: "#ef4444",
                borderRadius: 10,
                padding: "7px 10px",
                fontSize: 12,
                fontWeight: 800,
                cursor: isDeleting ? "wait" : "pointer",
                opacity: isDeleting ? 0.55 : 1,
              }}
            >
              <Trash2 size={13} /> {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function AdminEventForm({ onCreated }) {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "event",
    date: "",
    venue: "",
    link: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const update = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!image || status === "uploading") return;
    setStatus("uploading");
    setError("");
    try {
      const idToken = await user.getIdToken();
      const body = new FormData();
      body.append("image", image);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("createdBy", user.displayName || user.email || "Admin");

      const res = await fetch(`${WORKER}/api/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Event upload failed");
      onCreated(data.event);
      setImage(null);
      setForm({ title: "", description: "", category: "event", date: "", venue: "", link: "" });
      setStatus("success");
      setTimeout(() => { setStatus("idle"); setOpen(false); }, 900);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <section style={{ ...glass, borderRadius: 18, padding: 18, marginBottom: 22 }}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "none",
          background: "transparent",
          color: "#F3F4F6",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 850 }}>
          <ShieldAlert size={17} style={{ color: COLORS.secondary }} />
          Event upload
        </span>
        {open ? <X size={18} /> : <Plus size={18} />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={submit}
            style={{ overflow: "hidden" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  aspectRatio: "16 / 10",
                  borderRadius: 14,
                  border: `1.5px dashed ${COLORS.primary}88`,
                  background: preview ? `url(${preview}) center / cover` : "rgba(255,255,255,0.04)",
                  color: COLORS.secondary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                }}
              >
                {!preview && <span style={{ display: "flex", alignItems: "center", gap: 8 }}><ImagePlus size={20} /> Image</span>}
              </button>
              <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => setImage(e.target.files?.[0] || null)} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                <input name="title" value={form.title} onChange={update} required placeholder="Title" style={fieldStyle} />
                <select name="category" value={form.category} onChange={update} style={fieldStyle}>
                  <option value="event">Event</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="challenge">Challenge</option>
                </select>
                <textarea name="description" value={form.description} onChange={update} required placeholder="Text / description" rows={4} style={{ ...fieldStyle, gridColumn: "1 / -1", resize: "vertical" }} />
                <input name="date" value={form.date} onChange={update} type="date" style={fieldStyle} />
                <input name="venue" value={form.venue} onChange={update} placeholder="Venue" style={fieldStyle} />
                <input name="link" value={form.link} onChange={update} placeholder="Registration or details link" style={{ ...fieldStyle, gridColumn: "1 / -1" }} />
                {error && <p style={{ gridColumn: "1 / -1", margin: 0, color: "#ef4444", fontSize: 12, fontWeight: 700 }}>{error}</p>}
                <button
                  type="submit"
                  disabled={!image || status === "uploading"}
                  style={{
                    gridColumn: "1 / -1",
                    border: "none",
                    borderRadius: 12,
                    padding: "11px 14px",
                    cursor: image && status !== "uploading" ? "pointer" : "not-allowed",
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}cc)`,
                    color: "#fff",
                    fontWeight: 850,
                    opacity: image && status !== "uploading" ? 1 : 0.5,
                  }}
                >
                  {status === "uploading" ? "Publishing..." : status === "success" ? "Published" : "Publish event"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}

const fieldStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  color: "#F3F4F6",
  outline: "none",
  padding: "10px 12px",
  fontSize: 13,
  boxSizing: "border-box",
};

export default function Events() {
  const { user, isAdmin } = useAuth();
  const canUpload = Boolean(user && (isAdmin || PUBLIC_UPLOADS_ENABLED));
  const canDelete = Boolean(isAdmin || PUBLIC_DELETES_ENABLED);
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetch(`${WORKER}/api/events`)
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (active === "all") return events;
    return events.filter(event => event.category === active);
  }, [events, active]);

  const deleteEvent = async event => {
    if (!event?.id || !canDelete || deletingId) return;
    const ok = window.confirm(`Delete "${event.title}" from the events page?`);
    if (!ok) return;
    setDeletingId(event.id);
    setDeleteError("");
    try {
      const idToken = user ? await user.getIdToken() : "";
      const res = await fetch(`${WORKER}/api/events/${encodeURIComponent(event.id)}`, {
        method: "DELETE",
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setEvents(prev => prev.filter(item => item.id !== event.id));
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", color: "#F3F4F6", background: "linear-gradient(135deg,#050a14 0%,#0d1120 50%,#0a0f0a 100%)", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Header />

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 24px 80px" }}>
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 8px", color: COLORS.secondary, fontSize: 12, fontWeight: 850, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Campus board
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1, fontWeight: 950 }}>
            Events, hackathons, and challenges
          </h1>
        </motion.section>

        {canUpload && <AdminEventForm onCreated={event => setEvents(prev => [event, ...prev])} />}

        {deleteError && (
          <div style={{ ...glass, borderRadius: 14, padding: "10px 13px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, color: "#ef4444", fontSize: 12, fontWeight: 700 }}>
            <AlertCircle size={15} /> {deleteError}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                border: `1px solid ${active === category.id ? COLORS.primary : "rgba(255,255,255,0.1)"}`,
                background: active === category.id ? `${COLORS.primary}44` : "rgba(255,255,255,0.04)",
                color: active === category.id ? COLORS.secondary : "#F3F4F6",
                borderRadius: 999,
                padding: "8px 13px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <category.icon size={14} /> {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ ...glass, borderRadius: 18, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
            Loading events...
          </div>
        ) : filtered.length ? (
          <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            <AnimatePresence>
              {filtered.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isAdmin={canDelete}
                  isDeleting={deletingId === event.id}
                  onDelete={deleteEvent}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div style={{ ...glass, borderRadius: 18, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", opacity: 0.75, padding: 24 }}>
            No events here yet.
          </div>
        )}
      </main>
    </div>
  );
}
