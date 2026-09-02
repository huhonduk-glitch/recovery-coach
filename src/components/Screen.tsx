import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  /** 하단에 고정할 요소 (예: 다음 버튼) */
  footer?: ReactNode;
}

/**
 * 모든 화면의 바깥 껍데기.
 *
 * 안전영역 여백과 배경색을 한곳에서 관리한다.
 * 웹에서는 화면이 가로로 끝없이 늘어나지 않도록 폭을 제한하고 가운데 정렬한다.
 */
export function Screen({ children, scroll = true, footer }: Props) {
  const insets = useSafeAreaInsets();

  const contentPadding = {
    paddingTop: insets.top + spacing.lg,
    paddingHorizontal: spacing.lg,
  };

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[contentPadding, { paddingBottom: spacing.xxl }]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentPadding]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.page}>
        {body}
        {footer ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
            {footer}
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** 웹에서 본문이 읽기 좋은 최대 폭 */
export const WEB_MAX_WIDTH = 520;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  page: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: { maxWidth: WEB_MAX_WIDTH },
      default: {},
    }),
  },
  flex: { flex: 1 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
