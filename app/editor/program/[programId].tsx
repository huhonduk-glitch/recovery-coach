import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, EmptyState, SafetyNotice, Screen } from '@/components';
import type { ExerciseLevel } from '@/features/assessment/assessmentTypes';
import type { ExerciseCategory, Program } from '@/features/exercise/exerciseTypes';
import {
  addProgram,
  isProgramAdded,
  isProgramEdited,
  moveExerciseInProgram,
  removeProgram,
  resetProgram,
  resolveExercise,
  resolveExercises,
  resolveProgram,
  restoreProgram,
  saveProgram,
  type LibraryResult,
} from '@/features/library/exerciseLibrary';
import { commitLibrary, useLibrary } from '@/features/library/useLibrary';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

const CATEGORIES: { value: ExerciseCategory; label: string }[] = [
  { value: 'posture', label: '체형교정' },
  { value: 'dynamicWarmup', label: '동적 웜업' },
  { value: 'functional', label: '기능성 운동' },
  { value: 'shoulderRecovery', label: '어깨 회복' },
  { value: 'backRecovery', label: '허리 회복' },
  { value: 'kneeRecovery', label: '무릎 회복' },
  { value: 'ankleRecovery', label: '발목 회복' },
  { value: 'neckUpperBackRecovery', label: '목·등 회복' },
];
const LEVELS: { value: ExerciseLevel; label: string }[] = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
];

function blankProgram(): Program {
  return {
    id: '',
    title: '',
    description: '',
    targetUser: '',
    goal: '',
    category: 'functional',
    bodyRegion: null,
    phase: null,
    level: 'beginner',
    durationMinutes: 15,
    frequencyPerWeek: '주 3회',
    exerciseIds: [],
    progressionRule: '',
    stopRule: '운동 중 통증이 6점 이상으로 올라가거나, 저림·힘 빠짐이 생기면 즉시 중단하세요.',
    caution: '',
  };
}

/** 프로그램 편성 편집 */
export default function ProgramEditorScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const id = typeof programId === 'string' ? programId : '';
  const store = useLibrary();
  const isNew = id === 'new';
  const existing = isNew ? undefined : resolveProgram(store, id);

  if (!isNew && existing === undefined) {
    const hidden = store.removedProgramIds.includes(id);
    return (
      <Screen>
        <EmptyState
          title={hidden ? '감춰 둔 프로그램이에요' : '프로그램을 찾지 못했어요'}
          description={hidden ? '다시 보이게 하면 편집할 수 있어요.' : '목록에서 다시 골라 주세요.'}
          actionLabel={hidden ? '다시 보이게 하기' : '목록으로'}
          onAction={() => {
            if (hidden) void commitLibrary(restoreProgram(store, id));
            else router.replace('/editor');
          }}
        />
      </Screen>
    );
  }

  return <Editor key={id} initial={existing ?? blankProgram()} isNew={isNew} />;
}

