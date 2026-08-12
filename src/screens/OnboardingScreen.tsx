import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import { TextField } from '../components/ui/TextField';
import {
  DEFAULT_CALORIE_TARGET,
  MAX_CALORIE_TARGET,
  MIN_CALORIE_TARGET,
} from '../constants';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';

export function OnboardingScreen() {
  const theme = useTheme();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [target, setTarget] = useState(String(DEFAULT_CALORIE_TARGET));
  const [targetName, setTargetName] = useState('Daily Goal');
  const [error, setError] = useState<string | undefined>();

  function handleContinue() {
    const value = Number(target);
    if (!Number.isFinite(value) || value < MIN_CALORIE_TARGET || value > MAX_CALORIE_TARGET) {
      setError(`Choose a target between ${MIN_CALORIE_TARGET} and ${MAX_CALORIE_TARGET.toLocaleString('en-US')}.`);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding({
      calorieTarget: Math.round(value),
      targetName,
    });
  }

  return (
    <Screen scroll edges={['top', 'bottom']} footer={
      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} />
      </View>
    }>
      <View style={styles.content}>
        <View style={styles.copy}>
          <AppText variant="label" color={theme.colors.accent}>
            Calories
          </AppText>
          <AppText variant="title">Track calories,{'\n'}simply.</AppText>
          <AppText variant="body" color={theme.colors.textMuted} style={styles.subtitle}>
            Set a daily target, log what you eat, and see how the day is going.
          </AppText>
        </View>

        <TextField
          label="Daily calorie target"
          value={target}
          onChangeText={(value) => {
            setTarget(value.replace(/[^\d]/g, ''));
            setError(undefined);
          }}
          keyboardType="number-pad"
          large
          error={error}
        />
        <TextField
          label="Target name"
          value={targetName}
          onChangeText={setTargetName}
          placeholder="Daily Goal"
        />
        <AppText variant="caption" color={theme.colors.textSubtle}>
          You can change this later in Settings.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 32,
    gap: 20,
  },
  copy: {
    gap: 12,
    marginBottom: 12,
  },
  subtitle: {
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
