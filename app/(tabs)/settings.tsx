import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, SafetyNotice, WebStorageNotice } from '@/components';
import { assessmentStorage } from '@/features/assessment/assessmentStorage';
import type { Assessment } from '@/features/assessment/assessmentTypes';
import { isStudentMode } from '@/features/assessment/assessmentTypes';
import { colors, spacing, typography } from '@/theme';
import { clearAll } from '@/utils/storage';
import { DISCLAIMER_FULL } from '@/utils/safety';

/** 내정보 탭 — 설문 다시 하기, 안전 안내, 데이터 삭제 */
export default function SettingsTabScreen() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const a = await assessmentStorage.get();
      if (!cancelled) setAssessment(a);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const student = assessment
    ? isStudentMode({ userType: assessment.userType, ageGroup: assessment.ageGroup })
    : false;

  /**
   * 빠른 시작으로만 답한 상태인지.
   * 목표를 고르지 않아 기본값(일반 건강관리)만 들어 있고 운동 경험도 비어 있으면
   * 자세히 설문하기를 권한다.
   */
  const quickAnswered =
    assessment !== null &&
    assessment.goals.length === 1 &&
    assessment.goals[0] === 'generalHealth' &&
    assessment.exerciseBackground.frequency === 'none' &&
    assessment.exerciseBackground.squatExperience === 'none';

  function confirmDelete() {
    const message =
      '운동 기록, 설문 응답, 추천 결과가 모두 지워지고 되돌릴 수 없어요. 진행할까요?';

    // 웹에서는 Alert 대신 confirm 을 쓴다
    if (Platform.OS === 'web') {
      if (window.confirm(message)) void doDelete();
      return;
    }

    Alert.alert('내 데이터 전체 삭제', message, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => void doDelete() },
    ]);
  }

  async function doDelete() {
    await clearAll();
    router.replace('/');
  }

  return (
    <Screen>
      <Text style={styles.title}>내정보</Text>

      <Card title="현재 설정">
        <Row label="이용 모드" value={student ? '학생 모드' : '일반 모드'} />
        <Row
          label="하루 운동 시간"
          value={assessment ? `${assessment.availableTime}분` : '설문 전'}
        />
        <Row
          label="불편한 부위"
          value={
            assessment && assessment.painRegions.length > 0
              ? `${assessment.painRegions.length}곳`
              : '없음'
          }
        />
        {student ? (
          <Text style={styles.note}>
            학생 모드에서는 숫자 목표나 몸무게 목표를 제공하지 않습니다.
          </Text>
        ) : null}
      </Card>

      <Card title="설문">
        <Text style={styles.desc}>
          몸 상태나 목표가 바뀌었다면 설문을 다시 진행해 주세요. 추천 루틴이 새로 만들어집니다.
        </Text>
        {quickAnswered ? (
          <Text style={styles.note}>
            빠른 시작으로 답하신 상태예요. 자세히 설문하면 목표와 식습관까지 반영해 더 잘 맞는
            루틴을 만들어 드릴 수 있어요.
          </Text>
        ) : null}
        <Button
          label={quickAnswered ? '자세히 설문하기' : '설문 다시 하기'}
          onPress={() => router.push('/assessment')}
          style={styles.button}
        />
      </Card>

      <Card title="안전 안내">
        <Button
          label={showDisclaimer ? '접기' : '안전 안내 다시 보기'}
          variant="outline"
          onPress={() => setShowDisclaimer((v) => !v)}
        />
        {showDisclaimer ? (
          <View style={styles.disclaimerList}>
            {DISCLAIMER_FULL.map((line, i) => (
              <Text key={line} style={styles.disclaimerItem}>
                {i + 1}. {line}
              </Text>
            ))}
          </View>
        ) : null}
      </Card>

      <SafetyNotice
        tone="info"
        title="내 데이터는 어디에 있나요?"
        text="설문 응답과 운동 기록은 이 기기 안에만 저장되며, 외부로 전송되지 않습니다."
      />

      <WebStorageNotice />

      <Card title="내 데이터 전체 삭제">
        <Text style={styles.desc}>
          지금까지의 설문 응답과 운동 기록을 모두 지웁니다. 되돌릴 수 없습니다.
        </Text>
        <Button label="전체 삭제" variant="danger" onPress={confirmDelete} style={styles.button} />
      </Card>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.bodyStrong, color: colors.text },
  note: { ...typography.small, color: colors.secondary, marginTop: spacing.sm },
  desc: { ...typography.body, color: colors.textMuted },
  button: { marginTop: spacing.lg },
  disclaimerList: { marginTop: spacing.lg, gap: spacing.sm },
  disclaimerItem: { ...typography.small, color: colors.textMuted },
});
