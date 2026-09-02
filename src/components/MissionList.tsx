import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { NutritionMission } from '@/features/nutrition/nutritionTypes';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

interface Props {
  missions: NutritionMission[];
  doneIds?: string[];
  onToggle?: (id: string) => void;
}

/** 오늘의 영양 미션 체크리스트 */
export function MissionList({ missions, doneIds = [], onToggle }: Props) {
  return (
    <View>
      {missions.map((mission, index) => {
        const done = doneIds.includes(mission.id);
        const content = (
          <View style={[styles.row, done && styles.rowDone]}>
            <View style={[styles.check, done && styles.checkDone]}>
              <Text style={[styles.checkText, done && styles.checkTextDone]}>
                {done ? '✓' : index + 1}
              </Text>
            </View>
            <View style={styles.body}>
              <Text style={[styles.text, done && styles.textDone]}>{mission.text}</Text>
              <Text style={styles.reason}>{mission.reason}</Text>
            </View>
          </View>
        );

        if (!onToggle) return <View key={mission.id}>{content}</View>;

        return (
          <Pressable
            key={mission.id}
            onPress={() => onToggle(mission.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={mission.text}
          >
            {content}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: MIN_TOUCH_SIZE,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowDone: { backgroundColor: colors.secondaryLight, borderColor: colors.secondary },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkDone: { backgroundColor: colors.secondary },
  checkText: { ...typography.smallStrong, color: colors.textMuted },
  checkTextDone: { color: colors.onPrimary },
  body: { flex: 1 },
  text: { ...typography.body, color: colors.text },
  textDone: { color: '#065F46' },
  reason: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
});
