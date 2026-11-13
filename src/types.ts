export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: any;
  dateKey?: string;
}

export interface RewardItem {
  id: string;
  text: string;
  createdAt: any;
  dateKey?: string;
}

export interface Session {
  id: string;
  date: string; // ISO string
  duration: number; // in minutes
  modeName: string;
}

export interface PomodoroMode {
  id: string;
  name: string;
  focusTime: number; // in minutes
  shortBreakTime: number; // in minutes
  longBreakTime: number; // in minutes
  icon: string;
}

export type TimerState = 'idle' | 'focus' | 'break_pending' | 'break' | 'focus_pending';

export interface AllowedSite {
  id: string;
  name: string;
  url: string;
  domain: string;
  notes?: string;
  createdAt?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  color: string;
  bg: string;
  text: string;
  border: string;
  shadow: string;
}

export interface DDayConfig {
  title: string;
  date: string; // YYYY-MM-DD
  enabled: boolean;
}
