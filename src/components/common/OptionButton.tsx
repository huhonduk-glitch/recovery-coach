import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** 보조 설명 (선택) */
  description?: string;
}

/** 설문 선택지 버튼. 터치 영역 48dp 이상을 보장한다. */
export function OptionButton({ label, selected, onPress, description }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.root,
        selected && styles.rootSelected,
        pressed && styles.rootPressed,
      ]}
    >
      <View style={[styles.dot, selected && styles.dotSelected]}>
        {selected ? <View style={styles.dotInner} /> : null}
      </View>
      <View style={styles.textArea}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_SIZE + spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  rootSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rootPressed: { opacity: 0.75 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dotSelected: { borderColor: colors.primary },
  dotInner: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  textArea: { flex: 1 },
  label: { ...typography.body, color: colors.text },
  labelSelected: { ...typography.bodyStrong, color: colors.primaryDark },
  description: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
});
