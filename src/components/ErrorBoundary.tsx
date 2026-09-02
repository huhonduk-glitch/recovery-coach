import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import { DISCLAIMER_SHORT } from '@/utils/safety';

import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * 예상치 못한 오류가 나도 앱이 하얗게 죽지 않게 한다.
 *
 * ⚠️ 오류 화면에서도 면책 문구를 유지한다.
 *    오류 내용에 설문 응답이 섞일 수 있으므로 사용자에게 상세 내용을 보여 주지 않는다.
 *    (docs/SAFETY_POLICY.md §9, §12)
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // 값이 아니라 어디서 났는지만 남긴다
    console.warn('[ErrorBoundary]', error.name, info.componentStack?.split('\n')[1]?.trim());
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>화면을 불러오지 못했어요</Text>
          <Text style={styles.body}>
            일시적인 문제일 수 있어요. 다시 시도해 보시고, 계속 같은 문제가 생기면 앱을 껐다가
            다시 켜 주세요. 저장된 기록은 지워지지 않습니다.
          </Text>

          <Button
            label="다시 시도"
            onPress={() => this.setState({ hasError: false })}
            style={styles.button}
          />

          <Text style={styles.disclaimer}>{DISCLAIMER_SHORT}</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textMuted },
  button: { marginTop: spacing.xl },
  disclaimer: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.xxl },
});
