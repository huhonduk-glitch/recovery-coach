import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, SafetyNotice } from '@/components';
import {
  assessmentStorage,
  recommendationStorage,
} from '@/features/assessment/assessmentStorage';
import { RED_FLAG_QUESTIONS } from '@/features/assessment/assessmentQuestions';
import { EMERGENCY_FLAG_IDS, isStudentMode } from '@/features/assessment/assessmentTypes';
import { colors, spacing, typography } from '@/theme';
import { BLOCKED_MESSAGE, CONSULT_GUIDE, EMERGENCY_NOTICE } from '@/utils/safety';
import { usePreventBack } from '@/utils/usePreventBack';

/**
 * 위험 신호 상담 안내 화면.
 *
 * 지키는 것 (docs/SAFETY_POLICY.md §7)
 * - 대체 운동을 제공하지 않는다. 우회 경로를 만들지 않는다.
 * - 병명 추정·원인 설명·회복 기간 예측을 하지 않는다.
 * - 뒤로가기로 결과 화면에 돌아갈 수 없다.
 */
export default function BlockedScreen() {
  const [student, setStudent] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [flaggedLabels, setFlaggedLabels] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const assessment = await assessmentStorage.get();
      if (cancelled || !assessment) return;

      setStudent(isStudentMode({ userType: assessment.userType, ageGroup: assessment.ageGroup }));
      setEmergency(assessment.redFlags.some((f) => EMERGENCY_FLAG_IDS.includes(f)));
      setFlaggedLabels(
        assessment.redFlags
          .map((id) => RED_FLAG_QUESTIONS.find((q) => q.id === id)?.label)
          .filter((l): l is string => l !== undefined),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 뒤로가기로 이전 화면에 돌아가지 못하게 막는다 (웹·앱 모두)
  usePreventBack();

  async function restart() {
    await Promise.all([assessmentStorage.clear(), recommendationStorage.clear()]);
    router.replace('/assessment');
  }

  return (
    <Screen footer={<Button label="설문 다시 하기" variant="outline" onPress={restart} />}>
      {emergency ? (
        <SafetyNotice tone="danger" title={EMERGENCY_NOTICE.title} text={EMERGENCY_NOTICE.body} />
      ) : null}

      <Text style={styles.title}>{BLOCKED_MESSAGE.title}</Text>
      <Text style={styles.body}>{BLOCKED_MESSAGE.body}</Text>

      {flaggedLabels.length > 0 ? (
        <Card title="확인이 필요한 항목">
          {flaggedLabels.map((label) => (
            <Text key={label} style={styles.item}>
              · {label}
            </Text>
          ))}
        </Card>
      ) : null}

      <Card title="이렇게 해보세요">
        {(student ? [...CONSULT_GUIDE.student, ...CONSULT_GUIDE.common] : CONSULT_GUIDE.common).map(
          (line) => (
            <Text key={line} style={styles.item}>
              · {line}
            </Text>
          ),
        )}
      </Card>

      {!emergency ? (
        <SafetyNotice tone="danger" title="바로 도움이 필요한 경우" text={CONSULT_GUIDE.emergency} />
      ) : null}

      <View style={styles.retryBox}>
        <Text style={styles.retry}>{CONSULT_GUIDE.retry}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  item: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  retryBox: { marginBottom: spacing.lg },
  retry: { ...typography.small, color: colors.textMuted },
});
