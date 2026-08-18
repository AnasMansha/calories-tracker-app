import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './ui/AppText';

interface AskAiLinksProps {
  foodName: string;
}

export function AskAiLinks({ foodName }: AskAiLinksProps) {
  const theme = useTheme();
  const query = encodeURIComponent(
    foodName.trim()
      ? `Calories, protein, and carbs in ${foodName.trim()} typical Pakistani serving`
      : 'Calories, protein, and carbs in a typical Pakistani serving of ',
  );

  const links = [
    { label: 'ChatGPT', url: `https://chatgpt.com/?q=${query}` },
    { label: 'Gemini', url: 'https://gemini.google.com/' },
    { label: 'Perplexity', url: 'https://www.perplexity.ai/' },
  ];

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color={theme.colors.textMuted}>
        Look up with AI
      </AppText>
      <View style={styles.row}>
        {links.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => void Linking.openURL(link.url)}
            accessibilityRole="link"
            accessibilityLabel={`Look up on ${link.label}`}
            style={({ pressed }) => [
              styles.chip,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <AppText variant="label" color={theme.colors.accent}>
              {link.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
