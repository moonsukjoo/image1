import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Calendar, ArrowRight, Sparkles, Shield, Search, ArrowLeft } from 'lucide-react';
import { GUIDE_ARTICLES } from '../data/guidesData';

export function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', ...Array.from(new Set(GUIDE_ARTICLES.map(a => a.category)))];

  const filteredArticles = GUIDE_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4">
      <Helmet>
        <title>이미지 최적화 & 포맷 기술 지식 가이드 - 이미지 매직 (Image Magic)</title>
        <meta name="description" content="WebP, JPG, PNG 포맷 비교부터 사진 용량 80% 줄이기, EXIF 개인정보 삭제, HEIC 변환 노하우까지 실무 이미지 최적화 가이드를 제공합니다." />
        <meta property="og:title" content="이미지 최적화 & 포맷 기술 지식 가이드 - 이미지 매직 (Image Magic)" />
        <meta property="og:description" content="실무 웹 디자이너와 일반 사용자를 위한 이미지 변환, 압축, 개인정보 보호 전문 기술 칼럼 및 팁" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "이미지 최적화 지식 가이드",
            "description": "실무 웹 디자이너와 일반 사용자를 위한 이미지 변환, 압축, 개인정보 보호 전문 기술 칼럼",
            "publisher": {
              "@type": "Organization",
              "name": "이미지 매직 (Image Magic)"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-semibold">
            <ArrowLeft size={16} /> 메인 홈으로 돌아가기
          </Link>
          <span className="text-xs text-slate-400 font-medium">총 {GUIDE_ARTICLES.length}개의 전문 아티클</span>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 md:p-14 mb-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/30">
              <Sparkles size={14} /> 이미지 테크 & 최적화 지식 센터
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              이미지 최적화 & 변환 실전 가이드
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6">
              WebP 포맷 분석, 화질 손실 없는 80% 압축 노하우, 스마트폰 사진 메타데이터(EXIF) 개인정보 보호까지
              검증된 디지털 이미지 처리 기술과 실무 팁을 만나보세요.
            </p>

            {/* Search Box */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="궁금한 포맷이나 키워드를 검색하세요 (예: WebP, 압축, EXIF, HEIC)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? '전체 보기' : cat}
            </button>
          ))}
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <article 
              key={article.slug}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-blue-300"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h2 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-3 line-clamp-2">
                  <Link to={`/guides/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>

                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {article.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {article.keywords.slice(0, 3).map(kw => (
                    <span key={kw} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {article.date}
                </span>
                <Link
                  to={`/guides/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform"
                >
                  자세히 읽기 <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-600 font-semibold">검색 결과와 일치하는 가이드 아티클이 없습니다.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-3 text-sm text-blue-600 font-bold hover:underline"
            >
              전체 목록으로 초기화
            </button>
          </div>
        )}

        {/* Bottom Banner to Tools */}
        <div className="mt-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">가이드를 읽고 바로 이미지를 최적화해 보세요</h3>
            <p className="text-blue-100 text-sm max-w-xl">
              모든 작업은 서버 전송 없이 사용자의 브라우저 내에서 안전하고 신속하게 처리됩니다.
            </p>
          </div>
          <Link
            to="/"
            className="px-6 py-3 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-sm text-sm shrink-0"
          >
            이미지 매직 도구 모음 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
