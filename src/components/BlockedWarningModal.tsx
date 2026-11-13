import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  attemptedUrl?: string;
  reason?: string;
}

export const BlockedWarningModal: React.FC<Props> = ({
  isOpen,
  onClose,
  attemptedUrl,
  reason
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-red-100 text-center relative overflow-hidden"
          >
            {/* Red accent top band */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-black/30 hover:text-black rounded-full hover:bg-black/5 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldAlert size={34} />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-red-950 mb-2">
              집중 방해 사이트 차단
            </h3>
            
            <p className="text-sm font-semibold text-red-600 mb-4">
              SNS · 유튜브 · 핀터레스트 등은 등록/접속할 수 없습니다.
            </p>

            {attemptedUrl && (
              <div className="bg-red-50/80 border border-red-200/60 rounded-xl p-3 mb-4 text-xs font-mono text-red-800 break-all">
                {attemptedUrl}
              </div>
            )}

            <p className="text-xs text-black/60 leading-relaxed mb-6">
              {reason || '이 워크스페이스는 온전한 집중을 위해 설계되었습니다. 학업, 연구, 독서, 업무에 직접 도움이 되는 사이트만 승인하여 추가할 수 있습니다.'}
            </p>

            <div className="bg-neutral-50 rounded-2xl p-4 text-left border border-black/5 mb-6 text-xs text-black/70 space-y-1.5">
              <div className="font-bold text-black/90 mb-1">💡 추천하는 허용 사이트 예시:</div>
              <div>• 대학교/학교 LMS (방송통신대 e-루리, 대학 도서관)</div>
              <div>• 생산성 문서 도구 (Notion, Google Docs, GitHub)</div>
              <div>• 학술 연구 및 논문 검색 (RISS, 국립중앙도서관, DBpia)</div>
              <div>• 번역 및 사전 (Papago, DeepL, 위키백과)</div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-[0.98]"
            >
              확인하고 집중 계속하기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
