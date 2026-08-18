import { Feather } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MAX_FOOD_CALORIES, MAX_FOOD_NAME_LENGTH, MAX_NOTES_LENGTH, MEAL_OPTIONS } from '../constants';
import { getCatalogItem } from '../data/nutrientCatalog';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import type { FoodEntry, MealCategory, NutrientValues, SavedFood } from '../types';
import { formatDisplayDate, formatDisplayTime, formatTime, toLocalDateKey } from '../utils/dates';
import { searchFoods } from '../utils/foodLibrary';
import { mealLabel, parseQuickEntry, suggestMeal } from '../utils/meals';
import { enabledNutrientGoals, parseOptionalAmount } from '../utils/nutrients';
import { AskAiLinks } from './AskAiLinks';
import { FoodSuggestions } from './FoodSuggestions';
import { DatePickerSheet } from './ui/DatePickerSheet';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { TextField } from './ui/TextField';

export interface FoodFormValues {
  name: string;
  calories: number;
  date: string;
  time: string;
  meal: MealCategory | null;
  notes: string;
  nutrients: NutrientValues;
  saveToLibrary: boolean;
}

interface FoodFormProps {
  initial?: Partial<FoodEntry>;
  defaultDate?: string;
  showDateTime?: boolean;
  submitLabel: string;
  onSubmit: (values: FoodFormValues) => void;
  onDelete?: () => void;
}

function nutrientDraftFrom(values: NutrientValues | undefined, keys: string[]): Record<string, string> {
  const draft: Record<string, string> = {};
  for (const key of keys) {
    const value = values?.[key];
    draft[key] = typeof value === 'number' && value > 0 ? String(value) : '';
  }
  return draft;
}

