import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, SafetyNotice, Screen } from '@/components';
import { allPrograms } from '@/data/programs';
import { assessmentStorage } from '@/features/assessment/assessmentStorage';
import { assessmentTrack, type TrackId } from '@/features/assessment/assessmentTypes';
import { isCategoryAllowed } from '@/features/assessment/tracks';
import { useLibrary } from '@/features/library/useLibrary';
import type { ExerciseCategory } from '@/features/exercise/exerciseTypes';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

/** 운동 탭 — 카테고리별 프로그램 목록 */

const CATEGORY_GROUPS: { key: string; label: string; categories: ExerciseCategory[] }[] = [
  { key: 'posture', label: '체형교정', categories: ['posture'] },
  { key: 'warmup', label: '동적웜업', categories: ['dynamicWarmup'] },
  { key: 'functional', label: '기능성 운동', categories: ['functional'] },
  {
    key: 'recovery',
    label: '부위별 회복운동',
    categories: [
      'shoulderRecovery',
      'backRecovery',
      'kneeRecovery',
      'ankleRecovery',
      'neckUpperBackRecovery',
    ],
  },
];

export default function WorkoutTabScreen() {
  const [track, setTrack] = useState<TrackId>('assessment');
  const [groupKey, setGroupKey] = useState('recovery');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const a = await assessmentStorage.get();
      if (cancelled || a === null) return;
      const t = assessmentTrack(a);
      setTrack(t);
      // 목적 트랙에서는 회복운동을 보여 주지 않으므로 다른 묶음을 먼저 편다
      if (t === 'purpose') setGroupKey('posture');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 목적 트랙에서는 부위별 회복운동을 감춘다.
   * 회복운동은 통증 정도와 단계 판정이 있어야 배정할 수 있다.
   * (docs/SAFETY_POLICY.md §21)
   */
  const groups = useMemo(
    () =>
      CATEGORY_GROUPS.filter((g) => g.categories.some((c) => isCategoryAllowed(track, c))),
    [track],
  );

  const library = useLibrary();

  const programs = useMemo(() => {
    const group = groups.find((g) => g.key === groupKey);
    if (!group) return [];
    void library; // 편집 내용이 바뀌면 목록을 다시 만든다
    return allPrograms().filter(
      (p) => group.categories.includes(p.category) && isCategoryAllowed(track, p.category),
    );
  }, [groups, groupKey, track, library]);

  return (
    <Screen>
      <Text style={styles.title}>운동</Text>
      <Text style={styles.subtitle}>
        {track === 'purpose'
          ? '고르신 목적에 맞는 운동입니다. 아픈 곳이 생기면 내정보에서 몸 상태 설문을 진행해 주세요.'
          : '회복운동은 1단계부터 순서대로 진행합니다. 단계를 건너뛰지 마세요.'}
      </Text>

      {/* 운동 지침과 부위별 손상 이해로 가는 입구 */}
      <Pressable
        onPress={() => router.push('/learn')}
        accessibilityRole="button"
        accessibilityLabel="알아보기. 운동 지침과 부위별 손상"
        style={({ pressed }) => [styles.learnRow, pressed && styles.learnPressed]}
      >
        <View style={styles.learnBody}>
          <Text style={styles.learnTitle}>알아보기</Text>
          <Text style={styles.learnDesc}>
            얼마나 움직여야 하는지, 부위별로 어떤 손상이 흔한지 정리했어요.
          </Text>
        </View>
        <Text style={styles.learnArrow}>›</Text>
      </Pressable>

      <View style={styles.tabs}>
        {groups.map((g) => {
          const active = g.key === groupKey;
          return (
            <Pressable
              key={g.key}
              onPress={() => setGroupKey(g.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{g.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {track === 'purpose' ? (
        <SafetyNotice
          tone="info"
          title="부위별 회복운동을 찾으시나요?"
          text="어깨·허리·무릎·발목·목 회복운동은 통증 정도와 단계를 확인해야 안전하게 안내할 수 있어요. 내정보에서 몸 상태 설문을 진행하시면 열립니다."
        />
      ) : null}

      {programs.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => router.push(`/workout/${p.id}`)}
          accessibilityRole="button"
          accessibilityLabel={p.title}
        >
          <Card title={p.title}>
            <Text style={styles.meta}>
              {p.durationMinutes}분 · 운동 {p.exerciseIds.length}개 · {p.frequencyPerWeek}
            </Text>
            <Text style={styles.desc}>{p.description}</Text>
            <Text style={styles.target}>대상: {p.targetUser}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  learnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_SIZE,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  learnPressed: { opacity: 0.8 },
  learnBody: { flex: 1 },
  learnTitle: { ...typography.bodyStrong, color: colors.primaryDark },
  learnDesc: { ...typography.caption, color: colors.primaryDark, marginTop: spacing.xxs },
  learnArrow: { ...typography.title, color: colors.primaryDark },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { ...typography.small, color: colors.textMuted },
  tabTextActive: { ...typography.smallStrong, color: colors.onPrimary },
  meta: { ...typography.small, color: colors.primary },
  desc: { ...typography.body, color: colors.text, marginTop: spacing.sm },
  target: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
});
