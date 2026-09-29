import { ToolId } from '../types';

export type AdSlot = 'header' | 'top' | 'content-top' | 'content-middle' | 'content-bottom' | 'sidebar' | 'result-page' | 'download-area' | 'download-modal' | 'mobile-only' | 'footer';

export interface AdSetting {
  id: AdSlot;
  name: string;
  enabled: boolean;
  code: string;
  description: string;
  device: 'all' | 'pc' | 'mobile';
}

export const DEFAULT_ADS: AdSetting[] = [
  { id: 'header', name: '헤더 (728x90 / 300x100)', enabled: false, code: '', description: '상단 네비게이션 주변', device: 'all' },
  { id: 'top', name: '상단 (728x90 / 300x100)', enabled: false, code: '', description: '페이지 타이틀 아래', device: 'all' },
  { id: 'content-top', name: '본문 상단 (728x90 / 300x250)', enabled: false, code: '', description: '업로드 영역 위', device: 'all' },
  { id: 'content-middle', name: '본문 중간 (300x250)', enabled: false, code: '', description: '주요 도구 사이', device: 'all' },
  { id: 'content-bottom', name: '본문 하단 (300x250)', enabled: false, code: '', description: '사용 방법 위', device: 'all' },
  { id: 'sidebar', name: '사이드바 (160x600)', enabled: false, code: '', description: '양측 여백', device: 'pc' },
  { id: 'result-page', name: '결과 페이지 (300x250)', enabled: false, code: '', description: '결과 화면 상/하단', device: 'all' },
  { id: 'download-area', name: '다운로드 영역 (300x250)', enabled: false, code: '', description: '다운로드 버튼 주변', device: 'all' },
  { id: 'download-modal', name: '다운로드 팝업 모달 (300x250)', enabled: false, code: '', description: '다운로드 클릭 시 노출', device: 'all' },
  { id: 'mobile-only', name: '모바일 전용 (300x100)', enabled: false, code: '', description: '모바일 화면 하단 고정', device: 'mobile' },
  { id: 'footer', name: '푸터 (728x90 / 300x100)', enabled: false, code: '', description: '페이지 최하단', device: 'all' },
];

export const ALL_TOOLS: { id: ToolId; name: string }[] = [
  { id: 'compress', name: '이미지 압축' },
  { id: 'resize', name: '이미지 크기 조절' },
  { id: 'crop', name: '이미지 잘라내기' },
  { id: 'rotate', name: '이미지 회전 & 반전' },
  { id: 'photo-editor', name: '포토 에디터 & 필터' },
  { id: 'watermark', name: '워터마크 서명' },
  { id: 'blur-face', name: '얼굴 흐리기 (모자이크)' },
  { id: 'remove-bg', name: '배경 제거 (누끼)' },
  { id: 'meme', name: '밈 만들기' },
  { id: 'upscale', name: '이미지 업스케일' },
  { id: 'html-to-image', name: 'HTML에서 이미지' },
  { id: 'pdf', name: '이미지 → PDF' },
  { id: 'pdf-to-image', name: 'PDF → 이미지' },
  { id: 'jpg-to-png', name: 'JPG → PNG' },
  { id: 'png-to-jpg', name: 'PNG → JPG' },
  { id: 'heic-to-jpg', name: 'HEIC → JPG' },
  { id: 'heic-to-png', name: 'HEIC → PNG' },
  { id: 'jpg-to-webp', name: 'JPG → WEBP' },
  { id: 'png-to-webp', name: 'PNG → WEBP' },
  { id: 'webp-to-jpg', name: 'WEBP → JPG' },
  { id: 'webp-to-png', name: 'WEBP → PNG' },
  { id: 'gif-to-jpg', name: 'GIF → JPG' },
  { id: 'gif-to-png', name: 'GIF → PNG' },
  { id: 'bmp-to-jpg', name: 'BMP → JPG' },
  { id: 'bmp-to-png', name: 'BMP → PNG' },
  { id: 'svg-to-png', name: 'SVG → PNG' }
];

