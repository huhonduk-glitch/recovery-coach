import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

/**
 * 웹 전용 안내.
 * 공용 PC 에서 앞사람 기록이 남는 상황을 사용자에게 알려야 한다.
 * (docs/SAFETY_POLICY.md §16)
 */

describe('공용 PC 안내', () => {
  const source = read('src/components/WebStorageNotice.tsx');

  it('웹에서만 보인다', () => {
    expect(source).toContain("Platform.OS !== 'web'");
    expect(source).toContain('return null');
  });

  it('공용 기기와 삭제 안내를 담고 있다', () => {
    expect(source).toContain('여러 사람이 쓰는 기기');
    expect(source).toContain('데이터를 지워 주세요');
  });

  it('저장소를 못 읽어도 안내는 보여 준다', () => {
    // localStorage 접근이 막힌 브라우저에서도 안내가 사라지면 안 된다
    expect(source).toContain('저장소를 못 읽어도 안내는 보여 준다');
    expect(source).toMatch(/catch\s*\{[\s\S]*?return true;/);
  });

  it.each([
    ['app/onboarding/safety.tsx', '동의 화면'],
    ['app/(tabs)/index.tsx', '홈'],
    ['app/(tabs)/settings.tsx', '내정보'],
  ])('%s (%s) 에 안내가 들어가 있다', (file) => {
    expect(read(file)).toContain('WebStorageNotice');
  });

  it('내정보의 안내는 닫을 수 없다 (항상 보인다)', () => {
    const settings = read('app/(tabs)/settings.tsx');
    expect(settings).toContain('<WebStorageNotice />');
  });
});
