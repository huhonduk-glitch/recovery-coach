import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  title: string;
  items: string[];
  tone?: 'default' | 'positive' | 'limit';
}

/** 추천 음식·피할 습관 등을 태그로 보여 주는 카드 */
export function NutritionCard({ title, items, tone = 'default' }: Props) {
  if (items.length === 0) return null;

  const chipStyle =
    tone === 'positive' ? styles.chipPositive : tone === 'limit' ? styles.chipLimit : styles.chip;
  const textStyle =
    tone === 'positive'
      ? styles.chipTextPositive
      : tone === 'limit'
        ? styles.chipTextLimit
        : styles.chipText;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chips}>
        {items.map((item) => (
          <View key={item} style={[styles.chipBase, chipStyle]}>
            <Text style={textStyle}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: spacing.lg },
  title: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipBase: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chip: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  chipPositive: { backgroundColor: colors.secondaryLight, borderColor: colors.secondary },
  chipLimit: { backgroundColor: colors.warningLight, borderColor: colors.warning },
  chipText: { ...typography.small, color: colors.text },
  chipTextPositive: { ...typography.small, color: colors.secondaryText },
  chipTextLimit: { ...typography.small, color: colors.warningText },
});
