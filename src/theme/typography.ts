/**
 * 타이포 토큰
 * - 본문 16 이상. 운동 실행 화면 동작명은 24 이상 (팔 뻗은 거리에서 읽혀야 함)
 */
export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  bodyLarge: 18,
  title: 20,
  heading: 24,
  display: 30,
  exercise: 28,
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: '700' as const, lineHeight: 38 },
  heading: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  title: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  small: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  smallStrong: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  exerciseName: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
} as const;
