import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Users, FileImage, FileArchive, FileText, LogOut, LayoutDashboard, Settings, Megaphone, Wrench, ListFilter, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Globe, Sliders, Save, Plus, Trash2, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import { 
  getAdSettings, saveAdSettings, AdSetting, 
  getToolSettings, saveToolSettings, ALL_TOOLS, 
  getProcessLogs, clearProcessLogs, ProcessLog,
  getSiteSettings, saveSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS,
  getCustomSeoOverrides, saveCustomSeoOverrides,
  getDashboardMetrics
} from './lib/store';
import { SEO_DATA, SeoContent } from './seo';
import { ToolId } from './types';
import { getCurrentUser, logoutUser, isAdmin, loginUser, User } from './lib/auth';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Admin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAdmin());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'ads' | 'tools' | 'seo' | 'site'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(!!user && user.role === 'admin');
    };
    window.addEventListener('auth-state-changed', checkAuth);
    return () => window.removeEventListener('auth-state-changed', checkAuth);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (!isAuthenticated) {
    if (currentUser && currentUser.role !== 'admin') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
          <Helmet>
            <title>접근 권한 없음 - 이미지 매직</title>
          </Helmet>
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-slate-200/50 w-full max-w-md border border-slate-200/80 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">관리자 권한 필요</h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              현재 <strong className="text-blue-600 font-bold">{currentUser.username}</strong> 계정은 일반 사용자 권한입니다.<br />
              관리자 콘솔은 관리자 권한을 가진 계정만 접근할 수 있습니다.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                관리자 계정으로 다시 로그인
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors"
              >
                메인 홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <AdminLogin 
        onLogin={() => {
          const u = getCurrentUser();
          setCurrentUser(u);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'logs', label: '처리 로그', icon: ListFilter },
    { id: 'ads', label: '광고 관리', icon: Megaphone },
    { id: 'tools', label: '도구 관리', icon: Wrench },
    { id: 'seo', label: 'SEO 메타 관리', icon: Globe },
    { id: 'site', label: '사이트 설정', icon: Settings },
  ] as const;

  const currentTabName = navItems.find(item => item.id === activeTab)?.label || '관리자 콘솔';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Helmet>
        <title>관리자 콘솔 - 이미지 매직</title>
      </Helmet>

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-1 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <LayoutDashboard size={15} />
            </div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">이미지 매직</span>
          </div>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          {currentTabName}
        </span>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Modern Responsive Sidebar */}
      <aside 
        className={cn(
          "w-64 bg-white border-r border-slate-200/80 text-slate-700 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 h-full",
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tight text-base leading-none">이미지 매직</h1>
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Admin Console</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3.5 md:p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all cursor-pointer", 
                  isActive ? "bg-blue-50 text-blue-600 shadow-xs font-bold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Logged in Admin Profile */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser?.username.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {currentUser?.username || 'admin'}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                최고 관리자
              </span>
            </div>
          </div>

          <a
            href="/"
            className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            ← 서비스 메인으로 이동
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content: md:pl-64 provides full width without horizontal overflow */}
      <div className="md:pl-64 flex flex-col min-h-screen w-full">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 pt-18 md:pt-8">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateToLogs={() => setActiveTab('logs')} />}
          {activeTab === 'logs' && <AdminLogs />}
          {activeTab === 'ads' && <AdminAds />}
          {activeTab === 'tools' && <AdminTools />}
          {activeTab === 'seo' && <AdminSeo />}
          {activeTab === 'site' && <AdminSiteSettings />}
        </main>
      </div>
    </div>
  );
}


