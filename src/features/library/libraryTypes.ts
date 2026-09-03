import type { Exercise, Program } from '../exercise/exerciseTypes';

/**
 * 운동·프로그램 편집 기능의 자료형.
 *
 * ── 왜 필요한가 ─────────────────────────────────────────────
 * 운동 86개와 프로그램 23개는 코드 안에 있어 앱을 다시 빌드해야 바뀝니다.
 * 지도 경험이 있는 선생님이 동작 설명과 편성을 직접 다듬을 수 있어야 하는데,
 * 그때마다 개발자를 거쳐야 하는 것은 말이 안 됩니다. (영상 관리와 같은 방식)
 *
 * ── 어떻게 겹치는가 ─────────────────────────────────────────
 * 기본 목록을 통째로 대체하지 않고 **바꾼 항목만** 덮어씁니다.
 *   exercises[id] 가 있으면 그 운동은 이 내용을 쓴다
 *   removedExerciseIds 에 있으면 목록에서 감춘다 (기본 운동은 지우지 않고 감춘다)
 *   addedExerciseIds 는 사용자가 새로 만든 운동 (완전히 지울 수 있다)
 * 프로그램도 같은 방식입니다.
 *
 * ── 안전에서 양보하지 않은 것 ───────────────────────────────
 * 1. 주의사항(precautions)을 비울 수 없습니다. 비면 저장되지 않습니다.
 * 2. 통증을 참으라는 표현은 저장 자체가 막힙니다.
 * 3. 프로그램의 중단 기준(stopRule)을 비울 수 없습니다.
 * 4. 회복운동의 부위·단계를 바꾸면 배정 결과가 달라지므로 크게 경고합니다.
 * (docs/SAFETY_POLICY.md §23)
 * ─────────────────────────────────────────────────────────────
 */

export const LIBRARY_OVERRIDE_VERSION = 1;

export interface LibraryOverrideStore {
  version: number;
  /** 운동 id -> 바꾼 내용 (기본 운동을 덮어쓰거나, 새로 만든 운동) */
  exercises: Record<string, Exercise>;
  /** 사용자가 새로 만든 운동 id */
  addedExerciseIds: string[];
  /** 목록에서 감출 기본 운동 id */
  removedExerciseIds: string[];

  programs: Record<string, Program>;
  addedProgramIds: string[];
  removedProgramIds: string[];

  updatedAt: string | null;
}

export const EMPTY_LIBRARY_STORE: LibraryOverrideStore = {
  version: LIBRARY_OVERRIDE_VERSION,
  exercises: {},
  addedExerciseIds: [],
  removedExerciseIds: [],
  programs: {},
  addedProgramIds: [],
  removedProgramIds: [],
  updatedAt: null,
};

/** 저장 전 검사 결과 */
export interface CheckResult {
  /** 하나라도 있으면 저장하지 않는다 */
  errors: string[];
  /** 저장은 되지만 화면에 띄워 알린다 */
  warnings: string[];
}

/**
 * 통증을 참으라는 표현.
 *
 * 이 앱의 가장 기본 원칙을 정면으로 어기는 문장이라 저장 자체를 막습니다.
 * (docs/SAFETY_POLICY.md §10)
 */
const PUSH_THROUGH_PAIN = [
  '참고 하',
  '참고 계속',
  '참으세요',
  '참으면서',
  '아파도 계속',
  '아파도 하',
  '버티세요',
  '한계까지',
  '통증을 이겨',
];

/**
 * 앱이 의료 행위를 한다고 읽힐 수 있는 표현.
 *
 * 막지는 않습니다. '물리치료사와 상의하세요' 처럼 정당하게 쓰는 경우가 있어서입니다.
 * 대신 저장할 때 화면에 알려 한 번 더 보게 합니다.
 */
const MEDICAL_CLAIM = ['처방', '완치', '진단', '치료해', '치료합니다', '낫게 합니다'];

function scanText(texts: readonly string[]): CheckResult {
  const joined = texts.join(' ');
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const phrase of PUSH_THROUGH_PAIN) {
    if (joined.includes(phrase)) {
      errors.push(
        `'${phrase}' 처럼 통증을 참으라는 표현은 넣을 수 없어요. 이 앱의 가장 기본 원칙입니다.`,
      );
    }
  }
  for (const word of MEDICAL_CLAIM) {
    if (joined.includes(word)) {
      warnings.push(
        `'${word}' 라는 말이 들어 있어요. 앱이 의료 행위를 한다고 읽힐 수 있으니 한 번 더 확인해 주세요.`,
      );
    }
  }
  return { errors, warnings };
}

/** 운동 하나를 저장해도 되는지 */
export function checkExercise(exercise: Exercise): CheckResult {
  const { errors, warnings } = scanText([
    exercise.name,
    exercise.purpose,
    ...exercise.description,
    ...exercise.cues,
    ...exercise.commonMistakes,
    ...exercise.precautions,
    ...exercise.regressions,
    ...exercise.progressions,
  ]);

  if (exercise.name.trim().length === 0) errors.push('운동 이름을 넣어 주세요.');
  if (exercise.purpose.trim().length === 0) errors.push('이 운동을 왜 하는지 한 줄 적어 주세요.');
  if (exercise.description.length === 0) errors.push('동작 순서를 한 줄 이상 적어 주세요.');

  // 주의사항이 비면 콘텐츠 미완성으로 본다 (docs/CONTENT_GUIDE.md)
  if (exercise.precautions.length === 0) {
    errors.push('주의사항은 비울 수 없어요. 이 동작에서 무엇을 조심해야 하는지 적어 주세요.');
  }

  if (exercise.restSeconds < 0) errors.push('휴식 시간은 0초 이상이어야 해요.');
  if (exercise.sets !== undefined && exercise.sets < 1) errors.push('세트는 1 이상이어야 해요.');

  if (exercise.category !== 'posture' && exercise.bodyRegion !== null && exercise.phase === null) {
    warnings.push('부위는 정해져 있는데 단계가 비어 있어요. 회복운동이라면 단계를 정해 주세요.');
  }

  return { errors, warnings };
}

/** 프로그램 하나를 저장해도 되는지 */
export function checkProgram(program: Program): CheckResult {
  const { errors, warnings } = scanText([
    program.title,
    program.description,
    program.targetUser,
    program.goal,
    program.caution,
    program.progressionRule,
    program.stopRule,
  ]);

  if (program.title.trim().length === 0) errors.push('프로그램 이름을 넣어 주세요.');

  // 중단 기준이 없으면 '언제 멈춰야 하는가' 를 사용자가 알 수 없다
  if (program.stopRule.trim().length === 0) {
    errors.push('중단 기준은 비울 수 없어요. 언제 멈춰야 하는지 반드시 알려 줘야 합니다.');
  }
  if (program.caution.trim().length === 0) {
    errors.push('주의사항은 비울 수 없어요.');
  }
  if (program.exerciseIds.length === 0) {
    errors.push('운동을 하나 이상 넣어 주세요.');
  }
  if (program.durationMinutes <= 0) errors.push('소요 시간은 1분 이상이어야 해요.');

  return { errors, warnings };
}

export const PHASE_CHANGE_WARNING =
  '회복운동의 부위나 단계를 바꾸면 어떤 사용자에게 이 운동이 배정되는지가 달라집니다. 1단계 운동을 3단계로 옮기면, 통증이 남아 있는 사람에게 부담이 큰 동작이 갈 수 있어요. 꼭 필요한 경우에만 바꿔 주세요.';
