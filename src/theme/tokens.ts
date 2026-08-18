export const spacing = {
  0: 0,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 999,
} as const;

export const typography = {
  hero: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '600' as const,
    letterSpacing: -1.6,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600' as const,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
};

export const lightColors = {
  background: '#F3F0EA',
  surface: '#FFFcf7',
  surfaceMuted: '#E8E3DA',
  text: '#1B1A17',
  textMuted: '#6E6A62',
  textSubtle: '#8E897F',
  border: '#DDD7CC',
  accent: '#2C6A59',
  accentSoft: '#D7E8E1',
  onAccent: '#F7FBF9',
  onDanger: '#FFF8F6',
  success: '#2C6A59',
  successSoft: '#D7E8E1',
  warning: '#A8641E',
  warningSoft: '#F4E4CF',
  danger: '#B13B32',
  dangerSoft: '#F4D6D3',
  overlay: 'rgba(27, 26, 23, 0.4)',
  tabBar: '#FFFcf7',
  ringTrack: '#E4DFD6',
  water: '#3D7EA6',
  waterSoft: '#D4E6F0',
};

export const darkColors = {
  background: '#121110',
  surface: '#1C1B19',
  surfaceMuted: '#272521',
  text: '#F4F0E8',
  textMuted: '#A39E94',
  textSubtle: '#7E7A72',
  border: '#33302B',
  accent: '#7FB8A6',
  accentSoft: '#243832',
  onAccent: '#10211B',
  onDanger: '#FFF8F6',
  success: '#7FB8A6',
  successSoft: '#243832',
  warning: '#E0A15A',
  warningSoft: '#3A2C1A',
  danger: '#E07A70',
  dangerSoft: '#3A2220',
  overlay: 'rgba(0, 0, 0, 0.55)',
  tabBar: '#1C1B19',
  ringTrack: '#2C2A26',
  water: '#7EB6D4',
  waterSoft: '#1C2C36',
};

export type ThemeColors = typeof lightColors;

export type AppTheme = {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
};
