import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { LoadingScreen } from '@/components/LoadingScreen';
import {
  assessmentStorage,
  consentStorage,
  privacyStorage,
} from '@/features/assessment/assessmentStorage';
import { loadRecommendation } from '@/features/assessment/recommendationService';
import { resolveGateRoute, type GateRoute } from '@/features/assessment/routeGuard';
import { DISCLAIMER_VERSION } from '@/utils/safety';
import { PRIVACY_VERSION } from '@/utils/privacy';

/**
 * 앱 진입 분기.
 *
 * 순서가 곧 안전 게이트다.
 *   1) 안전 안내 동의  2) 설문  3) 위험 신호 확인  4) 홈
 */
export default function EntryScreen() {
  const [target, setTarget] = useState<GateRoute | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [consentValid, privacyValid, assessment, recommendation] = await Promise.all([
        consentStorage.isValid(DISCLAIMER_VERSION),
        privacyStorage.isValid(PRIVACY_VERSION),
        assessmentStorage.get(),
        loadRecommendation(),
      ]);

      if (cancelled) return;

      setTarget(
        resolveGateRoute({
          consentValid,
          privacyValid,
          hasAssessment: assessment !== null,
          blocked: recommendation?.riskLevel === 'red',
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (target === null) {
    return <LoadingScreen />;
  }

  return <Redirect href={target} />;
}
