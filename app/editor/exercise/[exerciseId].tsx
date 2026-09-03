import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, EmptyState, SafetyNotice, Screen } from '@/components';
import type {
  BodyRegion,
  Equipment,
  ExerciseLevel,
} from '@/features/assessment/assessmentTypes';
import type { Exercise, ExerciseCategory, Phase } from '@/features/exercise/exerciseTypes';
import {
  addExercise,
  estimateSeconds,
  isExerciseAdded,
  isExerciseEdited,
  removeExercise,
  resetExercise,
  resolveExercise,
  restoreExercise,
  saveExercise,
  type LibraryResult,
} from '@/features/library/exerciseLibrary';
import { PHASE_CHANGE_WARNING } from '@/features/library/libraryTypes';
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
const REGIONS: { value: BodyRegion | null; label: string }[] = [
  { value: null, label: '해당 없음' },
  { value: 'shoulder', label: '어깨' },
  { value: 'lowBack', label: '허리' },
  { value: 'knee', label: '무릎' },
  { value: 'ankle', label: '발목' },
  { value: 'neckUpperBack', label: '목·등' },
];
const PHASES: { value: Phase | null; label: string }[] = [
  { value: null, label: '없음' },
  { value: 1, label: '1단계' },
  { value: 2, label: '2단계' },
  { value: 3, label: '3단계' },
  { value: 4, label: '4단계' },
];
const LEVELS: { value: ExerciseLevel; label: string }[] = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
];
const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: 'bodyweight', label: '맨몸' },
  { value: 'band', label: '밴드' },
  { value: 'dumbbell', label: '덤벨' },
  { value: 'foamRoller', label: '폼롤러' },
  { value: 'mat', label: '매트' },
];

function blankExercise(): Exercise {
  return {
    id: '',
    name: '',
    category: 'functional',
    bodyRegion: null,
    phase: null,
    level: 'beginner',
    equipment: ['bodyweight'],
    purpose: '',
    description: [],
    restSeconds: 30,
    cues: [],
    commonMistakes: [],
    precautions: [],
    regressions: [],
    progressions: [],
    videoUrl: null,
    thumbnailUrl: null,
    estimatedSeconds: 0,
  };
}

/** 운동 편집 */
export default function ExerciseEditorScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const id = typeof exerciseId === 'string' ? exerciseId : '';
  const store = useLibrary();
  const isNew = id === 'new';
  const existing = isNew ? undefined : resolveExercise(store, id);

  if (!isNew && existing === undefined) {
    const hidden = store.removedExerciseIds.includes(id);
    return (
      <Screen>
        <EmptyState
          title={hidden ? '감춰 둔 운동이에요' : '운동을 찾지 못했어요'}
          description={
            hidden
              ? '다시 보이게 하면 편집할 수 있어요.'
              : '목록에서 다시 골라 주세요.'
          }
          actionLabel={hidden ? '다시 보이게 하기' : '목록으로'}
          onAction={() => {
            if (hidden) void commitLibrary(restoreExercise(store, id));
            else router.replace('/editor');
          }}
        />
      </Screen>
    );
  }

  return <Editor key={id} initial={existing ?? blankExercise()} isNew={isNew} />;
}

