import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface Props {
  children: ReactNode;
  /** 스크롤 없이 화면을 꽉 채워야 할 때 (예: 운동 실행 화면) */
  scroll?: boolean;
}

/** 모든 화면의 바깥 껍데기. 안전영역 여백과 배경색을 한 곳에서 관리한다. */
export function ScreenContainer({ children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: spacing.lg,
  };

  if (!scroll) {
    return <View style={[styles.root, padding]}>{children}</View>;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={padding}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
