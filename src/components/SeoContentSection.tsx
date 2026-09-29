import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { SeoContent } from '../seo';
import { SupportedLocale, getTranslations } from '../lib/i18n';

interface SeoContentSectionProps {
  seo: SeoContent;
  toolName?: string;
  locale?: SupportedLocale;
}

export const SeoContentSection: React.FC<SeoContentSectionProps> = ({ 
  seo, 
  toolName, 
  locale = 'ko' 
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0); // First item open by default
  const t = getTranslations(locale);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(prev => prev === idx ? null : idx);
  };

  const hasHowTo = seo.howToUse && seo.howToUse.length > 0;
  const hasFaq = seo.faq && seo.faq.length > 0;

  if (!hasHowTo && !hasFaq) return null;

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-slate-200/80">
      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{t.pillar1Title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t.pillar1Desc}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{t.pillar2Title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t.pillar2Desc}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{t.pillar3Title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t.pillar3Desc}
            </p>
          </div>
        </div>
      </div>

      {/* How to use section */}
      {hasHowTo && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {toolName ? `${toolName} ${locale === 'ko' ? '사용 방법' : 'Guide'}` : `${seo.h1}`}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {seo.howToUse.map((step, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 font-extrabold text-xs rounded-lg mb-3">
                    {t.stepLabel} {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {hasFaq && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {t.faqTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.faqSubtitle}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {seo.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 md:p-5 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-4 font-bold text-sm md:text-base text-slate-800 cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-blue-600 font-extrabold text-sm">Q.</span>
                      {item.q}
                    </span>
                    <span className="text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                      <p className="flex items-start gap-2.5 pt-2">
                        <span className="font-bold text-emerald-600 text-sm">A.</span>
                        <span>{item.a}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
