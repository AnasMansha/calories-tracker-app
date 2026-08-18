import type { FoodLibraryFile, SavedFood } from '../types';
import { createSeedFoods, FOOD_SEED_VERSION } from '../data/foodLibrary';
import { normalizeFoodName } from './foodNames';

export function mergeSeedIntoLibrary(existing: SavedFood[]): SavedFood[] {
  const seed = createSeedFoods();
  const map = new Map(existing.map((food) => [food.nameKey, food]));
  for (const item of seed) {
    if (!map.has(item.nameKey)) {
      map.set(item.nameKey, item);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function ensureFoodLibrary(savedFoods: SavedFood[], seedVersion: number): {
  foods: SavedFood[];
  seedVersion: number;
} {
  if (savedFoods.length === 0) {
    return { foods: createSeedFoods(), seedVersion: FOOD_SEED_VERSION };
  }
  if (seedVersion < FOOD_SEED_VERSION) {
    return { foods: mergeSeedIntoLibrary(savedFoods), seedVersion: FOOD_SEED_VERSION };
  }
  return { foods: savedFoods, seedVersion };
}

export function upsertSavedFood(library: SavedFood[], food: Omit<SavedFood, 'nameKey' | 'updatedAt'> & { name: string }): SavedFood[] {
  const nameKey = normalizeFoodName(food.name);
  const next: SavedFood = {
    ...food,
    nameKey,
    name: food.name.trim(),
    updatedAt: new Date().toISOString(),
    source: 'user',
  };
  const exists = library.some((item) => item.nameKey === nameKey);
  const updated = exists
    ? library.map((item) => (item.nameKey === nameKey ? next : item))
    : [...library, next];
  return updated.sort((a, b) => a.name.localeCompare(b.name));
}

export function searchFoods(library: SavedFood[], query: string): SavedFood[] {
  const needle = normalizeFoodName(query);
  if (needle.length < 1) {
    return [];
  }
  return library
    .filter((food) => food.nameKey.includes(needle) || normalizeFoodName(food.name).includes(needle))
    .sort((a, b) => {
      const aPrefix = a.nameKey.startsWith(needle) ? 0 : 1;
      const bPrefix = b.nameKey.startsWith(needle) ? 0 : 1;
      if (aPrefix !== bPrefix) {
        return aPrefix - bPrefix;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8);
}

export function toFoodLibraryFile(foods: SavedFood[]): string {
  const body: FoodLibraryFile = {
    kind: 'calorie-tracker-foods',
    version: 1,
    exportedAt: new Date().toISOString(),
    foods,
  };
  return JSON.stringify(body, null, 2);
}

export function parseFoodLibraryFile(text: string): FoodLibraryFile {
  const parsed = JSON.parse(text) as Partial<FoodLibraryFile>;
  if (parsed.kind !== 'calorie-tracker-foods' || parsed.version !== 1 || !Array.isArray(parsed.foods)) {
    throw new Error('This is not a Calories food library file.');
  }
  const foods = parsed.foods
    .filter((food) => food && typeof food.name === 'string' && Number.isFinite(food.calories))
    .map((food) => ({
      nameKey: food.nameKey || normalizeFoodName(food.name),
      name: food.name.trim(),
      calories: Math.round(food.calories),
      nutrients: food.nutrients ?? {},
      meal: food.meal ?? null,
      updatedAt: food.updatedAt ?? new Date().toISOString(),
      source: food.source === 'user' ? 'user' : 'seed',
    })) as SavedFood[];
  if (foods.length === 0) {
    throw new Error('This food file has no usable items.');
  }
  return {
    kind: 'calorie-tracker-foods',
    version: 1,
    exportedAt: parsed.exportedAt ?? new Date().toISOString(),
    foods,
  };
}

export function mergeFoodLibraries(
  current: SavedFood[],
  incoming: SavedFood[],
  duplicatePriority: 'mine' | 'incoming',
): { foods: SavedFood[]; added: number; replaced: number; skipped: number } {
  const map = new Map(current.map((food) => [food.nameKey, food]));
  let added = 0;
  let replaced = 0;
  let skipped = 0;

  for (const food of incoming) {
    const existing = map.get(food.nameKey);
    if (!existing) {
      map.set(food.nameKey, { ...food, source: 'user' });
      added += 1;
      continue;
    }
    if (duplicatePriority === 'incoming') {
      map.set(food.nameKey, { ...food, source: 'user', updatedAt: new Date().toISOString() });
      replaced += 1;
    } else {
      skipped += 1;
    }
  }

  return {
    foods: [...map.values()].sort((a, b) => a.name.localeCompare(b.name)),
    added,
    replaced,
    skipped,
  };
}
