import { useState, useEffect } from 'react';

export type SupportedLocale = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr' | 'de';

export interface LanguageOption {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LanguageOption[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

const STORAGE_KEY = 'imagemagic_user_locale';

/**
 * Automatically detects the user's preferred language from the browser
 */
export function detectBrowserLocale(): SupportedLocale {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'ko';
  }

  // Check saved preference first
  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
  if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
    return saved;
  }

  // Get user browser languages
  const navLangs = navigator.languages || [navigator.language || 'ko'];
  for (const rawLang of navLangs) {
    const lang = rawLang.toLowerCase();
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('de')) return 'de';
    if (lang.startsWith('en')) return 'en';
  }

  return 'en'; // default fallback for global users
}

/**
 * Save user language choice
 */
export function setUserLocale(locale: SupportedLocale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    window.dispatchEvent(new CustomEvent('locale-changed', { detail: locale }));
  }
}

/**
 * Hook to get current locale and subscribe to changes
 */
export function useLocale(): { locale: SupportedLocale; setLocale: (loc: SupportedLocale) => void } {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => detectBrowserLocale());

  useEffect(() => {
    document.documentElement.lang = locale;

    const handleLocaleChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLocale>;
      if (customEvent.detail) {
        setLocaleState(customEvent.detail);
      }
    };

    window.addEventListener('locale-changed', handleLocaleChange);
    return () => window.removeEventListener('locale-changed', handleLocaleChange);
  }, [locale]);

  const setLocale = (newLocale: SupportedLocale) => {
    setUserLocale(newLocale);
    setLocaleState(newLocale);
  };

  return { locale, setLocale };
}

export interface UiTranslations {
  appName: string;
  appTagline: string;
  home: string;
  allTools: string;
  tools: string;
  login: string;
  register: string;
  logout: string;
  admin: string;
  navConvert: string;
  navCompress: string;
  navResize: string;
  navPdf: string;
  navPdfToImage: string;
  selectFileBtn: string;
  featuredTools: string;
  popularConversions: string;
  footerDesc: string;
  clientSideSafe: string;
  privacy: string;
  terms: string;
  cookies: string;
  contact: string;
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  dropzoneBtn: string;
  dropzoneSupport: string;
  dropzoneSecurity: string;
  fileListTitle: string;
  clearAll: string;
  addMore: string;
  convertAll: string;
  downloadAllZip: string;
  downloadBtn: string;
  converting: string;
  completed: string;
  failed: string;
  original: string;
  converted: string;
  saved: string;
  ratio: string;
  quality: string;
  targetFormat: string;
  width: string;
  height: string;
  keepRatio: string;
  pdfPageSize: string;
  pdfOrientation: string;
  pdfMargin: string;
  pdfToImgFormat: string;
  pdfToImgRes: string;
  portrait: string;
  landscape: string;
  low: string;
  medium: string;
  high: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
  stepLabel: string;
  faqTitle: string;
  faqSubtitle: string;
  footerRights: string;
  footerSecureNote: string;
  toolCategories: {
    convert: string;
    compress: string;
    resize: string;
    pdf: string;
  };
  toolNames: Record<string, string>;
}

