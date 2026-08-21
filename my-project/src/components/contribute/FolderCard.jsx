import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, X, Eye } from 'lucide-react';
import { COLORS } from '../../constants/searchData.js';

const C = COLORS;

const glass = {
  background: 'rgba(20,25,35,0.75)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};

export default function FolderCard({
  name,
  count,
  isAdmin,
  isCustom,
  isActive,
  onUpload,
  onRemove,
  onView,
}) {
  const isYear = /^\d{4}-\d{2}$/.test(name);
  const color = isYear ? C.primary : C.secondary;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        ...glass,
        borderRadius: 18,
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        border: isActive ? `1px solid ${color}88` : glass.border,
      }}
    >
      {isCustom && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 text-white/30 hover:text-white/80 transition-colors"
          title="Remove custom folder"
        >
          <X size={13} />
        </button>
      )}

      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}18` }}
        >
          <FolderOpen size={20} style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-extrabold text-white truncate">{name}</p>
          <p className="m-0 text-xs text-neutral-400 mt-0.5">
            {count} {count === 1 ? 'file' : 'files'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onView}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isActive
              ? 'bg-lime-400 text-neutral-950 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-neutral-200'
          }`}
        >
          <Eye size={13} /> View
        </button>
        <button
          type="button"
          onClick={onUpload}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-lime-400/15 text-lime-300 hover:bg-lime-400/25 border border-lime-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={13} /> Upload
        </button>
      </div>
    </motion.div>
  );
}
