import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { BarChart } from '../components/BarChart';
import { InsightsList } from '../components/InsightsList';
import { StatSummaryGrid } from '../components/StatSummaryGrid';
import { Card } from '../components/ui/Card';
import { DatePickerSheet } from '../components/ui/DatePickerSheet';
import { EmptyState } from '../components/ui/EmptyState';
import { FadeIn } from '../components/ui/FadeIn';
import { RangePills } from '../components/ui/RangePills';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import { useAppStore, useStartedOn } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { buildDaySummary, formatCalories } from '../utils/calories';
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
import { buildInsights } from '../utils/insights';
import { clipDays, toDailyPoints, toWeeklyPoints } from '../utils/stats';

type RangeKey = 'week' | '30' | '90' | 'custom';

export function StatisticsScreen() {
  const theme = useTheme();
  const entries = useAppStore((state) => state.entries);
  const targets = useAppStore((state) => state.targets);
  const settings = useAppStore((state) => state.settings);
  const startedOn = useStartedOn();
  const today = todayKey();
  const [range, setRange] = useState<RangeKey>('week');
  const [customStart, setCustomStart] = useState(maxDateKey(startedOn, addDaysToKey(today, -13)));
  const [customEnd, setCustomEnd] = useState(today);
  const [picker, setPicker] = useState<'start' | 'end' | null>(null);

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
    return clipDays(
      keys.map((date) => buildDaySummary(date, entries, targets, settings.calorieTarget)),
      startedOn,
      today,
    );
  }, [entries, rangeBounds.end, rangeBounds.start, settings.calorieTarget, startedOn, targets, today]);

  const chartPoints = useMemo(() => {
    if (range === '90') {
      return toWeeklyPoints(days, settings.weekStartsOn);
    }
    return toDailyPoints(days, (date) =>
      range === 'week' ? formatWeekdayChart(date) : formatMonthDay(date),
    );
  }, [days, range, settings.weekStartsOn]);

  const insights = useMemo(() => buildInsights(days), [days]);

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

  const statItems = [
    {
      icon: 'activity' as const,
      label: 'Average',
      value: `${formatCalories(insights.averageDaily)} kcal`,
      tone: 'default' as const,
    },
    {
      icon: 'bar-chart-2' as const,
      label: 'Total',
      value: `${formatCalories(insights.totalCalories)} kcal`,
      tone: 'default' as const,
    },
    {
      icon: (insights.averageRemaining >= 0 ? 'minus-circle' : 'plus-circle') as 'minus-circle' | 'plus-circle',
      label: insights.averageRemaining >= 0 ? 'Avg remaining' : 'Avg over',
      value: `${formatCalories(Math.abs(insights.averageRemaining))} kcal`,
      tone: (insights.averageRemaining >= 0 ? 'success' : 'danger') as 'success' | 'danger',
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
          {entries.length === 0 ? (
            <EmptyState
              title="No data to chart yet"
              message="Log a few meals and your pattern will show up here."
            />
          ) : chartPoints.length === 0 ? (
            <EmptyState
              title="No tracked days in this range"
              message="Choose a range after you started tracking."
            />
          ) : (
            <BarChart points={chartPoints} compact={chartPoints.length > 10} />
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
