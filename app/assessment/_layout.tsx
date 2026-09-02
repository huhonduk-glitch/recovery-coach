import { Stack } from 'expo-router';

export default function AssessmentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 상담 안내 화면은 스와이프로 빠져나갈 수 없다 (docs/SAFETY_POLICY.md §7) */}
      <Stack.Screen name="blocked" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
