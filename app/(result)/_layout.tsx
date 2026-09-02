import { Stack } from 'expo-router';

export default function ResultLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 차단 화면은 스와이프 뒤로가기로 빠져나갈 수 없다 (SAFETY_POLICY §7) */}
      <Stack.Screen name="blocked" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
