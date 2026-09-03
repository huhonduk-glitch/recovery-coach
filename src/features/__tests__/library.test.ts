import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { EXERCISES } from '@/data/exercises';
import { PROGRAMS } from '@/data/programs';
import type { Exercise, Program } from '@/features/exercise/exerciseTypes';
import {
  addExercise,
  addProgram,
  editedCount,
  estimateSeconds,
  exportAsCode,
  isExerciseAdded,
  isExerciseEdited,
  moveExerciseInProgram,
  removeExercise,
  removeProgram,
  resetAll,
  resetExercise,
  resolveExercise,
  resolveExercises,
  resolveProgram,
  resolvePrograms,
  restoreExercise,
  saveExercise,
  saveProgram,
  type LibraryResult,
} from '@/features/library/exerciseLibrary';
import {
  checkExercise,
  checkProgram,
  EMPTY_LIBRARY_STORE,
  type LibraryOverrideStore,
} from '@/features/library/libraryTypes';

const ROOT = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

function must(result: LibraryResult): LibraryOverrideStore {
  if (!result.ok) throw new Error(`실패: ${result.errors.join(' / ')}`);
  return result.store;
}

const BASE_EXERCISE: Exercise = {
  id: 'my-01',
  name: '내가 만든 운동',
  category: 'functional',
  bodyRegion: null,
  phase: null,
  level: 'beginner',
  equipment: ['bodyweight'],
  purpose: '기본 움직임을 익힙니다.',
  description: ['바로 섭니다.', '천천히 앉았다 일어납니다.'],
  sets: 3,
  reps: 10,
  restSeconds: 30,
  cues: ['무릎이 안으로 모이지 않게 합니다.'],
  commonMistakes: ['허리가 굽는다'],
  precautions: ['무릎이 아프면 범위를 줄이세요.'],
  regressions: ['의자를 잡고 합니다.'],
  progressions: ['속도를 늦춰 버팁니다.'],
  videoUrl: null,
  thumbnailUrl: null,
  estimatedSeconds: 0,
};

const BASE_PROGRAM: Program = {
  id: 'my-program',
  title: '내가 만든 루틴',
  description: '수업 전에 쓰는 루틴입니다.',
  targetUser: '우리 반 학생',
  goal: '준비운동',
  category: 'functional',
  bodyRegion: null,
  phase: null,
  level: 'beginner',
  durationMinutes: 10,
  frequencyPerWeek: '주 3회',
  exerciseIds: [],
  progressionRule: '자세가 안정되면 횟수를 늘립니다.',
  stopRule: '통증이 생기면 즉시 중단하세요.',
  caution: '바닥이 미끄럽지 않은지 확인하세요.',
};

describe('편집하지 않으면 기본 목록 그대로', () => {
  it('운동 수가 같다', () => {
    expect(resolveExercises(EMPTY_LIBRARY_STORE)).toHaveLength(EXERCISES.length);
  });

  it('프로그램 수가 같다', () => {
    expect(resolvePrograms(EMPTY_LIBRARY_STORE)).toHaveLength(PROGRAMS.length);
  });

  it('id 로 찾으면 기본 내용이 나온다', () => {
    expect(resolveExercise(EMPTY_LIBRARY_STORE, 'knee-p1-01')?.name).toBe('쿼드셋');
    expect(isExerciseEdited(EMPTY_LIBRARY_STORE, 'knee-p1-01')).toBe(false);
  });
});

