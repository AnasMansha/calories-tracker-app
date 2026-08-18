import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getCatalogItem } from '../data/nutrientCatalog';
import { useTheme } from '../theme/ThemeProvider';
import { PROTEIN_KEY } from '../utils/nutrients';
import { AppText } from './ui/AppText';

export interface GoalOption {
  value: string;
  label: string;
}

interface GoalPickerProps {
  options: GoalOption[];
  value: string;
  onChange: (value: string) => void;
}

interface GoalTheme {
  color: string;
  icon: string;
  iconFamily?: 'feather' | 'material-community';
}

function goalTheme(key: string, colors: ReturnType<typeof useTheme>['colors'], dark: boolean): GoalTheme {
  if (key === 'calories') {
    return { color: colors.accent, icon: 'zap' };
  }
  if (key === PROTEIN_KEY) {
    return {
      color: dark ? '#E0B07A' : '#8B5E3C',
      icon: 'arm-flex',
      iconFamily: 'material-community',
    };
  }
  if (key === 'water') {
    return { color: colors.water, icon: 'droplet' };
  }
  const group = getCatalogItem(key)?.group;
  if (group === 'vitamin') {
    return { color: dark ? '#C4A6EA' : '#7B5EA7', icon: 'sun' };
  }
  if (group === 'mineral') {
    return { color: dark ? '#7DCECE' : '#3D8B8B', icon: 'hexagon' };
  }
  return { color: colors.warning, icon: 'pie-chart' };
}

export function GoalPicker({ options, value, onChange }: GoalPickerProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel="Metric to chart"
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const palette = goalTheme(option.value, theme.colors, theme.dark);
        const IconComponent =
          palette.iconFamily === 'material-community' ? MaterialCommunityIcons : Feather;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: selected ? palette.color : theme.colors.surface,
                borderColor: palette.color,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: selected ? 'rgba(255,255,255,0.22)' : `${palette.color}22`,
                },
              ]}
            >
              <IconComponent
                name={palette.icon as never}
                size={16}
                color={selected ? theme.colors.onAccent : palette.color}
              />
            </View>
            <AppText variant="label" color={selected ? theme.colors.onAccent : palette.color} numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function goalAccentColor(key: string, colors: ReturnType<typeof useTheme>['colors'], dark = false): string {
  return goalTheme(key, colors, dark).color;
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 2,
  },
  card: {
    minWidth: 96,
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
