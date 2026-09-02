import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Screen } from '@/components';
import { PROGRAMS } from '@/data/programs';
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
  const [groupKey, setGroupKey] = useState('recovery');

  const programs = useMemo(() => {
    const group = CATEGORY_GROUPS.find((g) => g.key === groupKey);
    if (!group) return [];
    return PROGRAMS.filter((p) => group.categories.includes(p.category));
  }, [groupKey]);

  return (
    <Screen>
      <Text style={styles.title}>운동</Text>
      <Text style={styles.subtitle}>
        회복운동은 1단계부터 순서대로 진행합니다. 단계를 건너뛰지 마세요.
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
        {CATEGORY_GROUPS.map((g) => {
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