describe('주의사항은 비울 수 없다', () => {
  it('운동의 주의사항을 비우면 저장되지 않는다', () => {
    const result = saveExercise(EMPTY_LIBRARY_STORE, { ...BASE_EXERCISE, precautions: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toContain('주의사항');
  });

  it('기본 운동의 주의사항도 비울 수 없다', () => {
    const original = resolveExercise(EMPTY_LIBRARY_STORE, 'knee-p1-01');
    expect(original).toBeDefined();
    if (!original) return;
    const result = saveExercise(EMPTY_LIBRARY_STORE, { ...original, precautions: [] });
    expect(result.ok).toBe(false);
  });

  it('프로그램의 중단 기준을 비우면 저장되지 않는다', () => {
    const result = saveProgram(EMPTY_LIBRARY_STORE, {
      ...BASE_PROGRAM,
      exerciseIds: ['knee-p1-01'],
      stopRule: '   ',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toContain('중단 기준');
  });
});

describe('통증을 참으라는 표현은 저장 자체가 막힌다', () => {
  it.each([
    ['참고 하세요', 'cues'],
    ['아파도 계속 하세요', 'description'],
    ['한계까지 밀어붙이세요', 'progressions'],
  ])('"%s" 는 막힌다', (phrase, field) => {
    const exercise: Exercise = { ...BASE_EXERCISE, [field]: [phrase] } as Exercise;
    const result = saveExercise(EMPTY_LIBRARY_STORE, exercise);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toContain('통증을 참으라');
  });

  it('평범한 문장은 통과한다', () => {
    expect(checkExercise(BASE_EXERCISE).errors).toEqual([]);
  });
});

describe('의료 표현은 막지 않고 알린다', () => {
  it("'처방' 은 경고만 하고 저장된다", () => {
    const result = saveExercise(EMPTY_LIBRARY_STORE, {
      ...BASE_EXERCISE,
      cues: ['의사 처방을 먼저 확인하세요.'],
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warnings.join(' ')).toContain('처방');
  });

  it("'물리치료사와 상의' 같은 정당한 표현도 막지 않는다", () => {
    const result = saveExercise(EMPTY_LIBRARY_STORE, {
      ...BASE_EXERCISE,
      precautions: ['통증이 계속되면 물리치료사와 상의하세요.'],
    });
    expect(result.ok).toBe(true);
  });
});

describe('운동 추가·수정·감추기', () => {
  it('새 운동을 만들면 목록에 늘어난다', () => {
    const store = must(addExercise(EMPTY_LIBRARY_STORE, BASE_EXERCISE));
    expect(resolveExercises(store)).toHaveLength(EXERCISES.length + 1);
    expect(isExerciseAdded(store, 'my-01')).toBe(true);
  });

  it('이미 있는 id 로는 만들 수 없다', () => {
    const result = addExercise(EMPTY_LIBRARY_STORE, { ...BASE_EXERCISE, id: 'knee-p1-01' });
    expect(result.ok).toBe(false);
  });

  it('소요 시간은 세트·횟수·휴식으로 다시 계산한다', () => {
    const store = must(saveExercise(EMPTY_LIBRARY_STORE, BASE_EXERCISE));
    const saved = resolveExercise(store, 'my-01');
    expect(saved?.estimatedSeconds).toBe(estimateSeconds(BASE_EXERCISE));
    expect(saved?.estimatedSeconds).toBeGreaterThan(0);
  });

  it('기본 운동은 지우지 않고 감춘다 (되돌릴 수 있다)', () => {
    const store = must(removeExercise(EMPTY_LIBRARY_STORE, 'knee-p1-01'));
    expect(resolveExercise(store, 'knee-p1-01')).toBeUndefined();
    expect(resolveExercises(store)).toHaveLength(EXERCISES.length - 1);

    const back = restoreExercise(store, 'knee-p1-01');
    expect(resolveExercise(back, 'knee-p1-01')?.name).toBe('쿼드셋');
  });

  it('내가 만든 운동은 완전히 지운다', () => {
    let store = must(addExercise(EMPTY_LIBRARY_STORE, BASE_EXERCISE));
    store = must(removeExercise(store, 'my-01'));
    expect(resolveExercise(store, 'my-01')).toBeUndefined();
    expect(store.addedExerciseIds).not.toContain('my-01');
  });

  it('고친 운동을 기본값으로 되돌린다', () => {
    const original = resolveExercise(EMPTY_LIBRARY_STORE, 'knee-p1-01');
    if (!original) throw new Error('기본 운동이 없다');
    const store = must(saveExercise(EMPTY_LIBRARY_STORE, { ...original, name: '바꾼 이름' }));
    expect(resolveExercise(store, 'knee-p1-01')?.name).toBe('바꾼 이름');
    expect(resolveExercise(resetExercise(store, 'knee-p1-01'), 'knee-p1-01')?.name).toBe('쿼드셋');
  });

  it('기본 데이터 자체는 건드리지 않는다', () => {
    must(saveExercise(EMPTY_LIBRARY_STORE, { ...BASE_EXERCISE, id: 'knee-p1-01' }));
    expect(EXERCISES.find((e) => e.id === 'knee-p1-01')?.name).toBe('쿼드셋');
  });
});

describe('프로그램 편성', () => {
  it('없는 운동을 가리키면 저장되지 않는다', () => {
    const result = saveProgram(EMPTY_LIBRARY_STORE, {
      ...BASE_PROGRAM,
      exerciseIds: ['없는-운동'],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toContain('없는 운동');
  });

  it('운동이 하나도 없으면 저장되지 않는다', () => {
    expect(saveProgram(EMPTY_LIBRARY_STORE, BASE_PROGRAM).ok).toBe(false);
  });

  it('내가 만든 운동으로 새 프로그램을 만들 수 있다', () => {
    let store = must(addExercise(EMPTY_LIBRARY_STORE, BASE_EXERCISE));
    store = must(addProgram(store, { ...BASE_PROGRAM, exerciseIds: ['my-01', 'knee-p1-01'] }));
    expect(resolveProgram(store, 'my-program')?.exerciseIds).toEqual(['my-01', 'knee-p1-01']);
    expect(resolvePrograms(store)).toHaveLength(PROGRAMS.length + 1);
  });

  it('감춘 운동을 가리키는 프로그램은 저장되지 않는다', () => {
    const store = must(removeExercise(EMPTY_LIBRARY_STORE, 'knee-p1-01'));
    const result = saveProgram(store, { ...BASE_PROGRAM, exerciseIds: ['knee-p1-01'] });
    expect(result.ok).toBe(false);
  });

  it('운동 순서를 바꾼다', () => {
    const program = { ...BASE_PROGRAM, exerciseIds: ['a', 'b', 'c'] };
    expect(moveExerciseInProgram(program, 0, 1)?.exerciseIds).toEqual(['b', 'a', 'c']);
    expect(moveExerciseInProgram(program, 0, -1)).toBeNull();
    expect(moveExerciseInProgram(program, 2, 1)).toBeNull();
  });

  it('프로그램도 감추고 되돌릴 수 있다', () => {
    const first = PROGRAMS[0];
    if (!first) throw new Error('프로그램이 없다');
    const store = must(removeProgram(EMPTY_LIBRARY_STORE, first.id));
    expect(resolveProgram(store, first.id)).toBeUndefined();
    expect(resolvePrograms(store)).toHaveLength(PROGRAMS.length - 1);
  });

  it('프로그램 검사도 통증을 참으라는 표현을 막는다', () => {
    expect(
      checkProgram({ ...BASE_PROGRAM, caution: '아파도 계속 하세요.' }).errors.join(' '),
    ).toContain('통증을 참으라');
  });
});

describe('되돌리기와 내보내기', () => {
  it('전체 되돌리기는 아무것도 남기지 않는다', () => {
    const store = must(saveExercise(EMPTY_LIBRARY_STORE, BASE_EXERCISE));
    expect(editedCount(store).exercises).toBe(1);
    expect(editedCount(resetAll()).exercises).toBe(0);
  });

  it('바꾼 것이 없으면 안내만 나온다', () => {
    expect(exportAsCode(EMPTY_LIBRARY_STORE)).toContain('바꾼 것이 없습니다');
  });

  it('붙여 넣을 수 있는 형태로 뽑는다', () => {
    let store = must(saveExercise(EMPTY_LIBRARY_STORE, {
      ...BASE_EXERCISE,
      name: "따옴표 ' 가 든 이름",
    }));
    store = must(removeExercise(store, 'knee-p1-02'));
    const code = exportAsCode(store);
    expect(code).toContain('defineExercise(');
    expect(code).toContain("\\'");
    expect(code).toContain('knee-p1-02');
    // 자동 계산되는 값은 코드에 넣지 않는다
    expect(code).not.toContain('estimatedSeconds');
  });
});

describe('편집기는 안전 규칙을 우회하지 않는다', () => {
  it('편집 내용은 설문·기록 전체 삭제 대상이 아니다', () => {
    const storage = read('src/utils/storage.ts');
    const allKeys = storage.slice(storage.indexOf('ALL_STORAGE_KEYS'));
    expect(allKeys).not.toContain('libraryOverrides');
  });

  it('부위·단계 변경 경고 문구가 있다', () => {
    const types = read('src/features/library/libraryTypes.ts');
    expect(types).toContain('PHASE_CHANGE_WARNING');
    expect(types).toContain('배정');
  });
});
