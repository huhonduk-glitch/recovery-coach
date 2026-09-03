import { EXERCISES } from '@/data/exercises';
import { PROGRAMS } from '@/data/programs';

import type { Exercise, Program } from '../exercise/exerciseTypes';

import {
  checkExercise,
  checkProgram,
  EMPTY_LIBRARY_STORE,
  LIBRARY_OVERRIDE_VERSION,
  type CheckResult,
  type LibraryOverrideStore,
} from './libraryTypes';

/**
 * 운동·프로그램 편집의 순수 함수 모음.
 *
 * 저장소나 화면을 모르는 함수만 둡니다. 받은 store 를 고치지 않고 새 store 를 돌려줍니다.
 */

const BUILT_IN_EXERCISES = new Map(EXERCISES.map((e) => [e.id, e]));
const BUILT_IN_PROGRAMS = new Map(PROGRAMS.map((p) => [p.id, p]));

/** 반복 1회에 걸리는 대략의 시간(초). helpers.ts 와 같은 값을 쓴다 */
const SECONDS_PER_REP = 3;

/** 세트·횟수·휴식으로 소요 시간을 다시 계산한다 */
export function estimateSeconds(input: {
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
}): number {
  const sets = input.sets ?? 1;
  const perSet = input.durationSeconds ?? (input.reps ?? 0) * SECONDS_PER_REP;
  const rest = input.restSeconds * Math.max(sets - 1, 0);
  return sets * perSet + rest;
}

// ───────────────────────── 운동 ─────────────────────────

/** 지금 이 앱이 쓰는 운동 전체 목록 */
export function resolveExercises(store: LibraryOverrideStore): Exercise[] {
  const result: Exercise[] = [];

  for (const built of EXERCISES) {
    if (store.removedExerciseIds.includes(built.id)) continue;
    result.push(store.exercises[built.id] ?? built);
  }
  for (const id of store.addedExerciseIds) {
    const added = store.exercises[id];
    if (added !== undefined) result.push(added);
  }
  return result;
}

export function resolveExercise(
  store: LibraryOverrideStore,
  id: string,
): Exercise | undefined {
  if (store.removedExerciseIds.includes(id)) return undefined;
  return store.exercises[id] ?? BUILT_IN_EXERCISES.get(id);
}

export function isExerciseEdited(store: LibraryOverrideStore, id: string): boolean {
  return Object.prototype.hasOwnProperty.call(store.exercises, id);
}

export function isExerciseAdded(store: LibraryOverrideStore, id: string): boolean {
  return store.addedExerciseIds.includes(id);
}

export type LibraryResult =
  | { ok: true; store: LibraryOverrideStore; warnings: string[] }
  | { ok: false; errors: string[] };

function stamp(store: LibraryOverrideStore): LibraryOverrideStore {
  return { ...store, version: LIBRARY_OVERRIDE_VERSION, updatedAt: new Date().toISOString() };
}

function fail(check: CheckResult): LibraryResult {
  return { ok: false, errors: check.errors };
}

/** 운동 내용 저장 (기본 운동을 덮어쓰거나, 새로 만든 운동을 고친다) */
export function saveExercise(
  store: LibraryOverrideStore,
  exercise: Exercise,
): LibraryResult {
  const next: Exercise = {
    ...exercise,
    estimatedSeconds: estimateSeconds(exercise),
  };
  const check = checkExercise(next);
  if (check.errors.length > 0) return fail(check);

  return {
    ok: true,
    warnings: check.warnings,
    store: stamp({ ...store, exercises: { ...store.exercises, [next.id]: next } }),
  };
}

/** 새 운동 만들기 */
export function addExercise(store: LibraryOverrideStore, exercise: Exercise): LibraryResult {
  if (BUILT_IN_EXERCISES.has(exercise.id) || store.exercises[exercise.id] !== undefined) {
    return { ok: false, errors: ['같은 id 의 운동이 이미 있어요. 다른 이름으로 만들어 주세요.'] };
  }
  const result = saveExercise(store, exercise);
  if (!result.ok) return result;

  return {
    ...result,
    store: stamp({
      ...result.store,
      addedExerciseIds: [...result.store.addedExerciseIds, exercise.id],
    }),
  };
}

