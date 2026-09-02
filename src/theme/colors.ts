/**
 * 리커버핏 Coach 컬러 토큰
 *
 * 규칙
 * - 화면에서 색상 값을 직접 쓰지 않는다. 반드시 이 파일을 거친다.
 * - `danger` 는 운동 중단·상담 안내 전용이다. 일반 버튼에 쓰지 않는다.
 *   (경고 색을 남용하면 진짜 경고가 눈에 안 들어온다)
 */
export const colors = {
  // 브랜드 — 회복·안정을 뜻하는 딥 그린틸
  primary: '#1F6F63',
  primaryDark: '#155249',
  primaryLight: '#E6F2EF',
  onPrimary: '#FFFFFF',

  // 보조
  secondary: '#3C6E9B',
  secondaryLight: '#E7EFF6',

  // 상태
  success: '#2E7D32',
  successLight: '#E8F3E9',
  warning: '#C77700',
  warningLight: '#FDF2E2',
  danger: '#B3261E', // ⚠️ 중단·차단·상담 안내 전용
  dangerLight: '#FBEAE9',

  // 텍스트
  text: '#1A1C1B',
  textMuted: '#5A6260',
  textDisabled: '#9AA3A1',
  onDark: '#FFFFFF',

  // 배경·구분선
  background: '#F7F9F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF3F2',
  border: '#DCE3E1',
  overlay: 'rgba(26, 28, 27, 0.45)',

  // 통증 척도 시각화 (0~10)
  pain: {
    none: '#2E7D32',
    mild: '#7CB342',
    moderate: '#C77700',
    severe: '#B3261E',
  },
} as const;

export type ColorToken = keyof typeof colors;
