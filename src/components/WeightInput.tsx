import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
}

/**
 * 체중 선택 입력.
 *
 * 숫자 키보드 대신 5kg 단위 버튼으로 받는다.
 * 정확한 값보다 '대략의 구간' 이면 단백질 목표 계산에 충분하고,
 * 소수점까지 적게 만들면 체중 숫자에 신경이 쏠린다.
 *
 * '넣지 않기' 를 언제든 고를 수 있고, 그 경우 손 기준으로만 안내한다.
 */
const OPTIONS = [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

export function WeightInput({ value, onChange }: Props) {
  return (
    <View>
      <View style={styles.grid}>
        {OPTIONS.map((kg) => {
          const selected = value === kg;
          return (
            <Pressable
              key={kg}
              onPress={() => onChange(selected ? null : kg)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${kg}킬로그램 내외`}
              style={[styles.item, selected && styles.itemSelected]}
            >
              <Text style={[styles.itemText, selected && styles.itemTextSelected]}>{kg}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => onChange(null)}
        accessibilityRole="radio"
        accessibilityState={{ selected: value === null }}
        accessibilityLabel="체중을 넣지 않기"
        style={[styles.skip, value === null && styles.skipSelected]}
      >
        <Text style={[styles.skipText, value === null && styles.skipTextSelected]}>
          넣지 않을게요
        </Text>
      </Pressable>

      <Text style={styles.unit}>단위: kg · 가까운 값을 고르시면 됩니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  item: {
    minWidth: 62,
    minHeight: MIN_TOUCH_SIZE,
    flexGrow: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  itemText: { ...typography.body, color: colors.text },
  itemTextSelected: { ...typography.bodyStrong, color: colors.primaryDark },
  skip: {
    marginTop: spacing.md,
    minHeight: MIN_TOUCH_SIZE,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  skipText: { ...typography.body, color: colors.textMuted },
  skipTextSelected: { ...typography.bodyStrong, color: colors.primaryDark },
  unit: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
});
