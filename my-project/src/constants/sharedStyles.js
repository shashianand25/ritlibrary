/**
 * Centralized Shared Style Constants for UI Components
 * Consolidates glassmorphism, background gradients, and pill/button/dropdown styles.
 */

export const darkBg = 'linear-gradient(135deg, #050a14 0%, #0d1120 50%, #0a0f0a 100%)';

export const darkBgStyle = {
  minHeight: '100vh',
  background: darkBg,
  color: '#F3F4F6',
};

export const glassCard = {
  background: 'rgba(20, 25, 35, 0.75)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
  borderRadius: 24,
};

export const glassDropdown = {
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
  borderRadius: 14,
};

export const pillButtonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '7px 18px',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s',
};

export const userChipStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  borderRadius: 12,
  cursor: 'pointer',
  background: 'rgba(163, 230, 53, 0.12)',
  border: '1px solid rgba(163, 230, 53, 0.25)',
};

export const primaryGradientButton = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  padding: '7px 16px',
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #66713f, rgba(163, 230, 53, 0.8))',
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 700,
  boxShadow: '0 4px 14px rgba(102, 113, 63, 0.4)',
};

export const avatarFallbackStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #66713f, #A3E635)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 800,
  color: '#ffffff',
};

export const dropdownItemBase = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 12px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  background: 'transparent',
  fontSize: 13,
  fontWeight: 600,
  transition: 'background 0.15s',
};

export const inputLabelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  opacity: 0.6,
  marginBottom: 6,
};

export const selectFieldStyle = {
  width: '100%',
  appearance: 'none',
  padding: '10px 36px 10px 14px',
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  transition: 'border 0.2s, box-shadow 0.2s',
};

export const sectionLabelStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.14em',
  opacity: 0.45,
  textTransform: 'uppercase',
  marginBottom: 16,
};
