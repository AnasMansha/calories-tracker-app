import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CALORIE_TARGET, DEFAULT_PROTEIN_TARGET, DEFAULT_WATER_GOAL_ML, STORAGE_KEY } from '../constants';
import { FOOD_SEED_VERSION } from '../data/foodLibrary';
import type {
  DailyTarget,
  ExportPayload,
  FoodEntry,
  MealCategory,
  NutrientGoal,
  NutrientTarget,
  NutrientValues,
  SavedFood,
  Settings,
  WaterLog,
  WaterTarget,
} from '../types';
import {
  buildDaySummary,
  entriesForDate,
  getTargetForDate,
  upsertTargetForDate,
} from '../utils/calories';
import { formatTime, inferStartedOn, todayKey } from '../utils/dates';
import { ensureFoodLibrary, mergeFoodLibraries, upsertSavedFood } from '../utils/foodLibrary';
import { createId } from '../utils/ids';
import {
  MAX_CUSTOM_NUTRIENTS,
  PROTEIN_KEY,
  buildNutrientDaySummary,
  customGoalCount,
  defaultProteinGoal,
  enabledNutrientGoals,
  upsertNutrientTarget,
} from '../utils/nutrients';
import {
  createWaterLog,
  getWaterTargetForDate,
  sumWaterMl,
  upsertWaterTarget,
  waterForDate,
} from '../utils/water';

interface AddFoodInput {
  name: string;
  calories: number;
  date: string;
  time?: string;
  meal: MealCategory | null;
  notes?: string;
  nutrients?: NutrientValues;
  saveToLibrary?: boolean;
}

interface UpdateFoodInput {
  id: string;
  name: string;
  calories: number;
  date: string;
  time: string;
  meal: MealCategory | null;
  notes: string;
  nutrients: NutrientValues;
  saveToLibrary?: boolean;
}

interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  settings: Settings;
  entries: FoodEntry[];
  targets: DailyTarget[];
  nutrientTargets: NutrientTarget[];
  waterTargets: WaterTarget[];
  waterLogs: WaterLog[];
  savedFoods: SavedFood[];
  completeOnboarding: (input: { calorieTarget: number; targetName: string }) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setCalorieTarget: (calorieTarget: number, targetName?: string) => void;
  setProteinGoal: (input: { enabled: boolean; dailyTarget: number }) => void;
  setWaterGoal: (input: { enabled: boolean; waterGoalMl: number }) => void;
  addNutrientGoal: (goal: NutrientGoal) => boolean;
  updateNutrientGoal: (key: string, patch: Partial<NutrientGoal>) => void;
  removeNutrientGoal: (key: string) => void;
  addFood: (input: AddFoodInput) => FoodEntry;
  updateFood: (input: UpdateFoodInput) => void;
  deleteFood: (id: string) => void;
  addWater: (input: { date: string; amountMl: number }) => void;
  undoLastWater: (dateKey: string) => void;
  importBackup: (payload: ExportPayload) => void;
  importEntries: (entries: Array<Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>>) => number;
  replaceFoodLibrary: (foods: SavedFood[]) => void;
  mergeFoodLibrary: (foods: SavedFood[], duplicatePriority: 'mine' | 'incoming') => {
    added: number;
    replaced: number;
    skipped: number;
  };
  clearAllData: () => void;
}

function createDefaultSettings(): Settings {
  return {
    targetName: 'Daily Goal',
    calorieTarget: DEFAULT_CALORIE_TARGET,
    weekStartsOn: 1,
    theme: 'system',
    startedOn: todayKey(),
    proteinEnabled: true,
    waterEnabled: true,
    waterGoalMl: DEFAULT_WATER_GOAL_ML,
    nutrientGoals: [defaultProteinGoal()],
    seedVersion: FOOD_SEED_VERSION,
  };
}

function normalizeSettings(
  settings: Partial<Settings> | undefined,
  entries: FoodEntry[],
  targets: DailyTarget[],
): Settings {
  const defaults = createDefaultSettings();
  const merged: Settings = {
    ...defaults,
    ...settings,
    nutrientGoals: settings?.nutrientGoals?.length ? settings.nutrientGoals : defaults.nutrientGoals,
  };

  if (!merged.startedOn || merged.startedOn > todayKey()) {
    merged.startedOn = inferStartedOn(entries, targets, todayKey());
  }

  if (!merged.nutrientGoals.some((goal) => goal.key === PROTEIN_KEY)) {
    merged.nutrientGoals = [
      { key: PROTEIN_KEY, enabled: merged.proteinEnabled, dailyTarget: DEFAULT_PROTEIN_TARGET },
      ...merged.nutrientGoals,
    ];
  } else {
    merged.nutrientGoals = merged.nutrientGoals.map((goal) =>
      goal.key === PROTEIN_KEY ? { ...goal, enabled: merged.proteinEnabled } : goal,
    );
  }

  return merged;
}