function Editor({ initial, isNew }: { initial: Program; isNew: boolean }) {
  const store = useLibrary();
  const [draft, setDraft] = useState<Program>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const edited = isProgramEdited(store, initial.id);
  const added = isProgramAdded(store, initial.id);

  const candidates = useMemo(() => {
    const q = keyword.trim();
    return resolveExercises(store).filter(
      (e) =>
        !draft.exerciseIds.includes(e.id) &&
        (q.length === 0 || e.name.includes(q) || e.id.includes(q)),
    );
  }, [store, draft.exerciseIds, keyword]);

  function set<K extends keyof Program>(key: K, value: Program[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function apply(result: LibraryResult) {
    if (!result.ok) {
      setErrors(result.errors);
      setWarnings([]);
      setSaved(false);
      return;
    }
    setErrors([]);
    setWarnings(result.warnings);
    setSaved(true);
    void commitLibrary(result.store);
  }

  function save() {
    if (isNew) {
      const id = draft.id.trim().length > 0 ? draft.id.trim() : `my_program_${Date.now()}`;
      const result = addProgram(store, { ...draft, id });
      if (result.ok) {
        void commitLibrary(result.store);
        router.replace(`/editor/program/${id}`);
        return;
      }
      apply(result);
      return;
    }
    apply(saveProgram(store, draft));
  }

  function confirmRemove() {
    const message = added
      ? '이 프로그램을 완전히 지울까요? 되돌릴 수 없습니다.'
      : '이 프로그램을 목록에서 감출까요? 나중에 다시 보이게 할 수 있습니다.';
    const run = () => {
      const result = removeProgram(store, initial.id);
      if (result.ok) {
        void commitLibrary(result.store);
        router.replace('/editor');
      } else setErrors(result.errors);
    };
    if (Platform.OS === 'web') {
      if (window.confirm(message)) run();
      return;
    }
    Alert.alert('확인', message, [
      { text: '취소', style: 'cancel' },
      { text: added ? '지우기' : '감추기', style: 'destructive', onPress: run },
    ]);
  }

  return (
    <Screen footer={<Button label="저장하기" onPress={save} />}>
      <Text style={styles.eyebrow}>프로그램 편성</Text>
      <Text style={styles.title} accessibilityRole="header">
        {isNew ? '새 프로그램 만들기' : initial.title}
      </Text>

      {errors.length > 0 ? (
        <SafetyNotice tone="danger" title="저장하지 못했어요" items={errors} />
      ) : null}
      {warnings.length > 0 ? (
        <SafetyNotice tone="warning" title="확인해 주세요" items={warnings} />
      ) : null}
      {saved && errors.length === 0 ? (
        <SafetyNotice tone="info" title="저장했어요" text="앱 전체에 바로 반영됩니다." />
      ) : null}

      <Card title={`운동 ${draft.exerciseIds.length}개`}>
        {draft.exerciseIds.length === 0 ? (
          <Text style={styles.hint}>아직 운동이 없어요. 아래에서 넣어 주세요.</Text>
        ) : null}

        {draft.exerciseIds.map((exId, index) => {
          const exercise = resolveExercise(store, exId);
          return (
            <View key={exId} style={styles.item}>
              <View style={styles.itemHead}>
                <Text style={styles.itemIndex}>{index + 1}</Text>
                <View style={styles.itemBody}>
                  <Text style={styles.itemName}>{exercise?.name ?? exId}</Text>
                  <Text style={styles.itemMeta}>
                    {exercise === undefined
                      ? '⚠️ 지금 목록에 없는 운동이에요'
                      : `${exercise.sets ?? 1}세트 · 휴식 ${exercise.restSeconds}초`}
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <Mini
                  label="↑"
                  hint={`${index + 1}번째 위로`}
                  disabled={index === 0}
                  onPress={() => {
                    const next = moveExerciseInProgram(draft, index, -1);
                    if (next) setDraft(next);
                  }}
                />
                <Mini
                  label="↓"
                  hint={`${index + 1}번째 아래로`}
                  disabled={index === draft.exerciseIds.length - 1}
                  onPress={() => {
                    const next = moveExerciseInProgram(draft, index, 1);
                    if (next) setDraft(next);
                  }}
                />
                <Mini
                  label="빼기"
                  hint={`${exercise?.name ?? exId} 빼기`}
                  tone="danger"
                  onPress={() =>
                    set(
                      'exerciseIds',
                      draft.exerciseIds.filter((v) => v !== exId),
                    )
                  }
                />
              </View>
            </View>
          );
        })}

        <Button
          label={pickerOpen ? '운동 고르기 닫기' : '운동 넣기'}
          variant="outline"
          onPress={() => setPickerOpen((v) => !v)}
          style={styles.button}
        />

        {pickerOpen ? (
          <>
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="운동 이름으로 찾기"
              placeholderTextColor={colors.textDisabled}
              style={styles.input}
              accessibilityLabel="운동 이름으로 찾기"
            />
            {candidates.slice(0, 20).map((e) => (
              <Pressable
                key={e.id}
                onPress={() => set('exerciseIds', [...draft.exerciseIds, e.id])}
                accessibilityRole="button"
                accessibilityLabel={`${e.name} 넣기`}
                style={({ pressed }) => [styles.candidate, pressed && styles.pressed]}
              >
                <Text style={styles.candidateName}>{e.name}</Text>
                <Text style={styles.candidateMeta}>
                  {e.phase !== null ? `${e.phase}단계 · ` : ''}
                  {e.level === 'beginner' ? '초급' : '중급'}
                </Text>
              </Pressable>
            ))}
            {candidates.length === 0 ? (
              <Text style={styles.hint}>넣을 수 있는 운동이 없어요.</Text>
            ) : null}
          </>
        ) : null}
      </Card>

      <Card title="기본 정보">
        {isNew ? (
          <Field
            label="id (영문·숫자·밑줄)"
            value={draft.id}
            onChangeText={(v) => set('id', v)}
            placeholder="비워 두면 자동으로 만들어져요"
          />
        ) : null}
        <Field label="이름" value={draft.title} onChangeText={(v) => set('title', v)} />
        <Field
          label="설명"
          value={draft.description}
          onChangeText={(v) => set('description', v)}
          multiline
        />
        <Field
          label="어떤 분께 권하나요"
          value={draft.targetUser}
          onChangeText={(v) => set('targetUser', v)}
        />
        <Field label="목표" value={draft.goal} onChangeText={(v) => set('goal', v)} />
        <Field
          label="주당 횟수"
          value={draft.frequencyPerWeek}
          onChangeText={(v) => set('frequencyPerWeek', v)}
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>소요 시간(분)</Text>
          <TextInput
            value={String(draft.durationMinutes)}
            onChangeText={(t) => set('durationMinutes', Number(t.replace(/[^0-9]/g, '') || 0))}
            inputMode="numeric"
            style={styles.input}
            accessibilityLabel="소요 시간(분)"
          />
        </View>

        <Picker
          label="분류"
          options={CATEGORIES}
          value={draft.category}
          onChange={(v) => set('category', v)}
        />
        <Picker label="난이도" options={LEVELS} value={draft.level} onChange={(v) => set('level', v)} />
      </Card>

      <Card title="안전" accent={colors.danger}>
        <Field
          label="중단 기준 (비울 수 없어요)"
          value={draft.stopRule}
          onChangeText={(v) => set('stopRule', v)}
          multiline
        />
        <Field
          label="주의사항 (비울 수 없어요)"
          value={draft.caution}
          onChangeText={(v) => set('caution', v)}
          multiline
        />
        <Field
          label="다음 단계로 가는 기준"
          value={draft.progressionRule}
          onChangeText={(v) => set('progressionRule', v)}
          multiline
        />
      </Card>

      {!isNew ? (
        <Card title="되돌리기 · 지우기">
          {edited && !added ? (
            <Button
              label="이 프로그램을 기본값으로 되돌리기"
              variant="outline"
              onPress={() => {
                void commitLibrary(resetProgram(store, initial.id));
                router.replace('/editor');
              }}
              style={styles.button}
            />
          ) : null}
          <Button
            label={added ? '이 프로그램 지우기' : '목록에서 감추기'}
            variant="danger"
            onPress={confirmRemove}
            style={styles.button}
          />
        </Card>
      ) : null}

      <Button label="목록으로" variant="outline" onPress={() => router.back()} />
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
        accessibilityLabel={label}
      />
    </View>
  );
}

function Picker<T>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.label}
              onPress={() => onChange(o.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={o.label}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={active ? styles.chipTextActive : styles.chipText}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Mini({
  label,
  hint,
  onPress,
  disabled = false,
  tone = 'normal',
}: {
  label: string;
  hint: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'normal' | 'danger';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={hint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.mini,
        disabled && styles.miniDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={tone === 'danger' ? styles.miniTextDanger : styles.miniText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.small, color: colors.primary, marginBottom: spacing.xs },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...typography.small, color: colors.textMuted, marginBottom: spacing.xs },
  input: {
    minHeight: MIN_TOUCH_SIZE,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  item: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHead: { flexDirection: 'row', alignItems: 'flex-start' },
  itemIndex: { ...typography.smallStrong, color: colors.primaryText, width: 20 },
  itemBody: { flex: 1 },
  itemName: { ...typography.smallStrong, color: colors.text },
  itemMeta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
  itemActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  mini: {
    minHeight: MIN_TOUCH_SIZE,
    minWidth: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  miniDisabled: { opacity: 0.4 },
  miniText: { ...typography.small, color: colors.text },
  miniTextDanger: { ...typography.small, color: colors.dangerText },
  pressed: { opacity: 0.7 },
  candidate: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  candidateName: { ...typography.body, color: colors.text },
  candidateMeta: { ...typography.caption, color: colors.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textMuted },
  chipTextActive: { ...typography.caption, color: colors.onPrimary },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  button: { marginTop: spacing.md },
});
