import { EXERCISES } from '@/data/exercises';
import { NUTRITION_PLANS } from '@/data/mealTemplates';
import { PROGRAMS } from '@/data/programs';
import {
  adjustDuringWorkout,
  shouldLowerNextSession,
} from '@/features/assessment/assessmentEngine';
import { RED_FLAG_QUESTIONS } from '@/features/assessment/assessmentQuestions';
import { RED_FLAG_IDS } from '@/features/assessment/assessmentTypes';
import { isRouteAllowed, resolveGateRoute } from '@/features/assessment/routeGuard';
import { BLOCKED_MESSAGE, DISCLAIMER_FULL, DISCLAIMER_SHORT } from '@/utils/safety';

/**
 * 안전 회귀 테스트.
 * 릴리즈 전에 전부 초록이어야 한다. (docs/SAFETY_POLICY.md §12)
 */

describe('시나리오 9 — 운동 중 통증 조정', () => {
  it.each([0, 1, 2, 3] as const)('통증 %d점이면 루틴을 유지한다', (score) => {
    expect(adjustDuringWorkout(score).action).toBe('continue');
  });

  it.each([4, 5] as const)('통증 %d점이면 강도를 낮춘다', (score) => {
    const result = adjustDuringWorkout(score);
    expect(result.action).toBe('reduce');
    if (result.action === 'reduce') {
      expect(result.hints.length).toBeGreaterThan(0);
    }
  });

  it.each([6, 7, 8, 9, 10] as const)('통증 %d점이면 운동을 중단한다', (score) => {
    const result = adjustDuringWorkout(score);
    expect(result.action).toBe('stop');
    if (result.action === 'stop') {
      expect(result.consult).toBe(true);
    }
  });

  it('운동 후 통증이 늘면 다음 루틴 강도를 낮춘다', () => {
    expect(shouldLowerNextSession(3, 5)).toBe(true);
    expect(shouldLowerNextSession(5, 3)).toBe(false);
    expect(shouldLowerNextSession(4, 4)).toBe(false);
  });
});

describe('시나리오 10 — 라우트 우회 차단', () => {
  const FRESH = { consentValid: false, privacyValid: false, hasAssessment: false, blocked: false };
  const CONSENTED = { consentValid: true, privacyValid: true, hasAssessment: false, blocked: false };
  const BLOCKED = { consentValid: true, privacyValid: true, hasAssessment: true, blocked: true };
  const OK = { consentValid: true, privacyValid: true, hasAssessment: true, blocked: false };

  it.each([['(tabs)', 'index'], ['workout', 'player'], ['nutrition', 'result']])(
    '동의 전에는 %s/%s 에 갈 수 없다',
    (group, screen) => {
      expect(isRouteAllowed(FRESH, [group, screen])).toBe(false);
    },
  );

  it('동의 전에는 온보딩만 허용된다', () => {
    expect(isRouteAllowed(FRESH, ['onboarding', 'safety'])).toBe(true);
    expect(resolveGateRoute(FRESH)).toBe('/onboarding');
  });

  it('설문 전에는 탭·운동 화면에 갈 수 없다', () => {
    expect(isRouteAllowed(CONSENTED, ['(tabs)', 'index'])).toBe(false);
    expect(isRouteAllowed(CONSENTED, ['workout', 'player'])).toBe(false);
    expect(isRouteAllowed(CONSENTED, ['assessment'])).toBe(true);
  });

  it.each([
    ['(tabs)', 'index'],
    ['(tabs)', 'workout'],
    ['(tabs)', 'nutrition'],
    ['workout', 'player'],
    ['nutrition', 'result'],
    ['assessment', 'result'],
  ])('차단 상태에서는 %s/%s 로 빠져나갈 수 없다', (group, screen) => {
    expect(isRouteAllowed(BLOCKED, [group, screen])).toBe(false);
  });

  it('차단 상태에서 상담 안내 화면에는 머무를 수 있다', () => {
    expect(isRouteAllowed(BLOCKED, ['assessment', 'blocked'])).toBe(true);
    expect(resolveGateRoute(BLOCKED)).toBe('/assessment/blocked');
  });

  it('차단 상태에서 설문 다시 하기는 허용된다', () => {
    expect(isRouteAllowed(BLOCKED, ['assessment'])).toBe(true);
  });

  it('정상 사용자는 모든 화면에 접근할 수 있다', () => {
    expect(isRouteAllowed(OK, ['(tabs)', 'index'])).toBe(true);
    expect(isRouteAllowed(OK, ['workout', 'player'])).toBe(true);
    expect(resolveGateRoute(OK)).toBe('/(tabs)');
  });
});

