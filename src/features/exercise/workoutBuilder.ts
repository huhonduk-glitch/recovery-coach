import { EXERCISES } from '@/data/exercises';
import { getProgram } from '@/data/programs';

import type { Assessment, Equipment } from '../assessment/assessmentTypes';

import type { Exercise, Program } from './exerciseTypes';

/**
 * 프로그램의 운동 목록을 사용자에 맞춰 걸러 낸다.
 *
 * 규칙
 * - 사용자가 가진 장비로 할 수 있는 운동만 남긴다 (맨몸만 있으면 밴드·덤벨 운동 제외)
 * - 운동 경험이 적으면 초급 운동만 남긴다
 * - 하루 가능 시간을 넘기지 않는 선까지만 담는다
 * - 정렬은 프로그램에 정의된 순서를 그대로 쓴다 (무작위 섞기 금지)
 */

const EXERCISE_MAP = new Map(EXERCISES.map((e) => [e.id, e]));

/** 최소한 이 개수는 보장한다. 시간이 모자라도 루틴이 비지 않게 한다. */
const MIN_EXERCISE_COUNT = 3;

export function canDoWithEquipment(
  exercise: Exercise,
  userEquipment: readonly Equipment[],
): boolean {
  // 맨몸 운동은 언제나 가능
  if (exercise.equipment.every((e) => e === 'bodyweight')) return true;

  const needed = exercise.equipment.filter((e) => e !== 'bodyweight');
  if (needed.length === 0) return true;

  // 매트는 없어도 바닥에서 할 수 있으므로 필수 장비로 보지 않는다
  const required = needed.filter((e) => e !== 'mat');
  if (required.length === 0) return true;

  return required.some((e) => userEquipment.includes(e));
}

export interface BuiltWorkout {
  program: Program;
  exercises: Exercise[];
  totalSeconds: number;
  /** 시간이나 장비 때문에 제외된 운동 수 */
  excludedCount: number;
  notes: string[];
}

export function buildWorkout(
  programId: string,
  assessment: Assessment,
  level: 'beginner' | 'intermediate',
): BuiltWorkout | null {
  const program = getProgram(programId);
  if (!program) return null;

  const notes: string[] = [];
  const all = program.exerciseIds
    .map((id) => EXERCISE_MAP.get(id))
    .filter((e): e is Exercise => e !== undefined);

  // 1) 장비 필터
  const byEquipment = all.filter((e) => canDoWithEquipment(e, assessment.equipment));
  if (byEquipment.length < all.length) {
    notes.push('가지고 계신 장비로 할 수 있는 운동만 담았어요.');
  }

  // 2) 난이도 필터 (초급자에게는 중급 운동을 넣지 않는다)
  const byLevel =
    level === 'beginner' ? byEquipment.filter((e) => e.level === 'beginner') : byEquipment;
  if (level === 'beginner' && byLevel.length < byEquipment.length) {
    notes.push('운동 경험에 맞춰 초급 동작 위주로 담았어요.');
  }

  // 최소 개수 확보: 필터로 너무 많이 빠졌으면 장비 필터까지만 적용한 목록을 쓴다
  const pool = byLevel.length >= MIN_EXERCISE_COUNT ? byLevel : byEquipment;

  // 3) 시간 예산
  const budgetSeconds = assessment.availableTime * 60;
  const picked: Exercise[] = [];
  let total = 0;

  for (const exercise of pool) {
    const next = total + exercise.estimatedSeconds;
    if (next > budgetSeconds && picked.length >= MIN_EXERCISE_COUNT) break;
    picked.push(exercise);
    total = next;
  }

  if (picked.length < pool.length) {
    notes.push(`하루 ${assessment.availableTime}분에 맞춰 루틴을 줄였어요.`);
  }

  return {
    program,
    exercises: picked,
    totalSeconds: total,
    excludedCount: all.length - picked.length,
    notes,
  };
}

/** 초 단위를 '18분' 형태로 */
export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}분`;
}
