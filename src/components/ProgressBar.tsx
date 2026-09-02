import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  current: number;
  total: number;
  showLabel?: boolean;
}

/** 설문·루틴 진행률 */
export function ProgressBar({ current, total, showLabel = true }: Props) {
  const ratio = total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0;

  return (
    <View style={styles.root}>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: current }}
      >
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      {showLabel ? (
        <Text style={styles.label}>
          {current} / {total}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  label: { ...typography.caption, color: colors.textMuted, marginLeft: spacing.md, minWidth: 44 },
});
