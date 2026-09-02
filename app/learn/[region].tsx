import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnatomyDiagram, Button, Card, EmptyState, SafetyNotice, Screen } from '@/components';
import {
  EDUCATION_DISCLAIMER,
  getRegionEducation,
  type InjuryInfo,
  type RegionEducation,
  type StructureKey,
} from '@/data/injuryEducation';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

/** 부위별 손상 이해 */
export default function RegionLearnScreen() {
  const { region } = useLocalSearchParams<{ region: string }>();
  const data = getRegionEducation(typeof region === 'string' ? region : '');

  if (data === undefined) {
    return (
      <Screen>
        <EmptyState
          title="부위를 찾지 못했어요"
          description="목록에서 다시 골라 주세요."
          actionLabel="목록으로"
          onAction={() => router.replace('/learn')}
        />
      </Screen>
    );
  }

  return <RegionBody data={data} />;
}

function RegionBody({ data }: { data: RegionEducation }) {
  const [highlight, setHighlight] = useState<StructureKey | null>(null);
  const [openInjury, setOpenInjury] = useState<string | null>(null);

  return (
    <Screen footer={<Button label="목록으로" variant="outline" onPress={() => router.back()} />}>
      <Text style={styles.eyebrow}>부위별로 알아보기</Text>
      <Text style={styles.title} accessibilityRole="header">
        {data.label}
      </Text>
      <Text style={styles.desc}>{data.intro}</Text>

      <Card title="여기에 무엇이 있나">
        <AnatomyDiagram region={data.region} highlight={highlight} />

        <Text style={styles.hint}>
          아래 이름을 누르면 위 그림에서 그 구조물이 표시됩니다.
        </Text>

        <View style={styles.chipRow}>
          {data.structures.map((s) => {
            const active = highlight === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setHighlight(active ? null : s.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${s.name} 그림에서 보기`}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={active ? styles.chipTextActive : styles.chipText}>{s.name}</Text>
              </Pressable>
            );
          })}
        </View>

        {data.structures.map((s) => (
          <View
            key={s.key}
            style={[styles.structure, highlight === s.key && styles.structureActive]}
          >
            <Text style={styles.structureName}>{s.name}</Text>
            <Text style={styles.structureRole}>{s.role}</Text>
            <Text style={styles.structureSport}>운동에서 · {s.inSport}</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>흔한 손상</Text>
      {data.injuries.map((injury) => (
        <InjuryCard
          key={injury.id}
          injury={injury}
          open={openInjury === injury.id}
          onToggle={() => {
            const next = openInjury === injury.id ? null : injury.id;
            setOpenInjury(next);
            setHighlight(next === null ? null : injury.structure);
          }}
        />
      ))}

      <Card title={`${data.label}이(가) 다치는 배경`}>
        {data.commonCauses.map((cause) => (
          <Text key={cause} style={styles.bullet}>
            · {cause}
          </Text>
        ))}
      </Card>

      <SafetyNotice
        tone="danger"
        title="이럴 때는 운동보다 병원이 먼저입니다"
        items={data.seeProfessional}
      />

      <SafetyNotice tone="info" title="읽으실 때 알아 두실 것" items={EDUCATION_DISCLAIMER} />
    </Screen>
  );
}

function InjuryCard({
  injury,
  open,
  onToggle,
}: {
  injury: InjuryInfo;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card accent={open ? colors.primary : undefined}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${injury.name} ${open ? '접기' : '펼치기'}`}
        style={styles.injuryHead}
      >
        <View style={styles.injuryHeadBody}>
          <Text style={styles.injuryName}>{injury.name}</Text>
          {injury.alsoCalled !== undefined ? (
            <Text style={styles.injuryAlias}>{injury.alsoCalled}</Text>
          ) : null}
        </View>
        <Text style={styles.injuryToggle}>{open ? '접기' : '펼치기'}</Text>
      </Pressable>

      {open ? (
        <View style={styles.injuryBody}>
          <Section title="어쩌다 다치나" items={injury.howItHappens} />
          <Section
            title="흔히 이런 이야기를 합니다"
            items={injury.commonPicture}
            note="증상이 비슷하다고 같은 손상인 것은 아닙니다. 확인은 병원에서 합니다."
          />
          <Section title="무엇이 막히나" items={injury.whatGetsLimited} />
          <Section
            title="보통 어떻게 다루나"
            items={injury.careOverview}
            note="치료 방법과 수술 여부는 담당 의사가 정합니다."
          />
          <Section
            title="재활에서 목표로 삼는 것"
            items={injury.rehabGoals}
            note="기간이 아니라 '무엇이 되면 다음 단계' 로 적었습니다. 복귀 시점은 담당 의사가 정합니다."
          />
          <Text style={styles.warning}>{injury.warning}</Text>
        </View>
      ) : null}
    </Card>
  );
}

function Section({
  title,
  items,
  note,
}: {
  title: string;
  items: readonly string[];
  note?: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.bullet}>
          · {item}
        </Text>
      ))}
      {note !== undefined ? <Text style={styles.sectionNote}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.small, color: colors.primary, marginBottom: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  desc: { ...typography.body, color: colors.textMuted, marginVertical: spacing.md },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginVertical: spacing.md },
  chip: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textMuted },
  chipTextActive: { ...typography.caption, color: colors.onPrimary },
  structure: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
  },
  structureActive: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md },
  structureName: { ...typography.bodyStrong, color: colors.text },
  structureRole: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
  structureSport: { ...typography.small, color: colors.secondaryText, marginTop: spacing.xs },
  sectionTitle: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  injuryHead: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH_SIZE },
  injuryHeadBody: { flex: 1 },
  injuryName: { ...typography.bodyStrong, color: colors.text },
  injuryAlias: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
  injuryToggle: { ...typography.small, color: colors.primaryText },
  injuryBody: { marginTop: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionLabel: { ...typography.smallStrong, color: colors.primaryText, marginBottom: spacing.xs },
  sectionNote: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.xs },
  bullet: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  warning: {
    ...typography.small,
    color: colors.warningText,
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
