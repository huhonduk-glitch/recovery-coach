import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  /** 하단에 고정할 요소 (예: 다음 버튼) */
  footer?: ReactNode;
}

/** 모든 화면의 바깥 껍데기. 안전영역 여백과 배경을 한곳에서 관리한다. */
export function Screen({ children, scroll = true, footer }: Props) {
  const insets = useSafeAreaInsets();

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
      }}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        {
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      {body}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>{footer}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
