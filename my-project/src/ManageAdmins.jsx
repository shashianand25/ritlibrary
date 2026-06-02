import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./lib/AuthContext.jsx";
import { Trash2, Plus, ShieldCheck, Mail, Loader2, AlertCircle } from "lucide-react";
import Header from "./Header.jsx";
import { COLORS } from "./constants/searchData.js";

const WORKER = import.meta.env.VITE_WORKER_URL || "https://library-backend.ritlibrary.workers.dev";
const C = COLORS;

const glass = {
  background: "rgba(20,25,35,0.75)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 12px 40px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
};

export default function ManageAdmins() {
  const { user, isAdmin, isAuthLoading } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [bootstrapAdmins, setBootstrapAdmins] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAdmins = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${WORKER}/api/admins`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error("Failed to fetch admins");
      const data = await res.json();
      setAdmins(data.dbAdmins || []);
      setBootstrapAdmins(data.bootstrapAdmins || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) fetchAdmins();
    else if (!isAuthLoading) setLoading(false);
  }, [user, isAdmin, isAuthLoading]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;
    setActionLoading(true);
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${WORKER}/api/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ newAdminEmail: newEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add admin");
      setNewEmail("");
      await fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (emailToRemove) => {
    if (!window.confirm(`Are you sure you want to remove ${emailToRemove} from admins?`)) return;
    setActionLoading(true);
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${WORKER}/api/admins`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ removeEmail: emailToRemove })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove admin");
      await fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0d14", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} className="animate-spin" style={{ opacity: 0.5 }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0d14", color: "#fff" }}>
        <Header />
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <ShieldCheck size={48} style={{ color: "#ef4444", margin: "0 auto 16px", opacity: 0.8 }} />
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Access Denied</h2>
          <p style={{ opacity: 0.6, marginTop: 8 }}>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d14", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px" }}>Manage Admins</h1>
          <p style={{ opacity: 0.6, fontSize: 15 }}>Dynamically grant admin privileges to team members</p>
        </motion.div>

        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#ef4444", marginBottom: 24, display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ ...glass, borderRadius: 20, padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", display: "flex", gap: 8, alignItems: "center" }}>
            <Plus size={16} color={C.primary} /> Add New Admin
          </h3>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flexGrow: 1 }}>
              <Mail size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="email"
                placeholder="student@college.edu"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "12px 16px 12px 42px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s" }}
              />
            </div>
            <button type="submit" disabled={actionLoading || !newEmail} style={{ padding: "0 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "opacity 0.2s", opacity: (actionLoading || !newEmail) ? 0.5 : 1 }}>
              {actionLoading ? "Adding..." : "Add"}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...glass, borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Administrators</h3>
          </div>
          
          <div style={{ padding: "12px" }}>
            {/* Bootstrap Admins */}
            {bootstrapAdmins.map(email => (
              <div key={email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{email}</div>
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4, display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} /> Root Admin (Environment)
                  </div>
                </div>
              </div>
            ))}

            {/* DB Admins */}
            {admins.map(admin => (
              <div key={admin.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{admin.email}</div>
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>Added: {new Date(admin.created_at).toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => handleRemove(admin.email)}
                  disabled={actionLoading}
                  style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.5 : 1, transition: "background 0.2s" }}
                  title="Remove Admin"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {bootstrapAdmins.length === 0 && admins.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", opacity: 0.5, fontSize: 14 }}>
                No administrators found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
