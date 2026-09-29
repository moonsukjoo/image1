import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Upload, FileImage, FileText, Download, Trash2, 
  RefreshCw, FileArchive, ArrowRight, ArrowRightLeft, Loader2, CheckCircle, AlertCircle, Globe, Maximize, GripVertical, AlertTriangle, Sparkles, Check,
  ShieldCheck, User, LogOut, Crop, RotateCw, SlidersHorizontal, Stamp, EyeOff, Scissors, MessageSquare, ZoomIn, Code, BookOpen
} from 'lucide-react';
import { GUIDE_ARTICLES } from './data/guidesData';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn, formatSize } from './lib/utils';
import { FileItem, ToolId, ConversionSpec, AppSettings } from './types';
import { 
  compressImage, convertImage, createPdfFromImages, resizeImage, convertPdfToImages,
  cropImage, rotateAndFlipImage, editPhotoFilters, applyWatermark, applyMosaicBlur,
  removeImageBackground, createMemeImage, upscaleImageSuperRes, renderHtmlCardToImage
} from './lib/processor';
import { AdUnit } from './components/AdUnit';
import { DownloadAdModal } from './components/DownloadAdModal';
import { ReuploadAdModal } from './components/ReuploadAdModal';
import { ConversionWorkspace } from './components/ConversionWorkspace';
import { SeoHead } from './components/SeoHead';
import { SeoContentSection } from './components/SeoContentSection';
import { LanguageSelector } from './components/LanguageSelector';
import { getSeoData } from './seo';
import { isToolEnabled, addProcessLog, recordVisit } from './lib/store';
import { validateSafeFile } from './lib/security';
import { getCurrentUser, logoutUser, User as AuthUser } from './lib/auth';
import { useLocale, getTranslations } from './lib/i18n';

const ROUTE_TO_TOOL: Record<string, ToolId> = {
  '/compress-image': 'compress',
  '/resize-image': 'resize',
  '/image-to-pdf': 'pdf',
  '/pdf-to-image': 'pdf-to-image',
  '/crop-image': 'crop',
  '/rotate-image': 'rotate',
  '/photo-editor': 'photo-editor',
  '/watermark-image': 'watermark',
  '/blur-face': 'blur-face',
  '/remove-background': 'remove-bg',
  '/meme-generator': 'meme',
  '/upscale-image': 'upscale',
  '/html-to-image': 'html-to-image',
  '/jpg-to-png': 'jpg-to-png',
  '/png-to-jpg': 'png-to-jpg',
  '/jpg-to-webp': 'jpg-to-webp',
  '/png-to-webp': 'png-to-webp',
  '/webp-to-jpg': 'webp-to-jpg',
  '/webp-to-png': 'webp-to-png',
  '/gif-to-jpg': 'gif-to-jpg',
  '/gif-to-png': 'gif-to-png',
  '/bmp-to-jpg': 'bmp-to-jpg',
  '/bmp-to-png': 'bmp-to-png',
  '/svg-to-png': 'svg-to-png',
  '/heic-to-jpg': 'heic-to-jpg',
  '/heic-to-png': 'heic-to-png'
};

const TOOL_TO_ROUTE: Record<string, string> = Object.entries(ROUTE_TO_TOOL).reduce((acc, [route, tool]) => {
  acc[tool] = route;
  return acc;
}, {} as Record<string, string>);

