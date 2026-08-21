/**
 * Centralized Shared Style Constants for UI Components
 * Consolidates glassmorphism, background gradients, and pill/button styles.
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
