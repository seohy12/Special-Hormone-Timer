import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Coffee, 
  Flame, 
  CheckCircle2, 
  Bell,
  Target 
} from 'lucide-react';
import { PomodoroMode, TimerState, ThemeConfig, DDayConfig } from '../types';

interface Props {
  currentMode: PomodoroMode;
  timeLeft: number;
  isActive: boolean;
  timerState: TimerState;
  todaySessionCount: number;
  theme: ThemeConfig;
  selectedTheme: string;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onStartFocus: () => void;
  onStartBreak: () => void;
  onExpand: () => void;
  completedTodosCount: number;
  totalTodosCount: number;
  autoStartCount: number | null;
  iconMap: Record<string, any>;
  allowedSites?: import('../types').AllowedSite[];
  onOpenSite?: (url: string) => void;
  dday?: DDayConfig;
  onOpenSettings?: () => void;
}

export const TopMiniBar: React.FC<Props> = ({
  currentMode,
  timeLeft,
  isActive,
  timerState,
  todaySessionCount,
  theme,
  selectedTheme,
  onToggleTimer,
  onResetTimer,
  onStartFocus,
  onStartBreak,
  onExpand,
  completedTodosCount,
  totalTodosCount,
  autoStartCount,
  iconMap,
  allowedSites = [],
  onOpenSite,
  dday,
  onOpenSettings
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDDayInfo = (targetDateStr: string) => {
    if (!targetDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;
    let label = '';
    if (diffDays === 0) label = 'D-Day';
    else label = `D-${diffDays}`;
    return { label, diffDays };
  };

  const IconComponent = iconMap[currentMode.icon] || Bell;

  const getStatusLabel = () => {
    if (autoStartCount !== null) return `${autoStartCount}초 후 시작`;
    switch (timerState) {
      case 'focus': return '집중 중';
      case 'break': return '휴식 중';
      case 'break_pending': return '휴식 대기';
      case 'focus_pending': return '집중 대기';
      default: return '대기';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 px-4 py-2.5 shadow-sm transition-all flex items-center justify-between">
      {/* Left: Mode & Status */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${theme.bg} ${selectedTheme === 'black' ? 'text-white' : 'text-black'} shadow-sm`}>
          <IconComponent size={16} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-neutral-900">{currentMode.name}</span>
          <span className="text-black/30 text-xs">·</span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            timerState === 'focus' 
              ? 'bg-amber-100 text-amber-900' 
              : timerState === 'break' 
              ? 'bg-emerald-100 text-emerald-900' 
              : 'bg-neutral-100 text-neutral-600'
          }`}>
            {timerState === 'focus' ? <Flame size={12} className="text-amber-600 animate-pulse" /> : null}
            {timerState === 'break' ? <Coffee size={12} className="text-emerald-600" /> : null}
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {/* Center: Digital Timer & Play/Pause Controls */}
      <div className="flex items-center gap-4">
        {/* Pending Action Quick Button if in pending state */}
        {timerState === 'break_pending' && (
          <button
            onClick={onStartBreak}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm animate-bounce"
          >
            <Coffee size={14} />
            휴식 시작하기
          </button>
        )}
        {timerState === 'focus_pending' && (
          <button
            onClick={onStartFocus}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm animate-bounce"
          >
            <Play size={14} />
            다시 집중하기
          </button>
        )}

        <div className="text-2xl font-mono font-bold tracking-tight text-neutral-900 tabular-nums">
          {autoStartCount !== null ? `${autoStartCount}s` : formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleTimer}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300' 
                : `${theme.bg} ${selectedTheme === 'black' ? 'text-white' : 'text-black'} shadow hover:opacity-90`
            }`}
            title={isActive ? '일시정지' : '시작'}
          >
            {isActive ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <button
            onClick={onResetTimer}
            className="w-8 h-8 rounded-full flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 transition-colors"
            title="타이머 리셋"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Center-Right: Quick site launcher icons */}
      {allowedSites.length > 0 && onOpenSite && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-2xl border border-black/5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-0.5">
            앱:
          </span>
          {allowedSites.map(s => (
            <button
              key={s.id}
              onClick={() => onOpenSite(s.url)}
              className="w-8 h-8 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 p-1 flex items-center justify-center transition-all hover:scale-105 shadow-xs"
              title={`${s.name} (${s.domain})\n전용 창에서 열기`}
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`}
                alt={s.name}
                className="w-4 h-4 object-contain"
                onError={e => (e.target as HTMLElement).style.display = 'none'}
              />
            </button>
          ))}
        </div>
      )}

      {/* Right: Progress Dots, Todo Count, and Expand Button */}
      <div className="flex items-center gap-3">
        {/* Session dots */}
        <div className="hidden sm:flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-full">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                (todaySessionCount % 4 >= i || (todaySessionCount > 0 && todaySessionCount % 4 === 0)) 
                  ? theme.bg 
                  : 'bg-black/20'
              }`}
            />
          ))}
          <span className="text-[11px] font-semibold text-neutral-600 ml-1">
            {todaySessionCount}회
          </span>
        </div>

        {/* Todo count */}
        {totalTodosCount > 0 && (
          <div className="hidden md:flex items-center gap-1 text-xs text-neutral-600 font-medium bg-neutral-100 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>{completedTodosCount}/{totalTodosCount}</span>
          </div>
        )}

        {/* D-Day badge if enabled */}
        {dday?.enabled && dday.date && (() => {
          const info = getDDayInfo(dday.date);
          if (!info) return null;
          const isUrgent = info.diffDays === 1 || info.diffDays === 0;
          const isOneWeek = info.diffDays >= 2 && info.diffDays <= 7;
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
            <div 
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 cursor-pointer border border-black/5 text-xs transition-all shadow-xs"
              title="목표 D-Day (클릭 시 설정)"
            >
              <Target size={13} className="text-neutral-600 flex-shrink-0" />
              <span className="font-bold text-neutral-800 max-w-[90px] truncate">
                {dday.title || '목표'}
              </span>
              <span style={badgeStyle} className={badgeClasses}>
                {info.label}
              </span>
            </div>
          );
        })()}

        {/* Expand / Restore Button */}
        <button
          onClick={onExpand}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all shadow-sm"
          title="포모도로 창 확대 (분할 모드로 복원)"
        >
          <Maximize2 size={13} />
          <span className="hidden sm:inline">창 확대 복원</span>
        </button>
      </div>
    </header>
  );
};
