import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  hint?: string;
  /** 여러 개를 고를 수 있는 문항이면 true (체크박스 모양) */
  multi?: boolean;
}

/** 설문 선택지. 터치 영역 48dp 이상을 보장한다. */
export function OptionButton({ label, selected, onPress, hint, multi = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.root,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.mark, multi && styles.markSquare, selected && styles.markSelected]}>
        {selected ? <View style={[styles.dot, multi && styles.dotSquare]} /> : null}
      </View>
      <View style={styles.textArea}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
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
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  pressed: { opacity: 0.75 },
  mark: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  markSquare: { borderRadius: radius.sm },
  markSelected: { borderColor: colors.primary },
  dot: { width: 12, height: 12, borderRadius: radius.pill, backgroundColor: colors.primary },
  dotSquare: { borderRadius: 3 },
  textArea: { flex: 1 },
  label: { ...typography.body, color: colors.text },
  labelSelected: { ...typography.bodyStrong, color: colors.primaryDark },
  hint: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
});
