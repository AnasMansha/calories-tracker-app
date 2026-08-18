import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { DayGoals } from '../components/DayGoals';
import { MealSectionList } from '../components/MealSectionList';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import type { RootStackParamList } from '../navigation/types';
import { useEntriesForDate } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatDisplayDate, isToday } from '../utils/dates';

export function DayDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DayDetail'>>();
  const { date } = route.params;
  const entries = useEntriesForDate(date);

  return (
    <Screen
      scroll
      edges={['top', 'bottom']}
      footer={
        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <Button
            label="+ Add Food"
            onPress={() => navigation.navigate('AddFood', { date })}
            accessibilityHint={`Log food for ${formatDisplayDate(date)}`}
          />
        </View>
      }
    >
      <View style={styles.header}>
        <IconButton icon="arrow-left" label="Back to history" onPress={() => navigation.goBack()} />
        <View style={styles.heading}>
          <AppText variant="caption" color={theme.colors.textMuted} align="center">
            {isToday(date) ? 'Today' : 'Day details'}
          </AppText>
          <AppText variant="subtitle" align="center">
            {formatDisplayDate(date)}
          </AppText>
        </View>
        <View style={styles.side} />
      </View>

      <DayGoals date={date} ringSize={200} caption="Calories" />

      <View style={styles.meals}>
        <AppText variant="subtitle">Meals</AppText>
        {entries.length === 0 ? (
          <EmptyState title="Nothing logged" message="Add food to this day to include it in your totals." />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 16,
  },
  heading: {
    flex: 1,
  },
  side: {
    width: 44,
  },
  meals: {
    gap: 16,
    paddingBottom: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
