import { Alert, type AlertButton, Platform } from 'react-native';

/**
 * React Native Web ships `Alert.alert` as a no-op, so every confirm and error
 * message in the app silently disappears in the browser / home-screen app.
 * This maps it onto the browser's own dialogs:
 * - one action plus a Cancel button -> window.confirm
 * - otherwise -> window.alert, then the first button's handler
 */
export function installWebAlert(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = message ? `${title}\n\n${message}` : title;
    const list = buttons ?? [];
    const cancel = list.find((b) => b.style === 'cancel');
    const actions = list.filter((b) => b !== cancel);

    if (cancel && actions.length > 0) {
      if (window.confirm(text)) actions[0].onPress?.();
      else cancel.onPress?.();
      return;
    }

    window.alert(text);
    actions[0]?.onPress?.();
  };
}
