import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, MissionList, Screen, SafetyNotice } from '@/components';
import { assessmentStorage } from '@/features/assessment/assessmentStorage';
import { loadRecommendation } from '@/features/assessment/recommendationService';
import { maxPainScore } from '@/features/assessment/assessmentEngine';
import type { Recommendation } from '@/features/assessment/recommendation';
import { formatDuration } from '@/features/exercise/workoutBuilder';
import { logStorage } from '@/features/logs/logStorage';
import type { WorkoutLog } from '@/features/logs/logTypes';
import { colors, radius, spacing, typography } from '@/theme';
import { DISCLAIMER_SHORT } from '@/utils/safety';

/** 홈 — 오늘의 루틴, 영양 미션, 통증 점수, 이번 주 완료율 */
export default function HomeScreen() {
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [painScore, setPainScore] = useState<number | null>(null);
  const [weekCount, setWeekCount] = useState(0);
  const [lastLog, setLastLog] = useState<WorkoutLog | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [r, a, count, recent] = await Promise.all([
          loadRecommendation(),
          assessmentStorage.get(),
          logStorage.completedThisWeek(),
          logStorage.recent(1),
        ]);
        if (cancelled) return;
        setRec(r);
        setPainScore(a ? maxPainScore(a.painDetails) : null);
        setWeekCount(count);
        setLastLog(recent[0] ?? null);
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const workout = rec?.workout ?? null;
  const painDelta =
    lastLog?.beforePainScore != null && lastLog?.afterPainScore != null
      ? lastLog.afterPainScore - lastLog.beforePainScore
      : null;

  return (
    <Screen>
      <Text style={styles.greeting}>안녕하세요</Text>
      <Text style={styles.headline}>오늘 몸 상태는 어떤가요?</Text>

      {workout ? (
        <Card title="오늘의 회복 루틴" accent={colors.primary}>
          <Text style={styles.routineTitle}>{workout.program.title}</Text>
          <Text style={styles.routineMeta}>
            {formatDuration(workout.totalSeconds)} · 운동 {workout.exercises.length}개
          </Text>
          <Text style={styles.routineDesc}>{workout.program.caution}</Text>
          <Button
            label="시작하기"
            onPress={() => router.push(`/workout/${rec?.exerciseProgramId}`)}
            style={styles.cardButton}
          />
        </Card>
      ) : (
        <Card title="오늘의 루틴" accent={colors.warning}>
          <Text style={styles.routineDesc}>
            아직 추천할 루틴이 없어요. 설문을 진행하면 지금 상태에 맞는 루틴을 안내해 드릴게요.
          </Text>
          <Button
            label="설문 시작하기"
            onPress={() => router.push('/assessment')}
            style={styles.cardButton}
          />
        </Card>
      )}

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>현재 통증 점수</Text>
          <Text style={styles.statValue}>{painScore !== null ? `${painScore}점` : '-'}</Text>
          {painDelta !== null ? (
            <Text style={[styles.statDelta, painDelta <= 0 ? styles.deltaGood : styles.deltaBad]}>
              {painDelta === 0
                ? '지난 기록과 같아요'
                : painDelta < 0
                  ? `지난 기록보다 ${Math.abs(painDelta)}점 감소`
                  : `지난 기록보다 ${painDelta}점 증가`}
            </Text>
          ) : null}
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>이번 주 운동</Text>
          <Text style={styles.statValue}>{weekCount}회</Text>
          <Text style={styles.statDelta}>최근 7일 기준</Text>
        </View>
      </View>

      {rec?.nutrition ? (
        <Card title="오늘의 영양 미션" accent={colors.secondary}>
          <MissionList missions={rec.nutrition.missions} />
          <Button
            label="영양 가이드 보기"
            variant="outline"
            onPress={() => router.push('/nutrition/result')}
            style={styles.cardButton}
          />
        </Card>
      ) : null}

      <SafetyNotice tone="warning" text={DISCLAIMER_SHORT} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { ...typography.small, color: colors.textMuted, marginBottom: spacing.xs },
  headline: { ...typography.heading, color: colors.text, marginBottom: spacing.xl },
  routineTitle: { ...typography.bodyStrong, color: colors.primary },
  routineMeta: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
  routineDesc: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  cardButton: { marginTop: spacing.lg },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  statLabel: { ...typography.small, color: colors.textMuted },
  statValue: { ...typography.heading, color: colors.text, marginTop: spacing.xs },
  statDelta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  deltaGood: { color: colors.secondary },
  deltaBad: { color: colors.warning },
});
