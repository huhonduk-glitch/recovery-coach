import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '@/theme';

interface Props {
  children: ReactNode;
  title?: string;
  /** 좌측 색 띠 (위험도·목표 태그 표시용) */
  accent?: string;
  style?: ViewStyle;
}

/** 앱 전체에서 쓰는 둥근 카드 */
export function Card({ children, title, accent, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      {accent ? <View style={[styles.accent, { backgroundColor: accent }]} /> : null}
      <View style={styles.content}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  accent: { width: 5 },
  content: { flex: 1, padding: spacing.lg },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.md },
});
