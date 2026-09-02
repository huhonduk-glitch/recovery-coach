import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { DisclaimerBanner } from '@/components/safety/DisclaimerBanner';
import { colors, radius, spacing, typography } from '@/theme';

/**
 * 홈 화면.
 * M1 에서는 테마와 라우팅 확인용 뼈대다. 오늘의 루틴 카드는 M4 에서 붙인다.
 */
export default function HomeScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.greeting}>안녕하세요</Text>
      <Text style={styles.title}>오늘도 무리하지 않는 만큼만 해요.</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>오늘의 루틴</Text>
        <Text style={styles.cardEmpty}>
          아직 설문을 진행하지 않으셨어요. 설문을 마치면 지금 상태에 맞는 루틴을 안내해 드릴게요.
        </Text>
        <Button
          mode="contained"
          style={styles.cardButton}
          onPress={() => router.push('/(survey)/screening')}
        >
          설문 시작하기
        </Button>
      </View>

      <View style={styles.bannerSlot}>
        <DisclaimerBanner />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { ...typography.small, color: colors.textMuted, marginBottom: spacing.xs },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardLabel: { ...typography.bodyStrong, color: colors.primary, marginBottom: spacing.sm },
  cardEmpty: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  cardButton: { alignSelf: 'flex-start' },
  bannerSlot: { marginTop: spacing.xl },
});