function AdminDashboard({ onNavigateToLogs }: { onNavigateToLogs?: () => void }) {
  const [metrics, setMetrics] = useState(() => getDashboardMetrics());
  const [logs, setLogs] = useState<ProcessLog[]>([]);

  const refreshData = () => {
    setMetrics(getDashboardMetrics());
    setLogs(getProcessLogs().slice(0, 8));
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('image-magic-log-updated', handleUpdate);
    window.addEventListener('image-magic-visit-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const interval = setInterval(refreshData, 3000);
    return () => {
      window.removeEventListener('image-magic-log-updated', handleUpdate);
      window.removeEventListener('image-magic-visit-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const totalToolCount = metrics.toolUsageChart.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <>
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">대시보드 요약</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              실시간 실제 데이터 연동
            </span>
          </div>
          <p className="text-slate-500 text-sm">실시간 서비스 파일 처리 및 방문자 통계 현황입니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshData}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> 새로고침
          </button>
        </div>
      </header>

      {/* Stats Grid - 100% Real Live Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 md:mb-8">
        <StatCard 
          title="오늘 방문자" 
          value={`${metrics.todayVisitors.toLocaleString()}명`} 
          sub={`누적: ${metrics.totalVisitors.toLocaleString()}명`} 
          icon={<Users className="text-blue-500" size={24} />} 
        />
        <StatCard 
          title="오늘 파일 처리" 
          value={`${metrics.todayFilesProcessed.toLocaleString()}건`} 
          sub={`누적: ${metrics.totalFilesProcessed.toLocaleString()}건`} 
          icon={<FileImage className="text-purple-500" size={24} />} 
        />
        <StatCard 
          title="오늘 압축 건수" 
          value={`${metrics.todayCompressCount.toLocaleString()}건`} 
          sub={`누적 압축: ${metrics.totalCompressCount.toLocaleString()}건`} 
          icon={<FileArchive className="text-emerald-500" size={24} />} 
        />
        <StatCard 
          title="오늘 PDF 변환" 
          value={`${metrics.todayPdfCount.toLocaleString()}건`} 
          sub={`누적 변환: ${metrics.totalPdfCount.toLocaleString()}건`} 
          icon={<FileText className="text-indigo-500" size={24} />} 
        />
      </div>

      {/* Charts Grid - Real Dynamic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">일별 방문자 추이</h3>
              <p className="text-xs text-slate-500 mt-0.5">최근 7일간 실제 방문 세션 집계</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              오늘: {metrics.todayVisitors}명
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.dailyVisitorsChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  formatter={(val: any) => [`${val}명`, '방문자']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                />
                <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">도구별 실제 이용 비율</h3>
              <p className="text-xs text-slate-500 mt-0.5">처리된 파일 로그 기반 통계</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              총 {metrics.totalFilesProcessed}건
            </span>
          </div>
          <div className="h-72 flex items-center justify-center">
            {totalToolCount === 0 ? (
              <div className="text-center p-6 text-slate-400">
                <FileImage size={40} className="mx-auto mb-2 text-slate-300 opacity-60" />
                <p className="text-sm font-semibold text-slate-600">아직 처리된 파일 내역이 없습니다</p>
                <p className="text-xs text-slate-400 mt-1">사용자가 파일 변환 또는 압축을 실행하면 자동으로 집계됩니다.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.toolUsageChart.filter(t => t.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {metrics.toolUsageChart.filter(t => t.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${val}건`, '이용 횟수']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Processing Quick View */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">최근 처리 내역 요약</h3>
            <p className="text-xs text-slate-500 mt-0.5">클라이언트에서 익명화되어 안전하게 집계된 최근 파일 처리 기록</p>
          </div>
          {onNavigateToLogs && (
            <button 
              onClick={onNavigateToLogs}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              전체 로그 보기 →
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">시간</th>
                <th className="py-3 px-4">도구</th>
                <th className="py-3 px-4">파일 형식</th>
                <th className="py-3 px-4">파일 크기</th>
                <th className="py-3 px-4 rounded-r-xl">처리 결과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    아직 기록된 파일 처리 내역이 없습니다. (이미지 변환/압축 작업 시 실시간 기록됩니다)
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const sizeFormatted = log.fileSize < 1024 * 1024 
                    ? `${(log.fileSize / 1024).toFixed(1)} KB` 
                    : `${(log.fileSize / (1024 * 1024)).toFixed(2)} MB`;
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{log.tool}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-mono font-medium">
                          {log.format}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">
                        {sizeFormatted}
                      </td>
                      <td className="py-3.5 px-4">
                        {log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={13} /> 성공
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            <XCircle size={13} /> 실패
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AdminLogs() {
  const [logs, setLogs] = useState<ProcessLog[]>([]);

  const loadLogs = () => {
    setLogs(getProcessLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClear = () => {
    if (window.confirm('모든 처리 로그 내역을 삭제하시겠습니까?')) {
      clearProcessLogs();
      setLogs([]);
    }
  };

  return (
    <>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">파일 처리 내역 로그</h2>
          <p className="text-slate-500 mt-2">
            최근 변환/압축 작업 내역을 실시간으로 확인합니다. (개인정보 및 원본 파일은 저장되지 않습니다)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadLogs}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <RefreshCw size={16} /> 새로고침
          </button>
          <button 
            onClick={handleClear}
            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-xl text-sm transition-colors"
          >
            로그 전체 삭제
          </button>
        </div>
      </header>

      {/* Privacy Notice Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-sm text-blue-900">
        <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-bold">프라이버시 및 보안 준수 안내</p>
          <p className="text-xs text-blue-700 mt-0.5">
            모든 이미지 처리는 사용자의 브라우저 메모리 안에서만 구동됩니다. 관리자 로그에는 원본 이미지 데이터, 파일명, IP, 개인정보가 일체 포함되지 않으며, 통계 및 오류 파악을 위한 최소한의 메타데이터(도구명, 파일 형식, 크기, 처리 결과)만 기록됩니다.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-4 px-6">처리 시간</th>
                <th className="py-4 px-6">사용 도구</th>
                <th className="py-4 px-6">파일 형식</th>
                <th className="py-4 px-6">파일 크기</th>
                <th className="py-4 px-6">소요 시간</th>
                <th className="py-4 px-6">처리 결과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    기록된 파일 처리 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {log.tool}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-xs rounded-lg">
                        {log.format}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                      {(log.fileSize / (1024 * 1024)).toFixed(2)} MB
                      <span className="text-slate-400 ml-1">({(log.fileSize / 1024).toFixed(0)} KB)</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-mono">
                      {log.durationMs ? `${log.durationMs}ms` : '-'}
                    </td>
                    <td className="py-4 px-6">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold text-xs">
                          <CheckCircle2 size={14} /> 성공
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full font-semibold text-xs">
                          <XCircle size={14} /> 실패
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}


function AdminAds() {
  const [ads, setAds] = useState<AdSetting[]>([]);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setAds(getAdSettings());
  }, []);

  const handleToggle = (id: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const handleChange = (id: string, field: keyof AdSetting, value: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSave = () => {
    saveAdSettings(ads);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <>
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">광고 관리</h2>
          <p className="text-slate-500 mt-1 text-sm">각 영역의 광고 코드를 등록하고 활성화 상태를 관리하세요.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {toast && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 size={14} /> 저장 완료!
            </span>
          )}
          <button 
            onClick={handleSave} 
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors text-sm"
          >
            변경사항 저장
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {ads.map(ad => (
          <div key={ad.id} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">{ad.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500">{ad.description}</p>
                </div>
                <label className="flex items-center cursor-pointer shrink-0">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={ad.enabled} onChange={() => handleToggle(ad.id)} />
                    <div className={cn("block w-13 h-7 rounded-full transition-colors", ad.enabled ? "bg-blue-600" : "bg-slate-300")}></div>
                    <div className={cn("dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform shadow-xs", ad.enabled ? "transform translate-x-6" : "")}></div>
                  </div>
                  <span className="ml-2.5 text-xs font-bold w-7 text-slate-700">{ad.enabled ? 'ON' : 'OFF'}</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">노출 기기</label>
                  <select 
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 text-sm"
                    value={ad.device}
                    onChange={(e) => handleChange(ad.id, 'device', e.target.value)}
                  >
                    <option value="all">PC + 모바일 (전체 노출)</option>
                    <option value="pc">PC 전용</option>
                    <option value="mobile">모바일 전용</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">광고 코드 (HTML/JS/AdSense)</label>
                  <textarea 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs h-24 bg-slate-50/50 focus:bg-white resize-none"
                    placeholder="<ins class='adsbygoogle' ...></ins>"
                    value={ad.code}
                    onChange={(e) => handleChange(ad.id, 'code', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {toast && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 size={14} /> 저장 완료!
          </span>
        )}
        <button 
          onClick={handleSave} 
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors text-sm cursor-pointer"
        >
          변경사항 저장
        </button>
      </div>
    </>
  );
}

function AdminTools() {
  const [tools, setTools] = useState<Record<ToolId, boolean>>({} as Record<ToolId, boolean>);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setTools(getToolSettings());
  }, []);

  const handleToggle = (id: ToolId) => {
    setTools(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    saveToolSettings(tools);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <>
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">도구 관리</h2>
          <p className="text-slate-500 mt-1 text-sm">각 도구의 사용 가능 여부를 설정합니다. OFF 설정된 도구는 사용자에게 '점검 중'으로 표시됩니다.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {toast && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 size={14} /> 저장 완료!
            </span>
          )}
          <button 
            onClick={handleSave} 
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors text-sm cursor-pointer"
          >
            변경사항 저장
          </button>
        </div>
      </header>

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ALL_TOOLS.map(tool => (
            <div key={tool.id} className="flex justify-between items-center p-3.5 sm:p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors gap-3">
              <span className="font-semibold text-sm text-slate-800 line-clamp-1">{tool.name}</span>
              <label className="flex items-center cursor-pointer shrink-0">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={tools[tool.id as ToolId] !== false} onChange={() => handleToggle(tool.id as ToolId)} />
                  <div className={cn("block w-12 h-6 rounded-full transition-colors", tools[tool.id as ToolId] !== false ? "bg-emerald-500" : "bg-rose-400")}></div>
                  <div className={cn("dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-xs", tools[tool.id as ToolId] !== false ? "transform translate-x-6" : "")}></div>
                </div>
                <span className="ml-2 text-xs font-bold w-7 text-right text-slate-700">{tools[tool.id as ToolId] !== false ? 'ON' : 'OFF'}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {toast && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 size={14} /> 저장 완료!
          </span>
        )}
        <button 
          onClick={handleSave} 
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors text-sm cursor-pointer"
        >
          변경사항 저장
        </button>
      </div>
    </>
  );
}

function AdminSeo() {
  const [selectedKey, setSelectedKey] = useState<string>('home');
  const [overrides, setOverrides] = useState<Record<string, any>>({});
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setOverrides(getCustomSeoOverrides());
  }, []);

  const seoList = [
    { key: 'home', name: '홈 메인 페이지' },
    { key: 'compress', name: '이미지 압축 (용량 줄이기)' },
    { key: 'resize', name: '이미지 리사이즈 (크기 조절)' },
    { key: 'pdf', name: '이미지 → PDF 병합' },
    { key: 'pdf-to-image', name: 'PDF → 이미지 변환' },
    { key: 'jpg-to-png', name: 'JPG → PNG 변환' },
    { key: 'png-to-jpg', name: 'PNG → JPG 변환' },
    { key: 'jpg-to-webp', name: 'JPG → WEBP 변환' },
    { key: 'png-to-webp', name: 'PNG → WEBP 변환' },
    { key: 'webp-to-jpg', name: 'WEBP → JPG 변환' },
    { key: 'webp-to-png', name: 'WEBP → PNG 변환' },
    { key: 'heic-to-jpg', name: 'HEIC → JPG 변환' },
    { key: 'heic-to-png', name: 'HEIC → PNG 변환' },
    { key: 'svg-to-png', name: 'SVG → PNG 변환' },
  ];

  const defaultContent: SeoContent = SEO_DATA[selectedKey] || {
    title: `${selectedKey.toUpperCase()} 변환 - 무료 도구`,
    description: `${selectedKey.toUpperCase()} 파일을 브라우저에서 안전하게 변환하세요.`,
    h1: `${selectedKey.toUpperCase()} 변환`,
    subDescription: '빠르고 안전한 클라이언트 사이드 변환 서비스입니다.',
    howToUse: ['파일을 업로드합니다.', '변환 버튼을 누릅니다.', '결과를 다운로드합니다.'],
    faq: [{ q: '무료인가요?', a: '네, 100% 무료입니다.' }]
  };

  const currentContent: SeoContent = {
    ...defaultContent,
    ...(overrides[selectedKey] || {})
  };

  const updateField = (field: keyof SeoContent, value: any) => {
    setOverrides(prev => ({
      ...prev,
      [selectedKey]: {
        ...currentContent,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    saveCustomSeoOverrides(overrides);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleReset = () => {
    const next = { ...overrides };
    delete next[selectedKey];
    setOverrides(next);
    saveCustomSeoOverrides(next);
    alert('기본 SEO 설정값으로 초기화되었습니다.');
  };

  const handleAddStep = () => {
    const steps = [...(currentContent.howToUse || []), ''];
    updateField('howToUse', steps);
  };

  const handleUpdateStep = (idx: number, val: string) => {
    const steps = [...(currentContent.howToUse || [])];
    steps[idx] = val;
    updateField('howToUse', steps);
  };

  const handleRemoveStep = (idx: number) => {
    const steps = currentContent.howToUse.filter((_, i) => i !== idx);
    updateField('howToUse', steps);
  };

  const handleAddFaq = () => {
    const faqs = [...(currentContent.faq || []), { q: '', a: '' }];
    updateField('faq', faqs);
  };

  const handleUpdateFaq = (idx: number, key: 'q' | 'a', val: string) => {
    const faqs = [...(currentContent.faq || [])];
    faqs[idx] = { ...faqs[idx], [key]: val };
    updateField('faq', faqs);
  };

  const handleRemoveFaq = (idx: number) => {
    const faqs = currentContent.faq.filter((_, i) => i !== idx);
    updateField('faq', faqs);
  };

  return (
    <>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">SEO 및 메타태그 관리</h2>
          <p className="text-slate-500 mt-1">네이버, 구글 검색 유입을 위한 페이지별 메타 태그와 설명 문구를 커스텀합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 size={14} /> 저장 완료!
            </span>
          )}
          <button 
            onClick={handleReset} 
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
          >
            기본값으로 복원
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Save size={16} /> SEO 설정 저장
          </button>
        </div>
      </header>

      {/* Target Page Selector */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">편집할 페이지/도구 선택</label>
        <div className="flex flex-wrap gap-2">
          {seoList.map(item => (
            <button
              key={item.key}
              onClick={() => setSelectedKey(item.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                selectedKey === item.key 
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Fields */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
              <Globe size={18} className="text-blue-600" /> 메타태그 (Search Engine Meta)
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                페이지 제목 (Title Tag) <span className="text-slate-400 font-normal">({currentContent.title.length}자)</span>
              </label>
              <input 
                type="text" 
                value={currentContent.title}
                onChange={e => updateField('title', e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="검색 결과에 노출될 타이틀"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                메타 디스크립션 (Meta Description) <span className="text-slate-400 font-normal">({currentContent.description.length}자)</span>
              </label>
              <textarea 
                rows={3}
                value={currentContent.description}
                onChange={e => updateField('description', e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="검색 결과 미리보기에 노출될 사이트 요약 문구"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">페이지 대표 제목 (H1 Tag)</label>
                <input 
                  type="text" 
                  value={currentContent.h1}
                  onChange={e => updateField('h1', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">부제목 / 상세 설명</label>
                <input 
                  type="text" 
                  value={currentContent.subDescription}
                  onChange={e => updateField('subDescription', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* How to use */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">사용 방법 가이드 (HowTo Schema)</h3>
              <button 
                type="button" 
                onClick={handleAddStep}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
              >
                <Plus size={14} /> 단계 추가
              </button>
            </div>

            <div className="space-y-2.5">
              {currentContent.howToUse?.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-400 text-center">{idx + 1}.</span>
                  <input 
                    type="text"
                    value={step}
                    onChange={e => handleUpdateStep(idx, e.target.value)}
                    placeholder={`단계 ${idx + 1} 설명`}
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveStep(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">자주 묻는 질문 (FAQ Schema)</h3>
              <button 
                type="button" 
                onClick={handleAddFaq}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
              >
                <Plus size={14} /> 질문 추가
              </button>
            </div>

            <div className="space-y-4">
              {currentContent.faq?.map((faq, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">Q{idx + 1}. 질문</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-xs text-slate-400 hover:text-rose-500 font-semibold"
                    >
                      삭제
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={faq.q}
                    onChange={e => handleUpdateFaq(idx, 'q', e.target.value)}
                    placeholder="질문을 입력하세요"
                    className="w-full px-3.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <textarea 
                    rows={2}
                    value={faq.a}
                    onChange={e => handleUpdateFaq(idx, 'a', e.target.value)}
                    placeholder="답변을 입력하세요"
                    className="w-full px-3.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Bar for SEO */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {savedToast && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 size={14} /> 저장 완료!
              </span>
            )}
            <button 
              type="button"
              onClick={handleReset} 
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              기본값으로 복원
            </button>
            <button 
              type="button"
              onClick={handleSave} 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} /> SEO 설정 저장
            </button>
          </div>
        </div>

        {/* Live Search Preview Box */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 검색엔진(Google/Naver) 노출 미리보기
            </h3>
            
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1 font-sans">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="text-blue-800 font-medium">https://imagemagic.io</span>
                <span>›</span>
                <span className="text-slate-400">{selectedKey === 'home' ? '' : selectedKey}</span>
              </div>
              <h4 className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-1">
                {currentContent.title || '페이지 타이틀'}
              </h4>
              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2 mt-1">
                {currentContent.description || '페이지 설명 문구가 검색결과 하단에 노출됩니다.'}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>권장 타이틀 길이:</span>
                <span className={cn("font-bold", currentContent.title.length > 60 ? "text-amber-600" : "text-emerald-600")}>
                  {currentContent.title.length} / 60자
                </span>
              </div>
              <div className="flex justify-between">
                <span>권장 설명문 길이:</span>
                <span className={cn("font-bold", currentContent.description.length > 160 ? "text-amber-600" : "text-emerald-600")}>
                  {currentContent.description.length} / 160자
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  const handleSave = () => {
    saveSiteSettings(settings);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">사이트 환경설정</h2>
          <p className="text-slate-500 mt-1">서비스 전역 브랜딩, 업로드 용량 한도, 보안 유효성 검사 및 웹 마스터 도구를 설정합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          {toast && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 size={14} /> 저장되었습니다!
            </span>
          )}
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Save size={16} /> 설정 저장하기
          </button>
        </div>
      </header>

      <div className="max-w-4xl space-y-6">
        {/* General branding */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
            <Sliders size={18} className="text-blue-600" /> 기본 사이트 정보
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">사이트 명칭 (Brand Name)</label>
              <input 
                type="text" 
                value={settings.siteTitle}
                onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">최대 업로드 한도 (파일당 MB)</label>
              <input 
                type="number" 
                value={settings.maxUploadMb}
                onChange={e => setSettings({ ...settings, maxUploadMb: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">기본 사이트 소개 문구</label>
            <textarea 
              rows={2}
              value={settings.siteDescription}
              onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-600"
            />
          </div>
        </div>

        {/* Security and Processing Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" /> 보안 및 처리 기본값
          </h3>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">실행 파일 / 악성 MIME 바이너리 검사</p>
              <p className="text-xs text-slate-500">클라이언트 사이드에서 .exe, .sh, 악성 스크립트 파일 유입을 차단합니다.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={settings.enableSafetyValidation} 
                onChange={e => setSettings({ ...settings, enableSafetyValidation: e.target.checked })} 
              />
              <div className={cn("block w-12 h-6 rounded-full transition-colors", settings.enableSafetyValidation ? "bg-emerald-500" : "bg-slate-300")}></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">기본 이미지 압축률 ({settings.defaultCompressQuality}%)</label>
            <input 
              type="range"
              min="20"
              max="95"
              step="5"
              value={settings.defaultCompressQuality}
              onChange={e => setSettings({ ...settings, defaultCompressQuality: Number(e.target.value) })}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>최대 압축 (20%)</span>
              <span>표준 권장 (80%)</span>
              <span>무손실 근접 (95%)</span>
            </div>
          </div>
        </div>

        {/* Web Analytics and Verification */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
            <Globe size={18} className="text-indigo-600" /> 웹 마스터 및 애널리틱스 연동
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Analytics 측정 ID</label>
              <input 
                type="text" 
                value={settings.googleAnalyticsId}
                onChange={e => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Search Console 인증 태그/코드</label>
              <input 
                type="text" 
                value={settings.searchConsoleCode}
                onChange={e => setSettings({ ...settings, searchConsoleCode: e.target.value })}
                placeholder="google-site-verification=..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {toast && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 size={14} /> 저장되었습니다!
            </span>
          )}
          <button 
            type="button"
            onClick={handleSave} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> 설정 저장하기
          </button>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, sub, icon }: { title: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
        <p className="text-xs text-slate-400 mt-2">{sub}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginUser(id, pw);
      if (result.success && result.user) {
        if (result.user.role === 'admin') {
          onLogin();
        } else {
          setError('해당 계정은 일반 사용자 권한입니다. 관리자 계정으로 로그인해 주세요.');
          logoutUser();
        }
      } else {
        setError(result.error || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err: any) {
      setError('로그인 처리 중 문제가 발생했습니다: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
      <Helmet>
        <title>관리자 로그인 - 이미지 매직</title>
      </Helmet>
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-slate-200/50 w-full max-w-md border border-slate-200/80">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/25 text-white">
            <LayoutDashboard size={28} />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-center text-slate-900 tracking-tight mb-1.5">관리자 콘솔 로그인</h2>
        <p className="text-center text-slate-500 text-sm mb-6">
          관리자 권한을 가진 계정으로 로그인해야 콘솔에 접근할 수 있습니다.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">관리자 계정 (ID 또는 이메일)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all bg-slate-50/50 focus:bg-white"
              placeholder="관리자 아이디 입력"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">비밀번호</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all bg-slate-50/50 focus:bg-white"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 text-sm mt-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? '인증 확인 중...' : '대시보드 접속하기'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2.5 text-slate-500 hover:text-slate-900 text-xs font-semibold transition-colors mt-2"
          >
            ← 서비스 메인 화면으로 돌아가기
          </button>
        </form>
      </div>
    </div>
  );
}