export function formatToolName(toolKey: string): string {
  if (!toolKey) return '이미지 처리';
  const match = ALL_TOOLS.find(t => t.id === toolKey || t.name === toolKey);
  if (match) return match.name;
  if (toolKey === 'compress') return '이미지 압축';
  if (toolKey === 'resize') return '이미지 크기 조절';
  if (toolKey === 'pdf') return '이미지 → PDF';
  if (toolKey === 'pdf-to-image') return 'PDF → 이미지';
  if (toolKey === 'crop') return '이미지 잘라내기';
  if (toolKey === 'rotate') return '이미지 회전 & 반전';
  if (toolKey === 'photo-editor') return '포토 에디터 & 필터';
  if (toolKey === 'watermark') return '워터마크 서명';
  if (toolKey === 'blur-face') return '얼굴 흐리기 (모자이크)';
  if (toolKey === 'remove-bg') return '배경 제거 (누끼)';
  if (toolKey === 'meme') return '밈 만들기';
  if (toolKey === 'upscale') return '이미지 업스케일';
  if (toolKey === 'html-to-image') return 'HTML 카드 이미지';
  return toolKey;
}

export function getAdSettings(): AdSetting[] {
  const stored = localStorage.getItem('adSettings');
  if (stored) {
    try {
      const parsed: AdSetting[] = JSON.parse(stored);
      const merged = DEFAULT_ADS.map(def => {
        const existing = parsed.find(p => p.id === def.id);
        return existing || def;
      });
      return merged;
    } catch (e) {
      return DEFAULT_ADS;
    }
  }
  return DEFAULT_ADS;
}

export function saveAdSettings(settings: AdSetting[]) {
  localStorage.setItem('adSettings', JSON.stringify(settings));
}

export function getToolSettings(): Record<ToolId, boolean> {
  const stored = localStorage.getItem('toolSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      //
    }
  }
  
  const defaults: Record<string, boolean> = {};
  ALL_TOOLS.forEach(t => defaults[t.id] = true);
  return defaults as Record<ToolId, boolean>;
}

export function saveToolSettings(settings: Record<ToolId, boolean>) {
  localStorage.setItem('toolSettings', JSON.stringify(settings));
}

export function isToolEnabled(toolId: ToolId | null): boolean {
  if (!toolId) return true;
  const settings = getToolSettings();
  return settings[toolId] !== false;
}

export interface ProcessLog {
  id: string;
  timestamp: string; // ISO string
  tool: string; // e.g. '이미지 압축', 'JPG → PNG'
  format: string; // e.g. 'image/jpeg', 'PNG'
  fileSize: number; // bytes
  status: 'success' | 'error';
  durationMs?: number;
}

const MAX_LOGS = 200;

export function getProcessLogs(): ProcessLog[] {
  const stored = localStorage.getItem('processLogs');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      //
    }
  }
  return [];
}

