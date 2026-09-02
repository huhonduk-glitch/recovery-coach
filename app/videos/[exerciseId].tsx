import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button, Card, EmptyState, SafetyNotice, Screen } from '@/components';
import { getExercise } from '@/data/exercises';
import type { ExerciseVideo } from '@/data/exerciseVideos';
import type { Exercise } from '@/features/exercise/exerciseTypes';
import {
  clearVideoOverrides,
  commitVideoOverrides,
  useVideoOverrides,
} from '@/features/videos/useVideoOverrides';
import {
  addVideo,
  isCustomized,
  moveVideo,
  removeVideo,
  resetExercise,
  resolveVideos,
  updateVideo,
  type EditResult,
} from '@/features/videos/videoLibrary';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

interface FormState {
  url: string;
  title: string;
  source: string;
  korean: boolean;
  note: string;
}

const EMPTY_FORM: FormState = { url: '', title: '', source: '', korean: true, note: '' };

/** 한 동작의 영상 목록 편집 */
export default function VideoEditorScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const exercise = getExercise(typeof exerciseId === 'string' ? exerciseId : '');

  if (exercise === undefined) {
    return (
      <Screen>
        <EmptyState
          title="동작을 찾지 못했어요"
          description="목록에서 다시 골라 주세요."
          actionLabel="목록으로"
          onAction={() => router.replace('/videos')}
        />
      </Screen>
    );
  }

  return <Editor exercise={exercise} />;
}

