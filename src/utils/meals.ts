import { MEAL_LABELS } from '../constants';
import type { MealCategory } from '../types';

export function suggestMeal(date: Date = new Date()): MealCategory {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) {
    return 'breakfast';
  }
  if (hour >= 11 && hour < 16) {
    return 'lunch';
  }
  if (hour >= 16 && hour < 22) {
    return 'dinner';
  }
  return 'snack';
}

export function mealLabel(meal: MealCategory | null): string {
  if (!meal) {
    return 'Uncategorized';
  }
  return MEAL_LABELS[meal];
}

export function parseQuickEntry(input: string): { name: string; calories?: number } {
  const trimmed = input.trim();
  const dashMatch = trimmed.match(/^(.*?)[\s]*[—–-]\s*(\d{1,5})\s*(kcal|cals|cal)?\s*$/i);
  if (dashMatch?.[1] && dashMatch[2]) {
    return {
      name: dashMatch[1].trim(),
      calories: Number(dashMatch[2]),
    };
  }

  const trailingMatch = trimmed.match(/^(.*?)\s+(\d{2,5})\s*(kcal|cals|cal)?\s*$/i);
  if (trailingMatch?.[1] && trailingMatch[2] && trailingMatch[1].length > 1) {
    return {
      name: trailingMatch[1].trim(),
      calories: Number(trailingMatch[2]),
    };
  }

  return { name: trimmed };
}
