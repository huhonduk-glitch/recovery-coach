import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, SafetyNotice, Screen } from '@/components';
import {
  ACSM_EDITION,
  GUIDELINE_CAUTIONS,
  GUIDELINE_CHECKED_AT,
  GUIDELINE_GROUPS,
  unverifiedGuidelineCount,
  type GuidelineItem,
} from '@/data/activityGuidelines';
import { colors, radius, spacing, typography } from '@/theme';

/** 운동 지침 안내 — 얼마나 움직여야 하나 */
export default function GuidelinesScreen() {
  const unverified = unverifiedGuidelineCount();

  return (
    <Screen footer={<Button label="닫기" variant="outline" onPress={() => router.back()} />}>
      <Text style={styles.eyebrow}>알아보기</Text>
      <Text style={styles.title} accessibilityRole="header">
        얼마나 움직여야 하나
      </Text>
      <Text style={styles.desc}>
        아래는 앱이 만든 숫자가 아니라, 이미 공개되어 있는 권고를 옮겨 적은 것입니다. 개인에게
        맞춘 운동 처방이 아닙니다.
      </Text>

      <Card title="기준이 되는 지침" accent={colors.primary}>
        <Text style={styles.editionName}>{ACSM_EDITION.koreanName}</Text>
        <Text style={styles.editionValue}>{ACSM_EDITION.edition}</Text>
        <Text style={styles.editionNote}>{ACSM_EDITION.examNote}</Text>
        <Text style={styles.editionNote}>{ACSM_EDITION.changeNote}</Text>
        <Text style={styles.source}>{ACSM_EDITION.source}</Text>
      </Card>

      {unverified > 0 ? (
        <SafetyNotice
          tone="warning"
          title={`확인하지 못한 항목이 ${unverified}개 있어요`}
          text={`${GUIDELINE_CHECKED_AT} 작업에서 원문을 확인하지 못한 항목은 '확인 필요' 라고 표시해 두었습니다. 그 숫자는 그대로 믿지 마시고 원문을 확인해 주세요.`}
        />
      ) : null}

      {GUIDELINE_GROUPS.map((group) => (
        <Card key={group.id} title={group.title}>
          <Text style={styles.audience}>{group.audience}</Text>
          {group.items.map((item) => (
            <GuidelineRow key={item.id} item={item} />
          ))}
        </Card>
      ))}

      <SafetyNotice tone="warning" title="이 숫자를 그대로 쓰면 안 되는 경우" items={GUIDELINE_CAUTIONS} />

      <Card title="학교에서 쓰실 때">
        <Text style={styles.body}>
          성인 기준과 청소년 기준이 다릅니다. 학생에게 성인 기준(주 150분)을 그대로 안내하면
          오히려 적게 움직이는 목표가 됩니다. 청소년은 하루 단위로 봅니다.
        </Text>
        <Text style={styles.body}>
          또한 위 숫자는 &lsquo;건강을 지키기 위한 활동량&rsquo; 이고, 경기력 향상을 위한 훈련량과는
          다른 이야기입니다.
        </Text>
      </Card>
    </Screen>
  );
}

function GuidelineRow({ item }: { item: GuidelineItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        {item.verified ? null : <Text style={styles.unverifiedTag}>확인 필요</Text>}
      </View>
      <Text style={styles.rowDetail}>{item.detail}</Text>
      <Text style={styles.rowWhy}>{item.why}</Text>
      <Text style={styles.source}>{item.source}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.small, color: colors.primary, marginBottom: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  desc: { ...typography.body, color: colors.textMuted, marginVertical: spacing.md },
  editionName: { ...typography.small, color: colors.textMuted },
  editionValue: { ...typography.title, color: colors.text, marginTop: spacing.xxs },
  editionNote: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  audience: { ...typography.small, color: colors.secondaryText, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.sm },
  row: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowLabel: { ...typography.bodyStrong, color: colors.text },
  unverifiedTag: {
    ...typography.caption,
    color: colors.warningText,
    borderWidth: 1,
    borderColor: colors.warningText,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  rowDetail: { ...typography.body, color: colors.text, marginTop: spacing.xs },
  rowWhy: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
  source: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.xs },
});
