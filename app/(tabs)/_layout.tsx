import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, type ColorValue } from 'react-native';

import { WEB_MAX_WIDTH } from '@/components/Screen';
import { colors } from '@/theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function tabIcon(name: IconName) {
  const TabBarIcon = ({ color, size }: { color: ColorValue; size: number }) => (
    <MaterialCommunityIcons name={name} color={color} size={size} />
  );
  TabBarIcon.displayName = `TabBarIcon(${name})`;
  return TabBarIcon;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          // 웹에서 탭 바가 화면 끝까지 늘어나지 않도록 본문과 같은 폭으로 맞춘다
          ...Platform.select({
            web: { maxWidth: WEB_MAX_WIDTH, width: '100%', alignSelf: 'center' },
            default: {},
          }),
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="workout" options={{ title: '운동', tabBarIcon: tabIcon('dumbbell') }} />
      <Tabs.Screen
        name="nutrition"
        options={{ title: '영양', tabBarIcon: tabIcon('food-apple-outline') }}
      />
      <Tabs.Screen name="logs" options={{ title: '기록', tabBarIcon: tabIcon('chart-line') }} />
      <Tabs.Screen
        name="settings"
        options={{ title: '내정보', tabBarIcon: tabIcon('account-outline') }}
      />
    </Tabs>
  );
}
