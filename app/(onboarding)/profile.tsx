import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { OptionButton } from '@/components/common/OptionButton';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { profileRepository, resolveMode } from '@/storage';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';
import { STUDENT_AGE_BANDS, type AgeBand, type Mode, type Sex } from '@/types';

const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: '13-15', label: '13 ~ 15세' },
  { value: '16-18', label: '16 ~ 18세' },
  { value: '19-29', label: '19 ~ 29세' },
  { value: '30-39', label: '30 ~ 39세' },
  { value: '40-49', label: '40 ~ 49세' },
  { value: '50-59', label: '50 ~ 59세' },
  { value: '60+', label: '60세 이상' },
];

const SEXES: { value: Sex; label: string }[] = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
  { value: 'undisclosed', label: '응답하지 않음' },
];

/**
 * 기본 정보 입력.
 *
 * 이름·연락처·학번·학교는 입력받지 않는다. 입력란 자체를 만들지 않는다.
 * (docs/SAFETY_POLICY.md §9.1)
 */
export default function ProfileScreen() {
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [saving, setSaving] = useState(false);

  const isStudentFixed = useMemo(
    () => (ageBand ? STUDENT_AGE_BANDS.includes(ageBand) : false),
    [ageBand],
  );

  const canSubmit = ageBand !== null && sex !== null && !saving;

  async function handleNext() {
    if (ageBand === null || sex === null) return;
    setSaving(true);

    // 만 18세 미만은 요청과 무관하게 학생 모드로 저장된다 (resolveMode)
    const requested: Mode = 'adult';
    await profileRepository.save({ ageBand, sex, mode: resolveMode(ageBand, requested) });

    router.replace('/(survey)/screening');
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>기본 정보</Text>
      <Text style={styles.subtitle}>
        안내 내용을 조정하는 데만 사용합니다. 이름이나 연락처는 묻지 않습니다.
      </Text>

      <Text style={styles.sectionLabel}>연령대</Text>
      {AGE_BANDS.map((item) => (
        <OptionButton
          key={item.value}
          label={item.label}
          selected={ageBand === item.value}
          onPress={() => setAgeBand(item.value)}
        />
      ))}

      {isStudentFixed ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>학생 모드로 이용하게 됩니다</Text>
          <Text style={styles.noticeBody}>
            성장기에는 체중이나 칼로리 숫자보다 균형 잡힌 식사가 더 중요해요. 학생 모드에서는 칼로리
            숫자 대신 손바닥·주먹 기준으로 안내해 드립니다.
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>성별</Text>
      {SEXES.map((item) => (
        <OptionButton
          key={item.value}
          label={item.label}
          selected={sex === item.value}
          onPress={() => setSex(item.value)}
        />
      ))}

      <Button
        mode="contained"
        disabled={!canSubmit}
        loading={saving}
        onPress={handleNext}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        다음
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  sectionLabel: {
    ...typography.bodyStrong,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  notice: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  noticeTitle: { ...typography.bodyStrong, color: colors.primaryDark, marginBottom: spacing.xs },
  noticeBody: { ...typography.small, color: colors.text },
  button: { marginTop: spacing.xl },
  buttonContent: { minHeight: MIN_TOUCH_SIZE },
});
