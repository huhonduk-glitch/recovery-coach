/**
 * 라우트 접근 판정.
 *
 * 진입 분기만으로는 부족하다. 딥링크나 주소 직접 입력으로 중간 화면에 바로
 * 들어올 수 있기 때문에, 화면이 바뀔 때마다 검사한다.
 * (docs/SAFETY_POLICY.md §2 — 게이트 우회 금지)
 */

export interface GateState {
  consentValid: boolean;
  /** 개인정보 수집·이용 동의 */
  privacyValid: boolean;
  /** 설문을 마쳤는지 */
  hasAssessment: boolean;
  /** 위험 신호로 차단된 상태인지 */
  blocked: boolean;
}

export type GateRoute =
  | '/onboarding'
  | '/onboarding/safety'
  | '/onboarding/privacy'
  | '/assessment'
  | '/assessment/blocked'
  | '/(tabs)';

/** 지금 상태에서 있어야 할 화면 */
export function resolveGateRoute(state: GateState): GateRoute {
  if (!state.consentValid) return '/onboarding';
  if (!state.privacyValid) return '/onboarding/privacy';
  if (!state.hasAssessment) return '/assessment';
  if (state.blocked) return '/assessment/blocked';
  return '/(tabs)';
}

/**
 * 현재 화면에 머물러도 되는지.
 *
 * @param segments expo-router 의 useSegments() 결과
 */
export function isRouteAllowed(state: GateState, segments: readonly string[]): boolean {
  const group = segments[0];
  const screen = segments[1];

  // 진입 분기 화면은 스스로 이동하므로 통과시킨다
  if (group === undefined) return true;

  // 안전 안내와 개인정보 동의를 마치기 전에는 온보딩 밖으로 나갈 수 없다
  if (!state.consentValid || !state.privacyValid) return group === 'onboarding';

  // 차단 상태에서는 상담 안내와 설문 재시도만 허용한다.
  // 대체 루틴으로 빠져나가는 경로를 만들지 않는다.
  if (state.blocked) {
    return (group === 'assessment' && (screen === 'blocked' || screen === undefined));
  }

  // 설문 전에는 결과·탭·운동 화면에 갈 수 없다
  if (!state.hasAssessment) {
    return group === 'assessment' || group === 'onboarding';
  }

  return true;
}