describe('금지 표현 검사', () => {
  /**
   * '진단·치료·처방을 하지 않습니다' 처럼 부정문으로 쓰는 것은 허용한다.
   * 금지 대상은 앱이 그 행위를 한다고 말하는 경우다.
   */
  const FORBIDDEN = ['처방', '치료', '완치', '진단'];
  const ALLOWED_PHRASES = ['물리치료사', '치료사', '재활의학과', '병원 진단'];

  function strip(text: string): string {
    return ALLOWED_PHRASES.reduce((acc, p) => acc.split(p).join(''), text);
  }
  function isNegated(text: string): boolean {
    return text.includes('않') || text.includes('아닙니다') || text.includes('대신하지');
  }

  function userFacingCopy(): string[] {
    return [
      DISCLAIMER_SHORT,
      ...DISCLAIMER_FULL,
      BLOCKED_MESSAGE.title,
      BLOCKED_MESSAGE.body,
      ...RED_FLAG_QUESTIONS.flatMap((q) => [q.label, q.hint]),
      ...EXERCISES.flatMap((e) => [
        e.name,
        e.purpose,
        ...e.description,
        ...e.cues,
        ...e.commonMistakes,
        ...e.precautions,
        ...e.regressions,
        ...e.progressions,
      ]),
      ...PROGRAMS.flatMap((p) => [
        p.title,
        p.description,
        p.targetUser,
        p.goal,
        p.caution,
        p.progressionRule,
        p.stopRule,
      ]),
      ...NUTRITION_PLANS.flatMap((p) => [
        p.title,
        p.targetUser,
        ...p.mainPrinciples,
        ...p.foodsToLimit,
        ...p.studentSafeGuide,
        ...p.cautionMessages,
        p.hydrationGuide,
      ]),
    ];
  }

  it.each(FORBIDDEN)('"%s" 를 단정적으로 쓰지 않는다', (word) => {
    const offenders = userFacingCopy().filter(
      (text) => strip(text).includes(word) && !isNegated(text),
    );
    expect(offenders).toEqual([]);
  });

  it('통증을 참으라고 하지 않는다', () => {
    const bad = ['참고', '버티세요', '한계까지', '아파도'];
    const offenders = userFacingCopy().filter((t) => bad.some((b) => t.includes(b)));
    expect(offenders).toEqual([]);
  });

  it('차단 화면에서 대체 운동을 제안하지 않는다', () => {
    expect(BLOCKED_MESSAGE.body).not.toContain('스트레칭이라도');
    expect(BLOCKED_MESSAGE.body).not.toContain('가벼운 운동');
  });
});

describe('위험 신호 문항 데이터', () => {
  it('12개 문항이 모두 정의되어 있다', () => {
    expect(RED_FLAG_IDS).toHaveLength(12);
    expect(RED_FLAG_QUESTIONS).toHaveLength(12);
  });

  it('타입 목록과 문항 데이터가 일치한다', () => {
    expect(RED_FLAG_QUESTIONS.map((q) => q.id).sort()).toEqual([...RED_FLAG_IDS].sort());
  });

  it('모든 문항에 보조 설명이 있다', () => {
    for (const q of RED_FLAG_QUESTIONS) {
      expect(q.label.length).toBeGreaterThan(0);
      expect(q.hint.length).toBeGreaterThan(0);
    }
  });
});
