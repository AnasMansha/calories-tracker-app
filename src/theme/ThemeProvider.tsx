import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { darkColors, lightColors, radii, spacing, typography, type AppTheme } from './tokens';

const ThemeContext = createContext<AppTheme>({
  dark: false,
  colors: lightColors,
  spacing,
  radii,
  typography,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useAppStore((state) => state.settings.theme);
  const dark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';

  const theme = useMemo<AppTheme>(
    () => ({
      dark,
      colors: dark ? darkColors : lightColors,
      spacing,
      radii,
      typography,
    }),
    [dark],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
