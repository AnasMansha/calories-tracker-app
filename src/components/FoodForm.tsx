import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MAX_FOOD_CALORIES, MAX_FOOD_NAME_LENGTH, MAX_NOTES_LENGTH, MEAL_OPTIONS } from '../constants';
import { DatePickerSheet } from './ui/DatePickerSheet';
import { useTheme } from '../theme/ThemeProvider';
import type { FoodEntry, MealCategory } from '../types';
import { formatDisplayDate, formatDisplayTime, formatTime, toLocalDateKey } from '../utils/dates';
import { mealLabel, parseQuickEntry, suggestMeal } from '../utils/meals';
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
}

interface FoodFormProps {
  initial?: Partial<FoodEntry>;
  defaultDate?: string;
  showDateTime?: boolean;
  submitLabel: string;
  onSubmit: (values: FoodFormValues) => void;
  onDelete?: () => void;
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
  const [name, setName] = useState(initial?.name ?? '');
  const [calories, setCalories] = useState(initial?.calories ? String(initial.calories) : '');
  const [meal, setMeal] = useState<MealCategory | null>(initial?.meal ?? suggestMeal());
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? toLocalDateKey());
  const [time, setTime] = useState(initial?.time ?? formatTime());
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [errors, setErrors] = useState<{ name?: string; calories?: string }>({});

  const pickerValue = useMemo(() => {
    const [hours, minutes] = time.split(':').map(Number);
    const value = new Date();
    const [year, month, day] = date.split('-').map(Number);
    value.setFullYear(year, (month ?? 1) - 1, day ?? 1);
    value.setHours(hours || 0, minutes || 0, 0, 0);
    return value;
  }, [date, time]);

  function applyQuickEntry(value: string) {
    const parsed = parseQuickEntry(value);
    setName(parsed.name);
    if (parsed.calories && !calories) {
      setCalories(String(parsed.calories));
    }
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
      <TextField
        label="Food"
        value={name}
        onChangeText={setName}
        onBlur={() => applyQuickEntry(name)}
        placeholder="Chicken biryani — 650"
        large
        returnKeyType="next"
        maxLength={MAX_FOOD_NAME_LENGTH}
        error={errors.name}
        blurOnSubmit={false}
        showSoftInputOnFocus
      />
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
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
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
});
