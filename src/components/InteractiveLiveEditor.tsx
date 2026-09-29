import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Download, Sparkles, RefreshCw, Eye, Maximize2, ZoomIn, ZoomOut, 
  RotateCw, FlipHorizontal, FlipVertical, Crop, Stamp, SlidersHorizontal, 
  EyeOff, Scissors, MessageSquare, Check, Layers, Palette, Undo2, SunMedium
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { FileItem, AppSettings } from '../types';
import { cn, formatSize } from '../lib/utils';
import { SupportedLocale } from '../lib/i18n';
import { addProcessLog } from '../lib/store';

interface InteractiveLiveEditorProps {
  files: FileItem[];
  targetFormat: string;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onSingleDownloadDirect?: (blob: Blob, filename: string) => void;
  locale?: SupportedLocale;
}

export const InteractiveLiveEditor: React.FC<InteractiveLiveEditorProps> = ({
  files,
  targetFormat,
  settings,
  setSettings,
  onSingleDownloadDirect,
  locale = 'ko'
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [bgPreviewColor, setBgPreviewColor] = useState<'transparent' | 'white' | 'black'>('transparent');

  const currentFile = files[selectedIndex] || files[0];

  // Live rendering engine using HTML Canvas
  const renderLivePreview = useCallback(async () => {
    if (!currentFile || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(currentFile.originalFile);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = objectUrl;
      });

      URL.revokeObjectURL(objectUrl);

      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;

      // Handle each interactive tool type
      if (targetFormat === 'crop') {
        let cropW = srcW;
        let cropH = srcH;
        let startX = 0;
        let startY = 0;

        if (settings.cropRatio === '1:1') {
          const side = Math.min(srcW, srcH);
          cropW = side;
          cropH = side;
          startX = (srcW - side) / 2;
          startY = (srcH - side) / 2;
        } else if (settings.cropRatio === '16:9') {
          if (srcW / srcH > 16 / 9) {
            cropH = srcH;
            cropW = Math.round(srcH * (16 / 9));
            startX = (srcW - cropW) / 2;
          } else {
            cropW = srcW;
            cropH = Math.round(srcW * (9 / 16));
            startY = (srcH - cropH) / 2;
          }
        } else if (settings.cropRatio === '4:3') {
          if (srcW / srcH > 4 / 3) {
            cropH = srcH;
            cropW = Math.round(srcH * (4 / 3));
            startX = (srcW - cropW) / 2;
          } else {
            cropW = srcW;
            cropH = Math.round(srcW * (3 / 4));
            startY = (srcH - cropH) / 2;
          }
        } else if (settings.cropRatio === '9:16') {
          if (srcW / srcH > 9 / 16) {
            cropH = srcH;
            cropW = Math.round(srcH * (9 / 16));
            startX = (srcW - cropW) / 2;
          } else {
            cropW = srcW;
            cropH = Math.round(srcW * (16 / 9));
            startY = (srcH - cropH) / 2;
          }
        }

        canvas.width = Math.max(1, cropW);
        canvas.height = Math.max(1, cropH);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);

        // Draw subtle rule-of-thirds guideline overlay
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(cropW / 3, 0, 0, cropH);
        ctx.strokeRect((cropW * 2) / 3, 0, 0, cropH);
        ctx.strokeRect(0, cropH / 3, cropW, 0);
        ctx.strokeRect(0, (cropH * 2) / 3, cropW, 0);
        ctx.restore();

      } else if (targetFormat === 'rotate') {
        const angle = settings.rotateAngle || 0;
        const rad = (angle * Math.PI) / 180;
        const is90or270 = angle === 90 || angle === 270;
        canvas.width = is90or270 ? srcH : srcW;
        canvas.height = is90or270 ? srcW : srcH;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.scale(settings.flipH ? -1 : 1, settings.flipV ? -1 : 1);
        ctx.drawImage(img, -srcW / 2, -srcH / 2);
        ctx.restore();

      } else if (targetFormat === 'photo-editor') {
        canvas.width = srcW;
        canvas.height = srcH;
        ctx.clearRect(0, 0, srcW, srcH);

        const filters: string[] = [];
        if (settings.brightness !== 100) filters.push(`brightness(${settings.brightness}%)`);
        if (settings.contrast !== 100) filters.push(`contrast(${settings.contrast}%)`);
        if (settings.saturation !== 100) filters.push(`saturate(${settings.saturation}%)`);
        if (settings.grayscale) filters.push('grayscale(100%)');
        if (settings.sepia) filters.push('sepia(100%)');
        if (settings.invert) filters.push('invert(100%)');
        if (settings.blur && settings.blur > 0) filters.push(`blur(${settings.blur}px)`);

        ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
        ctx.drawImage(img, 0, 0, srcW, srcH);
        ctx.filter = 'none';

      } else if (targetFormat === 'watermark') {
        canvas.width = srcW;
        canvas.height = srcH;
        ctx.clearRect(0, 0, srcW, srcH);
        ctx.drawImage(img, 0, 0, srcW, srcH);

        if (settings.watermarkText?.trim()) {
          ctx.save();
          const baseFontSize = Math.max(16, Math.round((srcW / 800) * (settings.watermarkSize || 24)));
          ctx.font = `bold ${baseFontSize}px sans-serif`;
          ctx.fillStyle = settings.watermarkColor || '#FFFFFF';
          ctx.globalAlpha = settings.watermarkOpacity ?? 0.6;

          const metrics = ctx.measureText(settings.watermarkText);
          const textW = metrics.width;
          const textH = baseFontSize;
          const pad = Math.round(baseFontSize * 0.8);

          let x = srcW / 2 - textW / 2;
          let y = srcH / 2 + textH / 3;

          if (settings.watermarkPosition === 'bottom-right') {
            x = srcW - textW - pad;
            y = srcH - pad;
          } else if (settings.watermarkPosition === 'bottom-left') {
            x = pad;
            y = srcH - pad;
          } else if (settings.watermarkPosition === 'top-right') {
            x = srcW - textW - pad;
            y = pad + textH;
          } else if (settings.watermarkPosition === 'top-left') {
            x = pad;
            y = pad + textH;
          }

          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 4;
          ctx.fillText(settings.watermarkText, x, y);
          ctx.restore();
        }

      } else if (targetFormat === 'blur-face') {
        canvas.width = srcW;
        canvas.height = srcH;
        ctx.clearRect(0, 0, srcW, srcH);

        const intensity = settings.mosaicIntensity || 15;
        const scale = Math.max(0.02, 1 / intensity);
        const offCanvas = document.createElement('canvas');
        offCanvas.width = Math.max(1, Math.round(srcW * scale));
        offCanvas.height = Math.max(1, Math.round(srcH * scale));
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(offCanvas, 0, 0, offCanvas.width, offCanvas.height, 0, 0, srcW, srcH);
        }

      } else if (targetFormat === 'remove-bg') {
        canvas.width = srcW;
        canvas.height = srcH;
        ctx.clearRect(0, 0, srcW, srcH);
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, srcW, srcH);
        const data = imgData.data;

        // Sample 4 corner pixels
        const corners = [
          [0, 0],
          [srcW - 1, 0],
          [0, srcH - 1],
          [srcW - 1, srcH - 1]
        ];
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(([x, y]) => {
          const idx = (y * srcW + x) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        const tol = (settings.removeBgTolerance || 25) * 2.55;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          if (dist < tol) {
            data[i + 3] = 0; // Set Alpha to 0 (Transparent)
          }
        }
        ctx.putImageData(imgData, 0, 0);

      } else if (targetFormat === 'meme') {
        canvas.width = srcW;
        canvas.height = srcH;
        ctx.clearRect(0, 0, srcW, srcH);
        ctx.drawImage(img, 0, 0);

        const fontSize = Math.max(20, Math.round((srcW / 600) * (settings.memeFontSize || 36)));
        ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(3, Math.round(fontSize / 7));
        ctx.lineJoin = 'round';

        if (settings.memeTopText) {
          const lines = settings.memeTopText.toUpperCase().split('\n');
          lines.forEach((line, idx) => {
            const y = (idx + 1) * (fontSize * 1.15);
            ctx.strokeText(line, srcW / 2, y);
            ctx.fillText(line, srcW / 2, y);
          });
        }

        if (settings.memeBottomText) {
          const lines = settings.memeBottomText.toUpperCase().split('\n');
          lines.forEach((line, idx) => {
            const y = srcH - (lines.length - 1 - idx) * (fontSize * 1.15) - (fontSize * 0.4);
            ctx.strokeText(line, srcW / 2, y);
            ctx.fillText(line, srcW / 2, y);
          });
        }

      } else if (targetFormat === 'upscale') {
        const factor = settings.upscaleFactor || 2;
        canvas.width = srcW * factor;
        canvas.height = srcH * factor;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      } else if (targetFormat === 'resize') {
        canvas.width = Math.max(1, settings.resizeWidth || srcW);
        canvas.height = Math.max(1, settings.resizeHeight || srcH);
        if (settings.resizeFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      } else {
        canvas.width = srcW;
        canvas.height = srcH;
        ctx.drawImage(img, 0, 0);
      }

      setOutputDimensions({ width: canvas.width, height: canvas.height });

      canvas.toBlob((blob) => {
        setOutputBlob(blob);
        setIsRendering(false);
      }, 'image/png');

    } catch (err) {
      console.error("Live preview error", err);
      setIsRendering(false);
    }
  }, [currentFile, targetFormat, settings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderLivePreview();
    }, 40);
    return () => clearTimeout(timer);
  }, [renderLivePreview]);

  const handleInstantDownload = () => {
    if (!outputBlob || !currentFile) return;
    const baseName = currentFile.originalFile.name.substring(0, currentFile.originalFile.name.lastIndexOf('.')) || currentFile.originalFile.name;
    const ext = targetFormat === 'jpg' ? 'jpg' : targetFormat === 'webp' ? 'webp' : 'png';
    const fileName = `${baseName}_${targetFormat}.${ext}`;

    addProcessLog({
      tool: targetFormat,
      format: ext.toUpperCase(),
      fileSize: outputBlob.size || currentFile.originalSize,
      status: 'success',
      durationMs: 150
    });

    if (onSingleDownloadDirect) {
      onSingleDownloadDirect(outputBlob, fileName);
    } else {
      saveAs(outputBlob, fileName);
    }
  };

  const isInteractiveTool = [
    'photo-editor', 'watermark', 'blur-face', 'remove-bg', 'meme', 'rotate', 'crop', 'resize', 'upscale'
  ].includes(targetFormat);

  if (!currentFile || !isInteractiveTool) {
    return null;
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-7 shadow-xl border border-slate-800 space-y-5 overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Eye size={20} className="text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                {locale === 'ko' ? '실시간 캔버스 편집기' : 'Live Interactive Canvas'}
              </span>
              {isRendering && (
                <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                  <RefreshCw size={10} className="animate-spin" /> {locale === 'ko' ? '렌더링 중' : 'Rendering'}
                </span>
              )}
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              {currentFile.originalFile.name}
            </h3>
          </div>
        </div>

        {/* Thumbnail Selector if multiple files uploaded */}
        {files.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 mr-1 font-medium">{locale === 'ko' ? '편집 대상:' : 'Select:'}</span>
            {files.map((file, idx) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  selectedIndex === idx
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                )}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Live Preview Canvas Viewport */}
      <div className={cn(
        "relative w-full rounded-2xl overflow-hidden border border-slate-800/80 flex items-center justify-center min-h-[340px] max-h-[560px] group transition-colors",
        bgPreviewColor === 'white' ? "bg-white" : bgPreviewColor === 'black' ? "bg-black" : "bg-slate-950/90"
      )}>
        {/* Transparency Checkerboard Pattern for transparent cutouts */}
        {bgPreviewColor === 'transparent' && (
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)`,
              backgroundSize: `20px 20px`,
              backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
            }}
          />
        )}

        <div className="relative max-w-full max-h-full p-4 overflow-auto flex items-center justify-center">
          <canvas
            ref={canvasRef}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out'
            }}
            className="max-w-full max-h-[460px] object-contain rounded-lg shadow-2xl border border-slate-700/50"
          />
        </div>

        {/* Viewport Control Overlay (Bottom Left & Right) */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-semibold text-slate-300 flex items-center gap-3">
          <span>
            {outputDimensions.width} × {outputDimensions.height} px
          </span>
          {outputBlob && (
            <span className="text-blue-400 font-bold border-l border-slate-700 pl-3">
              ~{formatSize(outputBlob.size)}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60">
          {targetFormat === 'remove-bg' && (
            <div className="flex items-center gap-1 border-r border-slate-700 pr-1.5 mr-1">
              <button
                type="button"
                onClick={() => setBgPreviewColor('transparent')}
                className={cn("w-5 h-5 rounded border text-[9px] font-bold flex items-center justify-center cursor-pointer", bgPreviewColor === 'transparent' ? "border-blue-400 bg-blue-500/20 text-white" : "border-slate-700 bg-slate-800 text-slate-400")}
                title="투명 체커보드"
              >
                ▨
              </button>
              <button
                type="button"
                onClick={() => setBgPreviewColor('white')}
                className={cn("w-5 h-5 rounded border bg-white cursor-pointer", bgPreviewColor === 'white' ? "border-blue-500 ring-2 ring-blue-400" : "border-slate-600")}
                title="흰색 배경 미리보기"
              />
              <button
                type="button"
                onClick={() => setBgPreviewColor('black')}
                className={cn("w-5 h-5 rounded border bg-black cursor-pointer", bgPreviewColor === 'black' ? "border-blue-500 ring-2 ring-blue-400" : "border-slate-700")}
                title="검은색 배경 미리보기"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="축소"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[11px] font-bold text-slate-300 px-1">{Math.round(zoomLevel * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.25))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="확대"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
            title="기본 크기"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Real-time Interactive Control Panel Directly In Live Canvas */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-4">
        {/* Rotate & Flip Direct Controls */}
        {targetFormat === 'rotate' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>{locale === 'ko' ? '회전 각도 및 대칭 반전' : 'Rotation Angle & Flip'}</span>
              <span className="text-blue-400 font-extrabold">{settings.rotateAngle || 0}°</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, rotateAngle: deg as 0 | 90 | 180 | 270 }))}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    settings.rotateAngle === deg 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" 
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                >
                  <RotateCw size={13} /> {deg}°
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, flipH: !s.flipH }))}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                  settings.flipH ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                <FlipHorizontal size={15} />
                <span>{locale === 'ko' ? '좌우 반전 (수평)' : 'Flip Horizontal'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, flipV: !s.flipV }))}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                  settings.flipV ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                <FlipVertical size={15} />
                <span>{locale === 'ko' ? '상하 반전 (수직)' : 'Flip Vertical'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Watermark Direct Controls */}
        {targetFormat === 'watermark' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{locale === 'ko' ? '워터마크 서명 문구' : 'Watermark Text'}</label>
                <input
                  type="text"
                  value={settings.watermarkText || ''}
                  onChange={(e) => setSettings(s => ({ ...s, watermarkText: e.target.value }))}
                  placeholder="예: © 2026 My Brand"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{locale === 'ko' ? '위치 선택' : 'Position'}</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'top-left', label: '좌상' },
                    { id: 'top-right', label: '우상' },
                    { id: 'center', label: '중앙' },
                    { id: 'bottom-left', label: '좌하' },
                    { id: 'bottom-right', label: '우하' },
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, watermarkPosition: pos.id as any }))}
                      className={cn(
                        "py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                        settings.watermarkPosition === pos.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                  <span>{locale === 'ko' ? '투명도' : 'Opacity'}</span>
                  <span className="text-blue-400 font-bold">{Math.round((settings.watermarkOpacity ?? 0.6) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.watermarkOpacity ?? 0.6}
                  onChange={(e) => setSettings(s => ({ ...s, watermarkOpacity: parseFloat(e.target.value) }))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                  <span>{locale === 'ko' ? '글자 크기' : 'Font Size'}</span>
                  <span className="text-blue-400 font-bold">{settings.watermarkSize || 24}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="2"
                  value={settings.watermarkSize || 24}
                  onChange={(e) => setSettings(s => ({ ...s, watermarkSize: parseInt(e.target.value) }))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{locale === 'ko' ? '글자 색상' : 'Color'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.watermarkColor || '#FFFFFF'}
                    onChange={(e) => setSettings(s => ({ ...s, watermarkColor: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  {['#FFFFFF', '#000000', '#EF4444', '#3B82F6', '#F59E0B'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, watermarkColor: c }))}
                      style={{ backgroundColor: c }}
                      className={cn(
                        "w-5 h-5 rounded-full border cursor-pointer transition-transform",
                        settings.watermarkColor === c ? "scale-125 border-white ring-2 ring-blue-500" : "border-slate-700"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Background Direct Controls */}
        {targetFormat === 'remove-bg' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">{locale === 'ko' ? '배경 인식 민감도 (허용 오차)' : 'Color Tolerance'}</span>
              <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {settings.removeBgTolerance || 25}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="70"
              step="1"
              value={settings.removeBgTolerance || 25}
              onChange={(e) => setSettings(s => ({ ...s, removeBgTolerance: parseInt(e.target.value) }))}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>{locale === 'ko' ? '미세 제거 (정밀)' : 'Precise (5%)'}</span>
              <span>{locale === 'ko' ? '표준 권장 (25%)' : 'Standard (25%)'}</span>
              <span>{locale === 'ko' ? '광범위 제거 (강하게)' : 'Aggressive (70%)'}</span>
            </div>
          </div>
        )}

        {/* Blur / Mosaic Face Direct Controls */}
        {targetFormat === 'blur-face' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">{locale === 'ko' ? '모자이크 블러 강도' : 'Mosaic Intensity'}</span>
              <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {settings.mosaicIntensity || 15}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={settings.mosaicIntensity || 15}
              onChange={(e) => setSettings(s => ({ ...s, mosaicIntensity: parseInt(e.target.value) }))}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: locale === 'ko' ? '약하게 (8)' : 'Light (8)', val: 8 },
                { label: locale === 'ko' ? '보통 권장 (15)' : 'Medium (15)', val: 15 },
                { label: locale === 'ko' ? '강력 가림 (28)' : 'Heavy (28)', val: 28 },
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, mosaicIntensity: item.val }))}
                  className={cn(
                    "py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    settings.mosaicIntensity === item.val
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photo Editor Direct Controls */}
        {targetFormat === 'photo-editor' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                  <span>{locale === 'ko' ? '밝기' : 'Brightness'}</span>
                  <span className="text-blue-400 font-bold">{settings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  step="5"
                  value={settings.brightness}
                  onChange={(e) => setSettings(s => ({ ...s, brightness: parseInt(e.target.value) }))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                  <span>{locale === 'ko' ? '대비' : 'Contrast'}</span>
                  <span className="text-blue-400 font-bold">{settings.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  step="5"
                  value={settings.contrast}
                  onChange={(e) => setSettings(s => ({ ...s, contrast: parseInt(e.target.value) }))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                  <span>{locale === 'ko' ? '채도' : 'Saturation'}</span>
                  <span className="text-blue-400 font-bold">{settings.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={settings.saturation}
                  onChange={(e) => setSettings(s => ({ ...s, saturation: parseInt(e.target.value) }))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, grayscale: !s.grayscale }))}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  settings.grayscale ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                )}
              >
                흑백 (B&W)
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, sepia: !s.sepia }))}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  settings.sepia ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                )}
              >
                세피아 (Sepia)
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, invert: !s.invert }))}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  settings.invert ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                )}
              >
                색상 반전
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, brightness: 100, contrast: 100, saturation: 100, grayscale: false, sepia: false, invert: false, blur: 0 }))}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-auto cursor-pointer flex items-center gap-1"
              >
                <Undo2 size={12} /> {locale === 'ko' ? '필터 초기화' : 'Reset'}
              </button>
            </div>
          </div>
        )}

        {/* Crop Direct Controls */}
        {targetFormat === 'crop' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 mb-1">{locale === 'ko' ? '자르기 비율 선택' : 'Crop Ratio'}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '1:1', label: '1:1 정사각형 (SNS/프로필)' },
                { id: '16:9', label: '16:9 와이드 (유튜브/PC)' },
                { id: '4:3', label: '4:3 클래식 (표준)' },
                { id: '9:16', label: '9:16 세로 (쇼츠/스토리)' },
              ].map(ratio => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, cropRatio: ratio.id as any }))}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center",
                    settings.cropRatio === ratio.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meme Generator Direct Controls */}
        {targetFormat === 'meme' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{locale === 'ko' ? '상단 자막 (TOP TEXT)' : 'Top Text'}</label>
                <input
                  type="text"
                  value={settings.memeTopText || ''}
                  onChange={(e) => setSettings(s => ({ ...s, memeTopText: e.target.value }))}
                  placeholder="WHEN YOU WRITE CODE"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-bold uppercase focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{locale === 'ko' ? '하단 자막 (BOTTOM TEXT)' : 'Bottom Text'}</label>
                <input
                  type="text"
                  value={settings.memeBottomText || ''}
                  onChange={(e) => setSettings(s => ({ ...s, memeBottomText: e.target.value }))}
                  placeholder="AND IT BUILDS ON FIRST TRY"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-bold uppercase focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Upscale Direct Controls */}
        {targetFormat === 'upscale' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 mb-1">{locale === 'ko' ? '업스케일 배율 선택' : 'Upscale Factor'}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, upscaleFactor: 2 }))}
                className={cn(
                  "p-3 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                  settings.upscaleFactor === 2 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                <span className="text-base font-black">2X</span>
                <span>Super Resolution (2배)</span>
              </button>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, upscaleFactor: 4 }))}
                className={cn(
                  "p-3 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                  settings.upscaleFactor === 4 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                <span className="text-base font-black">4X</span>
                <span>Ultra HD (4배)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Bar under live canvas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400 shrink-0" />
          <span>
            {locale === 'ko' 
              ? '조작한 실시간 캔버스 결과물을 원클릭으로 즉시 저장할 수 있습니다.' 
              : 'Save the live canvas edited result with one click.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstantDownload}
            disabled={!outputBlob || isRendering}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span>{locale === 'ko' ? '현재 실시간 작업물 즉시 저장' : 'Download Live Edited Result'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
