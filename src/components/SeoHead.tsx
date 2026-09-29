import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SeoContent } from '../seo';
import { getSiteSettings } from '../lib/store';
import { SupportedLocale } from '../lib/i18n';

interface SeoHeadProps {
  seo: SeoContent;
  path?: string;
  locale?: SupportedLocale;
}

const LOCALE_OG_MAP: Record<SupportedLocale, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  ja: 'ja_JP',
  zh: 'zh_CN',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE'
};

export const SeoHead: React.FC<SeoHeadProps> = ({ seo, path = '', locale = 'ko' }) => {
  const siteSettings = getSiteSettings();

  // Consistent, stable absolute URL computation
  // Ensures canonical URL is always uniform and resilient to iframe/subdomain changes
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://imagemagic.app';

  // Clean pathname without duplicate slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullCanonicalUrl = `${origin}${cleanPath === '/' ? '' : cleanPath}`;

  // Parse search console verification tag or code
  const searchConsoleCode = siteSettings.searchConsoleCode?.trim() || '';
  let googleVerification = '';
  let naverVerification = '';

  if (searchConsoleCode) {
    const googleMatch = searchConsoleCode.match(/name=["']google-site-verification["']\s+content=["']([^"']+)["']/i);
    const naverMatch = searchConsoleCode.match(/name=["']naver-site-verification["']\s+content=["']([^"']+)["']/i);

    if (googleMatch) {
      googleVerification = googleMatch[1];
    } else if (naverMatch) {
      naverVerification = naverMatch[1];
    } else if (searchConsoleCode.startsWith('naver:')) {
      naverVerification = searchConsoleCode.replace('naver:', '').trim();
    } else {
      googleVerification = searchConsoleCode;
    }
  }

  const ogLocale = LOCALE_OG_MAP[locale] || 'en_US';

  // Schema.org WebApplication JSON-LD
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': locale === 'ko' ? (siteSettings.siteTitle || '이미지 매직') : 'Image Magic',
    'alternateName': seo.h1,
    'description': seo.description,
    'url': fullCanonicalUrl,
    'inLanguage': locale,
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 support',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': locale === 'ko' ? 'KRW' : 'USD'
    },
    'featureList': [
      locale === 'ko' ? '100% 클라이언트 메모리 처리 (서버 비저장)' : '100% Client-Side In-Browser Processing (Zero Server Upload)',
      locale === 'ko' ? 'JPG, PNG, WEBP, GIF, BMP, SVG, HEIC 다중 포맷 변환' : 'Multi-format support: JPG, PNG, WEBP, GIF, BMP, SVG, HEIC',
      locale === 'ko' ? '이미지 용량 무손실 압축' : 'Lossless & High-efficiency Image Compression',
      locale === 'ko' ? '이미지 해상도 및 비율 리사이즈' : 'Aspect Ratio Preserving Image Resizer',
      locale === 'ko' ? '이미지 PDF 병합 및 PDF 페이지 이미지 추출' : 'Image to PDF Merge & PDF Page Image Extractor'
    ]
  };

  // Schema.org FAQPage JSON-LD if FAQ exists
  const faqJsonLd = seo.faq && seo.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'inLanguage': locale,
    'mainEntity': seo.faq.map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a
      }
    }))
  } : null;

  // Schema.org HowTo JSON-LD if howToUse exists
  const howToJsonLd = seo.howToUse && seo.howToUse.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `${seo.h1} Guide`,
    'description': seo.subDescription,
    'inLanguage': locale,
    'step': seo.howToUse.map((stepText, idx) => ({
      '@type': 'HowToStep',
      'position': idx + 1,
      'name': `${locale === 'ko' ? '단계' : 'Step'} ${idx + 1}`,
      'text': stepText
    }))
  } : null;

  return (
    <Helmet>
      {/* HTML Language tag */}
      <html lang={locale} />

      {/* Basic Title & Meta */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph (Facebook, KakaoTalk, Naver, Slack, Discord, Twitter) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content={locale === 'ko' ? (siteSettings.siteTitle || '이미지 매직') : 'Image Magic'} />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />

      {/* Search Engine Verification */}
      {googleVerification && (
        <meta name="google-site-verification" content={googleVerification} />
      )}
      {naverVerification && (
        <meta name="naver-site-verification" content={naverVerification} />
      )}

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(webAppJsonLd)}
      </script>
      {faqJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      )}
      {howToJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(howToJsonLd)}
        </script>
      )}
    </Helmet>
  );
};
