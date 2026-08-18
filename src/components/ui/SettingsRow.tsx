import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from './AppText';

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  detail?: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
  showChevron?: boolean;
}

export function SettingsRow({
  icon,
  label,
  detail,
  onPress,
  tone = 'default',
  showChevron = true,
}: SettingsRowProps) {
  const theme = useTheme();
  const color = tone === 'danger' ? theme.colors.danger : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceMuted }]}>
        <Feather name={icon} size={16} color={tone === 'danger' ? theme.colors.danger : theme.colors.accent} />
      </View>
      <View style={styles.copy}>
        <AppText variant="bodyMedium" color={color}>
          {label}
        </AppText>
        {detail ? (
          <AppText variant="caption" color={theme.colors.textMuted}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {showChevron ? <Feather name="chevron-right" size={18} color={theme.colors.textSubtle} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
