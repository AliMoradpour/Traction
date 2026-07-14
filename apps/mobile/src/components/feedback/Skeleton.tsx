import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E2E8F0',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.cardContent}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function GoalCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={16} />
      <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
      <View style={styles.progressBar}>
        <Skeleton width="100%" height={8} borderRadius={4} style={{ marginTop: 12 }} />
      </View>
      <View style={styles.cardFooter}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={100} height={12} />
      </View>
    </View>
  );
}

export function InsightCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={32} height={32} borderRadius={8} />
      <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
      <Skeleton width="100%" height={12} style={{ marginTop: 8 }} />
      <Skeleton width="90%" height={12} style={{ marginTop: 4 }} />
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
});
