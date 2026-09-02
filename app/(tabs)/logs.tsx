import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen } from '@/components';
import { logStorage } from '@/features/logs/logStorage';
import type { WorkoutLog } from '@/features/logs/logTypes';
import { colors, radius, spacing, typography } from '@/theme';
import { formatKoreanDate } from '@/utils/date';

/** 기록 탭 — 통증 변화, 완료율, RPE */
export default function LogsTabScreen() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const list = await logStorage.list();
        if (!cancelled) setLogs(list);
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const completed = logs.filter((l) => l.abortReason === null);
  const completionRate =
    logs.length > 0 ? Math.round((completed.length / logs.length) * 100) : 0;

  const painPoints = logs
    .filter((l) => l.afterPainScore !== null)
    .slice(0, 10)
    .reverse();

  return (
    <Screen>
      <Text style={styles.title} accessibilityRole="header">
        기록
      </Text>
      <Text style={styles.subtitle}>모든 기록은 이 기기 안에만 저장됩니다.</Text>

      {logs.length === 0 ? (
        <EmptyState
          title="아직 기록이 없어요"
          description="루틴을 한 번 마치면 통증 변화와 수행 기록이 여기에 쌓입니다."
          actionLabel="오늘의 루틴 보러 가기"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>총 운동</Text>
              <Text style={styles.statValue}>{logs.length}회</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>완료율</Text>
              <Text style={styles.statValue}>{completionRate}%</Text>
            </View>
          </View>

          {painPoints.length > 0 ? (
            <Card title="통증 변화">
              <View style={styles.chart}>
                {painPoints.map((log) => {
                  const score = log.afterPainScore ?? 0;
                  const height = Math.max(4, score * 12);
                  const barColor =
                    score === 0
                      ? colors.secondary
                      : score <= 3
                        ? colors.secondary
                        : score <= 6
                          ? colors.warning
                          : colors.danger;
                  return (
                    <View key={log.id} style={styles.barWrap}>
                      <Text style={styles.barValue}>{score}</Text>
                      <View style={[styles.bar, { height, backgroundColor: barColor }]} />
                    </View>
                  );
                })}
              </View>
              <Text style={styles.chartHint}>운동 후 통증 점수 (최근 순서대로)</Text>
            </Card>
          ) : null}

          <Text style={styles.sectionTitle}>운동 기록</Text>
          {logs.map((log) => (
            <Card key={log.id} title={log.programTitle}>
              <Text style={styles.logDate}>{formatKoreanDate(log.date)}</Text>
              <View style={styles.logRow}>
                <Text style={styles.logItem}>
                  완료 {log.completedExerciseIds.length} / {log.totalExerciseCount}
                </Text>
                {log.rpe !== null ? <Text style={styles.logItem}>RPE {log.rpe}</Text> : null}
              </View>
              {log.beforePainScore !== null && log.afterPainScore !== null ? (
                <Text style={styles.logPain}>
                  통증 {log.beforePainScore}점 → {log.afterPainScore}점
                </Text>
              ) : null}
              {log.abortReason !== null ? (
                <Text style={styles.logAbort}>중단함 ({abortLabel(log.abortReason)})</Text>
              ) : null}
              {log.memo.length > 0 ? <Text style={styles.logMemo}>{log.memo}</Text> : null}
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

function abortLabel(reason: NonNullable<WorkoutLog['abortReason']>): string {
  return { pain: '통증', time: '시간 부족', difficulty: '난이도', other: '기타' }[reason];
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
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
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    height: 150,
    paddingTop: spacing.md,
  },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xxs },
  bar: { width: '100%', borderRadius: radius.sm, minHeight: 4 },
  chartHint: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.md },
  sectionTitle: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  logDate: { ...typography.small, color: colors.textMuted },
  logRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  logItem: { ...typography.small, color: colors.primary },
  logPain: { ...typography.body, color: colors.text, marginTop: spacing.sm },
  logAbort: { ...typography.small, color: colors.warning, marginTop: spacing.xs },
  logMemo: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
});
