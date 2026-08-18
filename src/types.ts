export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export type ThemePreference = 'system' | 'light' | 'dark';

export type WeekStartsOn = 0 | 1;

export type ProgressStatus = 'normal' | 'warning' | 'exceeded' | 'reached';

export type NutrientUnit = 'g' | 'mg' | 'mcg' | 'IU';

export type NutrientValues = Record<string, number>;

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  date: string;
  time: string;
  meal: MealCategory | null;
  notes: string;
  nutrients: NutrientValues;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTarget {
  effectiveFrom: string;
  calorieTarget: number;
}

export interface NutrientGoal {
  key: string;
  enabled: boolean;
  dailyTarget: number;
}

export interface NutrientTarget {
  effectiveFrom: string;
  key: string;
  dailyTarget: number;
}

export interface WaterTarget {
  effectiveFrom: string;
  waterGoalMl: number;
}

export interface WaterLog {
  id: string;
  date: string;
  time: string;
  amountMl: number;
  createdAt: string;
}

export interface SavedFood {
  nameKey: string;
  name: string;
  calories: number;
  nutrients: NutrientValues;
  meal: MealCategory | null;
  updatedAt: string;
  source: 'seed' | 'user';
}

export interface Settings {
  targetName: string;
  calorieTarget: number;
  weekStartsOn: WeekStartsOn;
  theme: ThemePreference;
  startedOn: string;
  proteinEnabled: boolean;
  waterEnabled: boolean;
  waterGoalMl: number;
  nutrientGoals: NutrientGoal[];
  seedVersion: number;
}

export interface DaySummary {
  date: string;
  consumed: number;
  target: number;
  remaining: number;
  status: ProgressStatus;
  entryCount: number;
}

export interface NutrientDaySummary {
  date: string;
  key: string;
  consumed: number;
  target: number;
  remaining: number;
  status: ProgressStatus;
  unit: NutrientUnit | 'ml' | 'kcal';
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  settings: Settings;
  targets: DailyTarget[];
  nutrientTargets: NutrientTarget[];
  waterTargets: WaterTarget[];
  entries: FoodEntry[];
  waterLogs: WaterLog[];
  savedFoods: SavedFood[];
}

export interface FoodLibraryFile {
  kind: 'calorie-tracker-foods';
  version: 1;
  exportedAt: string;
  foods: SavedFood[];
}
