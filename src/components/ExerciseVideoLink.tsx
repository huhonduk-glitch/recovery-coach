import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { buildSearchUrl, getExerciseVideos, type ExerciseVideo } from '@/data/exerciseVideos';
import type { Exercise } from '@/features/exercise/exerciseTypes';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

import { Button } from './Button';

const REGION_LABEL = {
  shoulder: '어깨',
  lowBack: '허리',
  knee: '무릎',
  ankle: '발목',
  neckUpperBack: '목',
} as const;

async function openUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) await Linking.openURL(url);
}

/**
 * 동작 영상 링크.
 *
 * 영상을 앱 안에서 재생하지 않는다. 유튜브 앱이나 브라우저를 열어 준다.
 * 영상은 원작자 채널에서 재생되며, 앱은 링크만 보관한다.
 *
 * 한 동작에 영상이 여러 개일 수 있다. 시연 영상과 함께 '흔한 실수' 나
 * 다른 견해를 다루는 영상을 나란히 보여 주기 위해서다.
 */
export function ExerciseVideoLink({ exercise }: { exercise: Exercise }) {
  const videos = getExerciseVideos(exercise.id);
  const regionLabel = exercise.bodyRegion ? REGION_LABEL[exercise.bodyRegion] : null;

  if (videos.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.label}>동작 영상</Text>
        <Text style={styles.title}>아직 연결된 영상이 없어요</Text>

        <Button
          label="유튜브에서 찾아보기"
          variant="outline"
          onPress={() => void openUrl(buildSearchUrl(exercise.name, regionLabel))}
          style={styles.searchButton}
        />
        <Text style={styles.note}>
          검색 결과는 앱이 검증하지 않았습니다. 통증을 참으라거나 무리하라는 영상은 따라 하지
          마세요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.label}>동작 영상 {videos.length}개</Text>

      {videos.map((video, index) => (
        <VideoRow key={video.url} video={video} index={index} exerciseName={exercise.name} />
      ))}

      <Text style={styles.note}>
        영상은 만든 분의 채널에서 재생됩니다. 앱의 글 설명과 자세가 다르면 글 설명을 따라
        주세요.
      </Text>
    </View>
  );
}

function VideoRow({
  video,
  index,
  exerciseName,
}: {
  video: ExerciseVideo;
  index: number;
  exerciseName: string;
}) {
  return (
    <Pressable
      onPress={() => void openUrl(video.url)}
      accessibilityRole="link"
      accessibilityLabel={`${exerciseName} 영상 ${index + 1}: ${video.title}. 유튜브에서 열립니다.`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.playMark}>
        <Text style={styles.playMarkText}>▶</Text>
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{video.title}</Text>
        <Text style={styles.rowSource}>
          {video.source}
          {video.korean ? '' : ' · 영어 영상'}
        </Text>
        {video.note ? <Text style={styles.rowNote}>{video.note}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: { ...typography.small, color: colors.primary, marginBottom: spacing.md },
  title: { ...typography.bodyStrong, color: colors.text },
  searchButton: { marginTop: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: MIN_TOUCH_SIZE,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowPressed: { opacity: 0.75 },
  playMark: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  playMarkText: { color: colors.onPrimary, fontSize: 11 },
  rowBody: { flex: 1 },
  rowTitle: { ...typography.smallStrong, color: colors.text },
  rowSource: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
  rowNote: { ...typography.caption, color: colors.warningText, marginTop: spacing.xs },
  note: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
});
