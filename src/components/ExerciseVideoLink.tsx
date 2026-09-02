import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { buildSearchUrl, getExerciseVideo } from '@/data/exerciseVideos';
import type { Exercise } from '@/features/exercise/exerciseTypes';
import { colors, radius, spacing, typography } from '@/theme';

import { Button } from './Button';

const REGION_LABEL = {
  shoulder: '어깨',
  lowBack: '허리',
  knee: '무릎',
  ankle: '발목',
  neckUpperBack: '목',
} as const;

/**
 * 동작 영상 링크.
 *
 * 영상을 앱 안에서 재생하지 않는다. 유튜브 앱이나 브라우저를 열어 준다.
 * 영상은 원작자 채널에서 재생되며, 앱은 링크만 보관한다.
 */
export function ExerciseVideoLink({ exercise }: { exercise: Exercise }) {
  const video = getExerciseVideo(exercise.id);

  async function open(url: string) {
    if (Platform.OS === 'web') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) await Linking.openURL(url);
  }

  if (video !== null) {
    return (
      <View style={styles.root}>
        <Text style={styles.label}>동작 영상</Text>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.source}>
          {video.source}
          {video.korean === false ? ' · 영어 영상' : ''}
        </Text>

        <Button
          label="유튜브에서 영상 보기"
          variant="outline"
          onPress={() => void open(video.url)}
          style={styles.button}
        />
        <Text style={styles.note}>
          영상은 만든 분의 채널에서 재생됩니다. 앱의 글 설명과 자세가 다르면 글 설명을 따라
          주세요.
        </Text>
      </View>
    );
  }

  const regionLabel = exercise.bodyRegion ? REGION_LABEL[exercise.bodyRegion] : null;

  return (
    <View style={styles.root}>
      <Text style={styles.label}>동작 영상</Text>
      <Text style={styles.title}>아직 연결된 영상이 없어요</Text>

      <Button
        label="유튜브에서 찾아보기"
        variant="outline"
        onPress={() => void open(buildSearchUrl(exercise.name, regionLabel))}
        style={styles.button}
      />
      <Text style={styles.note}>
        검색 결과는 앱이 검증하지 않았습니다. 통증을 참으라거나 무리하라는 영상은 따라 하지
        마세요.
      </Text>
    </View>
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
  label: { ...typography.small, color: colors.primary, marginBottom: spacing.xs },
  title: { ...typography.bodyStrong, color: colors.text },
  source: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
  button: { marginTop: spacing.lg },
  note: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
});
