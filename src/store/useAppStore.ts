import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CALORIE_TARGET, STORAGE_KEY } from '../constants';
import type { DailyTarget, ExportPayload, FoodEntry, MealCategory, Settings } from '../types';
import {
  buildDaySummary,
  entriesForDate,
  getTargetForDate,
  upsertTargetForDate,
} from '../utils/calories';
import { formatTime, inferStartedOn, todayKey } from '../utils/dates';
import { createId } from '../utils/ids';

interface AddFoodInput {
  name: string;
  calories: number;
  date: string;
  time?: string;
  meal: MealCategory | null;
  notes?: string;
}

interface UpdateFoodInput {
  id: string;
  name: string;
  calories: number;
  date: string;
  time: string;
  meal: MealCategory | null;
  notes: string;
}

interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  settings: Settings;
  entries: FoodEntry[];
  targets: DailyTarget[];
  completeOnboarding: (input: { calorieTarget: number; targetName: string }) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setCalorieTarget: (calorieTarget: number, targetName?: string) => void;
  addFood: (input: AddFoodInput) => FoodEntry;
  updateFood: (input: UpdateFoodInput) => void;
  deleteFood: (id: string) => void;
  importBackup: (payload: ExportPayload) => void;
  importEntries: (entries: Array<Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>>) => number;
  clearAllData: () => void;
}

function createDefaultSettings(): Settings {
  return {
    targetName: 'Daily Goal',
    calorieTarget: DEFAULT_CALORIE_TARGET,
    weekStartsOn: 1,
    theme: 'system',
    startedOn: todayKey(),
  };
}

function normalizeSettings(
  settings: Partial<Settings> | undefined,
  entries: FoodEntry[],
  targets: DailyTarget[],
): Settings {
  const defaults = createDefaultSettings();
  const merged = {
    ...defaults,
    ...settings,
  };

  if (!merged.startedOn || merged.startedOn > todayKey()) {
    merged.startedOn = inferStartedOn(entries, targets, todayKey());
  }

  return merged;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      settings: createDefaultSettings(),
      entries: [],
      targets: [],
      completeOnboarding: ({ calorieTarget, targetName }) => {
        const date = todayKey();
        set({
          onboarded: true,
          settings: {
            ...get().settings,
            calorieTarget,
            targetName: targetName.trim() || 'Daily Goal',
            startedOn: date,
          },
          targets: [{ effectiveFrom: date, calorieTarget }],
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
          createdAt: now,
          updatedAt: now,
        };
        set({ entries: [...get().entries, entry] });
        return entry;
      },
      updateFood: (input) => {
        set({
          entries: get().entries.map((entry) =>
            entry.id === input.id
              ? {
                  ...entry,
                  name: input.name.trim(),
                  calories: input.calories,
                  date: input.date,
                  time: input.time,
                  meal: input.meal,
                  notes: input.notes.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : entry,
          ),
        });
      },
      deleteFood: (id) => {
        set({ entries: get().entries.filter((entry) => entry.id !== id) });
      },
      importBackup: (payload) => {
        set({
          onboarded: true,
          settings: normalizeSettings(payload.settings, payload.entries, payload.targets),
          targets: payload.targets,
          entries: payload.entries,
        });
      },
      importEntries: (incoming) => {
        const now = new Date().toISOString();
        const entries = incoming.map((item) => ({
          ...item,
          id: createId(),
          createdAt: now,
          updatedAt: now,
        }));
        set({ entries: [...get().entries, ...entries] });
        return entries.length;
      },
      clearAllData: () => {
        set({
          onboarded: false,
          settings: createDefaultSettings(),
          entries: [],
          targets: [],
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
      }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<AppState> | undefined;
        const entries = Array.isArray(stored?.entries) ? stored.entries : current.entries;
        const targets = Array.isArray(stored?.targets) ? stored.targets : current.targets;
        return {
          ...current,
          ...stored,
          settings: normalizeSettings(stored?.settings, entries, targets),
          entries,
          targets,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to restore calorie data', error);
        }
        useAppStore.setState({ hydrated: true });
        if (state && state.onboarded && state.targets.length === 0) {
          useAppStore.setState({
            targets: [{ effectiveFrom: todayKey(), calorieTarget: state.settings.calorieTarget }],
          });
        }
        if (state && state.onboarded) {
          const normalized = normalizeSettings(state.settings, state.entries, state.targets);
          if (normalized.startedOn !== state.settings.startedOn) {
            useAppStore.setState({ settings: normalized });
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
