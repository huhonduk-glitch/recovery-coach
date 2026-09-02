import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Tone = 'info' | 'warning' | 'danger';

interface Props {
  title?: string;
  items?: readonly string[];
  text?: string;
  tone?: Tone;
}

/** 연한 배경 위에서는 글자 전용 진한 색을 쓴다 (대비 4.5:1 이상) */
const TONE_STYLE: Record<Tone, { bg: string; border: string; title: string }> = {
  info: { bg: colors.primaryLight, border: colors.primary, title: colors.primaryText },
  warning: { bg: colors.warningLight, border: colors.warning, title: colors.warningText },
  danger: { bg: colors.dangerLight, border: colors.danger, title: colors.dangerText },
};

/** 주의사항·중단 안내 카드. danger 는 위험 신호 전용이다. */
export function SafetyNotice({ title, items, text, tone = 'warning' }: Props) {
  const style = TONE_STYLE[tone];

  return (
    <View
      style={[styles.root, { backgroundColor: style.bg, borderColor: style.border }]}
      accessibilityRole="alert"
    >
      {title ? <Text style={[styles.title, { color: style.title }]}>{title}</Text> : null}
      {text ? <Text style={styles.text}>{text}</Text> : null}
      {items?.map((item) => (
        <Text key={item} style={styles.item}>
          · {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: { ...typography.bodyStrong, marginBottom: spacing.sm },
  text: { ...typography.body, color: colors.text },
  item: { ...typography.body, color: colors.text, marginTop: spacing.xxs },
});
