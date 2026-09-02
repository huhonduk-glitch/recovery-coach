import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  assessmentStorage,
  consentStorage,
  recommendationStorage,
} from '@/features/assessment/assessmentStorage';
import { isRouteAllowed, resolveGateRoute, type GateState } from '@/features/assessment/routeGuard';
import { colors } from '@/theme';
import { DISCLAIMER_VERSION } from '@/utils/safety';

async function readGateState(): Promise<GateState> {
  const [consentValid, assessment, recommendation] = await Promise.all([
    consentStorage.isValid(DISCLAIMER_VERSION),
    assessmentStorage.get(),
    recommendationStorage.get(),
  ]);

  return {
    consentValid,
    hasAssessment: assessment !== null,
    blocked: recommendation?.riskLevel === 'red',
  };
}

/**
 * 전역 안전 가드.
 *
 * 화면이 바뀔 때마다 저장된 상태를 다시 읽어 접근 가능한 화면인지 확인한다.
 * 저장소 읽기 비용보다 게이트 우회를 막는 것이 중요하다.
 */
export function SafetyGate({ children }: { children: ReactNode }) {
  const segments = useSegments() as unknown as string[];
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const key = segments.join('/');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const state = await readGateState();
      if (cancelled) return;

      if (!isRouteAllowed(state, key.length > 0 ? key.split('/') : [])) {
        router.replace(resolveGateRoute(state));
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [key, router]);

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
