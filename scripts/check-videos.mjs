/**
 * 영상 링크가 몇 개 등록됐는지, 링크 형식이 맞는지 확인한다.
 *   npm run videos:check
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const EXERCISE_DIR = join(process.cwd(), 'src', 'data', 'exercises');
const REGISTRY = join(process.cwd(), 'src', 'data', 'exerciseVideos.ts');

const ids = [];
for (const file of readdirSync(EXERCISE_DIR).sort()) {
  if (!file.endsWith('.ts') || file === 'helpers.ts' || file === 'index.ts') continue;
  const source = readFileSync(join(EXERCISE_DIR, file), 'utf8');
  for (const block of source.split('defineExercise({').slice(1)) {
    const id = block.match(/id: '([^']*)'/)?.[1];
    if (id) ids.push(id);
  }
}

const source = readFileSync(REGISTRY, 'utf8');
const body = source.split('export const EXERCISE_VIDEOS')[1] ?? '';
const entries = [...body.matchAll(/'([\w-]+)':\s*\{[\s\S]*?url:\s*'([^']+)'/g)].map((m) => ({
  id: m[1],
  url: m[2],
}));

const validIds = new Set(ids);
const unknown = entries.filter((e) => !validIds.has(e.id));
const badUrl = entries.filter((e) => !/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(e.url));

console.log(`\n운동 ${ids.length}개`);
console.log(`  영상 등록됨  ${entries.length}개`);
console.log(`  아직 없음    ${ids.length - entries.length}개\n`);

let failed = false;

if (unknown.length > 0) {
  failed = true;
  console.log('실제로 없는 운동 id 입니다:');
  for (const e of unknown) console.log(`    ${e.id}`);
  console.log('');
}

if (badUrl.length > 0) {
  failed = true;
  console.log('유튜브 링크 형식이 아닙니다:');
  for (const e of badUrl) console.log(`    ${e.id} → ${e.url}`);
  console.log('  https://www.youtube.com/... 또는 https://youtu.be/... 형태여야 합니다.\n');
}

if (entries.length === 0) {
  console.log('아직 연결된 영상이 없습니다.');
  console.log('  후보 목록: docs/VIDEO_CANDIDATES.md');
  console.log('  선정 기준: docs/VIDEO_GUIDE.md');
  console.log('  영상이 없어도 앱은 "유튜브에서 찾아보기" 버튼으로 정상 동작합니다.\n');
}

if (failed) process.exit(1);
