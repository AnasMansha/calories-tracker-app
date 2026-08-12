import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { InteractionManager, Keyboard, StyleSheet, View } from 'react-native';

import { FoodForm } from '../components/FoodForm';
import { IconButton } from '../components/ui/IconButton';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { todayKey } from '../utils/dates';

export function AddFoodScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'AddFood'>>();
  const addFood = useAppStore((state) => state.addFood);
  const date = route.params?.date ?? todayKey();

  function close() {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    });
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Screen edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.side}>
            <IconButton icon="x" label="Close" onPress={close} />
          </View>
          <AppText variant="subtitle">Add food</AppText>
          <View style={styles.side} />
        </View>
        <FoodForm
          defaultDate={date}
          showDateTime={date !== todayKey()}
          submitLabel="Save food"
          onSubmit={(values) => {
            addFood(values);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            close();
          }}
        />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  side: {
    width: 44,
  },
});
