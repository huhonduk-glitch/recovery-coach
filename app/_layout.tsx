import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SafetyGate } from '@/components/SafetyGate';
import { colors, paperTheme } from '@/theme';

/**
 * 앱 루트 레이아웃.
 * 전역 Provider 는 여기에만 둔다. SafetyGate 가 모든 화면 이동을 검사한다.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="dark" />
        <ErrorBoundary>
          <SafetyGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </SafetyGate>
        </ErrorBoundary>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
