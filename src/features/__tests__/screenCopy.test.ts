import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 화면 문구 스캔.
 *
 * 데이터가 아니라 화면 코드(.tsx)에 직접 적힌 문구를 검사한다.
 * 급하게 문구를 넣다가 금지 표현이 들어가는 일을 막는다.
 * (docs/SAFETY_POLICY.md §1.1, §6.2)
 */

const ROOT = join(__dirname, '..', '..', '..');

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), 'utf8');
}

/** 사용자에게 결과를 보여 주는 화면들 */
const RESULT_SCREENS = [
  'app/assessment/result.tsx',
  'app/nutrition/result.tsx',
  'app/assessment/blocked.tsx',
  'app/(tabs)/index.tsx',
];

describe('[S5] 결과 화면에 체중·감량·칼로리 표현이 없다', () => {
  it.each(RESULT_SCREENS)('%s', (file) => {
    const source = read(file);
    expect(source).not.toContain('칼로리');
    expect(source).not.toContain('감량');
    expect(source).not.toMatch(/kcal/i);
  });
});

describe('[S11] 화면 문구에 금지 표현이 없다', () => {
  const SCREENS = [
    ...RESULT_SCREENS,
    'app/onboarding/index.tsx',
    'app/onboarding/safety.tsx',
    'app/assessment/index.tsx',
    'app/workout/player.tsx',
    'app/workout/[programId].tsx',
    'app/workout/exercise/[exerciseId].tsx',
    'app/(tabs)/workout.tsx',
    'app/(tabs)/nutrition.tsx',
    'app/(tabs)/logs.tsx',
    'app/(tabs)/settings.tsx',
  ];

  /** 부정문(~하지 않습니다)과 직업명은 허용한다 */
  const ALLOWED = [
    '진단이나 치료를 하지 않습니다',
    '의료 처방을 제공하지 않습니다',
    '진단이나 치료를 제공하지 않습니다',
    '진단이나 치료를 대신하지',
    '물리치료사',
    '재활의학과',
    '병원 진단',
  ];

  it.each(SCREENS)('%s 에 단정적인 처방·치료·완치 표현이 없다', (file) => {
    let source = read(file);
    for (const phrase of ALLOWED) source = source.split(phrase).join('');

    expect(source).not.toContain('완치');
    expect(source).not.toContain('처방해');
    expect(source).not.toContain('치료해');
    expect(source).not.toContain('진단해');
  });

  it.each(SCREENS)('%s 에 통증을 참으라는 표현이 없다', (file) => {
    const source = read(file);
    expect(source).not.toContain('참고 하세요');
    expect(source).not.toContain('버티세요');
    expect(source).not.toContain('한계까지');
  });
});

describe('안전 장치가 화면에서 빠지지 않았는지', () => {
  it('상담 안내 화면은 뒤로가기를 막는다', () => {
    const source = read('app/assessment/blocked.tsx');
    expect(source).toContain('usePreventBack()');
  });

  it('뒤로가기 차단은 앱과 웹 양쪽을 처리한다', () => {
    const hook = read('src/utils/usePreventBack.ts');
    // 앱: 하드웨어 뒤로가기
    expect(hook).toContain('hardwareBackPress');
    // 웹: BackHandler 가 동작하지 않으므로 히스토리를 다시 밀어 넣는다
    expect(hook).toContain("Platform.OS === 'web'");
    expect(hook).toContain('popstate');
  });

  it('상담 안내 화면에서 설문 다시 하기는 저장된 결과를 지운다', () => {
    const source = read('app/assessment/blocked.tsx');
    expect(source).toContain('recommendationStorage.clear');
  });

  it('설문 화면은 위험 신호가 있으면 결과가 아닌 상담 안내로 보낸다', () => {
    const source = read('app/assessment/index.tsx');
    expect(source).toContain("router.replace('/assessment/blocked')");
  });

  it('운동 플레이어에 중단 버튼이 있다', () => {
    const source = read('app/workout/player.tsx');
    expect(source).toContain('운동 중단하기');
    expect(source).toContain('통증 체크');
  });

  it('루트 레이아웃이 SafetyGate 로 감싸져 있다', () => {
    const source = read('app/_layout.tsx');
    expect(source).toContain('<SafetyGate>');
  });

  it('없는 주소는 진입 분기로 돌려보낸다', () => {
    const source = read('app/+not-found.tsx');
    expect(source).toContain('Redirect');
  });
});
