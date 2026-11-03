export type ThemeMode = 'light' | 'dark';

export const palette = {
  brand: {
    primary: '#2A2621',
    ink: '#1E1A16',
    accent: '#3D6BE0',
  },
  // Warm paper neutrals (light) and warm night neutrals (dark).
  neutral: {
    0: '#FFFFFF',
    50: '#FDFBF7',
    75: '#FAF6F0',
    100: '#F2EBE1',
    150: '#EFE7DC',
    200: '#ECE4D8',
    250: '#E7DED1',
    300: '#DDD3C5',
    400: '#C9BEAF',
    500: '#A39A8E',
    600: '#857C71',
    700: '#6E665C',
    800: '#3D3832',
    900: '#2A2621',
  },
  slate: {
    50: '#FDFBF7',
    100: '#F2EBE1',
    200: '#E7DED1',
    500: '#857C71',
    600: '#6E665C',
    700: '#3D3832',
    900: '#2A2621',
  },
  semantic: {
    success: '#6E9E7E',
    successDark: '#4C7A5C',
    successSurface: '#E5F0E8',
    successBorder: '#CFE2D5',
    warning: '#D9895A',
    warningAlt: '#B5663A',
    warningSurface: '#FAEBE1',
    warningBorder: '#F2D6C3',
    danger: '#D0554A',
    dangerDark: '#A8392F',
    dangerSurface: '#FBE6E3',
    dangerBorder: '#F4CBC6',
    errorContainer: '#FBE6E3',
    errorText: '#A8392F',
    infoSurface: '#E6EDFC',
    infoBorder: '#CBD9F8',
  },
  material: {
    primaryContainer: '#E6EDFC',
    onPrimaryContainer: '#2F57C2',
    secondaryContainer: '#E6EDFC',
    onSecondaryContainer: '#2F57C2',
    inversePrimary: '#AFC3F7',
    onSecondaryFixed: '#1E1A16',
  },
} as const;

// Calm and warm: paper tones, soft charcoal text, Traction blue only for actions,
// sage for done, clay for gentle nudges.
export const lightColors = {
  mode: 'light',
  background: '#FAF6F0',
  surface: '#FFFFFF',
  surfaceSoft: '#F2EBE1',
  surfaceMuted: '#ECE4D8',
  surfaceElevated: '#FFFFFF',
  surfaceOverlay: withOpacity('#FAF6F0', 0.96),
  text: '#2A2621',
  textStrong: '#1E1A16',
  textMuted: '#6E665C',
  textSubtle: '#A39A8E',
  textInverse: '#FFFFFF',
  border: '#E7DED1',
  borderMuted: withOpacity('#2A2621', 0.08),
  borderStrong: '#D6CBBB',
  primary: '#3D6BE0',
  primaryPressed: '#2F57C2',
  accent: '#3D6BE0',
  accentMuted: '#E6EDFC',
  accentText: '#2F57C2',
  success: '#6E9E7E',
  successText: '#4C7A5C',
  successSurface: '#E5F0E8',
  warning: '#D9895A',
  warningText: '#B5663A',
  warningSurface: '#FAEBE1',
  danger: '#D0554A',
  dangerText: '#A8392F',
  dangerSurface: '#FBE6E3',
  input: '#FFFFFF',
  disabled: '#ECE4D8',
  focusRing: withOpacity('#3D6BE0', 0.2),
  scrim: withOpacity('#2A2621', 0.35),
  primaryContainer: '#E6EDFC',
  onPrimaryContainer: '#2A2621',
  error: '#D0554A',
  errorMuted: '#FBE6E3',
  successMuted: '#E5F0E8',
} as const;

export const darkColors = {
  mode: 'dark',
  background: '#191714',
  surface: '#24211D',
  surfaceSoft: '#2E2A25',
  surfaceMuted: '#38332D',
  surfaceElevated: '#24211D',
  surfaceOverlay: withOpacity('#191714', 0.96),
  text: '#F3EEE7',
  textStrong: '#FFFFFF',
  textMuted: '#B9B0A4',
  textSubtle: '#847B70',
  textInverse: '#151A2B',
  border: '#38332D',
  borderMuted: withOpacity('#F3EEE7', 0.08),
  borderStrong: '#4A443C',
  primary: '#7C9EF2',
  primaryPressed: '#6A8BE0',
  accent: '#7C9EF2',
  accentMuted: '#263150',
  accentText: '#AFC3F7',
  success: '#8DBB9B',
  successText: '#A9D1B5',
  successSurface: '#24332A',
  warning: '#E9A27A',
  warningText: '#F0BC9B',
  warningSurface: '#3A2A21',
  danger: '#E57B70',
  dangerText: '#F2A79F',
  dangerSurface: '#3D2421',
  input: '#24211D',
  disabled: '#2E2A25',
  focusRing: withOpacity('#7C9EF2', 0.3),
  scrim: withOpacity('#000000', 0.55),
  primaryContainer: '#263150',
  onPrimaryContainer: '#F3EEE7',
  error: '#E57B70',
  errorMuted: '#3D2421',
  successMuted: '#24332A',
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

