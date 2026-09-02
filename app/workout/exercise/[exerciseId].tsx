import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, ExerciseFigure, SafetyNotice, Screen } from '@/components';
import { getExercise } from '@/data/exercises';
import { colors, radius, spacing, typography } from '@/theme';
import { COMMON_STOP_SIGNS } from '@/utils/safety';

const LEVEL_LABEL = { beginner: '초급', intermediate: '중급', advanced: '상급' } as const;

/** 운동 상세 — 앱만 보고 따라 할 수 있어야 한다 */
export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const exercise = exerciseId ? getExercise(exerciseId) : undefined;

  if (!exercise) {
    return (
      <Screen>
        <Text style={styles.title}>운동을 찾을 수 없어요</Text>
        <Button label="돌아가기" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  const volume = [
    exercise.sets ? `${exercise.sets}세트` : null,
    exercise.reps ? `${exercise.reps}회` : null,
    exercise.durationSeconds ? `${exercise.durationSeconds}초` : null,
    exercise.restSeconds > 0 ? `휴식 ${exercise.restSeconds}초` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Screen footer={<Button label="닫기" variant="outline" onPress={() => router.back()} />}>
      <ExerciseFigure exercise={exercise} />

      <Text style={styles.title}>{exercise.name}</Text>
      <View style={styles.tagRow}>
        <Text style={styles.tag}>{LEVEL_LABEL[exercise.level]}</Text>
        {exercise.phase ? <Text style={styles.tag}>{exercise.phase}단계</Text> : null}
        <Text style={styles.tag}>{volume}</Text>
      </View>

      <Text style={styles.purpose}>{exercise.purpose}</Text>

      <Card title="이렇게 합니다">
        {exercise.description.map((line, i) => (
          <View key={line} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{i + 1}</Text>
            <Text style={styles.stepText}>{line}</Text>
          </View>
        ))}
      </Card>

      <Card title="핵심 포인트">
        {exercise.cues.map((cue) => (
          <Text key={cue} style={styles.item}>
            · {cue}
          </Text>
        ))}
      </Card>

      <Card title="흔한 실수">
        {exercise.commonMistakes.map((m) => (
          <Text key={m} style={styles.item}>
            · {m}
          </Text>
        ))}
      </Card>

      <SafetyNotice tone="warning" title="주의사항" items={exercise.precautions} />
      <SafetyNotice tone="danger" title="이럴 때는 멈추세요" items={[...COMMON_STOP_SIGNS]} />

      <Card title="쉬운 버전">
        {exercise.regressions.map((r) => (
          <Text key={r} style={styles.item}>
            · {r}
          </Text>
        ))}
      </Card>

      <Card title="더 어려운 버전">
        {exercise.progressions.map((p) => (
          <Text key={p} style={styles.item}>
            · {p}
          </Text>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  tag: {
    ...typography.caption,
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  purpose: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  stepRow: { flexDirection: 'row', marginBottom: spacing.sm },
  stepNumber: {
    ...typography.bodyStrong,
    color: colors.primary,
    minWidth: 20,
    marginRight: spacing.sm,
  },
  stepText: { ...typography.body, color: colors.text, flex: 1 },
  item: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
});
