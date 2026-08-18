import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { formatWater, glassesToMl, ML_PER_GLASS } from '../utils/water';
import { AppText } from './ui/AppText';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { TextField } from './ui/TextField';

interface WaterAddSheetProps {
  visible: boolean;
  consumedMl: number;
  targetMl: number;
  canUndo: boolean;
  onAdd: (amountMl: number) => void;
  onUndo: () => void;
  onClose: () => void;
}

export function WaterAddSheet({
  visible,
  consumedMl,
  targetMl,
  canUndo,
  onAdd,
  onUndo,
  onClose,
}: WaterAddSheetProps) {
  const theme = useTheme();
  const [custom, setCustom] = useState('');

  function add(amountMl: number) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd(amountMl);
    setCustom('');
    onClose();
  }

  const options = [
    { label: '+1 glass', detail: `${ML_PER_GLASS} ml`, amount: ML_PER_GLASS },
    { label: '+2 glasses', detail: `${glassesToMl(2)} ml`, amount: glassesToMl(2) },
  ];

  return (
    <BottomSheet visible={visible} title="Add water" onClose={onClose}>
      <AppText variant="caption" color={theme.colors.textMuted} align="center">
        {formatWater(consumedMl)} of {Math.round(targetMl)} ml
      </AppText>

      <View style={styles.options}>
        {options.map((option) => (
          <Pressable
            key={option.label}
            onPress={() => add(option.amount)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={[styles.optionIcon, { backgroundColor: theme.colors.waterSoft }]}>
              <Feather name="droplet" size={14} color={theme.colors.water} />
            </View>
            <View style={styles.optionCopy}>
              <AppText variant="bodyMedium">
                {option.label}
              </AppText>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {option.detail}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>

      <TextField
        label="Custom amount (ml)"
        value={custom}
        onChangeText={(value) => setCustom(value.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
        placeholder="250"
      />
      <Button
        label="Add custom"
        onPress={() => {
          const amount = Number(custom);
          if (amount > 0) {
            add(amount);
          }
        }}
        disabled={!custom || Number(custom) <= 0}
      />

      {canUndo ? (
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onUndo();
          }}
          accessibilityRole="button"
          accessibilityLabel="Undo last water"
        >
          <AppText variant="caption" color={theme.colors.textMuted} align="center">
            Undo last entry
          </AppText>
        </Pressable>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  optionIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: {
    alignItems: 'center',
    gap: 1,
  },
});
