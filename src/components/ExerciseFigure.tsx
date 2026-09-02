import { Image, StyleSheet, Text, View } from 'react-native';

import { getExerciseImage } from '@/data/exerciseImages';
import type { Exercise } from '@/features/exercise/exerciseTypes';
import { colors, radius, spacing, typography } from '@/theme';

import { BodyDiagram } from './BodyDiagram';

interface Props {
  exercise: Exercise;
  /** 크게 보여 줄지 (운동 상세) 작게 보여 줄지 (플레이어) */
  compact?: boolean;
}

/**
 * 운동 동작 그림.
 *
 * 순서대로 찾아서 보여 준다.
 *   1) 앱에 등록된 이미지 (src/data/exerciseImages.ts)
 *   2) 원격 썸네일 URL (exercise.thumbnailUrl)
 *   3) 둘 다 없으면 부위 표시 그림 + 안내
 *
 * ⚠️ 부위 표시 그림은 '어디를 쓰는 운동인지'만 알려 준다.
 *    자세를 보여 주는 그림이 아니라는 점을 화면에서 분명히 밝힌다.
 */
export function ExerciseFigure({ exercise, compact = false }: Props) {
  const local = getExerciseImage(exercise.id);
  const remote = exercise.thumbnailUrl;
  const height = compact ? 160 : 220;

  if (local !== null) {
    return (
      <Image
        source={local}
        style={[styles.image, { height }]}
        resizeMode="contain"
        accessibilityLabel={`${exercise.name} 동작 사진`}
      />
    );
  }

  if (remote !== null && remote.length > 0) {
    return (
      <Image
        source={{ uri: remote }}
        style={[styles.image, { height }]}
        resizeMode="contain"
        accessibilityLabel={`${exercise.name} 동작 사진`}
      />
    );
  }

  return (
    <View
      style={[styles.placeholder, { minHeight: height }]}
      accessibilityLabel={`${exercise.name} — 동작 사진은 준비 중입니다. 아래 글 설명을 따라 해 주세요.`}
    >
      <BodyDiagram region={exercise.bodyRegion} size={compact ? 70 : 90} />

      <View style={styles.textArea}>
        <Text style={styles.title}>
          {exercise.bodyRegion ? `${REGION_LABEL[exercise.bodyRegion]} 부위 운동` : '전신 운동'}
        </Text>
        <Text style={styles.body}>
          동작 사진은 준비 중이에요. 아래 설명과 핵심 포인트만 따라 하셔도 충분합니다.
        </Text>
      </View>
    </View>
  );
}

const REGION_LABEL = {
  shoulder: '어깨',
  lowBack: '허리',
  knee: '무릎',
  ankle: '발목',
  neckUpperBack: '목·등 상부',
} as const;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.lg,
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  textArea: { flex: 1 },
  title: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.xs },
  body: { ...typography.small, color: colors.textMuted },
});
