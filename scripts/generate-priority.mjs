/**
 * 동작 이미지·영상 제작 우선순위를 계산해 docs/MEDIA_PRIORITY.md 로 저장한다.
 *   npm run media:priority
 *
 * 순위는 '앱에서 얼마나 먼저, 자주 만나게 되는가' 로 정한다.
 * 추측이 아니라 추천 엔진의 실제 동작에서 나온다.
 *
 *   - 통증 4~6점 사용자 → 해당 부위 Phase 1        (가장 먼저 만나는 화면)
 *   - 통증 1~3점 사용자 → 해당 부위 Phase 2
 *   - 통증 없음 + 목표 미선택/체형교정 → 체형교정 (빠른 시작의 기본 경로)
 *   - 통증 없음 + 유연성 → 동적웜업
 *   - Phase 3·4 와 기능성 운동은 한참 뒤에 만난다
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXERCISE_DIR = join(process.cwd(), 'src', 'data', 'exercises');
const PROGRAMS_FILE = join(process.cwd(), 'src', 'data', 'programs.ts');
const OUTPUT = join(process.cwd(), 'docs', 'MEDIA_PRIORITY.md');

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

/**
 * 부위 순서.
 * 학교 현장에서 자주 보이는 순으로 잡은 값이며, 필요하면 여기만 바꾸면 된다.
 * (임상 통계가 아니라 운영상의 우선순위다)
 */
const REGION_ORDER = ['knee', 'lowBack', 'ankle', 'shoulder', 'neckUpperBack'];

/** 화면에서 만나는 순서 = 제작 순서 */
const STAGE_RANK = [
  { key: 'recovery-p1', label: '부위별 Phase 1', why: '통증 4~6점 사용자가 처음 만나는 루틴' },
  { key: 'posture', label: '체형교정', why: '통증 없는 사용자의 기본 루틴 (빠른 시작 기본값)' },
  { key: 'recovery-p2', label: '부위별 Phase 2', why: '통증 1~3점 사용자의 루틴' },
  { key: 'warmup', label: '동적웜업', why: '유연성 목표 또는 수업 전 준비운동' },
  { key: 'recovery-p3', label: '부위별 Phase 3', why: '회복이 진행된 뒤' },
  { key: 'functional', label: '기능성 운동', why: '통증 없이 수행능력을 올리려는 사용자' },
  { key: 'recovery-p4', label: '부위별 Phase 4', why: '복귀 단계. 가장 나중' },
];

function stageOf(e) {
  if (e.category === 'posture') return 'posture';
  if (e.category === 'dynamicWarmup') return 'warmup';
  if (e.category === 'functional') return 'functional';
  return `recovery-p${e.phase}`;
}

function field(block, name) {
  return block.match(new RegExp(`${name}: '([^']*)'`))?.[1] ?? '';
}

// ---------- 운동 읽기 ----------
const exercises = [];
for (const file of readdirSync(EXERCISE_DIR).sort()) {
  if (!file.endsWith('.ts') || file === 'helpers.ts' || file === 'index.ts') continue;
  const source = readFileSync(join(EXERCISE_DIR, file), 'utf8');
  for (const block of source.split('defineExercise({').slice(1)) {
    const id = field(block, 'id');
    if (!id) continue;
    const phaseMatch = block.match(/phase: (\d|null)/);
    exercises.push({
      id,
      name: field(block, 'name'),
      category: field(block, 'category'),
      bodyRegion: field(block, 'bodyRegion') || null,
      phase: phaseMatch?.[1] === 'null' ? null : Number(phaseMatch?.[1]),
      purpose: field(block, 'purpose'),
    });
  }
}

// ---------- 프로그램에 실제로 담기는 운동만 우선 ----------
const programSource = readFileSync(PROGRAMS_FILE, 'utf8');
const usedIds = new Set([...programSource.matchAll(/'([\w-]+-p\d-\d+|posture-\d+|warmup-\d+|func-\d+)'/g)].map((m) => m[1]));

// ---------- 정렬 ----------
function score(e) {
  const stageIndex = STAGE_RANK.findIndex((s) => s.key === stageOf(e));
  const regionIndex = e.bodyRegion ? REGION_ORDER.indexOf(e.bodyRegion) : 0;
  const used = usedIds.has(e.id) ? 0 : 1; // 프로그램에 안 담기면 뒤로
  return used * 1000 + stageIndex * 100 + regionIndex * 10;
}

exercises.sort((a, b) => score(a) - score(b) || a.id.localeCompare(b.id));

// ---------- 문서 ----------
const lines = [];
lines.push('# 동작 이미지·영상 제작 우선순위');
lines.push('');
lines.push('> `npm run media:priority` 로 자동 생성됩니다. 직접 고치지 마세요.');
lines.push('');
lines.push('86개를 한 번에 준비할 필요는 없습니다. **위에서부터** 채우면 됩니다.');
lines.push('하나만 넣어도 그 운동만 영상·사진으로 바뀌고, 나머지는 글 설명 그대로 동작합니다.');
lines.push('');
lines.push('## 순위를 정한 기준');
lines.push('');
lines.push('추측이 아니라 **추천 엔진이 실제로 어떤 루틴을 먼저 내보내는지**로 정했습니다.');
lines.push('');
lines.push('| 순서 | 묶음 | 왜 먼저인가 |');
lines.push('|---|---|---|');
for (const [i, s] of STAGE_RANK.entries()) {
  lines.push(`| ${i + 1} | ${s.label} | ${s.why} |`);
}
lines.push('');
lines.push('부위 순서는 `무릎 → 허리 → 발목 → 어깨 → 목·등 상부` 로 두었습니다.');
lines.push('학교 현장 기준의 운영상 판단이며, 임상 통계가 아닙니다.');
lines.push('바꾸시려면 `scripts/generate-priority.mjs` 의 `REGION_ORDER` 만 고치면 됩니다.');
lines.push('');

const tiers = [
  { name: '1순위 — 여기까지만 해도 앱이 크게 좋아집니다', stages: ['recovery-p1', 'posture'] },
  { name: '2순위', stages: ['recovery-p2', 'warmup'] },
  { name: '3순위', stages: ['recovery-p3', 'functional'] },
  { name: '4순위 — 가장 나중', stages: ['recovery-p4'] },
];

let order = 1;
for (const tier of tiers) {
  const list = exercises.filter((e) => tier.stages.includes(stageOf(e)));
  lines.push('---');
  lines.push('');
  lines.push(`## ${tier.name} (${list.length}개)`);
  lines.push('');
  lines.push('| # | 운동 | 묶음 | 파일명 / 영상 등록 id | 무엇을 보여 줄 것 |');
  lines.push('|---|---|---|---|---|');
  for (const e of list) {
    const region = CATEGORY_LABEL[e.category] ?? e.category;
    lines.push(
      `| ${order} | ${e.name} | ${region}${e.phase ? ` P${e.phase}` : ''} | \`${e.id}\` | ${e.purpose} |`,
    );
    order += 1;
  }
  lines.push('');
  lines.push(`> ${tier.stages.map((k) => STAGE_RANK.find((s) => s.key === k)?.why).join(' / ')}`);
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('## 진행 상황 확인');
lines.push('');
lines.push('```bash');
lines.push('npm run images:check   # 사진이 몇 개 준비됐는지');
lines.push('npm run videos:check   # 영상 링크가 몇 개 등록됐는지');
lines.push('```');
lines.push('');

writeFileSync(OUTPUT, lines.join('\n'));
console.log(`[media:priority] 운동 ${exercises.length}개 정렬 → ${OUTPUT}`);
