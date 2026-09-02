import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BODY_REGION_CHOICES } from '@/features/assessment/assessmentQuestions';
import type { BodyRegion } from '@/features/assessment/assessmentTypes';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

interface Props {
  selected: BodyRegion[];
  onToggle: (region: BodyRegion) => void;
  /** 최대 선택 개수 */
  max?: number;
}

/**
 * 몸 부위 선택.
 * 1차 버전은 그림 대신 큰 버튼으로 만든다. 그림 지도는 다음 단계에서 붙인다.
 */
export function BodyRegionSelector({ selected, onToggle, max = 3 }: Props) {
  const full = selected.length >= max;

  return (
    <View>
      <View style={styles.grid}>
        {BODY_REGION_CHOICES.map((choice) => {
          const isSelected = selected.includes(choice.value);
          const disabled = full && !isSelected;

          return (
            <Pressable
              key={choice.value}
              onPress={() => onToggle(choice.value)}
              disabled={disabled}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled }}
              accessibilityLabel={choice.label}
              style={[
                styles.item,
                isSelected && styles.itemSelected,
                disabled && styles.itemDisabled,
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  isSelected && styles.itemTextSelected,
                  disabled && styles.itemTextDisabled,
                ]}
              >
                {choice.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>최대 {max}곳까지 고를 수 있어요. 없으면 넘어가셔도 됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  item: {
    minWidth: '30%',
    flexGrow: 1,
    minHeight: MIN_TOUCH_SIZE + 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  itemSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  itemDisabled: { opacity: 0.4 },
  itemText: { ...typography.body, color: colors.text },
  itemTextSelected: { ...typography.bodyStrong, color: colors.primaryDark },
  itemTextDisabled: { color: colors.textDisabled },
  hint: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
});
