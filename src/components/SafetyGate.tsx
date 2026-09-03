import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';

import {
  assessmentStorage,
  consentStorage,
  privacyStorage,
} from '@/features/assessment/assessmentStorage';
import { loadRecommendation } from '@/features/assessment/recommendationService';
import { ensureLibraryLoaded } from '@/features/library/useLibrary';

import { LoadingScreen } from './LoadingScreen';
import { isRouteAllowed, resolveGateRoute, type GateState } from '@/features/assessment/routeGuard';
import { DISCLAIMER_VERSION } from '@/utils/safety';
import { PRIVACY_VERSION } from '@/utils/privacy';

async function readGateState(): Promise<GateState> {
  const [consentValid, privacyValid, assessment, recommendation] = await Promise.all([
    consentStorage.isValid(DISCLAIMER_VERSION),
    privacyStorage.isValid(PRIVACY_VERSION),
    assessmentStorage.get(),
    loadRecommendation(),
  ]);

  return {
    consentValid,
    privacyValid,
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
      // 앱에서 고친 운동·프로그램을 조회 함수에 미리 얹어 둔다.
      // 이걸 하지 않으면 새로고침 직후 화면마다 원래 내용이 나온다.
      await ensureLibraryLoaded();
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
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
