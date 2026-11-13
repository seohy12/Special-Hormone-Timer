/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Coffee, 
  Monitor, 
  Music, 
  Code, 
  PenTool, 
  Palette, 
  Dumbbell, 
  Brain, 
  Layout, 
  Heart, 
  Smile, 
  Star, 
  Sun, 
  Moon, 
  Zap, 
  Target, 
  Award, 
  Flame, 
  Gamepad2, 
  Languages, 
  Mountain, 
  Plane, 
  ShoppingCart, 
  Stethoscope, 
  Trees, 
  Utensils, 
  Watch, 
  LogIn, 
  User, 
  ShieldCheck,
  ExternalLink,
  Plus,
  Trophy,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp, 
  doc, 
  deleteDoc, 
  updateDoc
} from './firebase';

import { 
  TodoItem, 
  RewardItem, 
  Session, 
  PomodoroMode, 
  TimerState, 
  AllowedSite, 
  ThemeConfig,
  DDayConfig 
} from './types';
import { DEFAULT_ALLOWED_SITES } from './defaultSites';
import { PomodoroPanel } from './components/PomodoroPanel';
import { SiteLauncherDock } from './components/SiteLauncherDock';
import { BlockedWarningModal } from './components/BlockedWarningModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';

// --- Constants ---

