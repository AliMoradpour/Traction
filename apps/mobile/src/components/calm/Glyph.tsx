import { Ionicons } from '@expo/vector-icons';
import { type StyleProp, StyleSheet, type TextStyle } from 'react-native';

import { useTractionTheme } from '../../theme';
import type { IconName } from './index';

// Older screens used emoji as icons; Glyph draws the matching outline icon instead.
const EMOJI_ICONS: Record<string, IconName> = {
  '💪': 'barbell-outline',
  '🎯': 'locate-outline',
  '🧠': 'bulb-outline',
  '💡': 'bulb-outline',
  '🛡️': 'shield-checkmark-outline',
  '🛡': 'shield-checkmark-outline',
  '📅': 'calendar-outline',
  '📋': 'clipboard-outline',
  '📊': 'bar-chart-outline',
  '📈': 'trending-up-outline',
  '📉': 'trending-down-outline',
  '🔴': 'alert-circle-outline',
  '🟡': 'ellipse-outline',
  '🟢': 'checkmark-circle-outline',
  '⚡': 'flash-outline',
  '▶': 'play',
  '✨': 'sparkles-outline',
  '♥': 'heart-outline',
  '🏆': 'trophy-outline',
  '🗑️': 'trash-outline',
  '🗑': 'trash-outline',
  '🔄': 'refresh-outline',
  '📤': 'share-outline',
  '🌐': 'globe-outline',
  '🔧': 'construct-outline',
  '⚠️': 'warning-outline',
  '⚠': 'warning-outline',
  '☀️': 'sunny-outline',
  '🌤': 'partly-sunny-outline',
  '🌙': 'moon-outline',
  '⏱': 'timer-outline',
  '🚧': 'construct-outline',
  '☕': 'cafe-outline',
  '⏸': 'pause',
  '🗂': 'albums-outline',
  '🔕': 'notifications-off-outline',
  '🧹': 'brush-outline',
  '📏': 'resize-outline',
  '🤔': 'help-circle-outline',
  '😴': 'bed-outline',
  '💭': 'chatbubble-ellipses-outline',
  '😐': 'remove-circle-outline',
};

export function Glyph({ emoji, style }: { emoji: string; style?: StyleProp<TextStyle> }) {
  const theme = useTractionTheme();
  const flat = StyleSheet.flatten(style) ?? {};
  const name = EMOJI_ICONS[emoji.trim()] ?? 'ellipse-outline';
  const size = typeof flat.fontSize === 'number' ? Math.min(flat.fontSize, 32) : 20;
  const color = (flat.color as string | undefined) ?? theme.colors.accent;
  return <Ionicons name={name} size={size} color={color} style={{ marginBottom: flat.marginBottom, marginRight: flat.marginRight }} />;
}
