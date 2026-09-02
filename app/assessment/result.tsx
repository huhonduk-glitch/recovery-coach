import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, ExerciseCard, LoadingScreen, Screen, SafetyNotice } from '@/components';
import { assessmentStorage } from '@/features/assessment/assessmentStorage';
import { loadRecommendation } from '@/features/assessment/recommendationService';
import type { Recommendation } from '@/features/assessment/recommendation';
import { getExercise } from '@/data/exercises';
import { formatDuration } from '@/features/exercise/workoutBuilder';
import { colors, radius, spacing, typography } from '@/theme';
import { DISCLAIMER_SHORT } from '@/utils/safety';

const RISK_COLOR = {
  red: colors.risk.red,
  yellow: colors.risk.yellow,
  green: colors.risk.green,
  performance: colors.risk.performance,
} as const;

/** 설문 결과 — 운동 추천 */
export default function AssessmentResultScreen() {
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [studentMode, setStudentMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [r, a] = await Promise.all([loadRecommendation(), assessmentStorage.get()]);
      if (cancelled) return;
      setRec(r);
      setStudentMode(a?.userType === 'student' || a?.ageGroup === 'teens');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (rec === null) {
    return <LoadingScreen message="결과를 준비하고 있어요" />;
  }

  const workout = rec.workout;

  return (
    <Screen
      footer={
        <View style={styles.footerRow}>
          <Button
            label="영양 가이드"
            variant="outline"
            onPress={() => router.push('/nutrition/result')}
            style={styles.flex}
          />
          {workout ? (
            <Button
              label="루틴 시작"
              onPress={() => router.push(`/workout/${rec.exerciseProgramId}`)}
              style={styles.flex}
            />
          ) : (
            <Button label="홈으로" onPress={() => router.replace('/(tabs)')} style={styles.flex} />
          )}
        </View>
      }
    >
      <View style={[styles.riskTag, { backgroundColor: RISK_COLOR[rec.riskLevel] }]}>
        <Text style={styles.riskTagText}>{rec.riskLabel}</Text>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        분석 결과
      </Text>
      <Text style={styles.summary}>{rec.summary}</Text>

      {studentMode ? (
        <SafetyNotice
          tone="info"
          text="학생 모드로 안내하고 있어요. 숫자 목표 대신 손바닥·주먹 기준으로 알려 드립니다."
        />
      ) : null}

      {rec.cautionMessages.length > 0 ? (
        <SafetyNotice tone="warning" title="오늘 주의할 점" items={rec.cautionMessages} />
      ) : null}

      {workout ? (
        <>
          <Card title="추천 루틴" accent={RISK_COLOR[rec.riskLevel]}>
            <Text style={styles.programTitle}>{workout.program.title}</Text>
            <Text style={styles.programMeta}>
              {formatDuration(workout.totalSeconds)} · 운동 {workout.exercises.length}개 ·{' '}
              {workout.program.frequencyPerWeek}
            </Text>
            <Text style={styles.programDesc}>{workout.program.description}</Text>
          </Card>

          <Text style={styles.sectionTitle}>오늘의 운동</Text>
          {workout.exercises.map((e, i) => (
            <ExerciseCard
              key={e.id}
              exercise={e}
              index={i}
              onPress={() => router.push(`/workout/exercise/${e.id}`)}
            />
          ))}

          <Card title="이번 주 계획">
            {rec.weeklyPlan.map((line) => (
              <Text key={line} style={styles.listItem}>
                · {line}
              </Text>
            ))}
          </Card>

          <Card title="다음 단계로 넘어가려면">
            <Text style={styles.listItem}>{rec.progressionAdvice}</Text>
          </Card>

          <SafetyNotice tone="danger" title="중단 기준" text={workout.program.stopRule} />
        </>
      ) : null}

      <Text style={styles.disclaimer}>{DISCLAIMER_SHORT}</Text>
    </Screen>
  );
}

// getExercise 는 상세 화면에서 쓰지만, 결과 화면에서 미리 참조해 두면
// 데이터가 빠졌을 때 개발 중에 바로 드러난다.
void getExercise;

const styles = StyleSheet.create({
  riskTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  riskTagText: { ...typography.smallStrong, color: colors.onPrimary },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  summary: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  programTitle: { ...typography.bodyStrong, color: colors.primary },
  programMeta: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
  programDesc: { ...typography.body, color: colors.text, marginTop: spacing.sm },
  listItem: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  disclaimer: {
    ...typography.caption,
    color: colors.textDisabled,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
