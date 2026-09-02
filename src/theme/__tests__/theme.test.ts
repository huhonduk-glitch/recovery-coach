import { colors, MIN_TOUCH_SIZE, paperTheme, typography } from '@/theme';

describe('테마 토큰', () => {
  it('Paper 테마에 브랜드 컬러가 주입된다', () => {
    expect(paperTheme.colors.primary).toBe(colors.primary);
    expect(paperTheme.colors.error).toBe(colors.danger);
  });

  it('본문 글자 크기는 16 이상이다 (가독성 기준)', () => {
    expect(typography.body.fontSize).toBeGreaterThanOrEqual(16);
  });

  it('운동 실행 화면 동작명은 24 이상이다', () => {
    expect(typography.exerciseName.fontSize).toBeGreaterThanOrEqual(24);
  });

  it('최소 터치 영역은 48dp 이상이다 (접근성 기준)', () => {
    expect(MIN_TOUCH_SIZE).toBeGreaterThanOrEqual(48);
  });
});
