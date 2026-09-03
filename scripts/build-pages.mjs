/**
 * GitHub Pages 용 웹 빌드.
 *
 * Pages 주소는 https://<계정>.github.io/recovery-coach/ 처럼 저장소 이름이
 * 하위 경로로 붙습니다. 그대로 빌드하면 파일 주소가 '/_expo/...' 를 가리켜
 * 화면이 하얗게 뜹니다. 그래서 앞에 붙일 경로를 알려 주고 빌드합니다.
 *
 * 윈도우에서도 그대로 동작하게 하려고 셸이 아니라 이 파일에서 환경변수를 넣습니다.
 * (윈도우 명령 프롬프트는 'EXPO_BASE_URL=... 명령' 형태를 알아듣지 못합니다)
 *
 * 경로를 바꾸려면 BASE_PATH 환경변수를 넣으세요.
 *   BASE_PATH=/다른이름 node scripts/build-pages.mjs
 */
import { spawnSync } from 'node:child_process';

const basePath = process.env.BASE_PATH ?? '/recovery-coach';
const env = { ...process.env, EXPO_BASE_URL: basePath };

console.log(`[build-pages] 하위 경로 '${basePath}' 로 빌드합니다.`);

const steps = [
  ['npx', ['expo', 'export', '--platform', 'web', '--output-dir', 'dist']],
  ['node', ['scripts/postbuild-web.mjs', 'dist']],
];

for (const [command, args] of steps) {
  const result = spawnSync(command, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`[build-pages] 실패: ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`[build-pages] 완료. dist/ 를 그대로 올리면 '${basePath}' 아래에서 열립니다.`);
