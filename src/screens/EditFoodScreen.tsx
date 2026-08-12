import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Alert, InteractionManager, Keyboard, StyleSheet, View } from 'react-native';

import { FoodForm } from '../components/FoodForm';
import { IconButton } from '../components/ui/IconButton';
import { Screen } from '../components/ui/Screen';
import { AppText } from '../components/ui/AppText';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';

export function EditFoodScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'EditFood'>>();
  const entry = useAppStore((state) => state.entries.find((item) => item.id === route.params.id));
  const updateFood = useAppStore((state) => state.updateFood);
  const deleteFood = useAppStore((state) => state.deleteFood);

  function close() {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    });
  }

  if (!entry) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <Screen edges={['top', 'bottom']}>
          <AppText>This entry is no longer available.</AppText>
        </Screen>
      </View>
    );
  }

  const currentEntry = entry;

  function confirmDelete() {
    Alert.alert('Delete this entry?', 'This removes the food from your log.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteFood(currentEntry.id);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          close();
        },
      },
    ]);
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Screen edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.side}>
            <IconButton icon="x" label="Close" onPress={close} />
          </View>
          <AppText variant="subtitle">Edit food</AppText>
          <View style={styles.side} />
        </View>
        <FoodForm
          initial={currentEntry}
          showDateTime
          submitLabel="Save changes"
          onDelete={confirmDelete}
          onSubmit={(values) => {
            updateFood({ id: currentEntry.id, ...values });
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
