import type { DaySummary } from '../types';
import { formatCalories } from './calories';
import { formatMonthDay, formatWeekday } from './dates';
import { formatAmount } from './nutrients';

export interface InsightItem {
  id: 'average' | 'within' | 'highest' | 'lowest';
  label: string;
  value: string;
  detail?: string;
}

export interface RangeInsights {
  averageDaily: number;
  totalCalories: number;
  averageRemaining: number;
  daysWithinTarget: number;
  dayCount: number;
  loggedDays: number;
  highest: DaySummary | null;
  lowest: DaySummary | null;
  items: InsightItem[];
}

export function formatMetric(value: number, unit: string): string {
  if (unit === 'kcal') {
    return `${formatCalories(value)} kcal`;
  }
  return `${formatAmount(value)} ${unit}`;
}

export function buildInsights(days: DaySummary[], unit = 'kcal'): RangeInsights {
  const dayCount = days.length;
  const logged = days.filter((day) => day.entryCount > 0);
  const total = days.reduce((sum, day) => sum + day.consumed, 0);
  const averageDaily = dayCount === 0 ? 0 : total / dayCount;
  const averageRemaining =
    dayCount === 0 ? 0 : days.reduce((sum, day) => sum + day.remaining, 0) / dayCount;
  const daysWithinTarget = days.filter((day) => day.consumed <= day.target).length;
  const highest =
    logged.length === 0
      ? null
      : logged.reduce((max, day) => (day.consumed > max.consumed ? day : max));
  const lowest =
    logged.length === 0
      ? null
      : logged.reduce((min, day) => (day.consumed < min.consumed ? day : min));

  const items: InsightItem[] = [
    {
      id: 'average',
      label: 'Average this period',
      value: `${formatMetric(averageDaily, unit)}/day`,
      detail: dayCount === 1 ? 'Across 1 tracked day' : `Across ${dayCount} tracked days`,
    },
    {
      id: 'within',
      label: 'Within target',
      value: `${daysWithinTarget} of ${dayCount} days`,
      detail: logged.length === 0 ? 'Nothing logged yet' : `${logged.length} days with logs`,
    },
  ];

  if (highest) {
    items.push({
      id: 'highest',
      label: 'Highest day',
      value: formatMetric(highest.consumed, unit),
      detail: `${formatWeekday(highest.date)}, ${formatMonthDay(highest.date)}`,
    });
  }
  if (lowest) {
    items.push({
      id: 'lowest',
      label: 'Lowest day',
      value: formatMetric(lowest.consumed, unit),
      detail: `${formatWeekday(lowest.date)}, ${formatMonthDay(lowest.date)}`,
    });
  }

  return {
    averageDaily,
    totalCalories: total,
    averageRemaining,
    daysWithinTarget,
    dayCount,
    loggedDays: logged.length,
    highest,
    lowest,
    items,
  };
}