/**
 * 운동 감추기 / 지우기.
 *
 * 기본 운동은 지우지 않고 감춥니다. 되돌릴 수 있어야 하기 때문입니다.
 * 사용자가 만든 운동은 완전히 지웁니다.
 */
export function removeExercise(store: LibraryOverrideStore, id: string): LibraryResult {
  if (store.addedExerciseIds.includes(id)) {
    const exercises = { ...store.exercises };
    delete exercises[id];
    return {
      ok: true,
      warnings: [],
      store: stamp({
        ...store,
        exercises,
        addedExerciseIds: store.addedExerciseIds.filter((v) => v !== id),
      }),
    };
  }

  if (!BUILT_IN_EXERCISES.has(id)) {
    return { ok: false, errors: ['그런 운동을 찾지 못했어요.'] };
  }
  if (store.removedExerciseIds.includes(id)) {
    return { ok: false, errors: ['이미 감춰진 운동이에요.'] };
  }
  return {
    ok: true,
    warnings: [],
    store: stamp({ ...store, removedExerciseIds: [...store.removedExerciseIds, id] }),
  };
}

/** 감춘 기본 운동을 다시 보이게 한다 */
export function restoreExercise(store: LibraryOverrideStore, id: string): LibraryOverrideStore {
  return stamp({
    ...store,
    removedExerciseIds: store.removedExerciseIds.filter((v) => v !== id),
  });
}

/** 이 운동만 기본값으로 되돌리기 */
export function resetExercise(store: LibraryOverrideStore, id: string): LibraryOverrideStore {
  if (!isExerciseEdited(store, id) || isExerciseAdded(store, id)) return store;
  const exercises = { ...store.exercises };
  delete exercises[id];
  return stamp({ ...store, exercises });
}

// ───────────────────────── 프로그램 ─────────────────────────

export function resolvePrograms(store: LibraryOverrideStore): Program[] {
  const result: Program[] = [];
  for (const built of PROGRAMS) {
    if (store.removedProgramIds.includes(built.id)) continue;
    result.push(store.programs[built.id] ?? built);
  }
  for (const id of store.addedProgramIds) {
    const added = store.programs[id];
    if (added !== undefined) result.push(added);
  }
  return result;
}

export function resolveProgram(store: LibraryOverrideStore, id: string): Program | undefined {
  if (store.removedProgramIds.includes(id)) return undefined;
  return store.programs[id] ?? BUILT_IN_PROGRAMS.get(id);
}

export function isProgramEdited(store: LibraryOverrideStore, id: string): boolean {
  return Object.prototype.hasOwnProperty.call(store.programs, id);
}

export function isProgramAdded(store: LibraryOverrideStore, id: string): boolean {
  return store.addedProgramIds.includes(id);
}

export function saveProgram(store: LibraryOverrideStore, program: Program): LibraryResult {
  const check = checkProgram(program);
  if (check.errors.length > 0) return fail(check);

  // 없는 운동을 가리키면 루틴이 비어 버린다
  const known = new Set(resolveExercises(store).map((e) => e.id));
  const missing = program.exerciseIds.filter((id) => !known.has(id));
  if (missing.length > 0) {
    return {
      ok: false,
      errors: [`목록에 없는 운동이 들어 있어요: ${missing.join(', ')}`],
    };
  }

  return {
    ok: true,
    warnings: check.warnings,
    store: stamp({ ...store, programs: { ...store.programs, [program.id]: program } }),
  };
}

export function addProgram(store: LibraryOverrideStore, program: Program): LibraryResult {
  if (BUILT_IN_PROGRAMS.has(program.id) || store.programs[program.id] !== undefined) {
    return { ok: false, errors: ['같은 id 의 프로그램이 이미 있어요.'] };
  }
  const result = saveProgram(store, program);
  if (!result.ok) return result;
  return {
    ...result,
    store: stamp({
      ...result.store,
      addedProgramIds: [...result.store.addedProgramIds, program.id],
    }),
  };
}

