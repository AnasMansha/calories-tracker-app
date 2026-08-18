import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { getCatalogItem } from '../data/nutrientCatalog';
import { useTheme } from '../theme/ThemeProvider';
import type { NutrientDaySummary } from '../types';
import { remainingNutrientLabel } from '../utils/nutrients';
import { statusPalette } from './StatusPill';
import { AppText } from './ui/AppText';

interface NutrientBarsProps {
  summaries: NutrientDaySummary[];
  onPress?: (summary: NutrientDaySummary) => void;
}

export function NutrientBars({ summaries, onPress }: NutrientBarsProps) {
  if (summaries.length === 0) {
    return null;
  }

  return (
    <View style={styles.stack}>
      {summaries.map((summary, index) => (
        <NutrientBar key={summary.key} summary={summary} delay={index * 40} onPress={onPress} />
      ))}
    </View>
  );
}

function NutrientBar({
  summary,
  delay,
  onPress,
}: {
  summary: NutrientDaySummary;
  delay: number;
  onPress?: (summary: NutrientDaySummary) => void;
}) {
  const theme = useTheme();
  const width = useRef(new Animated.Value(0)).current;
  const palette = statusPalette(summary.status === 'reached' ? 'normal' : summary.status, theme.colors);
  const catalog = getCatalogItem(summary.key);
  const ratio = summary.target <= 0 ? 0 : Math.min(summary.consumed / summary.target, 1);

  useEffect(() => {
    Animated.timing(width, {
      toValue: ratio,
      duration: 420,
      delay,
      useNativeDriver: false,
    }).start();
  }, [delay, ratio, width]);

  const fillWidth = width.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPress={() => onPress?.(summary)}
      accessibilityRole="button"
      accessibilityLabel={`${catalog?.label ?? summary.key}, ${remainingNutrientLabel(summary)}. Opens details.`}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={styles.meta}>
        <AppText variant="label">{catalog?.label ?? summary.key}</AppText>
        <AppText variant="caption" color={palette.foreground}>
          {remainingNutrientLabel(summary)}
        </AppText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.ringTrack }]}>
        <Animated.View style={[styles.fill, { backgroundColor: palette.foreground, width: fillWidth }]} />
      </View>
      <AppText variant="caption" color={theme.colors.textMuted} style={styles.total}>
        {Math.round(summary.consumed)} / {Math.round(summary.target)} {summary.unit}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
    width: '100%',
  },
  row: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 999,
  },
  total: {
    fontVariant: ['tabular-nums'],
  },
});
