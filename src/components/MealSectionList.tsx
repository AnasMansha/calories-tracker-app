import { StyleSheet, View } from 'react-native';

import { MEAL_ORDER } from '../constants';
import { useTheme } from '../theme/ThemeProvider';
import type { FoodEntry } from '../types';
import { mealLabel } from '../utils/meals';
import { FoodEntryRow } from './FoodEntryRow';
import { AppText } from './ui/AppText';
import { Card } from './ui/Card';

interface MealSectionListProps {
  entries: FoodEntry[];
  onEntryPress: (entry: FoodEntry) => void;
}

export function MealSectionList({ entries, onEntryPress }: MealSectionListProps) {
  const theme = useTheme();
  const groups = MEAL_ORDER.map((meal) => ({
    meal,
    items: entries.filter((entry) => entry.meal === meal),
  })).filter((group) => group.items.length > 0);

  return (
    <View style={styles.stack}>
      {groups.map((group) => (
        <View key={group.meal ?? 'none'} style={styles.group}>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.heading}>
            {mealLabel(group.meal)}
          </AppText>
          <Card padded={false}>
            {group.items.map((entry, index) => (
              <View key={entry.id}>
                <FoodEntryRow entry={entry} onPress={() => onEntryPress(entry)} />
                {index < group.items.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                ) : null}
              </View>
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 20,
  },
  group: {
    gap: 8,
  },
  heading: {
    marginLeft: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
