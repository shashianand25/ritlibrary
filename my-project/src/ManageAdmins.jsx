import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/AuthContext';
import { ShieldCheck, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManageAdmins() {
  const { user, isAdmin } = useAuth();
  const [dbAdmins, setDbAdmins] = useState([]);
  const [envAdmins, setEnvAdmins] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdmins = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admins', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch admins');
      
      setDbAdmins(data.dbAdmins || []);
      setEnvAdmins(data.envAdmins || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdmins();
    } else if (user) {
      setLoading(false);
      setError('Forbidden: You are not an admin.');
    }
  }, [user, isAdmin]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEmail.trim()) return;

    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ email: newEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add admin');
      
      setSuccess(`Added ${data.email} as an admin!`);
      setNewEmail('');
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveAdmin = async (email) => {
    setError('');
    setSuccess('');
    if (!confirm(`Are you sure you want to remove ${email} from admins?`)) return;

    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/admins/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove admin');
      
      setSuccess(`Removed ${data.email} from admins!`);
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen text-slate-300 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-24 min-h-screen text-slate-300 flex items-center justify-center flex-col gap-4">
        <ShieldAlert size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 text-slate-300">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={32} className="text-[#a0db56]" />
        <h1 className="text-3xl font-bold text-white">Manage Admins</h1>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-[#a0db56] rounded-lg">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              Database Admins
              <span className="text-xs font-normal px-2 py-1 bg-slate-700 rounded-full">{dbAdmins.length}</span>
            </h2>
            <div className="space-y-3">
              {dbAdmins.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No admins in the database yet.</p>
              ) : (
                dbAdmins.map((admin) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={admin.email} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-[#a0db56]/30 transition-colors"
                  >
                    <div className="font-mono text-sm text-slate-200">{admin.email}</div>
                    <button 
                      onClick={() => handleRemoveAdmin(admin.email)}
                      className="text-slate-400 hover:text-red-400 transition-colors p-2"
                      title="Remove Admin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          <section className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
            <h2 className="text-lg font-semibold text-white mb-4">Bootstrap Admins (Env Vars)</h2>
            <p className="text-xs text-slate-400 mb-4">These admins are hardcoded in environment variables and cannot be removed via the UI.</p>
            <div className="space-y-2">
              {envAdmins.filter(Boolean).map((email, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-slate-900/50 text-slate-400 font-mono text-sm">
                  <ShieldCheck size={14} className="text-slate-500" /> {email}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-1 space-y-6">
          <section className="bg-[#1f2937] rounded-xl p-6 border border-slate-700/80 shadow-lg sticky top-24">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Admin</h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Google Account Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#a0db56] focus:ring-1 focus:ring-[#a0db56] transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#a0db56] hover:bg-[#8bc34a] text-slate-900 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} /> Invite Admin
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
