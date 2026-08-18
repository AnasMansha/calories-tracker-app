import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { BarChart } from '../components/BarChart';
import { GoalPicker, goalAccentColor } from '../components/GoalPicker';
import { InsightsList } from '../components/InsightsList';
import { StatSummaryGrid } from '../components/StatSummaryGrid';
import { Card } from '../components/ui/Card';
import { DatePickerSheet } from '../components/ui/DatePickerSheet';
import { EmptyState } from '../components/ui/EmptyState';
import { FadeIn } from '../components/ui/FadeIn';
import { RangePills } from '../components/ui/RangePills';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import { getCatalogItem } from '../data/nutrientCatalog';
import { useAppStore, useStartedOn } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import type { DaySummary } from '../types';
import { buildDaySummary } from '../utils/calories';
import {
  addDaysToKey,
  clampDateKey,
  enumerateDateKeys,
  formatMonthDay,
  formatRangeLabel,
  formatWeekdayChart,
  getWeekDateKeys,
  maxDateKey,
  minDateKey,
  toLocalDateKey,
  todayKey,
} from '../utils/dates';
import { buildInsights, formatMetric } from '../utils/insights';
import { PROTEIN_KEY, buildNutrientDaySummary, enabledNutrientGoals } from '../utils/nutrients';
import { clipDays, toDailyPoints, toWeeklyPoints } from '../utils/stats';
import { buildWaterDaySummary } from '../utils/water';

type RangeKey = 'week' | '30' | '90' | 'custom';