function Editor({ initial, isNew }: { initial: Exercise; isNew: boolean }) {
  const store = useLibrary();
  const [draft, setDraft] = useState<Exercise>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const edited = isExerciseEdited(store, initial.id);
  const added = isExerciseAdded(store, initial.id);
  const regionOrPhaseChanged =
    draft.bodyRegion !== initial.bodyRegion || draft.phase !== initial.phase;

  function set<K extends keyof Exercise>(key: K, value: Exercise[K]) {
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
      const id = draft.id.trim().length > 0 ? draft.id.trim() : `my-${Date.now()}`;
      const result = addExercise(store, { ...draft, id });
      if (result.ok) {
        void commitLibrary(result.store);
        router.replace(`/editor/exercise/${id}`);
        return;
      }
      apply(result);
      return;
    }
    apply(saveExercise(store, draft));
  }

  function confirmRemove() {
    const message = added
      ? '이 운동을 완전히 지울까요? 되돌릴 수 없습니다.'
      : '이 운동을 목록에서 감출까요? 나중에 다시 보이게 할 수 있습니다.';
    const run = () => {
      const result = removeExercise(store, initial.id);
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
      <Text style={styles.eyebrow}>운동 편집</Text>
      <Text style={styles.title} accessibilityRole="header">
        {isNew ? '새 운동 만들기' : initial.name}
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

      <Card title="기본 정보">
        {isNew ? (
          <Field
            label="id (영문·숫자·하이픈)"
            value={draft.id}
            onChangeText={(v) => set('id', v)}
            placeholder="비워 두면 자동으로 만들어져요"
          />
        ) : null}
        <Field label="이름" value={draft.name} onChangeText={(v) => set('name', v)} />
        <Field
          label="왜 하는 운동인가요 (한 줄)"
          value={draft.purpose}
          onChangeText={(v) => set('purpose', v)}
        />

        <Picker
          label="분류"
          options={CATEGORIES}
          value={draft.category}
          onChange={(v) => set('category', v)}
        />
        <Picker
          label="부위"
          options={REGIONS}
          value={draft.bodyRegion}
          onChange={(v) => set('bodyRegion', v)}
        />
        <Picker label="단계" options={PHASES} value={draft.phase} onChange={(v) => set('phase', v)} />
        <Picker label="난이도" options={LEVELS} value={draft.level} onChange={(v) => set('level', v)} />

        <Text style={styles.fieldLabel}>필요한 도구 (여러 개 고를 수 있어요)</Text>
        <View style={styles.chipRow}>
          {EQUIPMENT.map((eq) => {
            const on = draft.equipment.includes(eq.value);
            return (
              <Chip
                key={eq.value}
                label={eq.label}
                active={on}
                onPress={() =>
                  set(
                    'equipment',
                    on
                      ? draft.equipment.filter((v) => v !== eq.value)
                      : [...draft.equipment, eq.value],
                  )
                }
              />
            );
          })}
        </View>

        {regionOrPhaseChanged ? (
          <SafetyNotice tone="warning" title="배정이 달라집니다" text={PHASE_CHANGE_WARNING} />
        ) : null}
      </Card>

      <Card title="세트와 횟수">
        <View style={styles.numberRow}>
          <NumberField
            label="세트"
            value={draft.sets}
            onChange={(v) => set('sets', v)}
            allowEmpty
          />
          <NumberField label="횟수" value={draft.reps} onChange={(v) => set('reps', v)} allowEmpty />
        </View>
        <View style={styles.numberRow}>
          <NumberField
            label="유지 시간(초)"
            value={draft.durationSeconds}
            onChange={(v) => set('durationSeconds', v)}
            allowEmpty
          />
          <NumberField
            label="휴식(초)"
            value={draft.restSeconds}
            onChange={(v) => set('restSeconds', v ?? 0)}
          />
        </View>
        <Text style={styles.hint}>
          예상 소요 시간 {Math.round(estimateSeconds(draft) / 60)}분 {estimateSeconds(draft) % 60}초
          — 세트·횟수·휴식으로 자동 계산돼요.
        </Text>
      </Card>

      <Card title="동작 설명">
        <ListField
          label="순서 (한 줄에 하나씩)"
          value={draft.description}
          onChange={(v) => set('description', v)}
        />
        <ListField label="코칭 문구" value={draft.cues} onChange={(v) => set('cues', v)} />
        <ListField
          label="흔한 실수"
          value={draft.commonMistakes}
          onChange={(v) => set('commonMistakes', v)}
        />
      </Card>

      <Card title="안전" accent={colors.danger}>
        <ListField
          label="주의사항 (비울 수 없어요)"
          value={draft.precautions}
          onChange={(v) => set('precautions', v)}
        />
        <Text style={styles.hint}>
          이 동작에서 무엇을 조심해야 하는지, 어떤 느낌이 나면 멈춰야 하는지 적어 주세요.
        </Text>
      </Card>

      <Card title="쉬운 버전 · 어려운 버전">
        <ListField
          label="쉬운 버전"
          value={draft.regressions}
          onChange={(v) => set('regressions', v)}
        />
        <ListField
          label="어려운 버전"
          value={draft.progressions}
          onChange={(v) => set('progressions', v)}
        />
      </Card>

      {!isNew ? (
        <Card title="되돌리기 · 지우기">
          {edited && !added ? (
            <Button
              label="이 운동을 기본값으로 되돌리기"
              variant="outline"
              onPress={() => {
                void commitLibrary(resetExercise(store, initial.id));
                router.replace('/editor');
              }}
              style={styles.button}
            />
          ) : null}
          <Button
            label={added ? '이 운동 지우기' : '목록에서 감추기'}
            variant="danger"
            onPress={confirmRemove}
            style={styles.button}
          />
          <Text style={styles.hint}>
            {added
              ? '직접 만드신 운동이라 완전히 지워집니다.'
              : '기본 운동은 지우지 않고 감춥니다. 편집 목록에서 다시 보이게 할 수 있어요.'}
          </Text>
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
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        style={styles.input}
        accessibilityLabel={label}
      />
    </View>
  );
}

/** 여러 줄을 한 줄에 하나씩 편집한다 */
function ListField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value.join('\n')}
        onChangeText={(text) =>
          onChange(
            text
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0),
          )
        }
        multiline
        style={[styles.input, styles.multiline]}
        accessibilityLabel={label}
      />
    </View>
  );
}

function NumberField({
  label,
  value,
  onChange,
  allowEmpty = false,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  allowEmpty?: boolean;
}) {
  return (
    <View style={styles.numberField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value === undefined ? '' : String(value)}
        onChangeText={(text) => {
          const digits = text.replace(/[^0-9]/g, '');
          if (digits === '') {
            onChange(allowEmpty ? undefined : 0);
            return;
          }
          onChange(Number(digits));
        }}
        inputMode="numeric"
        style={styles.input}
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
        {options.map((o) => (
          <Chip
            key={o.label}
            label={o.label}
            active={o.value === value}
            onPress={() => onChange(o.value)}
          />
        ))}
      </View>
    </View>
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
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  numberRow: { flexDirection: 'row', gap: spacing.md },
  numberField: { flex: 1, marginBottom: spacing.md },
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
