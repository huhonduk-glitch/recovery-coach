import { buildRecommendation } from '@/features/assessment/recommendation';
import { RED_FLAG_IDS } from '@/features/assessment/assessmentTypes';

import { makeAssessment, makePain } from './fixtures';

/**
 * 사용자가 지정한 테스트 시나리오 (프롬프트 3, 7).
 * 여기가 깨지면 안전 규칙이 깨진 것이다.
 */

describe('시나리오 1 — 위험 신호가 있는 사용자', () => {
  it.each(RED_FLAG_IDS)('%s 하나만 있어도 운동 추천을 받지 않는다', (flag) => {
    const rec = buildRecommendation(makeAssessment({ redFlags: [flag] }));

    expect(rec.riskLevel).toBe('red');
    expect(rec.exerciseProgramId).toBeNull();
    expect(rec.workout).toBeNull();
    expect(rec.todayWorkout).toHaveLength(0);
  });

  it('위험 신호는 점수화하지 않는다 (1개도 차단)', () => {
    const rec = buildRecommendation(makeAssessment({ redFlags: ['nightPain'] }));
    expect(rec.riskLevel).toBe('red');
  });

  it('차단되어도 대체 루틴을 만들지 않는다', () => {
    const rec = buildRecommendation(
      makeAssessment({ redFlags: ['severeTrauma'], goals: ['posture'] }),
    );
    expect(rec.workout).toBeNull();
    expect(rec.weeklyPlan).toHaveLength(0);
  });
});

describe('시나리오 2 — 허리 통증 + 다리 저림', () => {
  it('저림을 위험 신호로 답하면 상담 안내를 받는다', () => {
    const rec = buildRecommendation(
      makeAssessment({
        painRegions: ['lowBack'],
        painDetails: [makePain('lowBack', 5, { numbness: true })],
        redFlags: ['numbnessParalysis'],
      }),
    );

    expect(rec.riskLevel).toBe('red');
    expect(rec.exerciseProgramId).toBeNull();
  });
});

describe('시나리오 3 — 무릎 통증 5점', () => {
  const rec = buildRecommendation(
    makeAssessment({
      painRegions: ['knee'],
      painDetails: [makePain('knee', 5)],
      goals: ['painRelief'],
    }),
  );

  it('무릎 1단계 루틴을 받는다', () => {
    expect(rec.exerciseProgramId).toBe('knee_recovery_phase1');
  });

  it('위험도는 yellow 다', () => {
    expect(rec.riskLevel).toBe('yellow');
  });

  it('오늘의 운동이 비어 있지 않다', () => {
    expect(rec.todayWorkout.length).toBeGreaterThan(0);
  });

  it('중단 기준 안내가 포함된다', () => {
    expect(rec.cautionMessages.some((m) => m.includes('6점'))).toBe(true);
  });
});

describe('통증 점수별 단계 배정', () => {
  it('7점 이상이면 운동을 제공하지 않는다', () => {
    const rec = buildRecommendation(
      makeAssessment({ painRegions: ['knee'], painDetails: [makePain('knee', 7)] }),
    );
    expect(rec.riskLevel).toBe('red');
    expect(rec.exerciseProgramId).toBeNull();
  });

  it('4~6점이면 1단계를 받는다', () => {
    for (const score of [4, 5, 6] as const) {
      const rec = buildRecommendation(
        makeAssessment({ painRegions: ['shoulder'], painDetails: [makePain('shoulder', score)] }),
      );
      expect(rec.exerciseProgramId).toBe('shoulder_recovery_phase1');
    }
  });

  it('1~3점이면 2단계를 받는다', () => {
    for (const score of [1, 2, 3] as const) {
      const rec = buildRecommendation(
        makeAssessment({ painRegions: ['ankle'], painDetails: [makePain('ankle', score)] }),
      );
      expect(rec.exerciseProgramId).toBe('ankle_recovery_phase2');
    }
  });

  it('부위가 여러 개면 가장 아픈 부위를 기준으로 한다', () => {
    const rec = buildRecommendation(
      makeAssessment({
        painRegions: ['ankle', 'lowBack'],
        painDetails: [makePain('ankle', 2), makePain('lowBack', 5)],
      }),
    );
    expect(rec.exerciseProgramId).toBe('back_recovery_phase1');
  });
});

