export type Category = 'home' | 'tool';

export type ToolCategory = 'all' | 'optimize' | 'create' | 'edit' | 'convert' | 'security';

export type ToolId = 
  | 'compress' 
  | 'pdf'
  | 'pdf-to-image'
  | 'resize'
  | 'crop'
  | 'rotate'
  | 'photo-editor'
  | 'watermark'
  | 'blur-face'
  | 'remove-bg'
  | 'meme'
  | 'upscale'
  | 'html-to-image'
  | 'jpg-to-png' | 'png-to-jpg' | 'jpg-to-webp' | 'png-to-webp' 
  | 'webp-to-jpg' | 'webp-to-png' | 'gif-to-jpg' | 'gif-to-png' 
  | 'bmp-to-jpg' | 'bmp-to-png' | 'svg-to-png' | 'heic-to-jpg' 
  | 'heic-to-png';

export interface ConversionSpec {
  id: ToolId;
  label: string;
  fromFormat: string;
  toFormat: string;
  ext: string;
}

export interface FileItem {
  id: string;
  originalFile: File;
  originalSize: number;
  previewUrl: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  errorMessage?: string;
  width?: number;
  height?: number;
  // Used for PDF to Image output pages
  fileName?: string;
}

export interface AppSettings {
  compressQuality: number;
  
  pdfPageSize: 'a4' | 'letter' | 'fit';
  pdfOrientation: 'p' | 'l';
  pdfMargin: number;
  
  pdfToImageFormat: 'image/jpeg' | 'image/png';
  pdfToImageResolution: 'low' | 'medium' | 'high';
  
  resizeWidth: number;
  resizeHeight: number;
  resizeKeepRatio: boolean;
  resizePercentage: number;
  resizeFormat: string;
  resizeQuality: number;

  // New Tool Settings
  cropRatio: 'free' | '1:1' | '16:9' | '4:3' | '9:16';
  rotateAngle: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  
  // Photo Editor Filters
  brightness: number; // 0 to 200 (100 normal)
  contrast: number; // 0 to 200 (100 normal)
  saturation: number; // 0 to 200 (100 normal)
  grayscale: boolean;
  sepia: boolean;
  blur: number; // 0 to 20
  invert: boolean;
  
  // Watermark
  watermarkText: string;
  watermarkColor: string;
  watermarkSize: number;
  watermarkOpacity: number; // 0.1 to 1.0
  watermarkPosition: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  // Face Blur / Mosaic
  mosaicIntensity: number; // 5 to 50
  
  // Remove Background
  removeBgTolerance: number; // 1 to 100
  
  // Meme
  memeTopText: string;
  memeBottomText: string;
  memeFontSize: number;
  
  // Upscale
  upscaleFactor: 2 | 4;

  // HTML to Image
  htmlContent: string;
}
