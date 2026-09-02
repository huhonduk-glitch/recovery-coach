import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@/components';
import { NUTRITION_PLANS } from '@/data/mealTemplates';
import { MICRONUTRIENTS } from '@/data/nutritionFoods';
import { colors, radius, spacing, typography } from '@/theme';

const PLAN_COLOR: Record<string, string> = {
  weightCare: colors.secondary,
  bulkUp: colors.primary,
  generalHealth: colors.warning,
  recovery: colors.risk.performance,
};

/** 영양 탭 — 목표별 가이드와 미네랄 정보 */
export default function NutritionTabScreen() {
  return (
    <Screen>
      <Text style={styles.title}>영양</Text>
      <Text style={styles.subtitle}>
        면역력을 올리는 마법 음식은 없지만, 회복에 필요한 재료를 꾸준히 넣어 주는 식사는 있습니다.
      </Text>

      <Button
        label="내 영양 가이드 보기"
        onPress={() => router.push('/nutrition/result')}
        style={styles.mainButton}
      />

      <Text style={styles.sectionTitle}>목표별 가이드</Text>
      {NUTRITION_PLANS.map((plan) => (
        <Card key={plan.id} title={plan.title} accent={PLAN_COLOR[plan.goal]}>
          <Text style={styles.target}>{plan.targetUser}</Text>
          {plan.mainPrinciples.slice(0, 3).map((p) => (
            <Text key={p} style={styles.item}>
              · {p}
            </Text>
          ))}
        </Card>
      ))}

      <Text style={styles.sectionTitle}>회복에 필요한 영양소</Text>
      <View style={styles.nutrientList}>
        {MICRONUTRIENTS.map((m) => (
          <View key={m.key} style={styles.nutrient}>
            <View style={styles.nutrientHead}>
              <Text style={styles.nutrientLabel}>{m.label}</Text>
              <Text style={styles.nutrientRole}>{m.role}</Text>
            </View>
            <Text style={styles.nutrientFoods}>{m.foods.join(' · ')}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  mainButton: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  target: { ...typography.small, color: colors.textMuted, marginBottom: spacing.sm },
  item: { ...typography.body, color: colors.text, marginBottom: spacing.xs },
  nutrientList: { gap: spacing.sm },
  nutrient: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  nutrientHead: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  nutrientLabel: { ...typography.bodyStrong, color: colors.text },
  nutrientRole: { ...typography.small, color: colors.secondary },
  nutrientFoods: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
});
