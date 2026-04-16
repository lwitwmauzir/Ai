export type Screen = 'home' | 'channels' | 'channel-detail' | 'tasks' | 'profile' | 'studio';

export interface UserProfile {
  uid: string;
  displayName: string;
  totalReach: string;
  reachGrowth: string;
  dailyCompletion: number;
  streakDays: number;
  focusScore: number;
}

export interface Channel {
  id: string;
  userId: string;
  platform: string;
  handle: string;
  followers: string;
  growth: string;
  icon: string;
  color: string;
  bgColor: string;
  isNegative?: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  channelId?: string;
  isCompleted: boolean;
  isRecurring: boolean; // daily
  lastCompletedAt?: string; // ISO string
  streakCount: number;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Upload {
  id: string;
  userId: string;
  platform: string;
  url: string;
  date: string; // ISO string
  isScheduled: boolean;
  frequency?: 'once' | 'daily' | 'weekly';
  scheduledTime?: string;
  channelId?: string;
}

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description: string;
  time: string; // Display time or ISO
  image: string;
  type: 'upload' | 'task' | 'channel';
}
