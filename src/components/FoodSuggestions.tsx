import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { SavedFood } from '../types';
import { AppText } from './ui/AppText';

interface FoodSuggestionsProps {
  foods: SavedFood[];
  visible: boolean;
  onSelect: (food: SavedFood) => void;
}

export function FoodSuggestions({ foods, visible, onSelect }: FoodSuggestionsProps) {
  const theme = useTheme();

  if (!visible || foods.length === 0) {
    return null;
  }

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <AppText variant="caption" color={theme.colors.textSubtle} style={styles.caption}>
        Estimates for typical portions. Tap to fill.
      </AppText>
      {foods.map((food) => (
        <Pressable
          key={food.nameKey}
          onPress={() => onSelect(food)}
          accessibilityRole="button"
          accessibilityLabel={`${food.name}, ${food.calories} calories`}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent' },
          ]}
        >
          <View style={styles.copy}>
            <AppText variant="bodyMedium" numberOfLines={1}>
              {food.name}
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              {food.calories} kcal
              {food.nutrients.protein ? ` · ${food.nutrients.protein}g protein` : ''}
              {food.nutrients.carbs ? ` · ${food.nutrients.carbs}g carbs` : ''}
            </AppText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  caption: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  copy: {
    gap: 2,
  },
});
