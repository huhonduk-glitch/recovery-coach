import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { ScreenContainer } from './ScreenContainer';

interface Props {
  title: string;
  /** 이 화면을 구현할 마일스톤 (예: 'M2') */
  milestone: string;
  description: string;
}

/**
 * 아직 구현하지 않은 화면의 자리표시자.
 * 라우팅 구조를 먼저 세워 두기 위한 것이며, 마일스톤 진행에 따라 교체된다.
 */
export function PlaceholderScreen({ title, milestone, description }: Props) {
  return (
    <ScreenContainer>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{milestone} 에서 구현 예정</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
});
