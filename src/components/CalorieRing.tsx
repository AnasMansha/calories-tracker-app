import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../theme/ThemeProvider';
import type { DaySummary } from '../types';
import { formatCalories, getProgressRatio } from '../utils/calories';
import { statusPalette } from './StatusPill';
import { AppText } from './ui/AppText';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieRingProps {
  summary: DaySummary;
  targetName: string;
  size?: number;
}

export function CalorieRing({ summary, targetName, size = 236 }: CalorieRingProps) {
  const theme = useTheme();
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = getProgressRatio(summary.consumed, summary.target);
  const animated = useRef(new Animated.Value(0)).current;
  const palette = statusPalette(summary.status, theme.colors);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: progress,
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [animated, progress]);

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.wrap} accessible accessibilityRole="text">
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.ringTrack}
            strokeWidth={stroke}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.foreground}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        <AppText variant="label" color={theme.colors.textMuted}>
          {targetName}
        </AppText>
        <AppText
          variant="hero"
          align="center"
          maxFontSizeMultiplier={1.2}
          style={styles.hero}
          accessibilityLabel={`${formatCalories(summary.consumed)} calories consumed`}
        >
          {formatCalories(summary.consumed)}
        </AppText>
        <AppText variant="body" color={theme.colors.textMuted} align="center">
          / {formatCalories(summary.target)} kcal
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
});
