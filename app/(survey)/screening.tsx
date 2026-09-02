import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { OptionButton } from '@/components/common/OptionButton';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { StepProgress } from '@/components/common/StepProgress';
import { RED_FLAG_QUESTIONS } from '@/content/survey/redFlagQuestions';
import { judgeScreening, type RedFlagAnswers } from '@/engine/safety';
import { screeningRepository } from '@/storage';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

/**
 * 안전 스크리닝.
 *
 * 한 화면에 한 문항만 보여준다. 8문항을 한꺼번에 나열하면 사용자가
 * 내용을 읽지 않고 '아니오' 를 연타하기 쉽다.
 * (docs/SAFETY_POLICY.md §3, docs/PRD.md §13.4)
 */
export default function ScreeningScreen() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<RedFlagAnswers>({});
  const [saving, setSaving] = useState(false);

  const question = RED_FLAG_QUESTIONS[index];
  if (!question) return null;

  const current = answers[question.id];
  const isLast = index === RED_FLAG_QUESTIONS.length - 1;

  function select(value: boolean) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  async function goNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    const verdict = judgeScreening(answers);
    if (verdict.status === 'incomplete') {
      // 방어 코드: 미응답이 남아 있으면 통과시키지 않는다
      return;
    }

    setSaving(true);
    await screeningRepository.save(verdict.status === 'blocked' ? verdict.flags : []);

    if (verdict.status === 'blocked') {
      // replace 로 이동해 뒤로가기로 되돌아올 수 없게 한다
      router.replace('/(result)/blocked?reason=redFlag');
      return;
    }

    router.replace('/(survey)/body');
  }

  return (
    <ScreenContainer>
      <StepProgress current={index + 1} total={RED_FLAG_QUESTIONS.length} />

      <Text style={styles.eyebrow}>안전 확인</Text>
      <Text style={styles.question}>{question.question}</Text>
      <Text style={styles.hint}>{question.hint}</Text>

      <View style={styles.options}>
        <OptionButton label="예" selected={current === true} onPress={() => select(true)} />
        <OptionButton label="아니오" selected={current === false} onPress={() => select(false)} />
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          해당되는 항목이 있으면 운동 루틴 대신 전문가 상담을 안내해 드립니다. 정확하게 답해 주시는
          것이 가장 안전합니다.
        </Text>
      </View>

      <View style={styles.actions}>
        {index > 0 ? (
          <Button mode="text" onPress={() => setIndex((i) => i - 1)} style={styles.backButton}>
            이전
          </Button>
        ) : null}

        <Button
          mode="contained"
          disabled={typeof current !== 'boolean' || saving}
          loading={saving}
          onPress={goNext}
          style={styles.nextButton}
          contentStyle={styles.buttonContent}
        >
          {isLast ? '확인 완료' : '다음'}
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.small, color: colors.primary, marginBottom: spacing.xs },
  question: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  hint: { ...typography.small, color: colors.textMuted, marginBottom: spacing.xl },
  options: { marginBottom: spacing.lg },
  notice: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  noticeText: { ...typography.small, color: colors.textMuted },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  backButton: { marginRight: spacing.sm },
  nextButton: { flex: 1 },
  buttonContent: { minHeight: MIN_TOUCH_SIZE },
});
