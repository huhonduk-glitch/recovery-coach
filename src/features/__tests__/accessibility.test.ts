import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { MIN_TOUCH_SIZE, colors, typography } from '@/theme';

const ROOT = join(__dirname, '..', '..', '..');

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (name.endsWith('.tsx')) acc.push(full);
  }
  return acc;
}

const SCREEN_AND_COMPONENT_FILES = [
  ...walk(join(ROOT, 'app')),
  ...walk(join(ROOT, 'src', 'components')),
];

/** 파일 경로를 저장소 기준 상대 경로로 */
const rel = (f: string) => f.slice(ROOT.length + 1);

describe('접근성 기준', () => {
  it('최소 터치 영역이 48dp 이상이다', () => {
    expect(MIN_TOUCH_SIZE).toBeGreaterThanOrEqual(48);
  });

  it('본문 글자 크기가 16 이상이다', () => {
    expect(typography.body.fontSize).toBeGreaterThanOrEqual(16);
  });

  it('운동 실행 화면 동작명이 24 이상이다', () => {
    expect(typography.exerciseName.fontSize).toBeGreaterThanOrEqual(24);
  });

  it('누를 수 있는 요소에는 accessibilityRole 을 붙인다', () => {
    const offenders: string[] = [];

    for (const file of SCREEN_AND_COMPONENT_FILES) {
      const source = readFileSync(file, 'utf8');
      const pressableCount = (source.match(/<Pressable/g) ?? []).length;
      if (pressableCount === 0) continue;

      const roleCount = (source.match(/accessibilityRole=/g) ?? []).length;
      if (roleCount < pressableCount) offenders.push(rel(file));
    }

    expect(offenders).toEqual([]);
  });

  it('화면마다 제목이 있다', () => {
    const screens = SCREEN_AND_COMPONENT_FILES.filter(
      (f) => rel(f).startsWith('app/') && !rel(f).includes('_layout') && !rel(f).includes('+not-found'),
    );

    const offenders = screens.filter((file) => {
      const source = readFileSync(file, 'utf8');
      // 진입 분기 화면은 화면을 그리지 않고 이동만 한다
      if (source.includes('<Redirect')) return false;
      return !source.includes('<Text');
    });

    expect(offenders.map(rel)).toEqual([]);
  });
});

describe('색상 대비', () => {
  /** 상대 휘도 (WCAG) */
  function luminance(hex: string): number {
    const value = hex.replace('#', '');
    const rgb = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
    const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
  }

  function contrast(a: string, b: string): number {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  it('본문 텍스트 대비가 4.5:1 이상이다', () => {
    expect(contrast(colors.text, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.text, colors.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('보조 텍스트 대비가 4.5:1 이상이다', () => {
    expect(contrast(colors.textMuted, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.textMuted, colors.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('기본 버튼의 글자 대비가 4.5:1 이상이다', () => {
    expect(contrast(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['위험', colors.dangerText, colors.dangerLight],
    ['경고', colors.warningText, colors.warningLight],
    ['보조', colors.secondaryText, colors.secondaryLight],
    ['안내', colors.primaryText, colors.primaryLight],
  ])('%s 카드의 글자 대비가 4.5:1 이상이다', (_label, text, background) => {
    expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['위험', colors.dangerLight],
    ['경고', colors.warningLight],
    ['보조', colors.secondaryLight],
    ['안내', colors.primaryLight],
  ])('%s 카드의 본문 대비가 4.5:1 이상이다', (_label, background) => {
    expect(contrast(colors.text, background)).toBeGreaterThanOrEqual(4.5);
  });

  it('연한 배경 위에 원래 색을 그대로 쓰지 않는다', () => {
    // 이 조합들은 대비가 3:1 수준이라 글자색으로 쓰면 안 된다
    expect(contrast(colors.danger, colors.dangerLight)).toBeLessThan(4.5);
    expect(contrast(colors.warning, colors.warningLight)).toBeLessThan(4.5);
  });
});

describe('통증 슬라이더는 0~10 을 한 줄에 둔다', () => {
  /**
   * 칸 너비를 고정하면 좁은 화면에서 '10' 만 다음 줄로 밀려나,
   * 눈금이 9에서 끝나는 것처럼 보여 통증이 낮아 보이는 착시가 생긴다.
   * (2026-09-03 실제 제보)
   */
  const source = readFileSync(join(__dirname, '..', '..', 'components', 'PainSlider.tsx'), 'utf8');

  it('줄바꿈을 막는다', () => {
    expect(source).toContain("flexWrap: 'nowrap'");
    expect(source).not.toContain("flexWrap: 'wrap'");
  });

  it('칸이 고정 너비가 아니라 남은 폭을 나눠 갖는다', () => {
    const cell = source.slice(source.indexOf('cell: {'), source.indexOf('cellText:'));
    expect(cell).toContain('flex: 1');
    expect(cell).not.toMatch(/width:\s*\d/);
  });

  it('세로 크기는 손가락으로 누를 수 있는 크기를 지킨다', () => {
    const cell = source.slice(source.indexOf('cell: {'), source.indexOf('cellText:'));
    expect(cell).toContain('height: MIN_TOUCH_SIZE');
  });
});
