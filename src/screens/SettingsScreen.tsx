import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Screen } from '../components/ui/Screen';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { AppText } from '../components/ui/AppText';
import { TextField } from '../components/ui/TextField';
import type { MainTabParamList } from '../navigation/types';
import { MAX_CALORIE_TARGET, MIN_CALORIE_TARGET } from '../constants';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemePreference, WeekStartsOn } from '../types';
import { isValidDateKey } from '../utils/dates';
import { isSettings, parseImportedCsv, parseImportedJson, toCsv, toJsonBackup } from '../utils/export';
import { pickTextFile, shareTextFile } from '../utils/files';

export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const settings = useAppStore((state) => state.settings);
  const entries = useAppStore((state) => state.entries);
  const targets = useAppStore((state) => state.targets);
  const setCalorieTarget = useAppStore((state) => state.setCalorieTarget);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const importBackup = useAppStore((state) => state.importBackup);
  const importEntries = useAppStore((state) => state.importEntries);
  const clearAllData = useAppStore((state) => state.clearAllData);
  const [target, setTarget] = useState(String(settings.calorieTarget));
  const [targetName, setTargetName] = useState(settings.targetName);
  const [status, setStatus] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | undefined>();

  const hasTargetChanges = useMemo(() => {
    const parsed = Number(target);
    return (
      parsed !== settings.calorieTarget ||
      (targetName.trim() || 'Daily Goal') !== settings.targetName
    );
  }, [settings.calorieTarget, settings.targetName, target, targetName]);

  function saveTarget() {
    const value = Number(target);
    if (!Number.isFinite(value) || value < MIN_CALORIE_TARGET || value > MAX_CALORIE_TARGET) {
      setTargetError(`Use a target between ${MIN_CALORIE_TARGET} and ${MAX_CALORIE_TARGET.toLocaleString('en-US')}.`);
      return;
    }
    if (!hasTargetChanges) {
      return;
    }

    setTargetError(undefined);
    setCalorieTarget(Math.round(value), targetName);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Home', { toast: 'Settings saved' });
  }

  async function exportJson() {
    try {
      await shareTextFile(
        `calories-backup-${new Date().toISOString().slice(0, 10)}.json`,
        toJsonBackup({ settings, targets, entries }),
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

  async function importData() {
    try {
      const text = await pickTextFile();
      if (!text) {
        return;
      }

      const trimmed = text.trim();
      if (trimmed.startsWith('{')) {
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
      'This deletes every food entry, target history, and tracking start date. You will go through setup again.',
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
      <PageHeader
        title="Settings"
        showBack
        onBack={() => navigation.navigate('Home')}
      />

      <Section title="Daily calorie target">
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
        <AppText variant="caption" color={theme.colors.textSubtle}>
          Changing today’s target does not rewrite older days. Each day uses the target that was in effect on that date.
        </AppText>
        <Button label="Save target" onPress={saveTarget} disabled={!hasTargetChanges} />
      </Section>

      <Section title="Week starts on">
        <SegmentedControl
          accessibilityLabel="First day of the week"
          value={String(settings.weekStartsOn)}
          onChange={(value) => updateSettings({ weekStartsOn: Number(value) as WeekStartsOn })}
          options={[
            { value: '1', label: 'Monday' },
            { value: '0', label: 'Sunday' },
          ]}
        />
      </Section>

      <Section title="Appearance">
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
      </Section>

      <Section title="Data">
        <AppText variant="caption" color={theme.colors.textMuted}>
          Export a JSON backup or a simple CSV. JSON can restore everything; CSV adds food entries.
        </AppText>
        <Button label="Export JSON backup" variant="secondary" onPress={() => void exportJson()} />
        <Button label="Export CSV" variant="secondary" onPress={() => void exportCsv()} />
        <Button label="Import data" variant="secondary" onPress={() => void importData()} />
        <Button label="Clear all data" variant="danger" onPress={confirmClear} />
      </Section>

      {status ? (
        <Card>
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <AppText variant="label" color={theme.colors.textMuted}>
        {title}
      </AppText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
    gap: 10,
  },
  sectionBody: {
    gap: 12,
  },
  note: {
    marginBottom: 32,
  },
});
