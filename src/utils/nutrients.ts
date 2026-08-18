import { getCatalogItem } from '../data/nutrientCatalog';
import type {
  FoodEntry,
  NutrientDaySummary,
  NutrientGoal,
  NutrientTarget,
  NutrientValues,
  ProgressStatus,
} from '../types';
import { getProgressStatus } from './calories';
import { entriesForDate } from './calories';

export const MAX_CUSTOM_NUTRIENTS = 8;
export const PROTEIN_KEY = 'protein';

export function nutrientValue(values: NutrientValues | undefined, key: string): number {
  const value = values?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function parseOptionalAmount(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 0;
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

export function sumNutrient(entries: FoodEntry[], key: string): number {
  return entries.reduce((total, entry) => total + nutrientValue(entry.nutrients, key), 0);
}

export function foodsContributingNutrient(entries: FoodEntry[], key: string) {
  return entries
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      amount: nutrientValue(entry.nutrients, key),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function getNutrientTargetForDate(
  snapshots: NutrientTarget[],
  key: string,
  dateKey: string,
  fallback: number,
): number {
  const applicable = snapshots
    .filter((item) => item.key === key && item.effectiveFrom <= dateKey)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return applicable[0]?.dailyTarget ?? fallback;
}

export function upsertNutrientTarget(
  snapshots: NutrientTarget[],
  dateKey: string,
  key: string,
  dailyTarget: number,
): NutrientTarget[] {
  const index = snapshots.findIndex((item) => item.key === key && item.effectiveFrom === dateKey);
  if (index >= 0) {
    return snapshots.map((item, i) => (i === index ? { ...item, dailyTarget } : item));
  }
  return [...snapshots, { effectiveFrom: dateKey, key, dailyTarget }].sort((a, b) =>
    a.effectiveFrom.localeCompare(b.effectiveFrom),
  );
}

export function enabledNutrientGoals(goals: NutrientGoal[]): NutrientGoal[] {
  return goals.filter((goal) => goal.enabled);
}

export function buildNutrientDaySummary(
  dateKey: string,
  entries: FoodEntry[],
  snapshots: NutrientTarget[],
  goal: NutrientGoal,
): NutrientDaySummary {
  const dayEntries = entriesForDate(entries, dateKey);
  const consumed = sumNutrient(dayEntries, goal.key);
  const target = getNutrientTargetForDate(snapshots, goal.key, dateKey, goal.dailyTarget);
  const catalog = getCatalogItem(goal.key);
  return {
    date: dateKey,
    key: goal.key,
    consumed,
    target,
    remaining: target - consumed,
    status: getProgressStatus(consumed, target),
    unit: catalog?.unit ?? 'g',
  };
}

export function remainingNutrientLabel(summary: NutrientDaySummary): string {
  const unit = summary.unit;
  if (summary.status === 'reached') {
    return 'Target reached';
  }
  if (summary.remaining < 0) {
    return `${formatAmount(Math.abs(summary.remaining))} ${unit} over`;
  }
  return `${formatAmount(summary.remaining)} ${unit} left`;
}

export function formatAmount(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toLocaleString('en-US') : rounded.toFixed(1);
}

export function defaultProteinGoal(): NutrientGoal {
  return { key: PROTEIN_KEY, enabled: true, dailyTarget: 120 };
}

export function customGoalCount(goals: NutrientGoal[]): number {
  return goals.filter((goal) => goal.key !== PROTEIN_KEY).length;
}

export function progressTone(status: ProgressStatus): 'success' | 'warning' | 'danger' {
  if (status === 'exceeded') {
    return 'danger';
  }
  if (status === 'warning') {
    return 'warning';
  }
  return 'success';
}
