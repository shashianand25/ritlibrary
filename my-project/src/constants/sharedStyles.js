/**
 * Centralized Shared Style Constants & Design System Primitives
 * Consolidates glassmorphism, background gradients, card surfaces,
 * typography, and interactive button/dropdown styles across all views.
 */

export const darkBg = 'linear-gradient(135deg, #050a14 0%, #0d1120 50%, #0a0f0a 100%)';

export const primaryColor = '#66713f';
export const secondaryColor = '#A3E635';
export const accentColor = '#4A5D73';
export const textColor = '#F3F4F6';
export const mutedTextColor = '#9CA3AF';

export const darkBgStyle = {
  minHeight: '100vh',
  background: darkBg,
  color: textColor,
};

export const pageWrapperStyle = {
  minHeight: '100vh',
  background: darkBg,
  color: textColor,
  position: 'relative',
  overflow: 'hidden',
};

export const pageContainerStyle = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '100px 24px 80px',
  position: 'relative',
  zIndex: 1,
};

export const glassCard = {
  background: 'rgba(20, 25, 35, 0.75)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
  borderRadius: 24,
};

export const glassCardSubtle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  borderRadius: 20,
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

export const gradientPillButton = {
  ...pillButtonBase,
  background: 'linear-gradient(135deg, #66713f, #A3E635)',
  color: '#050a14',
  border: 'none',
  boxShadow: '0 4px 20px rgba(163, 230, 53, 0.35)',
};

export const secondaryOutlineButton = {
  ...pillButtonBase,
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#F3F4F6',
  border: '1px solid rgba(255, 255, 255, 0.15)',
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

export const iconBadgeStyle = {
  width: 42,
  height: 42,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(163, 230, 53, 0.15)',
  color: '#A3E635',
  flexShrink: 0,
};

export const cardTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#F3F4F6',
  marginBottom: 8,
};

export const cardDescriptionStyle = {
  fontSize: 14,
  lineHeight: 1.6,
  color: '#9CA3AF',
};

export const gridTwoColStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 24,
};

export const gridThreeColStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 20,
};
