import type { PainScore } from '../assessment/assessmentTypes';

/** 운동 자각도 (Rating of Perceived Exertion) 1~10 */
export type RPE = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface WorkoutLog {
  id: string;
  date: string;
  programId: string;
  programTitle: string;
  completedExerciseIds: string[];
  totalExerciseCount: number;
  beforePainScore: PainScore | null;
  afterPainScore: PainScore | null;
  rpe: RPE | null;
  satisfaction: 1 | 2 | 3 | 4 | 5 | null;
  memo: string;
  /** 중단했다면 사유 */
  abortReason: 'pain' | 'time' | 'difficulty' | 'other' | null;
}

export interface DailyCheck {
  date: string;
  sleepHours: number | null;
  fatigue: 1 | 2 | 3 | 4 | 5 | null;
  nutritionMissionsDone: string[];
}
