/**
 * 운동 데이터에서 '동작 이미지 제작 목록'을 뽑아 docs/IMAGE_LIST.md 로 저장한다.
 *
 * 운동을 추가하거나 이름을 바꾸면 다시 실행해서 목록을 맞춰 준다.
 *   npm run images:list
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXERCISE_DIR = join(process.cwd(), 'src', 'data', 'exercises');
const OUTPUT = join(process.cwd(), 'docs', 'IMAGE_LIST.md');

const CATEGORY_LABEL = {
  posture: '체형교정',
  dynamicWarmup: '동적웜업',
  functional: '기능성 운동',
  shoulderRecovery: '어깨 회복운동',
  backRecovery: '허리 회복운동',
  kneeRecovery: '무릎 회복운동',
  ankleRecovery: '발목 회복운동',
  neckUpperBackRecovery: '목·등 상부 회복운동',
};

/** 한 줄짜리 문자열 필드를 뽑는다 */
function field(block, name) {
  const match = block.match(new RegExp(`${name}: '([^']*)'`));
  return match?.[1] ?? '';
}

/** description 배열의 첫 항목과 마지막 항목 */
function firstAndLastStep(block) {
  const match = block.match(/description: \[([\s\S]*?)\],/);
  if (!match) return { first: '', last: '' };
  const items = [...match[1].matchAll(/'([^']*)'/g)].map((m) => m[1]);
  return { first: items[0] ?? '', last: items[items.length - 1] ?? '' };
}

const exercises = [];

for (const file of readdirSync(EXERCISE_DIR).sort()) {
  if (!file.endsWith('.ts') || file === 'helpers.ts' || file === 'index.ts') continue;

  const source = readFileSync(join(EXERCISE_DIR, file), 'utf8');
  const blocks = source.split('defineExercise({').slice(1);

  for (const block of blocks) {
    const id = field(block, 'id');
    if (!id) continue;

    const phaseMatch = block.match(/phase: (\d|null)/);
    const { first, last } = firstAndLastStep(block);

    exercises.push({
      id,
      name: field(block, 'name'),
      category: field(block, 'category'),
      phase: phaseMatch?.[1] === 'null' ? null : Number(phaseMatch?.[1]),
      purpose: field(block, 'purpose'),
      first,
      last,
      equipment: (block.match(/equipment: \[([^\]]*)\]/)?.[1] ?? '')
        .split(',')
        .map((s) => s.trim().replace(/'/g, ''))
        .filter(Boolean),
    });
  }
}

const EQUIP_LABEL = {
  bodyweight: '맨몸',
  band: '밴드',
  dumbbell: '덤벨',
  foamRoller: '폼롤러',
  mat: '매트',
};

const lines = [];
lines.push('# 동작 이미지 제작 목록');
lines.push('');
lines.push('> 이 문서는 `npm run images:list` 로 자동 생성됩니다. 직접 고치지 마세요.');
lines.push('> 운동을 추가하거나 이름을 바꾼 뒤 다시 실행하면 목록이 갱신됩니다.');
lines.push('');
lines.push(`총 **${exercises.length}개** 운동의 이미지가 필요합니다.`);
lines.push('');
lines.push('## 공통 규칙');
lines.push('');
lines.push('| 항목 | 값 |');
lines.push('|---|---|');
lines.push('| 파일 위치 | `assets/exercises/` |');
lines.push('| 파일 이름 | 아래 표의 **파일명** 그대로 |');
lines.push('| 비율·크기 | 4:3 가로, 긴 변 1200px 내외, 200KB 이하 |');
lines.push('| 배경 | 단색, 밝은 색 |');
lines.push('| 촬영 각도 | 동작을 가장 잘 알아볼 수 있는 방향 (대부분 옆면) |');
lines.push('');
lines.push('**반드시 지킬 것**');
lines.push('');
lines.push('- 얼굴이 알아볼 수 있게 나온 사진은 쓰지 않습니다 (초상권·개인정보).');
lines.push('- 학생을 모델로 쓰지 않습니다. 꼭 필요하면 본인과 보호자 동의를 먼저 받으세요.');
lines.push('- 직접 제작했거나 상업적 이용이 가능한 이미지만 씁니다.');
lines.push('- 자세가 틀린 이미지는 글 설명보다 위험합니다. **확신이 없으면 넣지 마세요.**');
lines.push('');
lines.push('**한 동작에 두 장을 권합니다** — 시작 자세 1장, 동작 끝 자세 1장.');
lines.push('두 장을 쓸 경우 파일명 뒤에 `-1`, `-2` 를 붙입니다. (예: `knee-p1-01-1.png`)');
lines.push('');

const byCategory = new Map();
for (const e of exercises) {
  if (!byCategory.has(e.category)) byCategory.set(e.category, []);
  byCategory.get(e.category).push(e);
}

for (const [category, list] of byCategory) {
  lines.push('---');
  lines.push('');
  lines.push(`## ${CATEGORY_LABEL[category] ?? category} (${list.length}개)`);
  lines.push('');

  let currentPhase = undefined;
  for (const e of list) {
    if (e.phase !== currentPhase) {
      currentPhase = e.phase;
      if (e.phase !== null) {
        lines.push(`### Phase ${e.phase}`);
        lines.push('');
      }
    }

    const equipment = e.equipment.map((k) => EQUIP_LABEL[k] ?? k).join(', ');
    lines.push(`#### ${e.name}`);
    lines.push('');
    lines.push(`- **파일명**: \`${e.id}.png\``);
    lines.push(`- **무엇을 보여 줄 것**: ${e.purpose}`);
    lines.push(`- **시작 자세**: ${e.first}`);
    lines.push(`- **끝 자세**: ${e.last}`);
    lines.push(`- **준비물**: ${equipment || '없음'}`);
    lines.push('- **비고 / 출처**: ');
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push('## 이미지를 넣은 뒤');
lines.push('');
lines.push('1. 파일을 `assets/exercises/` 에 넣습니다.');
lines.push('2. `src/data/exerciseImages.ts` 에 한 줄을 추가합니다.');
lines.push('3. `npm run images:check` 로 몇 개가 등록됐는지 확인합니다.');
lines.push('');

writeFileSync(OUTPUT, lines.join('\n'));
console.log(`[images:list] 운동 ${exercises.length}개 → ${OUTPUT}`);
