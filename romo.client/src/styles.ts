import type { CSSProperties } from 'react';

/**
 * Zentrale Style-Konstanten für die RocketMoon App
 */

// ============================================
// FARBEN
// ============================================
export const colors = {
  // Primärfarben
  blue: '#3b82f6',
  blueDark: '#2563eb',
  purple: '#8b5cf6',

  // Status-Farben
  success: '#10b981',
  successBg: '#dcfce7',
  successText: '#166534',
  error: '#ef4444',
  errorBg: '#fee2e2',
  errorText: '#991b1b',
  warning: '#f59e0b',

  // Grautöne
  gray: '#6b7280',
  grayLight: '#9ca3af',
  grayLighter: '#e5e7eb',
  grayLightest: '#f3f4f6',
  background: '#f9fafb',
  white: '#fff',

  // Chart-spezifische Farben
  chart: {
    success: '#10b981',
    failure: '#ef4444',
    partialSuccess: '#f59e0b',
    tbd: '#6b7280',
    bar: '#2563eb',
    line: '#8b5cf6',
  }
} as const;

// ============================================
// ABSTÄNDE & GRÖSSEN
// ============================================
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '40px',
  xxl: '60px',
} as const;

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
} as const;

export const fontSize = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '36px',
} as const;

// ============================================
// GEMEINSAME STYLES
// ============================================

/** Tooltip-Container (für alle Charts) */
export const tooltipStyle: CSSProperties = {
  backgroundColor: colors.white,
  padding: spacing.md,
  border: '1px solid #ccc',
  borderRadius: borderRadius.sm,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

/** Tooltip-Titel */
export const tooltipTitle: CSSProperties = {
  margin: '0 0 8px 0',
  fontWeight: 'bold',
};

/** Tooltip-Text */
export const tooltipText: CSSProperties = {
  margin: '4px 0',
};

/** Card/Panel-Wrapper */
export const cardStyle: CSSProperties = {
  marginBottom: spacing.xl,
  backgroundColor: colors.white,
  borderRadius: borderRadius.lg,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  overflow: 'hidden',
};

/** Chart-Container */
export const chartContainer: CSSProperties = {
  width: '100%',
  padding: spacing.lg,
  boxSizing: 'border-box',
};

/** Chart-Titel */
export const chartTitle: CSSProperties = {
  marginBottom: spacing.lg,
  textAlign: 'center',
};

/** Zentrierter Text-Container */
export const centeredText: CSSProperties = {
  padding: spacing.lg,
  textAlign: 'center',
};

/** Error-State */
export const errorState: CSSProperties = {
  ...centeredText,
  color: 'red',
};

/** Success-Message */
export const successMessage: CSSProperties = {
  marginBottom: spacing.lg,
  textAlign: 'center',
  padding: spacing.md,
  backgroundColor: colors.successBg,
  borderRadius: borderRadius.sm,
  color: colors.successText,
};

/** Error-Message */
export const errorMessage: CSSProperties = {
  marginTop: spacing.lg,
  padding: spacing.md,
  backgroundColor: colors.errorBg,
  color: colors.errorText,
  borderRadius: borderRadius.sm,
};

/** Primär-Button */
export const buttonPrimary: CSSProperties = {
  padding: '12px 32px',
  fontSize: fontSize.md,
  backgroundColor: colors.blue,
  color: colors.white,
  border: 'none',
  borderRadius: borderRadius.md,
  cursor: 'pointer',
  fontWeight: 'bold',
};

/** Sekundär-Button */
export const buttonSecondary: CSSProperties = {
  padding: '10px 24px',
  fontSize: fontSize.sm,
  backgroundColor: colors.gray,
  color: colors.white,
  border: 'none',
  borderRadius: borderRadius.sm,
  cursor: 'pointer',
};

/** Disabled-Button Modifier */
export const buttonDisabled: CSSProperties = {
  backgroundColor: colors.grayLight,
  cursor: 'not-allowed',
};

/** Select/Dropdown */
export const selectStyle: CSSProperties = {
  padding: '12px 20px',
  fontSize: fontSize.md,
  borderRadius: borderRadius.md,
  border: `2px solid ${colors.grayLighter}`,
  backgroundColor: colors.white,
  cursor: 'pointer',
  minWidth: '200px',
  fontWeight: '500',
};

/** Label */
export const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: spacing.sm,
  fontSize: fontSize.md,
  fontWeight: '600',
};

/** Hilfstext */
export const helperText: CSSProperties = {
  marginTop: spacing.sm,
  fontSize: fontSize.sm,
  color: colors.gray,
};

// ============================================
// LAYOUT-STYLES
// ============================================

/** Main-Container */
export const mainContainer: CSSProperties = {
  padding: spacing.xl,
  maxWidth: '1400px',
  margin: '0 auto',
  fontFamily: 'Arial, sans-serif',
};

/** Header */
export const headerStyle: CSSProperties = {
  textAlign: 'center',
  marginBottom: spacing.xl,
  borderBottom: `2px solid ${colors.grayLighter}`,
  paddingBottom: spacing.lg,
};

/** Header-Titel mit Gradient */
export const headerTitle: CSSProperties = {
  fontSize: fontSize.lg,
  marginBottom: spacing.sm,
  background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

/** Header-Subtitle */
export const headerSubtitle: CSSProperties = {
  fontSize: fontSize.md,
  color: colors.gray,
};

/** Footer */
export const footerStyle: CSSProperties = {
  textAlign: 'center',
  marginTop: spacing.xxl,
  padding: spacing.lg,
  color: colors.grayLight,
  borderTop: `1px solid ${colors.grayLighter}`,
};

/** Init-Section Panel */
export const initSection: CSSProperties = {
  textAlign: 'center',
  padding: `${spacing.xxl} ${spacing.lg}`,
  backgroundColor: colors.background,
  borderRadius: borderRadius.lg,
  marginBottom: spacing.xl,
};
