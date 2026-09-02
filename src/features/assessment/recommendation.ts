import { getExercise } from '@/data/exercises';

import { buildWeeklyPlan, progressionAdvice, selectProgram } from '../exercise/exerciseRules';
import type { RiskLevel } from '../exercise/exerciseTypes';
import { buildWorkout, formatDuration, type BuiltWorkout } from '../exercise/workoutBuilder';
import { buildNutritionRecommendation } from '../nutrition/nutritionBuilder';
import type { NutritionRecommendation } from '../nutrition/nutritionTypes';

import { buildCautionMessages, maxPainScore, primaryPainRegion, RISK_LABEL } from './assessmentEngine';
import type { Assessment } from './assessmentTypes';

/**
 * 설문 → 최종 추천 결과.
 *
 * 이 함수 하나만 호출하면 결과 화면에 필요한 모든 값이 나온다.
 * 순수 함수라 테스트하기 쉽다.
 */

export interface TodayWorkoutItem {
  exerciseId: string;
  name: string;
  detail: string;
}

export interface Recommendation {
  riskLevel: RiskLevel;
  riskLabel: string;
  /** 위험도가 red 면 null */
  exerciseProgramId: string | null;
  workout: BuiltWorkout | null;
  todayWorkout: TodayWorkoutItem[];
  weeklyPlan: string[];
  progressionAdvice: string;
  cautionMessages: string[];
  nutrition: NutritionRecommendation;
  summary: string;
}

function describeSets(exerciseId: string): string {
  const e = getExercise(exerciseId);
  if (!e) return '';
  if (e.durationSeconds && e.sets && e.sets > 1) {
    return `${e.durationSeconds}초 x ${e.sets}세트`;
  }
  if (e.durationSeconds) return `${e.durationSeconds}초`;
  if (e.reps && e.sets) return `${e.reps}회 x ${e.sets}세트`;
  if (e.reps) return `${e.reps}회`;
  return '';
}

function buildSummary(assessment: Assessment, risk: RiskLevel): string {
  const pain = maxPainScore(assessment.painDetails);
  const region = primaryPainRegion(assessment.painDetails);

  if (risk === 'red') {
    return '응답하신 내용 중에 전문가 확인이 필요한 항목이 있어, 운동 루틴 대신 상담을 안내해 드릴게요.';
  }

  if (region !== null && pain > 0) {
    const label = {
      shoulder: '어깨',
      lowBack: '허리',
      knee: '무릎',
      ankle: '발목',
      neckUpperBack: '목·등 상부',
    }[region];
    return `현재 ${label} 통증이 ${pain}점으로 확인되었어요. 지금 상태에 맞는 회복 루틴을 준비했습니다.`;
  }

  return '큰 통증은 없는 상태예요. 목표에 맞는 루틴을 준비했습니다.';
}

export function buildRecommendation(assessment: Assessment): Recommendation {
  const { riskLevel, programId, level } = selectProgram(assessment);
  const nutrition = buildNutritionRecommendation(assessment);

  // 위험도 red 이면 운동을 만들지 않는다. 대체 루틴도 제공하지 않는다.
  if (riskLevel === 'red' || programId === null) {
    return {
      riskLevel: 'red',
      riskLabel: RISK_LABEL.red,
      exerciseProgramId: null,
      workout: null,
      todayWorkout: [],
      weeklyPlan: [],
      progressionAdvice: progressionAdvice(null),
      cautionMessages: [],
      nutrition,
      summary: buildSummary(assessment, 'red'),
    };
  }

  const workout = buildWorkout(programId, assessment, level);

  return {
    riskLevel,
    riskLabel: RISK_LABEL[riskLevel],
    exerciseProgramId: programId,
    workout,
    todayWorkout:
      workout?.exercises.map((e) => ({
        exerciseId: e.id,
        name: e.name,
        detail: describeSets(e.id),
      })) ?? [],
    weeklyPlan: buildWeeklyPlan(programId),
    progressionAdvice: progressionAdvice(programId),
    cautionMessages: [...buildCautionMessages(assessment), ...(workout?.notes ?? [])],
    nutrition,
    summary: buildSummary(assessment, riskLevel),
  };
}

export { formatDuration };