function normalizeEntries(entries: FoodEntry[]): FoodEntry[] {
  return entries.map((entry) => ({
    ...entry,
    nutrients: entry.nutrients ?? {},
  }));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      settings: createDefaultSettings(),
      entries: [],
      targets: [],
      nutrientTargets: [],
      waterTargets: [],
      waterLogs: [],
      savedFoods: [],
      completeOnboarding: ({ calorieTarget, targetName }) => {
        const date = todayKey();
        const library = ensureFoodLibrary([], 0);
        set({
          onboarded: true,
          settings: {
            ...get().settings,
            calorieTarget,
            targetName: targetName.trim() || 'Daily Goal',
            startedOn: date,
            seedVersion: library.seedVersion,
          },
          targets: [{ effectiveFrom: date, calorieTarget }],
          nutrientTargets: [
            { effectiveFrom: date, key: PROTEIN_KEY, dailyTarget: DEFAULT_PROTEIN_TARGET },
          ],
          waterTargets: [{ effectiveFrom: date, waterGoalMl: DEFAULT_WATER_GOAL_ML }],
          savedFoods: library.foods,
        });
      },
      updateSettings: (patch) => {
        set({
          settings: {
            ...get().settings,
            ...patch,
          },
        });
      },
      setCalorieTarget: (calorieTarget, targetName) => {
        const date = todayKey();
        set({
          settings: {
            ...get().settings,
            calorieTarget,
            ...(targetName !== undefined ? { targetName: targetName.trim() || 'Daily Goal' } : {}),
          },
          targets: upsertTargetForDate(get().targets, date, calorieTarget),
        });
      },
      setProteinGoal: ({ enabled, dailyTarget }) => {
        const date = todayKey();
        const settings = get().settings;
        set({
          settings: {
            ...settings,
            proteinEnabled: enabled,
            nutrientGoals: settings.nutrientGoals.map((goal) =>
              goal.key === PROTEIN_KEY ? { ...goal, enabled, dailyTarget } : goal,
            ),
          },
          nutrientTargets: upsertNutrientTarget(get().nutrientTargets, date, PROTEIN_KEY, dailyTarget),
        });
      },
      setWaterGoal: ({ enabled, waterGoalMl }) => {
        const date = todayKey();
        set({
          settings: {
            ...get().settings,
            waterEnabled: enabled,
            waterGoalMl,
          },
          waterTargets: upsertWaterTarget(get().waterTargets, date, waterGoalMl),
        });
      },
      addNutrientGoal: (goal) => {
        const settings = get().settings;
        if (settings.nutrientGoals.some((item) => item.key === goal.key)) {
          return false;
        }
        if (customGoalCount(settings.nutrientGoals) >= MAX_CUSTOM_NUTRIENTS) {
          return false;
        }
        const date = todayKey();
        set({
          settings: {
            ...settings,
            nutrientGoals: [...settings.nutrientGoals, goal],
          },
          nutrientTargets: upsertNutrientTarget(
            get().nutrientTargets,
            date,
            goal.key,
            goal.dailyTarget,
          ),
        });
        return true;
      },
      updateNutrientGoal: (key, patch) => {
        const date = todayKey();
        const settings = get().settings;
        const current = settings.nutrientGoals.find((goal) => goal.key === key);
        if (!current) {
          return;
        }
        const next = { ...current, ...patch };
        set({
          settings: {
            ...settings,
            proteinEnabled: key === PROTEIN_KEY ? next.enabled : settings.proteinEnabled,
            nutrientGoals: settings.nutrientGoals.map((goal) => (goal.key === key ? next : goal)),
          },
          nutrientTargets:
            patch.dailyTarget !== undefined
              ? upsertNutrientTarget(get().nutrientTargets, date, key, patch.dailyTarget)
              : get().nutrientTargets,
        });
      },
      removeNutrientGoal: (key) => {
        if (key === PROTEIN_KEY) {
          get().setProteinGoal({ enabled: false, dailyTarget: DEFAULT_PROTEIN_TARGET });
          return;
        }
        set({
          settings: {
            ...get().settings,
            nutrientGoals: get().settings.nutrientGoals.filter((goal) => goal.key !== key),
          },
        });
      },
      addFood: (input) => {
        const now = new Date().toISOString();
        const entry: FoodEntry = {
          id: createId(),
          name: input.name.trim(),
          calories: input.calories,
          date: input.date,
          time: input.time ?? formatTime(),
          meal: input.meal,
          notes: input.notes?.trim() ?? '',
          nutrients: input.nutrients ?? {},
          createdAt: now,
          updatedAt: now,
        };
        let savedFoods = get().savedFoods;
        if (input.saveToLibrary) {
          savedFoods = upsertSavedFood(savedFoods, {
            name: entry.name,
            calories: entry.calories,
            nutrients: entry.nutrients,
            meal: entry.meal,
            source: 'user',
          });
        }
        set({ entries: [...get().entries, entry], savedFoods });
        return entry;
      },
      updateFood: (input) => {
        const name = input.name.trim();
        let savedFoods = get().savedFoods;
        if (input.saveToLibrary) {
          savedFoods = upsertSavedFood(savedFoods, {
            name,
            calories: input.calories,
            nutrients: input.nutrients,
            meal: input.meal,
            source: 'user',
          });
        }
        set({
          savedFoods,
          entries: get().entries.map((entry) =>
            entry.id === input.id
              ? {
                  ...entry,
                  name,
                  calories: input.calories,
                  date: input.date,
                  time: input.time,
                  meal: input.meal,
                  notes: input.notes.trim(),
                  nutrients: input.nutrients,
                  updatedAt: new Date().toISOString(),
                }
              : entry,
          ),
        });
      },
      deleteFood: (id) => {
        set({ entries: get().entries.filter((entry) => entry.id !== id) });
      },
      addWater: ({ date, amountMl }) => {
        if (amountMl <= 0) {
          return;
        }
        set({ waterLogs: [...get().waterLogs, createWaterLog(date, amountMl)] });
      },
      undoLastWater: (dateKey) => {
        const logs = [...get().waterLogs];
        let lastIndex = -1;
        for (let index = logs.length - 1; index >= 0; index -= 1) {
          if (logs[index]?.date === dateKey) {
            lastIndex = index;
            break;
          }
        }
        if (lastIndex < 0) {
          return;
        }
        logs.splice(lastIndex, 1);
        set({ waterLogs: logs });
      },
      importBackup: (payload) => {
        const library = ensureFoodLibrary(payload.savedFoods ?? [], payload.settings.seedVersion ?? 0);
        set({
          onboarded: true,
          settings: {
            ...normalizeSettings(payload.settings, payload.entries, payload.targets),
            seedVersion: library.seedVersion,
          },
          targets: payload.targets,
          nutrientTargets: payload.nutrientTargets ?? [],
          waterTargets: payload.waterTargets ?? [],
          entries: normalizeEntries(payload.entries),
          waterLogs: payload.waterLogs ?? [],
          savedFoods: library.foods,
        });
      },
      importEntries: (incoming) => {
        const now = new Date().toISOString();
        const entries = incoming.map((item) => ({
          ...item,
          nutrients: item.nutrients ?? {},
          id: createId(),
          createdAt: now,
          updatedAt: now,
        }));
        set({ entries: [...get().entries, ...entries] });
        return entries.length;
      },
      replaceFoodLibrary: (foods) => {
        set({ savedFoods: foods });
      },
      mergeFoodLibrary: (foods, duplicatePriority) => {
        const result = mergeFoodLibraries(get().savedFoods, foods, duplicatePriority);
        set({ savedFoods: result.foods });
        return { added: result.added, replaced: result.replaced, skipped: result.skipped };
      },
      clearAllData: () => {
        set({
          onboarded: false,
          settings: createDefaultSettings(),
          entries: [],
          targets: [],
          nutrientTargets: [],
          waterTargets: [],
          waterLogs: [],
          savedFoods: [],
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboarded: state.onboarded,
        settings: state.settings,
        entries: state.entries,
        targets: state.targets,
        nutrientTargets: state.nutrientTargets,
        waterTargets: state.waterTargets,
        waterLogs: state.waterLogs,
        savedFoods: state.savedFoods,
      }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<AppState> | undefined;
        const entries = normalizeEntries(Array.isArray(stored?.entries) ? stored.entries : current.entries);
        const targets = Array.isArray(stored?.targets) ? stored.targets : current.targets;
        const settings = normalizeSettings(stored?.settings, entries, targets);
        const library = ensureFoodLibrary(
          Array.isArray(stored?.savedFoods) ? stored.savedFoods : current.savedFoods,
          settings.seedVersion,
        );
        return {
          ...current,
          ...stored,
          settings: { ...settings, seedVersion: library.seedVersion },
          entries,
          targets,
          nutrientTargets: Array.isArray(stored?.nutrientTargets) ? stored.nutrientTargets : current.nutrientTargets,
          waterTargets: Array.isArray(stored?.waterTargets) ? stored.waterTargets : current.waterTargets,
          waterLogs: Array.isArray(stored?.waterLogs) ? stored.waterLogs : current.waterLogs,
          savedFoods: library.foods,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to restore calorie data', error);
        }
        useAppStore.setState({ hydrated: true });
        if (!state) {
          return;
        }
        if (state.onboarded && state.targets.length === 0) {
          useAppStore.setState({
            targets: [{ effectiveFrom: todayKey(), calorieTarget: state.settings.calorieTarget }],
          });
        }
        if (state.onboarded && state.nutrientTargets.length === 0) {
          const startedOn = state.settings.startedOn ?? todayKey();
          const proteinGoal = state.settings.nutrientGoals.find((g) => g.key === PROTEIN_KEY);
          const proteinDailyTarget =
            proteinGoal && Number.isFinite(proteinGoal.dailyTarget) && proteinGoal.dailyTarget > 0
              ? proteinGoal.dailyTarget
              : DEFAULT_PROTEIN_TARGET;
          useAppStore.setState({
            nutrientTargets: [{ effectiveFrom: startedOn, key: PROTEIN_KEY, dailyTarget: proteinDailyTarget }],
          });
        }
        if (state.onboarded && state.waterTargets.length === 0) {
          const startedOn = state.settings.startedOn ?? todayKey();
          const waterGoalMl =
            Number.isFinite(state.settings.waterGoalMl) && state.settings.waterGoalMl > 0
              ? state.settings.waterGoalMl
              : DEFAULT_WATER_GOAL_ML;
          useAppStore.setState({
            waterTargets: [{ effectiveFrom: startedOn, waterGoalMl }],
          });
        }
        if (state.onboarded) {
          const library = ensureFoodLibrary(state.savedFoods, state.settings.seedVersion);
          if (library.foods.length !== state.savedFoods.length || library.seedVersion !== state.settings.seedVersion) {
            useAppStore.setState({
              savedFoods: library.foods,
              settings: { ...state.settings, seedVersion: library.seedVersion },
            });
          }
        }
      },
    },
  ),
);

