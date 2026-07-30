import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTractionTheme } from '@/theme';
import { TodayIcon, GoalsIcon, InsightsIcon, ProfileIcon } from '@/components/icons';
import { FeedbackWidget } from '@/components/FeedbackWidget';

export default function AppLayout() {
  const theme = useTractionTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.accent as string,
          tabBarInactiveTintColor: theme.colors.textSubtle as string,
          tabBarStyle: {
            backgroundColor: theme.colors.surfaceOverlay,
            borderTopColor: theme.colors.borderMuted,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="today"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => <TodayIcon color={color as string} size={size} />,
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'Goals',
            tabBarIcon: ({ color, size }) => <GoalsIcon color={color as string} size={size} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size }) => <InsightsIcon color={color as string} size={size} />,
          }}
        />
        <Tabs.Screen
          name="behavior"
          options={{
            title: 'Behavior',
            tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🧠</Text>,
          }}
        />
        <Tabs.Screen
          name="execution"
          options={{
            title: 'Execution',
            tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>⚡</Text>,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <ProfileIcon color={color as string} size={size} />,
          }}
        />
      </Tabs>
      <FeedbackWidget />
    </View>
  );
}
