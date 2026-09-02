import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * 뒤로가기를 막는다.
 *
 * 상담 안내 화면처럼 사용자가 되돌아가면 안 되는 곳에서 쓴다.
 * (docs/SAFETY_POLICY.md §7 — 차단 화면 우회 금지)
 *
 * - 안드로이드/iOS: 하드웨어·제스처 뒤로가기를 잡는다
 * - 웹: BackHandler 가 동작하지 않으므로 브라우저 히스토리를 다시 밀어 넣는다
 *   (여기서 놓쳐도 SafetyGate 가 다시 차단 화면으로 돌려보낸다)
 */
export function usePreventBack(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;

      const push = () => window.history.pushState(null, '', window.location.href);
      push();

      const onPopState = () => push();
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [enabled]);
}
