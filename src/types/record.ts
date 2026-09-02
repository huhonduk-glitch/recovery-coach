import type { ExerciseCategory, Phase } from './exercise';
import type { PainLevel } from './survey';

export type AbortReason = 'pain' | 'time' | 'difficulty' | 'other';

export interface SessionRecord {
  id: string;
  routineId: string;
  startedAt: string;
  finishedAt?: string;
  completed: boolean;
  abortReason?: AbortReason;
  painBefore?: PainLevel;
  painAfter?: PainLevel;
  perceivedEffort?: 1 | 2 | 3 | 4 | 5;
}

export interface PlanState {
  category: ExerciseCategory;
  phase: Phase;
  /** 운동 후 통증 증가가 연속으로 보고된 횟수. 2회 → 하향, 3회 → 중단 */
  consecutiveWorsening: number;
  sessionsInPhase: number;
  updatedAt: string;
}
