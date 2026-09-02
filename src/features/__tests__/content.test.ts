import { EXERCISES, getExercise } from '@/data/exercises';
import { PROGRAMS } from '@/data/programs';
import type { ExerciseCategory } from '@/features/exercise/exerciseTypes';

/**
 * 콘텐츠 린트.
 * 주의사항이 비어 있는 운동은 미완성으로 본다. (docs/CONTENT_GUIDE.md §3.3)
 */

describe('운동 콘텐츠', () => {
  it('모든 운동에 주의사항이 있다', () => {
    const missing = EXERCISES.filter((e) => e.precautions.length === 0).map((e) => e.id);
    expect(missing).toEqual([]);
  });

  it('모든 운동에 핵심 큐가 있다', () => {
    const missing = EXERCISES.filter((e) => e.cues.length === 0).map((e) => e.id);
    expect(missing).toEqual([]);
  });

  it('모든 운동에 쉬운 버전과 어려운 버전이 있다', () => {
    const missing = EXERCISES.filter(
      (e) => e.regressions.length === 0 || e.progressions.length === 0,
    ).map((e) => e.id);
    expect(missing).toEqual([]);
  });

  it('모든 운동에 동작 설명이 2단계 이상 있다', () => {
    const missing = EXERCISES.filter((e) => e.description.length < 2).map((e) => e.id);
    expect(missing).toEqual([]);
  });

  it('운동 id 가 중복되지 않는다', () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('소요 시간이 0보다 크다', () => {
    const bad = EXERCISES.filter((e) => e.estimatedSeconds <= 0).map((e) => e.id);
    expect(bad).toEqual([]);
  });

  it('1~2단계 운동에는 덤벨을 쓰지 않는다', () => {
    const bad = EXERCISES.filter(
      (e) => e.phase !== null && e.phase <= 2 && e.equipment.includes('dumbbell'),
    ).map((e) => e.id);
    expect(bad).toEqual([]);
  });
});

describe('회복운동 단계 구성', () => {
  const RECOVERY_CATEGORIES: ExerciseCategory[] = [
    'shoulderRecovery',
    'backRecovery',
    'kneeRecovery',
    'ankleRecovery',
    'neckUpperBackRecovery',
  ];

  it.each(RECOVERY_CATEGORIES)('%s 는 1~4단계가 모두 있다', (category) => {
    for (const phase of [1, 2, 3, 4] as const) {
      const list = EXERCISES.filter((e) => e.category === category && e.phase === phase);
      expect(list.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('체형교정·웜업·기능성은 각각 8개 이상이다', () => {
    for (const category of ['posture', 'dynamicWarmup', 'functional'] as const) {
      const list = EXERCISES.filter((e) => e.category === category);
      expect(list.length).toBeGreaterThanOrEqual(8);
    }
  });
});

describe('프로그램 데이터', () => {
  it('모든 프로그램의 운동 id 가 실제로 존재한다', () => {
    const missing: string[] = [];
    for (const program of PROGRAMS) {
      for (const id of program.exerciseIds) {
        if (!getExercise(id)) missing.push(`${program.id} → ${id}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('모든 프로그램에 중단 기준과 주의가 있다', () => {
    for (const program of PROGRAMS) {
      expect(program.stopRule.length).toBeGreaterThan(0);
      expect(program.caution.length).toBeGreaterThan(0);
      expect(program.progressionRule.length).toBeGreaterThan(0);
    }
  });

  it('5개 부위 x 4단계 회복 프로그램이 모두 있다', () => {
    const prefixes = [
      'shoulder_recovery_phase',
      'back_recovery_phase',
      'knee_recovery_phase',
      'ankle_recovery_phase',
      'neck_upperback_recovery_phase',
    ];
    for (const prefix of prefixes) {
      for (const phase of [1, 2, 3, 4]) {
        expect(PROGRAMS.some((p) => p.id === `${prefix}${phase}`)).toBe(true);
      }
    }
  });

  it('프로그램 id 가 중복되지 않는다', () => {
    const ids = PROGRAMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
