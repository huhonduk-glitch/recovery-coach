import {
  ASSESSMENT_SCHEMA_VERSION,
  type Assessment,
  type BodyRegion,
  type PainDetail,
  type PainScore,
} from '@/features/assessment/assessmentTypes';

/**
 * 테스트용 기본 설문 응답.
 * 필요한 부분만 덮어써서 쓴다.
 */
export function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    answeredAt: '2026-09-02T00:00:00.000Z',
    userType: 'adult',
    ageGroup: 'thirties',
    sex: 'undisclosed',
    places: ['home'],
    equipment: ['bodyweight', 'band', 'dumbbell', 'mat'],
    availableTime: 30,
    goals: ['generalHealth'],
    painRegions: [],
    painDetails: [],
    redFlags: [],
    exerciseBackground: {
      frequency: 'f1to2',
      intensity: 'moderate',
      squatExperience: 'some',
      painDuringExerciseLastMonth: false,
      style: 'short',
    },
    nutrition: {
      goal: 'generalHealth',
      mealCount: 3,
      breakfast: 'daily',
      protein: 'everyMeal',
      vegetable: 'daily',
      water: 'medium',
      snack: 'rarely',
      allergies: [],
      caffeine: 'none',
      eatingRisks: [],
    },
    sleepQuality: 'fair',
    stressLevel: 'medium',
    ...overrides,
  };
}

export function makePain(
  region: BodyRegion,
  score: PainScore,
  overrides: Partial<PainDetail> = {},
): PainDetail {
  return {
    region,
    score,
    duration: 'within1Week',
    cause: 'overuse',
    swelling: 'none',
    onMovement: 'specificMotion',
    numbness: false,
    weakness: false,
    nightPain: false,
    diagnosis: 'none',
    ...overrides,
  };
}
