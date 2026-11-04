import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

interface IconProps {
  color: ColorValue;
  size: number;
  focused?: boolean;
}

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Apple-style outline icons that fill in when the tab is selected.
function tabIcon(outline: IoniconName, filled: IoniconName) {
  return function TabIcon({ color, size, focused }: IconProps) {
    return <Ionicons name={focused ? filled : outline} color={color as string} size={size} />;
  };
}

export const TodayIcon = tabIcon('sunny-outline', 'sunny');
export const GoalsIcon = tabIcon('flag-outline', 'flag');
export const FocusIcon = tabIcon('timer-outline', 'timer');
export const ProgressIcon = tabIcon('bar-chart-outline', 'bar-chart');
export const InsightsIcon = ProgressIcon;
export const ProfileIcon = tabIcon('person-circle-outline', 'person-circle');
