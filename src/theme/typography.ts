/**
 * 타이포 토큰
 *
 * 규칙
 * - 본문은 16 이상. 운동 실행 화면의 동작명은 24 이상.
 *   (팔 뻗은 거리에서 읽혀야 한다)
 * - 사용자가 시스템 글꼴 크기를 키워도 깨지지 않도록,
 *   컨테이너에 고정 높이를 주지 않는다.
 */
export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  bodyLarge: 18,
  title: 20,
  heading: 24,
  display: 30,
  exercise: 28, // 운동 실행 화면 동작명 전용
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export const typography = {
  display: { fontSize: fontSize.display, fontWeight: fontWeight.bold, lineHeight: 38 },
  heading: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, lineHeight: 32 },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.semibold, lineHeight: 28 },
  body: { fontSize: fontSize.body, fontWeight: fontWeight.regular, lineHeight: 24 },
  bodyStrong: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, lineHeight: 24 },
  small: { fontSize: fontSize.small, fontWeight: fontWeight.regular, lineHeight: 20 },
  caption: { fontSize: fontSize.caption, fontWeight: fontWeight.regular, lineHeight: 16 },
  exerciseName: { fontSize: fontSize.exercise, fontWeight: fontWeight.bold, lineHeight: 36 },
} as const;
