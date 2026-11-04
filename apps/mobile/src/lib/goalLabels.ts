import type { Goal } from '@/services/goal.service';

type Tone = 'blue' | 'sage' | 'clay' | 'sand' | 'red';
type IconName =
  | 'language-outline'
  | 'code-slash-outline'
  | 'barbell-outline'
  | 'wallet-outline'
  | 'flag-outline';

export const GOAL_TYPES: Record<Goal['type'], { label: string; icon: IconName }> = {
  IELTS: { label: 'Language', icon: 'language-outline' },
  PROGRAMMING: { label: 'Programming', icon: 'code-slash-outline' },
  FITNESS: { label: 'Fitness', icon: 'barbell-outline' },
  SAVINGS: { label: 'Savings', icon: 'wallet-outline' },
  CUSTOM: { label: 'Personal', icon: 'flag-outline' },
};

export const GOAL_HEALTH: Record<Goal['health'], { label: string; tone: Tone }> = {
  ON_TRACK: { label: 'On track', tone: 'sage' },
  SLIGHTLY_BEHIND: { label: 'A little behind', tone: 'clay' },
  BEHIND_SCHEDULE: { label: 'Behind', tone: 'clay' },
  RECOVERY_NEEDED: { label: 'Needs a reset', tone: 'red' },
  AT_RISK: { label: 'At risk', tone: 'red' },
};

export function daysLeftLabel(targetDate?: string): string | null {
  if (!targetDate) return null;
  const days = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)} days past target`;
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}
