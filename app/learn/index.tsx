import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyDiagram, Button, Card, SafetyNotice, Screen } from '@/components';
import { ACSM_EDITION, GUIDELINE_CHECKED_AT } from '@/data/activityGuidelines';
import { REGION_EDUCATION } from '@/data/injuryEducation';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

/** 알아보기 — 운동 지침과 부위별 손상 이해 */
export default function LearnHomeScreen() {
  return (
    <Screen footer={<Button label="닫기" variant="outline" onPress={() => router.back()} />}>
      <Text style={styles.title} accessibilityRole="header">
        알아보기
      </Text>
      <Text style={styles.desc}>
        운동을 하기 전에 알아 두면 좋은 것들입니다. 지금 내 몸이 어떤 상태인지 알려 주는 것이
        아니라, 일반적인 지식을 정리한 자료입니다.
      </Text>

      <Pressable
        onPress={() => router.push('/learn/guidelines')}
        accessibilityRole="button"
        accessibilityLabel="운동 지침 얼마나 움직여야 하나"
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <Card title="얼마나 움직여야 하나" accent={colors.primary}>
          <Text style={styles.cardBody}>
            {ACSM_EDITION.koreanName} {ACSM_EDITION.edition} 등 공개된 권고를 옮겨 정리했습니다.
            성인과 청소년 기준이 다릅니다.
          </Text>
          <Text style={styles.cardMeta}>마지막 확인 {GUIDELINE_CHECKED_AT}</Text>
        </Card>
      </Pressable>

      <Text style={styles.sectionTitle}>부위별로 알아보기</Text>
      <Text style={styles.sectionDesc}>
        부위마다 어떤 구조물이 있고, 흔히 어떤 손상이 생기며, 재활에서 무엇을 목표로 삼는지
        정리했습니다.
      </Text>

      {REGION_EDUCATION.map((region) => (
        <Pressable
          key={region.region}
          onPress={() => router.push(`/learn/${region.region}`)}
          accessibilityRole="button"
          accessibilityLabel={`${region.label} 손상 알아보기`}
          style={({ pressed }) => [styles.regionRow, pressed && styles.pressed]}
        >
          <BodyDiagram region={region.region} size={40} />
          <View style={styles.regionBody}>
            <Text style={styles.regionLabel}>{region.label}</Text>
            <Text style={styles.regionMeta}>
              구조물 {region.structures.length}개 · 흔한 손상 {region.injuries.length}가지
            </Text>
          </View>
        </Pressable>
      ))}

      <SafetyNotice
        tone="warning"
        title="이 자료로 스스로 판단하지 마세요"
        items={[
          '여기 적힌 내용은 "이런 손상이 있다" 는 설명입니다. 내 몸이 무엇인지는 알려 주지 않습니다.',
          '증상이 비슷하다고 같은 손상인 것은 아닙니다. 확인은 병원에서 합니다.',
          '아직 의료 전문가의 검수를 받지 않은 자료입니다.',
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.xs },
  desc: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  pressed: { opacity: 0.75 },
  cardBody: { ...typography.body, color: colors.textMuted },
  cardMeta: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.sm },
  sectionTitle: { ...typography.title, color: colors.text, marginTop: spacing.md },
  sectionDesc: { ...typography.small, color: colors.textMuted, marginBottom: spacing.md },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_SIZE,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  regionBody: { flex: 1, marginLeft: spacing.md },
  regionLabel: { ...typography.bodyStrong, color: colors.text },
  regionMeta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
});
