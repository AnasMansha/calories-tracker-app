import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { parseLocalDate } from '../../utils/dates';
import { AppText } from './AppText';
import { Button } from './Button';

interface DatePickerSheetProps {
  visible: boolean;
  title: string;
  value: string;
  minimumDate?: string;
  maximumDate?: string;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  onClose: () => void;
}

export function DatePickerSheet({
  visible,
  title,
  value,
  minimumDate,
  maximumDate,
  onChange,
  onClose,
}: DatePickerSheetProps) {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  const picker = (
    <DateTimePicker
      value={parseLocalDate(value)}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      minimumDate={minimumDate ? parseLocalDate(minimumDate) : undefined}
      maximumDate={maximumDate ? parseLocalDate(maximumDate) : undefined}
      themeVariant={theme.dark ? 'dark' : 'light'}
      onChange={onChange}
    />
  );

  if (Platform.OS === 'android') {
    return picker;
  }

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close date picker" />
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
          {picker}
          <Button label="Done" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
});
