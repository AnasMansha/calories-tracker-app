import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { formatMetric } from '../utils/insights';
import type { ChartPoint } from '../utils/stats';
import { statusPalette } from './StatusPill';
import { AppText } from './ui/AppText';

const PLOT_HEIGHT = 160;

interface BarChartProps {
  points: ChartPoint[];
  compact?: boolean;
  unitLabel?: string;
  accentColor?: string;
}

export function BarChart({ points, compact = false, unitLabel = 'kcal', accentColor }: BarChartProps) {
  const theme = useTheme();
  const lineColor = accentColor ?? theme.colors.textSubtle;
  const maxValue = Math.max(
    1,
    ...points.map((point) => Math.max(point.consumed, point.target)),
  );
  const averageTarget =
    points.length === 0 ? 0 : points.reduce((sum, point) => sum + point.target, 0) / points.length;
  const targetTop = Math.max(0, PLOT_HEIGHT - (averageTarget / maxValue) * PLOT_HEIGHT);

  return (
    <View accessibilityRole="image" accessibilityLabel={`Chart for the selected period, ${unitLabel}`}>
      <View style={[styles.plot, { height: PLOT_HEIGHT }]}>
        {averageTarget > 0 ? (
          <View
            pointerEvents="none"
            style={[styles.targetLine, { top: targetTop, borderColor: lineColor }]}
          />
        ) : null}
        {points.map((point) => {
          const palette = statusPalette(point.status === 'reached' ? 'normal' : point.status, theme.colors);
          const barHeight =
            point.consumed <= 0 ? 0 : Math.max(4, (point.consumed / maxValue) * PLOT_HEIGHT);

          return (
            <View key={point.key} style={styles.column}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor:
                      point.entryCount === 0 ? theme.colors.surfaceMuted : palette.foreground,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.labels}>
        {points.map((point, index) => (
          <View key={`${point.key}-label`} style={styles.labelCell}>
            {shouldShowLabel(index, points.length) ? (
              <Text
                numberOfLines={1}
                allowFontScaling={false}
                style={[
                  styles.labelText,
                  compact && points.length > 10 ? styles.tinyLabel : null,
                  { color: theme.colors.textMuted },
                ]}
              >
                {point.label}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={[styles.legend, { borderTopColor: theme.colors.border }]}>
        <LegendSwatch color={theme.colors.success} label="Within" />
        <LegendSwatch color={theme.colors.warning} label="Near" />
        <LegendSwatch color={theme.colors.danger} label="Over" />
      </View>
      <AppText variant="caption" color={theme.colors.textSubtle} align="center">
        Target reference {formatMetric(averageTarget, unitLabel)}
      </AppText>
    </View>
  );
}

function shouldShowLabel(index: number, count: number): boolean {
  if (count <= 8) {
    return true;
  }
  if (count <= 14) {
    return index === 0 || index === count - 1 || index % 2 === 0;
  }
  if (count <= 31) {
    return index === 0 || index === count - 1 || index % 7 === 0;
  }
  return index === 0 || index === count - 1 || index === Math.floor(count / 2);
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <AppText variant="caption" color={theme.colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    position: 'relative',
  },
  column: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    maxWidth: 20,
    minWidth: 6,
    borderRadius: 6,
  },
  labels: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
    gap: 4,
  },
  labelCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 18,
  },
  labelText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  tinyLabel: {
    fontSize: 10,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