describe('시나리오 4 — 통증 0점 + 체형교정 목표', () => {
  const rec = buildRecommendation(makeAssessment({ goals: ['posture'] }));

  it('체형교정 루틴을 받는다', () => {
    expect(rec.exerciseProgramId).toBe('posture_correction_beginner');
  });

  it('위험도는 green 이다', () => {
    expect(rec.riskLevel).toBe('green');
  });
});

describe('목표별 카테고리 배정', () => {
  it('유연성 목표면 동적웜업을 받는다', () => {
    const rec = buildRecommendation(makeAssessment({ goals: ['flexibility'] }));
    expect(rec.exerciseProgramId).toBe('dynamic_warmup_basic');
  });

  it('수행능력 목표면 기능성 운동을 받는다', () => {
    const rec = buildRecommendation(makeAssessment({ goals: ['performance'] }));
    expect(rec.exerciseProgramId).toBe('functional_basic');
  });

  it('통증 없고 운동 경험이 많으면 performance 로 분류된다', () => {
    const rec = buildRecommendation(
      makeAssessment({
        goals: ['performance'],
        exerciseBackground: {
          frequency: 'f5plus',
          intensity: 'hard',
          squatExperience: 'familiar',
          painDuringExerciseLastMonth: false,
          style: 'intense',
        },
      }),
    );
    expect(rec.riskLevel).toBe('performance');
  });
});

describe('시나리오 5 — 운동 경험이 적은 사용자', () => {
  it('초급 운동만 받는다', () => {
    const rec = buildRecommendation(
      makeAssessment({
        goals: ['performance'],
        exerciseBackground: {
          frequency: 'none',
          intensity: 'light',
          squatExperience: 'none',
          painDuringExerciseLastMonth: false,
          style: 'short',
        },
      }),
    );

    const levels = rec.workout?.exercises.map((e) => e.level) ?? [];
    expect(levels.length).toBeGreaterThan(0);
    expect(levels.every((l) => l === 'beginner')).toBe(true);
  });
});

describe('시나리오 6 — 운동 가능 시간이 10분', () => {
  it('30분일 때보다 운동 수가 적거나 같다', () => {
    const short = buildRecommendation(makeAssessment({ goals: ['posture'], availableTime: 10 }));
    const long = buildRecommendation(makeAssessment({ goals: ['posture'], availableTime: 45 }));

    expect(short.todayWorkout.length).toBeLessThanOrEqual(long.todayWorkout.length);
    expect(short.todayWorkout.length).toBeGreaterThanOrEqual(3);
  });

  it('시간이 짧아도 최소 3개는 보장한다', () => {
    const rec = buildRecommendation(makeAssessment({ goals: ['posture'], availableTime: 10 }));
    expect(rec.todayWorkout.length).toBeGreaterThanOrEqual(3);
  });
});

describe('장비 필터', () => {
  it('맨몸만 있으면 밴드·덤벨 운동이 나오지 않는다', () => {
    const rec = buildRecommendation(
      makeAssessment({ goals: ['posture'], equipment: ['bodyweight'] }),
    );

    const equipmentUsed = rec.workout?.exercises.flatMap((e) => e.equipment) ?? [];
    expect(equipmentUsed).not.toContain('band');
    expect(equipmentUsed).not.toContain('dumbbell');
  });

  it('밴드가 있으면 밴드 운동이 포함될 수 있다', () => {
    const rec = buildRecommendation(
      makeAssessment({
        painRegions: ['shoulder'],
        painDetails: [makePain('shoulder', 2)],
        equipment: ['bodyweight', 'band'],
      }),
    );
    expect(rec.exerciseProgramId).toBe('shoulder_recovery_phase2');
    expect(rec.workout?.exercises.length).toBeGreaterThan(0);
  });
});

describe('결정론 — 같은 입력이면 같은 결과', () => {
  it('100번 실행해도 결과가 같다', () => {
    const assessment = makeAssessment({
      painRegions: ['knee'],
      painDetails: [makePain('knee', 5)],
    });
    const first = JSON.stringify(buildRecommendation(assessment));

    for (let i = 0; i < 100; i += 1) {
      expect(JSON.stringify(buildRecommendation(assessment))).toBe(first);
    }
  });
});
