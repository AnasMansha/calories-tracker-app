import assert from 'node:assert/strict';

import { buildDaySummary, getProgressStatus, remainingLabel, upsertTargetForDate } from '../src/utils/calories.ts';
import { addDaysToKey, greetingForHour, parseLocalDate, toLocalDateKey } from '../src/utils/dates.ts';
import { parseImportedCsv, toCsv } from '../src/utils/export.ts';
import { buildInsights } from '../src/utils/insights.ts';
import { parseQuickEntry, suggestMeal } from '../src/utils/meals.ts';
import type { FoodEntry } from '../src/types.ts';

const entries: FoodEntry[] = [
  {
    id: '1',
    name: 'Egg sandwich',
    calories: 420,
    date: '2026-08-11',
    time: '09:15',
    meal: 'breakfast',
    notes: '',
    createdAt: '2026-08-11T09:15:00.000Z',
    updatedAt: '2026-08-11T09:15:00.000Z',
  },
  {
    id: '2',
    name: 'Chicken rice',
    calories: 650,
    date: '2026-08-11',
    time: '13:30',
    meal: 'lunch',
    notes: '',
    createdAt: '2026-08-11T13:30:00.000Z',
    updatedAt: '2026-08-11T13:30:00.000Z',
  },
];

const summary = buildDaySummary('2026-08-11', entries, [{ effectiveFrom: '2026-08-01', calorieTarget: 2000 }], 1800);
assert.equal(summary.consumed, 1070);
assert.equal(summary.target, 2000);
assert.equal(summary.remaining, 930);
assert.equal(summary.status, 'normal');
assert.equal(remainingLabel(summary), '930 kcal remaining');

assert.equal(getProgressStatus(1600, 2000), 'warning');
assert.equal(getProgressStatus(2000, 2000), 'reached');
assert.equal(getProgressStatus(2240, 2000), 'exceeded');
assert.equal(remainingLabel({ ...summary, consumed: 2240, remaining: -240, status: 'exceeded' }), '240 kcal over target');
assert.equal(remainingLabel({ ...summary, consumed: 2000, remaining: 0, status: 'reached' }), 'Target reached');

const laterTargets = upsertTargetForDate(
  [{ effectiveFrom: '2026-08-01', calorieTarget: 2000 }],
  '2026-08-11',
  1800,
);
assert.equal(buildDaySummary('2026-08-10', entries, laterTargets, 1800).target, 2000);
assert.equal(buildDaySummary('2026-08-11', entries, laterTargets, 1800).target, 1800);

assert.equal(toLocalDateKey(parseLocalDate('2026-08-11')), '2026-08-11');
assert.equal(addDaysToKey('2026-08-11', -1), '2026-08-10');
assert.equal(greetingForHour(8), 'Good morning');
assert.equal(greetingForHour(14), 'Good afternoon');
assert.equal(greetingForHour(20), 'Good evening');

assert.equal(suggestMeal(new Date(2026, 7, 11, 8, 0, 0)), 'breakfast');
assert.equal(suggestMeal(new Date(2026, 7, 11, 12, 0, 0)), 'lunch');
assert.equal(suggestMeal(new Date(2026, 7, 11, 19, 0, 0)), 'dinner');
assert.equal(suggestMeal(new Date(2026, 7, 11, 23, 0, 0)), 'snack');

assert.deepEqual(parseQuickEntry('Chicken biryani — 650 kcal'), { name: 'Chicken biryani', calories: 650 });
assert.deepEqual(parseQuickEntry('Protein bar 210'), { name: 'Protein bar', calories: 210 });

const csv = toCsv(entries);
const imported = parseImportedCsv(csv);
assert.equal(imported.length, 2);
assert.equal(imported[0]?.name, 'Egg sandwich');

const insights = buildInsights([
  summary,
  { ...summary, date: '2026-08-10', consumed: 2340, remaining: -340, status: 'exceeded', entryCount: 3 },
  { ...summary, date: '2026-08-09', consumed: 1540, remaining: 460, status: 'normal', entryCount: 2 },
]);
assert.equal(insights.highest?.consumed, 2340);
assert.equal(insights.lowest?.consumed, 1070);
assert.equal(insights.daysWithinTarget, 2);
assert.equal(insights.items.length, 4);

console.log('Logic verification passed.');