export function useDaySummary(dateKey: string) {
  const entries = useAppStore((state) => state.entries);
  const targets = useAppStore((state) => state.targets);
  const calorieTarget = useAppStore((state) => state.settings.calorieTarget);

  return useMemo(
    () => buildDaySummary(dateKey, entries, targets, calorieTarget),
    [calorieTarget, dateKey, entries, targets],
  );
}

export function useEntriesForDate(dateKey: string) {
  const entries = useAppStore((state) => state.entries);

  return useMemo(() => entriesForDate(entries, dateKey), [dateKey, entries]);
}

export function useTargetForDate(dateKey: string) {
  const targets = useAppStore((state) => state.targets);
  const calorieTarget = useAppStore((state) => state.settings.calorieTarget);

  return useMemo(
    () => getTargetForDate(targets, dateKey, calorieTarget),
    [calorieTarget, dateKey, targets],
  );
}

export function useStartedOn(): string {
  return useAppStore((state) => state.settings.startedOn);
}

export function useNutrientSummaries(dateKey: string) {
  const entries = useAppStore((state) => state.entries);
  const nutrientTargets = useAppStore((state) => state.nutrientTargets);
  const nutrientGoals = useAppStore((state) => state.settings.nutrientGoals);

  return useMemo(
    () =>
      enabledNutrientGoals(nutrientGoals).map((goal) =>
        buildNutrientDaySummary(dateKey, entries, nutrientTargets, goal),
      ),
    [dateKey, entries, nutrientGoals, nutrientTargets],
  );
}

export function useWaterDay(dateKey: string) {
  const waterLogs = useAppStore((state) => state.waterLogs);
  const waterTargets = useAppStore((state) => state.waterTargets);
  const waterEnabled = useAppStore((state) => state.settings.waterEnabled);
  const waterGoalMl = useAppStore((state) => state.settings.waterGoalMl);

  return useMemo(() => {
    const consumedMl = sumWaterMl(waterLogs, dateKey);
    const targetMl = getWaterTargetForDate(waterTargets, dateKey, waterGoalMl);
    return {
      enabled: waterEnabled,
      consumedMl,
      targetMl,
      canUndo: waterForDate(waterLogs, dateKey).length > 0,
    };
  }, [dateKey, waterEnabled, waterGoalMl, waterLogs, waterTargets]);
}
