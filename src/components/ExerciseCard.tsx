import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Exercise } from '@/features/exercise/exerciseTypes';
import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  exercise: Exercise;
  index?: number;
  onPress?: () => void;
  completed?: boolean;
}

function describeVolume(e: Exercise): string {
  if (e.durationSeconds && e.sets && e.sets > 1) return `${e.durationSeconds}초 x ${e.sets}세트`;
  if (e.durationSeconds) return `${e.durationSeconds}초`;
  if (e.reps && e.sets) return `${e.reps}회 x ${e.sets}세트`;
  if (e.reps) return `${e.reps}회`;
  return '';
}

export function ExerciseCard({ exercise, index, onPress, completed = false }: Props) {
  const body = (
    <View style={[styles.root, completed && styles.completed]}>
      {index !== undefined ? (
        <View style={[styles.badge, completed && styles.badgeDone]}>
          <Text style={[styles.badgeText, completed && styles.badgeTextDone]}>
            {completed ? '✓' : index + 1}
          </Text>
        </View>
      ) : null}

      <View style={styles.body}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.volume}>{describeVolume(exercise)}</Text>
        <Text style={styles.purpose} numberOfLines={2}>
          {exercise.purpose}
        </Text>
      </View>
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={exercise.name}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  completed: { backgroundColor: colors.surfaceAlt },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeDone: { backgroundColor: colors.secondary },
  badgeText: { ...typography.smallStrong, color: colors.primaryDark },
  badgeTextDone: { color: colors.onPrimary },
  body: { flex: 1 },
  name: { ...typography.bodyStrong, color: colors.text },
  volume: { ...typography.small, color: colors.primary, marginTop: spacing.xxs },
  purpose: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
});
