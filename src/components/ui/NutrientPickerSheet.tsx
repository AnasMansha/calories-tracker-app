import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { NutrientCatalogItem } from '../../data/nutrientCatalog';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from './AppText';
import { TextField } from './TextField';

interface NutrientPickerSheetProps {
  visible: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  groups: Array<{ id: string; label: string; items: NutrientCatalogItem[] }>;
  onSelect: (key: string) => void;
  onClose: () => void;
}

export function NutrientPickerSheet({
  visible,
  query,
  onQueryChange,
  groups,
  onSelect,
  onClose,
}: NutrientPickerSheetProps) {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close nutrient picker" />
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="subtitle">Add a nutrient</AppText>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Feather name="x" size={22} color={theme.colors.textMuted} />
            </Pressable>
          </View>
          <TextField
            label="Search"
            value={query}
            onChangeText={onQueryChange}
            placeholder="Carbs, vitamin D, iron…"
          />
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {groups.length === 0 ? (
              <AppText variant="body" color={theme.colors.textMuted} style={styles.empty}>
                No nutrients match that search.
              </AppText>
            ) : (
              groups.map((group) => (
                <View key={group.id} style={styles.group}>
                  <AppText variant="caption" color={theme.colors.textSubtle} style={styles.groupLabel}>
                    {group.label}
                  </AppText>
                  {group.items.map((item) => (
                    <Pressable
                      key={item.key}
                      onPress={() => onSelect(item.key)}
                      accessibilityRole="button"
                      accessibilityLabel={`Add ${item.label}`}
                      style={({ pressed }) => [
                        styles.row,
                        {
                          backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <View style={styles.rowCopy}>
                        <AppText variant="bodyMedium">{item.label}</AppText>
                        <AppText variant="caption" color={theme.colors.textMuted}>
                          Default {item.defaultTarget} {item.unit}
                        </AppText>
                      </View>
                      <Feather name="plus-circle" size={20} color={theme.colors.accent} />
                    </Pressable>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
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
    maxHeight: '78%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(128,128,128,0.35)',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    maxHeight: 360,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
  },
  group: {
    marginBottom: 8,
  },
  groupLabel: {
    marginBottom: 6,
    marginTop: 4,
  },
  row: {
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
});