export const UI_TRANSLATIONS: Record<SupportedLocale, UiTranslations> = {
  ko: {
    appName: '이미지 매직',
    appTagline: '서버 저장 없는 100% 안전한 무료 웹 이미지 변환기',
    home: '홈',
    allTools: '전체 도구',
    tools: '도구',
    login: '로그인',
    register: '회원가입',
    logout: '로그아웃',
    admin: '관리자 콘솔',
    navConvert: '이미지 변환',
    navCompress: '이미지 압축',
    navResize: '이미지 리사이즈',
    navPdf: '이미지 → PDF',
    navPdfToImage: 'PDF → 이미지',
    selectFileBtn: '파일 선택하기',
    featuredTools: '주요 도구 바로가기',
    popularConversions: '인기 이미지 포맷 변환',
    footerDesc: '100% 브라우저 메모리 안에서 안전하게 동작하는 웹 기반 이미지 처리 전문 도구입니다. 사용자가 업로드한 원본 파일은 외부 서버로 업로드되지 않으므로 개인정보 유출 걱정 없이 안심하고 이용하실 수 있습니다.',
    clientSideSafe: '서버 무저장 (Client-Side)',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    cookies: '쿠키/광고 안내',
    contact: '문의하기',
    dropzoneTitle: '이미지 또는 PDF 파일을 여기에 끌어놓으세요',
    dropzoneSubtitle: '또는 여기를 클릭하여 컴퓨터에서 파일 선택',
    dropzoneBtn: '파일 선택하기',
    dropzoneSupport: '지원 형식: JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, PDF (대용량 일괄 처리 가능)',
    dropzoneSecurity: '🔒 100% 브라우저 내 로컬 처리 (서버로 전송되지 않아 완벽 보안)',
    fileListTitle: '업로드 및 변환 목록',
    clearAll: '전체 삭제',
    addMore: '파일 추가',
    convertAll: '작업 진행하기',
    downloadAllZip: '전체 다운로드 (ZIP)',
    downloadBtn: '다운로드',
    converting: '작업 진행 중...',
    completed: '완료됨',
    failed: '변환 실패',
    original: '원본',
    converted: '변환됨',
    saved: '절감',
    ratio: '비율',
    quality: '압축 품질',
    targetFormat: '출력 형식',
    width: '가로 너비 (px)',
    height: '세로 높이 (px)',
    keepRatio: '원본 가로세로 비율 유지',
    pdfPageSize: '용지 규격',
    pdfOrientation: '페이지 방향',
    pdfMargin: '여백 (Margin)',
    pdfToImgFormat: '추출 이미지 포맷',
    pdfToImgRes: '추출 해상도/품질',
    portrait: '세로 (Portrait)',
    landscape: '가로 (Landscape)',
    low: '표준 (빠름)',
    medium: '선명 (권장)',
    high: '초고화질 (2x)',
    pillar1Title: '100% 프라이버시 보호',
    pillar1Desc: '파일이 서버로 전송되지 않고 당신의 기기 웹 브라우저 메모리 안에서만 즉시 처리됩니다.',
    pillar2Title: '초고속 일괄 처리',
    pillar2Desc: '네트워크 업로드/다운로드 대기 시간 없이 수십 장의 고용량 이미지도 즉시 변환합니다.',
    pillar3Title: '무제한 무료 & 무손실',
    pillar3Desc: '용량 제한이나 횟수 차감 없이 최고급 알고리즘을 통해 최상의 화질을 보장합니다.',
    stepLabel: '단계',
    faqTitle: '자주 묻는 질문 (FAQ)',
    faqSubtitle: '이미지 매직 서비스 이용에 대한 궁금증을 확인하세요',
    footerRights: '모든 권리 보유.',
    footerSecureNote: '서버 무저장 안전 처리',
    toolCategories: {
      convert: '포맷 변환',
      compress: '용량 압축',
      resize: '크기 조절',
      pdf: 'PDF 작업'
    },
    toolNames: {
      compress: '이미지 압축',
      resize: '이미지 리사이즈',
      pdf: '이미지 → PDF 병합',
      'pdf-to-image': 'PDF → 이미지 추출',
      'jpg-to-png': 'JPG → PNG 변환',
      'png-to-jpg': 'PNG → JPG 변환',
      'jpg-to-webp': 'JPG → WEBP 변환',
      'png-to-webp': 'PNG → WEBP 변환',
      'webp-to-jpg': 'WEBP → JPG 변환',
      'webp-to-png': 'WEBP → PNG 변환',
      'gif-to-jpg': 'GIF → JPG 변환',
      'gif-to-png': 'GIF → PNG 변환',
      'bmp-to-jpg': 'BMP → JPG 변환',
      'bmp-to-png': 'BMP → PNG 변환',
      'svg-to-png': 'SVG → PNG 변환',
      'heic-to-jpg': 'HEIC → JPG 변환',
      'heic-to-png': 'HEIC → PNG 변환'
    }
  },
  en: {
    appName: 'Image Magic',
    appTagline: '100% Free & Safe In-Browser Image Converter without Server Uploads',
    home: 'Home',
    allTools: 'All Tools',
    tools: 'Tools',
    login: 'Login',
    register: 'Sign Up',
    logout: 'Logout',
    admin: 'Admin Console',
    navConvert: 'Convert',
    navCompress: 'Compress',
    navResize: 'Resize',
    navPdf: 'Image to PDF',
    navPdfToImage: 'PDF to Image',
    selectFileBtn: 'Select Files',
    featuredTools: 'Featured Image Tools',
    popularConversions: 'Popular Image Conversions',
    footerDesc: 'A professional web-based image processing suite that runs 100% inside your browser memory. Your files are never sent to external servers, guaranteeing complete privacy and zero data leakage.',
    clientSideSafe: 'Zero Server Upload (Client-Side)',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Notice',
    contact: 'Contact Us',
    dropzoneTitle: 'Drag & Drop Images or PDF files here',
    dropzoneSubtitle: 'or click here to select files from your computer',
    dropzoneBtn: 'Choose Files',
    dropzoneSupport: 'Supports JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, and PDF batch processing',
    dropzoneSecurity: '🔒 100% In-Browser Local Processing (Never uploaded to any server)',
    fileListTitle: 'Files List & Processing Queue',
    clearAll: 'Clear All',
    addMore: 'Add More',
    convertAll: 'Start Batch Processing',
    downloadAllZip: 'Download All (ZIP)',
    downloadBtn: 'Download',
    converting: 'Processing...',
    completed: 'Completed',
    failed: 'Failed',
    original: 'Original',
    converted: 'Converted',
    saved: 'Saved',
    ratio: 'Ratio',
    quality: 'Compression Quality',
    targetFormat: 'Output Format',
    width: 'Width (px)',
    height: 'Height (px)',
    keepRatio: 'Maintain Aspect Ratio',
    pdfPageSize: 'Page Size',
    pdfOrientation: 'Orientation',
    pdfMargin: 'Margin',
    pdfToImgFormat: 'Output Image Format',
    pdfToImgRes: 'Resolution / Quality',
    portrait: 'Portrait',
    landscape: 'Landscape',
    low: 'Standard (Fast)',
    medium: 'Crisp (Recommended)',
    high: 'High-Res (2x)',
    pillar1Title: '100% Privacy Guarantee',
    pillar1Desc: 'Files are never sent to a cloud server. Everything runs directly in your browser memory.',
    pillar2Title: 'Blazing Fast Batch Processing',
    pillar2Desc: 'No upload or download queues. Transform dozens of heavy images in seconds.',
    pillar3Title: 'Unlimited & Free Forever',
    pillar3Desc: 'No hidden limits, no paywalls, with loss-free conversion and optimal compression algorithms.',
    stepLabel: 'Step',
    faqTitle: 'Frequently Asked Questions (FAQ)',
    faqSubtitle: 'Learn more about our secure client-side image processing service',
    footerRights: 'All rights reserved.',
    footerSecureNote: '100% Safe Client-Side Processing',
    toolCategories: {
      convert: 'Format Conversion',
      compress: 'File Compression',
      resize: 'Dimension Resizer',
      pdf: 'PDF Utilities'
    },
    toolNames: {
      compress: 'Image Compressor',
      resize: 'Image Resizer',
      pdf: 'Image to PDF Merger',
      'pdf-to-image': 'PDF to Image Extractor',
      'jpg-to-png': 'JPG to PNG Converter',
      'png-to-jpg': 'PNG to JPG Converter',
      'jpg-to-webp': 'JPG to WEBP Converter',
      'png-to-webp': 'PNG to WEBP Converter',
      'webp-to-jpg': 'WEBP to JPG Converter',
      'webp-to-png': 'WEBP to PNG Converter',
      'gif-to-jpg': 'GIF to JPG Converter',
      'gif-to-png': 'GIF to PNG Converter',
      'bmp-to-jpg': 'BMP to JPG Converter',
      'bmp-to-png': 'BMP to PNG Converter',
      'svg-to-png': 'SVG to PNG Converter',
      'heic-to-jpg': 'HEIC to JPG Converter',
      'heic-to-png': 'HEIC to PNG Converter'
    }
  },
  ja: {
    appName: 'イメージマジック',
    appTagline: 'サーバー保存なし！安全で無料のブラウザ内画像変換ツール',
    home: 'ホーム',
    allTools: 'すべてのツール',
    tools: 'ツール',
    login: 'ログイン',
    register: '新規登録',
    logout: 'ログアウト',
    admin: '管理コンソール',
    navConvert: '画像変換',
    navCompress: '画像圧縮',
    navResize: 'リサイズ',
    navPdf: '画像→PDF',
    navPdfToImage: 'PDF→画像',
    selectFileBtn: 'ファイルを選択',
    featuredTools: '主要ツール一覧',
    popularConversions: '人気の画像フォーマット変換',
    footerDesc: 'ブラウザのメモリ内でのみ安全に動作するウェブベースの画像処理ツールです。アップロードした元ファイルは外部サーバーに送信されないため、個人情報漏洩の心配がなく安心してご利用いただけます。',
    clientSideSafe: 'サーバー送信なし (Client-Side)',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    cookies: 'クッキー案内',
    contact: 'お問い合わせ',
    dropzoneTitle: '画像またはPDFファイルをここにドラッグ＆ドロップ',
    dropzoneSubtitle: 'またはクリックしてパソコンからファイルを選択',
    dropzoneBtn: 'ファイルを選択',
    dropzoneSupport: '対応形式: JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, PDF（一括処理対応）',
    dropzoneSecurity: '🔒 100%ブラウザ内処理（サーバーへ送信されず完全安全）',
    fileListTitle: 'アップロードおよび変換リスト',
    clearAll: 'すべて削除',
    addMore: 'ファイル追加',
    convertAll: '変換を開始する',
    downloadAllZip: '一括ダウンロード (ZIP)',
    downloadBtn: 'ダウンロード',
    converting: '処理中...',
    completed: '完了',
    failed: '変換失敗',
    original: '元サイズ',
    converted: '変換後',
    saved: '削減',
    ratio: '比率',
    quality: '圧縮品質',
    targetFormat: '出力形式',
    width: '横幅 (px)',
    height: '縦幅 (px)',
    keepRatio: '縦横比を維持',
    pdfPageSize: '用紙サイズ',
    pdfOrientation: 'ページの向き',
    pdfMargin: '余白 (Margin)',
    pdfToImgFormat: '抽出画像形式',
    pdfToImgRes: '抽出解像度',
    portrait: '縦 (Portrait)',
    landscape: '横 (Landscape)',
    low: '標準（高速）',
    medium: '鮮明（推奨）',
    high: '超高画質 (2x)',
    pillar1Title: '完全プライバシー保護',
    pillar1Desc: 'ファイルは外部サーバーに送信されず、お使いのデバイスのブラウザ内でのみ処理されます。',
    pillar2Title: '高速一括変換',
    pillar2Desc: 'アップロード待ち時間ゼロ。数十枚の大容量画像も数秒で変換完了します。',
    pillar3Title: '無制限＆完全無料',
    pillar3Desc: '枚数や容量の制限なし。最高品質のアルゴリズムで画質を維持します。',
    stepLabel: 'ステップ',
    faqTitle: 'よくある質問 (FAQ)',
    faqSubtitle: '安心・安全な画像処理サービスに関するよくある質問',
    footerRights: 'All rights reserved.',
    footerSecureNote: '安全なローカルブラウザ処理',
    toolCategories: {
      convert: 'フォーマット変換',
      compress: '容量圧縮',
      resize: 'サイズ変更',
      pdf: 'PDFツール'
    },
    toolNames: {
      compress: '画像圧縮',
      resize: '画像リサイズ',
      pdf: '画像→PDF結合',
      'pdf-to-image': 'PDF→画像抽出',
      'jpg-to-png': 'JPG → PNG 変換',
      'png-to-jpg': 'PNG → JPG 変換',
      'jpg-to-webp': 'JPG → WEBP 変換',
      'png-to-webp': 'PNG → WEBP 変換',
      'webp-to-jpg': 'WEBP → JPG 変換',
      'webp-to-png': 'WEBP → PNG 変換',
      'gif-to-jpg': 'GIF → JPG 変換',
      'gif-to-png': 'GIF → PNG 変換',
      'bmp-to-jpg': 'BMP → JPG 変換',
      'bmp-to-png': 'BMP → PNG 変換',
      'svg-to-png': 'SVG → PNG 変換',
      'heic-to-jpg': 'HEIC → JPG 変換',
      'heic-to-png': 'HEIC → PNG 変換'
    }
  },
  zh: {
    appName: '图片魔法师',
    appTagline: '100% 浏览器本地处理，免上传服务器的安全免费图片转换器',
    home: '首页',
    allTools: '全部工具',
    tools: '工具',
    login: '登录',
    register: '注册',
    logout: '退出登录',
    admin: '管理控制台',
    navConvert: '图片转换',
    navCompress: '图片压缩',
    navResize: '修改尺寸',
    navPdf: '图片转PDF',
    navPdfToImage: 'PDF转图片',
    selectFileBtn: '选择文件',
    featuredTools: '常用图片工具',
    popularConversions: '热门格式转换',
    footerDesc: '专为安全高效设计的纯浏览器端图片处理套件。所有操作均在您的本地设备内存中完成，文件绝不上载到任何外部服务器，彻底杜绝隐私泄露风险。',
    clientSideSafe: '零服务器上传 (Client-Side)',
    privacy: '隐私政策',
    terms: '服务条款',
    cookies: 'Cookie 说明',
    contact: '联系我们',
    dropzoneTitle: '将图片或PDF文件拖放至此处',
    dropzoneSubtitle: '或点击此处从电脑选择文件',
    dropzoneBtn: '选择文件',
    dropzoneSupport: '支持 JPG、PNG、WEBP、GIF、BMP、SVG、HEIC 及 PDF 批量处理',
    dropzoneSecurity: '🔒 100% 浏览器内本地处理（不上传至云端服务器，绝对私密）',
    fileListTitle: '已添加文件与处理列表',
    clearAll: '清空列表',
    addMore: '添加文件',
    convertAll: '开始批量转换',
    downloadAllZip: '全部打包下载 (ZIP)',
    downloadBtn: '下载',
    converting: '正在处理...',
    completed: '处理完成',
    failed: '处理失败',
    original: '原大小',
    converted: '转换后',
    saved: '减少',
    ratio: '比例',
    quality: '压缩质量',
    targetFormat: '输出格式',
    width: '宽度 (px)',
    height: '高度 (px)',
    keepRatio: '保持原始宽高比',
    pdfPageSize: '页面尺寸',
    pdfOrientation: '页面方向',
    pdfMargin: '边距 (Margin)',
    pdfToImgFormat: '提取图片格式',
    pdfToImgRes: '提取分辨率',
    portrait: '纵向 (Portrait)',
    landscape: '横向 (Landscape)',
    low: '标准 (快速)',
    medium: '清晰 (推荐)',
    high: '超清 (2x)',
    pillar1Title: '100% 隐私安全保证',
    pillar1Desc: '文件无需上传至远程服务器，全部由您浏览器的本地计算能力即时完成。',
    pillar2Title: '极速批量无等待',
    pillar2Desc: '无需等待漫长的网络上下传，瞬间处理数十张高分辨率大图。',
    pillar3Title: '完全免费 无限制',
    pillar3Desc: '无次数限制，无体积水印收费，采用高保真图像算法。',
    stepLabel: '步骤',
    faqTitle: '常见问题解答 (FAQ)',
    faqSubtitle: '了解更多关于纯本地图片处理服务的信息',
    footerRights: '版权所有。',
    footerSecureNote: '安全浏览器端计算',
    toolCategories: {
      convert: '格式转换',
      compress: '体积压缩',
      resize: '尺寸调整',
      pdf: 'PDF工具'
    },
    toolNames: {
      compress: '图片压缩',
      resize: '调整图片尺寸',
      pdf: '图片合并为PDF',
      'pdf-to-image': 'PDF提取图片',
      'jpg-to-png': 'JPG 转 PNG',
      'png-to-jpg': 'PNG 转 JPG',
      'jpg-to-webp': 'JPG 转 WEBP',
      'png-to-webp': 'PNG 转 WEBP',
      'webp-to-jpg': 'WEBP 转 JPG',
      'webp-to-png': 'WEBP 转 PNG',
      'gif-to-jpg': 'GIF 转 JPG',
      'gif-to-png': 'GIF 转 PNG',
      'bmp-to-jpg': 'BMP 转 JPG',
      'bmp-to-png': 'BMP 转 PNG',
      'svg-to-png': 'SVG 转 PNG',
      'heic-to-jpg': 'HEIC 转 JPG',
      'heic-to-png': 'HEIC 转 PNG'
    }
  },
  es: {
    appName: 'Image Magic',
    appTagline: 'Convertidor de imágenes 100% gratis en el navegador sin subir al servidor',
    home: 'Inicio',
    allTools: 'Todas las herramientas',
    tools: 'Herramientas',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    admin: 'Consola de Admin',
    navConvert: 'Convertir',
    navCompress: 'Comprimir',
    navResize: 'Redimensionar',
    navPdf: 'Imagen a PDF',
    navPdfToImage: 'PDF a Imagen',
    selectFileBtn: 'Seleccionar archivos',
    featuredTools: 'Herramientas destacadas',
    popularConversions: 'Conversiones populares',
    footerDesc: 'Herramienta profesional de procesamiento de imágenes 100% en la memoria de su navegador. Sus archivos nunca se suben a servidores externos, garantizando máxima privacidad.',
    clientSideSafe: 'Sin subida al servidor (Client-Side)',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio',
    cookies: 'Aviso de Cookies',
    contact: 'Contacto',
    dropzoneTitle: 'Arrastra y suelta imágenes o archivos PDF aquí',
    dropzoneSubtitle: 'o haz clic aquí para seleccionar archivos de tu ordenador',
    dropzoneBtn: 'Seleccionar archivos',
    dropzoneSupport: 'Soporta JPG, PNG, WEBP, GIF, BMP, SVG, HEIC y PDF en lote',
    dropzoneSecurity: '🔒 Procesamiento 100% local en tu navegador (Sin subidas al servidor)',
    fileListTitle: 'Lista de archivos y procesamiento',
    clearAll: 'Borrar todo',
    addMore: 'Añadir más',
    convertAll: 'Iniciar procesamiento',
    downloadAllZip: 'Descargar todo (ZIP)',
    downloadBtn: 'Descargar',
    converting: 'Procesando...',
    completed: 'Completado',
    failed: 'Error',
    original: 'Original',
    converted: 'Convertido',
    saved: 'Ahorro',
    ratio: 'Proporción',
    quality: 'Calidad de compresión',
    targetFormat: 'Formato de salida',
    width: 'Ancho (px)',
    height: 'Alto (px)',
    keepRatio: 'Mantener relación de aspecto',
    pdfPageSize: 'Tamaño de página',
    pdfOrientation: 'Orientación',
    pdfMargin: 'Margen',
    pdfToImgFormat: 'Formato de imagen',
    pdfToImgRes: 'Resolución / Calidad',
    portrait: 'Vertical (Portrait)',
    landscape: 'Horizontal (Landscape)',
    low: 'Estándar (Rápido)',
    medium: 'Nítido (Recomendado)',
    high: 'Alta resolución (2x)',
    pillar1Title: '100% Privacidad Garantizada',
    pillar1Desc: 'Los archivos nunca se envían a ningún servidor externo. Todo se procesa en tu navegador.',
    pillar2Title: 'Procesamiento ultrarrápido',
    pillar2Desc: 'Sin colas de subida o descarga. Convierte docenas de imágenes pesadas en segundos.',
    pillar3Title: 'Ilimitado y Siempre Gratis',
    pillar3Desc: 'Sin límites ocultos ni marcas de agua, con algoritmos de máxima fidelidad visual.',
    stepLabel: 'Paso',
    faqTitle: 'Preguntas Frecuentes (FAQ)',
    faqSubtitle: 'Conoce más sobre nuestro servicio seguro en el navegador',
    footerRights: 'Todos los derechos reservados.',
    footerSecureNote: 'Procesamiento seguro local',
    toolCategories: {
      convert: 'Conversión de formato',
      compress: 'Compresión',
      resize: 'Redimensionar',
      pdf: 'Herramientas PDF'
    },
    toolNames: {
      compress: 'Compresor de imágenes',
      resize: 'Redimensionar imagen',
      pdf: 'Imágenes a PDF',
      'pdf-to-image': 'PDF a Imágenes',
      'jpg-to-png': 'JPG a PNG',
      'png-to-jpg': 'PNG a JPG',
      'jpg-to-webp': 'JPG a WEBP',
      'png-to-webp': 'PNG a WEBP',
      'webp-to-jpg': 'WEBP a JPG',
      'webp-to-png': 'WEBP a PNG',
      'gif-to-jpg': 'GIF a JPG',
      'gif-to-png': 'GIF a PNG',
      'bmp-to-jpg': 'BMP a JPG',
      'bmp-to-png': 'BMP a PNG',
      'svg-to-png': 'SVG a PNG',
      'heic-to-jpg': 'HEIC a JPG',
      'heic-to-png': 'HEIC a PNG'
    }
  },
  fr: {
    appName: 'Image Magic',
    appTagline: 'Convertisseur d\'images 100% gratuit et sécurisé dans le navigateur',
    home: 'Accueil',
    allTools: 'Tous les outils',
    tools: 'Outils',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    admin: 'Console Admin',
    navConvert: 'Convertir',
    navCompress: 'Compresser',
    navResize: 'Redimensionner',
    navPdf: 'Image en PDF',
    navPdfToImage: 'PDF en Image',
    selectFileBtn: 'Choisir des fichiers',
    featuredTools: 'Outils populaires',
    popularConversions: 'Conversions fréquentes',
    footerDesc: 'Suite de traitement d\'images professionnelle fonctionnant à 100% dans la mémoire de votre navigateur. Vos fichiers ne sont jamais téléchargés sur des serveurs externes.',
    clientSideSafe: 'Zéro upload serveur (Client-Side)',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d\'utilisation',
    cookies: 'Gestion des cookies',
    contact: 'Contact',
    dropzoneTitle: 'Glissez et déposez des images ou des fichiers PDF ici',
    dropzoneSubtitle: 'ou cliquez ici pour sélectionner des fichiers sur votre ordinateur',
    dropzoneBtn: 'Choisir des fichiers',
    dropzoneSupport: 'Prend en charge JPG, PNG, WEBP, GIF, BMP, SVG, HEIC et PDF',
    dropzoneSecurity: '🔒 Traitement 100% local dans le navigateur (Aucun envoi sur serveur)',
    fileListTitle: 'Liste des fichiers à convertir',
    clearAll: 'Tout effacer',
    addMore: 'Ajouter des fichiers',
    convertAll: 'Lancer la conversion',
    downloadAllZip: 'Tout télécharger (ZIP)',
    downloadBtn: 'Télécharger',
    converting: 'Traitement en cours...',
    completed: 'Terminé',
    failed: 'Échec',
    original: 'Original',
    converted: 'Converti',
    saved: 'Économisé',
    ratio: 'Ratio',
    quality: 'Qualité de compression',
    targetFormat: 'Format de sortie',
    width: 'Largeur (px)',
    height: 'Hauteur (px)',
    keepRatio: 'Conserver les proportions',
    pdfPageSize: 'Format de page',
    pdfOrientation: 'Orientation',
    pdfMargin: 'Marge',
    pdfToImgFormat: 'Format d\'image extrait',
    pdfToImgRes: 'Résolution / Qualité',
    portrait: 'Portrait',
    landscape: 'Paysage',
    low: 'Standard (Rapide)',
    medium: 'Net (Recommandé)',
    high: 'Haute résolution (2x)',
    pillar1Title: 'Confidentialité 100% Garantie',
    pillar1Desc: 'Les fichiers ne quittent jamais votre ordinateur. Tout est exécuté en local.',
    pillar2Title: 'Traitement par lot ultra-rapide',
    pillar2Desc: 'Aucune attente de téléversement. Convertissez des dizaines de fichiers en quelques secondes.',
    pillar3Title: 'Illimité et Toujours Gratuit',
    pillar3Desc: 'Sans restriction de taille ni filigrane payant, avec une fidélité d\'image optimale.',
    stepLabel: 'Étape',
    faqTitle: 'Foire Aux Questions (FAQ)',
    faqSubtitle: 'Tout savoir sur notre outil de traitement d\'images sécurisé',
    footerRights: 'Tous droits réservés.',
    footerSecureNote: 'Traitement local sécurisé',
    toolCategories: {
      convert: 'Conversion de format',
      compress: 'Compression',
      resize: 'Redimensionnement',
      pdf: 'Outils PDF'
    },
    toolNames: {
      compress: 'Compresseur d\'image',
      resize: 'Redimensionner image',
      pdf: 'Image en PDF',
      'pdf-to-image': 'PDF en Image',
      'jpg-to-png': 'JPG en PNG',
      'png-to-jpg': 'PNG en JPG',
      'jpg-to-webp': 'JPG en WEBP',
      'png-to-webp': 'PNG en WEBP',
      'webp-to-jpg': 'WEBP en JPG',
      'webp-to-png': 'WEBP en PNG',
      'gif-to-jpg': 'GIF en JPG',
      'gif-to-png': 'GIF en PNG',
      'bmp-to-jpg': 'BMP en JPG',
      'bmp-to-png': 'BMP en PNG',
      'svg-to-png': 'SVG en PNG',
      'heic-to-jpg': 'HEIC en JPG',
      'heic-to-png': 'HEIC en PNG'
    }
  },
  de: {
    appName: 'Image Magic',
    appTagline: '100% kostenloser & sicherer Bildkonverter im Browser ohne Server-Uploads',
    home: 'Startseite',
    allTools: 'Alle Werkzeuge',
    tools: 'Werkzeuge',
    login: 'Anmelden',
    register: 'Registrieren',
    logout: 'Abmelden',
    admin: 'Admin-Konsole',
    navConvert: 'Konvertieren',
    navCompress: 'Komprimieren',
    navResize: 'Größe ändern',
    navPdf: 'Bild zu PDF',
    navPdfToImage: 'PDF zu Bild',
    selectFileBtn: 'Dateien auswählen',
    featuredTools: 'Beliebte Werkzeuge',
    popularConversions: 'Häufige Konvertierungen',
    footerDesc: 'Professionelle Bildverarbeitung zu 100% im Arbeitsspeicher Ihres Browsers. Ihre Dateien werden niemals auf externe Server hochgeladen – für maximalen Datenschutz.',
    clientSideSafe: 'Kein Server-Upload (Client-Side)',
    privacy: 'Datenschutzerklärung',
    terms: 'Nutzungsbedingungen',
    cookies: 'Cookie-Hinweise',
    contact: 'Kontakt',
    dropzoneTitle: 'Bilder oder PDF-Dateien hierher ziehen',
    dropzoneSubtitle: 'oder klicken, um Dateien vom Computer auszuwählen',
    dropzoneBtn: 'Dateien auswählen',
    dropzoneSupport: 'Unterstützt JPG, PNG, WEBP, GIF, BMP, SVG, HEIC und PDF',
    dropzoneSecurity: '🔒 100% lokale Verarbeitung im Browser (Kein Upload auf Server)',
    fileListTitle: 'Dateiliste und Verarbeitungsübersicht',
    clearAll: 'Alles löschen',
    addMore: 'Dateien hinzufügen',
    convertAll: 'Stapelverarbeitung starten',
    downloadAllZip: 'Alle herunterladen (ZIP)',
    downloadBtn: 'Herunterladen',
    converting: 'Verarbeitung läuft...',
    completed: 'Abgeschlossen',
    failed: 'Fehlgeschlagen',
    original: 'Original',
    converted: 'Konvertiert',
    saved: 'Gespart',
    ratio: 'Seitenverhältnis',
    quality: 'Kompressionsqualität',
    targetFormat: 'Ausgabeformat',
    width: 'Breite (px)',
    height: 'Höhe (px)',
    keepRatio: 'Seitenverhältnis beibehalten',
    pdfPageSize: 'Papierformat',
    pdfOrientation: 'Ausrichtung',
    pdfMargin: 'Rand',
    pdfToImgFormat: 'Bildformat',
    pdfToImgRes: 'Auflösung / Qualität',
    portrait: 'Hochformat (Portrait)',
    landscape: 'Querformat (Landscape)',
    low: 'Standard (Schnell)',
    medium: 'Scharf (Empfohlen)',
    high: 'Hohe Auflösung (2x)',
    pillar1Title: '100% Datenschutz garantiert',
    pillar1Desc: 'Dateien verlassen niemals Ihr Gerät. Alles wird direkt im Browser verarbeitet.',
    pillar2Title: 'Blitzschnelle Stapelverarbeitung',
    pillar2Desc: 'Keine Wartezeiten beim Hochladen. Konvertieren Sie Dutzende Bilder in Sekunden.',
    pillar3Title: 'Unbegrenzt & Immer Kostenlos',
    pillar3Desc: 'Keine versteckten Beschränkungen oder Wasserzeichen, mit erstklassigen Algorithmen.',
    stepLabel: 'Schritt',
    faqTitle: 'Häufig gestellte Fragen (FAQ)',
    faqSubtitle: 'Erfahren Sie mehr über unseren sicheren Bildverarbeitungsdienst',
    footerRights: 'Alle Rechte vorbehalten.',
    footerSecureNote: 'Sichere lokale Verarbeitung',
    toolCategories: {
      convert: 'Formatkonvertierung',
      compress: 'Komprimierung',
      resize: 'Größenänderung',
      pdf: 'PDF-Werkzeuge'
    },
    toolNames: {
      compress: 'Bildkompressor',
      resize: 'Bildgröße ändern',
      pdf: 'Bild zu PDF zusammenfügen',
      'pdf-to-image': 'PDF zu Bildern extrahieren',
      'jpg-to-png': 'JPG zu PNG',
      'png-to-jpg': 'PNG zu JPG',
      'jpg-to-webp': 'JPG zu WEBP',
      'png-to-webp': 'PNG zu WEBP',
      'webp-to-jpg': 'WEBP zu JPG',
      'webp-to-png': 'WEBP zu PNG',
      'gif-to-jpg': 'GIF zu JPG',
      'gif-to-png': 'GIF zu PNG',
      'bmp-to-jpg': 'BMP zu JPG',
      'bmp-to-png': 'BMP zu PNG',
      'svg-to-png': 'SVG zu PNG',
      'heic-to-jpg': 'HEIC zu JPG',
      'heic-to-png': 'HEIC zu PNG'
    }
  }
};

export function getTranslations(locale: SupportedLocale): UiTranslations {
  return UI_TRANSLATIONS[locale] || UI_TRANSLATIONS.ko;
}
