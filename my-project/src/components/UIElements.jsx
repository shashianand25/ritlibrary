import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PdfIcon, ImageIcon } from '../svg.jsx';
import { pillButtonBase, inputLabelStyle, selectFieldStyle } from '../constants/sharedStyles.js';

/* ────────── file icon ────────── */
export const FileIcon = ({ fileName, mimeType }) => {
  if (mimeType === 'application/pdf') return <PdfIcon />;
  if (mimeType?.startsWith('image/')) return <ImageIcon />;
  const ext = fileName?.toLowerCase().split('.').pop();
  if (ext === 'pdf') return <PdfIcon />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return <ImageIcon />;
  return <PdfIcon />;
};

FileIcon.propTypes = {
  fileName: PropTypes.string,
  mimeType: PropTypes.string,
};

/* ────────── styled select ────────── */
export function StyledSelect({
  label,
  name,
  value,
  onChange,
  disabled,
  required,
  children,
  colors,
}) {
  return (
    <div>
      <label style={inputLabelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          style={{
            ...selectFieldStyle,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? 'rgba(255,255,255,0.3)' : colors?.text || '#fff',
          }}
          onFocus={(e) => {
            if (colors?.primary) {
              e.target.style.border = `1px solid ${colors.primary}`;
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary}22`;
            }
          }}
          onBlur={(e) => {
            e.target.style.border = '1px solid rgba(255,255,255,0.12)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            opacity: 0.5,
            color: colors?.primary || '#A3E635',
          }}
        />
      </div>
    </div>
  );
}

StyledSelect.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  children: PropTypes.node,
  colors: PropTypes.object,
};

/* ────────── pill toggle button ────────── */
export function PillBtn({ active, onClick, children, colors }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        ...pillButtonBase,
        border: `2px solid ${active ? colors?.accent || '#A3E635' : (colors?.accent || '#A3E635') + '55'}`,
        background: active ? colors?.accent || '#A3E635' : 'transparent',
        color: active ? '#fff' : colors?.accent || '#A3E635',
      }}
    >
      {children}
    </motion.button>
  );
}

PillBtn.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  colors: PropTypes.object,
};

/* ────────── three-dot menu ────────── */
export function Dots({ size = 20, color = '#888' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      style={{ width: size, height: size, color }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
      />
    </svg>
  );
}

Dots.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};

/* ────────── dropdown component ────────── */
export function Dropdown({ label, value, onChange, disabled, children }) {
  return (
    <div className="flex-1">
      {label && (
        <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium outline-none ${
            disabled
              ? 'opacity-30 cursor-not-allowed text-neutral-500'
              : 'text-neutral-100 cursor-pointer'
          }`}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-lime-400 ${
            disabled ? 'opacity-20' : 'opacity-50'
          }`}
        />
      </div>
    </div>
  );
}

Dropdown.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node,
};

/* ────────── styled text input ────────── */
export function StyledInput({ placeholder, value, onChange, className = '', ...props }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all ${className}`}
      {...props}
    />
  );
}

StyledInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

/* ────────── empty state component ────────── */
export function EmptyState({ icon: Icon, label, colors }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3.5 opacity-50 text-center">
      {Icon && <Icon size={44} style={{ color: colors?.primary || '#A3E635', opacity: 0.5 }} />}
      <p className="font-semibold text-sm text-neutral-200 m-0">
        No {label} found for this subject
      </p>
      <p className="text-xs text-neutral-400 m-0">Try a different subject or exam type</p>
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string,
  colors: PropTypes.object,
};

/* ────────── folder section component ────────── */
export function FolderSection({
  title,
  count,
  icon: Icon,
  color = '#A3E635',
  initialOpen = false,
  _isSmallScreen = false,
  children,
}) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} style={{ color, opacity: 0.9 }} />}
          <span className="text-xs font-bold uppercase tracking-wider text-white opacity-90">
            {title}
          </span>
          <span
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
            style={{ background: `${color}22`, color }}
          >
            {count}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {isOpen && <div className="pt-2 pb-1 flex flex-col gap-1.5">{children}</div>}
    </div>
  );
}

FolderSection.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  icon: PropTypes.elementType,
  color: PropTypes.string,
  initialOpen: PropTypes.bool,
  _isSmallScreen: PropTypes.bool,
  children: PropTypes.node,
};
