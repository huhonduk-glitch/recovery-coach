import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

import { colors } from './colors';

/** React Native Paper 에 우리 컬러 토큰을 주입한 테마 */
export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.primaryLight,
    onPrimaryContainer: colors.primaryDark,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    error: colors.danger,
    errorContainer: colors.dangerLight,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceAlt,
    onSurface: colors.text,
    onSurfaceVariant: colors.textMuted,
    outline: colors.border,
    outlineVariant: colors.border,
  },
};
