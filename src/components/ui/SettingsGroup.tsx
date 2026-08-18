import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from './AppText';
import { Card } from './Card';

interface SettingsGroupProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: 'default' | 'danger';
}

export function SettingsGroup({ icon, title, subtitle, children, tone = 'default' }: SettingsGroupProps) {
  const theme = useTheme();
  const iconColor = tone === 'danger' ? theme.colors.danger : theme.colors.accent;
  const iconBg = tone === 'danger' ? theme.colors.dangerSoft : theme.colors.accentSoft;

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Feather name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.copy}>
          <AppText variant="subtitle">{title}</AppText>
          {subtitle ? (
            <AppText variant="caption" color={theme.colors.textMuted}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 34,
    gap: 12,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  card: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
});
