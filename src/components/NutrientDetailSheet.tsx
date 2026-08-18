import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './ui/AppText';
import { BottomSheet } from './ui/BottomSheet';

export interface NutrientDetailRow {
  id: string;
  name: string;
  amount: string;
}

interface NutrientDetailSheetProps {
  visible: boolean;
  title: string;
  summary: string;
  rows: NutrientDetailRow[];
  emptyMessage: string;
  onClose: () => void;
}

export function NutrientDetailSheet({
  visible,
  title,
  summary,
  rows,
  emptyMessage,
  onClose,
}: NutrientDetailSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <AppText variant="caption" color={theme.colors.textMuted} align="center">
        {summary}
      </AppText>
      {rows.length === 0 ? (
        <AppText variant="body" color={theme.colors.textMuted} align="center" style={styles.empty}>
          {emptyMessage}
        </AppText>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {rows.map((row) => (
            <View key={row.id} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
              <AppText variant="bodyMedium" style={styles.name} numberOfLines={1}>
                {row.name}
              </AppText>
              <AppText variant="bodyMedium" color={theme.colors.accent} style={styles.amount}>
                {row.amount}
              </AppText>
            </View>
          ))}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 20,
  },
  list: {
    maxHeight: 360,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  name: {
    flex: 1,
  },
  amount: {
    fontVariant: ['tabular-nums'],
  },
});
