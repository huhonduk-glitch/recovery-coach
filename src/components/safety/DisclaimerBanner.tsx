import { StyleSheet, Text, View } from 'react-native';

import { DISCLAIMER_SHORT } from '@/content/copy/disclaimer';
import { colors, radius, spacing, typography } from '@/theme';

/**
 * 면책 고지 배너.
 * 결과 화면·루틴 화면에 상시 노출한다. (docs/SAFETY_POLICY.md §8.1)
 */
export function DisclaimerBanner() {
  return (
    <View style={styles.root} accessibilityRole="alert">
      <Text style={styles.text}>{DISCLAIMER_SHORT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: spacing.md,
  },
  text: {
    ...typography.small,
    color: colors.text,
  },
});
