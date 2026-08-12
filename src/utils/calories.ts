import { WARNING_THRESHOLD } from '../constants';
import type { DailyTarget, DaySummary, FoodEntry, ProgressStatus } from '../types';

export function getTargetForDate(targets: DailyTarget[], dateKey: string, fallback: number): number {
  const applicable = targets
    .filter((target) => target.effectiveFrom <= dateKey)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

  return applicable[0]?.calorieTarget ?? fallback;
}

export function sumCalories(entries: FoodEntry[]): number {
  return entries.reduce((total, entry) => total + entry.calories, 0);
}

export function entriesForDate(entries: FoodEntry[], dateKey: string): FoodEntry[] {
  return entries
    .filter((entry) => entry.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time) || a.createdAt.localeCompare(b.createdAt));
}

export function getProgressStatus(consumed: number, target: number): ProgressStatus {
  if (target <= 0) {
    return consumed > 0 ? 'exceeded' : 'normal';
  }
  if (consumed === target) {
    return 'reached';
  }
  const ratio = consumed / target;
  if (ratio > 1) {
    return 'exceeded';
  }
  if (ratio >= WARNING_THRESHOLD) {
    return 'warning';
  }
  return 'normal';
}

export function getProgressRatio(consumed: number, target: number): number {
  if (target <= 0) {
    return consumed > 0 ? 1 : 0;
  }
  return Math.min(consumed / target, 1);
}

export function buildDaySummary(
  dateKey: string,
  entries: FoodEntry[],
  targets: DailyTarget[],
  fallbackTarget: number,
): DaySummary {
  const dayEntries = entriesForDate(entries, dateKey);
  const consumed = sumCalories(dayEntries);
  const target = getTargetForDate(targets, dateKey, fallbackTarget);
  return {
    date: dateKey,
    consumed,
    target,
    remaining: target - consumed,
    status: getProgressStatus(consumed, target),
    entryCount: dayEntries.length,
  };
}

export function remainingLabel(summary: DaySummary): string {
  if (summary.status === 'reached') {
    return 'Target reached';
  }
  if (summary.remaining < 0) {
    return `${formatCalories(Math.abs(summary.remaining))} kcal over target`;
  }
  return `${formatCalories(summary.remaining)} kcal remaining`;
}

export function formatCalories(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

export function upsertTargetForDate(
  targets: DailyTarget[],
  dateKey: string,
  calorieTarget: number,
): DailyTarget[] {
  const existingIndex = targets.findIndex((target) => target.effectiveFrom === dateKey);
  if (existingIndex >= 0) {
    return targets.map((target, index) =>
      index === existingIndex ? { ...target, calorieTarget } : target,
    );
  }
  return [...targets, { effectiveFrom: dateKey, calorieTarget }].sort((a, b) =>
    a.effectiveFrom.localeCompare(b.effectiveFrom),
  );
}
