import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function PageHeader({ title, subtitle, showBack, onBack, rightAction }: PageHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      {showBack ? (
        <IconButton icon="chevron-left" label="Go back" onPress={onBack ?? (() => undefined)} />
      ) : (
        <View style={styles.side} />
      )}
      <View style={styles.center}>
        <AppText variant="subtitle" align="center" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={theme.colors.textMuted} align="center" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {rightAction ?? <View style={styles.side} />}
    </View>
  );
}

interface HomeHeaderProps {
  greeting: string;
  dateLabel: string;
  onSettingsPress: () => void;
}

export function HomeHeader({ greeting, dateLabel, onSettingsPress }: HomeHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.homeWrap}>
      <View style={styles.homeCopy}>
        <AppText variant="title" style={styles.greeting}>
          {greeting}
        </AppText>
        <View style={[styles.datePill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Feather name="calendar" size={14} color={theme.colors.accent} />
          <AppText variant="label" color={theme.colors.textMuted}>
            {dateLabel}
          </AppText>
        </View>
      </View>
      <Pressable
        onPress={onSettingsPress}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        style={({ pressed }) => [
          styles.settingsButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <Feather name="settings" size={20} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 4,
    gap: 8,
  },
  center: {
    flex: 1,
    gap: 2,
  },
  side: {
    width: 44,
  },
  homeWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
    gap: 12,
  },
  homeCopy: {
    flex: 1,
    gap: 10,
  },
  greeting: {
    letterSpacing: -0.8,
  },
  datePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
