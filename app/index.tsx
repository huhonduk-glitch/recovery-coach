import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DISCLAIMER_VERSION } from '@/content/copy/disclaimer';
import { consentRepository, profileRepository, screeningRepository } from '@/storage';
import { colors } from '@/theme';

type Target =
  | '/(onboarding)/intro'
  | '/(onboarding)/profile'
  | '/(survey)/screening'
  | '/(result)/blocked?reason=redFlag'
  | '/(tabs)/home';

/**
 * 앱 진입 분기.
 *
 * 순서가 곧 안전 게이트다. 앞 단계를 통과하지 못하면 뒤 화면에 닿을 수 없다.
 *   1) 동의  2) 기본 정보  3) 안전 스크리닝  4) 홈
 *
 * 차단 상태는 기기에 저장되므로 앱을 껐다 켜도 우회되지 않는다.
 * (docs/SAFETY_POLICY.md §2, §8.1)
 */
async function resolveTarget(): Promise<Target> {
  const consentValid = await consentRepository.isValid(DISCLAIMER_VERSION);
  if (!consentValid) return '/(onboarding)/intro';

  const profile = await profileRepository.get();
  if (profile === null) return '/(onboarding)/profile';

  const screening = await screeningRepository.get();
  if (screening === null) return '/(survey)/screening';
  if (screening.blocked) return '/(result)/blocked?reason=redFlag';

  return '/(tabs)/home';
}

export default function EntryScreen() {
  const [target, setTarget] = useState<Target | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const next = await resolveTarget();
      if (!cancelled) setTarget(next);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (target === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={target} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
