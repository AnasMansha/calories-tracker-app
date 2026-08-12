import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { FoodEntry } from '../types';
import { formatCalories } from '../utils/calories';
import { formatDisplayTime } from '../utils/dates';
import { AppText } from './ui/AppText';

interface FoodEntryRowProps {
  entry: FoodEntry;
  onPress: () => void;
}

export function FoodEntryRow({ entry, onPress }: FoodEntryRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}, ${formatCalories(entry.calories)} calories, ${formatDisplayTime(entry.time)}`}
      accessibilityHint="Opens this food entry to edit or delete"
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
        },
      ]}
    >
      <View style={styles.copy}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {entry.name}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted}>
          {formatDisplayTime(entry.time)}
          {entry.notes ? `  ·  ${entry.notes}` : ''}
        </AppText>
      </View>
      <AppText variant="bodyMedium" style={styles.calories}>
        {formatCalories(entry.calories)}
        <AppText variant="caption" color={theme.colors.textMuted}>
          {' '}
          kcal
        </AppText>
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  calories: {
    fontVariant: ['tabular-nums'],
  },
});
