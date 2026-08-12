import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { ProgressStatus } from '../types';
import { remainingLabel } from '../utils/calories';
import type { DaySummary } from '../types';
import { AppText } from './ui/AppText';

interface StatusPillProps {
  summary: DaySummary;
}

export function StatusPill({ summary }: StatusPillProps) {
  const theme = useTheme();
  const palette = statusPalette(summary.status, theme.colors);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={remainingLabel(summary)}
      style={[styles.pill, { backgroundColor: palette.background }]}
    >
      <View style={[styles.dot, { backgroundColor: palette.foreground }]} />
      <AppText variant="bodyMedium" color={palette.foreground}>
        {remainingLabel(summary)}
      </AppText>
    </View>
  );
}

export function statusPalette(
  status: ProgressStatus,
  colors: ReturnType<typeof useTheme>['colors'],
) {
  if (status === 'exceeded') {
    return { foreground: colors.danger, background: colors.dangerSoft };
  }
  if (status === 'warning') {
    return { foreground: colors.warning, background: colors.warningSoft };
  }
  return { foreground: colors.success, background: colors.successSoft };
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
