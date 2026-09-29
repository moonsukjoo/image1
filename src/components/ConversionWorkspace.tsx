import React from 'react';
import { 
  Check, ArrowRight, Download, Trash2, RefreshCw, FileArchive, 
  Loader2, CheckCircle, AlertCircle, FileText, FileImage, 
  Sliders, Maximize, FileSpreadsheet, Sparkles, Layers, ArrowRightLeft, Upload
} from 'lucide-react';
import { 
  DndContext, closestCenter, DragEndEvent 
} from '@dnd-kit/core';
import { 
  SortableContext, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileItem, AppSettings } from '../types';
import { cn, formatSize } from '../lib/utils';
import { AdUnit } from './AdUnit';
import { SupportedLocale, getTranslations } from '../lib/i18n';
import { InteractiveLiveEditor } from './InteractiveLiveEditor';

interface ConversionWorkspaceProps {
  files: FileItem[];
  targetFormat: string;
  setTargetFormat: (f: string) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isProcessing: boolean;
  onProcess: () => void;
  onProcessSingle: (id: string) => void;
  onResetFile: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onTriggerReupload: () => void;
  onTriggerSingleDownload: (file: FileItem) => void;
  onTriggerPdfDownload: () => void;
  onDownloadAllZip: () => void;
  onDownloadAllIndividual: () => void;
  pdfResult: { blob: Blob; url: string; size: number } | null;
  getRootProps: any;
  getInputProps: any;
  sensors: any;
  onDragEnd: (event: DragEndEvent) => void;
  getTargetExt: (file: FileItem) => string;
  locale?: SupportedLocale;
}

