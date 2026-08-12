export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export type ThemePreference = 'system' | 'light' | 'dark';

export type WeekStartsOn = 0 | 1;

export type ProgressStatus = 'normal' | 'warning' | 'exceeded' | 'reached';

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  date: string;
  time: string;
  meal: MealCategory | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTarget {
  effectiveFrom: string;
  calorieTarget: number;
}

export interface Settings {
  targetName: string;
  calorieTarget: number;
  weekStartsOn: WeekStartsOn;
  theme: ThemePreference;
  startedOn: string;
}

export interface DaySummary {
  date: string;
  consumed: number;
  target: number;
  remaining: number;
  status: ProgressStatus;
  entryCount: number;
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  settings: Settings;
  targets: DailyTarget[];
  entries: FoodEntry[];
}