export function StatisticsScreen() {
  const theme = useTheme();
  const entries = useAppStore((state) => state.entries);
  const targets = useAppStore((state) => state.targets);
  const settings = useAppStore((state) => state.settings);
  const nutrientTargets = useAppStore((state) => state.nutrientTargets);
  const waterTargets = useAppStore((state) => state.waterTargets);
  const waterLogs = useAppStore((state) => state.waterLogs);
  const startedOn = useStartedOn();
  const today = todayKey();
  const [range, setRange] = useState<RangeKey>('week');
  const [goal, setGoal] = useState('calories');
  const [customStart, setCustomStart] = useState(maxDateKey(startedOn, addDaysToKey(today, -13)));
  const [customEnd, setCustomEnd] = useState(today);
  const [picker, setPicker] = useState<'start' | 'end' | null>(null);

  const goalOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [{ value: 'calories', label: 'Calories' }];
    if (settings.proteinEnabled) {
      options.push({ value: PROTEIN_KEY, label: 'Protein' });
    }
    if (settings.waterEnabled) {
      options.push({ value: 'water', label: 'Water' });
    }
    for (const item of enabledNutrientGoals(settings.nutrientGoals)) {
      if (item.key === PROTEIN_KEY) {
        continue;
      }
      options.push({ value: item.key, label: getCatalogItem(item.key)?.label ?? item.key });
    }
    return options;
  }, [settings.nutrientGoals, settings.proteinEnabled, settings.waterEnabled]);

  const selectedGoal = goalOptions.some((option) => option.value === goal) ? goal : 'calories';
  const selectedUnit =
    selectedGoal === 'calories'
      ? 'kcal'
      : selectedGoal === 'water'
        ? 'ml'
        : (getCatalogItem(selectedGoal)?.unit ?? 'g');

  const rangeBounds = useMemo(() => {
    if (range === 'week') {
      const keys = getWeekDateKeys(today, settings.weekStartsOn);
      return {
        start: maxDateKey(keys[0] ?? startedOn, startedOn),
        end: minDateKey(keys[keys.length - 1] ?? today, today),
      };
    }
    if (range === '30') {
      return {
        start: maxDateKey(addDaysToKey(today, -29), startedOn),
        end: today,
      };
    }
    if (range === '90') {
      return {
        start: maxDateKey(addDaysToKey(today, -89), startedOn),
        end: today,
      };
    }
    const start = maxDateKey(minDateKey(customStart, customEnd), startedOn);
    const end = minDateKey(maxDateKey(customStart, customEnd), today);
    const cappedStart = maxDateKey(addDaysToKey(end, -119), start);
    return { start: cappedStart, end };
  }, [customEnd, customStart, range, settings.weekStartsOn, startedOn, today]);

  const days = useMemo(() => {
    const keys = enumerateDateKeys(rangeBounds.start, rangeBounds.end);
    const mapped: DaySummary[] = keys.map((date) => {
      if (selectedGoal === 'calories') {
        return buildDaySummary(date, entries, targets, settings.calorieTarget);
      }
      if (selectedGoal === 'water') {
        return buildWaterDaySummary(date, waterLogs, waterTargets, settings.waterGoalMl);
      }
      const nutrientGoal = settings.nutrientGoals.find((item) => item.key === selectedGoal);
      if (!nutrientGoal) {
        return buildDaySummary(date, entries, targets, settings.calorieTarget);
      }
      const summary = buildNutrientDaySummary(date, entries, nutrientTargets, nutrientGoal);
      return {
        date: summary.date,
        consumed: summary.consumed,
        target: summary.target,
        remaining: summary.remaining,
        status: summary.status,
        entryCount: entries.filter((entry) => entry.date === date).length,
      };
    });
    return clipDays(mapped, startedOn, today);
  }, [
    entries,
    nutrientTargets,
    rangeBounds.end,
    rangeBounds.start,
    selectedGoal,
    settings.calorieTarget,
    settings.nutrientGoals,
    settings.waterGoalMl,
    startedOn,
    targets,
    today,
    waterLogs,
    waterTargets,
  ]);

  const chartPoints = useMemo(() => {
    if (range === '90') {
      return toWeeklyPoints(days, settings.weekStartsOn);
    }
    return toDailyPoints(days, (date) =>
      range === 'week' ? formatWeekdayChart(date) : formatMonthDay(date),
    );
  }, [days, range, settings.weekStartsOn]);

  const insights = useMemo(() => buildInsights(days, selectedUnit), [days, selectedUnit]);
  const hasLogs =
    selectedGoal === 'water' ? waterLogs.some((log) => log.date >= rangeBounds.start && log.date <= rangeBounds.end) : entries.length > 0;

  function onPickerChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setPicker(null);
    }
    if (event.type === 'dismissed' || !selected) {
      return;
    }
    const next = clampDateKey(toLocalDateKey(selected), startedOn, today);
    if (picker === 'start') {
      setCustomStart(next);
    } else {
      setCustomEnd(next);
    }
  }

  const remainingTone = insights.averageRemaining >= 0 ? 'success' : 'danger';
  const statItems = [
    {
      icon: 'activity' as const,
      label: 'Average',
      value: formatMetric(insights.averageDaily, selectedUnit),
      tone: 'default' as const,
    },
    {
      icon: 'bar-chart-2' as const,
      label: 'Total',
      value: formatMetric(insights.totalCalories, selectedUnit),
      tone: 'default' as const,
    },
    {
      icon: (insights.averageRemaining >= 0 ? 'minus-circle' : 'plus-circle') as 'minus-circle' | 'plus-circle',
      label: insights.averageRemaining >= 0 ? 'Avg remaining' : 'Avg over',
      value: formatMetric(Math.abs(insights.averageRemaining), selectedUnit),
      tone: remainingTone as 'success' | 'danger',
    },
    {
      icon: 'check-circle' as const,
      label: 'Days in target',
      value: `${insights.daysWithinTarget}/${insights.dayCount}`,
      tone: 'success' as const,
    },
  ];

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="title">Statistics</AppText>
        <AppText variant="body" color={theme.colors.textMuted}>
          Tracking since {formatMonthDay(startedOn)}.
        </AppText>
      </View>

      <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionLabel}>
        What to chart
      </AppText>
      <GoalPicker options={goalOptions} value={selectedGoal} onChange={setGoal} />

      <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionLabel}>
        Time range
      </AppText>
      <View style={styles.rangeWrap}>
        <RangePills
          accessibilityLabel="Statistics range"
          value={range}
          onChange={setRange}
          options={[
            { value: 'week', label: '7 days' },
            { value: '30', label: '30 days' },
            { value: '90', label: '3 months' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
      </View>

      <AppText variant="caption" color={theme.colors.textSubtle} style={styles.rangeLabel}>
        {formatRangeLabel(rangeBounds.start, rangeBounds.end)}
      </AppText>

      {range === 'custom' ? (
        <View style={styles.customRow}>
          <DateButton label="From" value={formatMonthDay(customStart)} onPress={() => setPicker('start')} />
          <DateButton label="To" value={formatMonthDay(customEnd)} onPress={() => setPicker('end')} />
        </View>
      ) : null}

      <DatePickerSheet
        visible={picker !== null}
        title={picker === 'start' ? 'Select start date' : 'Select end date'}
        value={picker === 'start' ? customStart : customEnd}
        minimumDate={startedOn}
        maximumDate={today}
        onChange={onPickerChange}
        onClose={() => setPicker(null)}
      />

      <FadeIn style={styles.chartCard}>
        <Card>
          {!hasLogs ? (
            <EmptyState
              title="No data to chart yet"
              message={
                selectedGoal === 'water'
                  ? 'Add some water on Home to start seeing your trend here.'
                  : 'Log a few meals and your pattern will show up here.'
              }
            />
          ) : chartPoints.length === 0 ? (
            <EmptyState
              title="No tracked days in this range"
              message="Choose a range after you started tracking."
            />
          ) : (
            <BarChart
              points={chartPoints}
              compact={chartPoints.length > 10}
              unitLabel={selectedUnit}
              accentColor={goalAccentColor(selectedGoal, theme.colors, theme.dark)}
            />
          )}
        </Card>
      </FadeIn>

      <FadeIn delay={80} style={styles.stats}>
        <StatSummaryGrid items={statItems} />
      </FadeIn>

      <View style={styles.insights}>
        <AppText variant="subtitle">Insights</AppText>
        {insights.items.length === 0 ? (
          <EmptyState title="No insights yet" message="Log meals to see your trends." />
        ) : (
          <InsightsList items={insights.items} />
        )}
      </View>
    </Screen>
  );
}

function DateButton({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
      style={({ pressed }) => [
        styles.dateButton,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <AppText variant="caption" color={theme.colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="bodyMedium">{value}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 4,
  },
  rangeWrap: {
    marginTop: 4,
  },
  rangeLabel: {
    marginTop: 10,
  },
  customRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  dateButton: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 2,
  },
  chartCard: {
    marginTop: 18,
  },
  stats: {
    marginTop: 16,
  },
  insights: {
    marginTop: 28,
    gap: 12,
    paddingBottom: 24,
  },
});
