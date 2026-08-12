import type { ExportPayload, FoodEntry, MealCategory, Settings } from '../types';
import { isValidDateKey } from './dates';

export function toCsv(entries: FoodEntry[]): string {
  const header = 'date,time,food,calories,meal,notes';
  const rows = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .map((entry) =>
      [
        entry.date,
        entry.time,
        csvEscape(entry.name),
        String(entry.calories),
        entry.meal ?? '',
        csvEscape(entry.notes),
      ].join(','),
    );
  return [header, ...rows].join('\n');
}

export function toJsonBackup(payload: Omit<ExportPayload, 'version' | 'exportedAt'>): string {
  const body: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...payload,
  };
  return JSON.stringify(body, null, 2);
}

export function parseImportedJson(text: string): ExportPayload {
  const parsed = JSON.parse(text) as Partial<ExportPayload>;
  if (!parsed || parsed.version !== 1 || !parsed.settings || !Array.isArray(parsed.entries)) {
    throw new Error('This file is not a valid Calories backup.');
  }

  return {
    version: 1,
    exportedAt: parsed.exportedAt ?? new Date().toISOString(),
    settings: parsed.settings,
    targets: Array.isArray(parsed.targets) ? parsed.targets : [],
    entries: parsed.entries,
  };
}

export function parseImportedCsv(text: string): Array<Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>> {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('This CSV file does not contain any food entries.');
  }

  const header = splitCsvLine(lines[0] ?? '').map((value) => value.trim().toLowerCase());
  const dateIndex = header.indexOf('date');
  const foodIndex = header.findIndex((value) => value === 'food' || value === 'name');
  const caloriesIndex = header.indexOf('calories');
  const mealIndex = header.indexOf('meal');
  const timeIndex = header.indexOf('time');
  const notesIndex = header.indexOf('notes');

  if (dateIndex < 0 || foodIndex < 0 || caloriesIndex < 0) {
    throw new Error('CSV must include date, food, and calories columns.');
  }

  return lines.slice(1).map((line, index) => {
    const columns = splitCsvLine(line);
    const date = columns[dateIndex]?.trim() ?? '';
    const name = columns[foodIndex]?.trim() ?? '';
    const calories = Number(columns[caloriesIndex]);
    if (!isValidDateKey(date) || !name || !Number.isFinite(calories)) {
      throw new Error(`Row ${index + 2} is invalid.`);
    }

    return {
      date,
      time: normalizeImportedTime(columns[timeIndex]),
      name,
      calories: Math.round(calories),
      meal: normalizeImportedMeal(columns[mealIndex]),
      notes: columns[notesIndex]?.trim() ?? '',
    };
  });
}

export function isSettings(value: Partial<Settings>): value is Settings {
  return (
    typeof value.targetName === 'string' &&
    typeof value.calorieTarget === 'number' &&
    (value.weekStartsOn === 0 || value.weekStartsOn === 1) &&
    (value.theme === 'system' || value.theme === 'light' || value.theme === 'dark') &&
    (typeof value.startedOn === 'string' || value.startedOn === undefined)
  );
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function normalizeImportedTime(value?: string): string {
  if (value && /^\d{2}:\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  return '12:00';
}

function normalizeImportedMeal(value?: string): MealCategory | null {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === 'breakfast' ||
    normalized === 'lunch' ||
    normalized === 'dinner' ||
    normalized === 'snack' ||
    normalized === 'other'
  ) {
    return normalized;
  }
  return null;
}
