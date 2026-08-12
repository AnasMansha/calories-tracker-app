import type { DaySummary, WeekStartsOn } from '../types';
import { getProgressStatus } from './calories';
import { formatMonthDay, getWeekDateKeys } from './dates';

export interface ChartPoint {
  key: string;
  label: string;
  consumed: number;
  target: number;
  status: DaySummary['status'];
  entryCount: number;
}

export function clipDays(days: DaySummary[], startedOn: string, today: string): DaySummary[] {
  return days.filter((day) => day.date >= startedOn && day.date <= today);
}

export function toDailyPoints(days: DaySummary[], labelFor: (date: string) => string): ChartPoint[] {
  return days.map((day) => ({
    key: day.date,
    label: labelFor(day.date),
    consumed: day.consumed,
    target: day.target,
    status: day.status,
    entryCount: day.entryCount,
  }));
}

export function toWeeklyPoints(days: DaySummary[], weekStartsOn: WeekStartsOn): ChartPoint[] {
  if (days.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const points: ChartPoint[] = [];

  for (const day of days) {
    const weekStart = getWeekDateKeys(day.date, weekStartsOn)[0];
    if (!weekStart || seen.has(weekStart)) {
      continue;
    }
    seen.add(weekStart);
    const weekDays = days.filter((item) => getWeekDateKeys(item.date, weekStartsOn)[0] === weekStart);
    const consumed =
      weekDays.reduce((sum, item) => sum + item.consumed, 0) / Math.max(weekDays.length, 1);
    const target =
      weekDays.reduce((sum, item) => sum + item.target, 0) / Math.max(weekDays.length, 1);
    const entryCount = weekDays.reduce((sum, item) => sum + item.entryCount, 0);
    points.push({
      key: weekStart,
      label: formatMonthDay(weekStart),
      consumed: Math.round(consumed),
      target: Math.round(target),
      status: getProgressStatus(consumed, target),
      entryCount,
    });
  }

  return points;
}
