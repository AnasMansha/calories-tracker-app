import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './ui/AppText';
import { Card } from './ui/Card';
import { FadeIn } from './ui/FadeIn';

interface StatItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

interface StatSummaryGridProps {
  items: StatItem[];
}

export function StatSummaryGrid({ items }: StatSummaryGridProps) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {items.map((item, index) => {
        const toneColor =
          item.tone === 'success'
            ? theme.colors.success
            : item.tone === 'warning'
              ? theme.colors.warning
              : item.tone === 'danger'
                ? theme.colors.danger
                : theme.colors.accent;

        return (
          <FadeIn key={item.label} delay={index * 40} style={styles.cell}>
            <Card style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Feather name={item.icon} size={16} color={toneColor} />
              </View>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {item.label}
              </AppText>
              <AppText variant="bodyMedium" style={styles.value}>
                {item.value}
              </AppText>
            </Card>
          </FadeIn>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: '48%',
    flexGrow: 1,
  },
  card: {
    gap: 6,
    minHeight: 112,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});
