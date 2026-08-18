import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { NutrientPickerSheet } from '../components/ui/NutrientPickerSheet';
import { PageHeader } from '../components/ui/PageHeader';
import { Screen } from '../components/ui/Screen';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { SettingsGroup } from '../components/ui/SettingsGroup';
import { SettingsRow } from '../components/ui/SettingsRow';
import { AppText } from '../components/ui/AppText';
import { TextField } from '../components/ui/TextField';
import { ToggleRow } from '../components/ui/ToggleRow';
import type { MainTabParamList } from '../navigation/types';
import { MAX_CALORIE_TARGET, MIN_CALORIE_TARGET } from '../constants';
import { NUTRIENT_CATALOG, getCatalogItem } from '../data/nutrientCatalog';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemePreference, WeekStartsOn } from '../types';
import { isValidDateKey } from '../utils/dates';
import { isSettings, parseImportedCsv, parseImportedJson, toCsv, toJsonBackup } from '../utils/export';
import { pickTextFile, shareTextFile } from '../utils/files';
import { parseFoodLibraryFile, toFoodLibraryFile } from '../utils/foodLibrary';
import { MAX_CUSTOM_NUTRIENTS, PROTEIN_KEY, customGoalCount, parseOptionalAmount } from '../utils/nutrients';
import { ML_PER_GLASS, glassesToMl, mlToGlasses } from '../utils/water';