export function FoodForm({
  initial,
  defaultDate,
  showDateTime = false,
  submitLabel,
  onSubmit,
  onDelete,
}: FoodFormProps) {
  const theme = useTheme();
  const savedFoods = useAppStore((state) => state.savedFoods);
  const nutrientGoals = useAppStore((state) => state.settings.nutrientGoals);
  const enabledGoals = useMemo(() => enabledNutrientGoals(nutrientGoals), [nutrientGoals]);
  const nutrientKeys = useMemo(() => enabledGoals.map((goal) => goal.key), [enabledGoals]);

  const [name, setName] = useState(initial?.name ?? '');
  const [calories, setCalories] = useState(initial?.calories ? String(initial.calories) : '');
  const [meal, setMeal] = useState<MealCategory | null>(initial?.meal ?? suggestMeal());
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? toLocalDateKey());
  const [time, setTime] = useState(initial?.time ?? formatTime());
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [errors, setErrors] = useState<{ name?: string; calories?: string }>({});
  const [nutrientDraft, setNutrientDraft] = useState(() => nutrientDraftFrom(initial?.nutrients, nutrientKeys));
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [pickedSuggestion, setPickedSuggestion] = useState(false);

  const pickerValue = useMemo(() => {
    const [hours, minutes] = time.split(':').map(Number);
    const value = new Date();
    const [year, month, day] = date.split('-').map(Number);
    value.setFullYear(year, (month ?? 1) - 1, day ?? 1);
    value.setHours(hours || 0, minutes || 0, 0, 0);
    return value;
  }, [date, time]);

  const suggestions = useMemo(() => searchFoods(savedFoods, name), [name, savedFoods]);
  const showSuggestions = !pickedSuggestion && name.trim().length > 0 && suggestions.length > 0;

  function applyQuickEntry(value: string) {
    const parsed = parseQuickEntry(value);
    setName(parsed.name);
    if (parsed.calories && !calories) {
      setCalories(String(parsed.calories));
    }
  }

  function applySuggestion(food: SavedFood) {
    setName(food.name);
    setCalories(String(food.calories));
    if (food.meal) {
      setMeal(food.meal);
    }
    setNutrientDraft(nutrientDraftFrom(food.nutrients, nutrientKeys));
    setPickedSuggestion(true);
  }

  function collectNutrients(): NutrientValues {
    const nutrients: NutrientValues = {};
    for (const key of nutrientKeys) {
      nutrients[key] = parseOptionalAmount(nutrientDraft[key] ?? '');
    }
    return nutrients;
  }

  function validate(): FoodFormValues | null {
    const parsedName = name.trim();
    const parsedCalories = Number(calories);
    const nextErrors: { name?: string; calories?: string } = {};

    if (!parsedName) {
      nextErrors.name = 'Enter a food name.';
    } else if (parsedName.length > MAX_FOOD_NAME_LENGTH) {
      nextErrors.name = `Keep the name under ${MAX_FOOD_NAME_LENGTH} characters.`;
    }

    if (!calories.trim()) {
      nextErrors.calories = 'Enter calories.';
    } else if (!Number.isFinite(parsedCalories) || parsedCalories <= 0) {
      nextErrors.calories = 'Calories must be a number greater than 0.';
    } else if (parsedCalories > MAX_FOOD_CALORIES) {
      nextErrors.calories = `Calories must be ${MAX_FOOD_CALORIES.toLocaleString('en-US')} or less.`;
    }

    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.calories) {
      return null;
    }

    return {
      name: parsedName,
      calories: Math.round(parsedCalories),
      date,
      time,
      meal,
      notes: notes.trim(),
      nutrients: collectNutrients(),
      saveToLibrary,
    };
  }

  function handleSubmit() {
    const values = validate();
    if (values) {
      onSubmit(values);
    }
  }

  function onPickerChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setPicker(null);
    }
    if (event.type === 'dismissed' || !selected) {
      return;
    }
    if (picker === 'date') {
      setDate(toLocalDateKey(selected));
      return;
    }
    setTime(formatTime(selected));
  }

  return (
    <View style={styles.form}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.fields}
      >
        <View>
          <TextField
            label="Food"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setPickedSuggestion(false);
            }}
            onBlur={() => applyQuickEntry(name)}
            placeholder="Chicken biryani — 650"
            large
            returnKeyType="next"
            maxLength={MAX_FOOD_NAME_LENGTH}
            error={errors.name}
            blurOnSubmit={false}
            showSoftInputOnFocus
          />
          <FoodSuggestions foods={suggestions} visible={showSuggestions} onSelect={applySuggestion} />
          <AskAiLinks foodName={name} />
        </View>

        <TextField
          label="Calories"
          value={calories}
          onChangeText={(value) => setCalories(value.replace(/[^\d]/g, ''))}
          placeholder="650"
          keyboardType="number-pad"
          large
          maxLength={5}
          error={errors.calories}
        />

        {enabledGoals.length > 0 ? (
          <View style={styles.nutrients}>
            <AppText variant="label" color={theme.colors.textMuted}>
              Nutrients
            </AppText>
            <AppText variant="caption" color={theme.colors.textSubtle}>
              Optional. Skip a field to count it as 0.
            </AppText>
            {enabledGoals.map((goal) => {
              const catalog = getCatalogItem(goal.key);
              return (
                <TextField
                  key={goal.key}
                  label={`${catalog?.label ?? goal.key} (${catalog?.unit ?? 'g'})`}
                  value={nutrientDraft[goal.key] ?? ''}
                  onChangeText={(value) =>
                    setNutrientDraft((current) => ({
                      ...current,
                      [goal.key]: value.replace(/[^\d.]/g, ''),
                    }))
                  }
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              );
            })}
          </View>
        ) : null}

        <View>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.label}>
            Meal
          </AppText>
          <View style={styles.chips}>
            {MEAL_OPTIONS.map((option) => {
              const selected = meal === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setMeal(selected ? null : option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={mealLabel(option)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                      opacity: pressed ? 0.86 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <AppText variant="label" color={selected ? theme.colors.accent : theme.colors.text}>
                    {mealLabel(option)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="caption" color={theme.colors.textSubtle} style={styles.hint}>
            Suggested from the current time. Tap again to leave it uncategorized.
          </AppText>
        </View>

        {showDateTime ? (
          <View style={styles.datetime}>
            <Pressable
              onPress={() => setPicker('date')}
              accessibilityRole="button"
              accessibilityLabel={`Date, ${formatDisplayDate(date)}`}
              style={[styles.metaButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <AppText variant="caption" color={theme.colors.textMuted}>
                Date
              </AppText>
              <AppText variant="bodyMedium">{formatDisplayDate(date)}</AppText>
            </Pressable>
            <Pressable
              onPress={() => setPicker('time')}
              accessibilityRole="button"
              accessibilityLabel={`Time, ${formatDisplayTime(time)}`}
              style={[styles.metaButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <AppText variant="caption" color={theme.colors.textMuted}>
                Time
              </AppText>
              <AppText variant="bodyMedium">{formatDisplayTime(time)}</AppText>
            </Pressable>
          </View>
        ) : null}

        <DatePickerSheet
          visible={picker === 'date'}
          title="Select date"
          value={date}
          onChange={onPickerChange}
          onClose={() => setPicker(null)}
        />

        {picker === 'time' ? (
          <DateTimePicker
            value={pickerValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={theme.dark ? 'dark' : 'light'}
            onChange={onPickerChange}
          />
        ) : null}

        {Platform.OS === 'ios' && picker === 'time' ? (
          <Button label="Done" variant="secondary" onPress={() => setPicker(null)} />
        ) : null}

        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          multiline
          textAlignVertical="top"
          maxLength={MAX_NOTES_LENGTH}
          inputStyle={{ minHeight: 88 }}
        />

        <Pressable
          onPress={() => setSaveToLibrary((value) => !value)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: saveToLibrary }}
          accessibilityLabel="Save this food to your library"
          style={({ pressed }) => [
            styles.saveRow,
            {
              backgroundColor: theme.colors.surface,
              borderColor: saveToLibrary ? theme.colors.accent : theme.colors.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: saveToLibrary ? theme.colors.accent : theme.colors.border,
                backgroundColor: saveToLibrary ? theme.colors.accent : 'transparent',
              },
            ]}
          >
            {saveToLibrary ? <Feather name="check" size={14} color={theme.colors.onAccent} /> : null}
          </View>
          <View style={styles.saveCopy}>
            <AppText variant="bodyMedium">Save this food</AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Save it for faster entry next time.
            </AppText>
          </View>
        </Pressable>
      </ScrollView>
      <View style={styles.actions}>
        <Button label={submitLabel} onPress={handleSubmit} />
        {onDelete ? <Button label="Delete entry" variant="danger" onPress={onDelete} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
  fields: {
    gap: 20,
    paddingBottom: 20,
  },
  nutrients: {
    gap: 12,
  },
  actions: {
    gap: 12,
    paddingTop: 8,
  },
  label: {
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 8,
  },
  datetime: {
    flexDirection: 'row',
    gap: 12,
  },
  metaButton: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 2,
  },
  saveRow: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveCopy: {
    flex: 1,
    gap: 2,
  },
});
