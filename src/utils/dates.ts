import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  startOfWeek,
} from 'date-fns';

import type { WeekStartsOn } from '../types';

export function toLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toLocalDateKey(new Date());
}

export function parseLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = parseLocalDate(value);
  return toLocalDateKey(parsed) === value;
}

export function formatTime(date: Date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function combineDateAndTime(dateKey: string, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = parseLocalDate(dateKey);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

export function formatDisplayDate(dateKey: string): string {
  return format(parseLocalDate(dateKey), 'EEEE, MMMM d');
}

export function formatShortDate(dateKey: string): string {
  return format(parseLocalDate(dateKey), 'EEE, MMM d');
}

export function formatMonthDay(dateKey: string): string {
  return format(parseLocalDate(dateKey), 'MMM d');
}

export function formatWeekday(dateKey: string): string {
  return format(parseLocalDate(dateKey), 'EEEE');
}

export function formatWeekdayShort(dateKey: string): string {
  return format(parseLocalDate(dateKey), 'EEE');
}

/** Compact chart labels that always fit (Mon, Tue, Wed…). */
export function formatWeekdayChart(dateKey: string): string {
  return format(parseLocalDate(dateKey), 'EEE');
}

export function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return format(date, 'h:mm a');
}

export function addDaysToKey(dateKey: string, amount: number): string {
  return toLocalDateKey(addDays(parseLocalDate(dateKey), amount));
}

export function daysBetween(startKey: string, endKey: string): number {
  return differenceInCalendarDays(parseLocalDate(endKey), parseLocalDate(startKey));
}

export function enumerateDateKeys(startKey: string, endKey: string): string[] {
  if (startKey > endKey) {
    return [];
  }
  return eachDayOfInterval({
    start: parseLocalDate(startKey),
    end: parseLocalDate(endKey),
  }).map((date) => toLocalDateKey(date));
}

export function getWeekDateKeys(referenceKey: string, weekStartsOn: WeekStartsOn): string[] {
  const start = startOfWeek(parseLocalDate(referenceKey), { weekStartsOn });
  return Array.from({ length: 7 }, (_, index) => toLocalDateKey(addDays(start, index)));
}

export function greetingForHour(hour: number = new Date().getHours()): string {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function isToday(dateKey: string): boolean {
  return dateKey === todayKey();
}

export function maxDateKey(a: string, b: string): string {
  return a > b ? a : b;
}

export function minDateKey(a: string, b: string): string {
  return a < b ? a : b;
}

export function clampDateKey(value: string, start: string, end: string): string {
  if (value < start) {
    return start;
  }
  if (value > end) {
    return end;
  }
  return value;
}

export function formatRangeLabel(startKey: string, endKey: string): string {
  if (startKey === endKey) {
    return formatDisplayDate(startKey);
  }
  const start = parseLocalDate(startKey);
  const end = parseLocalDate(endKey);
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
  }
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export function inferStartedOn(
  entries: Array<{ date: string }>,
  targets: Array<{ effectiveFrom: string }>,
  fallback: string = todayKey(),
): string {
  const dates = [
    ...targets.map((target) => target.effectiveFrom),
    ...entries.map((entry) => entry.date),
  ]
    .filter((value) => isValidDateKey(value))
    .sort();
  return dates[0] ?? fallback;
}
