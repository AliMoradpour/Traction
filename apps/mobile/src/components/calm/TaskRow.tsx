import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Task } from '../../services/task.service';
import { useTractionTheme } from '../../theme';

/** Compact task line for planning lists: a check circle and the title. */
export function TaskRow({
  task,
  first,
  onComplete,
  onPress,
}: {
  task: Task;
  first?: boolean;
  onComplete: (id: string) => void;
  onPress: (id: string) => void;
}) {
  const theme = useTractionTheme();
  const done = task.status === 'COMPLETED';
  const important = task.priority === 'HIGH' || task.priority === 'URGENT';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: first ? 0 : StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.border,
      }}
    >
      <Pressable
        onPress={() => !done && onComplete(task.id)}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`Mark ${task.title} as done`}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: done ? theme.colors.success : theme.colors.textSubtle,
          backgroundColor: done ? theme.colors.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? <Ionicons name="checkmark" size={14} color={theme.colors.textInverse} /> : null}
      </Pressable>
      <Pressable
        onPress={() => onPress(task.id)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${task.title}`}
        style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }, pressed && { opacity: 0.7 }]}
      >
        <Text
          numberOfLines={2}
          style={{
            flex: 1,
            ...theme.typography.bodyMd,
            fontWeight: done ? '400' : '500',
            color: done ? theme.colors.textSubtle : theme.colors.text,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Text>
        {important && !done ? <Ionicons name="flag-outline" size={15} color={theme.colors.warning} /> : null}
        {task.duration && !done ? (
          <Text style={{ ...theme.typography.labelSm, color: theme.colors.textSubtle }}>{task.duration} min</Text>
        ) : null}
      </Pressable>
    </View>
  );
}
