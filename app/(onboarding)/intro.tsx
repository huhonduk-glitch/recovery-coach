import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { colors, radius, spacing, typography } from '@/theme';

/** 온보딩 첫 화면. 슬라이드 구성은 M6 에서 다듬는다. */
export default function IntroScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>리커버핏 Coach</Text>
      <Text style={styles.subtitle}>
        간단한 설문으로 지금 몸 상태에 맞는 회복 루틴과 영양 가이드를 안내해 드려요.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>이 앱이 하는 일</Text>
        <Text style={styles.cardItem}>· 부위별 회복 운동을 단계에 맞춰 안내합니다</Text>
        <Text style={styles.cardItem}>· 식사 균형을 잡는 영양 가이드를 제공합니다</Text>
        <Text style={styles.cardItem}>· 운동 기록과 통증 변화를 남겨 둡니다</Text>
      </View>

      <View style={[styles.card, styles.cardMuted]}>
        <Text style={styles.cardTitle}>이 앱이 하지 않는 일</Text>
        <Text style={styles.cardItem}>· 진단이나 치료를 하지 않습니다</Text>
        <Text style={styles.cardItem}>· 의료 처방을 제공하지 않습니다</Text>
        <Text style={styles.cardItem}>· 위험 신호가 있으면 운동을 안내하지 않습니다</Text>
      </View>

      <Button mode="contained" style={styles.button} onPress={() => router.push('/(onboarding)/safety')}>
        시작하기
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.display, color: colors.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardMuted: { backgroundColor: colors.surfaceAlt },
  cardTitle: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  cardItem: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  button: { marginTop: spacing.sm },
});
