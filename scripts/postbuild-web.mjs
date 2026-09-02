/**
 * 웹 빌드 후처리.
 *
 * 정적 호스팅(GitHub Pages, Netlify 등)에서 새로고침이나 주소 직접 입력 시
 * 404 가 나지 않도록 준비한다.
 *
 *  - 404.html: index.html 복사본 (GitHub Pages 는 없는 주소에 이 파일을 보여 준다)
 *  - .nojekyll: _expo 처럼 밑줄로 시작하는 폴더가 무시되지 않게 한다
 *  - _redirects: Netlify SPA 리라이트 규칙
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const indexHtml = join(dist, 'index.html');

if (!existsSync(indexHtml)) {
  console.error(`[postbuild-web] ${indexHtml} 를 찾을 수 없습니다. 먼저 빌드하세요.`);
  process.exit(1);
}

copyFileSync(indexHtml, join(dist, '404.html'));
writeFileSync(join(dist, '.nojekyll'), '');
writeFileSync(join(dist, '_redirects'), '/*    /index.html   200\n');

console.log('[postbuild-web] 404.html, .nojekyll, _redirects 생성 완료');
