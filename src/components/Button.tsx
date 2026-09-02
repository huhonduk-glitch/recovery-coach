import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

/**
 * 앱 공통 버튼.
 * danger 는 운동 중단·상담 안내 전용이다. 일반 동작에 쓰지 않는다.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        VARIANT_STYLE[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.onPrimary} />
      ) : (
        <Text style={[styles.label, VARIANT_TEXT[variant], isDisabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const VARIANT_STYLE: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
};

const VARIANT_TEXT = {
  primary: { color: colors.onPrimary },
  secondary: { color: colors.onPrimary },
  outline: { color: colors.primary },
  danger: { color: colors.onPrimary },
} as const;

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_SIZE + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.8 },
  disabled: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  label: { ...typography.bodyStrong },
  labelDisabled: { color: colors.textDisabled },
});
