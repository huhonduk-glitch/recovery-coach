import type { Exercise, Program } from '@/features/exercise/exerciseTypes';

/**
 * 편집한 운동·프로그램을 데이터 조회에 끼워 넣는 자리.
 *
 * ── 왜 이런 모양인가 ────────────────────────────────────────
 * 추천 엔진과 루틴 조립기는 순수 함수라 저장소를 알지 못합니다.
 * 그런데 선생님이 앱에서 고친 내용은 화면뿐 아니라 **루틴 조립까지** 반영돼야
 * 합니다. 그렇지 않으면 상세 화면에는 고친 설명이 보이는데 운동 중 화면에는
 * 원래 설명이 나오는 엇갈림이 생깁니다.
 *
 * 그래서 조회 함수(getExercise 등)가 들여다보는 자리를 하나 두고,
 * 앱이 시작될 때와 편집할 때마다 여기에 최신 내용을 넣어 줍니다.
 *
 * ⚠️ 이 파일은 features/library 를 import 하지 않습니다. (순환 참조 방지)
 *    필요한 모양만 아래 타입으로 받습니다.
 */

export interface LibraryOverrideSnapshot {
  exercises: Record<string, Exercise>;
  addedExerciseIds: string[];
  removedExerciseIds: string[];
  programs: Record<string, Program>;
  addedProgramIds: string[];
  removedProgramIds: string[];
}

const EMPTY: LibraryOverrideSnapshot = {
  exercises: {},
  addedExerciseIds: [],
  removedExerciseIds: [],
  programs: {},
  addedProgramIds: [],
  removedProgramIds: [],
};

let current: LibraryOverrideSnapshot = EMPTY;

/** 편집 내용을 갈아 끼운다. 저장할 때마다 호출된다 */
export function applyLibraryOverrides(snapshot: LibraryOverrideSnapshot): void {
  current = snapshot;
}

/** 테스트와 '전체 되돌리기' 에서 쓴다 */
export function clearLibraryOverrides(): void {
  current = EMPTY;
}

export function overriddenExercise(id: string): Exercise | undefined | null {
  if (current.removedExerciseIds.includes(id)) return null; // 감춰진 운동
  return current.exercises[id];
}

export function overriddenProgram(id: string): Program | undefined | null {
  if (current.removedProgramIds.includes(id)) return null;
  return current.programs[id];
}

/** 기본 목록에 편집 내용을 얹은 전체 목록 */
export function withExerciseOverrides(base: readonly Exercise[]): Exercise[] {
  const result: Exercise[] = [];
  for (const item of base) {
    if (current.removedExerciseIds.includes(item.id)) continue;
    result.push(current.exercises[item.id] ?? item);
  }
  for (const id of current.addedExerciseIds) {
    const added = current.exercises[id];
    if (added !== undefined) result.push(added);
  }
  return result;
}

export function withProgramOverrides(base: readonly Program[]): Program[] {
  const result: Program[] = [];
  for (const item of base) {
    if (current.removedProgramIds.includes(item.id)) continue;
    result.push(current.programs[item.id] ?? item);
  }
  for (const id of current.addedProgramIds) {
    const added = current.programs[id];
    if (added !== undefined) result.push(added);
  }
  return result;
}
