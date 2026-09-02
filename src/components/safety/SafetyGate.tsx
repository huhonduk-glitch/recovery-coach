import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DISCLAIMER_VERSION } from '@/content/copy/disclaimer';
import { isRouteAllowed, resolveGateRoute, type GateState } from '@/engine/safety';
import { consentRepository, profileRepository, screeningRepository } from '@/storage';
import { colors } from '@/theme';

async function readGateState(): Promise<GateState> {
  const [consentValid, profile, screening] = await Promise.all([
    consentRepository.isValid(DISCLAIMER_VERSION),
    profileRepository.get(),
    screeningRepository.get(),
  ]);

  return {
    consentValid,
    hasProfile: profile !== null,
    screeningBlocked: screening === null ? null : screening.blocked,
  };
}

/**
 * 전역 안전 가드.
 *
 * 화면이 바뀔 때마다 저장된 상태를 다시 읽어 접근 가능한 화면인지 확인한다.
 * 저장소 읽기 비용보다 게이트 우회를 막는 것이 중요하다.
 * (docs/SAFETY_POLICY.md §2)
 */
export function SafetyGate({ children }: { children: ReactNode }) {
  // useSegments() 의 타입은 라우트 목록에 맞춰 좁혀지므로, 여기서는 문자열로 다룬다
  const segments = useSegments() as unknown as string[];
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const group = segments[0];
  const screen = segments[1];

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const state = await readGateState();
      if (cancelled) return;

      if (!isRouteAllowed(state, group, screen)) {
        router.replace(resolveGateRoute(state));
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [group, screen, router]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
