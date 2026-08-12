import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from './AppText';

interface ToastBannerProps {
  message: string;
  visible: boolean;
}

export function ToastBanner({ message, visible }: ToastBannerProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -8,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, visible]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.wrap,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: theme.colors.accentSoft,
          borderColor: theme.colors.accent,
        },
        !visible && styles.hidden,
      ]}
    >
      <AppText variant="bodyMedium" color={theme.colors.accent}>
        {message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  hidden: {
    position: 'absolute',
    top: -999,
  },
});
