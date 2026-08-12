import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { InsightItem } from '../utils/insights';
import { AppText } from './ui/AppText';
import { Card } from './ui/Card';
import { FadeIn } from './ui/FadeIn';

const ICONS: Record<InsightItem['id'], keyof typeof Feather.glyphMap> = {
  average: 'activity',
  within: 'check-circle',
  highest: 'trending-up',
  lowest: 'trending-down',
};

interface InsightsListProps {
  items: InsightItem[];
}

export function InsightsList({ items }: InsightsListProps) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <FadeIn key={item.id} delay={index * 50}>
          <Card style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentSoft }]}>
              <Feather name={ICONS[item.id]} size={18} color={theme.colors.accent} />
            </View>
            <View style={styles.copy}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {item.label}
              </AppText>
              <AppText variant="bodyMedium">{item.value}</AppText>
              {item.detail ? (
                <AppText variant="caption" color={theme.colors.textSubtle}>
                  {item.detail}
                </AppText>
              ) : null}
            </View>
          </Card>
        </FadeIn>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