export function removeProgram(store: LibraryOverrideStore, id: string): LibraryResult {
  if (store.addedProgramIds.includes(id)) {
    const programs = { ...store.programs };
    delete programs[id];
    return {
      ok: true,
      warnings: [],
      store: stamp({
        ...store,
        programs,
        addedProgramIds: store.addedProgramIds.filter((v) => v !== id),
      }),
    };
  }
  if (!BUILT_IN_PROGRAMS.has(id)) return { ok: false, errors: ['그런 프로그램을 찾지 못했어요.'] };
  if (store.removedProgramIds.includes(id)) return { ok: false, errors: ['이미 감춰진 프로그램이에요.'] };
  return {
    ok: true,
    warnings: [],
    store: stamp({ ...store, removedProgramIds: [...store.removedProgramIds, id] }),
  };
}

export function restoreProgram(store: LibraryOverrideStore, id: string): LibraryOverrideStore {
  return stamp({ ...store, removedProgramIds: store.removedProgramIds.filter((v) => v !== id) });
}

export function resetProgram(store: LibraryOverrideStore, id: string): LibraryOverrideStore {
  if (!isProgramEdited(store, id) || isProgramAdded(store, id)) return store;
  const programs = { ...store.programs };
  delete programs[id];
  return stamp({ ...store, programs });
}

/** 프로그램 안에서 운동 순서 바꾸기 */
export function moveExerciseInProgram(
  program: Program,
  index: number,
  delta: number,
): Program | null {
  const to = index + delta;
  const from = program.exerciseIds[index];
  const swap = program.exerciseIds[to];
  if (from === undefined || swap === undefined) return null;
  const ids = [...program.exerciseIds];
  ids[index] = swap;
  ids[to] = from;
  return { ...program, exerciseIds: ids };
}

// ───────────────────────── 되돌리기 · 내보내기 ─────────────────────────

export function resetAll(): LibraryOverrideStore {
  return { ...EMPTY_LIBRARY_STORE, updatedAt: new Date().toISOString() };
}

export function editedCount(store: LibraryOverrideStore): {
  exercises: number;
  programs: number;
} {
  return {
    exercises:
      Object.keys(store.exercises).length + store.removedExerciseIds.length,
    programs: Object.keys(store.programs).length + store.removedProgramIds.length,
  };
}

function literal(value: unknown, indent: string): string {
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const inner = value.map((v) => `${indent}  ${literal(v, `${indent}  `)},`).join('\n');
    return `[\n${inner}\n${indent}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${indent}  ${k}: ${literal(v, `${indent}  `)},`)
      .join('\n');
    return `{\n${entries}\n${indent}}`;
  }
  return 'null';
}

/**
 * 코드에 옮겨 붙일 수 있는 형태로 내보낸다.
 *
 * 앱에서 만든 내용은 이 기기에만 있습니다. 앱을 지우면 사라집니다.
 */
export function exportAsCode(store: LibraryOverrideStore): string {
  const lines: string[] = [
    `// 리커버핏 Coach — 앱에서 바꾼 운동·프로그램`,
    `// 내보낸 시각: ${store.updatedAt ?? '알 수 없음'}`,
    '',
  ];

  const exerciseIds = Object.keys(store.exercises).sort();
  if (exerciseIds.length > 0) {
    lines.push('// ── 운동 ── src/data/exercises/ 의 해당 파일에 붙여 넣으세요');
    for (const id of exerciseIds) {
      const e = store.exercises[id];
      if (e === undefined) continue;
      const { estimatedSeconds: _drop, videoUrl: _v, thumbnailUrl: _t, ...rest } = e;
      lines.push(`defineExercise(${literal(rest, '')}),`, '');
    }
  }

  if (store.removedExerciseIds.length > 0) {
    lines.push('// ── 감춘 운동 (해당 항목을 지우거나 주석 처리하세요) ──');
    for (const id of store.removedExerciseIds) lines.push(`//   ${id}`);
    lines.push('');
  }

  const programIds = Object.keys(store.programs).sort();
  if (programIds.length > 0) {
    lines.push('// ── 프로그램 ── src/data/programs.ts 에 붙여 넣으세요');
    for (const id of programIds) {
      const p = store.programs[id];
      if (p === undefined) continue;
      lines.push(`${literal(p, '')},`, '');
    }
  }

  if (store.removedProgramIds.length > 0) {
    lines.push('// ── 감춘 프로그램 ──');
    for (const id of store.removedProgramIds) lines.push(`//   ${id}`);
  }

  if (lines.length === 3) return '// 앱에서 바꾼 것이 없습니다.';
  return lines.join('\n');
}
