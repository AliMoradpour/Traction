import { useColorScheme } from 'react-native';
import { colorsByMode, type ThemeMode, type TractionColors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const lightTheme = {
  mode: 'light',
  colors: colorsByMode.light,
  spacing,
  radius,
  shadows,
  typography,
} as const;

export const darkTheme = {
  ...lightTheme,
  mode: 'dark',
  colors: colorsByMode.dark,
} as const;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type TractionTheme = Omit<typeof lightTheme, 'colors' | 'mode'> & {
  mode: ThemeMode;
  colors: TractionColors;
};

export function getTheme(mode: ThemeMode = 'light'): TractionTheme {
  return themes[mode] as TractionTheme;
}

export function useTractionTheme(preferredMode?: ThemeMode): TractionTheme {
  const systemMode = useColorScheme();
  const mode = preferredMode ?? (systemMode === 'dark' ? 'dark' : 'light');

  return getTheme(mode);
}

