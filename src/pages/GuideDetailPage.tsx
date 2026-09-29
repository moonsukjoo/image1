import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, User, Share2, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { getGuideBySlug, GUIDE_ARTICLES } from '../data/guidesData';

export function GuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getGuideBySlug(slug) : undefined;

  if (!article) {
    return <Navigate to="/guides" replace />;
  }

  const relatedArticles = GUIDE_ARTICLES.filter(a => a.slug !== article.slug).slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('가이드 링크가 클립보드에 복사되었습니다.');
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "datePublished": article.date,
    "dateModified": article.date,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "이미지 매직 (Image Magic)",
      "logo": {
        "@type": "ImageObject",
        "url": window.location.origin + "/favicon.ico"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "keywords": article.keywords.join(', ')
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4">
      <Helmet>
        <title>{article.title} - 이미지 매직 지식 가이드</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={`${article.title} - 이미지 매직 지식 가이드`} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta name="keywords" content={article.keywords.join(', ')} />
        <script type="application/ld+json">
          {JSON.stringify(articleJsonLd)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 text-sm">
          <Link 
            to="/guides" 
            className="inline-flex items-center gap-2 text-blue-600 hover:underline font-semibold"
          >
            <ArrowLeft size={16} /> 가이드 목록으로 돌아가기
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Share2 size={13} /> 링크 복사
            </button>
          </div>
        </div>

        {/* Article Header Card */}
        <header className="bg-white rounded-3xl border border-slate-200/90 p-8 md:p-12 mb-8 shadow-xs">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-lg mb-4">
            {article.category}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 font-normal">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-6 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <User size={14} className="text-blue-600" />
              {article.author}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {article.date}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {article.readTime}
            </span>
          </div>
        </header>

        {/* Main Article Body */}
        <article className="bg-white rounded-3xl border border-slate-200/90 p-8 md:p-12 mb-8 shadow-xs">
          <div 
            className="prose prose-slate max-w-none 
              prose-headings:font-extrabold prose-headings:text-slate-900
              prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base prose-p:mb-4
              prose-li:text-slate-700 prose-li:my-1
              prose-strong:text-slate-900 prose-strong:font-bold"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Related Tool Callout Box */}
          {article.relatedToolPath && (
            <div className="mt-12 p-6 md:p-8 bg-blue-50/70 border border-blue-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                  <Zap size={14} /> 관련 추천 도구
                </span>
                <h4 className="text-lg font-extrabold text-slate-900">
                  {article.relatedToolName || '브라우저에서 바로 실습해보기'}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  서버 저장 없이 브라우저에서 100% 안전하고 빠르게 직접 실행해 보세요.
                </p>
              </div>
              <Link
                to={article.relatedToolPath}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm shrink-0 inline-flex items-center gap-2"
              >
                도구 사용하기 <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Keywords / Tags */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">키워드 태그</h5>
            <div className="flex flex-wrap gap-2">
              {article.keywords.map(kw => (
                <span key={kw} className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Related Guides */}
        <section className="mt-12">
          <h3 className="text-xl font-bold text-slate-900 mb-6">함께 읽으면 좋은 추천 가이드</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map(rel => (
              <Link
                key={rel.slug}
                to={`/guides/${rel.slug}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mb-2 inline-block">
                    {rel.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                </div>
                <span className="text-xs text-slate-400 mt-4 flex items-center gap-1 font-medium">
                  <Clock size={12} /> {rel.readTime}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
