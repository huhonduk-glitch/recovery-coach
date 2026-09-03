import type { Exercise } from '@/features/exercise/exerciseTypes';

import { overriddenExercise, withExerciseOverrides } from '../libraryOverrides';

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

/**
 * 앱이 실제로 쓰는 운동 목록.
 *
 * EXERCISES 는 코드에 들어 있는 기본 목록이고, 이 함수는 선생님이 앱에서
 * 고친 내용까지 얹은 결과를 돌려준다. 목록을 보여 주는 화면은 이쪽을 쓴다.
 */
export function allExercises(): Exercise[] {
  return withExerciseOverrides(EXERCISES);
}

export function getExercise(id: string): Exercise | undefined {
  const edited = overriddenExercise(id);
  if (edited === null) return undefined; // 앱에서 감춘 운동
  return edited ?? EXERCISE_MAP.get(id);
}

export function getExercises(ids: readonly string[]): Exercise[] {
  return ids.map((id) => getExercise(id)).filter((e): e is Exercise => e !== undefined);
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
