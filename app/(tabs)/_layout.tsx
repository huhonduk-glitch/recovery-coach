import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { colors, MIN_TOUCH_SIZE } from '@/theme';

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
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, minHeight: MIN_TOUCH_SIZE },
      }}
    >
      <Tabs.Screen name="home" options={{ title: '홈', tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="routine" options={{ title: '루틴', tabBarIcon: tabIcon('dumbbell') }} />
      <Tabs.Screen name="record" options={{ title: '기록', tabBarIcon: tabIcon('notebook-outline') }} />
      <Tabs.Screen name="settings" options={{ title: '설정', tabBarIcon: tabIcon('cog-outline') }} />
    </Tabs>
  );
}
