import type { MealCategory } from './types';

export const STORAGE_KEY = 'calorie-tracker-v1';

export const DEFAULT_CALORIE_TARGET = 2000;
export const MIN_CALORIE_TARGET = 500;
export const MAX_CALORIE_TARGET = 20000;
export const MAX_FOOD_CALORIES = 20000;
export const MAX_FOOD_NAME_LENGTH = 80;
export const MAX_NOTES_LENGTH = 240;
export const DEFAULT_PROTEIN_TARGET = 120;
export const DEFAULT_WATER_GOAL_ML = 2000;

export const WARNING_THRESHOLD = 0.8;

export const MEAL_ORDER: Array<MealCategory | null> = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'other',
  null,
];

export const MEAL_LABELS: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  other: 'Other',
};

export const MEAL_OPTIONS: MealCategory[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'other',
];
