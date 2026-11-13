import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings2, 
  Plus, 
  Trash2, 
  Pencil,
  Coffee, 
  Check, 
  BarChart3, 
  LogIn, 
  LogOut, 
  Lock, 
  Sparkles, 
  Gift, 
  Bell,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PomodoroMode, TimerState, ThemeConfig, TodoItem, RewardItem } from '../types';

interface Props {
  modes: PomodoroMode[];
  currentModeId: string;
  currentMode: PomodoroMode;
  timeLeft: number;
  isActive: boolean;
  timerState: TimerState;
  autoStartCount: number | null;
  todaySessionCount: number;
  theme: ThemeConfig;
  selectedTheme: string;
  todos: TodoItem[];
  rewards: RewardItem[];
  newTodoText: string;
  newRewardText: string;
  user: any;
  completedTodosCount: number;
  onSelectMode: (id: string) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onStartFocus: () => void;
  onStartBreak: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onAddTodo: () => void;
  onToggleTodo: (id: string, completed: boolean) => void;
  onUpdateTodo: (id: string, text: string) => void;
  onDeleteTodo: (id: string) => void;
  onNewTodoTextChange: (text: string) => void;
  onAddReward: () => void;
  onDeleteReward: (id: string) => void;
  onNewRewardTextChange: (text: string) => void;
  iconMap: Record<string, any>;
  isSplitView?: boolean;
}

