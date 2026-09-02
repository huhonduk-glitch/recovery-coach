import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, ExerciseCard, Screen, SafetyNotice } from '@/components';
import { getExercises } from '@/data/exercises';
import { getProgram } from '@/data/programs';
import { assessmentStorage } from '@/features/assessment/assessmentStorage';
import { decideExerciseLevel } from '@/features/assessment/assessmentEngine';
import type { Exercise } from '@/features/exercise/exerciseTypes';
import { buildWorkout, formatDuration } from '@/features/exercise/workoutBuilder';
import { colors, spacing, typography } from '@/theme';
import { COMMON_STOP_SIGNS } from '@/utils/safety';

/** 프로그램 상세 — 운동 목록과 시작 버튼 */
export default function ProgramDetailScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const program = programId ? getProgram(programId) : undefined;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!program) return;
      const assessment = await assessmentStorage.get();
      if (cancelled) return;

      if (assessment) {
        const built = buildWorkout(program.id, assessment, decideExerciseLevel(assessment));
        if (built) {
          setExercises(built.exercises);
          setTotalSeconds(built.totalSeconds);
          return;
        }
      }
      // 설문 전이거나 조립에 실패하면 프로그램 원본을 보여 준다
      const all = getExercises(program.exerciseIds);
      setExercises(all);
      setTotalSeconds(all.reduce((sum, e) => sum + e.estimatedSeconds, 0));
    })();
    return () => {
      cancelled = true;
    };
  }, [program]);

  if (!program) {
    return (
      <Screen>
        <Text style={styles.title}>루틴을 찾을 수 없어요</Text>
        <Button label="돌아가기" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button
          label="루틴 시작하기"
          onPress={() => router.push(`/workout/player?programId=${program.id}`)}
        />
      }
    >
      <Text style={styles.title}>{program.title}</Text>
      <Text style={styles.meta}>
        {formatDuration(totalSeconds)} · 운동 {exercises.length}개 · {program.frequencyPerWeek}
      </Text>
      <Text style={styles.desc}>{program.description}</Text>

      <Card title="이런 분께 권합니다">
        <Text style={styles.item}>{program.targetUser}</Text>
      </Card>

      <SafetyNotice tone="warning" title="주의" text={program.caution} />
      <SafetyNotice tone="danger" title="이럴 때는 멈추세요" items={[...COMMON_STOP_SIGNS]} />

      <Text style={styles.sectionTitle}>운동 목록</Text>
      {exercises.map((e, i) => (
        <ExerciseCard
          key={e.id}
          exercise={e}
          index={i}
          onPress={() => router.push(`/workout/exercise/${e.id}`)}
        />
      ))}

      <Card title="다음 단계 기준">
        <Text style={styles.item}>{program.progressionRule}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.xs },
  meta: { ...typography.small, color: colors.primary, marginBottom: spacing.md },
  desc: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  sectionTitle: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  item: { ...typography.body, color: colors.textMuted },
});
