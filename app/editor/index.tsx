import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, SafetyNotice, Screen } from '@/components';
import type { ExerciseCategory } from '@/features/exercise/exerciseTypes';
import {
  editedCount,
  isExerciseAdded,
  isExerciseEdited,
  isProgramAdded,
  isProgramEdited,
  resetAll,
  resolveExercises,
  resolvePrograms,
} from '@/features/library/exerciseLibrary';
import { clearLibrary, commitLibrary, useLibrary } from '@/features/library/useLibrary';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

const CATEGORY_LABEL: Record<ExerciseCategory, string> = {
  posture: '체형교정',
  dynamicWarmup: '동적 웜업',
  functional: '기능성 운동',
  shoulderRecovery: '어깨 회복',
  backRecovery: '허리 회복',
  kneeRecovery: '무릎 회복',
  ankleRecovery: '발목 회복',
  neckUpperBackRecovery: '목·등 회복',
};

type Tab = 'exercise' | 'program';

/** 운동·프로그램 편집 — 목록 */
export default function EditorHomeScreen() {
  const store = useLibrary();
  const [tab, setTab] = useState<Tab>('exercise');
  const [keyword, setKeyword] = useState('');

  const counts = editedCount(store);

  const exercises = useMemo(() => {
    const q = keyword.trim();
    return resolveExercises(store).filter(
      (e) => q.length === 0 || e.name.includes(q) || e.id.includes(q),
    );
  }, [store, keyword]);

  const programs = useMemo(() => {
    const q = keyword.trim();
    return resolvePrograms(store).filter(
      (p) => q.length === 0 || p.title.includes(q) || p.id.includes(q),
    );
  }, [store, keyword]);

  function confirmResetAll() {
    const message =
      '앱에서 고친 운동과 프로그램을 모두 처음 상태로 되돌립니다. 되돌릴 수 없습니다. 진행할까요?';
    const run = () => {
      void clearLibrary();
      void commitLibrary(resetAll());
    };
    if (Platform.OS === 'web') {
      if (window.confirm(message)) run();
      return;
    }
    Alert.alert('전체 되돌리기', message, [
      { text: '취소', style: 'cancel' },
      { text: '되돌리기', style: 'destructive', onPress: run },
    ]);
  }

  return (
    <Screen footer={<Button label="닫기" variant="outline" onPress={() => router.back()} />}>
      <Text style={styles.title} accessibilityRole="header">
        운동·프로그램 편집
      </Text>
      <Text style={styles.desc}>
        동작 설명과 코칭 문구를 선생님 표현으로 바꾸고, 세트·횟수와 프로그램 편성까지 직접
        정하실 수 있어요.
      </Text>

      <SafetyNotice
        tone="warning"
        title="바꾸실 때 지켜지는 것"
        items={[
          '주의사항과 중단 기준은 비울 수 없어요. 비우면 저장되지 않습니다.',
          '통증을 참으라는 표현은 저장 자체가 막힙니다.',
          '회복운동의 부위·단계를 바꾸면 누구에게 배정되는지가 달라집니다.',
          '기본 운동은 지우지 않고 감춥니다. 언제든 되돌릴 수 있어요.',
        ]}
      />

      <Card title="현재 상태">
        <Text style={styles.stat}>
          운동 {exercises.length}개 · 프로그램 {programs.length}개
        </Text>
        <Text style={styles.statSub}>
          고치거나 감춘 것: 운동 {counts.exercises}개 · 프로그램 {counts.programs}개
        </Text>
        <Button
          label="코드로 내보내기"
          variant="outline"
          onPress={() => router.push('/editor/export')}
          style={styles.button}
        />
        <Text style={styles.statSub}>
          앱에서 바꾼 내용은 이 기기에만 있어요. 오래 남기려면 내보내서 코드에 붙여 넣으세요.
        </Text>
        <Button
          label="전체 되돌리기"
          variant="danger"
          onPress={confirmResetAll}
          style={styles.button}
        />
      </Card>

      <View style={styles.tabs}>
        <Chip label="운동" active={tab === 'exercise'} onPress={() => setTab('exercise')} />
        <Chip label="프로그램" active={tab === 'program'} onPress={() => setTab('program')} />
      </View>

      <Button
        label={tab === 'exercise' ? '새 운동 만들기' : '새 프로그램 만들기'}
        onPress={() =>
          router.push(tab === 'exercise' ? '/editor/exercise/new' : '/editor/program/new')
        }
        style={styles.button}
      />

      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder={tab === 'exercise' ? '운동 이름으로 찾기' : '프로그램 이름으로 찾기'}
        placeholderTextColor={colors.textDisabled}
        style={styles.search}
        accessibilityLabel="이름으로 찾기"
      />

      {tab === 'exercise'
        ? exercises.map((e) => (
            <Row
              key={e.id}
              title={e.name}
              meta={`${CATEGORY_LABEL[e.category]}${e.phase !== null ? ` · ${e.phase}단계` : ''}`}
              edited={isExerciseEdited(store, e.id)}
              added={isExerciseAdded(store, e.id)}
              onPress={() => router.push(`/editor/exercise/${e.id}`)}
            />
          ))
        : programs.map((p) => (
            <Row
              key={p.id}
              title={p.title}
              meta={`${CATEGORY_LABEL[p.category]} · 운동 ${p.exerciseIds.length}개 · ${p.durationMinutes}분`}
              edited={isProgramEdited(store, p.id)}
              added={isProgramAdded(store, p.id)}
              onPress={() => router.push(`/editor/program/${p.id}`)}
            />
          ))}

      {store.removedExerciseIds.length > 0 || store.removedProgramIds.length > 0 ? (
        <Card title="감춘 항목">
          <Text style={styles.statSub}>
            운동 {store.removedExerciseIds.length}개 · 프로그램 {store.removedProgramIds.length}개를
            감췄어요. 각 항목의 편집 화면에서 다시 보이게 할 수 있습니다.
          </Text>
          {[...store.removedExerciseIds, ...store.removedProgramIds].map((id) => (
            <Text key={id} style={styles.hiddenId}>
              · {id}
            </Text>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

function Chip({
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
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function Row({
  title,
  meta,
  edited,
  added,
  onPress,
}: {
  title: string;
  meta: string;
  edited: boolean;
  added: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} 편집`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowMeta}>{meta}</Text>
      </View>
      {added ? <Text style={styles.badgeAdded}>새로 만듦</Text> : null}
      {!added && edited ? <Text style={styles.badgeEdited}>수정함</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.xs },
  desc: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  stat: { ...typography.bodyStrong, color: colors.text },
  statSub: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  button: { marginTop: spacing.md },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
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
  badgeEdited: { ...typography.caption, color: colors.secondaryText },
  badgeAdded: { ...typography.caption, color: colors.primaryText },
  hiddenId: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.xxs },
});
