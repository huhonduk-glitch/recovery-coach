import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import {
  BLOCKED_MESSAGES,
  CONSULT_GUIDE,
  EMERGENCY_NOTICE,
} from '@/content/copy/blockedMessages';
import { profileRepository, screeningRepository } from '@/storage';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';
import type { BlockReason } from '@/types';

const VALID_REASONS: readonly BlockReason[] = [
  'redFlag',
  'painTooHigh',
  'painWorsening',
  'noConsent',
];

function parseReason(raw: unknown): BlockReason {
  return VALID_REASONS.includes(raw as BlockReason) ? (raw as BlockReason) : 'redFlag';
}

/**
 * 상담 안내(차단) 화면.
 *
 * 지키는 것 (docs/SAFETY_POLICY.md §7)
 * - 대체 운동을 제공하지 않는다. 우회 경로를 만들지 않는다.
 * - 병명 추정·원인 설명·회복 기간 예측을 하지 않는다.
 * - 뒤로가기로 결과 화면에 돌아갈 수 없다.
 */
export default function BlockedScreen() {
  const params = useLocalSearchParams<{ reason?: string }>();
  const reason = parseReason(params.reason);
  const message = BLOCKED_MESSAGES[reason];

  const [isStudent, setIsStudent] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [profile, screening] = await Promise.all([
        profileRepository.get(),
        screeningRepository.get(),
      ]);
      if (cancelled) return;
      setIsStudent(profile?.mode === 'student');
      // 가슴 통증 항목은 다른 안내보다 먼저 보여준다 (SAFETY_POLICY §3.2)
      setShowEmergency(screening?.flags.includes('rf_chest') === true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 안드로이드 하드웨어 뒤로가기로 이전 화면(설문·결과)에 돌아가지 못하게 막는다
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const restartScreening = useCallback(async () => {
    await screeningRepository.clear();
    router.replace('/(survey)/screening');
  }, []);

  return (
    <ScreenContainer>
      {showEmergency ? (
        <View style={[styles.card, styles.emergencyCard]}>
          <Text style={styles.emergencyTitle}>{EMERGENCY_NOTICE.title}</Text>
          <Text style={styles.emergencyBody}>{EMERGENCY_NOTICE.body}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>{message.title}</Text>
      <Text style={styles.body}>{message.body}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>이렇게 해보세요</Text>
        {(isStudent ? [...CONSULT_GUIDE.student, ...CONSULT_GUIDE.common] : [
          ...CONSULT_GUIDE.common,
        ]).map((item) => (
          <Text key={item} style={styles.cardItem}>
            · {item}
          </Text>
        ))}
      </View>

      {/* 상단에 응급 안내를 이미 띄웠다면 같은 내용을 반복하지 않는다.
          경고 색을 두 번 쓰면 경고가 눈에 덜 들어온다. */}
      {!showEmergency ? (
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.dangerTitle}>바로 도움이 필요한 경우</Text>
          <Text style={styles.dangerBody}>{CONSULT_GUIDE.emergency}</Text>
        </View>
      ) : null}

      <Text style={styles.retry}>{CONSULT_GUIDE.retry}</Text>

      <Button
        mode="outlined"
        onPress={restartScreening}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        안전 확인 다시 하기
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: { ...typography.bodyStrong, color: colors.text, marginBottom: spacing.sm },
  cardItem: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  emergencyCard: { backgroundColor: colors.dangerLight, borderColor: colors.danger },
  emergencyTitle: { ...typography.title, color: colors.danger, marginBottom: spacing.sm },
  emergencyBody: { ...typography.body, color: colors.text },
  dangerCard: { backgroundColor: colors.dangerLight, borderColor: colors.danger },
  dangerTitle: { ...typography.bodyStrong, color: colors.danger, marginBottom: spacing.xs },
  dangerBody: { ...typography.body, color: colors.text },
  retry: { ...typography.small, color: colors.textMuted, marginBottom: spacing.lg },
  button: { marginTop: spacing.sm },
  buttonContent: { minHeight: MIN_TOUCH_SIZE },
});
