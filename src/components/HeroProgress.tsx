import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { DaySummary, NutrientDaySummary } from '../types';
import { remainingNutrientLabel } from '../utils/nutrients';
import { formatWater } from '../utils/water';
import { CalorieRing } from './CalorieRing';
import { SideMetricBar } from './SideMetricBar';
import { StatusPill } from './StatusPill';
import { AppText } from './ui/AppText';

interface HeroProgressProps {
  summary: DaySummary;
  targetName: string;
  ringSize?: number;
  caption?: string;
  protein?: NutrientDaySummary | null;
  water?: { enabled: boolean; consumedMl: number; targetMl: number } | null;
  onProteinPress?: () => void;
  onWaterPress?: () => void;
  onWaterAddPress?: () => void;
}

export function HeroProgress({
  summary,
  targetName,
  ringSize = 236,
  caption = 'Today’s calories',
  protein,
  water,
  onProteinPress,
  onWaterPress,
  onWaterAddPress,
}: HeroProgressProps) {
  const theme = useTheme();
  const proteinColor = theme.dark ? '#D4A574' : '#8B5E3C';
  const proteinRatio = protein && protein.target > 0 ? protein.consumed / protein.target : 0;
  const waterRatio = water && water.targetMl > 0 ? water.consumedMl / water.targetMl : 0;

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color={theme.colors.textMuted} align="center">
        {caption}
      </AppText>
      <View style={styles.row}>
        <View style={styles.side}>
          {protein ? (
            <SideMetricBar
              icon="arm-flex"
              iconFamily="material-community"
              color={proteinColor}
              ratio={proteinRatio}
              percent={(proteinRatio > 0 ? proteinRatio : 0) * 100}
              footer="percent"
              onPress={() => onProteinPress?.()}
              accessibilityLabel={`Protein, ${remainingNutrientLabel(protein)}. Opens details.`}
            />
          ) : null}
        </View>

        <CalorieRing summary={summary} targetName={targetName} size={ringSize} />

        <View style={styles.side}>
          {water?.enabled ? (
            <SideMetricBar
              icon="droplet"
              color={theme.colors.water}
              ratio={waterRatio}
              footer="add"
              onPress={() => onWaterPress?.()}
              onAddPress={onWaterAddPress}
              accessibilityLabel={`Water, ${formatWater(water.consumedMl)}. Opens details.`}
            />
          ) : null}
        </View>
      </View>
      <StatusPill summary={summary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  side: {
    width: 62,
    alignItems: 'center',
  },
});
