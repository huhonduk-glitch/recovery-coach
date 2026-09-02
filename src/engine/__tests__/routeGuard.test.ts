import { isRouteAllowed, resolveGateRoute, type GateState } from '@/engine/safety';

const FRESH: GateState = { consentValid: false, hasProfile: false, screeningBlocked: null };
const CONSENTED: GateState = { consentValid: true, hasProfile: false, screeningBlocked: null };
const PROFILED: GateState = { consentValid: true, hasProfile: true, screeningBlocked: null };
const BLOCKED: GateState = { consentValid: true, hasProfile: true, screeningBlocked: true };
const PASSED: GateState = { consentValid: true, hasProfile: true, screeningBlocked: false };

describe('[S9] 동의 전에는 어떤 화면에도 들어갈 수 없다', () => {
  it.each([
    ['(tabs)', 'home'],
    ['(result)', 'exercise'],
    ['(result)', 'nutrition'],
    ['(survey)', 'screening'],
    ['session', 'play'],
  ])('%s/%s 직접 진입이 막힌다', (group, screen) => {
    expect(isRouteAllowed(FRESH, group, screen)).toBe(false);
  });

  it('온보딩 화면은 허용된다', () => {
    expect(isRouteAllowed(FRESH, '(onboarding)', 'safety')).toBe(true);
  });

  it('동의 화면으로 되돌린다', () => {
    expect(resolveGateRoute(FRESH)).toBe('/(onboarding)/intro');
  });
});

describe('기본 정보 입력 전', () => {
  it('설문으로 건너뛸 수 없다', () => {
    expect(isRouteAllowed(CONSENTED, '(survey)', 'screening')).toBe(false);
  });

  it('기본 정보 화면으로 되돌린다', () => {
    expect(resolveGateRoute(CONSENTED)).toBe('/(onboarding)/profile');
  });
});

describe('스크리닝 전', () => {
  it('결과·루틴 화면에 갈 수 없다', () => {
    expect(isRouteAllowed(PROFILED, '(result)', 'exercise')).toBe(false);
    expect(isRouteAllowed(PROFILED, '(tabs)', 'home')).toBe(false);
    expect(isRouteAllowed(PROFILED, 'session', 'play')).toBe(false);
  });

  it('설문은 진행할 수 있다', () => {
    expect(isRouteAllowed(PROFILED, '(survey)', 'screening')).toBe(true);
  });
});

describe('[S2] 차단 상태에서는 우회 경로가 없다', () => {
  it.each([
    ['(tabs)', 'home'],
    ['(tabs)', 'routine'],
    ['(result)', 'exercise'],
    ['(result)', 'nutrition'],
    ['(result)', 'summary'],
    ['(survey)', 'body'],
    ['(survey)', 'pain'],
    ['session', 'play'],
  ])('%s/%s 로 빠져나갈 수 없다', (group, screen) => {
    expect(isRouteAllowed(BLOCKED, group, screen)).toBe(false);
  });

  it('상담 안내 화면에는 머무를 수 있다', () => {
    expect(isRouteAllowed(BLOCKED, '(result)', 'blocked')).toBe(true);
  });

  it('안전 확인 다시 하기는 허용된다', () => {
    expect(isRouteAllowed(BLOCKED, '(survey)', 'screening')).toBe(true);
  });

  it('차단 화면으로 되돌린다', () => {
    expect(resolveGateRoute(BLOCKED)).toBe('/(result)/blocked?reason=redFlag');
  });
});

describe('스크리닝 통과 후', () => {
  it('모든 화면에 접근할 수 있다', () => {
    expect(isRouteAllowed(PASSED, '(tabs)', 'home')).toBe(true);
    expect(isRouteAllowed(PASSED, '(result)', 'exercise')).toBe(true);
    expect(isRouteAllowed(PASSED, 'session', 'play')).toBe(true);
  });

  it('홈으로 보낸다', () => {
    expect(resolveGateRoute(PASSED)).toBe('/(tabs)/home');
  });
});
