/**
 * Expo 설정 (app.json 을 감싸는 파일).
 *
 * 왜 필요한가
 *   GitHub Pages 는 주소가 https://<계정>.github.io/recovery-coach/ 처럼
 *   저장소 이름이 붙은 하위 경로가 됩니다. 그런데 웹 빌드 결과물은 기본적으로
 *   '/_expo/...' 처럼 최상위 경로를 가리켜서, 그대로 올리면 화면이 하얗게 뜹니다.
 *
 *   그래서 배포할 때만 EXPO_BASE_URL 로 앞에 붙일 경로를 알려 줍니다.
 *   (.github/workflows/deploy.yml 에서 넣어 줍니다)
 *
 * 로컬에서는 EXPO_BASE_URL 을 넣지 않으므로 예전처럼 최상위 경로로 빌드됩니다.
 *   npm run build:web        → 최상위 (npm run serve:web 으로 확인)
 *   npm run build:web:pages  → /recovery-coach 하위 (GitHub Pages 용)
 */
const baseUrl = process.env.EXPO_BASE_URL ?? '';

module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(baseUrl ? { baseUrl } : {}),
  },
});
