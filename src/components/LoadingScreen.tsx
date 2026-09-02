import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

/** 데이터를 불러오는 동안 보여 주는 화면 */
export function LoadingScreen({ message = '불러오는 중이에요' }: { message?: string }) {
  return (
    <View style={styles.root} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  text: { ...typography.small, color: colors.textMuted, marginTop: spacing.lg },
});