function SortableItem({ file, onRemove }: { file: FileItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const ext = file.originalFile.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs"
    >
      <div className="flex items-center gap-3 min-w-0" {...attributes} {...listeners}>
        <span className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing text-xs px-1 select-none">☰</span>
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center shrink-0 font-extrabold text-xs text-blue-700">
          {ext}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{file.originalFile.name}</p>
          <p className="text-xs text-slate-400">{formatSize(file.originalSize)}</p>
        </div>
      </div>
      <button 
        type="button"
        onClick={() => onRemove(file.id)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        title="삭제"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export const ConversionWorkspace: React.FC<ConversionWorkspaceProps> = ({
  files,
  targetFormat,
  setTargetFormat,
  settings,
  setSettings,
  isProcessing,
  onProcess,
  onProcessSingle,
  onResetFile,
  onRemoveFile,
  onClearAll,
  onTriggerReupload,
  onTriggerSingleDownload,
  onTriggerPdfDownload,
  onDownloadAllZip,
  onDownloadAllIndividual,
  pdfResult,
  getRootProps,
  getInputProps,
  sensors,
  onDragEnd,
  getTargetExt,
  locale = 'ko'
}) => {
  const t = getTranslations(locale);
  const hasPdfs = files.some(f => f.originalFile.type === 'application/pdf' || f.originalFile.name.toLowerCase().endsWith('.pdf'));
  const successCount = files.filter(f => f.status === 'success').length;
  const isAllSuccess = files.length > 0 && files.every(f => f.status === 'success');

  const standardFormats = [
    { id: 'png', name: 'PNG', badge: locale === 'ko' ? '고화질·투명' : 'Lossless', desc: locale === 'ko' ? '무손실 투명 배경 지원' : 'Lossless transparent support' },
    { id: 'jpg', name: 'JPG', badge: locale === 'ko' ? '표준 호환성' : 'Standard', desc: locale === 'ko' ? '가장 널리 쓰이는 표준 형식' : 'Universal photo format' },
    { id: 'webp', name: 'WEBP', badge: locale === 'ko' ? '초경량 웹' : 'Ultra-light', desc: locale === 'ko' ? '구글 권장 고효율 포맷' : 'Next-gen high efficiency' },
    { id: 'compress', name: locale === 'ko' ? '용량 압축' : 'Compress', badge: locale === 'ko' ? '최적화' : 'Optimize', desc: locale === 'ko' ? '화질 유지 용량 다이어트' : 'Reduce file size smartly' },
    { id: 'resize', name: locale === 'ko' ? '크기 조절' : 'Resize', badge: locale === 'ko' ? '해상도' : 'Dimensions', desc: locale === 'ko' ? '가로/세로 픽셀 크기 조절' : 'Change width & height pixels' },
    { id: 'crop', name: locale === 'ko' ? '잘라내기' : 'Crop', badge: locale === 'ko' ? '크롭' : 'Crop', desc: locale === 'ko' ? '비율 및 영역 잘라내기' : 'Trim unwanted photo areas' },
    { id: 'rotate', name: locale === 'ko' ? '회전·반전' : 'Rotate', badge: locale === 'ko' ? '방향' : 'Orient', desc: locale === 'ko' ? '90° 회전 및 거울 반전' : '90° rotate and flip' },
    { id: 'photo-editor', name: locale === 'ko' ? '포토 에디터' : 'Editor', badge: locale === 'ko' ? '필터' : 'Filter', desc: locale === 'ko' ? '밝기, 대비, 흑백, 블러' : 'Adjust colors & filters' },
    { id: 'watermark', name: locale === 'ko' ? '워터마크' : 'Watermark', badge: locale === 'ko' ? '보호' : 'Brand', desc: locale === 'ko' ? '텍스트 서명 삽입' : 'Add text signature/logo' },
    { id: 'blur-face', name: locale === 'ko' ? '얼굴 흐리기' : 'Mosaic', badge: locale === 'ko' ? '프라이버시' : 'Privacy', desc: locale === 'ko' ? '모자이크 블러 처리' : 'Conceal faces & numbers' },
    { id: 'remove-bg', name: locale === 'ko' ? '배경 제거' : 'Remove BG', badge: locale === 'ko' ? '누끼' : 'Cutout', desc: locale === 'ko' ? '투명 PNG 배경 분리' : 'Create transparent PNG' },
    { id: 'meme', name: locale === 'ko' ? '밈 만들기' : 'Meme', badge: locale === 'ko' ? '짤 생성' : 'Meme', desc: locale === 'ko' ? '자막 텍스트 밈 생성' : 'Impact caption maker' },
    { id: 'upscale', name: locale === 'ko' ? '업스케일' : 'Upscale', badge: locale === 'ko' ? '고해상도' : 'SuperRes', desc: locale === 'ko' ? '2x, 4x 해상도 확대' : 'Enlarge 2x, 4x cleanly' },
    { id: 'pdf', name: 'PDF', badge: locale === 'ko' ? '문서화' : 'Document', desc: locale === 'ko' ? '이미지들을 단일 PDF로' : 'Merge images into single PDF' },
  ];

  const pdfFormats = [
    { id: 'pdf-to-jpg', name: 'PDF → JPG', badge: locale === 'ko' ? '추출' : 'Extract', desc: locale === 'ko' ? '모든 페이지를 JPG로 추출' : 'Extract pages as JPG images' },
    { id: 'pdf-to-png', name: 'PDF → PNG', badge: locale === 'ko' ? '고화질 추출' : 'HD Extract', desc: locale === 'ko' ? '투명도 및 선명한 텍스트' : 'Crisp text & lossless PNG' },
  ];

  const currentFormats = hasPdfs ? pdfFormats : standardFormats;

  return (
    <div className="space-y-6">
      {/* 3-Step Flow Visual Progress Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {locale === 'ko' ? '1단계 완료' : 'Step 1 Done'}
                </span>
                <Check size={14} className="text-emerald-500 stroke-[3]" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {locale === 'ko' ? `파일 ${files.length}개 업로드됨` : `${files.length} files uploaded`}
              </h4>
            </div>
          </div>

          <div className="hidden md:block w-8 h-px bg-slate-200" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              2
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {locale === 'ko' ? '2단계 진행 중' : 'Step 2 Active'}
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                {locale === 'ko' ? '변환 포맷 선택 & 작업 진행' : 'Select Format & Convert'}
              </h4>
            </div>
          </div>

          <div className="hidden md:block w-8 h-px bg-slate-200" />

          <div className="flex items-center gap-3 opacity-90">
            <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm", isAllSuccess ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-400")}>
              3
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {locale === 'ko' ? '3단계' : 'Step 3'}
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                {isAllSuccess 
                  ? (locale === 'ko' ? '다운로드 준비 완료' : 'Ready for Download') 
                  : (locale === 'ko' ? '변환 후 다운로드' : 'Download Output')}
              </h4>
            </div>
          </div>

          {/* Action buttons: Reupload, add more, clear */}
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end flex-wrap">
            <button 
              type="button" 
              onClick={onTriggerReupload}
              className="px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw size={13} /> {locale === 'ko' ? '이미지 재업로드' : 'Re-upload'}
            </button>
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <button 
                type="button" 
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={13} /> {t.addMore}
              </button>
            </div>
            <button 
              type="button"
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} /> {t.clearAll}
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Format Selector Box */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
              {locale === 'ko' ? '어떤 형식의 파일로 바꿀까요?' : 'Select target output format'}
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {locale === 'ko' ? `현재 선택: ${targetFormat.toUpperCase()}` : `Selected: ${targetFormat.toUpperCase()}`}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            {locale === 'ko' 
              ? '원하는 변환 포맷을 선택하신 후 아래 [작업 진행하기] 버튼을 클릭하세요.' 
              : 'Choose your desired format and click Start Batch Processing below.'}
          </p>
        </div>

        {/* Format Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {currentFormats.map(fmt => {
            const isSelected = targetFormat === fmt.id || (targetFormat === 'pdf-to-image' && fmt.id === 'pdf-to-jpg');
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setTargetFormat(fmt.id)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 relative group flex flex-col justify-between",
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/60"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("text-base font-extrabold", isSelected ? "text-blue-700" : "text-slate-800")}>
                      {fmt.name}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md",
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {fmt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {fmt.desc}
                  </p>
                </div>
                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                    <Check size={12} className="stroke-[3]" /> {locale === 'ko' ? '선택됨' : 'Selected'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Real-time Interactive Live Editor & Preview on user's uploaded image */}
        {['photo-editor', 'watermark', 'blur-face', 'remove-bg', 'meme', 'rotate', 'crop', 'resize', 'upscale'].includes(targetFormat) && (
          <div className="mb-6">
            <InteractiveLiveEditor
              files={files}
              targetFormat={targetFormat}
              settings={settings}
              setSettings={setSettings}
              locale={locale}
            />
          </div>
        )}

        {/* Settings for selected format */}
        {targetFormat === 'compress' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700">{t.quality}</label>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {settings.compressQuality}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={settings.compressQuality}
              onChange={(e) => setSettings(s => ({ ...s, compressQuality: Number(e.target.value) }))}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>{locale === 'ko' ? '최대 압축 (초경량)' : 'Max Compression'}</span>
              <span>{locale === 'ko' ? '권장 (80%)' : 'Recommended (80%)'}</span>
              <span>{locale === 'ko' ? '최고 화질 유지' : 'High Quality'}</span>
            </div>
          </div>
        )}

        {targetFormat === 'resize' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.width}</label>
                <input
                  type="number"
                  value={settings.resizeWidth || ''}
                  onChange={(e) => setSettings(s => ({ ...s, resizeWidth: Math.max(1, Number(e.target.value)) }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="Width (px)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.height}</label>
                <input
                  type="number"
                  value={settings.resizeHeight || ''}
                  onChange={(e) => setSettings(s => ({ ...s, resizeHeight: Math.max(1, Number(e.target.value)) }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="Height (px)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.targetFormat}</label>
                <select
                  value={settings.resizeFormat}
                  onChange={(e) => setSettings(s => ({ ...s, resizeFormat: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="image/jpeg">JPG / JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WEBP</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {targetFormat === 'pdf' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.pdfPageSize}</label>
                <select
                  value={settings.pdfPageSize}
                  onChange={(e) => setSettings(s => ({ ...s, pdfPageSize: e.target.value as any }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="a4">A4</option>
                  <option value="letter">US Letter</option>
                  <option value="fit">{locale === 'ko' ? '원본 이미지 크기 맞춤' : 'Auto-fit to Image'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.pdfOrientation}</label>
                <select
                  value={settings.pdfOrientation}
                  onChange={(e) => setSettings(s => ({ ...s, pdfOrientation: e.target.value as any }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="portrait">{t.portrait}</option>
                  <option value="landscape">{t.landscape}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.pdfMargin}</label>
                <select
                  value={settings.pdfMargin}
                  onChange={(e) => setSettings(s => ({ ...s, pdfMargin: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="0">{locale === 'ko' ? '여백 없음 (0px)' : 'No Margin (0px)'}</option>
                  <option value="20">{locale === 'ko' ? '보통 여백 (20px)' : 'Standard (20px)'}</option>
                  <option value="40">{locale === 'ko' ? '넓은 여백 (40px)' : 'Wide (40px)'}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Crop Settings */}
        {targetFormat === 'crop' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {locale === 'ko' ? '자르기 비율 선택' : 'Select Crop Aspect Ratio'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: '1:1', label: '1:1 정사각형', sub: '인스타그램' },
                { id: '16:9', label: '16:9 와이드', sub: '유튜브/가로' },
                { id: '4:3', label: '4:3 표준', sub: '일반 사진' },
                { id: '9:16', label: '9:16 숏폼', sub: '릴스/쇼츠' },
                { id: 'free', label: '자유 영역', sub: '맞춤 비율' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, cropRatio: r.id as any }))}
                  className={cn(
                    "p-2.5 text-center rounded-xl border transition-all text-xs cursor-pointer",
                    settings.cropRatio === r.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 font-medium"
                  )}
                >
                  <div className="font-bold">{r.label}</div>
                  <div className={cn("text-[10px]", settings.cropRatio === r.id ? "text-blue-100" : "text-slate-400")}>{r.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rotate & Flip Settings */}
        {targetFormat === 'rotate' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {locale === 'ko' ? '회전 각도' : 'Rotation Angle'}
                </label>
                <div className="flex gap-2">
                  {[0, 90, 180, 270].map(deg => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, rotateAngle: deg }))}
                      className={cn(
                        "flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        settings.rotateAngle === deg
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                      )}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {locale === 'ko' ? '반전 (거울 뒤집기)' : 'Mirror Flip'}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings(s => ({ ...s, flipH: !s.flipH }))}
                    className={cn(
                      "flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      settings.flipH
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                    )}
                  >
                    {locale === 'ko' ? '좌우 반전 ↔' : 'Flip Horizontal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings(s => ({ ...s, flipV: !s.flipV }))}
                    className={cn(
                      "flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      settings.flipV
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                    )}
                  >
                    {locale === 'ko' ? '상하 반전 ↕' : 'Flip Vertical'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Editor Settings */}
        {targetFormat === 'photo-editor' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{locale === 'ko' ? '밝기 (Brightness)' : 'Brightness'}</span>
                  <span>{settings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="170"
                  value={settings.brightness}
                  onChange={(e) => setSettings(s => ({ ...s, brightness: Number(e.target.value) }))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{locale === 'ko' ? '대비 (Contrast)' : 'Contrast'}</span>
                  <span>{settings.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="170"
                  value={settings.contrast}
                  onChange={(e) => setSettings(s => ({ ...s, contrast: Number(e.target.value) }))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{locale === 'ko' ? '채도 (Saturation)' : 'Saturation'}</span>
                  <span>{settings.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.saturation}
                  onChange={(e) => setSettings(s => ({ ...s, saturation: Number(e.target.value) }))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, grayscale: !s.grayscale }))}
                className={cn("px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all", settings.grayscale ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200")}
              >
                {locale === 'ko' ? '흑백 모드' : 'Grayscale'}
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, sepia: !s.sepia }))}
                className={cn("px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all", settings.sepia ? "bg-amber-700 text-white border-amber-700" : "bg-white text-slate-700 border-slate-200")}
              >
                {locale === 'ko' ? '빈티지 세피아' : 'Sepia'}
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, invert: !s.invert }))}
                className={cn("px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all", settings.invert ? "bg-purple-700 text-white border-purple-700" : "bg-white text-slate-700 border-slate-200")}
              >
                {locale === 'ko' ? '색상 반전' : 'Invert'}
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, brightness: 100, contrast: 100, saturation: 100, grayscale: false, sepia: false, invert: false }))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer ml-auto"
              >
                {locale === 'ko' ? '필터 초기화' : 'Reset'}
              </button>
            </div>
          </div>
        )}

        {/* Watermark Settings */}
        {targetFormat === 'watermark' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {locale === 'ko' ? '워터마크 텍스트' : 'Watermark Text'}
                </label>
                <input
                  type="text"
                  value={settings.watermarkText}
                  onChange={(e) => setSettings(s => ({ ...s, watermarkText: e.target.value }))}
                  placeholder="© 2025 Image Magic"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {locale === 'ko' ? '워터마크 위치' : 'Watermark Position'}
                </label>
                <select
                  value={settings.watermarkPosition}
                  onChange={(e) => setSettings(s => ({ ...s, watermarkPosition: e.target.value as any }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="bottom-right">{locale === 'ko' ? '우측 하단 (권장)' : 'Bottom Right'}</option>
                  <option value="center">{locale === 'ko' ? '중앙' : 'Center'}</option>
                  <option value="bottom-left">{locale === 'ko' ? '좌측 하단' : 'Bottom Left'}</option>
                  <option value="top-right">{locale === 'ko' ? '우측 상단' : 'Top Right'}</option>
                  <option value="top-left">{locale === 'ko' ? '좌측 상단' : 'Top Left'}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{locale === 'ko' ? '투명도' : 'Opacity'}</span>
                  <span>{Math.round(settings.watermarkOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.watermarkOpacity}
                  onChange={(e) => setSettings(s => ({ ...s, watermarkOpacity: Number(e.target.value) }))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{locale === 'ko' ? '글자 크기' : 'Font Size'}</span>
                  <span>{settings.watermarkSize}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="72"
                  step="2"
                  value={settings.watermarkSize}
                  onChange={(e) => setSettings(s => ({ ...s, watermarkSize: Number(e.target.value) }))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Blur Face Settings */}
        {targetFormat === 'blur-face' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700">{locale === 'ko' ? '모자이크 & 블러 강도' : 'Mosaic Intensity'}</label>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {settings.mosaicIntensity}px
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="2"
              value={settings.mosaicIntensity}
              onChange={(e) => setSettings(s => ({ ...s, mosaicIntensity: Number(e.target.value) }))}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>{locale === 'ko' ? '가벼운 블러' : 'Light Blur'}</span>
              <span>{locale === 'ko' ? '강력한 모자이크 (얼굴/번호판 차단)' : 'Heavy Mosaic Shield'}</span>
            </div>
          </div>
        )}

        {/* Remove Background Settings */}
        {targetFormat === 'remove-bg' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700">{locale === 'ko' ? '배경 감지 허용 오차 (민감도)' : 'Background Color Tolerance'}</label>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {settings.removeBgTolerance}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="2"
              value={settings.removeBgTolerance}
              onChange={(e) => setSettings(s => ({ ...s, removeBgTolerance: Number(e.target.value) }))}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>{locale === 'ko' ? '정밀 단색 분리' : 'Exact match'}</span>
              <span>{locale === 'ko' ? '광범위 배경 분리 (투명 PNG 생성)' : 'Wide match (Transparent PNG)'}</span>
            </div>
          </div>
        )}

        {/* Meme Generator Settings */}
        {targetFormat === 'meme' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{locale === 'ko' ? '상단 자막 (Top Text)' : 'Top Caption'}</label>
                <input
                  type="text"
                  value={settings.memeTopText}
                  onChange={(e) => setSettings(s => ({ ...s, memeTopText: e.target.value }))}
                  placeholder="WHAT IF I TOLD YOU"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{locale === 'ko' ? '하단 자막 (Bottom Text)' : 'Bottom Caption'}</label>
                <input
                  type="text"
                  value={settings.memeBottomText}
                  onChange={(e) => setSettings(s => ({ ...s, memeBottomText: e.target.value }))}
                  placeholder="IT'S 100% FREE AND FAST"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{locale === 'ko' ? '자막 글씨 크기' : 'Caption Font Size'}</span>
                <span>{settings.memeFontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="2"
                value={settings.memeFontSize}
                onChange={(e) => setSettings(s => ({ ...s, memeFontSize: Number(e.target.value) }))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Upscale Settings */}
        {targetFormat === 'upscale' && (
          <div className="mb-6 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {locale === 'ko' ? '업스케일 해상도 배율 선택' : 'Select Upscale Factor'}
            </label>
            <div className="flex gap-3">
              {[
                { factor: 2, label: '2X 해상도 확대', sub: '2배 선명화 (권장)' },
                { factor: 4, label: '4X 울트라 HD', sub: '4배 초고화질 확대' }
              ].map(item => (
                <button
                  key={item.factor}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, upscaleFactor: item.factor as any }))}
                  className={cn(
                    "flex-1 p-3 rounded-xl border text-center transition-all cursor-pointer",
                    settings.upscaleFactor === item.factor
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                  )}
                >
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className={cn("text-xs mt-0.5", settings.upscaleFactor === item.factor ? "text-blue-100" : "text-slate-400")}>{item.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Button to Start Process */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-500" />
            <span>
              {locale === 'ko' 
                ? `선택한 포맷 ${targetFormat.toUpperCase()}(으)로 일괄 처리됩니다.` 
                : `Batch conversion to ${targetFormat.toUpperCase()}`}
            </span>
          </div>

          <button
            type="button"
            onClick={onProcess}
            disabled={isProcessing}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm md:text-base rounded-2xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{t.converting}</span>
              </>
            ) : (
              <>
                <ArrowRight size={18} />
                <span>{t.convertAll} ({targetFormat.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF Merged Result Box */}
      {targetFormat === 'pdf' && pdfResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {locale === 'ko' ? '단일 PDF 병합 완료!' : 'PDF Merge Complete!'}
              </h4>
              <p className="text-xs text-slate-600">
                {locale === 'ko' 
                  ? `${files.length}장의 이미지가 하나의 PDF 문서로 병합되었습니다. (${formatSize(pdfResult.size)})`
                  : `${files.length} images combined into one PDF document. (${formatSize(pdfResult.size)})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onTriggerPdfDownload}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>{locale === 'ko' ? 'PDF 다운로드' : 'Download PDF'}</span>
          </button>
        </div>
      )}

      {/* Files List & Per-Item Status */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h4 className="text-base font-extrabold text-slate-900">
              {t.fileListTitle} ({files.length})
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              {t.completed}: {successCount} / {files.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTriggerReupload}
              className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw size={13} /> {locale === 'ko' ? '이미지 재업로드' : 'Re-upload'}
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {targetFormat === 'pdf' ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                {files.map(file => (
                  <SortableItem key={file.id} file={file} onRemove={onRemoveFile} />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            files.map(file => {
              const targetExt = getTargetExt(file);
              const originalExt = file.originalFile.name.split('.').pop()?.toUpperCase() || 'FILE';
              return (
                <div 
                  key={file.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl transition-all hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center shrink-0 font-extrabold text-xs text-blue-700">
                      {originalExt}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">{file.fileName || file.originalFile.name}</p>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5 flex-wrap">
                        <span>{t.original}: {formatSize(file.originalSize)}</span>
                        {file.resultSize && (
                          <>
                            <ArrowRight size={12} className="text-slate-400" />
                            <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {formatSize(file.resultSize)}
                            </span>
                            {file.resultSize < file.originalSize ? (
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                ({Math.round((1 - file.resultSize / file.originalSize) * 100)}% {t.saved})
                              </span>
                            ) : file.resultSize === file.originalSize ? (
                              <span className="text-[10px] text-slate-500 font-semibold">
                                ({locale === 'ko' ? '용량 동일' : 'Same size'})
                              </span>
                            ) : (
                              <span className="text-[10px] text-indigo-600 font-semibold">
                                ({locale === 'ko' ? '고화질 유지' : 'High Quality'})
                              </span>
                            )}
                          </>
                        )}
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold uppercase text-slate-600">{t.targetFormat}: {targetExt}</span>
                      </div>

                      {/* Progress bar if processing */}
                      {file.status === 'processing' && (
                        <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-200" 
                            style={{ width: `${file.progress}%` }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for single file */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    {file.status === 'idle' && (
                      <button
                        type="button"
                        onClick={() => onProcessSingle(file.id)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
                      >
                        {locale === 'ko' ? '변환' : 'Convert'}
                      </button>
                    )}

                    {file.status === 'success' && file.resultBlob && (
                      <button
                        type="button"
                        onClick={() => onTriggerSingleDownload(file)}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                      >
                        <Download size={14} />
                        <span>{t.downloadBtn}</span>
                      </button>
                    )}

                    {file.status === 'error' && (
                      <span className="text-xs text-red-500 font-medium">{t.failed}</span>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveFile(file.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Batch Download Bar */}
        {successCount > 0 && targetFormat !== 'pdf' && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {locale === 'ko' 
                ? `${successCount}개의 파일이 성공적으로 변환되었습니다.` 
                : `${successCount} files converted successfully.`}
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {successCount > 1 && (
                <button
                  type="button"
                  onClick={onDownloadAllZip}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <FileArchive size={16} />
                  <span>{t.downloadAllZip}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onDownloadAllIndividual}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20"
              >
                <Download size={16} />
                <span>{locale === 'ko' ? '전체 다운로드' : 'Download All'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workspace Ad Unit */}
      <AdUnit slot="content-bottom" height="h-24 md:h-32" />
    </div>
  );
};
