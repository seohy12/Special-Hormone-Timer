import React, { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Globe, 
  ShieldCheck, 
  AlertTriangle,
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AllowedSite, ThemeConfig } from '../types';
import { validateProductiveSiteUrl, checkIsBlocked } from '../blocker';

interface Props {
  allowedSites: AllowedSite[];
  onAddSite: (site: Omit<AllowedSite, 'id'>) => void;
  onUpdateSite: (id: string, site: Omit<AllowedSite, 'id'>) => void;
  onDeleteSite: (id: string) => void;
  theme: ThemeConfig;
  onBlockedAttempt: (url: string, reason: string) => void;
  layoutOrientation?: 'vertical' | 'horizontal';
}

export const SiteLauncherDock: React.FC<Props> = ({
  allowedSites,
  onAddSite,
  onUpdateSite,
  onDeleteSite,
  theme,
  onBlockedAttempt,
  layoutOrientation = 'vertical'
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<AllowedSite | null>(null);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Helper to open site directly in a dedicated window
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

  const getFaviconUrl = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  };

  const openAddModal = () => {
    setEditingSite(null);
    setNewSiteName('');
    setNewSiteUrl('');
    setValidationError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (site: AllowedSite) => {
    setEditingSite(site);
    setNewSiteName(site.name);
    setNewSiteUrl(site.url);
    setValidationError(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingSite(null);
    setNewSiteName('');
    setNewSiteUrl('');
    setValidationError(null);
  };

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteUrl.trim()) return;

    const validation = validateProductiveSiteUrl(newSiteUrl);
    if (!validation.valid) {
      setValidationError(validation.reason || '유효하지 않거나 차단된 주소입니다.');
      onBlockedAttempt(newSiteUrl, validation.reason || '차단된 사이트입니다.');
      return;
    }

    const sitePayload = {
      name: newSiteName.trim(),
      url: validation.normalizedUrl,
      domain: validation.hostname,
    };

    if (editingSite) {
      onUpdateSite(editingSite.id, sitePayload);
    } else {
      onAddSite(sitePayload);
    }

    closeModal();
  };

  return (
    <>
      <div className={`bg-white rounded-3xl p-4 border border-black/10 shadow-sm flex ${layoutOrientation === 'vertical' ? 'flex-col items-center gap-3 w-20' : 'items-center gap-3 flex-wrap'}`}>
        {/* Header Label */}
        <div className="flex flex-col items-center text-center">
          <div 
            style={theme.id !== 'black' ? { backgroundColor: `${theme.color}35` } : undefined}
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all shadow-xs ${
              theme.id === 'black' ? 'bg-neutral-900 text-white' : theme.text
            }`} 
            title="딴짓(SNS/유튜브 등) 차단 보호"
          >
            <ShieldCheck size={16} />
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
            바로가기
          </span>
        </div>

        <div className="w-8 h-[1px] bg-black/5" />

        {/* Sites Icons List */}
        <div className={`flex ${layoutOrientation === 'vertical' ? 'flex-col items-center gap-3' : 'items-center gap-3 flex-wrap'}`}>
          {allowedSites.map((site) => {
            const fav = getFaviconUrl(site.domain);

            return (
              <div key={site.id} className="relative group">
                <button
                  onClick={() => openDedicatedWindow(site.url)}
                  className="w-12 h-12 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 hover:border-neutral-400 p-2 flex items-center justify-center transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95 group/btn"
                  title={`${site.name} (${site.domain})`}
                >
                  <img
                    src={fav}
                    alt={site.name}
                    className="w-6 h-6 object-contain rounded-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Globe size={18} className="text-neutral-400 hidden group-hover/btn:inline" />
                </button>

                {/* Edit button on hover (replaces arrow badge) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(site);
                  }}
                  className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-neutral-900 hover:bg-neutral-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="수정"
                >
                  <Pencil size={9} strokeWidth={2.5} />
                </button>

                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSite(site.id);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neutral-800 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="삭제"
                >
                  <X size={10} strokeWidth={3} />
                </button>

                {/* Floating tooltip with site name */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-neutral-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
                    {site.name}
                    <span className="block text-[9px] text-neutral-400 font-normal">{site.domain}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Site '+' Button */}
          <button
            onClick={openAddModal}
            className="w-12 h-12 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-900 transition-all active:scale-95 group"
            title="새 학습/업무 사이트 추가"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {allowedSites.length === 0 && (
          <div className="text-[10px] text-neutral-400 text-center leading-tight py-2 max-w-[60px]">
            + 버튼을 눌러 사이트 추가
          </div>
        )}
      </div>

      {/* Add / Edit Site Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-black/10"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    {editingSite ? '사이트 바로가기 수정' : '새 사이트 바로가기 추가'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {editingSite ? '이름이나 링크를 수정할 수 있습니다.' : '타이머 옆에 아이콘으로 등록됩니다.'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Strict Distraction Policy Warning (only shown when user tries to register a blocked site) */}
              {validationError && (
                <div className="bg-red-50 border border-red-200/60 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-900 leading-snug">
                    <span className="font-bold block mb-0.5">SNS · 유튜브 · 핀터레스트 차단</span>
                    집중을 위해 인스타그램, 유튜브, 핀터레스트, 페이스북, 틱톡 등은 등록할 수 없습니다.
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveSite} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-neutral-700 mb-1 block">
                    사이트 이름 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="이름 입력"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    className="w-full bg-[#f9fafb] border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:border-black focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 mb-1 block">
                    웹사이트 주소 (URL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="주소 입력"
                    value={newSiteUrl}
                    onChange={(e) => {
                      setNewSiteUrl(e.target.value);
                      if (e.target.value.trim()) {
                        const check = checkIsBlocked(e.target.value);
                        if (check.isBlocked) {
                          setValidationError('🚫 차단 대상: SNS, 유튜브, 핀터레스트는 등록할 수 없습니다.');
                        } else {
                          setValidationError(null);
                        }
                      } else {
                        setValidationError(null);
                      }
                    }}
                    className={`w-full bg-[#f9fafb] border rounded-xl px-3.5 py-2 text-xs font-mono focus:bg-white outline-none transition-all ${
                      validationError ? 'border-red-500 bg-red-50/50 text-red-900' : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {validationError && (
                    <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                      <X size={12} />
                      {validationError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3.5 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={!!validationError || !newSiteName.trim() || !newSiteUrl.trim()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      validationError || !newSiteName.trim() || !newSiteUrl.trim()
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
                    }`}
                  >
                    {editingSite ? '수정 완료' : '등록하기'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
