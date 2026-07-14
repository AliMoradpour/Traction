export type ThemeMode = 'light' | 'dark';

export const palette = {
  brand: {
    primary: '#0F172A',
    ink: '#000000',
    accent: '#3B82F6',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FCF8FA',
    75: '#F8FAFC',
    100: '#F6F3F5',
    150: '#F1F5F9',
    200: '#F0EDEF',
    250: '#EAE7E9',
    300: '#E4E2E4',
    400: '#C6C6CD',
    500: '#76777D',
    600: '#515F74',
    700: '#45464D',
    800: '#303032',
    900: '#1B1B1D',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    900: '#0F172A',
  },
  semantic: {
    success: '#22C55E',
    successDark: '#15803D',
    successSurface: '#F0FDF4',
    successBorder: '#DCFCE7',
    warning: '#F59E0B',
    warningAlt: '#F97316',
    warningSurface: '#FFF7ED',
    warningBorder: '#FFEDD5',
    danger: '#EF4444',
    dangerDark: '#BA1A1A',
    dangerSurface: '#FEF2F2',
    dangerBorder: '#FEE2E2',
    errorContainer: '#FFDAD6',
    errorText: '#93000A',
    infoSurface: '#EFF6FF',
    infoBorder: '#DBEAFE',
  },
  material: {
    primaryContainer: '#131B2E',
    onPrimaryContainer: '#7C839B',
    secondaryContainer: '#D5E3FD',
    onSecondaryContainer: '#57657B',
    inversePrimary: '#BEC6E0',
    onSecondaryFixed: '#0D1C2F',
  },
} as const;

export const lightColors = {
  mode: 'light',
  background: palette.neutral[75],
  surface: palette.neutral[50],
  surfaceSoft: palette.neutral[100],
  surfaceMuted: palette.neutral[200],
  surfaceElevated: palette.neutral[0],
  surfaceOverlay: withOpacity(palette.neutral[50], 0.88),
  text: palette.slate[900],
  textStrong: palette.brand.ink,
  textMuted: palette.neutral[700],
  textSubtle: palette.neutral[500],
  textInverse: palette.neutral[0],
  border: palette.slate[200],
  borderMuted: withOpacity(palette.neutral[400], 0.3),
  borderStrong: palette.neutral[400],
  primary: palette.slate[900],
  primaryPressed: palette.material.primaryContainer,
  accent: palette.brand.accent,
  accentMuted: palette.material.secondaryContainer,
  accentText: palette.material.onSecondaryContainer,
  success: palette.semantic.success,
  successText: palette.semantic.successDark,
  successSurface: palette.semantic.successSurface,
  warning: palette.semantic.warning,
  warningText: palette.semantic.warningAlt,
  warningSurface: palette.semantic.warningSurface,
  danger: palette.semantic.danger,
  dangerText: palette.semantic.dangerDark,
  dangerSurface: palette.semantic.dangerSurface,
  input: palette.neutral[0],
  disabled: palette.neutral[250],
  focusRing: withOpacity(palette.brand.accent, 0.22),
  scrim: withOpacity(palette.slate[900], 0.35),
  primaryContainer: withOpacity(palette.brand.accent, 0.12),
  onPrimaryContainer: palette.slate[900],
  error: palette.semantic.danger,
  errorMuted: palette.semantic.dangerSurface,
  successMuted: palette.semantic.successSurface,
} as const;

export const darkColors = {
  mode: 'dark',
  background: '#090D16',
  surface: '#0F172A',
  surfaceSoft: '#111827',
  surfaceMuted: '#1F2937',
  surfaceElevated: '#111827',
  surfaceOverlay: withOpacity('#0F172A', 0.9),
  text: '#F8FAFC',
  textStrong: '#FFFFFF',
  textMuted: '#CBD5E1',
  textSubtle: '#94A3B8',
  textInverse: '#0F172A',
  border: withOpacity('#E2E8F0', 0.12),
  borderMuted: withOpacity('#E2E8F0', 0.08),
  borderStrong: withOpacity('#E2E8F0', 0.22),
  primary: '#F8FAFC',
  primaryPressed: '#E2E8F0',
  accent: palette.brand.accent,
  accentMuted: withOpacity(palette.brand.accent, 0.18),
  accentText: '#BFDBFE',
  success: palette.semantic.success,
  successText: '#86EFAC',
  successSurface: withOpacity(palette.semantic.success, 0.14),
  warning: palette.semantic.warning,
  warningText: '#FCD34D',
  warningSurface: withOpacity(palette.semantic.warning, 0.14),
  danger: palette.semantic.danger,
  dangerText: '#FCA5A5',
  dangerSurface: withOpacity(palette.semantic.danger, 0.14),
  input: '#111827',
  disabled: '#1F2937',
  focusRing: withOpacity(palette.brand.accent, 0.3),
  scrim: withOpacity('#000000', 0.55),
  primaryContainer: palette.material.primaryContainer,
  onPrimaryContainer: palette.material.onPrimaryContainer,
  error: palette.semantic.danger,
  errorMuted: withOpacity(palette.semantic.danger, 0.14),
  successMuted: withOpacity(palette.semantic.success, 0.14),
} as const;

export const colorsByMode = {
  light: lightColors,
  dark: darkColors,
} as const;

export type TractionColors = typeof lightColors | typeof darkColors;

export function getColors(mode: ThemeMode = 'light'): TractionColors {
  return colorsByMode[mode];
}

export function withOpacity(hex: string, opacity: number): string {
  const normalized = hex.replace('#', '');
  const isShort = normalized.length === 3;
  const full = isShort
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized;
  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

