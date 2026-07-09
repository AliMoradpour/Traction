import { palette } from './colors';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export const nativeWindTheme = {
  colors: {
    background: palette.neutral[75],
    surface: palette.neutral[50],
    'surface-soft': palette.neutral[100],
    'surface-card': palette.neutral[0],
    primary: palette.slate[900],
    accent: palette.brand.accent,
    success: palette.semantic.success,
    warning: palette.semantic.warning,
    danger: palette.semantic.danger,
    border: palette.slate[200],
    muted: palette.neutral[700],
  },
  spacing,
  borderRadius: radius,
  fontFamily: {
    sans: [typography.bodyMd.fontFamily],
  },
  fontSize: {
    'display-lg': [typography.displayLg.fontSize, { lineHeight: `${typography.displayLg.lineHeight}px` }],
    'display-mobile': [
      typography.displayLgMobile.fontSize,
      { lineHeight: `${typography.displayLgMobile.lineHeight}px` },
    ],
    headline: [typography.headlineMd.fontSize, { lineHeight: `${typography.headlineMd.lineHeight}px` }],
    body: [typography.bodyMd.fontSize, { lineHeight: `${typography.bodyMd.lineHeight}px` }],
    label: [typography.labelSm.fontSize, { lineHeight: `${typography.labelSm.lineHeight}px` }],
  },
} as const;