export function addProcessLog(log: Omit<ProcessLog, 'id' | 'timestamp'>) {
  try {
    const logs = getProcessLogs();
    const newEntry: ProcessLog = {
      ...log,
      tool: formatToolName(log.tool),
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem('processLogs', JSON.stringify(updated));

    // Dispatch global event for live admin dashboard synchronization
    window.dispatchEvent(new CustomEvent('image-magic-log-updated', { detail: newEntry }));
  } catch (e) {
    console.error('Failed to save log', e);
  }
}

export function clearProcessLogs() {
  localStorage.removeItem('processLogs');
  window.dispatchEvent(new CustomEvent('image-magic-log-updated'));
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  maxUploadMb: number;
  googleAnalyticsId: string;
  searchConsoleCode: string;
  enableSafetyValidation: boolean;
  defaultCompressQuality: number;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: '이미지 매직 (Image Magic)',
  siteDescription: '서버 업로드 없이 브라우저에서 안전하게 이미지 변환, 압축, 리사이즈, PDF 병합/추출을 수행할 수 있는 무료 온라인 도구입니다.',
  maxUploadMb: 100,
  googleAnalyticsId: '',
  searchConsoleCode: '',
  enableSafetyValidation: true,
  defaultCompressQuality: 80,
};

export function getSiteSettings(): SiteSettings {
  const stored = localStorage.getItem('siteSettings');
  if (stored) {
    try {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      return DEFAULT_SITE_SETTINGS;
    }
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(settings: SiteSettings) {
  localStorage.setItem('siteSettings', JSON.stringify(settings));
}

export function getCustomSeoOverrides(): Record<string, any> {
  const stored = localStorage.getItem('customSeoSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return {};
    }
  }
  return {};
}

export function saveCustomSeoOverrides(overrides: Record<string, any>) {
  localStorage.setItem('customSeoSettings', JSON.stringify(overrides));
}

// ==========================================
// 100% Real Analytics & Live Metrics Engine
// ==========================================

const VISITOR_STORAGE_KEY = 'image_magic_visitor_stats';
const SESSION_VISIT_KEY = 'image_magic_visited_session';

interface DailyVisitMap {
  [dateStr: string]: number; // 'YYYY-MM-DD': count
}

export function recordVisit(): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sessionKey = `${SESSION_VISIT_KEY}_${today}`;
    
    let visits: DailyVisitMap = {};
    const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (raw) {
      try { visits = JSON.parse(raw); } catch (e) {}
    }

    // Record session visit
    if (!sessionStorage.getItem(sessionKey)) {
      visits[today] = (visits[today] || 0) + 1;
      sessionStorage.setItem(sessionKey, '1');
      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visits));
      window.dispatchEvent(new CustomEvent('image-magic-visit-updated'));
    }
  } catch (e) {
    // Ignore storage errors
  }
}

export function getVisitorAnalytics(): {
  todayVisitors: number;
  totalVisitors: number;
  dailyTrend: { name: string; visitors: number }[];
} {
  const today = new Date().toISOString().split('T')[0];
  let visits: DailyVisitMap = {};
  const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
  if (raw) {
    try { visits = JSON.parse(raw); } catch (e) {}
  }

  // Calculate real daily visits for past 7 days
  const dailyTrend: { name: string; visitors: number }[] = [];
  let totalVisitors = 0;

  // Sum all historical visits
  Object.values(visits).forEach(v => {
    totalVisitors += v;
  });

  // Ensure total visitors has at least current counted visits
  const todayVisitors = visits[today] || 1;
  if (totalVisitors === 0) totalVisitors = todayVisitors;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    
    const count = visits[dateStr] !== undefined ? visits[dateStr] : (dateStr === today ? todayVisitors : 0);
    dailyTrend.push({
      name: label,
      visitors: count
    });
  }

  return {
    todayVisitors,
    totalVisitors,
    dailyTrend
  };
}

export interface DashboardMetrics {
  todayVisitors: number;
  totalVisitors: number;
  todayFilesProcessed: number;
  totalFilesProcessed: number;
  todayCompressCount: number;
  totalCompressCount: number;
  todayPdfCount: number;
  totalPdfCount: number;
  todayResizeCount: number;
  totalResizeCount: number;
  todayConvertCount: number;
  totalConvertCount: number;
  dailyVisitorsChart: { name: string; visitors: number }[];
  toolUsageChart: { name: string; value: number }[];
  recentLogs: ProcessLog[];
  isRealDataOnly: boolean;
}

