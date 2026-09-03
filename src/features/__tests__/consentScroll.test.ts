import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { hasReachedEnd, READ_END_SLACK } from '@/utils/useReadToEnd';

const ROOT = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

/**
 * 동의 화면의 '끝까지 읽음' 판정.
 *
 * 2026-09-03 웹에서 화면이 커서 스크롤이 필요 없는 경우
 * 동의 버튼이 영영 잠기는 문제가 있었다. 다시 생기지 않게 고정한다.
 */

describe('끝까지 읽음 판정', () => {
  it('화면이 커서 내용이 한눈에 다 들어오면 스크롤 없이도 통과한다', () => {
    // 데스크톱 브라우저: 안내문 900px, 보이는 영역 1200px → 스크롤 자체가 없다
    expect(
      hasReachedEnd({ viewportHeight: 1200, contentHeight: 900, scrollOffset: 0 }),
    ).toBe(true);
  });

  it('내용이 화면보다 길면 아직 통과하지 않는다', () => {
    expect(
      hasReachedEnd({ viewportHeight: 600, contentHeight: 2000, scrollOffset: 0 }),
    ).toBe(false);
  });

  it('중간까지만 내렸으면 통과하지 않는다', () => {
    expect(
      hasReachedEnd({ viewportHeight: 600, contentHeight: 2000, scrollOffset: 700 }),
    ).toBe(false);
  });

  it('바닥까지 내리면 통과한다', () => {
    expect(
      hasReachedEnd({ viewportHeight: 600, contentHeight: 2000, scrollOffset: 1400 }),
    ).toBe(true);
  });

  it('바닥 직전 몇 px 은 여유로 인정한다', () => {
    const offset = 2000 - 600 - (READ_END_SLACK - 1);
    expect(hasReachedEnd({ viewportHeight: 600, contentHeight: 2000, scrollOffset: offset })).toBe(
      true,
    );
  });

  it('높이를 아직 재지 못했으면 섣불리 열어 주지 않는다', () => {
    expect(hasReachedEnd({ viewportHeight: 0, contentHeight: 0, scrollOffset: 0 })).toBe(false);
    expect(hasReachedEnd({ viewportHeight: 800, contentHeight: 0, scrollOffset: 0 })).toBe(false);
    expect(hasReachedEnd({ viewportHeight: 0, contentHeight: 800, scrollOffset: 0 })).toBe(false);
  });
});

describe('두 동의 화면이 같은 판정을 쓴다', () => {
  const screens = ['app/onboarding/safety.tsx', 'app/onboarding/privacy.tsx'];

  it.each(screens)('%s 가 useReadToEnd 를 쓴다', (file) => {
    const source = read(file);
    expect(source).toContain('useReadToEnd');
    expect(source).toContain('{...scrollProps}');
  });

  it.each(screens)('%s 에 스크롤만 보는 옛 판정이 남아 있지 않다', (file) => {
    // onScroll 만으로 판정하면 스크롤이 없는 화면에서 버튼이 잠긴다
    expect(read(file)).not.toContain('isAtBottom');
  });

  it.each(screens)('%s 는 끝까지 읽기 전에는 동의 버튼을 잠근다', (file) => {
    const source = read(file);
    expect(source).toContain('disabled={!readToEnd || !checked}');
    expect(source).toContain('if (readToEnd) setChecked');
  });

  it.each(screens)('%s 에 건너뛰기 버튼이 없다', (file) => {
    // 주석에 '건너뛰기 버튼을 두지 않는다' 라고 적혀 있으므로
    // 파일 전체가 아니라 실제 버튼 라벨만 본다
    const labels = [...read(file).matchAll(/label="([^"]+)"/g)].map((m) => m[1] ?? '');
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label).not.toMatch(/건너뛰|나중에|생략|넘어가기/);
    }
  });
});
