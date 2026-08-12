import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { AddFoodScreen } from '../screens/AddFoodScreen';
import { DayDetailScreen } from '../screens/DayDetailScreen';
import { EditFoodScreen } from '../screens/EditFoodScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from '../components/ui/AppText';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const hydrated = useAppStore((state) => state.hydrated);
  const onboarded = useAppStore((state) => state.onboarded);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!useAppStore.getState().hydrated) {
        useAppStore.setState({ hydrated: true });
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (!hydrated) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.colors.background }]}>
        <AppText variant="title">Calories</AppText>
        <ActivityIndicator color={theme.colors.accent} style={styles.spinner} />
      </View>
    );
  }

  // Avoid Android modal presentation white-flash on dismiss.
  const foodScreenOptions = {
    animation: 'slide_from_bottom' as const,
    presentation: Platform.OS === 'ios' ? ('modal' as const) : ('card' as const),
    contentStyle: { backgroundColor: theme.colors.background },
    detachPreviousScreen: false,
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {!onboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ contentStyle: { backgroundColor: theme.colors.background } }}
          />
          <Stack.Screen name="AddFood" component={AddFoodScreen} options={foodScreenOptions} />
          <Stack.Screen name="EditFood" component={EditFoodScreen} options={foodScreenOptions} />
          <Stack.Screen
            name="DayDetail"
            component={DayDetailScreen}
            options={{
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 16,
  },
});
