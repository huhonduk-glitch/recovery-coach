import { Pressable, StyleSheet, Text, View } from 'react-native';

import { painScoreLabel } from '@/features/assessment/assessmentQuestions';
import type { PainScore } from '@/features/assessment/assessmentTypes';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

interface Props {
  value: PainScore | null;
  onChange: (value: PainScore) => void;
  label?: string;
}

const SCORES: PainScore[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function scoreColor(score: PainScore): string {
  if (score === 0) return colors.secondary;
  if (score <= 3) return colors.secondary;
  if (score <= 6) return colors.warning;
  return colors.danger;
}

/**
 * 통증 점수 선택.
 *
 * 숫자만 두면 사람마다 기준이 달라지므로 항상 말로 된 라벨을 함께 보여 준다.
 */
export function PainSlider({ value, onChange, label = '지금 통증은 몇 점인가요?' }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        {SCORES.map((score) => {
          const selected = value === score;
          return (
            <Pressable
              key={score}
              onPress={() => onChange(score)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`통증 ${score}점, ${painScoreLabel(score)}`}
              style={[
                styles.cell,
                selected && { backgroundColor: scoreColor(score), borderColor: scoreColor(score) },
              ]}
            >
              <Text style={[styles.cellText, selected && styles.cellTextSelected]}>{score}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleEnd}>통증 없음</Text>
        <Text style={styles.scaleEnd}>참기 어려움</Text>
      </View>

      {value !== null ? (
        <View style={[styles.readout, { borderColor: scoreColor(value) }]}>
          <Text style={[styles.readoutScore, { color: scoreColor(value) }]}>{value}점</Text>
          <Text style={styles.readoutLabel}>{painScoreLabel(value)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: spacing.lg },
  label: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  cell: {
    width: 42,
    height: MIN_TOUCH_SIZE,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { ...typography.bodyStrong, color: colors.textMuted },
  cellTextSelected: { color: colors.onPrimary },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  scaleEnd: { ...typography.caption, color: colors.textDisabled },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  readoutScore: { ...typography.title },
  readoutLabel: { ...typography.body, color: colors.textMuted, flex: 1 },
});
