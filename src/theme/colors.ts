/**
 * 리커버핏 Coach 컬러 토큰
 *
 * 규칙
 * - 화면에서 색상 값을 직접 쓰지 않는다. 반드시 이 파일을 거친다.
 * - danger(#EF4444)는 위험 신호·운동 중단 안내 전용이다. 일반 버튼에 쓰지 않는다.
 */
export const colors = {
  // 메인 — 딥 블루
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  onPrimary: '#FFFFFF',

  // 보조 — 민트/그린
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',

  // 경고 — 오렌지
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // 위험 — 레드 (위험 신호·중단 안내 전용)
  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  /**
   * 연한 배경 위에 올리는 글자색.
   *
   * 원래 색(#EF4444 등)을 연한 배경에 그대로 쓰면 대비가 3:1 수준까지 떨어져
   * 읽기 어렵다. 글자에는 아래 진한 색을 쓴다. (대비 4.5:1 이상, 테스트로 고정)
   */
  dangerText: '#B91C1C',
  warningText: '#B45309',
  secondaryText: '#047857',
  primaryText: '#1D4ED8',

  // 기본
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.45)',

  /** 위험도 분류 색상 (Red / Yellow / Green / Performance) */
  risk: {
    red: '#EF4444',
    yellow: '#F59E0B',
    green: '#10B981',
    performance: '#2563EB',
  },
} as const;
