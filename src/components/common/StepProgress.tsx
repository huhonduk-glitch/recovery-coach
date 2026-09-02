import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  current: number;
  total: number;
}

/** 설문 진행률. 사용자가 '몇 개 남았는지' 알 수 있어야 이탈이 줄어든다. */
export function StepProgress({ current, total }: Props) {
  const ratio = Math.min(Math.max(current / total, 0), 1);

  return (
    <View style={styles.root}>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: current }}
      >
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.label}>
        {current} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  label: { ...typography.caption, color: colors.textMuted, marginLeft: spacing.md },
});
