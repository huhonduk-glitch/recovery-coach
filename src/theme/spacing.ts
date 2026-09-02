/**
 * 간격·모서리·그림자 토큰
 * 4의 배수를 기본 단위로 쓴다.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** 접근성 최소 터치 영역 (48dp) — 버튼 높이는 이 값 미만으로 두지 않는다 */
export const MIN_TOUCH_SIZE = 48;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;
