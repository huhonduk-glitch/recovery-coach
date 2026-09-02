import type { Exercise } from '@/features/exercise/exerciseTypes';

/** 반복 1회에 걸리는 대략의 시간(초). 루틴 소요 시간 계산용 추정치다. */
const SECONDS_PER_REP = 3;

type ExerciseInput = Omit<Exercise, 'videoUrl' | 'thumbnailUrl' | 'estimatedSeconds'> &
  Partial<Pick<Exercise, 'videoUrl' | 'thumbnailUrl' | 'estimatedSeconds'>>;

/**
 * 운동 데이터를 만들 때 반복되는 값을 채워 준다.
 *
 * - 영상/썸네일은 아직 없으므로 null 로 둔다 (나중에 URL 만 채우면 된다)
 * - 소요 시간은 세트·횟수·휴식으로 자동 계산한다
 */
export function defineExercise(input: ExerciseInput): Exercise {
  const sets = input.sets ?? 1;
  const perSet = input.durationSeconds ?? (input.reps ?? 0) * SECONDS_PER_REP;
  const rest = input.restSeconds * Math.max(sets - 1, 0);

  return {
    videoUrl: null,
    thumbnailUrl: null,
    estimatedSeconds: input.estimatedSeconds ?? sets * perSet + rest,
    ...input,
  };
}
