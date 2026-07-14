import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { lightColors, darkColors, type TractionColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';

interface ThemeContextValue {
  mode: 'light' | 'dark';
  colors: TractionColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  toggleTheme: () => void;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<'light' | 'dark' | 'system'>('system');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Inter: require('../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf'),
        'Inter-Italic': require('../assets/fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf'),
      });
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }
    loadFonts();
  }, []);

  const resolvedMode: 'light' | 'dark' = mode === 'system'
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : mode;
  const colors = resolvedMode === 'dark' ? darkColors : lightColors;

  const toggleTheme = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setMode = (newMode: 'light' | 'dark' | 'system') => {
    setModeState(newMode);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        mode: resolvedMode,
        colors,
        typography,
        spacing,
        radius,
        shadows,
        toggleTheme,
        setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
