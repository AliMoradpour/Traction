import { View } from 'react-native';

interface IconProps {
  color: string;
  size: number;
}

export function TodayIcon({ color, size }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.2,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '50%',
          height: '50%',
          borderRadius: size / 4,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function GoalsIcon({ color, size }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function InsightsIcon({ color, size }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
      }}
    >
      <View style={{ width: size * 0.2, height: size * 0.5, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: size * 0.2, height: size * 0.7, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: size * 0.2, height: size * 0.4, backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

export function ProfileIcon({ color, size }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: size * 0.2,
          backgroundColor: color,
          marginBottom: 2,
        }}
      />
    </View>
  );
}
