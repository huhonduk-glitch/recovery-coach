import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DISCLAIMER_VERSION } from '@/content/copy/disclaimer';
import { consentRepository } from '@/storage';
import { colors } from '@/theme';

type Target = '/(onboarding)/intro' | '/(tabs)/home';

/**
 * 앱 진입 분기.
 *
 * 동의가 없거나 면책 문구 버전이 올라갔으면 온보딩으로 되돌린다.
 * 동의 없이 결과·루틴 화면으로 들어가는 경로를 만들지 않는다.
 * (docs/SAFETY_POLICY.md §8.1)
 */
export default function EntryScreen() {
  const [target, setTarget] = useState<Target | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const valid = await consentRepository.isValid(DISCLAIMER_VERSION);
      if (!cancelled) {
        setTarget(valid ? '/(tabs)/home' : '/(onboarding)/intro');
      }
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
