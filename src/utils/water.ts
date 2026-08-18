import type { DaySummary, WaterLog, WaterTarget } from '../types';
import { getProgressStatus } from './calories';
import { formatTime } from './dates';
import { createId } from './ids';

export const ML_PER_GLASS = 250;
export const DEFAULT_WATER_GOAL_ML = 2000;

export function mlToGlasses(ml: number): number {
  return ml / ML_PER_GLASS;
}

export function glassesToMl(glasses: number): number {
  return Math.round(glasses * ML_PER_GLASS);
}

export function formatWater(ml: number): string {
  const glasses = mlToGlasses(ml);
  const rounded = Math.round(glasses * 10) / 10;
  const glassLabel = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${glassLabel} glass${rounded === 1 ? '' : 'es'} · ${Math.round(ml)} ml`;
}

export function waterForDate(logs: WaterLog[], dateKey: string): WaterLog[] {
  return logs
    .filter((log) => log.date === dateKey)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sumWaterMl(logs: WaterLog[], dateKey: string): number {
  return waterForDate(logs, dateKey).reduce((total, log) => total + log.amountMl, 0);
}

export function getWaterTargetForDate(
  snapshots: WaterTarget[],
  dateKey: string,
  fallback: number,
): number {
  const applicable = snapshots
    .filter((item) => item.effectiveFrom <= dateKey)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return applicable[0]?.waterGoalMl ?? fallback;
}

export function upsertWaterTarget(
  snapshots: WaterTarget[],
  dateKey: string,
  waterGoalMl: number,
): WaterTarget[] {
  const index = snapshots.findIndex((item) => item.effectiveFrom === dateKey);
  if (index >= 0) {
    return snapshots.map((item, i) => (i === index ? { ...item, waterGoalMl } : item));
  }
  return [...snapshots, { effectiveFrom: dateKey, waterGoalMl }].sort((a, b) =>
    a.effectiveFrom.localeCompare(b.effectiveFrom),
  );
}

export function createWaterLog(dateKey: string, amountMl: number): WaterLog {
  const now = new Date();
  return {
    id: createId(),
    date: dateKey,
    time: formatTime(now),
    amountMl,
    createdAt: now.toISOString(),
  };
}

export function waterStatus(consumedMl: number, targetMl: number) {
  return {
    consumedMl,
    targetMl,
    remainingMl: targetMl - consumedMl,
    status: getProgressStatus(consumedMl, targetMl),
    ratio: targetMl <= 0 ? 0 : Math.min(consumedMl / targetMl, 1),
  };
}

export function buildWaterDaySummary(
  dateKey: string,
  logs: WaterLog[],
  snapshots: WaterTarget[],
  fallbackMl: number,
): DaySummary {
  const consumed = sumWaterMl(logs, dateKey);
  const target = getWaterTargetForDate(snapshots, dateKey, fallbackMl);
  return {
    date: dateKey,
    consumed,
    target,
    remaining: target - consumed,
    status: getProgressStatus(consumed, target),
    entryCount: waterForDate(logs, dateKey).length,
  };
}
