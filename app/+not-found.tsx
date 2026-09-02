import { Redirect } from 'expo-router';

/**
 * 존재하지 않는 주소로 들어온 경우.
 *
 * Expo 기본 404 화면은 안전 가드 밖에서 표시되고 sitemap 링크를 노출한다.
 * 진입 분기로 되돌려, 지금 상태에 맞는 화면으로만 가게 한다.
 */
export default function NotFoundScreen() {
  return <Redirect href="/" />;
}
