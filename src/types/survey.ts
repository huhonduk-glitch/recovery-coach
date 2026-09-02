import type { Mode, SchemaVersion } from './common';

export type BodyPart = 'shoulder' | 'lowBack' | 'knee' | 'ankle' | 'neckUpperBack' | 'none';
export type PainPart = Exclude<BodyPart, 'none'>;

export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PainDuration = 'under3d' | 'w1to4' | 'm1to3' | 'over3m';
export type PainTrigger = 'onMove' | 'onSit' | 'morning' | 'afterExercise' | 'always';

export interface PainDetail {
  part: PainPart;
  level: PainLevel;
  duration: PainDuration;
  triggers: PainTrigger[];
}

/**
 * 레드 플래그 문항 ID.
 * 하나라도 '예' 이면 운동 루틴을 제공하지 않는다. (docs/SAFETY_POLICY.md §3)
 */
export type RedFlagId =
  | 'rf_recent_injury'
  | 'rf_night_pain'
  | 'rf_numbness'
  | 'rf_post_op'
  | 'rf_systemic'
  | 'rf_chest'
  | 'rf_pregnancy'
  | 'rf_doctor_stop';

export const RED_FLAG_IDS: readonly RedFlagId[] = [
  'rf_recent_injury',
  'rf_night_pain',
  'rf_numbness',
  'rf_post_op',
  'rf_systemic',
  'rf_chest',
  'rf_pregnancy',
  'rf_doctor_stop',
];

export type Goal = 'recovery' | 'posture' | 'function' | 'weightCare' | 'muscle';
export type Equipment = 'none' | 'band' | 'mat' | 'dumbbell' | 'bar';
export type ActivityFreq = 'none' | 'f1to2' | 'f3to4' | 'f5plus';
export type ExperienceLevel = 'beginner' | 'some' | 'familiar';
export type TimeBudget = 5 | 10 | 15 | 20;

export interface ExerciseSurvey {
  parts: BodyPart[];
  pains: PainDetail[];
  activityFreq: ActivityFreq;
  experience: ExperienceLevel;
  timeBudgetMin: TimeBudget;
  equipment: Equipment[];
  goals: Goal[];
}

export type NutritionTrack = 'weightCare' | 'bulkUp' | 'general' | 'recovery';

export interface NutritionSurvey {
  mealRegularity: 'irregular' | 'twoMeals' | 'threeMeals';
  proteinFreq: 'rare' | 'sometimes' | 'daily';
  vegFreq: 'rare' | 'sometimes' | 'daily';
  water: 'low' | 'mid' | 'high';
  goal: NutritionTrack;
  restrictions: string[];
  lateNight: boolean;
}

export interface SurveyResult {
  schemaVersion: SchemaVersion;
  answeredAt: string;
  mode: Mode;
  redFlags: RedFlagId[];
  exercise: ExerciseSurvey;
  nutrition: NutritionSurvey;
}
