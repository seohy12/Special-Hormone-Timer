import React from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Session, ThemeConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  historyDate: Date;
  historyView: 'day' | 'month';
  onSetHistoryView: (view: 'day' | 'month') => void;
  onNavigateHistory: (direction: number) => void;
  onDeleteSession: (id: string) => void;
  theme: ThemeConfig;
}

export const HistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sessions,
  historyDate,
  historyView,
  onSetHistoryView,
  onNavigateHistory,
  onDeleteSession,
  theme
}) => {
  const filteredSessions = sessions.filter(s => {
    const d = new Date(s.date);
    if (historyView === 'day') {
      return d.getFullYear() === historyDate.getFullYear() &&
             d.getMonth() === historyDate.getMonth() &&
             d.getDate() === historyDate.getDate();
    } else {
      return d.getFullYear() === historyDate.getFullYear() &&
             d.getMonth() === historyDate.getMonth();
    }
  });

  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const formatDateLabel = () => {
    if (historyView === 'day') {
      return historyDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return historyDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
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
              <h2 className="text-lg font-bold text-neutral-900">집중 통계 및 기록</h2>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-neutral-500">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* View Toggle */}
              <div className="flex bg-[#f5f5f5] p-1 rounded-xl mb-5">
                <button 
                  onClick={() => onSetHistoryView('day')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${historyView === 'day' ? 'bg-white shadow-sm text-neutral-900' : 'text-black/50'}`}
                >
                  일별
                </button>
                <button 
                  onClick={() => onSetHistoryView('month')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${historyView === 'month' ? 'bg-white shadow-sm text-neutral-900' : 'text-black/50'}`}
                >
                  월별
                </button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => onNavigateHistory(-1)} className="p-2 hover:bg-black/5 rounded-full text-neutral-600">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-900">
                  <CalendarIcon size={16} className="text-black/40" />
                  {formatDateLabel()}
                </div>
                <button onClick={() => onNavigateHistory(1)} className="p-2 hover:bg-black/5 rounded-full text-neutral-600">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#f9f9f9] p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold mb-1">집중 횟수</p>
                  <p className="text-2xl font-light tracking-tight text-neutral-900">{filteredSessions.length}<span className="text-sm font-medium ml-1">회</span></p>
                </div>
                <div className="bg-[#f9f9f9] p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold mb-1">총 집중 시간</p>
                  <p className={`text-2xl font-light tracking-tight ${theme.text}`}>
                    {totalHours > 0 ? (
                      <>
                        {totalHours}<span className="text-xs font-medium mx-0.5">시간</span>
                        {remainingMinutes}<span className="text-xs font-medium ml-0.5">분</span>
                      </>
                    ) : (
                      <>
                        {totalMinutes}<span className="text-xs font-medium ml-0.5">분</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Session List */}
              <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-black/30 italic text-xs">기록이 없습니다.</div>
                ) : (
                  filteredSessions.slice().reverse().map(session => (
                    <div key={session.id} className="flex justify-between items-center p-2.5 rounded-xl border border-black/5 text-xs group hover:bg-[#fafafa]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${theme.bg}`} />
                        <span className="font-semibold text-neutral-900">{session.modeName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-black/40 text-[11px]">
                          {new Date(session.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`font-bold ${theme.text}`}>{session.duration}분</span>
                        <button 
                          onClick={() => onDeleteSession(session.id)}
                          className="p-1 text-black/30 hover:text-red-500 transition-all"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
