import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { FocusIcon, GoalsIcon, ProfileIcon, ProgressIcon, TodayIcon } from '@/components/icons';
import { useTractionTheme } from '@/theme';

export default function AppLayout() {
  const theme = useTractionTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSubtle,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          sceneStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Tabs.Screen
          name="today"
          options={{ title: 'Today', tabBarIcon: (props) => <TodayIcon {...props} /> }}
        />
        <Tabs.Screen
          name="goals"
          options={{ title: 'Goals', tabBarIcon: (props) => <GoalsIcon {...props} /> }}
        />
        <Tabs.Screen
          name="focus-start"
          options={{ title: 'Focus', tabBarIcon: (props) => <FocusIcon {...props} /> }}
        />
        <Tabs.Screen
          name="progress"
          options={{ title: 'Progress', tabBarIcon: (props) => <ProgressIcon {...props} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'You', tabBarIcon: (props) => <ProfileIcon {...props} /> }}
        />
      </Tabs>
    </View>
  );
}
