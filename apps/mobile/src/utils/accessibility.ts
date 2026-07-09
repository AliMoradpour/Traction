import { Platform } from 'react-native';

export const AccessibilityRoles = {
  button: 'button' as const,
  header: 'header' as const,
  link: 'link' as const,
  image: 'image' as const,
  text: 'text' as const,
  search: 'search' as const,
  adjustable: 'adjustable' as const,
  selected: 'selected' as const,
  disabled: 'disabled' as const,
  checked: 'checked' as const,
  unchecked: 'unchecked' as const,
  none: 'none' as const,
} as const;

export const AccessibilityStates = {
  selected: 'selected' as const,
  disabled: 'disabled' as const,
  checked: 'checked' as const,
  unchecked: 'unchecked' as const,
  busy: 'busy' as const,
  expanded: 'expanded' as const,
  collapsed: 'collapsed' as const,
} as const;

export function getAccessibilityProps(options: {
  label?: string;
  hint?: string;
  role?: string;
  state?: {
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  actions?: {
    activate?: () => void;
    increment?: () => void;
    decrement?: () => void;
  };
}) {
  const props: Record<string, any> = {};

  if (options.label) {
    props.accessibilityLabel = options.label;
  }

  if (options.hint) {
    props.accessibilityHint = options.hint;
  }

  if (options.role) {
    props.accessibilityRole = options.role;
  }

  if (options.state) {
    const states: string[] = [];
    if (options.state.selected) states.push('selected');
    if (options.state.disabled) states.push('disabled');
    if (options.state.checked) states.push('checked');
    if (options.state.busy) states.push('busy');
    if (options.state.expanded) states.push('expanded');
    if (states.length > 0) {
      props.accessibilityState = {
        ...(options.state.selected !== undefined && { selected: options.state.selected }),
        ...(options.state.disabled !== undefined && { disabled: options.state.disabled }),
        ...(options.state.checked !== undefined && { checked: options.state.checked }),
        ...(options.state.busy !== undefined && { busy: options.state.busy }),
        ...(options.state.expanded !== undefined && { expanded: options.state.expanded }),
      };
    }
  }

  if (options.actions) {
    props.accessibilityActions = [];
    if (options.actions.activate) {
      props.accessibilityActions.push({ name: 'activate', label: options.label || 'Activate' });
    }
    if (options.actions.increment) {
      props.accessibilityActions.push({ name: 'increment', label: 'Increment' });
    }
    if (options.actions.decrement) {
      props.accessibilityActions.push({ name: 'decrement', label: 'Decrement' });
    }
  }

  return props;
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  if (Platform.OS === 'ios') {
    // iOS Haptic feedback would be triggered here
    // import * as Haptics from 'expo-haptics';
    // switch (type) {
    //   case 'light':
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    //     break;
    //   case 'medium':
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    //     break;
    //   case 'heavy':
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    //     break;
    //   case 'success':
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    //     break;
    //   case 'warning':
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    //     break;
    //   case 'error':
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    //     break;
    // }
  }
}

export function formatAccessibilityDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs} seconds`;
  }
  if (secs === 0) {
    return `${mins} minutes`;
  }
  return `${mins} minutes and ${secs} seconds`;
}

export function formatAccessibilityProgress(current: number, total: number): string {
  const percentage = Math.round((current / total) * 100);
  return `${current} of ${total}, ${percentage}% complete`;
}
