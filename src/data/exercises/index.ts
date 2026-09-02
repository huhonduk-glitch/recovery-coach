import type { Exercise } from '@/features/exercise/exerciseTypes';

import { ANKLE_EXERCISES } from './ankle';
import { BACK_EXERCISES } from './back';
import { DYNAMIC_WARMUP_EXERCISES } from './dynamicWarmup';
import { FUNCTIONAL_EXERCISES } from './functional';
import { KNEE_EXERCISES } from './knee';
import { NECK_UPPER_BACK_EXERCISES } from './neckUpperBack';
import { POSTURE_EXERCISES } from './posture';
import { SHOULDER_EXERCISES } from './shoulder';

/** 전체 운동 목록 */
export const EXERCISES: readonly Exercise[] = [
  ...POSTURE_EXERCISES,
  ...DYNAMIC_WARMUP_EXERCISES,
  ...FUNCTIONAL_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...BACK_EXERCISES,
  ...KNEE_EXERCISES,
  ...ANKLE_EXERCISES,
  ...NECK_UPPER_BACK_EXERCISES,
];

const EXERCISE_MAP = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise | undefined {
  return EXERCISE_MAP.get(id);
}

export function getExercises(ids: readonly string[]): Exercise[] {
  return ids.map((id) => EXERCISE_MAP.get(id)).filter((e): e is Exercise => e !== undefined);
}

export {
  POSTURE_EXERCISES,
  DYNAMIC_WARMUP_EXERCISES,
  FUNCTIONAL_EXERCISES,
  SHOULDER_EXERCISES,
  BACK_EXERCISES,
  KNEE_EXERCISES,
  ANKLE_EXERCISES,
  NECK_UPPER_BACK_EXERCISES,
};
