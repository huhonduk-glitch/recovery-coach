import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@/components';
import { colors, spacing, typography } from '@/theme';

/** 온보딩 — 이 앱이 하는 일과 하지 않는 일을 먼저 알린다 */
export default function OnboardingScreen() {
  return (
    <Screen
      footer={<Button label="시작하기" onPress={() => router.push('/onboarding/safety')} />}
    >
      <Text style={styles.brand}>리커버핏 Coach</Text>
      <Text style={styles.tagline}>
        간단한 설문으로 지금 몸 상태에 맞는 회복 루틴과 영양 가이드를 안내해 드려요.
      </Text>

      <Card title="이 앱이 하는 일">
        <View style={styles.list}>
          <Text style={styles.item}>· 부위별 회복 운동을 4단계로 나눠 안내합니다</Text>
          <Text style={styles.item}>· 체형교정, 동적웜업, 기능성 운동을 제공합니다</Text>
          <Text style={styles.item}>· 목표에 맞는 영양 가이드를 알려 드립니다</Text>
          <Text style={styles.item}>· 통증 변화와 운동 기록을 남겨 둡니다</Text>
        </View>
      </Card>

      <Card title="이 앱이 하지 않는 일" accent={colors.warning}>
        <View style={styles.list}>
          <Text style={styles.item}>· 진단이나 치료를 하지 않습니다</Text>
          <Text style={styles.item}>· 의료 처방을 제공하지 않습니다</Text>
          <Text style={styles.item}>· 위험 신호가 있으면 운동을 안내하지 않습니다</Text>
          <Text style={styles.item}>· 무리한 다이어트나 극단적 식사 제한을 권하지 않습니다</Text>
        </View>
      </Card>

      <Card title="기록은 이 휴대폰에만 남습니다" accent={colors.secondary}>
        <Text style={styles.item}>
          설문 응답과 운동 기록은 서버로 전송되지 않습니다. 이름이나 연락처도 묻지 않습니다.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { ...typography.display, color: colors.primary, marginBottom: spacing.sm },
  tagline: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  list: { gap: spacing.xs },
  item: { ...typography.body, color: colors.textMuted },
});
