import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { buildRecommendation } from '@/features/assessment/recommendation';

import { makeAssessment, makePain } from './fixtures';

const SURVEY_SOURCE = readFileSync(
  join(__dirname, '..', '..', '..', 'app', 'assessment', 'index.tsx'),
  'utf8',
);

/**
 * 빠른 시작(설문 건너뛰기) 관련 규칙.
 * 어떤 경우에도 위험 신호 확인은 건너뛸 수 없어야 한다.
 */

describe('건너뛰기는 안전 확인까지 건너뛰지 않는다', () => {
  it('건너뛸 수 있는 단계 목록에 위험 신호가 없다', () => {
    const match = SURVEY_SOURCE.match(/const SKIPPABLE: StepId\[\] = \[([\s\S]*?)\];/);
    expect(match).not.toBeNull();

    const skippable = match?.[1] ?? '';
    expect(skippable).not.toContain('redFlags');
    expect(skippable).not.toContain('painDetail');
    expect(skippable).not.toContain('userType');
    expect(skippable).not.toContain('basic');
  });

  it('빠른 시작 단계 목록에도 위험 신호가 포함된다', () => {
    // steps 계산에서 quick/full 어느 쪽이든 redFlags 를 push 한다
    const match = SURVEY_SOURCE.match(/const steps = useMemo<StepId\[\]>\(\(\) => \{([\s\S]*?)\}, \[/);
    expect(match).not.toBeNull();

    const body = match?.[1] ?? '';
    // 'redFlags' 를 push 하는 줄이 조건문 밖(공통 경로)에 있어야 한다
    expect(body).toContain("base.push('redFlags')");
  });
});

describe('건너뛴 항목은 안전한 기본값으로 채운다', () => {
  it('목표를 비워도 일반 건강관리로 채워 루틴이 나온다', () => {
    const rec = buildRecommendation(makeAssessment({ goals: [] }));
    expect(rec.exerciseProgramId).not.toBeNull();
    expect(rec.todayWorkout.length).toBeGreaterThan(0);
  });

  it('장비를 비워도 맨몸 루틴이 나온다', () => {
    const rec = buildRecommendation(
      makeAssessment({ goals: ['posture'], equipment: ['bodyweight'] }),
    );
    expect(rec.todayWorkout.length).toBeGreaterThanOrEqual(3);
  });

  it('통증만 답해도 회복 루틴이 나온다', () => {
    const rec = buildRecommendation(
      makeAssessment({
        goals: [],
        painRegions: ['ankle'],
        painDetails: [makePain('ankle', 5)],
      }),
    );
    expect(rec.exerciseProgramId).toBe('ankle_recovery_phase1');
  });

  it('건너뛴 상태에서도 위험 신호가 있으면 차단된다', () => {
    const rec = buildRecommendation(
      makeAssessment({ goals: [], places: [], redFlags: ['chestPain'] }),
    );
    expect(rec.riskLevel).toBe('red');
    expect(rec.workout).toBeNull();
  });
});
