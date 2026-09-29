const fs = require('fs');
const content = `import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Upload, FileImage, FileText, Download, Trash2, 
  RefreshCw, FileArchive, ArrowRight, Loader2, CheckCircle, AlertCircle, Sparkles, Globe, Crop, RotateCw, FlipHorizontal, Contrast, Printer, FileSearch, Palette, SplitSquareHorizontal, Grid, Info, Maximize, GripVertical
} from 'lucide-react';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn, formatSize } from './lib/utils';
import { FileItem, ToolId, ConversionSpec, AppSettings } from './types';
import { compressImage, convertImage, createPdfFromImages, resizeImage, convertPdfToImages } from './lib/processor';
import { AdUnit } from './components/AdUnit';
import { getSeoData } from './seo';

const ROUTE_TO_TOOL: Record<string, ToolId> = {
  '/compress-image': 'compress',
  '/resize-image': 'resize',
  '/image-to-pdf': 'pdf',
  '/pdf-to-image': 'pdf-to-image',
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

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-center gap-4 p-4 bg-white border rounded-2xl shadow-sm transition-shadow", isDragging ? "border-blue-400 shadow-lg" : "border-slate-200")}>
      <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
        <GripVertical size={20} />
      </div>
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
        <img src={file.previewUrl} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex-1 w-full min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800 mb-1">{file.originalFile.name}</p>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>{formatSize(file.originalSize)}</span>
        </div>
      </div>
      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(file.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
  
  const activeTool = ROUTE_TO_TOOL[location.pathname] || null;
  const view = activeTool ? 'tool' : 'home';
  const seo = getSeoData(activeTool);

  const [files, setFiles] = useState<FileItem[]>([]);
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
    resizeQuality: 85
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfResult, setPdfResult] = useState<{blob: Blob, url: string, size: number} | null>(null);

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
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigateToTool = (tool: ToolId) => {
    const route = TOOL_TO_ROUTE[tool];
    if (route) {
      navigate(route);
      window.scrollTo(0, 0);
    }
    setFiles([]);
    setPdfResult(null);
  };

  const processDrop = async (acceptedFiles: File[], autoRoute: boolean = false) => {
    if (acceptedFiles.length === 0) return;
    
    if (autoRoute && view === 'home') {
      const hasPdf = acceptedFiles.some(f => f.type === "application/pdf");
      if (hasPdf) {
        navigateToTool('pdf-to-image');
      } else {
        navigateToTool('compress');
      }
    }

    const newItems: FileItem[] = [];
    for (const file of acceptedFiles) {
      const isPdf = file.type === "application/pdf";
      let url = "";
      if (!isPdf) url = URL.createObjectURL(file);
      
      let width = 0, height = 0;
      if (!isPdf) {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { width = img.width; height = img.height; resolve(null); };
            img.onerror = reject;
            img.src = url;
          });
        } catch (e) {}
      }

      newItems.push({
        id: Math.random().toString(36).substring(7),
        originalFile: file,
        originalSize: file.size,
        previewUrl: url,
        status: 'idle',
        progress: 0,
        width,
        height
      });
    }

    setFiles(prev => {
      const merged = [...prev, ...newItems];
      if (activeTool === 'resize' && merged.length > 0 && merged[0].width && merged[0].height) {
        setSettings(s => ({
          ...s, resizeWidth: merged[0].width, resizeHeight: merged[0].height
        }));
      }
      return merged;
    });
  };

  const onDropTool = useCallback((acceptedFiles: File[]) => processDrop(acceptedFiles, false), [activeTool, view]);
  const onDropHome = useCallback((acceptedFiles: File[]) => processDrop(acceptedFiles, true), [activeTool, view]);

  const { getRootProps: getRootPropsHome, getInputProps: getInputPropsHome, isDragActive: isDragActiveHome } = useDropzone({
    onDrop: onDropHome, accept: { "image/*": [], "application/pdf": [".pdf"] }
  });

  const { getRootProps: getRootPropsTool, getInputProps: getInputPropsTool, isDragActive: isDragActiveTool } = useDropzone({
    onDrop: onDropTool, accept: activeTool === 'pdf-to-image' ? { "application/pdf": [".pdf"] } : { "image/*": [] }
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const currentConversionSpec = CONVERSIONS.find(c => c.id === activeTool);

  const handleProcessSingle = async (fileId: string) => {
    const fileItem = files.find(f => f.id === fileId);
    if (!fileItem || fileItem.status === "success") return;

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "processing", progress: 0 } : f));
    
    try {
      let resultBlob: Blob;
      if (activeTool === 'compress') {
        resultBlob = await compressImage(fileItem.originalFile, settings.compressQuality, (p) => setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: p } : f)));
      } else if (activeTool === 'resize') {
        let finalW = settings.resizeWidth;
        let finalH = settings.resizeHeight;
        resultBlob = await resizeImage(fileItem.originalFile, finalW, finalH, settings.resizeFormat, settings.resizeQuality, (p) => setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: p } : f)));
      } else if (currentConversionSpec) {
        resultBlob = await convertImage(fileItem.originalFile, currentConversionSpec.toFormat, (p) => setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: p } : f)));
      } else {
        throw new Error("알 수 없는 작업입니다.");
      }
      
      const resultUrl = URL.createObjectURL(resultBlob);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "success", progress: 100, resultBlob, resultUrl, resultSize: resultBlob.size } : f));
    } catch (err: any) {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error", errorMessage: err.message || "처리 실패" } : f));
    }
  };

  const resetFile = (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "idle", progress: 0, resultBlob: undefined, resultUrl: undefined, resultSize: undefined } : f));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      if (activeTool === "pdf") {
        const p = (pct: number) => {
           // Not doing global progress bar to avoid UI block
        };
        const blob = await createPdfFromImages(files.map(f => f.previewUrl), settings.pdfPageSize, settings.pdfOrientation, settings.pdfMargin, p);
        setPdfResult({ blob, url: URL.createObjectURL(blob), size: blob.size });
      } else if (activeTool === "pdf-to-image") {
        const file = files[0].originalFile;
        const p = (pct: number) => {};
        const images = await convertPdfToImages(file, settings.pdfToImageFormat, settings.pdfToImageResolution, p);
        
        const newFiles: FileItem[] = images.map((blob, idx) => {
          const url = URL.createObjectURL(blob);
          const ext = settings.pdfToImageFormat.split("/")[1];
          return {
            id: Math.random().toString(36).substring(7),
            originalFile: new File([blob], "page_" + (idx + 1) + "." + ext, { type: blob.type }),
            originalSize: file.size,
            previewUrl: url,
            status: "success",
            progress: 100,
            resultBlob: blob,
            resultSize: blob.size,
            resultUrl: url,
            fileName: file.name.split(".")[0] + "_page_" + (idx + 1) + "." + ext
          };
        });
        setFiles(newFiles);
      } else {
        // Process all simultaneously but properly yield
        for (const file of files) {
          if (file.status !== "success") {
             await handleProcessSingle(file.id);
          }
        }
      }
    } catch (err) {
      alert("전체 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAllAsZip = async () => {
    const zip = new JSZip();
    let hasFiles = false;
    
    files.forEach(f => {
      if (f.status === "success" && f.resultBlob) {
        const ext = f.resultBlob.type.split("/")[1] || "jpg";
        const fileName = f.fileName || f.originalFile.name.split(".")[0] + "_processed." + ext;
        zip.file(fileName, f.resultBlob);
        hasFiles = true;
      }
    });

    if (hasFiles) {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "image_magic_results.zip");
    }
  };

  const getTargetExt = (f: FileItem) => {
    if (activeTool === "resize") return settings.resizeFormat.split("/")[1] || "jpg";
    if (activeTool === "pdf-to-image") return settings.pdfToImageFormat.split("/")[1] || "jpg";
    return currentConversionSpec ? currentConversionSpec.ext : (f.resultBlob?.type.split("/")[1] || "jpg");
  };

  const handleDownloadAllIndividual = async () => {
    if (files.length > 5) {
      handleDownloadAllAsZip();
      return;
    }
    files.forEach(f => {
      if (f.status === "success" && f.resultBlob) {
        const fileName = f.fileName || f.originalFile.name.split(".")[0] + "_processed." + getTargetExt(f);
        saveAs(f.resultBlob, fileName);
      }
    });
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-slate-50 text-slate-900 pb-20">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" onClick={() => { setFiles([]); setPdfResult(null); }} className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles size={18} />
              </div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight hidden sm:block">이미지 매직</h1>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
              <Link to={TOOL_TO_ROUTE['jpg-to-png']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors", activeTool === 'jpg-to-png' && "bg-slate-100 text-blue-600")}>이미지 변환</Link>
              <Link to={TOOL_TO_ROUTE['compress']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors", activeTool === 'compress' && "bg-slate-100 text-blue-600")}>이미지 압축</Link>
              <Link to={TOOL_TO_ROUTE['resize']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors", activeTool === 'resize' && "bg-slate-100 text-blue-600")}>이미지 리사이즈</Link>
              <Link to={TOOL_TO_ROUTE['pdf']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors", activeTool === 'pdf' && "bg-slate-100 text-blue-600")}>이미지 → PDF</Link>
              <Link to={TOOL_TO_ROUTE['pdf-to-image']} onClick={() => { setFiles([]); setPdfResult(null); }} className={cn("px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors", activeTool === 'pdf-to-image' && "bg-slate-100 text-blue-600")}>PDF → 이미지</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <AdUnit slot="top" height="h-24 md:h-32" />

        {view === 'home' ? (
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
                  "max-w-3xl mx-auto p-12 md:p-20 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-300 shadow-sm",
                  isDragActiveHome ? "border-blue-500 bg-blue-50 scale-105" : "border-slate-300 bg-white hover:border-blue-400 hover:shadow-md"
                )}
              >
                <input {...getInputPropsHome()} />
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Upload size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  {isDragActiveHome ? "여기에 파일을 놓으세요!" : "이미지를 여기에 끌어놓으세요"}
                </h3>
                <p className="text-slate-500 font-medium text-sm md:text-base">
                  또는 여기를 클릭하여 파일을 선택하세요
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Sparkles className="text-blue-600" /> 주요 도구
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to={TOOL_TO_ROUTE['compress']} className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all text-center group">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform"><FileArchive size={32} /></div>
                  <h4 className="font-bold text-slate-800">이미지 압축</h4>
                </Link>
                <Link to={TOOL_TO_ROUTE['resize']} className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all text-center group">
                  <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform"><Maximize size={32} /></div>
                  <h4 className="font-bold text-slate-800">이미지 리사이즈</h4>
                </Link>
                <Link to={TOOL_TO_ROUTE['pdf']} className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all text-center group">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform"><FileText size={32} /></div>
                  <h4 className="font-bold text-slate-800">이미지 → PDF</h4>
                </Link>
                <Link to={TOOL_TO_ROUTE['pdf-to-image']} className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all text-center group">
                  <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform"><FileImage size={32} /></div>
                  <h4 className="font-bold text-slate-800">PDF → 이미지</h4>
                </Link>
              </div>
            </section>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{seo.h1}</h2>
                <p className="text-slate-500 mb-6">{seo.subDescription}</p>

                {files.length === 0 && (
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
                      {isDragActiveTool ? "여기에 파일을 놓으세요!" : "파일을 여기에 드롭하거나 클릭하여 선택하세요"}
                    </h3>
                  </div>
                )}

                {files.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-slate-800">
                          {activeTool === 'pdf-to-image' && files[0]?.status === 'success' ? '추출된 이미지' : '업로드된 파일'} ({files.length})
                        </h3>
                        {activeTool !== 'pdf-to-image' && (
                          <div {...getRootPropsTool()} className="cursor-pointer">
                            <input {...getInputPropsTool()} />
                            <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                              <Upload size={14} /> 파일 추가
                            </button>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => { setFiles([]); setPdfResult(null); }}
                        className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={14} /> 전체 지우기
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-2 rounded-xl">
                      {activeTool === 'pdf' ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                            {files.map(file => (
                              <SortableFileItem key={file.id} file={file} onRemove={removeFile} />
                            ))}
                          </SortableContext>
                        </DndContext>
                      ) : (
                        files.map(file => (
                          <div key={file.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center w-full sm:w-auto gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 relative group">
                                {file.previewUrl ? <img src={file.previewUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><FileImage size={24} /></div>}
                              </div>
                              <div className="flex-1 w-full min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800 mb-1">{file.fileName || file.originalFile.name}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                                  <div className="flex items-center gap-2">
                                    <span>크기: {formatSize(file.originalSize)}</span>
                                    {file.resultSize && (
                                      <>
                                        <ArrowRight size={12} className="text-slate-300" />
                                        <span className={cn("px-2 py-0.5 rounded-md", file.resultSize > file.originalSize ? "text-amber-700 bg-amber-50" : "text-blue-700 bg-blue-50")}>
                                          {formatSize(file.resultSize)}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {file.width && file.height && <span>해상도: {file.width} × {file.height}</span>}
                                </div>
                                <div className="mt-2 text-xs font-bold">
                                  {file.status === 'idle' && <span className="text-slate-500">상태: 변환 준비</span>}
                                  {file.status === 'processing' && <span className="text-blue-600">변환 중입니다... (진행률: {file.progress}%)</span>}
                                  {file.status === 'success' && <span className="text-green-600">상태: 변환 완료</span>}
                                  {file.status === 'error' && <span className="text-red-500">변환 실패: {file.errorMessage}</span>}
                                </div>
                                {file.status === 'processing' && (
                                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: file.progress + "%" }} />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-3 sm:mt-0 ml-auto">
                              {file.status === 'idle' && activeTool !== 'pdf-to-image' && (
                                <button onClick={() => handleProcessSingle(file.id)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">변환</button>
                              )}
                              {file.status === 'success' && file.resultBlob && (
                                <>
                                  {activeTool !== 'pdf-to-image' && (
                                    <button onClick={() => resetFile(file.id)} className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">다시 변환</button>
                                  )}
                                  <button onClick={() => saveAs(file.resultBlob!, file.fileName || file.originalFile.name.split(".")[0] + "_processed." + getTargetExt(file))} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                                    <Download size={16} /> 다운로드
                                  </button>
                                </>
                              )}
                              <button onClick={() => removeFile(file.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                      {files.every(f => f.status === 'success') && (
                        <>
                          {files.length > 1 && (
                            <button onClick={handleDownloadAllAsZip} className="px-6 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 shadow-sm">
                              <FileArchive size={20} /> 전체 다운로드 (ZIP)
                            </button>
                          )}
                          <button onClick={handleDownloadAllIndividual} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-green-200">
                            <Download size={20} /> 전체 다운로드
                          </button>
                        </>
                      )}
                      
                      {activeTool !== 'pdf-to-image' && (
                        <button onClick={handleProcess} disabled={isProcessing || files.every(f => f.status === 'success')} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 ml-auto">
                          {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                          {activeTool === 'pdf' ? 'PDF 병합 시작하기' : '선택한 작업 일괄 실행'}
                        </button>
                      )}
                      {activeTool === 'pdf-to-image' && !files.some(f => f.status === 'success') && (
                        <button onClick={handleProcess} disabled={isProcessing} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 ml-auto">
                          {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                          이미지로 추출 시작
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
               <h3 className="text-xl font-bold text-slate-800 mb-4">{seo.title} 사용 방법</h3>
               <div className="prose prose-slate max-w-none mb-8 text-slate-600">
                 {seo.howTo.map((step, idx) => (
                   <p key={idx}><b>{idx + 1}.</b> {step.text}</p>
                 ))}
               </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-20 border-t border-slate-200 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 이미지 매직 (Image Magic). 모든 파일은 브라우저에서 안전하게 처리되며 서버로 전송되지 않습니다.</p>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-blue-600 font-semibold transition-colors">관리자 로그인</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
`
fs.writeFileSync('src/App.tsx', content);
