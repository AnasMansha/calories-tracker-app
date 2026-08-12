import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { statusPalette } from '../components/StatusPill';
import { EmptyState } from '../components/ui/EmptyState';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAppStore, useStartedOn } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { buildDaySummary, formatCalories, remainingLabel } from '../utils/calories';
import { addDaysToKey, formatShortDate, formatWeekday, todayKey } from '../utils/dates';

type HistoryNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'History'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HistoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<HistoryNavigation>();
  const entries = useAppStore((state) => state.entries);
  const targets = useAppStore((state) => state.targets);
  const fallbackTarget = useAppStore((state) => state.settings.calorieTarget);
  const startedOn = useStartedOn();

  const summaries = useMemo(() => {
    const today = todayKey();
    const dates: string[] = [];
    let cursor = today;
    while (cursor >= startedOn) {
      dates.push(cursor);
      cursor = addDaysToKey(cursor, -1);
    }
    return dates.map((date) => buildDaySummary(date, entries, targets, fallbackTarget));
  }, [entries, fallbackTarget, startedOn, targets]);

  return (
    <Screen>
      <FlatList
        data={summaries}
        keyExtractor={(item) => item.date}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title">History</AppText>
            <AppText variant="body" color={theme.colors.textMuted}>
              Days since you started tracking on {formatShortDate(startedOn)}.
            </AppText>
          </View>
        }
        ListEmptyComponent={
          <EmptyState title="No history yet" message="Your tracked days will appear here after setup." />
        }
        renderItem={({ item: summary }) => {
          const palette = statusPalette(summary.status, theme.colors);
          return (
            <Pressable
              onPress={() => navigation.navigate('DayDetail', { date: summary.date })}
              accessibilityRole="button"
              accessibilityLabel={`${formatWeekday(summary.date)}, ${formatCalories(summary.consumed)} of ${formatCalories(summary.target)} calories, ${remainingLabel(summary)}`}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: palette.foreground }]} />
              <View style={styles.copy}>
                <AppText variant="bodyMedium">{formatWeekday(summary.date)}</AppText>
                <AppText variant="caption" color={theme.colors.textMuted}>
                  {formatShortDate(summary.date)}
                  {summary.date === todayKey() ? '  ·  Today' : ''}
                </AppText>
              </View>
              <View style={styles.totals}>
                <AppText variant="bodyMedium" style={styles.tabular}>
                  {formatCalories(summary.consumed)} / {formatCalories(summary.target)}
                </AppText>
                <AppText variant="caption" color={palette.foreground} align="right">
                  {remainingLabel(summary)}
                </AppText>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    marginBottom: 24,
    gap: 8,
  },
  list: {
    gap: 10,
    paddingBottom: 32,
  },
  row: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  totals: {
    alignItems: 'flex-end',
    gap: 2,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
