import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { typography } from '../../theme/tokens';

type Variant = keyof typeof typography;

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

export function AppText({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  return (
    <Text
      {...rest}
      style={[
        theme.typography[variant],
        {
          color: color ?? theme.colors.text,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
