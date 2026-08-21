/**
 * Shared Design System & Theme Styles
 * Centralizes glassmorphism, surface styles, and colors to prevent style duplication.
 */

export const THEME_COLORS = {
  primary: '#66713F',
  secondary: '#A3E635',
  accent: '#A3E635',
  darkBg: '#0a0d14',
  cardBg: 'rgba(20, 25, 35, 0.75)',
  border: 'rgba(255, 255, 255, 0.1)',
  subtleBorder: 'rgba(255, 255, 255, 0.06)',
};

export const glassCard = {
  background: 'rgba(20, 25, 35, 0.75)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
};

export const glassModal = {
  background: 'rgba(15, 20, 30, 0.92)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
};

export const glassPill = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
};

export const inputFieldStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  color: '#FFFFFF',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};