export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const settings = useAppStore((state) => state.settings);
  const entries = useAppStore((state) => state.entries);
  const targets = useAppStore((state) => state.targets);
  const nutrientTargets = useAppStore((state) => state.nutrientTargets);
  const waterTargets = useAppStore((state) => state.waterTargets);
  const waterLogs = useAppStore((state) => state.waterLogs);
  const savedFoods = useAppStore((state) => state.savedFoods);
  const setCalorieTarget = useAppStore((state) => state.setCalorieTarget);
  const setProteinGoal = useAppStore((state) => state.setProteinGoal);
  const setWaterGoal = useAppStore((state) => state.setWaterGoal);
  const addNutrientGoal = useAppStore((state) => state.addNutrientGoal);
  const updateNutrientGoal = useAppStore((state) => state.updateNutrientGoal);
  const removeNutrientGoal = useAppStore((state) => state.removeNutrientGoal);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const importBackup = useAppStore((state) => state.importBackup);
  const importEntries = useAppStore((state) => state.importEntries);
  const replaceFoodLibrary = useAppStore((state) => state.replaceFoodLibrary);
  const mergeFoodLibrary = useAppStore((state) => state.mergeFoodLibrary);
  const clearAllData = useAppStore((state) => state.clearAllData);

  const proteinGoal = settings.nutrientGoals.find((goal) => goal.key === PROTEIN_KEY);
  const customGoals = settings.nutrientGoals.filter((goal) => goal.key !== PROTEIN_KEY);

  const [target, setTarget] = useState(String(settings.calorieTarget));
  const [targetName, setTargetName] = useState(settings.targetName);
  const [proteinTarget, setProteinTarget] = useState(String(proteinGoal?.dailyTarget ?? 120));
  const [waterUnit, setWaterUnit] = useState<'glasses' | 'ml'>(
    settings.waterGoalMl % ML_PER_GLASS === 0 ? 'glasses' : 'ml',
  );
  const [waterAmount, setWaterAmount] = useState(
    settings.waterGoalMl % ML_PER_GLASS === 0
      ? String(mlToGlasses(settings.waterGoalMl))
      : String(settings.waterGoalMl),
  );
  const [customDraft, setCustomDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(customGoals.map((goal) => [goal.key, String(goal.dailyTarget)])),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | undefined>();

  const currentWaterMl =
    waterUnit === 'glasses' ? glassesToMl(Number(waterAmount) || 0) : Math.round(Number(waterAmount) || 0);

  const hasTargetChanges = useMemo(() => {
    const parsed = Number(target);
    const proteinValue = parseOptionalAmount(proteinTarget);
    const customChanged = customGoals.some(
      (goal) => parseOptionalAmount(customDraft[goal.key] ?? '') !== goal.dailyTarget,
    );
    return (
      parsed !== settings.calorieTarget ||
      (targetName.trim() || 'Daily Goal') !== settings.targetName ||
      proteinValue !== (proteinGoal?.dailyTarget ?? 120) ||
      currentWaterMl !== settings.waterGoalMl ||
      customChanged
    );
  }, [
    currentWaterMl,
    customDraft,
    customGoals,
    proteinGoal?.dailyTarget,
    proteinTarget,
    settings.calorieTarget,
    settings.targetName,
    settings.waterGoalMl,
    target,
    targetName,
  ]);

  const catalogChoices = useMemo(() => {
    const taken = new Set(settings.nutrientGoals.map((goal) => goal.key));
    const needle = catalogQuery.trim().toLowerCase();
    return NUTRIENT_CATALOG.filter((item) => item.key !== PROTEIN_KEY && !taken.has(item.key)).filter(
      (item) => !needle || item.label.toLowerCase().includes(needle) || item.key.includes(needle),
    );
  }, [catalogQuery, settings.nutrientGoals]);

  const catalogGroups = useMemo(() => {
    const groups: Array<{ id: 'macro' | 'vitamin' | 'mineral'; label: string; items: typeof catalogChoices }> = [
      { id: 'macro', label: 'Macros', items: [] },
      { id: 'vitamin', label: 'Vitamins', items: [] },
      { id: 'mineral', label: 'Minerals', items: [] },
    ];
    for (const item of catalogChoices) {
      groups.find((group) => group.id === item.group)?.items.push(item);
    }
    return groups.filter((group) => group.items.length > 0);
  }, [catalogChoices]);

  function saveGoals() {
    const value = Number(target);
    if (!Number.isFinite(value) || value < MIN_CALORIE_TARGET || value > MAX_CALORIE_TARGET) {
      setTargetError(`Use a target between ${MIN_CALORIE_TARGET} and ${MAX_CALORIE_TARGET.toLocaleString('en-US')}.`);
      return;
    }
    if (currentWaterMl <= 0) {
      setStatus('Water target needs to be more than 0.');
      return;
    }
    if (!hasTargetChanges) {
      return;
    }

    setTargetError(undefined);
    setCalorieTarget(Math.round(value), targetName);
    setProteinGoal({
      enabled: settings.proteinEnabled,
      dailyTarget: Math.max(1, parseOptionalAmount(proteinTarget) || 120),
    });
    setWaterGoal({ enabled: settings.waterEnabled, waterGoalMl: currentWaterMl });
    for (const goal of customGoals) {
      const nextTarget = parseOptionalAmount(customDraft[goal.key] ?? '');
      if (nextTarget > 0 && nextTarget !== goal.dailyTarget) {
        updateNutrientGoal(goal.key, { dailyTarget: nextTarget });
      }
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Home', { toast: 'Settings saved' });
  }

  function addCatalogGoal(key: string) {
    const item = getCatalogItem(key);
    if (!item) {
      return;
    }
    const added = addNutrientGoal({
      key: item.key,
      enabled: true,
      dailyTarget: item.defaultTarget,
    });
    if (!added) {
      Alert.alert('Limit reached', `You can track up to ${MAX_CUSTOM_NUTRIENTS} extra nutrients.`);
      return;
    }
    setCustomDraft((current) => ({ ...current, [item.key]: String(item.defaultTarget) }));
    setPickerOpen(false);
    setCatalogQuery('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function exportJson() {
    try {
      await shareTextFile(
        `calories-backup-${new Date().toISOString().slice(0, 10)}.json`,
        toJsonBackup({
          settings,
          targets,
          nutrientTargets,
          waterTargets,
          entries,
          waterLogs,
          savedFoods,
        }),
        'application/json',
      );
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unable to export JSON.');
    }
  }

  async function exportCsv() {
    try {
      await shareTextFile(
        `calories-${new Date().toISOString().slice(0, 10)}.csv`,
        toCsv(entries),
        'text/csv',
      );
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unable to export CSV.');
    }
  }

  async function shareFoods() {
    try {
      await shareTextFile('calories-foods.json', toFoodLibraryFile(savedFoods), 'application/json');
    } catch (error) {
      Alert.alert('Share failed', error instanceof Error ? error.message : 'Unable to share foods.');
    }
  }

  async function importFoods() {
    try {
      const text = await pickTextFile();
      if (!text) {
        return;
      }
      const file = parseFoodLibraryFile(text);
      Alert.alert(
        'Import foods?',
        `${file.foods.length} foods in this file. Your diary and goals stay as they are.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => {
              replaceFoodLibrary(file.foods);
              setStatus(`Replaced library with ${file.foods.length} foods.`);
            },
          },
          {
            text: 'Merge',
            onPress: () => {
              Alert.alert('If a food already exists', 'Keep your version, or use the incoming one?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Keep mine',
                  onPress: () => {
                    const result = mergeFoodLibrary(file.foods, 'mine');
                    setStatus(`Merged foods: ${result.added} added, ${result.skipped} kept yours.`);
                  },
                },
                {
                  text: 'Use incoming',
                  onPress: () => {
                    const result = mergeFoodLibrary(file.foods, 'incoming');
                    setStatus(`Merged foods: ${result.added} added, ${result.replaced} updated.`);
                  },
                },
              ]);
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert('Import failed', error instanceof Error ? error.message : 'Unable to import this food file.');
    }
  }

  async function importData() {
    try {
      const text = await pickTextFile();
      if (!text) {
        return;
      }

      const trimmed = text.trim();
      if (trimmed.startsWith('{')) {
        try {
          const foodsFile = parseFoodLibraryFile(trimmed);
          Alert.alert(
            'This is a food library',
            `Use Import foods for library files. This one has ${foodsFile.foods.length} foods.`,
          );
          return;
        } catch {
          // Not a foods file.
        }

        const payload = parseImportedJson(trimmed);
        if (!isSettings(payload.settings)) {
          throw new Error('This backup is missing valid settings.');
        }
        if (!payload.entries.every((entry) => entry.id && entry.name && isValidDateKey(entry.date) && Number.isFinite(entry.calories))) {
          throw new Error('This backup contains invalid food entries.');
        }
        Alert.alert(
          'Replace all data?',
          'Importing a JSON backup replaces your current entries, targets, and settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Replace',
              style: 'destructive',
              onPress: () => {
                importBackup(payload);
                setTarget(String(payload.settings.calorieTarget));
                setTargetName(payload.settings.targetName);
                setStatus('Backup imported.');
              },
            },
          ],
        );
        return;
      }

      const incoming = parseImportedCsv(trimmed);
      Alert.alert('Import CSV entries?', `This will add ${incoming.length} food entries to your log.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            const count = importEntries(incoming);
            setStatus(`Imported ${count} food entries.`);
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Import failed', error instanceof Error ? error.message : 'Unable to import this file.');
    }
  }

  function confirmClear() {
    Alert.alert(
      'Clear all data?',
      'This deletes every food entry, water log, food library, and tracking start date. You will go through setup again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear everything',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ],
    );
  }

  return (
    <Screen scroll>
      <PageHeader title="Settings" showBack onBack={() => navigation.navigate('Home')} />

      <SettingsGroup icon="target" title="Daily goals" subtitle="Calories, protein, water, and extras">
        <View style={styles.pad}>
          <TextField
            label="Calories"
            value={target}
            onChangeText={(value) => {
              setTarget(value.replace(/[^\d]/g, ''));
              setTargetError(undefined);
            }}
            keyboardType="number-pad"
            error={targetError}
          />
          <TextField label="Target name" value={targetName} onChangeText={setTargetName} />
        </View>

        <View style={[styles.divider, { borderColor: theme.colors.border }]} />

        <View style={styles.pad}>
          <ToggleRow
            label="Protein"
            description="Shows a side bar on Home and a field when adding food"
            value={settings.proteinEnabled}
            onChange={(enabled) =>
              setProteinGoal({
                enabled,
                dailyTarget: Math.max(1, parseOptionalAmount(proteinTarget) || 120),
              })
            }
          />
          {settings.proteinEnabled ? (
            <TextField
              label="Protein target (g)"
              value={proteinTarget}
              onChangeText={(value) => setProteinTarget(value.replace(/[^\d.]/g, ''))}
              keyboardType="decimal-pad"
            />
          ) : null}
        </View>

        <View style={[styles.divider, { borderColor: theme.colors.border }]} />

        <View style={styles.pad}>
          <ToggleRow
            label="Water"
            description="Tracked separately with a side bar and quick add"
            value={settings.waterEnabled}
            onChange={(enabled) => setWaterGoal({ enabled, waterGoalMl: Math.max(ML_PER_GLASS, currentWaterMl) })}
          />
          {settings.waterEnabled ? (
            <View style={styles.waterBlock}>
              <SegmentedControl
                accessibilityLabel="Water unit"
                value={waterUnit}
                onChange={(next) => {
                  const ml = currentWaterMl || settings.waterGoalMl;
                  setWaterUnit(next);
                  setWaterAmount(next === 'glasses' ? String(mlToGlasses(ml)) : String(ml));
                }}
                options={[
                  { value: 'glasses', label: 'Glasses' },
                  { value: 'ml', label: 'ml' },
                ]}
              />
              <TextField
                label={waterUnit === 'glasses' ? 'Glasses a day' : 'Millilitres a day'}
                value={waterAmount}
                onChangeText={(value) => setWaterAmount(value.replace(/[^\d.]/g, ''))}
                keyboardType="decimal-pad"
              />
              <AppText variant="caption" color={theme.colors.textSubtle}>
                1 glass = {ML_PER_GLASS} ml
                {waterUnit === 'glasses' && currentWaterMl > 0 ? ` · ${currentWaterMl} ml` : ''}
              </AppText>
            </View>
          ) : null}
        </View>

        {customGoals.length > 0 ? (
          <>
            <View style={[styles.divider, { borderColor: theme.colors.border }]} />
            <View style={styles.pad}>
              {customGoals.map((goal) => {
                const catalog = getCatalogItem(goal.key);
                return (
                  <View key={goal.key} style={[styles.customGoal, { borderColor: theme.colors.border }]}>
                    <View style={styles.customHeader}>
                      <AppText variant="bodyMedium">{catalog?.label ?? goal.key}</AppText>
                      <Pressable
                        onPress={() =>
                          Alert.alert(`Remove ${catalog?.label ?? goal.key}?`, 'Past food values stay in your diary.', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: () => {
                                removeNutrientGoal(goal.key);
                                setCustomDraft((current) => {
                                  const next = { ...current };
                                  delete next[goal.key];
                                  return next;
                                });
                              },
                            },
                          ])
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${catalog?.label ?? goal.key}`}
                      >
                        <Feather name="trash-2" size={16} color={theme.colors.danger} />
                      </Pressable>
                    </View>
                    <TextField
                      label={`Daily target (${catalog?.unit ?? 'g'})`}
                      value={customDraft[goal.key] ?? String(goal.dailyTarget)}
                      onChangeText={(value) =>
                        setCustomDraft((current) => ({ ...current, [goal.key]: value.replace(/[^\d.]/g, '') }))
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>
                );
              })}
            </View>
          </>
        ) : null}

        {customGoalCount(settings.nutrientGoals) < MAX_CUSTOM_NUTRIENTS ? (
          <>
            <View style={[styles.divider, { borderColor: theme.colors.border }]} />
            <Pressable
              onPress={() => setPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Add a nutrient"
              style={({ pressed }) => [
                styles.addNutrient,
                { backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent' },
              ]}
            >
              <Feather name="plus-circle" size={18} color={theme.colors.accent} />
              <AppText variant="bodyMedium" color={theme.colors.accent}>
                Add a nutrient
              </AppText>
            </Pressable>
          </>
        ) : null}

        <View style={[styles.divider, { borderColor: theme.colors.border }]} />
        <View style={styles.pad}>
          <AppText variant="caption" color={theme.colors.textSubtle}>
            Changing today’s target does not rewrite older days.
          </AppText>
          <Button label="Save goals" onPress={saveGoals} disabled={!hasTargetChanges} />
        </View>
      </SettingsGroup>

      <SettingsGroup icon="sliders" title="Preferences" subtitle="Calendar and appearance">
        <View style={styles.pad}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Week starts on
          </AppText>
          <SegmentedControl
            accessibilityLabel="First day of the week"
            value={String(settings.weekStartsOn)}
            onChange={(value) => updateSettings({ weekStartsOn: Number(value) as WeekStartsOn })}
            options={[
              { value: '1', label: 'Monday' },
              { value: '0', label: 'Sunday' },
            ]}
          />
        </View>
        <View style={[styles.divider, { borderColor: theme.colors.border }]} />
        <View style={styles.pad}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Theme
          </AppText>
          <SegmentedControl
            accessibilityLabel="Theme"
            value={settings.theme}
            onChange={(value) => updateSettings({ theme: value as ThemePreference })}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </View>
      </SettingsGroup>

      <SettingsGroup icon="book-open" title="Food library" subtitle={`${savedFoods.length} saved foods on this device`}>
        <SettingsRow icon="share-2" label="Share foods" detail="Export your saved foods as a file" onPress={() => void shareFoods()} />
        <SettingsRow icon="download" label="Import foods" detail="Replace your list or merge new foods" onPress={() => void importFoods()} showChevron={false} />
      </SettingsGroup>

      <SettingsGroup icon="hard-drive" title="Backup & restore" subtitle="Full diary export or CSV meals">
        <SettingsRow icon="upload" label="Export JSON backup" detail="Save a full backup you can restore later" onPress={() => void exportJson()} />
        <SettingsRow icon="file-text" label="Export CSV" detail="Save your meals in a spreadsheet-ready file" onPress={() => void exportCsv()} />
        <SettingsRow icon="folder" label="Import data" detail="Import a JSON backup or a CSV of meals" onPress={() => void importData()} showChevron={false} />
      </SettingsGroup>

      <SettingsGroup icon="alert-triangle" title="Danger zone" subtitle="Cannot be undone" tone="danger">
        <SettingsRow
          icon="trash-2"
          label="Clear all data"
          detail="Reset app and start over"
          tone="danger"
          onPress={confirmClear}
          showChevron={false}
        />
      </SettingsGroup>

      <NutrientPickerSheet
        visible={pickerOpen}
        query={catalogQuery}
        onQueryChange={setCatalogQuery}
        groups={catalogGroups}
        onSelect={addCatalogGoal}
        onClose={() => {
          setPickerOpen(false);
          setCatalogQuery('');
        }}
      />

      {status ? (
        <Card style={styles.status}>
          <AppText variant="body">{status}</AppText>
          <Pressable onPress={() => setStatus(null)} accessibilityRole="button" accessibilityLabel="Dismiss message">
            <AppText variant="caption" color={theme.colors.accent}>
              Dismiss
            </AppText>
          </Pressable>
        </Card>
      ) : null}

      <AppText variant="caption" color={theme.colors.textSubtle} style={styles.note}>
        Calories are calculated from your food entries. This app does not provide medical or nutritional advice.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    padding: 14,
    gap: 12,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  waterBlock: {
    gap: 12,
  },
  customGoal: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addNutrient: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  status: {
    marginBottom: 16,
    gap: 8,
  },
  note: {
    marginBottom: 32,
  },
});
