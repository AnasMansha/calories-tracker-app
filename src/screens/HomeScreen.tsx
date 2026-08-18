import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DayGoals } from '../components/DayGoals';
import { MealSectionList } from '../components/MealSectionList';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { HomeHeader } from '../components/ui/PageHeader';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import { ToastBanner } from '../components/ui/ToastBanner';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useEntriesForDate } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatShortDate, greetingForHour, todayKey } from '../utils/dates';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<HomeNavigation>();
  const route = useRoute<RouteProp<MainTabParamList, 'Home'>>();
  const date = todayKey();
  const entries = useEntriesForDate(date);
  const [toastVisible, setToastVisible] = useState(false);
  const toastMessage = route.params?.toast ?? '';

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    setToastVisible(true);
    navigation.setParams({ toast: undefined });
    const timeout = setTimeout(() => setToastVisible(false), 2600);
    return () => clearTimeout(timeout);
  }, [navigation, toastMessage]);

  return (
    <Screen
      scroll
      footer={
        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <Button
            label="+ Add Food"
            onPress={() => navigation.navigate('AddFood', { date })}
            accessibilityHint="Log a meal or snack for today"
          />
        </View>
      }
    >
      <HomeHeader
        greeting={greetingForHour()}
        dateLabel={formatShortDate(date)}
        onSettingsPress={() => navigation.navigate('Settings')}
      />

      <ToastBanner message={toastMessage} visible={toastVisible} />

      <DayGoals date={date} />

      <View style={styles.meals}>
        <AppText variant="subtitle">Today’s meals</AppText>
        {entries.length === 0 ? (
          <EmptyState title="Nothing logged yet" message="Add your first meal to start tracking today." />
        ) : (
          <MealSectionList
            entries={entries}
            onEntryPress={(entry) => navigation.navigate('EditFood', { id: entry.id })}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meals: {
    gap: 16,
    paddingBottom: 16,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
