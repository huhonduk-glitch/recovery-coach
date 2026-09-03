import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, SafetyNotice, Screen } from '@/components';
import { allExercises } from '@/data/exercises';
import type { Exercise } from '@/features/exercise/exerciseTypes';
import { customizedCount, isCustomized, resolveVideos } from '@/features/videos/videoLibrary';
import { useVideoOverrides } from '@/features/videos/useVideoOverrides';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

const CATEGORY_LABEL: Record<Exercise['category'], string> = {
  posture: '체형교정',
  dynamicWarmup: '동적 웜업',
  functional: '기능성 운동',
  shoulderRecovery: '어깨 회복',
  backRecovery: '허리 회복',
  kneeRecovery: '무릎 회복',
  ankleRecovery: '발목 회복',
  neckUpperBackRecovery: '목·등 회복',
};

type Filter = 'all' | 'hasVideo' | 'noVideo';

/** 동작 영상 관리 — 운동 고르기 */
export default function VideoManagerScreen() {
  const overrides = useVideoOverrides();
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useMemo(() => {
    const q = keyword.trim();
    return allExercises().map((exercise) => ({
      exercise,
      count: resolveVideos(overrides, exercise.id).length,
      customized: isCustomized(overrides, exercise.id),
    })).filter((row) => {
      if (filter === 'hasVideo' && row.count === 0) return false;
      if (filter === 'noVideo' && row.count > 0) return false;
      if (q.length === 0) return true;
      return (
        row.exercise.name.includes(q) ||
        row.exercise.id.includes(q) ||
        CATEGORY_LABEL[row.exercise.category].includes(q)
      );
    });
  }, [overrides, keyword, filter]);

  const withVideo = useMemo(
    () => allExercises().filter((e) => resolveVideos(overrides, e.id).length > 0).length,
    [overrides],
  );

  return (
    <Screen footer={<Button label="닫기" variant="outline" onPress={() => router.back()} />}>
      <Text style={styles.title} accessibilityRole="header">
        동작 영상 관리
      </Text>
      <Text style={styles.desc}>
        운동을 고르면 그 동작에 연결된 영상을 추가하고, 순서를 바꾸고, 지울 수 있어요.
      </Text>

      <SafetyNotice
        tone="info"
        title="영상은 앱에 담기지 않아요"
        text="앱은 주소만 저장하고, 재생은 유튜브·인스타그램에서 원작자 채널로 열립니다. 영상 파일을 받아 넣는 것은 저작권 침해라 지원하지 않습니다."
      />

      <Card title="현재 상태">
        <Text style={styles.stat}>
          영상이 연결된 동작 {withVideo}개 / 전체 {allExercises().length}개
        </Text>
        <Text style={styles.statSub}>앱에서 직접 바꾼 동작 {customizedCount(overrides)}개</Text>
        <Button
          label="코드로 내보내기"
          variant="outline"
          onPress={() => router.push('/videos/export')}
          style={styles.exportButton}
        />
        <Text style={styles.statSub}>
          앱에서 바꾼 목록은 이 기기에만 있어요. 오래 남기려면 내보내서 코드에 붙여 넣으세요.
        </Text>
      </Card>

      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="동작 이름으로 찾기 (예: 스쿼트)"
        placeholderTextColor={colors.textDisabled}
        style={styles.search}
        accessibilityLabel="동작 이름 검색"
      />

      <View style={styles.filterRow}>
        <FilterChip label="전체" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip
          label="영상 있음"
          active={filter === 'hasVideo'}
          onPress={() => setFilter('hasVideo')}
        />
        <FilterChip
          label="영상 없음"
          active={filter === 'noVideo'}
          onPress={() => setFilter('noVideo')}
        />
      </View>

      {rows.length === 0 ? (
        <Text style={styles.empty}>찾는 동작이 없어요. 다른 이름으로 찾아 보세요.</Text>
      ) : null}

      {rows.map(({ exercise, count, customized }) => (
        <Pressable
          key={exercise.id}
          onPress={() => router.push(`/videos/${exercise.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`${exercise.name}, 영상 ${count}개. 관리하기`}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>{exercise.name}</Text>
            <Text style={styles.rowMeta}>
              {CATEGORY_LABEL[exercise.category]}
              {exercise.phase !== null ? ` · ${exercise.phase}단계` : ''}
            </Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={count > 0 ? styles.countOn : styles.countOff}>{count}개</Text>
            {customized ? <Text style={styles.customMark}>수정함</Text> : null}
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.xs },
  desc: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  stat: { ...typography.bodyStrong, color: colors.text },
  statSub: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  exportButton: { marginTop: spacing.md, marginBottom: spacing.sm },
  search: {
    minHeight: MIN_TOUCH_SIZE,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    color: colors.text,
  },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.small, color: colors.textMuted },
  chipTextActive: { ...typography.smallStrong, color: colors.onPrimary },
  empty: { ...typography.body, color: colors.textMuted, marginTop: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_SIZE,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowPressed: { opacity: 0.75 },
  rowBody: { flex: 1 },
  rowTitle: { ...typography.bodyStrong, color: colors.text },
  rowMeta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
  rowRight: { alignItems: 'flex-end' },
  countOn: { ...typography.smallStrong, color: colors.primaryText },
  countOff: { ...typography.small, color: colors.textDisabled },
  customMark: { ...typography.caption, color: colors.secondaryText, marginTop: spacing.xxs },
});
