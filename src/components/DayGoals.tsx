import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { getCatalogItem } from '../data/nutrientCatalog';
import { useAppStore, useDaySummary, useEntriesForDate, useNutrientSummaries, useWaterDay } from '../store/useAppStore';
import type { NutrientDaySummary } from '../types';
import { formatDisplayTime } from '../utils/dates';
import {
  PROTEIN_KEY,
  foodsContributingNutrient,
  formatAmount,
  remainingNutrientLabel,
} from '../utils/nutrients';
import { formatWater, waterForDate } from '../utils/water';
import { FadeIn } from './ui/FadeIn';
import { HeroProgress } from './HeroProgress';
import { NutrientBars } from './NutrientBars';
import { NutrientDetailSheet, type NutrientDetailRow } from './NutrientDetailSheet';
import { WaterAddSheet } from './WaterAddSheet';

interface DayGoalsProps {
  date: string;
  ringSize?: number;
  caption?: string;
}

type Sheet =
  | { kind: 'nutrient'; summary: NutrientDaySummary }
  | { kind: 'water' }
  | { kind: 'addWater' }
  | null;

export function DayGoals({ date, ringSize, caption }: DayGoalsProps) {
  const summary = useDaySummary(date);
  const entries = useEntriesForDate(date);
  const nutrientSummaries = useNutrientSummaries(date);
  const water = useWaterDay(date);
  const waterLogs = useAppStore((state) => state.waterLogs);
  const addWater = useAppStore((state) => state.addWater);
  const undoLastWater = useAppStore((state) => state.undoLastWater);
  const targetName = useAppStore((state) => state.settings.targetName);
  const [sheet, setSheet] = useState<Sheet>(null);

  const protein = nutrientSummaries.find((item) => item.key === PROTEIN_KEY) ?? null;
  const extraNutrients = nutrientSummaries.filter((item) => item.key !== PROTEIN_KEY);

  const detail = useMemo(() => {
    if (sheet?.kind === 'water') {
      const logs = waterForDate(waterLogs, date);
      return {
        title: 'Water today',
        summary: `${formatWater(water.consumedMl)} of ${Math.round(water.targetMl)} ml`,
        rows: logs.map((log) => ({
          id: log.id,
          name: `Pour at ${formatDisplayTime(log.time)}`,
          amount: `${Math.round(log.amountMl)} ml`,
        })),
        emptyMessage: 'No water logged yet. Tap the plus button to add some.',
      };
    }
    if (sheet?.kind === 'nutrient') {
      const catalog = getCatalogItem(sheet.summary.key);
      const unit = sheet.summary.unit;
      const rows: NutrientDetailRow[] = foodsContributingNutrient(entries, sheet.summary.key).map((item) => ({
        id: item.id,
        name: item.name,
        amount: `${formatAmount(item.amount)} ${unit}`,
      }));
      return {
        title: catalog?.label ?? sheet.summary.key,
        summary: remainingNutrientLabel(sheet.summary),
        rows,
        emptyMessage: 'No foods logged today include this nutrient yet.',
      };
    }
    return null;
  }, [date, entries, sheet, water.consumedMl, water.targetMl, waterLogs]);

  return (
    <>
      <FadeIn style={styles.hero}>
        <HeroProgress
          summary={summary}
          targetName={targetName}
          ringSize={ringSize}
          caption={caption}
          protein={protein}
          water={water.enabled ? water : null}
          onProteinPress={() => protein && setSheet({ kind: 'nutrient', summary: protein })}
          onWaterPress={() => setSheet({ kind: 'water' })}
          onWaterAddPress={() => setSheet({ kind: 'addWater' })}
        />
      </FadeIn>

      {extraNutrients.length > 0 ? (
        <FadeIn delay={80} style={styles.section}>
          <NutrientBars summaries={extraNutrients} onPress={(item) => setSheet({ kind: 'nutrient', summary: item })} />
        </FadeIn>
      ) : null}

      <NutrientDetailSheet
        visible={detail !== null}
        title={detail?.title ?? ''}
        summary={detail?.summary ?? ''}
        rows={detail?.rows ?? []}
        emptyMessage={detail?.emptyMessage ?? ''}
        onClose={() => setSheet(null)}
      />

      <WaterAddSheet
        visible={sheet?.kind === 'addWater'}
        consumedMl={water.consumedMl}
        targetMl={water.targetMl}
        canUndo={water.canUndo}
        onAdd={(amountMl) => addWater({ date, amountMl })}
        onUndo={() => undoLastWater(date)}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
});
