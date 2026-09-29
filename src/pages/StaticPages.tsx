import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, HardDrive, EyeOff, ServerOff } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4">
      <Helmet>
        <title>개인정보처리방침 - 이미지 매직 (Image Magic)</title>
        <meta name="description" content="이미지 매직은 사용자의 파일을 서버에 저장하지 않고 브라우저 내에서 안전하게 처리합니다. 개인정보 보호 원칙을 확인하세요." />
        <meta property="og:title" content="개인정보처리방침 - 이미지 매직 (Image Magic)" />
        <meta property="og:description" content="이미지 매직은 사용자의 파일을 서버에 저장하지 않고 브라우저 내에서 안전하게 처리합니다. 개인정보 보호 원칙을 확인하세요." />
      </Helmet>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-8 font-semibold">
          <ArrowLeft size={16} /> 메인 홈으로 돌아가기
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">개인정보처리방침</h1>
            <p className="text-sm text-slate-500 mt-1">최종 개정일: 2026년 9월 18일</p>
          </div>
        </div>

        <div className="space-y-8 text-slate-700 leading-relaxed text-sm md:text-base border-t border-slate-100 pt-6">
          <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h2 className="text-lg font-bold text-blue-950 mb-2 flex items-center gap-2">
              <ServerOff className="text-blue-600" size={20} />
              핵심 원칙: 100% 브라우저 내 안전 처리 (Zero Server Storage)
            </h2>
            <p className="text-slate-600">
              이미지 매직(Image Magic)은 사용자의 프라이버시를 최우선으로 보호합니다. 
              사용자가 업로드하는 모든 이미지 및 PDF 파일은 <strong>사용자의 웹 브라우저(Client-Side) 메모리 내에서 직접 처리</strong>되며,
              어떠한 원본 파일이나 변환 결과물도 <strong>외부 서버로 전송되거나 저장되지 않습니다.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. 수집하는 개인정보 항목</h2>
            <p className="mb-2">본 서비스는 별도의 회원가입 없이 누구나 무료로 이용할 수 있습니다. 따라서 다음과 같은 민감한 개인 식별 정보를 수집하지 않습니다.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>회원가입 정보(이름, 비밀번호, 주민등록번호, 연락처 등)를 일체 요구하거나 수집하지 않습니다.</li>
              <li>업로드한 파일 내 메타데이터 및 이미지 자체는 서버로 전송되지 않으므로 서버에 저장되지 않습니다.</li>
              <li>서비스 안정성 및 악의적 공격 방지를 위해 접속 IP, 접속 시간, 브라우저 유형, OS 등 표준 접속 로그가 웹 서버에 일시 기록될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. 개인정보의 이용 목적</h2>
            <p>수집된 최소한의 접속 통계 정보는 오직 다음의 목적으로만 활용됩니다:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-2">
              <li>서비스 접속 통계 분석 및 기능 개선</li>
              <li>비정상 트래픽 및 DDoS 등 악의적 행위 차단 및 시스템 보안 유지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. 파일 처리 보안</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <Lock size={16} className="text-emerald-600" /> WebAssembly & Canvas
                </div>
                <p className="text-xs text-slate-600">브라우저 내장 렌더링 엔진을 통해 디바이스 내부에서 파일 연산이 종료됩니다.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <EyeOff size={16} className="text-indigo-600" /> 제3자 열람 불가
                </div>
                <p className="text-xs text-slate-600">관리자나 제3자가 사용자가 변환한 원본 파일의 내용에 접근하는 것이 기술적으로 불가능합니다.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. 개인정보의 보유 및 파기</h2>
            <p>
              브라우저 상에서 생성된 가상 파일 주소(Object URL)는 사용자가 탭을 닫거나 새로고침할 때 즉시 메모리에서 영구 소멸됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. 제3자 광고 서비스 및 쿠키(Cookie) 정책 (Google AdSense 준수)</h2>
            <p className="mb-2">본 사이트는 서비스의 무료 제공 및 서버 운영을 위해 제3자 광고 서비스(Google AdSense)를 이용할 수 있으며, 이와 관련하여 다음과 같은 정책을 준수합니다.</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong>Google 및 제3자 공급업체의 쿠키 사용:</strong> Google을 포함한 제3자 공급업체는 사용자가 본 웹사이트 또는 다른 웹사이트를 이전에 방문한 내역을 기반으로 광고를 게재하기 위해 쿠키(Cookie)를 사용합니다.
              </li>
              <li>
                <strong>광고 쿠키의 사용 목적:</strong> Google의 광고 쿠키 사용을 통해 Google 및 파트너는 인터넷상의 사이트 방문 기록을 바탕으로 사용자에게 적합한 광고를 게재할 수 있습니다.
              </li>
              <li>
                <strong>맞춤형 광고 게재 선택 해제(Opt-out):</strong> 사용자는 <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Google 광고 설정</a>에 방문하여 개인 맞춤 광고를 언제든지 사용 중지할 수 있습니다. 또한 <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">aboutads.info</a>를 방문하여 제3자 공급업체의 맞춤형 광고용 쿠키 사용을 비활성화할 수도 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. 개인정보 보호책임자 및 문의처</h2>
            <p>서비스 이용 중 개인정보와 관련된 문의나 건의사항은 아래 담당자에게 문의하실 수 있습니다:</p>
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
              <p><strong>담당 부서:</strong> 이미지 매직 개인정보보호팀</p>
              <p><strong>이메일:</strong> privacy@imagemagic.io (또는 문의하기 페이지 이용)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4">
      <Helmet>
        <title>이용약관 - 이미지 매직 (Image Magic)</title>
        <meta name="description" content="이미지 매직의 무료 이미지 변환, 압축 및 PDF 서비스 이용 조건과 권리 및 의무에 관한 이용약관입니다." />
        <meta property="og:title" content="이용약관 - 이미지 매직 (Image Magic)" />
        <meta property="og:description" content="이미지 매직의 무료 이미지 변환, 압축 및 PDF 서비스 이용 조건과 권리 및 의무에 관한 이용약관입니다." />
      </Helmet>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-8 font-semibold">
          <ArrowLeft size={16} /> 메인 홈으로 돌아가기
        </Link>
        
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">서비스 이용약관</h1>
        <p className="text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">최종 개정일: 2026년 9월 18일</p>

        <div className="space-y-6 text-slate-700 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">제1조 (목적)</h2>
            <p>
              본 약관은 "이미지 매직(Image Magic)"(이하 "서비스")이 제공하는 웹 기반 이미지 압축, 변환, 리사이즈 및 PDF 관련 온라인 도구 서비스의 이용 조건 및 절차에 관한 기본적인 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">제2조 (서비스의 성격 및 무료 제공)</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>본 서비스는 모든 사용자에게 회원가입 없이 무료로 제공됩니다.</li>
              <li>본 서비스는 파일 변환 및 압축 처리를 사용자의 웹 브라우저 자원을 활용하여 수행합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">제3조 (사용자의 의무 및 제한)</h2>
            <p className="mb-2">사용자는 본 서비스를 이용함에 있어 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>타인의 저작권, 상표권 등 지식재산권을 침해하는 불법 저작물의 무단 변환 및 배포</li>
              <li>음란물, 불법촬영물, 혐오 표현이 담긴 미디어 처리</li>
              <li>서비스 시스템에 대한 비정상적인 자동화 호출(스크래핑, 크롤링, DoS 공격 등)</li>
              <li>실행 파일(.exe, .sh, .bat 등)이나 악성 스크립트를 조작하여 사이트에 투입하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">제4조 (면책 조항)</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>서비스는 "있는 그대로(AS-IS)" 제공되며, 변환 과정에서 원본 파일의 손상이나 데이터 유실에 대해 고의 또는 중과실이 없는 한 법적 책임을 지지 않습니다. 중요 파일은 반드시 사전에 백업하시기 바랍니다.</li>
              <li>사용자가 변환한 결과물로 인해 발생하는 제3자와의 저작권 및 권리 분쟁에 대하여 서비스는 일체의 책임을 지지 않습니다.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function CookieAdInfo() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4">
      <Helmet>
        <title>쿠키 및 광고 안내 - 이미지 매직 (Image Magic)</title>
        <meta name="description" content="무료 서비스 운영을 위한 쿠키 사용 및 맞춤형 광고 정책 안내입니다." />
        <meta property="og:title" content="쿠키 및 광고 안내 - 이미지 매직 (Image Magic)" />
        <meta property="og:description" content="무료 서비스 운영을 위한 쿠키 사용 및 맞춤형 광고 정책 안내입니다." />
      </Helmet>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-8 font-semibold">
          <ArrowLeft size={16} /> 메인 홈으로 돌아가기
        </Link>
        
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">쿠키(Cookie) 및 광고 안내</h1>
        <p className="text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">투명한 광고 운영 및 데이터 처리 기준을 안내해 드립니다.</p>

        <div className="space-y-6 text-slate-700 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. 서비스 유지와 광고 게재의 목적</h2>
            <p>
              이미지 매직은 고품질의 이미지 처리 및 PDF 변환 도구를 모든 사용자에게 무제한 <strong>무료</strong>로 제공하고 있습니다.
              서비스 운영에 필요한 인프라 비용 및 개발 유지를 위해 웹사이트 내에 타사 디스플레이 광고(예: Google AdSense 등)를 게재하고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. 쿠키(Cookie)란 무엇인가요?</h2>
            <p>
              쿠키는 웹사이트를 방문할 때 사용자의 브라우저에 저장되는 작은 텍스트 파일입니다. 
              본 사이트는 사용자의 환경 설정(예: 최근 선택한 화질, 리사이즈 옵션 등)을 기억하고 원활한 사용자 경험을 돕기 위해 브라우저 LocalStorage 및 쿠키를 활용합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. 타사 광고 파트너(Google 등)의 쿠키 사용</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Google을 포함한 제3자 광고 공급업체는 사용자가 당사 웹사이트 또는 다른 웹사이트를 방문한 기록을 바탕으로 맞춤형 광고를 게재하기 위해 쿠키를 사용합니다.</li>
              <li>광고 쿠키를 통해 파트너사는 인터넷 사용 패턴에 기반한 유용한 광고를 제공할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. 쿠키 및 맞춤 광고 거부 방법</h2>
            <p className="mb-2">사용자는 언제든지 맞춤 광고 및 쿠키 수집을 거부할 권리가 있습니다:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Google 맞춤설정 해제:</strong> <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google 광고 설정</a>에서 개인 맞춤 광고를 사용 중지할 수 있습니다.
              </li>
              <li>
                <strong>브라우저 설정:</strong> 웹 브라우저 설정(크롬: 설정 &gt; 개인정보 보호 및 보안 &gt; 쿠키 및 기타 사이트 데이터)에서 쿠키 저장을 거부하거나 삭제할 수 있습니다.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4">
      <Helmet>
        <title>문의하기 - 이미지 매직 (Image Magic)</title>
        <meta name="description" content="이미지 매직 서비스 제휴, 기능 건의 및 문의사항을 전달하실 수 있습니다." />
        <meta property="og:title" content="문의하기 - 이미지 매직 (Image Magic)" />
        <meta property="og:description" content="이미지 매직 서비스 제휴, 기능 건의 및 문의사항을 전달하실 수 있습니다." />
      </Helmet>
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-8 font-semibold">
          <ArrowLeft size={16} /> 메인 홈으로 돌아가기
        </Link>
        
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">문의하기 (Contact Us)</h1>
        <p className="text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
          서비스 제휴, 버그 제보, 기능 추가 요청 등 무엇이든 편하게 남겨주세요.
        </p>

        {submitted ? (
          <div className="p-8 bg-green-50 border border-green-200 rounded-2xl text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-1">문의가 정상 접수되었습니다.</h3>
            <p className="text-sm text-green-700 mb-6">남겨주신 이메일로 최대한 신속하게 답변드리겠습니다.</p>
            <button 
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm shadow-sm"
            >
              추가 문의 작성하기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">이름 / 닉네임</label>
              <input 
                required
                type="text" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">답변받으실 이메일</label>
              <input 
                required
                type="email" 
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="example@domain.com" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">문의 제목</label>
              <input 
                required
                type="text" 
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="예: 새로운 이미지 포맷 추가 요청" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">문의 내용</label>
              <textarea 
                required
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="상세한 문의 내용을 작성해주세요." 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20 text-sm"
            >
              문의 보내기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
