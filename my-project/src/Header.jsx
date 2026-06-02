import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogIn, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from './lib/AuthContext.jsx';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isAuthLoading, signIn, signOut } = useAuth();

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const h = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    h();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* Close user dropdown on outside click */
  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const menuItems = [
    { label: 'About',      path: '/about',      action: () => navigate('/about') },
    { label: 'Notes',      path: '/resources',  action: () => navigate('/resources') },
    { label: 'Syllabus',   path: '/syllabus',   action: () => navigate('/syllabus') },
    { label: 'Contribute', path: '/contribute', action: () => navigate('/contribute') },
  ];

  /* Initials avatar */
  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 relative z-50">
      <div
        className="flex justify-between items-center rounded-2xl border border-white/10 bg-[#0f172a]/30 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-3.5 shadow-lg"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon.png" alt="Site Logo"
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain transition-all duration-300"
              style={{ mixBlendMode: 'screen', filter: 'invert(1) hue-rotate(180deg)' }}
            />
            <span className="text-white text-lg sm:text-2xl font-semibold tracking-tight">
              RIT Library
            </span>
          </div>
          <span className="text-white/30 text-xl sm:text-3xl font-light mx-0.5">|</span>
          <div className="flex items-center">
            <img
              src="/ramaiah-logo.png" alt="Ramaiah Logo"
              className="h-8 w-8 sm:h-[2.4rem] sm:w-[2.4rem] object-contain"
              style={{ mixBlendMode: 'screen', filter: 'invert(1) hue-rotate(180deg)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Desktop nav links */}
          {!isSmallScreen && (
            <div className="flex items-center gap-7 text-gray-200">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`text-[15px] sm:text-[16px] font-medium transition-colors cursor-pointer ${
                    location.pathname === item.path ? 'text-lime-400' : 'hover:text-blue-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Auth button / user chip */}
          {isAuthLoading ? (
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: '#A3E635',
              animation: 'spin 0.8s linear infinite',
            }} />
          ) : user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(163,230,53,0.12)',
                  border: '1px solid rgba(163,230,53,0.25)',
                }}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#66713f,#A3E635)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#fff',
                  }}>
                    {initials}
                  </div>
                )}
                {!isSmallScreen && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#F3F4F6', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.displayName || user.email}
                  </span>
                )}
                {isAdmin && (
                  <ShieldCheck size={14} style={{ color: '#A3E635' }} />
                )}
                <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.5)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      minWidth: 200, borderRadius: 14, padding: '8px',
                      background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#F3F4F6', margin: 0 }}>{user.displayName}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0', wordBreak: 'break-all' }}>{user.email}</p>
                      {isAdmin && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          marginTop: 6, fontSize: 10, fontWeight: 800,
                          padding: '2px 8px', borderRadius: 999,
                          background: 'rgba(163,230,53,0.15)', color: '#A3E635',
                          border: '1px solid rgba(163,230,53,0.3)', letterSpacing: '0.06em',
                        }}>
                          <ShieldCheck size={10} /> ADMIN
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={signIn}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#66713f,#A3E635cc)',
                color: '#fff', fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(102,113,63,0.4)',
              }}
            >
              <LogIn size={15} /> Sign In
            </motion.button>
          )}

          {/* Mobile hamburger */}
          {isSmallScreen && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isSmallScreen && menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-3 rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10 bg-[#0f172a]/90 shadow-2xl absolute left-4 right-4 z-50"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setMenuOpen(false); }}
                  className={`w-full px-6 py-4 text-[16px] font-medium transition-all duration-200 text-left border-b border-white/5 cursor-pointer ${
                    location.pathname === item.path ? 'text-lime-400' : 'text-gray-200 hover:text-blue-400 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {/* Mobile sign in/out */}
              {!user ? (
                <button
                  onClick={() => { signIn(); setMenuOpen(false); }}
                  className="w-full px-6 py-4 text-[16px] font-medium text-left text-lime-400 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                >
                  <LogIn size={16} /> Sign In
                </button>
              ) : (
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="w-full px-6 py-4 text-[16px] font-medium text-left text-red-400 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
