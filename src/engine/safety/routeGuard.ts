/**
 * 라우트 접근 판정.
 *
 * 진입 분기(app/index.tsx)만으로는 부족하다. 딥링크나 주소 직접 입력으로
 * 중간 화면에 바로 들어올 수 있기 때문에, 모든 화면 이동마다 검사한다.
 * (docs/SAFETY_POLICY.md §2 — 게이트 우회 금지)
 */

export interface GateState {
  consentValid: boolean;
  hasProfile: boolean;
  /** 스크리닝을 아직 하지 않았으면 null */
  screeningBlocked: boolean | null;
}

export type GateRoute =
  | '/(onboarding)/intro'
  | '/(onboarding)/profile'
  | '/(survey)/screening'
  | '/(result)/blocked?reason=redFlag'
  | '/(tabs)/home';

/** 지금 상태에서 있어야 할 화면 */
export function resolveGateRoute(state: GateState): GateRoute {
  if (!state.consentValid) return '/(onboarding)/intro';
  if (!state.hasProfile) return '/(onboarding)/profile';
  if (state.screeningBlocked === null) return '/(survey)/screening';
  if (state.screeningBlocked) return '/(result)/blocked?reason=redFlag';
  return '/(tabs)/home';
}

/**
 * 현재 화면에 머물러도 되는지.
 *
 * @param group  라우트 그룹 (예: '(tabs)')
 * @param screen 그룹 안의 화면 이름 (예: 'home')
 */
export function isRouteAllowed(
  state: GateState,
  group: string | undefined,
  screen: string | undefined,
): boolean {
  // 진입 분기 화면(app/index.tsx)은 스스로 이동하므로 통과시킨다
  if (group === undefined) return true;

  // 동의 전에는 온보딩 밖으로 나갈 수 없다
  if (!state.consentValid) return group === '(onboarding)';

  // 기본 정보를 입력하기 전에는 설문·결과로 갈 수 없다
  if (!state.hasProfile) return group === '(onboarding)';

  // 차단 상태에서는 상담 안내 화면과 안전 확인 재시도만 허용한다.
  // 대체 루틴으로 빠져나가는 경로를 만들지 않는다.
  if (state.screeningBlocked === true) {
    return (
      (group === '(result)' && screen === 'blocked') ||
      (group === '(survey)' && screen === 'screening')
    );
  }

  // 스크리닝 전에는 결과·루틴 화면에 갈 수 없다
  if (state.screeningBlocked === null) {
    return group === '(survey)' || group === '(onboarding)';
  }

  return true;
}
