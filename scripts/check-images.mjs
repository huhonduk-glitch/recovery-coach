/**
 * 어떤 운동에 이미지가 준비됐고 어떤 게 비었는지 알려 준다.
 *   npm run images:check
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const EXERCISE_DIR = join(process.cwd(), 'src', 'data', 'exercises');
const ASSET_DIR = join(process.cwd(), 'assets', 'exercises');
const REGISTRY = join(process.cwd(), 'src', 'data', 'exerciseImages.ts');

const ids = [];
for (const file of readdirSync(EXERCISE_DIR).sort()) {
  if (!file.endsWith('.ts') || file === 'helpers.ts' || file === 'index.ts') continue;
  const source = readFileSync(join(EXERCISE_DIR, file), 'utf8');
  for (const block of source.split('defineExercise({').slice(1)) {
    const id = block.match(/id: '([^']*)'/)?.[1];
    if (id) ids.push(id);
  }
}

const registrySource = readFileSync(REGISTRY, 'utf8');
// 주석 줄은 빼고 실제 등록된 것만 센다
const registered = new Set(
  registrySource
    .split('\n')
    // 주석(// 또는 JSDoc *)에 적힌 예시는 세지 않는다
    .filter((line) => {
      const t = line.trim();
      return !t.startsWith('//') && !t.startsWith('*');
    })
    .flatMap((line) => [...line.matchAll(/'([\w-]+)':\s*require\(/g)].map((m) => m[1])),
);

const files = existsSync(ASSET_DIR)
  ? readdirSync(ASSET_DIR).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
  : [];

const withFile = ids.filter((id) => files.some((f) => f.startsWith(id)));
const missingRegistration = withFile.filter((id) => !registered.has(id));
const missingFile = [...registered].filter((id) => !files.some((f) => f.startsWith(id)));

console.log(`\n운동 ${ids.length}개`);
console.log(`  파일 있음      ${withFile.length}개`);
console.log(`  앱에 등록됨    ${registered.size}개`);
console.log(`  아직 없음      ${ids.length - withFile.length}개\n`);

if (missingRegistration.length > 0) {
  console.log('파일은 있는데 아직 등록하지 않은 운동:');
  console.log('  src/data/exerciseImages.ts 에 아래 줄을 추가하세요.\n');
  for (const id of missingRegistration) {
    console.log(`    '${id}': require('../../assets/exercises/${id}.png'),`);
  }
  console.log('');
}

if (missingFile.length > 0) {
  console.log('등록은 했는데 파일이 없는 운동 (앱이 깨질 수 있습니다):');
  for (const id of missingFile) console.log(`    ${id}`);
  console.log('');
  process.exit(1);
}

if (withFile.length === 0) {
  console.log('아직 이미지가 없습니다. docs/IMAGE_LIST.md 에 필요한 목록이 정리되어 있어요.');
  console.log('이미지가 없어도 앱은 부위 표시 그림으로 정상 동작합니다.\n');
}