const SOUNDS = [
  { id: 'bell', name: '벨', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'digital', name: '디지털', url: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3' },
  { id: 'chime', name: '차임', url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
  { id: 'success', name: '성공', url: 'https://assets.mixkit.co/active_storage/sfx/1431/1431-preview.mp3' },
  { id: 'alert', name: '경고', url: 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3' },
];

const THEMES: ThemeConfig[] = [
  { id: 'black', name: '모던 블랙', color: '#000000', bg: 'bg-black', text: 'text-black', border: 'border-black', shadow: 'shadow-black/20' },
  { id: 'light-pink', name: '파스텔 핑크', color: '#ffb3ba', bg: 'bg-[#ffb3ba]', text: 'text-[#ff7482]', border: 'border-[#ffb3ba]', shadow: 'shadow-[#ffb3ba]/20' },
  { id: 'light-yellow', name: '소프트 옐로우', color: '#ffffba', bg: 'bg-[#ffffba]', text: 'text-[#d4d400]', border: 'border-[#ffffba]', shadow: 'shadow-[#ffffba]/20' },
  { id: 'light-orange', name: '피치 오렌지', color: '#ffdfba', bg: 'bg-[#ffdfba]', text: 'text-[#ff9d26]', border: 'border-[#ffdfba]', shadow: 'shadow-[#ffdfba]/20' },
  { id: 'light-green', name: '민트 그린', color: '#baffc9', bg: 'bg-[#baffc9]', text: 'text-[#3cb371]', border: 'border-[#baffc9]', shadow: 'shadow-[#baffc9]/20' },
  { id: 'light-blue', name: '스카이 블루', color: '#bae1ff', bg: 'bg-[#bae1ff]', text: 'text-[#4682b4]', border: 'border-[#bae1ff]', shadow: 'shadow-[#bae1ff]/20' },
  { id: 'light-purple', name: '라벤더', color: '#e0baff', bg: 'bg-[#e0baff]', text: 'text-[#9370db]', border: 'border-[#e0baff]', shadow: 'shadow-[#e0baff]/20' },
];

const DEFAULT_MODES: PomodoroMode[] = [
  { id: '1', name: '업무', focusTime: 25, shortBreakTime: 5, longBreakTime: 15, icon: 'work' },
  { id: '2', name: '공부', focusTime: 50, shortBreakTime: 10, longBreakTime: 15, icon: 'study' },
  { id: '3', name: '독서', focusTime: 30, shortBreakTime: 5, longBreakTime: 15, icon: 'reading' },
];

const ICON_MAP: Record<string, any> = {
  work: Briefcase,
  study: GraduationCap,
  reading: BookOpen,
  custom: Bell,
  coffee: Coffee,
  monitor: Monitor,
  music: Music,
  code: Code,
  pen: PenTool,
  palette: Palette,
  dumbbell: Dumbbell,
  brain: Brain,
  layout: Layout,
  heart: Heart,
  smile: Smile,
  star: Star,
  sun: Sun,
  moon: Moon,
  zap: Zap,
  target: Target,
  award: Award,
  flame: Flame,
  game: Gamepad2,
  language: Languages,
  mountain: Mountain,
  plane: Plane,
  cart: ShoppingCart,
  health: Stethoscope,
  trees: Trees,
  food: Utensils,
  watch: Watch
};

// Date helpers for midnight (00:00:00 / 오전 12시) daily reset
const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isItemFromToday = (itemCreatedAt: any, itemDateKey?: string) => {
  if (itemDateKey) {
    return itemDateKey === getTodayKey();
  }
  if (!itemCreatedAt) return true;
  let d: Date;
  if (typeof itemCreatedAt.toDate === 'function') {
    d = itemCreatedAt.toDate();
  } else if (itemCreatedAt instanceof Date) {
    d = itemCreatedAt;
  } else if (typeof itemCreatedAt === 'string' || typeof itemCreatedAt === 'number') {
    d = new Date(itemCreatedAt);
  } else if (itemCreatedAt.seconds) {
    d = new Date(itemCreatedAt.seconds * 1000);
  } else {
    return true;
  }
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
};

export default function App() {
  // --- Pomodoro States ---
  const [modes, setModes] = useState<PomodoroMode[]>(() => {
    const saved = localStorage.getItem('pomodoro_modes');
    return saved ? JSON.parse(saved) : DEFAULT_MODES;
  });
  const [currentModeId, setCurrentModeId] = useState(() => {
    return localStorage.getItem('pomodoro_current_mode_id') || modes[0].id;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('pomodoro_time_left');
    return saved ? parseInt(saved) : modes[0].focusTime * 60;
  });
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem('pomodoro_is_active') === 'true';
  });
  const [timerState, setTimerState] = useState<TimerState>(() => {
    return (localStorage.getItem('pomodoro_timer_state') as TimerState) || 'idle';
  });
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('pomodoro_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [historyDate, setHistoryDate] = useState(new Date());
  const [historyView, setHistoryView] = useState<'day' | 'month'>('day');
  const [selectedSound, setSelectedSound] = useState(() => {
    return localStorage.getItem('pomodoro_sound') || SOUNDS[0].url;
  });
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('pomodoro_theme') || 'black';
  });
  const [isForcedMode, setIsForcedMode] = useState(() => {
    return localStorage.getItem('pomodoro_forced_mode') === 'true';
  });
  const [autoStartCount, setAutoStartCount] = useState<number | null>(null);

  // --- Allowed Sites (User-Added Only, Clean Slate) ---
  const [allowedSites, setAllowedSites] = useState<AllowedSite[]>(() => {
    const saved = localStorage.getItem('workspace_allowed_sites');
    return saved ? JSON.parse(saved) : DEFAULT_ALLOWED_SITES;
  });

  // --- Target D-Day Countdown State ---
  const [dday, setDday] = useState<DDayConfig>(() => {
    const saved = localStorage.getItem('pomodoro_dday');
    return saved ? JSON.parse(saved) : { title: '', date: '', enabled: false };
  });

  const handleUpdateDDay = (updated: DDayConfig) => {
    setDday(updated);
    localStorage.setItem('pomodoro_dday', JSON.stringify(updated));
  };

  const getDDayInfo = (targetDateStr: string) => {
    if (!targetDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null; // Never display D+1, D+2 etc.!
    let label = '';
    if (diffDays === 0) label = 'D-Day';
    else label = `D-${diffDays}`;
    return { label, diffDays };
  };

  // --- D-Day Celebration State & Effect (디데이 지난 최초 접속 시 '축하합니다!' 5초 표시 후 디데이 완전 초기화) ---
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedTargetTitle, setCelebratedTargetTitle] = useState('');

  useEffect(() => {
    if (!dday.enabled || !dday.date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dday.date);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // If D-Day has passed (diffDays < 0):
    // Clear D-Day completely so no D+1 appears and it returns to an unconfigured clean state!
    if (diffDays < 0) {
      const storageKey = `pomodoro_celebrated_${dday.date}_${dday.title || 'target'}`;
      const alreadyCelebrated = localStorage.getItem(storageKey);
      const passedTitle = dday.title;

      // Clear D-Day from state and localStorage
      setDday({ title: '', date: '', enabled: false });
      localStorage.removeItem('pomodoro_dday');

      if (!alreadyCelebrated) {
        setCelebratedTargetTitle(passedTitle);
        setShowCelebration(true);
        localStorage.setItem(storageKey, 'true');

        // Automatically disappear after 5 seconds
        const timer = setTimeout(() => {
          setShowCelebration(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [dday.enabled, dday.date, dday.title]);

  // Trigger celebration confetti burst when '축하합니다!' overlay appears
  useEffect(() => {
    if (showCelebration) {
      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 }
        });
        const timer = setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0.1, y: 0.65 }
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 0.9, y: 0.65 }
          });
        }, 320);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Confetti error', err);
      }
    }
  }, [showCelebration]);

  // --- Modals ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<PomodoroMode | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [blockedAlert, setBlockedAlert] = useState<{ isOpen: boolean; url?: string; reason?: string }>({
    isOpen: false
  });

  // --- Todos & Rewards (Daily midnight reset at 00:00:00 / 오전 12시) ---
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const savedDate = localStorage.getItem('pomodoro_todo_date');
    const todayKey = getTodayKey();
    if (savedDate !== todayKey) {
      localStorage.setItem('pomodoro_todo_date', todayKey);
      localStorage.removeItem('pomodoro_todos');
      localStorage.removeItem('pomodoro_rewards');
      return [];
    }
    const saved = localStorage.getItem('pomodoro_todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const savedDate = localStorage.getItem('pomodoro_todo_date');
    const todayKey = getTodayKey();
    if (savedDate !== todayKey) {
      return [];
    }
    const saved = localStorage.getItem('pomodoro_rewards');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTodoText, setNewTodoText] = useState('');
  const [newRewardText, setNewRewardText] = useState('');

  // --- Auth States ---
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  // Sync todos/rewards to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('pomodoro_todos', JSON.stringify(todos));
      localStorage.setItem('pomodoro_todo_date', getTodayKey());
    }
  }, [todos, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('pomodoro_rewards', JSON.stringify(rewards));
      localStorage.setItem('pomodoro_todo_date', getTodayKey());
    }
  }, [rewards, user]);

  // Midnight (오전 12시 / 00:00:00) day rollover check
  useEffect(() => {
    let lastKey = getTodayKey();
    const interval = setInterval(() => {
      const currentKey = getTodayKey();
      if (currentKey !== lastKey) {
        lastKey = currentKey;
        // Day rolled over at midnight
        if (!user) {
          setTodos([]);
          setRewards([]);
          localStorage.setItem('pomodoro_todos', JSON.stringify([]));
          localStorage.setItem('pomodoro_rewards', JSON.stringify([]));
          localStorage.setItem('pomodoro_todo_date', currentKey);
        } else {
          setTodos(prev => prev.filter(t => isItemFromToday(t.createdAt, t.dateKey)));
          setRewards(prev => prev.filter(r => isItemFromToday(r.createdAt, r.dateKey)));
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        setShowGuestWarning(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showGuestWarning) {
      const timer = setTimeout(() => {
        setShowGuestWarning(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showGuestWarning]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthPage(false);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/cancelled-popup-request') {
        console.log('Login cancelled by user');
      } else {
        console.error('Login failed:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSessions([]);
      setTodos([]);
      setRewards([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // --- Firestore Sync ---
  useEffect(() => {
    if (!isAuthReady || !user) return;

    // Sessions
    const q = query(
      collection(db, 'sessions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubscribeSessions = onSnapshot(q, (snapshot) => {
      const fetched: Session[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session));
      setSessions(fetched);
    }, (err) => console.error(err));

    // Todos (only today's items, resetting at midnight)
    const todosQuery = query(collection(db, 'todos'), where('uid', '==', user.uid), orderBy('createdAt', 'asc'));
    const unsubscribeTodos = onSnapshot(todosQuery, (snapshot) => {
      const fetched = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as TodoItem))
        .filter(t => isItemFromToday(t.createdAt, t.dateKey));
      setTodos(fetched);
    });

    // Rewards (only today's items, resetting at midnight)
    const rewardsQuery = query(collection(db, 'rewards'), where('uid', '==', user.uid), orderBy('createdAt', 'asc'));
    const unsubscribeRewards = onSnapshot(rewardsQuery, (snapshot) => {
      const fetched = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as RewardItem))
        .filter(r => isItemFromToday(r.createdAt, r.dateKey));
      setRewards(fetched);
    });

    // User-added Allowed Sites
    const sitesQuery = query(collection(db, 'allowed_sites'), where('uid', '==', user.uid));
    const unsubscribeSites = onSnapshot(sitesQuery, (snapshot) => {
      const customSites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AllowedSite));
      setAllowedSites(customSites);
      localStorage.setItem('workspace_allowed_sites', JSON.stringify(customSites));
    });

    return () => {
      unsubscribeSessions();
      unsubscribeTodos();
      unsubscribeRewards();
      unsubscribeSites();
    };
  }, [user, isAuthReady]);

  // --- Derived State & Refs ---
  const todaySessionCount = sessions.filter(s => {
    const d = new Date(s.date);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  }).length;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(
    (() => {
      const saved = localStorage.getItem('pomodoro_end_time');
      return saved ? parseInt(saved) : null;
    })()
  );

  const currentMode = modes.find(m => m.id === currentModeId) || modes[0];
  const theme = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  // --- Helpers ---
  const playNotificationSound = (url?: string) => {
    const soundUrl = url || selectedSound;
    const audio = new Audio(soundUrl);
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Helper to open a site directly in a clean dedicated window
  const openDedicatedWindow = (url: string) => {
    const width = 1240;
    const height = 860;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    window.open(
      url, 
      '_blank', 
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=yes,location=yes,status=no`
    );
  };

  // --- Timer Actions ---
  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    endTimeRef.current = null;
    localStorage.removeItem('pomodoro_end_time');
    localStorage.setItem('pomodoro_is_active', 'false');
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimerState('idle');
    const mode = modes.find(m => m.id === currentModeId) || modes[0];
    setTimeLeft(mode.focusTime * 60);
    localStorage.setItem('pomodoro_timer_state', 'idle');
    localStorage.setItem('pomodoro_time_left', (mode.focusTime * 60).toString());
  }, [currentModeId, modes, stopTimer]);

  const handleTimerComplete = useCallback(async () => {
    stopTimer();
    playNotificationSound();

    if (timerState === 'focus') {
      setTimerState('break_pending');
      localStorage.setItem('pomodoro_timer_state', 'break_pending');

      const focusDuration = currentMode.focusTime;
      const sessionData = {
        date: new Date().toISOString(),
        duration: focusDuration,
        modeName: currentMode.name,
      };

      if (user) {
        try {
          await addDoc(collection(db, 'sessions'), {
            ...sessionData,
            uid: user.uid,
            createdAt: Timestamp.now()
          });
        } catch (error) {
          console.error('Error saving session:', error);
        }
      } else {
        const newSession: Session = {
          id: Date.now().toString(),
          ...sessionData
        };
        const updated = [...sessions, newSession];
        setSessions(updated);
        localStorage.setItem('pomodoro_sessions', JSON.stringify(updated));
      }
    } else if (timerState === 'break') {
      setTimerState('focus_pending');
      localStorage.setItem('pomodoro_timer_state', 'focus_pending');
      
      if (isForcedMode) {
        setAutoStartCount(3);
      }
    }
  }, [timerState, stopTimer, currentMode, sessions, user, isForcedMode]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_time_left', timeLeft.toString());
    localStorage.setItem('pomodoro_is_active', isActive.toString());
    localStorage.setItem('pomodoro_timer_state', timerState);
    localStorage.setItem('pomodoro_current_mode_id', currentModeId);
    if (endTimeRef.current) {
      localStorage.setItem('pomodoro_end_time', endTimeRef.current.toString());
    }
  }, [timeLeft, isActive, timerState, currentModeId]);

  // Wake/Load
  useEffect(() => {
    if (isActive && endTimeRef.current) {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        handleTimerComplete();
      }
    }
  }, []);

  useEffect(() => {
    if (autoStartCount !== null) {
      if (autoStartCount > 0) {
        const timer = setTimeout(() => setAutoStartCount(autoStartCount - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setAutoStartCount(null);
        startFocus();
      }
    }
  }, [autoStartCount]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        if (endTimeRef.current) {
          const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining === 0) {
            handleTimerComplete();
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, handleTimerComplete]);

  // --- Handlers ---
  const selectMode = (id: string) => {
    const mode = modes.find(m => m.id === id);
    if (!mode) return;
    setCurrentModeId(id);
    stopTimer();
    setTimerState('idle');
    setTimeLeft(mode.focusTime * 60);
  };

  const startFocus = () => {
    const duration = currentMode.focusTime * 60;
    setTimeLeft(duration);
    endTimeRef.current = Date.now() + duration * 1000;
    setTimerState('focus');
    setIsActive(true);
  };

  const startBreak = () => {
    const isLongBreak = todaySessionCount > 0 && todaySessionCount % 4 === 0;
    const duration = (isLongBreak ? currentMode.longBreakTime : currentMode.shortBreakTime) * 60;
    setTimeLeft(duration);
    endTimeRef.current = Date.now() + duration * 1000;
    setTimerState('break');
    setIsActive(true);
  };

  const toggleTimer = () => {
    if (isActive) {
      stopTimer();
    } else {
      if (timerState === 'idle' || timerState === 'focus_pending') {
        startFocus();
      } else if (timerState === 'break_pending') {
        startBreak();
      } else {
        endTimeRef.current = Date.now() + timeLeft * 1000;
        setIsActive(true);
      }
    }
  };

  const saveModes = (newModes: PomodoroMode[]) => {
    setModes(newModes);
    localStorage.setItem('pomodoro_modes', JSON.stringify(newModes));
  };

  const deleteMode = (id: string) => {
    if (modes.length <= 1) return;
    const newModes = modes.filter(m => m.id !== id);
    saveModes(newModes);
    if (currentModeId === id) {
      selectMode(newModes[0].id);
    }
  };

  const updateMode = (updated: PomodoroMode) => {
    let newModes;
    if (isNewMode) {
      newModes = [...modes, updated];
    } else {
      newModes = modes.map(m => m.id === updated.id ? updated : m);
    }
    saveModes(newModes);
    setEditingMode(null);
    setIsNewMode(false);
    if (currentModeId === updated.id && timerState === 'idle') {
      setTimeLeft(updated.focusTime * 60);
    }
  };

  const addNewMode = () => {
    const newMode: PomodoroMode = {
      id: Date.now().toString(),
      name: '',
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      icon: 'custom',
    };
    setEditingMode(newMode);
    setIsNewMode(true);
  };

  const deleteSession = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'sessions', id));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    } else {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      localStorage.setItem('pomodoro_sessions', JSON.stringify(updated));
    }
  };

  // --- Todos & Rewards Handlers ---
  const addTodo = async () => {
    if (!newTodoText.trim()) return;
    const todayKey = getTodayKey();
    if (user) {
      try {
        await addDoc(collection(db, 'todos'), {
          uid: user.uid,
          text: newTodoText.trim(),
          completed: false,
          dateKey: todayKey,
          createdAt: Timestamp.now()
        });
      } catch (e) { console.error(e); }
    } else {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        dateKey: todayKey,
        createdAt: new Date().toISOString()
      };
      setTodos([...todos, newTodo]);
    }
    setNewTodoText('');
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'todos', id), { completed: !completed });
      } catch (e) { console.error(e); }
    } else {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const updateTodoText = async (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (user) {
      try {
        await updateDoc(doc(db, 'todos', id), { text: trimmed });
      } catch (e) { console.error(e); }
    } else {
      setTodos(todos.map(t => t.id === id ? { ...t, text: trimmed } : t));
    }
  };

  const deleteTodo = async (id: string) => {
    const todoIndex = todos.findIndex(t => t.id === id);
    const matchingReward = (todoIndex !== -1 && todoIndex < rewards.length)
      ? rewards[todoIndex]
      : null;

    if (user) {
      try {
        await deleteDoc(doc(db, 'todos', id));
        if (matchingReward) {
          await deleteDoc(doc(db, 'rewards', matchingReward.id));
        }
      } catch (e) { console.error(e); }
    } else {
      setTodos(todos.filter(t => t.id !== id));
      if (matchingReward) {
        setRewards(rewards.filter(r => r.id !== matchingReward.id));
      }
    }
  };

  const addReward = async () => {
    if (!newRewardText.trim()) return;
    const todayKey = getTodayKey();
    if (user) {
      try {
        await addDoc(collection(db, 'rewards'), {
          uid: user.uid,
          text: newRewardText.trim(),
          dateKey: todayKey,
          createdAt: Timestamp.now()
        });
      } catch (e) { console.error(e); }
    } else {
      const newReward: RewardItem = {
        id: Date.now().toString(),
        text: newRewardText.trim(),
        dateKey: todayKey,
        createdAt: new Date().toISOString()
      };
      setRewards([...rewards, newReward]);
    }
    setNewRewardText('');
  };

  const deleteReward = async (id: string) => {
    if (user) {
      try { await deleteDoc(doc(db, 'rewards', id)); } catch (e) { console.error(e); }
    } else {
      setRewards(rewards.filter(r => r.id !== id));
    }
  };

  // --- Allowed Sites (User-Added Only) Handlers ---
  const handleAddAllowedSite = async (newSiteData: Omit<AllowedSite, 'id'>) => {
    const newSite: AllowedSite = {
      id: 'site-' + Date.now(),
      ...newSiteData,
      createdAt: new Date().toISOString()
    };

    const updated = [...allowedSites, newSite];
    setAllowedSites(updated);
    localStorage.setItem('workspace_allowed_sites', JSON.stringify(updated));

    if (user) {
      try {
        await addDoc(collection(db, 'allowed_sites'), {
          ...newSiteData,
          uid: user.uid,
          createdAt: Timestamp.now()
        });
      } catch (e) {
        console.error('Error saving allowed site to Firestore:', e);
      }
    }
  };

  const handleUpdateAllowedSite = async (id: string, updatedData: Omit<AllowedSite, 'id'>) => {
    const updated = allowedSites.map(s =>
      s.id === id ? { ...s, ...updatedData } : s
    );
    setAllowedSites(updated);
    localStorage.setItem('workspace_allowed_sites', JSON.stringify(updated));

    if (user) {
      try {
        await updateDoc(doc(db, 'allowed_sites', id), {
          ...updatedData
        });
      } catch (e) {
        console.error('Error updating allowed site in Firestore:', e);
      }
    }
  };

  const handleDeleteAllowedSite = async (id: string) => {
    const updated = allowedSites.filter(s => s.id !== id);
    setAllowedSites(updated);
    localStorage.setItem('workspace_allowed_sites', JSON.stringify(updated));

    if (user) {
      try {
        await deleteDoc(doc(db, 'allowed_sites', id));
      } catch (e) {
        console.error('Error deleting allowed site from Firestore:', e);
      }
    }
  };

  const handleBlockedAttempt = (url: string, reason: string) => {
    setBlockedAlert({
      isOpen: true,
      attemptedUrl: url,
      reason
    });
  };

  const completedTodosCount = todos.filter(t => t.completed).length;

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // --- Render Auth Modal Page ---
  if (showAuthPage && !user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[40px] p-12 shadow-xl border border-black/5 text-center"
        >
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg">
            <Bell size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-neutral-900">반가워요!</h1>
          <p className="text-black/50 mb-10 leading-relaxed text-sm">
            포모도로 집중 기록 및 내가 추가한 사이트 목록을 동기화하여<br />
            어디서든 나만의 집중 환경을 이어가세요.
          </p>

          <div className="space-y-4">
            <button 
              disabled={isLoggingIn}
              onClick={handleLogin}
              className={`w-full py-4.5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              Google 계정으로 로그인
            </button>
          </div>

          <button 
            onClick={() => {
              setShowAuthPage(false);
              setShowGuestWarning(true);
            }}
            className="mt-8 text-xs font-bold text-black/30 hover:text-black transition-colors uppercase tracking-widest"
          >
            게스트로 계속하기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-[#1a1a1a] font-sans selection:bg-[#1a1a1a] selection:text-white flex flex-col">
      {/* 1. GLOBAL APP HEADER */}
      <header className="px-6 py-4 border-b border-black/5 bg-white/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Flame size={18} />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-neutral-900">
              타이머 & 집중 런처
            </span>
          </div>
        </div>

        {/* Right header controls: D-Day Badge + Minimize Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Target D-Day Countdown Badge (only shown when configured and not expired) */}
          {dday.enabled && dday.date && getDDayInfo(dday.date) ? (
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 cursor-pointer border border-black/5 text-xs transition-all shadow-xs"
              title="목표 D-Day (클릭 시 설정)"
            >
              <Target size={14} className="text-neutral-600 flex-shrink-0" />
              <span className="font-bold text-neutral-800 max-w-[100px] sm:max-w-[130px] truncate">
                {dday.title || '목표'}
              </span>
              {(() => {
                const info = getDDayInfo(dday.date);
                if (!info) return null;

                const isUrgent = info.diffDays === 1 || info.diffDays === 0; // 하루 남았을 때 / 당일
                const isOneWeek = info.diffDays >= 2 && info.diffDays <= 7; // 1주일 남았을 때

                let badgeStyle: React.CSSProperties = {};
                let badgeClasses = 'px-2 py-0.5 rounded-md font-extrabold text-[11px] tracking-tight ';

                if (isUrgent) {
                  badgeClasses += 'bg-red-600 text-white animate-pulse';
                } else if (isOneWeek) {
                  badgeStyle = {
                    backgroundColor: theme.color,
                    color: selectedTheme === 'black' ? '#ffffff' : '#000000'
                  };
                  badgeClasses += 'shadow-xs';
                } else if (info.diffDays > 7) {
                  badgeClasses += 'bg-neutral-900 text-white';
                } else {
                  badgeClasses += 'bg-neutral-300 text-neutral-700';
                }

                return (
                  <span style={badgeStyle} className={badgeClasses}>
                    {info.label}
                  </span>
                );
              })()}
            </div>
          ) : (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-800 text-neutral-500 hover:text-neutral-900 text-xs font-semibold transition-all"
              title="설정에서 D-Day를 등록하세요"
            >
              <Target size={13} />
              <span>D-Day 설정</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto flex flex-col justify-center">
        {/* STANDARD VIEW: Pomodoro + Side Icon Launcher Dock right beside it */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-5">
          {/* The Main Pomodoro Station */}
          <div className="flex-1 w-full max-w-2xl">
            <PomodoroPanel
              modes={modes}
              currentModeId={currentModeId}
              currentMode={currentMode}
              timeLeft={timeLeft}
              isActive={isActive}
              timerState={timerState}
              autoStartCount={autoStartCount}
              todaySessionCount={todaySessionCount}
              theme={theme}
              selectedTheme={selectedTheme}
              todos={todos}
              rewards={rewards}
              newTodoText={newTodoText}
              newRewardText={newRewardText}
              user={user}
              completedTodosCount={completedTodosCount}
              onSelectMode={selectMode}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
              onStartFocus={startFocus}
              onStartBreak={startBreak}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onOpenAuth={() => setShowAuthPage(true)}
              onLogout={handleLogout}
              onAddTodo={addTodo}
              onToggleTodo={toggleTodo}
              onUpdateTodo={updateTodoText}
              onDeleteTodo={deleteTodo}
              onNewTodoTextChange={setNewTodoText}
              onAddReward={addReward}
              onDeleteReward={deleteReward}
              onNewRewardTextChange={setNewRewardText}
              iconMap={ICON_MAP}
              isSplitView={false}
            />
          </div>

          {/* Compact Site Launcher Icon Dock Right Next to Pomodoro */}
          <div className="w-full md:w-auto flex justify-center">
            <SiteLauncherDock
              allowedSites={allowedSites}
              onAddSite={handleAddAllowedSite}
              onUpdateSite={handleUpdateAllowedSite}
              onDeleteSite={handleDeleteAllowedSite}
              theme={theme}
              onBlockedAttempt={handleBlockedAttempt}
              layoutOrientation="vertical"
            />
          </div>
        </div>
      </main>

      {/* Floating Action Button for Pending States (Break / Focus) */}
      <AnimatePresence>
        {(timerState === 'break_pending' || timerState === 'focus_pending') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-0 right-0 px-6 max-w-sm mx-auto z-40"
          >
            <button 
              onClick={timerState === 'break_pending' ? startBreak : startFocus}
              className={`w-full ${theme.bg} ${selectedTheme === 'black' ? 'text-white' : 'text-black'} py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all border border-black/10`}
            >
              {timerState === 'break_pending' ? (
                <>
                  <Coffee size={18} />
                  휴식 시작하기
                </>
              ) : (
                <>
                  <Flame size={18} />
                  다시 집중하기
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isForcedMode={isForcedMode}
        onToggleForcedMode={() => {
          const next = !isForcedMode;
          setIsForcedMode(next);
          localStorage.setItem('pomodoro_forced_mode', String(next));
        }}
        themes={THEMES}
        selectedTheme={selectedTheme}
        onSelectTheme={(id) => {
          setSelectedTheme(id);
          localStorage.setItem('pomodoro_theme', id);
        }}
        sounds={SOUNDS}
        selectedSound={selectedSound}
        onSelectSound={(url) => {
          setSelectedSound(url);
          localStorage.setItem('pomodoro_sound', url);
          playNotificationSound(url);
        }}
        modes={modes}
        editingMode={editingMode}
        isNewMode={isNewMode}
        isIconPickerOpen={isIconPickerOpen}
        onStartEditMode={(mode) => {
          setEditingMode(mode);
          setIsNewMode(false);
        }}
        onAddNewMode={addNewMode}
        onCancelEditMode={() => {
          setEditingMode(null);
          setIsNewMode(false);
          setIsIconPickerOpen(false);
        }}
        onUpdateMode={updateMode}
        onDeleteMode={deleteMode}
        setIsIconPickerOpen={setIsIconPickerOpen}
        setEditingMode={setEditingMode}
        iconMap={ICON_MAP}
        theme={theme}
        dday={dday}
        onUpdateDDay={handleUpdateDDay}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        historyDate={historyDate}
        historyView={historyView}
        onSetHistoryView={setHistoryView}
        onNavigateHistory={(dir) => {
          const newDate = new Date(historyDate);
          if (historyView === 'day') {
            newDate.setDate(newDate.getDate() + dir);
          } else {
            newDate.setMonth(newDate.getMonth() + dir);
          }
          setHistoryDate(newDate);
        }}
        onDeleteSession={deleteSession}
        theme={theme}
      />

      {/* Strict Blocker Warning Modal */}
      <BlockedWarningModal
        isOpen={blockedAlert.isOpen}
        onClose={() => setBlockedAlert({ isOpen: false })}
        attemptedUrl={blockedAlert.attemptedUrl}
        reason={blockedAlert.reason}
      />

      {/* Guest Warning Modal */}
      <AnimatePresence>
        {showGuestWarning && !user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[60] max-w-xs mx-auto"
          >
            <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-black/5 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell size={24} />
              </div>
              <h3 className="text-sm font-bold mb-2 leading-tight text-neutral-900">
                로그인하지 않으면<br />
                기록과 설정이 브라우저에만<br />
                임시 저장됩니다.
              </h3>
              <button 
                onClick={() => {
                  setShowGuestWarning(false);
                  setShowAuthPage(true);
                }}
                className="w-full mt-4 py-3 bg-black text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
              >
                지금 로그인 / 가입하기
              </button>
              <button 
                onClick={() => setShowGuestWarning(false)}
                className="mt-4 text-[10px] font-bold text-black/30 hover:text-black uppercase tracking-widest"
              >
                닫기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* D-Day Passed Celebration Overlay (최초 접속 시 크게 뜨고 5초 후 자동 종료) */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-[36px] p-8 md:p-10 shadow-2xl border border-black/10 text-center overflow-hidden"
            >
              {/* Confetti / Sparkle background aura */}
              <div 
                className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ backgroundColor: theme.color }}
              />
              <div 
                className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ backgroundColor: theme.color }}
              />

              {/* Close Button */}
              <button
                onClick={() => setShowCelebration(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                title="닫기"
              >
                <X size={20} />
              </button>

              {/* Trophy icon */}
              <div 
                className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg relative"
                style={{ 
                  backgroundColor: theme.id === 'black' ? '#f5f5f5' : `${theme.color}25`, 
                  color: theme.id === 'black' ? '#000000' : theme.color 
                }}
              >
                <Trophy size={40} className="animate-bounce" />
              </div>

              {/* Celebration Title */}
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-2">
                축하합니다!
              </h2>

              {/* Target subtitle */}
              <p className="text-base font-semibold text-neutral-700 mb-2">
                {celebratedTargetTitle || dday.title ? `"${celebratedTargetTitle || dday.title}" 목표일이 완료되었습니다!` : '설정하신 목표 디데이에 도달했습니다!'}
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto mb-8">
                그동안 쏟은 집중과 노력이 값진 결실을 맺었습니다. 새로운 목표를 향해 힘차게 나아가세요!
              </p>

              {/* 5-second indicator bar */}
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
              </div>
              <p className="text-[11px] font-medium text-neutral-400">
                5초 후 자동으로 닫힙니다
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
