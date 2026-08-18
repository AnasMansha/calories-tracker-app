import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './ui/AppText';

interface SideMetricBarProps {
  icon: string;
  iconFamily?: 'feather' | 'material-community';
  color: string;
  ratio: number;
  accessibilityLabel: string;
  onPress: () => void;
  footer: 'percent' | 'add';
  percent?: number;
  onAddPress?: () => void;
}

const BAR_HEIGHT = 148;
const BAR_WIDTH = 14;

export function SideMetricBar({
  icon,
  iconFamily = 'feather',
  color,
  ratio,
  accessibilityLabel,
  onPress,
  footer,
  percent = 0,
  onAddPress,
}: SideMetricBarProps) {
  const theme = useTheme();
  const fill = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(Math.max(ratio, 0), 1);

  useEffect(() => {
    Animated.spring(fill, {
      toValue: clamped,
      useNativeDriver: false,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [clamped, fill]);

  const fillHeight = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const IconComponent = iconFamily === 'material-community' ? MaterialCommunityIcons : Feather;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        style={({ pressed }) => [
          styles.pressArea,
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={[styles.iconBadge, { backgroundColor: theme.colors.surface, borderColor: color }]}>
          <IconComponent name={icon as never} size={16} color={color} />
        </View>

        <View style={[styles.track, { backgroundColor: theme.colors.ringTrack, borderColor: color }]}>
          <Animated.View style={[styles.fill, { height: fillHeight, backgroundColor: color }]} />
        </View>
      </Pressable>

      {footer === 'percent' ? (
        <AppText variant="caption" color={color} style={styles.percent}>
          {Math.round(percent)}%
        </AppText>
      ) : (
        <Pressable
          onPress={onAddPress}
          accessibilityRole="button"
          accessibilityLabel="Add water"
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: color,
              opacity: pressed ? 0.86 : 1,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
          ]}
        >
          <Feather name="plus" size={16} color={theme.colors.onAccent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 58,
    alignItems: 'center',
    gap: 8,
  },
  pressArea: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: BAR_WIDTH,
    height: 162,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: 999,
  },
  percent: {
    fontVariant: ['tabular-nums'],
    fontSize: 11,
    lineHeight: 14,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