export function getDashboardMetrics(): DashboardMetrics {
  const visitorStats = getVisitorAnalytics();
  const logs = getProcessLogs();
  
  const todayPrefix = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.timestamp && l.timestamp.startsWith(todayPrefix));
  
  // Real counts calculated directly from actual logs
  const todayFilesProcessed = todayLogs.length;
  const totalFilesProcessed = logs.length;

  const todayCompressCount = todayLogs.filter(l => 
    l.tool.includes('압축') || l.tool.toLowerCase().includes('compress')
  ).length;
  const totalCompressCount = logs.filter(l => 
    l.tool.includes('압축') || l.tool.toLowerCase().includes('compress')
  ).length;

  const todayPdfCount = todayLogs.filter(l => 
    l.tool.includes('PDF') || l.tool.toLowerCase().includes('pdf')
  ).length;
  const totalPdfCount = logs.filter(l => 
    l.tool.includes('PDF') || l.tool.toLowerCase().includes('pdf')
  ).length;

  const todayResizeCount = todayLogs.filter(l => 
    l.tool.includes('크기') || l.tool.includes('리사이즈') || l.tool.includes('자르기') || 
    l.tool.includes('회전') || l.tool.includes('워터마크') || l.tool.includes('모자이크') || 
    l.tool.includes('배경') || l.tool.includes('밈') || l.tool.includes('업스케일') || 
    l.tool.includes('에디터') || l.tool.toLowerCase().includes('resize') || l.tool.toLowerCase().includes('crop')
  ).length;
  const totalResizeCount = logs.filter(l => 
    l.tool.includes('크기') || l.tool.includes('리사이즈') || l.tool.includes('자르기') || 
    l.tool.includes('회전') || l.tool.includes('워터마크') || l.tool.includes('모자이크') || 
    l.tool.includes('배경') || l.tool.includes('밈') || l.tool.includes('업스케일') || 
    l.tool.includes('에디터') || l.tool.toLowerCase().includes('resize') || l.tool.toLowerCase().includes('crop')
  ).length;

  const todayConvertCount = todayLogs.filter(l => 
    l.tool.includes('→') || l.tool.includes('변환')
  ).length;
  const totalConvertCount = logs.filter(l => 
    l.tool.includes('→') || l.tool.includes('변환')
  ).length;

  // Tool usage distribution dynamically computed directly from real logs
  const compressLogsCount = totalCompressCount;
  const convertLogsCount = totalConvertCount;
  const resizeLogsCount = totalResizeCount;
  const pdfLogsCount = totalPdfCount;

  let toolUsageChart = [
    { name: '이미지 압축', value: compressLogsCount },
    { name: '이미지 변환', value: convertLogsCount },
    { name: '이미지 리사이즈/편집', value: resizeLogsCount },
    { name: 'PDF 변환', value: pdfLogsCount },
  ];

  // If no logs yet, provide 0 values or clean representation
  const totalLoggedActions = compressLogsCount + convertLogsCount + resizeLogsCount + pdfLogsCount;
  if (totalLoggedActions === 0) {
    toolUsageChart = [
      { name: '이미지 압축', value: 0 },
      { name: '이미지 변환', value: 0 },
      { name: '이미지 리사이즈/편집', value: 0 },
      { name: 'PDF 변환', value: 0 },
    ];
  }

  return {
    todayVisitors: visitorStats.todayVisitors,
    totalVisitors: visitorStats.totalVisitors,
    todayFilesProcessed,
    totalFilesProcessed,
    todayCompressCount,
    totalCompressCount,
    todayPdfCount,
    totalPdfCount,
    todayResizeCount,
    totalResizeCount,
    todayConvertCount,
    totalConvertCount,
    dailyVisitorsChart: visitorStats.dailyTrend,
    toolUsageChart,
    recentLogs: logs.slice(0, 10),
    isRealDataOnly: true
  };
}

export function resetAllAnalyticsData(): void {
  localStorage.removeItem('processLogs');
  localStorage.removeItem(VISITOR_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_VISIT_KEY);
  window.dispatchEvent(new CustomEvent('image-magic-log-updated'));
  window.dispatchEvent(new CustomEvent('image-magic-visit-updated'));
}
