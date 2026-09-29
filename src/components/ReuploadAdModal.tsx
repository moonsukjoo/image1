import React, { useEffect } from 'react';
import { RefreshCw, X, Sparkles, FolderOpen } from 'lucide-react';
import { AdUnit } from './AdUnit';
import { getAdSettings } from '../lib/store';

interface ReuploadAdModalProps {
  isOpen: boolean;
  onCloseAndReupload: () => void;
  onCancel: () => void;
  currentCount: number;
}

export function ReuploadAdModal({
  isOpen,
  onCloseAndReupload,
  onCancel,
  currentCount
}: ReuploadAdModalProps) {
  const adSettings = getAdSettings();
  const modalAd = adSettings.find(a => a.id === 'download-modal');
  const hasCustomCode = modalAd?.enabled && Boolean(modalAd?.code);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal dialog */}
      <div 
        role="dialog" 
        aria-modal="true" 
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden z-10 transition-all transform scale-100 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <RefreshCw size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg">이미지 다시 선택 (재업로드)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                기존에 선택한 {currentCount}개의 파일을 비우고 새로운 파일을 다시 선택합니다.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 -mr-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            title="취소"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sponsor / Ad content area */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[200px] bg-slate-50/30">
          <div className="w-full">
            <AdUnit slot="download-modal" height="h-44" className="w-full" />
            
            {!hasCustomCode && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden text-center my-2">
                <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  SPONSOR
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto mb-2.5">
                  <Sparkles size={20} />
                </div>
                <h4 className="font-bold text-base text-white tracking-tight">이미지 매직 (Image Magic)</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                  브라우저 로컬 고속 처리로 파일 유출 걱정 없이 안전하게 이미지를 변환하세요.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-indigo-300 font-semibold bg-indigo-900/50 px-3 py-1 rounded-full border border-indigo-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  무제한 무료 변환 & 압축 지원
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            취소하고 계속 작업하기
          </button>

          <button
            type="button"
            onClick={onCloseAndReupload}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FolderOpen size={17} />
            광고 닫기 및 파일 다시 선택
          </button>
        </div>
      </div>
    </div>
  );
}
