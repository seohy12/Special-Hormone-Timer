import React from 'react';
import { X, Settings2, Trash2, Plus, Bell, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PomodoroMode, ThemeConfig, DDayConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isForcedMode: boolean;
  onToggleForcedMode: () => void;
  themes: ThemeConfig[];
  selectedTheme: string;
  onSelectTheme: (id: string) => void;
  sounds: Array<{ id: string; name: string; url: string }>;
  selectedSound: string;
  onSelectSound: (url: string) => void;
  modes: PomodoroMode[];
  editingMode: PomodoroMode | null;
  isNewMode: boolean;
  isIconPickerOpen: boolean;
  onStartEditMode: (mode: PomodoroMode) => void;
  onAddNewMode: () => void;
  onCancelEditMode: () => void;
  onUpdateMode: (mode: PomodoroMode) => void;
  onDeleteMode: (id: string) => void;
  setIsIconPickerOpen: (open: boolean) => void;
  setEditingMode: (mode: PomodoroMode | null) => void;
  iconMap: Record<string, any>;
  theme: ThemeConfig;
  dday: DDayConfig;
  onUpdateDDay: (dday: DDayConfig) => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isForcedMode,
  onToggleForcedMode,
  themes,
  selectedTheme,
  onSelectTheme,
  sounds,
  selectedSound,
  onSelectSound,
  modes,
  editingMode,
  isNewMode,
  isIconPickerOpen,
  onStartEditMode,
  onAddNewMode,
  onCancelEditMode,
  onUpdateMode,
  onDeleteMode,
  setIsIconPickerOpen,
  setEditingMode,
  iconMap,
  theme,
  dday,
  onUpdateDDay
}) => {
  const renderModeForm = () => {
    if (!editingMode) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              type="button"
              onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${theme.bg} ${selectedTheme === 'black' ? 'text-white' : 'text-black'} shadow-sm`}
            >
              {(() => {
                const Icon = iconMap[editingMode.icon] || Bell;
                return <Icon size={24} />;
              })()}
            </button>
            
            <AnimatePresence>
              {isIconPickerOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute top-14 left-0 z-[70] bg-white border border-black/10 rounded-2xl p-4 shadow-2xl w-64"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">아이콘 선택</span>
                    <button type="button" onClick={() => setIsIconPickerOpen(false)}><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-1">
                    {Object.keys(iconMap).map((iconKey) => {
                      const PickerIcon = iconMap[iconKey];
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => {
                            setEditingMode({...editingMode, icon: iconKey});
                            setIsIconPickerOpen(false);
                          }}
                          className={`p-2 rounded-lg flex items-center justify-center transition-all ${editingMode.icon === iconKey ? 'bg-black text-white' : 'hover:bg-black/5 text-black/40'}`}
                        >
                          <PickerIcon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-black/40 font-bold mb-1 block">모드 이름</label>
            <input 
              type="text" 
              value={editingMode.name}
              placeholder="과목 또는 작업명"
              onChange={e => setEditingMode({...editingMode, name: e.target.value})}
              className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm font-medium focus:border-black outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-black/40 font-bold mb-1 block">집중</label>
            <input 
              type="number" 
              value={editingMode.focusTime}
              onChange={e => setEditingMode({...editingMode, focusTime: parseInt(e.target.value) || 1})}
              className="w-full bg-white border border-black/10 rounded-lg px-2 py-1 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-black/40 font-bold mb-1 block">짧은 휴식</label>
            <input 
              type="number" 
              value={editingMode.shortBreakTime}
              onChange={e => setEditingMode({...editingMode, shortBreakTime: parseInt(e.target.value) || 1})}
              className="w-full bg-white border border-black/10 rounded-lg px-2 py-1 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-black/40 font-bold mb-1 block">긴 휴식</label>
            <input 
              type="number" 
              value={editingMode.longBreakTime}
              onChange={e => setEditingMode({...editingMode, longBreakTime: parseInt(e.target.value) || 1})}
              className="w-full bg-white border border-black/10 rounded-lg px-2 py-1 text-sm outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button 
            type="button"
            onClick={onCancelEditMode}
            className="px-3 py-1.5 text-xs font-semibold text-black/40 hover:text-black transition-colors"
          >
            취소
          </button>
          <button 
            type="button"
            onClick={() => onUpdateMode(editingMode)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg ${theme.bg} ${selectedTheme === 'black' ? 'text-white' : 'text-black'} shadow-sm`}
          >
            저장
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-black/10"
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-lg font-bold text-neutral-900">환경 설정</h2>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-neutral-500">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Force Mode Selection */}
              <div className="mb-6 p-4 bg-[#f9f9f9] rounded-2xl border border-black/5 flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold block text-neutral-900">강제 집중 모드</label>
                  <p className="text-[11px] text-black/50">휴식 후 3초 카운트다운 뒤 자동 시작</p>
                </div>
                <button 
                  type="button"
                  onClick={onToggleForcedMode}
                  className={`w-12 h-6 rounded-full transition-all relative ${isForcedMode ? theme.bg : 'bg-black/15'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isForcedMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Target D-Day Countdown Setting */}
              <div className="mb-6 p-4 bg-[#f9f9f9] rounded-2xl border border-black/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-neutral-700" />
                    <label className="text-sm font-bold block text-neutral-900">목표 D-Day 카운트다운</label>
                  </div>
                  <button 
                    type="button"
                    onClick={() => onUpdateDDay({ ...dday, enabled: !dday.enabled })}
                    className={`w-12 h-6 rounded-full transition-all relative ${dday.enabled ? theme.bg : 'bg-black/15'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${dday.enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {dday.enabled && (
                  <div className="space-y-3 pt-1 border-t border-black/5">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1 block">목표 명칭</label>
                      <input 
                        type="text" 
                        placeholder="목표 입력"
                        value={dday.title}
                        onChange={e => onUpdateDDay({ ...dday, title: e.target.value })}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-medium focus:border-black outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1 block">목표 날짜</label>
                      <input 
                        type="date" 
                        value={dday.date}
                        onChange={e => onUpdateDDay({ ...dday, date: e.target.value })}
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-medium focus:border-black outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Selection */}
              <div className="mb-6">
                <label className="text-[10px] uppercase tracking-widest text-black/50 font-bold mb-3 block">테마 색상</label>
                <div className="flex justify-between items-center">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onSelectTheme(t.id)}
                      className={`w-8 h-8 rounded-full transition-all transform active:scale-90 ${t.bg} ${selectedTheme === t.id ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Sound Selection */}
              <div className="mb-6">
                <label className="text-[10px] uppercase tracking-widest text-black/50 font-bold mb-3 block">알림 소리</label>
                <div className="grid grid-cols-5 gap-2">
                  {sounds.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onSelectSound(s.url)}
                      className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                        selectedSound === s.url 
                          ? `${theme.bg} ${selectedTheme === 'black' ? 'text-white' : 'text-black'} border-transparent` 
                          : 'bg-[#f5f5f5] border-transparent text-black/60 hover:bg-black/5'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modes Management */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-black/50 font-bold block">모드 관리</label>
                {modes.map(mode => (
                  <div key={mode.id} className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-black/5">
                    {editingMode?.id === mode.id && !isNewMode ? (
                      <div className="space-y-3">
                        {renderModeForm()}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.bg} ${selectedTheme === 'black' ? 'text-white' : 'text-black'}`}>
                            {(() => {
                              const Icon = iconMap[mode.icon] || Bell;
                              return <Icon size={16} />;
                            })()}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-neutral-900">{mode.name}</h3>
                            <p className="text-xs text-black/40">{mode.focusTime}분 / {mode.shortBreakTime}분 / {mode.longBreakTime}분</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            type="button"
                            onClick={() => onStartEditMode(mode)}
                            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-black/60"
                          >
                            <Settings2 size={16} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => onDeleteMode(mode.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isNewMode && editingMode && (
                  <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-black/20 shadow-md">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">새 모드 작성</p>
                      {renderModeForm()}
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="button"
                onClick={onAddNewMode}
                className="w-full mt-5 py-3.5 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center gap-2 text-black/50 hover:text-black hover:border-black/30 transition-all text-xs font-bold"
              >
                <Plus size={16} />
                새로운 모드 추가
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