function Editor({ exercise }: { exercise: Exercise }) {
  const overrides = useVideoOverrides();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  /** null 이면 새로 추가, 숫자면 그 번째 영상 수정 */
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const videos = resolveVideos(overrides, exercise.id);
  const customized = isCustomized(overrides, exercise.id);

  function apply(result: EditResult, okMessage: string) {
    if (!result.ok) {
      setError(result.reason);
      setMessage(null);
      return;
    }
    setError(null);
    setMessage(okMessage);
    void commitVideoOverrides(result.store);
  }

  function submit() {
    if (editingIndex === null) {
      const result = addVideo(overrides, exercise.id, {
        url: form.url,
        title: form.title,
        source: form.source,
        korean: form.korean,
        note: form.note,
      });
      if (result.ok) setForm(EMPTY_FORM);
      apply(result, '영상을 추가했어요.');
      return;
    }

    const result = updateVideo(overrides, exercise.id, editingIndex, {
      title: form.title,
      source: form.source,
      korean: form.korean,
      note: form.note,
    });
    if (result.ok) {
      setForm(EMPTY_FORM);
      setEditingIndex(null);
    }
    apply(result, '영상 정보를 고쳤어요.');
  }

  function startEdit(index: number) {
    const video = videos[index];
    if (video === undefined) return;
    setEditingIndex(index);
    setError(null);
    setMessage(null);
    setForm({
      url: video.url,
      title: video.title,
      source: video.source,
      korean: video.korean,
      note: video.note ?? '',
    });
  }

  function cancelEdit() {
    setEditingIndex(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function confirmRemove(index: number) {
    const video = videos[index];
    if (video === undefined) return;
    confirm(`'${video.title}' 을 목록에서 지울까요?`, () => {
      if (editingIndex === index) cancelEdit();
      apply(removeVideo(overrides, exercise.id, index), '영상을 지웠어요.');
    });
  }

  function confirmReset() {
    confirm('이 동작의 영상 목록을 기본값으로 되돌릴까요? 직접 넣은 영상은 사라집니다.', () => {
      cancelEdit();
      setMessage('기본 목록으로 되돌렸어요.');
      void commitVideoOverrides(resetExercise(overrides, exercise.id));
    });
  }

  return (
    <Screen footer={<Button label="목록으로" variant="outline" onPress={() => router.back()} />}>
      <Text style={styles.eyebrow}>동작 영상 관리</Text>
      <Text style={styles.title} accessibilityRole="header">
        {exercise.name}
      </Text>
      <Text style={styles.desc}>{exercise.purpose}</Text>

      <Card title={`연결된 영상 ${videos.length}개`}>
        {videos.length === 0 ? (
          <Text style={styles.emptyText}>
            아직 연결된 영상이 없어요. 아래에서 유튜브 주소를 넣어 추가해 주세요.
          </Text>
        ) : null}

        {videos.map((video, index) => (
          <VideoRow
            key={video.url}
            video={video}
            index={index}
            total={videos.length}
            editing={editingIndex === index}
            onOpen={() => void openUrl(video.url)}
            onUp={() => apply(moveVideo(overrides, exercise.id, index, -1), '순서를 바꿨어요.')}
            onDown={() => apply(moveVideo(overrides, exercise.id, index, 1), '순서를 바꿨어요.')}
            onEdit={() => startEdit(index)}
            onRemove={() => confirmRemove(index)}
          />
        ))}

        {customized ? (
          <>
            <Text style={styles.customNote}>
              이 동작은 앱에서 직접 바꾼 목록을 쓰고 있어요.
            </Text>
            <Button
              label="기본 목록으로 되돌리기"
              variant="outline"
              onPress={confirmReset}
              style={styles.resetButton}
            />
          </>
        ) : null}
      </Card>

      <Card title={editingIndex === null ? '영상 추가' : `${editingIndex + 1}번째 영상 수정`}>
        {editingIndex === null ? (
          <>
            <Field
              label="영상 주소"
              value={form.url}
              onChangeText={(v) => setForm((p) => ({ ...p, url: v }))}
              placeholder="https://www.youtube.com/watch?v=..."
              autoCapitalize="none"
            />
            <Text style={styles.hint}>
              유튜브(watch · youtu.be · Shorts)와 인스타그램(릴스 · 게시물) 주소를 넣을 수 있어요.
            </Text>
          </>
        ) : (
          <Text style={styles.lockedUrl}>{form.url}</Text>
        )}

        <Field
          label="제목"
          value={form.title}
          onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
          placeholder="예) 쿼드셋 정확한 자세"
        />

        <Field
          label="출처 (채널 이름)"
          value={form.source}
          onChangeText={(v) => setForm((p) => ({ ...p, source: v }))}
          placeholder="비워 두면 '직접 등록' 으로 표시돼요"
        />

        <Field
          label="안내 문구 (선택)"
          value={form.note}
          onChangeText={(v) => setForm((p) => ({ ...p, note: v }))}
          placeholder="예) 3분 40초부터 해당 동작입니다"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>한국어 영상</Text>
          <Switch
            value={form.korean}
            onValueChange={(v) => setForm((p) => ({ ...p, korean: v }))}
            accessibilityLabel="한국어 영상 여부"
          />
        </View>

        {error !== null ? <Text style={styles.error}>{error}</Text> : null}
        {message !== null && error === null ? (
          <Text style={styles.message}>{message}</Text>
        ) : null}

        <Button
          label={editingIndex === null ? '이 영상 추가하기' : '수정 내용 저장'}
          onPress={submit}
          style={styles.submitButton}
        />
        {editingIndex !== null ? (
          <Button label="수정 취소" variant="outline" onPress={cancelEdit} style={styles.cancel} />
        ) : null}
      </Card>

      <SafetyNotice
        tone="warning"
        title="영상을 고르실 때"
        items={[
          '만든 사람이 물리치료사·운동전문가인지 확인해 주세요.',
          '앱의 글 설명과 자세가 같은 영상을 골라 주세요.',
          '통증을 참으라거나 무리하라는 말이 나오는 영상은 넣지 말아 주세요.',
          '영상 파일을 받아서 넣는 것은 저작권 침해입니다. 주소만 넣어 주세요.',
        ]}
      />

      <Card title="전체 되돌리기">
        <Text style={styles.emptyText}>
          모든 동작의 영상 목록을 앱에 처음 들어 있던 상태로 되돌립니다. 되돌릴 수 없습니다.
        </Text>
        <Button
          label="전체 기본값으로 되돌리기"
          variant="danger"
          onPress={() =>
            confirm('모든 동작의 영상 목록을 기본값으로 되돌릴까요? 되돌릴 수 없습니다.', () => {
              cancelEdit();
              setMessage('전체를 기본 목록으로 되돌렸어요.');
              void clearVideoOverrides();
            })
          }
          style={styles.resetButton}
        />
      </Card>
    </Screen>
  );
}

function VideoRow({
  video,
  index,
  total,
  editing,
  onOpen,
  onUp,
  onDown,
  onEdit,
  onRemove,
}: {
  video: ExerciseVideo;
  index: number;
  total: number;
  editing: boolean;
  onOpen: () => void;
  onUp: () => void;
  onDown: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={[styles.row, editing && styles.rowEditing]}>
      <View style={styles.rowHead}>
        <Text style={styles.rowIndex}>{index + 1}</Text>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>{video.title}</Text>
          <Text style={styles.rowSource}>
            {video.source}
            {video.korean ? '' : ' · 영어 영상'}
          </Text>
          {video.note !== undefined ? <Text style={styles.rowNote}>{video.note}</Text> : null}
        </View>
      </View>

      <View style={styles.actions}>
        <MiniButton label="↑" hint={`${index + 1}번째 영상 위로`} disabled={index === 0} onPress={onUp} />
        <MiniButton
          label="↓"
          hint={`${index + 1}번째 영상 아래로`}
          disabled={index === total - 1}
          onPress={onDown}
        />
        <MiniButton label="열기" hint={`${video.title} 열기`} onPress={onOpen} />
        <MiniButton label="수정" hint={`${video.title} 수정`} onPress={onEdit} />
        <MiniButton label="삭제" hint={`${video.title} 삭제`} tone="danger" onPress={onRemove} />
      </View>
    </View>
  );
}

function MiniButton({
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
        pressed && !disabled && styles.miniPressed,
      ]}
    >
      <Text style={tone === 'danger' ? styles.miniTextDanger : styles.miniText}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.input}
        accessibilityLabel={label}
      />
    </View>
  );
}

