import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  LoadingScreen,
  MissionList,
  NutritionCard,
  SafetyNotice,
  Screen,
} from '@/components';
import { getPlanByGoal } from '@/data/mealTemplates';
import { getMicronutrient } from '@/data/nutritionFoods';
import { assessmentStorage } from '@/features/assessment/assessmentStorage';
import { loadRecommendation } from '@/features/assessment/recommendationService';
import { isStudentMode } from '@/features/assessment/assessmentTypes';
import type { NutritionRecommendation } from '@/features/nutrition/nutritionTypes';
import { colors, radius, spacing, typography } from '@/theme';

/** 영양 추천 결과 */
export default function NutritionResultScreen() {
  const [rec, setRec] = useState<NutritionRecommendation | null>(null);
  const [student, setStudent] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [r, a] = await Promise.all([loadRecommendation(), assessmentStorage.get()]);
      if (cancelled) return;
      setRec(r?.nutrition ?? null);
      setStudent(
        a ? isStudentMode({ userType: a.userType, ageGroup: a.ageGroup }) : false,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (rec === null) {
    return <LoadingScreen message="영양 가이드를 준비하고 있어요" />;
  }

  const plan = getPlanByGoal(
    rec.planId === 'plan_weight_care'
      ? 'weightCare'
      : rec.planId === 'plan_bulk_up'
        ? 'bulkUp'
        : rec.planId === 'plan_recovery'
          ? 'recovery'
          : 'generalHealth',
  );

  return (
    <Screen footer={<Button label="닫기" variant="outline" onPress={() => router.back()} />}>
      <Text style={styles.eyebrow}>나의 영양 목표</Text>
      <Text style={styles.title} accessibilityRole="header">
        {rec.title}
      </Text>

      {rec.replacedForSafety ? (
        <SafetyNotice tone="warning" title="목표를 조정했어요" text={rec.cautionMessages[0]} />
      ) : null}

      <Card title="오늘의 우선순위" accent={colors.secondary}>
        <MissionList
          missions={rec.missions}
          doneIds={doneIds}
          onToggle={(id) =>
            setDoneIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
          }
        />
      </Card>

      <Card title="한 끼 기준">
        {rec.handPortionGuide.map((line) => (
          <Text key={line} style={styles.item}>
            · {line}
          </Text>
        ))}
        {student ? (
          <Text style={styles.studentNote}>
            학생 모드에서는 숫자 목표 대신 손 기준으로 안내해요. 손 크기에 맞춘 상대적인 기준입니다.
          </Text>
        ) : null}
      </Card>

      {/* 학생 모드에서는 macroRatio 가 애초에 만들어지지 않는다 */}
      {rec.macroRatio ? (
        <Card title="탄단지 비율 (참고)">
          <View style={styles.macroRow}>
            <Macro
              label="탄수화물"
              min={rec.macroRatio.carbMin}
              max={rec.macroRatio.carbMax}
              color={colors.warning}
            />
            <Macro
              label="단백질"
              min={rec.macroRatio.proteinMin}
              max={rec.macroRatio.proteinMax}
              color={colors.primary}
            />
            <Macro
              label="지방"
              min={rec.macroRatio.fatMin}
              max={rec.macroRatio.fatMax}
              color={colors.secondary}
            />
          </View>
          <Text style={styles.macroNote}>
            참고 범위입니다. 개인의 상태에 따라 달라질 수 있어요.
          </Text>
        </Card>
      ) : null}

      {/* 체중 기준 단백질 목표. 체중을 입력하지 않았으면 g 수는 계산하지 않는다 */}
      <Card title="하루 단백질 목표" accent={colors.primary}>
        <Text style={styles.proteinPerKg}>
          체중 1kg 당 {formatG(rec.proteinTarget.perKgMin)}~{formatG(rec.proteinTarget.perKgMax)}g
        </Text>

        {rec.proteinTarget.dailyGramsMin !== null && rec.proteinTarget.dailyGramsMax !== null ? (
          <>
            <Text style={styles.proteinGrams}>
              하루 {rec.proteinTarget.dailyGramsMin}~{rec.proteinTarget.dailyGramsMax}g
            </Text>
            <Text style={styles.item}>
              달걀 1개 약 6g, 닭가슴살 100g 약 23g, 두부 반 모 약 10g, 우유 200ml 약 6g 정도입니다.
            </Text>
          </>
        ) : (
          <Text style={styles.item}>
            설문에서 체중을 알려 주시면 하루 목표 g 까지 계산해 드려요. 지금은 위 손 기준으로만 챙겨도
            충분합니다.
          </Text>
        )}

        {student ? (
          <Text style={styles.studentNote}>
            성장기에는 총량을 정확히 맞추는 것보다 매 끼니에 단백질 반찬을 하나씩 두는 것이 더
            중요합니다. 숫자에 얽매이지 마세요.
          </Text>
        ) : null}

        <Text style={styles.sourceNote}>{rec.proteinTarget.source}</Text>
        <Text style={styles.sourceNote}>
          영양 전문가 검수 전 기준값입니다. 신장 질환 등 단백질 섭취를 조절해야 하는 상태라면 반드시
          담당 전문가와 상의하세요.
        </Text>
      </Card>

      <Card title="이렇게 먹어 보세요">
        {plan.mainPrinciples.map((p) => (
          <Text key={p} style={styles.item}>
            · {p}
          </Text>
        ))}
      </Card>

      <NutritionCard title="추천 식품" items={rec.recommendedFoods} tone="positive" />
      <NutritionCard title="줄여 볼 습관" items={rec.foodsToLimit} tone="limit" />

      <Card title="식단 예시">
        {rec.mealExamples.map((m) => (
          <View key={m.slot} style={styles.mealRow}>
            <Text style={styles.mealSlot}>{m.slot}</Text>
            <Text style={styles.mealItems}>{m.items.join(', ')}</Text>
          </View>
        ))}
      </Card>

      <NutritionCard title="운동 후 간식" items={rec.snackExamples} tone="positive" />

      <Card title="챙기면 좋은 영양소">
        {plan.micronutrientFocus.map((key) => {
          const info = getMicronutrient(key);
          if (!info) return null;
          return (
            <View key={key} style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>{info.label}</Text>
              <Text style={styles.nutrientRole}>{info.role}</Text>
              <Text style={styles.nutrientFoods}>{info.foods.join(' · ')}</Text>
            </View>
          );
        })}
      </Card>

      <Card title="수분">
        <Text style={styles.item}>{rec.hydrationGuide}</Text>
      </Card>

      <SafetyNotice tone="warning" title="이것만은 기억해 주세요" items={rec.cautionMessages} />
    </Screen>
  );
}

function formatG(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function Macro({
  label,
  min,
  max,
  color,
}: {
  label: string;
  min: number;
  max: number;
  color: string;
}) {
  return (
    <View style={styles.macro}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {min}~{max}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.small, color: colors.secondary, marginBottom: spacing.xs },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.xl },
  item: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  studentNote: { ...typography.small, color: colors.secondary, marginTop: spacing.md },
  macroRow: { flexDirection: 'row', gap: spacing.md },
  macro: { flex: 1, alignItems: 'center' },
  macroDot: { width: 10, height: 10, borderRadius: radius.pill, marginBottom: spacing.xs },
  macroLabel: { ...typography.small, color: colors.textMuted },
  macroValue: { ...typography.bodyStrong, color: colors.text, marginTop: spacing.xxs },
  macroNote: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.md },
  proteinPerKg: { ...typography.body, color: colors.textMuted },
  proteinGrams: {
    ...typography.heading,
    color: colors.primaryText,
    marginTop: spacing.xxs,
    marginBottom: spacing.sm,
  },
  sourceNote: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.sm },
  mealRow: { flexDirection: 'row', marginBottom: spacing.sm },
  mealSlot: { ...typography.bodyStrong, color: colors.primary, width: 64 },
  mealItems: { ...typography.body, color: colors.text, flex: 1 },
  nutrientRow: { marginBottom: spacing.md },
  nutrientLabel: { ...typography.bodyStrong, color: colors.text },
  nutrientRole: { ...typography.small, color: colors.secondary },
  nutrientFoods: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
});