export const PomodoroPanel: React.FC<Props> = ({
  modes,
  currentModeId,
  currentMode,
  timeLeft,
  isActive,
  timerState,
  autoStartCount,
  todaySessionCount,
  theme,
  selectedTheme,
  todos,
  rewards,
  newTodoText,
  newRewardText,
  user,
  completedTodosCount,
  onSelectMode,
  onToggleTimer,
  onResetTimer,
  onStartFocus,
  onStartBreak,
  onOpenSettings,
  onOpenHistory,
  onOpenAuth,
  onLogout,
  onAddTodo,
  onToggleTodo,
  onUpdateTodo,
  onDeleteTodo,
  onNewTodoTextChange,
  onAddReward,
  onDeleteReward,
  onNewRewardTextChange,
  iconMap,
  isSplitView = true
}) => {
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState('');

  const handleStartEditTodo = (todo: TodoItem) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  const handleSaveEditTodo = (id: string) => {
    const trimmed = editingTodoText.trim();
    if (trimmed) {
      onUpdateTodo(id, trimmed);
    }
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  const handleCancelEditTodo = () => {
    setEditingTodoId(null);
    setEditingTodoText('');
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const IconComponent = iconMap[currentMode.icon] || Bell;

  const getStatusText = () => {
    if (autoStartCount !== null) return `${autoStartCount}초 후 집중 시작...`;
    switch (timerState) {
      case 'focus': return '집중 중...';
      case 'break': return '휴식 중...';
      case 'break_pending': return '집중 완료! 휴식을 시작하세요.';
      case 'focus_pending': return '휴식 완료! 다시 집중을 시작하세요.';
      default: return '준비됨';
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/10 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 ${theme.bg} rounded-xl flex items-center justify-center ${selectedTheme === 'black' ? 'text-white' : 'text-black'} shadow-sm`}>
              <IconComponent size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">{currentMode.name}</h2>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                {currentMode.focusTime}분 집중 · {currentMode.shortBreakTime}분 휴식
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {user ? (
              <div className="flex items-center gap-1.5 ml-1">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-black/10">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <button 
                  onClick={onLogout}
                  className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-red-500"
                  title="로그아웃"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 border border-black/10 rounded-full text-xs font-bold hover:bg-black/5 transition-all text-neutral-700"
              >
                <LogIn size={13} />
                <span className="hidden sm:inline">로그인</span>
              </button>
            )}

            <button 
              onClick={onOpenHistory}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
              title="통계 및 기록"
            >
              <BarChart3 size={18} />
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
              title="설정"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </header>

        {/* Mode Selector Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                currentModeId === mode.id 
                  ? `bg-neutral-900 text-white border-neutral-900 shadow-sm` 
                  : 'bg-neutral-50 border-black/5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {mode.name} ({mode.focusTime}분)
            </button>
          ))}
        </div>

        {/* Timer Display Card */}
        <div className="bg-[#fafafa] rounded-[28px] p-8 sm:p-10 border border-black/5 flex flex-col items-center mb-6">
          <div className="text-[72px] sm:text-[80px] font-mono font-light tracking-tighter leading-none mb-3 tabular-nums text-neutral-950">
            {autoStartCount !== null ? autoStartCount : formatTime(timeLeft)}
          </div>
          
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-8">
            {getStatusText()}
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center gap-5">
            <button 
              onClick={onResetTimer}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-black/10 hover:bg-black/5 text-neutral-600 transition-colors"
              title="타이머 초기화"
            >
              <RotateCcw size={18} />
            </button>
            
            <button 
              onClick={onToggleTimer}
              className={`w-18 h-18 flex items-center justify-center rounded-full transition-all transform active:scale-95 ${
                isActive 
                  ? `bg-white border-2 ${theme.border}` 
                  : `${theme.bg} ${selectedTheme === 'black' ? 'text-white' : 'text-black'} shadow-lg ${theme.shadow}`
              }`}
              title={isActive ? '일시 정지' : '집중 시작'}
            >
              {isActive ? (
                <Pause size={28} className={theme.text} />
              ) : (
                <Play size={28} className={`ml-1 ${selectedTheme === 'black' ? '' : 'text-black'}`} />
              )}
            </button>

            {/* Quick trigger for pending break/focus */}
            {timerState === 'break_pending' ? (
              <button
                onClick={onStartBreak}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                title="휴식 시작"
              >
                <Coffee size={18} />
              </button>
            ) : timerState === 'focus_pending' ? (
              <button
                onClick={onStartFocus}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                title="집중 시작"
              >
                <Play size={18} />
              </button>
            ) : (
              <div className="w-11" />
            )}
          </div>
        </div>

        {/* Session Count Indicator */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  (todaySessionCount % 4 >= i || (todaySessionCount > 0 && todaySessionCount % 4 === 0)) 
                    ? theme.bg 
                    : 'bg-black/10'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            오늘 {todaySessionCount}회 완료
          </p>
        </div>

        {/* Two-Column Mini Sections: TODO LIST & REWARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_1fr_auto] md:grid-flow-col gap-x-5 pt-4 border-t border-black/5">
          {/* Col 1, Row 1: TO DO LIST Header */}
          <div className="flex items-center justify-between h-6 mb-3">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Check size={14} className="text-neutral-400" />
              TO DO LIST
            </h3>
            <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full font-bold leading-none">
              {completedTodosCount}/{todos.length}
            </span>
          </div>

          {/* Col 1, Row 2: TO DO LIST Items */}
          <div className={todos.length > 0 ? 'space-y-2 max-h-[180px] overflow-y-auto pr-1 mb-3' : ''}>
            {todos.map(todo => {
              const isEditing = editingTodoId === todo.id;
              return (
                <div key={todo.id} className="group bg-[#fafafa] border border-black/5 rounded-xl p-2.5 flex items-center justify-between gap-2 hover:bg-white hover:shadow-xs transition-all">
                  <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <button 
                      onClick={() => onToggleTodo(todo.id, todo.completed)}
                      className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                        todo.completed ? `${theme.bg} ${theme.border} text-white` : 'border-black/20 text-transparent hover:border-black/40'
                      }`}
                    >
                      <Check size={10} strokeWidth={4} />
                    </button>
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingTodoText}
                        onChange={(e) => setEditingTodoText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEditTodo(todo.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEditTodo();
                          }
                        }}
                        className="w-full bg-white border border-black/20 rounded-lg px-2 py-0.5 text-xs font-medium text-neutral-900 outline-none focus:border-black"
                      />
                    ) : (
                      <span className={`text-xs font-medium truncate ${todo.completed ? 'text-black/30 line-through' : 'text-neutral-800'}`}>
                        {todo.text}
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleSaveEditTodo(todo.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                        title="저장"
                      >
                        <Check size={12} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={handleCancelEditTodo}
                        className="p-1 text-black/30 hover:text-neutral-700 rounded transition-all"
                        title="취소"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <button 
                        onClick={() => handleStartEditTodo(todo)}
                        className="p-1 text-black/30 hover:text-neutral-900 transition-all"
                        title="수정"
                      >
                        <Pencil size={12} />
                      </button>
                      <button 
                        onClick={() => onDeleteTodo(todo.id)}
                        className="p-1 text-black/30 hover:text-red-500 transition-all"
                        title="삭제"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Col 1, Row 3: TO DO LIST Input */}
          <div className="relative self-end">
            <input 
              type="text"
              placeholder="새 할 일 입력"
              className="block w-full h-7 box-border bg-neutral-50 border border-black/10 rounded-xl pl-3 pr-8 text-xs focus:bg-white focus:border-black outline-none transition-all"
              value={newTodoText}
              onChange={e => onNewTodoTextChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAddTodo()}
            />
            <button 
              onClick={onAddTodo}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Col 2, Row 1: REWARD Header */}
          <div className="flex items-center justify-between h-6 mb-3 mt-5 md:mt-0">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Gift size={14} className="text-neutral-400" />
              REWARD (보상)
            </h3>
          </div>

          {/* Col 2, Row 2: REWARD Items */}
          <div className={rewards.length > 0 ? 'space-y-2 max-h-[180px] overflow-y-auto pr-1 mb-3' : ''}>
            {rewards.map((reward, index) => {
              const isLocked = index >= completedTodosCount;
              return (
                <div 
                  key={reward.id} 
                  style={!isLocked ? (
                    theme.id === 'black'
                      ? { backgroundColor: '#f9f9f9', borderColor: '#00000025' }
                      : { backgroundColor: `${theme.color}20`, borderColor: `${theme.color}70` }
                  ) : undefined}
                  className={`relative group border rounded-xl p-2.5 transition-all flex items-center justify-between ${
                    isLocked 
                      ? 'bg-neutral-100/70 border-dashed border-neutral-300 opacity-60' 
                      : 'shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                      isLocked 
                        ? 'text-neutral-400' 
                        : theme.id === 'black' ? 'text-black' : theme.text
                    }`}>
                      {isLocked ? <Lock size={12} /> : <Sparkles size={13} />}
                    </div>
                    <span className={`text-xs font-bold truncate ${isLocked ? 'text-neutral-400' : 'text-neutral-900'}`}>
                      {isLocked ? `목표 ${index + 1}개 완료 시 잠금해제` : reward.text}
                    </span>
                  </div>

                  {!isLocked && (
                    <button 
                      onClick={() => onDeleteReward(reward.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-black/30 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Col 2, Row 3: REWARD Input */}
          <div className="relative self-end">
            <input 
              type="text"
              placeholder="나에게 줄 보상"
              className="block w-full h-7 box-border bg-neutral-50 border border-black/10 rounded-xl pl-3 pr-8 text-xs focus:bg-white focus:border-black outline-none transition-all"
              value={newRewardText}
              onChange={e => onNewRewardTextChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAddReward()}
            />
            <button 
              onClick={onAddReward}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