/** 웹에서는 Alert 가 뜨지 않아 confirm 을 쓴다 */
function confirm(message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert('확인', message, [
    { text: '취소', style: 'cancel' },
    { text: '진행', style: 'destructive', onPress: onConfirm },
  ]);
}

async function openUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) await Linking.openURL(url);
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.small, color: colors.primary, marginBottom: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  desc: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  emptyText: { ...typography.body, color: colors.textMuted },
  row: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowEditing: { borderWidth: 2, borderColor: colors.primary },
  rowHead: { flexDirection: 'row', alignItems: 'flex-start' },
  rowIndex: { ...typography.smallStrong, color: colors.primaryText, width: 20 },
  rowBody: { flex: 1 },
  rowTitle: { ...typography.smallStrong, color: colors.text },
  rowSource: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
  rowNote: { ...typography.caption, color: colors.warningText, marginTop: spacing.xxs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
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
  miniPressed: { opacity: 0.7 },
  miniDisabled: { opacity: 0.4 },
  miniText: { ...typography.small, color: colors.text },
  miniTextDanger: { ...typography.small, color: colors.dangerText },
  customNote: { ...typography.small, color: colors.secondaryText, marginTop: spacing.sm },
  resetButton: { marginTop: spacing.md },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...typography.small, color: colors.textMuted, marginBottom: spacing.xs },
  input: {
    minHeight: MIN_TOUCH_SIZE,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
  },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  lockedUrl: { ...typography.caption, color: colors.textDisabled, marginBottom: spacing.md },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH_SIZE,
  },
  switchLabel: { ...typography.body, color: colors.text },
  error: { ...typography.small, color: colors.dangerText, marginTop: spacing.sm },
  message: { ...typography.small, color: colors.secondaryText, marginTop: spacing.sm },
  submitButton: { marginTop: spacing.lg },
  cancel: { marginTop: spacing.sm },
});
