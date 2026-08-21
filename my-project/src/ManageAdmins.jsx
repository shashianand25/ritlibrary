import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, ShieldCheck, Mail, Loader2, AlertCircle } from 'lucide-react';
import Header from './Header.jsx';
import { THEME_COLORS, inputFieldStyle } from './constants/theme.js';
import { darkBgStyle, glassCard } from './constants/sharedStyles.js';
import useManageAdminsState from './hooks/useManageAdminsState.js';

export default function ManageAdmins() {
  const {
    isAdmin,
    isAuthLoading,
    admins,
    bootstrapAdmins,
    newEmail,
    setNewEmail,
    loading,
    actionLoading,
    error,
    handleAdd,
    handleRemove,
  } = useManageAdminsState();

  if (isAuthLoading || loading) {
    return (
      <div
        style={{
          ...darkBgStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ opacity: 0.5 }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={darkBgStyle}>
        <Header />
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <ShieldCheck
            size={48}
            style={{ color: '#ef4444', margin: '0 auto 16px', opacity: 0.8 }}
          />
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Access Denied</h2>
          <p style={{ opacity: 0.6, marginTop: 8 }}>
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...darkBgStyle,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>Manage Admins</h1>
          <p style={{ opacity: 0.6, fontSize: 15 }}>
            Dynamically grant admin privileges to team members
          </p>
        </motion.div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              color: '#ef4444',
              marginBottom: 24,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              fontSize: 14,
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Add Admin Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ ...glassCard, borderRadius: 20, padding: 24, marginBottom: 32 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              margin: '0 0 16px',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Plus size={16} color={THEME_COLORS.primary} /> Add New Admin
          </h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)',
                }}
              />
              <input
                type="email"
                placeholder="student@college.edu"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                style={{
                  ...inputFieldStyle,
                  paddingLeft: 42,
                }}
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading || !newEmail}
              style={{
                padding: '0 24px',
                background: THEME_COLORS.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: actionLoading || !newEmail ? 0.5 : 1,
              }}
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Add Admin'}
            </button>
          </form>
        </motion.div>

        {/* Admin List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ ...glassCard, borderRadius: 20, overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Administrators</h3>
          </div>

          <div style={{ padding: '12px' }}>
            {/* Bootstrap Admins */}
            {bootstrapAdmins.map((email) => (
              <div
                key={email}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{email}</div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.5,
                      marginTop: 4,
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: THEME_COLORS.primary,
                      }}
                    />{' '}
                    Root Admin (Environment)
                  </div>
                </div>
              </div>
            ))}

            {/* DB Admins */}
            {admins.map((admin) => (
              <div
                key={admin.email || admin}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{admin.email || admin}</div>
                  {admin.created_at && (
                    <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
                      Added: {new Date(admin.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const ok = window.confirm(`Remove ${admin.email || admin} from admins?`);
                    if (ok) handleRemove(admin.email || admin);
                  }}
                  disabled={actionLoading}
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444',
                    padding: '8px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {bootstrapAdmins.length === 0 && admins.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', opacity: 0.5, fontSize: 14 }}>
                No active administrators found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