function SortableFileItem({ file, onRemove }: { file: FileItem; onRemove: (id: string) => void; }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };
  const ext = file.originalFile.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-center gap-4 p-4 bg-white border rounded-2xl shadow-sm transition-shadow", isDragging ? "border-blue-400 shadow-lg" : "border-slate-200")}>
      <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
        <GripVertical size={20} />
      </div>
      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center shrink-0 font-extrabold text-xs text-blue-700">
        {ext}
      </div>
      <div className="flex-1 w-full min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800 mb-1">{file.originalFile.name}</p>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>{formatSize(file.originalSize)}</span>
        </div>
      </div>
      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(file.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="삭제">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

const CONVERSIONS: ConversionSpec[] = [
  { id: 'jpg-to-png', label: 'JPG → PNG', fromFormat: 'image/jpeg', toFormat: 'image/png', ext: 'png' },
  { id: 'png-to-jpg', label: 'PNG → JPG', fromFormat: 'image/png', toFormat: 'image/jpeg', ext: 'jpg' },
  { id: 'jpg-to-webp', label: 'JPG → WEBP', fromFormat: 'image/jpeg', toFormat: 'image/webp', ext: 'webp' },
  { id: 'png-to-webp', label: 'PNG → WEBP', fromFormat: 'image/png', toFormat: 'image/webp', ext: 'webp' },
  { id: 'webp-to-jpg', label: 'WEBP → JPG', fromFormat: 'image/webp', toFormat: 'image/jpeg', ext: 'jpg' },
  { id: 'webp-to-png', label: 'WEBP → PNG', fromFormat: 'image/webp', toFormat: 'image/png', ext: 'png' },
  { id: 'gif-to-jpg', label: 'GIF → JPG', fromFormat: 'image/gif', toFormat: 'image/jpeg', ext: 'jpg' },
  { id: 'gif-to-png', label: 'GIF → PNG', fromFormat: 'image/gif', toFormat: 'image/png', ext: 'png' },
  { id: 'bmp-to-jpg', label: 'BMP → JPG', fromFormat: 'image/bmp', toFormat: 'image/jpeg', ext: 'jpg' },
  { id: 'bmp-to-png', label: 'BMP → PNG', fromFormat: 'image/bmp', toFormat: 'image/png', ext: 'png' },
  { id: 'svg-to-png', label: 'SVG → PNG', fromFormat: 'image/svg+xml', toFormat: 'image/png', ext: 'png' },
  { id: 'heic-to-jpg', label: 'HEIC → JPG', fromFormat: 'image/heic', toFormat: 'image/jpeg', ext: 'jpg' },
  { id: 'heic-to-png', label: 'HEIC → PNG', fromFormat: 'image/heic', toFormat: 'image/png', ext: 'png' },
];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, setLocale } = useLocale();
  const t = getTranslations(locale);
  
  const activeTool = ROUTE_TO_TOOL[location.pathname] || null;
  const view = activeTool ? 'tool' : 'home';
  const seo = getSeoData(activeTool, locale);
  const toolEnabled = isToolEnabled(activeTool);

  const getInitialFormat = (tool: ToolId | null): string => {
    if (!tool) return 'png';
    const directTools = ['compress', 'resize', 'pdf', 'pdf-to-image', 'crop', 'rotate', 'photo-editor', 'watermark', 'blur-face', 'remove-bg', 'meme', 'upscale', 'html-to-image'];
    if (directTools.includes(tool)) return tool;
    const conv = CONVERSIONS.find(c => c.id === tool);
    return conv ? conv.ext : 'png';
  };

  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, []);

  const [targetFormat, setTargetFormat] = useState<string>(() => getInitialFormat(activeTool));
  const [settings, setSettings] = useState<AppSettings>({
    compressQuality: 80,
    pdfPageSize: 'a4',
    pdfOrientation: 'p',
    pdfMargin: 20,
    pdfToImageFormat: 'image/jpeg',
    pdfToImageResolution: 'medium',
    resizeWidth: 1920,
    resizeHeight: 1080,
    resizeKeepRatio: true,
    resizePercentage: 100,
    resizeFormat: 'image/jpeg',
    resizeQuality: 85,
    cropRatio: '1:1',
    rotateAngle: 0,
    flipH: false,
    flipV: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: false,
    sepia: false,
    blur: 0,
    invert: false,
    watermarkText: 'Image Magic',
    watermarkColor: '#FFFFFF',
    watermarkSize: 32,
    watermarkOpacity: 0.6,
    watermarkPosition: 'bottom-right',
    mosaicIntensity: 15,
    removeBgTolerance: 25,
    memeTopText: '',
    memeBottomText: '',
    memeFontSize: 36,
    upscaleFactor: 2,
    htmlContent: 'Image Magic Card'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfResult, setPdfResult] = useState<{blob: Blob, url: string, size: number} | null>(null);
  const [downloadModalData, setDownloadModalData] = useState<{
    isOpen: boolean;
    fileName: string;
    blob?: Blob;
    size?: number;
    count?: number;
    downloadAction?: () => void;
  }>({
    isOpen: false,
    fileName: '',
  });

  const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
  const reuploadInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerReupload = useCallback(() => {
    setIsReuploadModalOpen(true);
  }, []);

  const handleCloseAndReupload = useCallback(() => {
    setIsReuploadModalOpen(false);
    setFiles([]);
    setPdfResult(null);
    setTimeout(() => {
      reuploadInputRef.current?.click();
    }, 150);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    return () => {
      files.forEach(f => {
        URL.revokeObjectURL(f.previewUrl);
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
      });
      if (pdfResult) URL.revokeObjectURL(pdfResult.url);
    };
  }, [files, pdfResult]);

  useEffect(() => {
    recordVisit();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (files.length === 0) {
      setTargetFormat(getInitialFormat(activeTool));
    }
  }, [activeTool, files.length]);

  const processDrop = async (acceptedFiles: File[], autoRoute: boolean = false) => {
    if (acceptedFiles.length === 0) return;
    
    const validFiles: File[] = [];
    for (const file of acceptedFiles) {
      const validation = await validateSafeFile(file);
      if (!validation.valid) {
        alert(`[보안 경고] '${file.name}' (${validation.error})`);
        addProcessLog({
          tool: '보안 검사',
          format: file.type || '알 수 없음',
          fileSize: file.size,
          status: 'error',
          durationMs: 5
        });
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    if (autoRoute && view === 'home') {
      const hasPdf = validFiles.some(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith('.pdf'));
      if (hasPdf) {
        setTargetFormat('pdf-to-image');
      } else {
        const first = validFiles[0].name.toLowerCase();
        if (first.endsWith('.png')) setTargetFormat('jpg');
        else if (first.endsWith('.jpg') || first.endsWith('.jpeg')) setTargetFormat('png');
        else if (first.endsWith('.webp')) setTargetFormat('jpg');
        else setTargetFormat('png');
      }
    }

    const newFiles: FileItem[] = validFiles.map(f => ({
      id: Math.random().toString(36).substring(2, 9),
      originalFile: f,
      previewUrl: URL.createObjectURL(f),
      originalSize: f.size,
      status: 'idle',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const onDropTool = useCallback((acceptedFiles: File[]) => {
    processDrop(acceptedFiles, false);
  }, [view]);

  const onDropHome = useCallback((acceptedFiles: File[]) => {
    processDrop(acceptedFiles, true);
  }, [view]);

  const { getRootProps: getRootPropsTool, getInputProps: getInputPropsTool, isDragActive: isDragActiveTool } = useDropzone({
    onDrop: onDropTool,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg', '.heic', '.heif'],
      'application/pdf': ['.pdf']
    }
  });

  const { getRootProps: getRootPropsHome, getInputProps: getInputPropsHome, isDragActive: isDragActiveHome } = useDropzone({
    onDrop: onDropHome,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg', '.heic', '.heif'],
      'application/pdf': ['.pdf']
    }
  });

  const removeFile = (id: string) => {
    setFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.resultUrl) URL.revokeObjectURL(target.resultUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const resetFile = (id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
        return {
          ...f,
          status: 'idle',
          progress: 0,
          resultBlob: undefined,
          resultUrl: undefined,
          resultSize: undefined,
          error: undefined
        };
      }
      return f;
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const getTargetExt = (file: FileItem) => {
    if (targetFormat === 'compress') {
      const ext = file.originalFile.name.split('.').pop()?.toLowerCase();
      return ext === 'png' ? 'png' : 'jpg';
    }
    if (targetFormat === 'resize') {
      return settings.resizeFormat === 'image/png' ? 'png' : settings.resizeFormat === 'image/webp' ? 'webp' : 'jpg';
    }
    if (targetFormat === 'pdf-to-image' || targetFormat === 'pdf-to-jpg') return 'jpg';
    if (targetFormat === 'pdf-to-png') return 'png';
    if (targetFormat === 'remove-bg') return 'png';
    if (['crop', 'rotate', 'photo-editor', 'watermark', 'blur-face', 'meme', 'upscale', 'html-to-image'].includes(targetFormat)) return 'png';
    return targetFormat;
  };

  const triggerSingleDownload = (file: FileItem) => {
    if (!file.resultBlob) return;
    const targetExt = getTargetExt(file);
    const baseName = file.originalFile.name.substring(0, file.originalFile.name.lastIndexOf('.')) || file.originalFile.name;
    const fileName = `${baseName}_converted.${targetExt}`;

    setDownloadModalData({
      isOpen: true,
      fileName,
      blob: file.resultBlob,
      size: file.resultSize || file.resultBlob.size,
      count: 1,
      downloadAction: () => {
        saveAs(file.resultBlob!, fileName);
      }
    });
  };

  const triggerPdfDownload = () => {
    if (!pdfResult) return;
    const fileName = `imagemagic_merged_${Date.now()}.pdf`;

    setDownloadModalData({
      isOpen: true,
      fileName,
      blob: pdfResult.blob,
      size: pdfResult.size,
      count: files.length,
      downloadAction: () => {
        saveAs(pdfResult.blob, fileName);
      }
    });
  };

  const handleDownloadAllAsZip = async () => {
    const successFiles = files.filter(f => f.status === 'success' && f.resultBlob);
    if (successFiles.length === 0) return;

    setDownloadModalData({
      isOpen: true,
      fileName: `imagemagic_batch_${Date.now()}.zip`,
      size: successFiles.reduce((acc, f) => acc + (f.resultSize || 0), 0),
      count: successFiles.length,
      downloadAction: async () => {
        const zip = new JSZip();
        successFiles.forEach((file) => {
          const targetExt = getTargetExt(file);
          const baseName = file.fileName || file.originalFile.name.substring(0, file.originalFile.name.lastIndexOf('.')) || file.originalFile.name;
          zip.file(`${baseName}.${targetExt}`, file.resultBlob!);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `imagemagic_batch_${Date.now()}.zip`);
      }
    });
  };

  const handleDownloadAllIndividual = () => {
    const successFiles = files.filter(f => f.status === 'success' && f.resultBlob);
    if (successFiles.length === 0) return;

    setDownloadModalData({
      isOpen: true,
      fileName: `${successFiles.length} files`,
      size: successFiles.reduce((acc, f) => acc + (f.resultSize || 0), 0),
      count: successFiles.length,
      downloadAction: () => {
        successFiles.forEach((file, index) => {
          setTimeout(() => {
            const targetExt = getTargetExt(file);
            const baseName = file.fileName || file.originalFile.name.substring(0, file.originalFile.name.lastIndexOf('.')) || file.originalFile.name;
            saveAs(file.resultBlob!, `${baseName}.${targetExt}`);
          }, index * 200);
        });
      }
    });
  };

  const handleCloseAndDownload = () => {
    if (downloadModalData.downloadAction) {
      downloadModalData.downloadAction();
    }
    setDownloadModalData(prev => ({ ...prev, isOpen: false }));
  };

  const handleProcessSingle = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'processing', progress: 10 } : f));
    const startTime = Date.now();

    try {
      let resultBlob: Blob;
      
      if (targetFormat === 'compress') {
        resultBlob = await compressImage(file.originalFile, settings.compressQuality, (p) => {
          setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f));
        });
      } else if (targetFormat === 'resize') {
        const resizeFmt = settings.resizeFormat || 'image/jpeg';
        resultBlob = await resizeImage(
          file.originalFile,
          settings.resizeWidth || 1920,
          settings.resizeHeight || 1080,
          resizeFmt,
          settings.resizeQuality,
          (p) => {
            setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f));
          }
        );
      } else if (targetFormat === 'crop') {
        resultBlob = await cropImage(
          file.originalFile,
          settings.cropRatio || '1:1',
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'rotate') {
        resultBlob = await rotateAndFlipImage(
          file.originalFile,
          settings.rotateAngle || 0,
          settings.flipH,
          settings.flipV,
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'photo-editor') {
        resultBlob = await editPhotoFilters(
          file.originalFile,
          settings,
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'watermark') {
        resultBlob = await applyWatermark(
          file.originalFile,
          {
            text: settings.watermarkText || 'Watermark',
            color: settings.watermarkColor || '#FFFFFF',
            size: settings.watermarkSize || 24,
            opacity: settings.watermarkOpacity ?? 0.5,
            position: settings.watermarkPosition || 'bottom-right'
          },
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'blur-face') {
        resultBlob = await applyMosaicBlur(
          file.originalFile,
          settings.mosaicIntensity || 15,
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'remove-bg') {
        resultBlob = await removeImageBackground(
          file.originalFile,
          settings.removeBgTolerance || 25,
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'meme') {
        resultBlob = await createMemeImage(
          file.originalFile,
          {
            topText: settings.memeTopText || '',
            bottomText: settings.memeBottomText || '',
            fontSize: settings.memeFontSize || 36
          },
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'upscale') {
        resultBlob = await upscaleImageSuperRes(
          file.originalFile,
          settings.upscaleFactor || 2,
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'html-to-image') {
        resultBlob = await renderHtmlCardToImage(
          settings.htmlContent || 'Image Magic Announcement Card',
          (p: number) => setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f))
        );
      } else if (targetFormat === 'pdf-to-image' || targetFormat === 'pdf-to-jpg' || targetFormat === 'pdf-to-png') {
        const mime = targetFormat === 'pdf-to-png' ? 'image/png' : 'image/jpeg';
        const blobs = await convertPdfToImages(file.originalFile, mime, 'high', (p) => {
          setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f));
        });
        if (blobs.length === 0) throw new Error("PDF 페이지를 추출할 수 없습니다.");
        
        if (blobs.length === 1) {
          resultBlob = blobs[0].blob;
        } else {
          const zip = new JSZip();
          blobs.forEach((b) => {
            zip.file(b.name, b.blob);
          });
          resultBlob = await zip.generateAsync({ type: 'blob' });
        }
      } else {
        const mimeMap: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          gif: 'image/gif',
          bmp: 'image/bmp',
          svg: 'image/svg+xml'
        };
        const toMime = mimeMap[targetFormat] || 'image/png';
        resultBlob = await convertImage(file.originalFile, toMime, (p) => {
          setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f));
        });
      }

      const resultUrl = URL.createObjectURL(resultBlob);
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            status: 'success',
            progress: 100,
            resultBlob,
            resultUrl,
            resultSize: resultBlob.size
          };
        }
        return f;
      }));

      addProcessLog({
        tool: activeTool || targetFormat,
        format: targetFormat.toUpperCase(),
        fileSize: file.originalSize,
        status: 'success',
        durationMs: Date.now() - startTime
      });
    } catch (err: any) {
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            status: 'error',
            progress: 0,
            error: err.message || '변환 실패'
          };
        }
        return f;
      }));

      addProcessLog({
        tool: activeTool || targetFormat,
        format: targetFormat.toUpperCase(),
        fileSize: file.originalSize,
        status: 'error',
        durationMs: Date.now() - startTime
      });
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      if (targetFormat === 'pdf') {
        const blob = await createPdfFromImages(files, {
          pdfPageSize: settings.pdfPageSize,
          pdfOrientation: settings.pdfOrientation,
          pdfMargin: settings.pdfMargin
        }, (p) => {
          setFiles(prev => prev.map(f => ({ ...f, progress: p })));
        });
        const url = URL.createObjectURL(blob);
        setPdfResult({ blob, url, size: blob.size });

        setFiles(prev => prev.map(f => ({
          ...f,
          status: 'success',
          progress: 100
        })));

        addProcessLog({
          tool: 'pdf',
          format: 'PDF',
          fileSize: files.reduce((acc, f) => acc + f.originalSize, 0),
          status: 'success',
          durationMs: Date.now() - startTime
        });
      } else {
        for (const file of files) {
          await handleProcessSingle(file.id);
        }
      }
    } catch (err: any) {
      alert(t.failed + ": " + (err.message || "Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-slate-50 text-slate-900 pb-20">
      <SeoHead seo={seo} path={location.pathname} locale={locale} />

      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" onClick={() => { setFiles([]); setPdfResult(null); }} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity focus:outline-none">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                IM
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {locale === 'ko' ? '이미지 매직' : 'Image Magic'}
                </h1>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">Modern Image Toolkit</span>
              </div>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <Link to={TOOL_TO_ROUTE['jpg-to-png']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3.5 py-2 rounded-xl transition-all", activeTool === 'jpg-to-png' ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-100 hover:text-slate-900")}>
                {t.navConvert}
              </Link>
              <Link to={TOOL_TO_ROUTE['compress']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3.5 py-2 rounded-xl transition-all", activeTool === 'compress' ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-100 hover:text-slate-900")}>
                {t.navCompress}
              </Link>
              <Link to={TOOL_TO_ROUTE['resize']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3.5 py-2 rounded-xl transition-all", activeTool === 'resize' ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-100 hover:text-slate-900")}>
                {t.navResize}
              </Link>
              <Link to={TOOL_TO_ROUTE['pdf']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3.5 py-2 rounded-xl transition-all", activeTool === 'pdf' ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-100 hover:text-slate-900")}>
                {t.navPdf}
              </Link>
              <Link to={TOOL_TO_ROUTE['pdf-to-image']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3.5 py-2 rounded-xl transition-all", activeTool === 'pdf-to-image' ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-100 hover:text-slate-900")}>
                {t.navPdfToImage}
              </Link>
              <Link to="/guides" className="px-3.5 py-2 rounded-xl transition-all hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 text-blue-600 font-bold">
                <BookOpen size={15} />
                <span>{locale === 'ko' ? '지식 가이드' : 'Guides'}</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <LanguageSelector currentLocale={locale} onSelectLocale={setLocale} />

            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200/60"
                  >
                    <ShieldCheck size={14} />
                    <span>{locale === 'ko' ? '관리자 콘솔' : 'Admin'}</span>
                  </Link>
                )}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                  <User size={13} className="text-slate-500" />
                  <span>{currentUser.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                  }}
                  className="text-xs font-semibold px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  title="로그아웃"
                >
                  <LogOut size={13} />
                  <span>{t.logout}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  {t.login}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20 transition-all"
                >
                  {t.register}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Quick Navigation */}
        <div className="lg:hidden px-4 py-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-semibold text-slate-600">
          <Link to="/" onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("whitespace-nowrap px-3 py-1.5 rounded-lg", view === 'home' ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200")}>{t.allTools}</Link>
          <Link to={TOOL_TO_ROUTE['compress']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("whitespace-nowrap px-3 py-1.5 rounded-lg", activeTool === 'compress' ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200")}>{t.navCompress}</Link>
          <Link to={TOOL_TO_ROUTE['resize']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("whitespace-nowrap px-3 py-1.5 rounded-lg", activeTool === 'resize' ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200")}>{t.navResize}</Link>
          <Link to={TOOL_TO_ROUTE['jpg-to-png']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("whitespace-nowrap px-3 py-1.5 rounded-lg", activeTool === 'jpg-to-png' ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200")}>{t.navConvert}</Link>
          <Link to={TOOL_TO_ROUTE['pdf']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("whitespace-nowrap px-3 py-1.5 rounded-lg", activeTool === 'pdf' ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200")}>{t.navPdf}</Link>
          <Link to={TOOL_TO_ROUTE['pdf-to-image']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("whitespace-nowrap px-3 py-1.5 rounded-lg", activeTool === 'pdf-to-image' ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200")}>{t.navPdfToImage}</Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-2">
          <AdUnit slot="header" height="h-14" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col xl:flex-row gap-8 justify-center">
        <main className="flex-1 w-full max-w-5xl space-y-10 min-w-0">
          <AdUnit slot="top" height="h-20 md:h-28" />

          {files.length > 0 ? (
            <div className="space-y-8">
              <ConversionWorkspace
                files={files}
                targetFormat={targetFormat}
                setTargetFormat={setTargetFormat}
                settings={settings}
                setSettings={setSettings}
                isProcessing={isProcessing}
                onProcess={handleProcess}
                onProcessSingle={handleProcessSingle}
                onResetFile={resetFile}
                onRemoveFile={removeFile}
                onClearAll={() => { setFiles([]); setPdfResult(null); }}
                onTriggerReupload={handleTriggerReupload}
                onTriggerSingleDownload={triggerSingleDownload}
                onTriggerPdfDownload={triggerPdfDownload}
                onDownloadAllZip={handleDownloadAllAsZip}
                onDownloadAllIndividual={handleDownloadAllIndividual}
                pdfResult={pdfResult}
                getRootProps={view === 'home' ? getRootPropsHome : getRootPropsTool}
                getInputProps={view === 'home' ? getInputPropsHome : getInputPropsTool}
                sensors={sensors}
                onDragEnd={handleDragEnd}
                getTargetExt={getTargetExt}
                locale={locale}
              />
              <SeoContentSection seo={seo} locale={locale} />
            </div>
          ) : view === 'home' ? (
            <div className="space-y-16">
              <section className="text-center pt-8 pb-4">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
                {seo.h1}
              </h2>
              <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                {seo.subDescription}
              </p>

              <div 
                {...getRootPropsHome()} 
                className={cn(
                  "max-w-3xl mx-auto p-12 md:p-16 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-300",
                  isDragActiveHome ? "border-blue-500 bg-blue-50/70 scale-[1.01] shadow-lg shadow-blue-500/10" : "border-slate-300/80 bg-white hover:border-blue-400 hover:shadow-md hover:shadow-slate-200/50"
                )}
              >
                <input {...getInputPropsHome()} />
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                  <Upload size={38} strokeWidth={1.8} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {isDragActiveHome ? (locale === 'ko' ? "여기에 파일을 놓으세요!" : "Drop files right here!") : t.dropzoneTitle}
                </h3>
                <p className="text-slate-500 font-medium text-sm md:text-base mb-4">
                  {t.dropzoneSubtitle}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20">
                  <Upload size={16} /> {t.selectFileBtn}
                </div>
              </div>
            </section>
            
            <AdUnit slot="content-top" height="h-20 md:h-28" />

            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="text-blue-600" size={20} /> {t.featuredTools}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to={TOOL_TO_ROUTE['compress']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('compress') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('compress') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><FileArchive size={30} /></div>
                  <h4 className="font-bold text-slate-900">{t.navCompress}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '화질 저하 없이 용량 최적화' : 'Smart compression without quality loss'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['resize']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('resize') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('resize') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><Maximize size={30} /></div>
                  <h4 className="font-bold text-slate-900">{t.navResize}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '원하는 크기 및 비율로 조절' : 'Custom width, height & ratio'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['crop']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('crop') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('crop') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><Crop size={30} /></div>
                  <h4 className="font-bold text-slate-900">{locale === 'ko' ? '이미지 자르기' : 'Crop Image'}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '1:1, 16:9, 9:16 원하는 비율 크롭' : 'Crop to standard aspect ratios'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['remove-bg']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('remove-bg') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('remove-bg') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><Scissors size={30} /></div>
                  <h4 className="font-bold text-slate-900">{locale === 'ko' ? '배경 제거 (누끼)' : 'Remove Background'}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '투명 PNG 배경 즉시 분리' : 'Create transparent PNG cutouts'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['rotate']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('rotate') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('rotate') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><RotateCw size={30} /></div>
                  <h4 className="font-bold text-slate-900">{locale === 'ko' ? '회전 & 거울 반전' : 'Rotate & Flip'}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '90°/180° 회전 및 좌우상하 반전' : '90° turn and mirror flip'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['photo-editor']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('photo-editor') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('photo-editor') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><SlidersHorizontal size={30} /></div>
                  <h4 className="font-bold text-slate-900">{locale === 'ko' ? '포토 에디터 & 필터' : 'Photo Editor'}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '밝기, 대비, 채도, 흑백, 세피아' : 'Adjust brightness, contrast & filters'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['watermark']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('watermark') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('watermark') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><Stamp size={30} /></div>
                  <h4 className="font-bold text-slate-900">{locale === 'ko' ? '워터마크 서명' : 'Watermark'}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '저작권 텍스트 서명 삽입' : 'Add text signature & copyright'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['blur-face']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('blur-face') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('blur-face') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><EyeOff size={30} /></div>
                  <h4 className="font-bold text-slate-900">{locale === 'ko' ? '얼굴 모자이크 & 블러' : 'Blur & Mosaic'}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '프라이버시 및 번호판 가리기' : 'Protect privacy & sensitive data'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['meme']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('meme') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('meme') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><MessageSquare size={30} /></div>
                  <h4 className="font-bold text-slate-900">{locale === 'ko' ? '밈(Meme) 생성기' : 'Meme Generator'}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '상하단 자막 짤방 제작' : 'Add bold Impact captions'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['upscale']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('upscale') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('upscale') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><ZoomIn size={30} /></div>
                  <h4 className="font-bold text-slate-900">{locale === 'ko' ? '업스케일 (2x, 4x)' : 'Upscale Image'}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '깨짐 없는 초고해상도 확대' : 'Enlarge 2x, 4x super resolution'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['pdf']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('pdf') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('pdf') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><FileText size={30} /></div>
                  <h4 className="font-bold text-slate-900">{t.navPdf}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? '여러 장의 이미지를 PDF로 병합' : 'Merge multiple images into single PDF'}</p>
                </Link>
                <Link to={TOOL_TO_ROUTE['pdf-to-image']} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl border transition-all text-center group relative overflow-hidden", isToolEnabled('pdf-to-image') ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none")}>
                  <div className={cn("p-4 rounded-2xl mb-4 transition-transform", isToolEnabled('pdf-to-image') ? "bg-blue-50 text-blue-600 group-hover:scale-105" : "bg-slate-100 text-slate-400")}><FileImage size={30} /></div>
                  <h4 className="font-bold text-slate-900">{t.navPdfToImage}</h4>
                  <p className="text-xs text-slate-500 mt-1">{locale === 'ko' ? 'PDF 페이지를 고화질 이미지로 추출' : 'Extract PDF pages to high-res images'}</p>
                </Link>
              </div>
            </section>

            {/* Format Conversions Grid Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="text-blue-600" size={20} /> {t.popularConversions}
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {locale === 'ko' ? '무손실/초고속' : 'Lossless & Fast'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {[
                  { tool: 'jpg-to-png', name: 'JPG → PNG', desc: locale === 'ko' ? '투명도 지원 및 무손실' : 'Lossless with Alpha' },
                  { tool: 'png-to-jpg', name: 'PNG → JPG', desc: locale === 'ko' ? '파일 용량 대폭 감축' : 'Standard Web Photo' },
                  { tool: 'jpg-to-webp', name: 'JPG → WEBP', desc: locale === 'ko' ? '차세대 웹 최적화 포맷' : 'Next-Gen Web Format' },
                  { tool: 'png-to-webp', name: 'PNG → WEBP', desc: locale === 'ko' ? '투명도 유지 & 압축률' : 'Ultra-light Lossless' },
                  { tool: 'webp-to-jpg', name: 'WEBP → JPG', desc: locale === 'ko' ? '표준 호환성 이미지' : 'Universal JPG' },
                  { tool: 'webp-to-png', name: 'WEBP → PNG', desc: locale === 'ko' ? '고화질 래스터 그래픽' : 'Crisp PNG Output' },
                  { tool: 'gif-to-png', name: 'GIF → PNG', desc: locale === 'ko' ? '정지 프레임 추출' : 'Extract Still Frame' },
                  { tool: 'bmp-to-jpg', name: 'BMP → JPG', desc: locale === 'ko' ? '비트맵 용량 최적화' : 'Compress Bitmap' },
                  { tool: 'heic-to-jpg', name: 'HEIC → JPG', desc: locale === 'ko' ? '아이폰 사진 변환' : 'iPhone HEIC to JPG' },
                  { tool: 'svg-to-png', name: 'SVG → PNG', desc: locale === 'ko' ? '벡터를 래스터로 변환' : 'Vector to Raster' },
                ].map((item) => {
                  const isEnabled = isToolEnabled(item.tool as any);
                  return (
                    <Link
                      key={item.tool}
                      to={TOOL_TO_ROUTE[item.tool] || '/'}
                      className={cn(
                        "p-4 bg-white rounded-2xl border transition-all text-left group relative",
                        isEnabled ? "border-slate-200/80 hover:border-blue-400 hover:shadow-md" : "border-slate-200 opacity-60 pointer-events-none"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ArrowRightLeft size={14} />
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm">{item.name}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
            
            <AdUnit slot="content-middle" height="h-24" />

            {/* Featured Knowledge Guides Section */}
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
                    <BookOpen size={14} /> {locale === 'ko' ? '지식 칼럼 & 실전 팁' : 'Knowledge & Guides'}
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {locale === 'ko' ? '이미지 최적화 & 디지털 보안 실무 가이드' : 'Image Optimization & Security Guides'}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    {locale === 'ko' 
                      ? 'WebP 변환 팁, 화질 손상 없는 500KB 압축, 사진 속 위치 정보(EXIF) 삭제 등 실무 지식을 만나보세요.' 
                      : 'Explore in-depth articles on WebP optimization, lossy vs lossless compression, and EXIF privacy.'}
                  </p>
                </div>
                <Link
                  to="/guides"
                  className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
                >
                  {locale === 'ko' ? '전체 가이드 보기' : 'View all articles'} <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {GUIDE_ARTICLES.slice(0, 3).map((guide) => (
                  <article
                    key={guide.slug}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-400 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                        <span className="font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200/60">
                          {guide.category}
                        </span>
                        <span>{guide.readTime}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-blue-600 transition-colors leading-snug mb-2 line-clamp-2">
                        <Link to={`/guides/${guide.slug}`}>
                          {guide.title}
                        </Link>
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {guide.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{guide.date}</span>
                      <Link
                        to={`/guides/${guide.slug}`}
                        className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                      >
                        읽기 <ArrowRight size={12} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <SeoContentSection seo={seo} locale={locale} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {!toolEnabled ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {locale === 'ko' ? '현재 점검 중인 도구입니다.' : 'Tool under maintenance'}
                </h2>
                <p className="text-slate-500 mb-8">
                  {locale === 'ko' ? '보다 안정적인 서비스 제공을 위해 해당 기능을 잠시 점검하고 있습니다.' : 'We are performing routine maintenance on this tool. Please check back shortly.'}
                </p>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  {locale === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
                </Link>
              </div>
            ) : (
            <>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{seo.h1}</h2>
                <p className="text-slate-500 mb-6">{seo.subDescription}</p>

                <div 
                  {...getRootPropsTool()} 
                  className={cn(
                    "p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-300 py-16",
                    isDragActiveTool ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                  )}
                >
                  <input {...getInputPropsTool()} />
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    {activeTool === 'pdf-to-image' ? <FileText size={32} /> : <Upload size={32} />}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {isDragActiveTool ? (locale === 'ko' ? "여기에 파일을 놓으세요!" : "Drop files right here!") : t.dropzoneTitle}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {t.dropzoneSubtitle}
                  </p>
                </div>
              </div>
            </div>
            
            <AdUnit slot="result-page" height="h-24 md:h-32" />
            <AdUnit slot="content-bottom" height="h-24 md:h-32" />

            <SeoContentSection 
              seo={seo} 
              toolName={CONVERSIONS.find(c => c.id === activeTool)?.label || (activeTool === 'compress' ? t.navCompress : activeTool === 'resize' ? t.navResize : activeTool === 'pdf' ? t.navPdf : activeTool === 'pdf-to-image' ? t.navPdfToImage : seo.h1)} 
              locale={locale}
            />
            </>
            )}
          </div>
        )}
        </main>

        {/* Desktop Sidebar Ad Slot */}
        <aside className="hidden xl:block w-48 shrink-0">
          <div className="sticky top-24">
            <AdUnit slot="sidebar" height="h-[500px]" />
          </div>
        </aside>
      </div>
      
      <footer className="mt-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
          <AdUnit slot="footer" height="h-24" className="mb-8" />
          <AdUnit slot="mobile-only" height="h-24" className="mb-6 sm:hidden block" />

          {/* Footer Navigation Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
            {/* Col 1: Service Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  IM
                </div>
                <span className="font-extrabold text-slate-800 text-lg">
                  {locale === 'ko' ? '이미지 매직 (Image Magic)' : 'Image Magic'}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t.footerDesc}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> {t.clientSideSafe}
                </span>
                <span>•</span>
                <span>{locale === 'ko' ? '무제한 무료' : 'Unlimited Free'}</span>
              </div>
            </div>

            {/* Col 2: Major Tools */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-3">{t.featuredTools}</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link to="/compress-image" className="hover:text-blue-600 transition-colors">{t.navCompress}</Link>
                </li>
                <li>
                  <Link to="/resize-image" className="hover:text-blue-600 transition-colors">{t.navResize}</Link>
                </li>
                <li>
                  <Link to="/jpg-to-png" className="hover:text-blue-600 transition-colors">{t.navConvert}</Link>
                </li>
                <li>
                  <Link to="/image-to-pdf" className="hover:text-blue-600 transition-colors">{t.navPdf}</Link>
                </li>
                <li>
                  <Link to="/pdf-to-image" className="hover:text-blue-600 transition-colors">{t.navPdfToImage}</Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Knowledge Guides */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                <BookOpen size={16} className="text-blue-600" />
                {locale === 'ko' ? '지식 가이드 & 팁' : 'Knowledge & Tips'}
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link to="/guides" className="hover:text-blue-600 font-semibold text-blue-600 transition-colors">
                    {locale === 'ko' ? '가이드 전체 목록 →' : 'All Guides →'}
                  </Link>
                </li>
                <li>
                  <Link to="/guides/webp-vs-jpg-png-comparison" className="hover:text-blue-600 transition-colors truncate block">
                    {locale === 'ko' ? 'WebP vs JPG vs PNG 비교' : 'WebP vs JPG Comparison'}
                  </Link>
                </li>
                <li>
                  <Link to="/guides/reduce-image-size-under-1mb" className="hover:text-blue-600 transition-colors truncate block">
                    {locale === 'ko' ? '500KB 이하 사진 압축 팁' : 'Compress to 500KB'}
                  </Link>
                </li>
                <li>
                  <Link to="/guides/remove-exif-metadata-privacy" className="hover:text-blue-600 transition-colors truncate block">
                    {locale === 'ko' ? '사진 속 GPS 위치 삭제법' : 'Remove GPS Metadata'}
                  </Link>
                </li>
                <li>
                  <Link to="/guides/heic-to-jpg-browser-conversion" className="hover:text-blue-600 transition-colors truncate block">
                    {locale === 'ko' ? '아이폰 HEIC 변환 가이드' : 'iPhone HEIC to JPG Guide'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & Support */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-3">
                {locale === 'ko' ? '고객 지원 및 정책' : 'Support & Legal'}
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link to="/privacy" className="hover:text-blue-600 font-medium transition-colors">
                    {t.privacy}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-blue-600 font-medium transition-colors">
                    {t.terms}
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-blue-600 transition-colors">
                    {t.cookies}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-blue-600 transition-colors">
                    {t.contact}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>© 2026 Image Magic. All rights reserved. 100% Client-Side In-Browser Processing.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:underline">{t.privacy}</Link>
              <span>|</span>
              <Link to="/terms" className="hover:underline">{t.terms}</Link>
              <span>|</span>
              <Link to="/cookies" className="hover:underline">{t.cookies}</Link>
            </div>
          </div>
        </div>
      </footer>

      <DownloadAdModal
        isOpen={downloadModalData.isOpen}
        onCloseAndDownload={handleCloseAndDownload}
        fileName={downloadModalData.fileName}
        fileSize={downloadModalData.size}
        fileCount={downloadModalData.count}
      />

      <ReuploadAdModal
        isOpen={isReuploadModalOpen}
        onCloseAndReupload={handleCloseAndReupload}
        onCancel={() => setIsReuploadModalOpen(false)}
        currentCount={files.length}
      />

      {/* Hidden file input for reupload trigger */}
      <input
        ref={reuploadInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.heic,.heif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processDrop(Array.from(e.target.files), false);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
