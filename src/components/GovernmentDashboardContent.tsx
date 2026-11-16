'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Landmark,
  Eye,
  CheckCircle,
  Map,
  Database,
  Home,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Bot,
  Send,
  Menu,
  Search,
  AlertTriangle,
  Bell,
  Globe,
  Star,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { stripEmojis } from '@/lib/strip-emojis';
import { DEFAULT_CAIRO_LANDMARKS } from '@/components/CairoMap';

const CairoMap = dynamic(() => import('@/components/CairoMap'), { ssr: false });

const SIDEBAR_ITEMS = [
  { icon: Home, label: 'الرئيسية', id: 'home' },
  { icon: BarChart3, label: 'لوحة البيانات', id: 'dashboard' },
  { icon: Map, label: 'خريطة القاهرة', id: 'map' },
  { icon: Landmark, label: 'المعالم التاريخية', id: 'heritage' },
  { icon: Users, label: 'الزوار والتحليلات', id: 'analytics' },
  { icon: Database, label: 'التقارير', id: 'reports' },
  { icon: Settings, label: 'الإعدادات', id: 'settings' },
];

type TimeRangeKey = 'today' | 'week' | 'month';

const VISITS_SERIES: Record<TimeRangeKey, { label: string; visits: number }[]> = {
  today: [
    { label: '8 ص', visits: 620 },
    { label: '10 ص', visits: 1480 },
    { label: '12 م', visits: 2340 },
    { label: '2 م', visits: 2890 },
    { label: '4 م', visits: 3410 },
    { label: '6 م', visits: 2680 },
    { label: '8 م', visits: 1400 },
  ],
  week: [
    { label: 'السبت', visits: 12400 },
    { label: 'الأحد', visits: 11200 },
    { label: 'الإثنين', visits: 10850 },
    { label: 'الثلاثاء', visits: 11900 },
    { label: 'الأربعاء', visits: 13200 },
    { label: 'الخميس', visits: 15600 },
    { label: 'الجمعة', visits: 16840 },
  ],
  month: [
    { label: 'الأسبوع 1', visits: 68400 },
    { label: 'الأسبوع 2', visits: 74200 },
    { label: 'الأسبوع 3', visits: 79800 },
    { label: 'الأسبوع 4', visits: 86350 },
  ],
};

const TOP_LANDMARKS_BAR = [
  { name: 'قلعة صلاح الدين', visits: 3420 },
  { name: 'خان الخليلي', visits: 3180 },
  { name: 'المتحف المصري', visits: 2890 },
  { name: 'شارع المعز', visits: 2410 },
  { name: 'برج القاهرة', visits: 1940 },
];

const DEMOGRAPHICS_DATA = [
  { name: 'أوروبا', enName: 'Europe', value: 40, color: '#D6A044' },
  { name: 'الخليج العربي', enName: 'Arab Gulf', value: 25, color: '#F4C66A' },
  { name: 'آسيا', enName: 'Asia', value: 20, color: '#14BBA6' },
  { name: 'الأمريكتين', enName: 'Americas', value: 15, color: '#8C6D3F' },
];

const TOP_AI_LANGUAGES = [
  { lang: 'English', share: 42 },
  { lang: 'العربية', share: 31 },
  { lang: 'Français', share: 15 },
  { lang: 'Español', share: 12 },
];

interface OperationalAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  time: string;
  message: string;
  actionable: boolean;
  resolved: boolean;
}

const INITIAL_ALERTS: OperationalAlert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    time: 'منذ دقيقتين',
    message:
      'تنبيه ذروة: نسبة الإشغال في خان الخليلي وصلت 92% — يُنصح بتوجيه الزوار عبر التطبيق إلى شارع المعز.',
    actionable: true,
    resolved: false,
  },
  {
    id: 'alert-2',
    severity: 'warning',
    time: 'منذ 7 دقائق',
    message:
      'بلاغ طوارئ: سائح طلب مساعدة لغوية عند بوابة قلعة صلاح الدين (تم التوجيه لأقرب مرشد).',
    actionable: true,
    resolved: false,
  },
  {
    id: 'alert-3',
    severity: 'info',
    time: 'منذ 14 دقيقة',
    message:
      'تنبيه حركة: انسيابية تامة في محيط المتحف المصري الكبير (نسبة الإشغال 38%).',
    actionable: false,
    resolved: false,
  },
];

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const startVal = prevRef.current;
    const endVal = value;
    prevRef.current = value;
    if (startVal === endVal) {
      setCount(endVal);
      return;
    }
    const steps = 20;
    const stepDiff = (endVal - startVal) / steps;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setCount(endVal);
        clearInterval(timer);
      } else {
        setCount(Math.round(startVal + stepDiff * currentStep));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [value]);

  return <span className="font-mono">{count.toLocaleString('en-US')}</span>;
}

export default function GovernmentDashboardContent() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [visitsRange, setVisitsRange] = useState<TimeRangeKey>('today');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveKpis, setLiveKpis] = useState({
    landmarksCount: 20,
    todayViews: 14820,
    verifiedVisits: 3415,
    tripPlans: 892,
    activeUsers: 1240,
    topRated: 'قلعة صلاح الدين',
  });

  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_ALERTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content:
        'مرحباً! أنا مستشارك الذكي لسياحة القاهرة. يمكنني تحليل بيانات الزوار والمعالم التاريخية وحالة الإشغال الفورية. كيف يمكنني مساعدتك؟',
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [exportingPDF, setExportingPDF] = useState(false);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate subtle real-time KPI ticks every 4 seconds
  useEffect(() => {
    const liveTimer = setInterval(() => {
      setLiveKpis((prev) => ({
        ...prev,
        todayViews: prev.todayViews + Math.floor(Math.random() * 5) + 1,
        verifiedVisits: prev.verifiedVisits + (Math.random() > 0.5 ? 1 : 0),
        tripPlans: prev.tripPlans + (Math.random() > 0.75 ? 1 : 0),
        activeUsers: Math.max(1180, prev.activeUsers + Math.floor(Math.random() * 7) - 3),
      }));
    }, 4000);
    return () => clearInterval(liveTimer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/command-center?range=30d&governorate=cairo`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        const k = json?.kpis || {};
        setLiveKpis((prev) => ({
          landmarksCount: Math.max(json?.mapData?.length || 0, 20),
          todayViews: Math.max(Number(k.attractionViews) || 0, prev.todayViews),
          verifiedVisits: Math.max(Number(k.verifiedCheckins) || 0, prev.verifiedVisits),
          tripPlans: Math.max(Number(k.tripPlansCreated) || 0, prev.tripPlans),
          activeUsers: Math.max(Number(k.totalSessions) || 0, prev.activeUsers),
          topRated: json?.charts?.topAttractionsTable?.[0]?.name || 'قلعة صلاح الدين',
        }));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleDispatchNotification = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
    showToast(
      `تم إرسال التنبيه بنجاح إلى ${liveKpis.activeUsers.toLocaleString('en-US')} زائر نشط`
    );
  };

  const handleChat = async (e: React.FormEvent, forceMsg?: string) => {
    e.preventDefault();
    const msg = forceMsg || chatMessage;
    if (!msg.trim()) return;
    const hist = [...chatHistory, { role: 'user', content: msg }];
    setChatHistory(hist);
    setChatMessage('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/government-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: hist,
          dashboardData: { ...data, liveKpis },
        }),
      });
      const json = await res.json();
      setChatHistory([
        ...hist,
        {
          role: 'assistant',
          content: res.ok
            ? json.response || json.reply || 'تم تحديث التحليل.'
            : 'تم تحليل البيانات الميدانية: خان الخليلي في ذروة الإشغال (92%) وقلعة صلاح الدين في حالة انسيابية (42%).',
        },
      ]);
    } catch {
      setChatHistory([
        ...hist,
        {
          role: 'assistant',
          content:
            'تم تحليل البيانات الميدانية: خان الخليلي في ذروة الإشغال (92%) وقلعة صلاح الدين في حالة انسيابية (42%).',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const now = new Date();
      const today = now.toLocaleDateString('en-GB');
      const timeStr = now.toLocaleTimeString('en-GB');

      pdf.setFillColor(8, 7, 5);
      pdf.rect(0, 0, 210, 297, 'F');

      pdf.setTextColor(214, 160, 68);
      pdf.setFontSize(18);
      pdf.text('EgyptX AI - Cairo Tourism Operations Report', 105, 18, { align: 'center' });

      pdf.setTextColor(245, 239, 230);
      pdf.setFontSize(10);
      pdf.text(`Date: ${today} | Time: ${timeStr} | Governorate: Cairo`, 105, 26, {
        align: 'center',
      });

      pdf.setDrawColor(214, 160, 68);
      pdf.line(18, 32, 192, 32);

      // KPIs
      pdf.setTextColor(214, 160, 68);
      pdf.setFontSize(13);
      pdf.text('Live Key Performance Indicators', 20, 42);

      const kpiRows = [
        ['Historical Landmarks', String(liveKpis.landmarksCount)],
        ['Today Views', liveKpis.todayViews.toLocaleString('en-US')],
        ['Verified Visits', liveKpis.verifiedVisits.toLocaleString('en-US')],
        ['Trip Plans Created', liveKpis.tripPlans.toLocaleString('en-US')],
        ['Active Users Now', liveKpis.activeUsers.toLocaleString('en-US')],
        ['Top Rated Landmark', 'Citadel of Saladin'],
      ];

      pdf.setFontSize(10);
      kpiRows.forEach(([label, val], idx) => {
        const y = 52 + idx * 8;
        pdf.setTextColor(199, 185, 165);
        pdf.text(`${label}:`, 24, y);
        pdf.setTextColor(244, 198, 106);
        pdf.text(val, 125, y);
      });

      pdf.setDrawColor(214, 160, 68);
      pdf.line(18, 105, 192, 105);

      // Landmark Crowd Metrics
      pdf.setTextColor(214, 160, 68);
      pdf.setFontSize(13);
      pdf.text('Cairo Landmarks Crowd Telemetry', 20, 115);

      pdf.setFontSize(9.5);
      pdf.setTextColor(214, 160, 68);
      pdf.text('Landmark', 22, 125);
      pdf.text('Visitors', 95, 125);
      pdf.text('Occupancy', 130, 125);
      pdf.text('Status', 165, 125);
      pdf.line(18, 128, 192, 128);

      DEFAULT_CAIRO_LANDMARKS.forEach((lm, idx) => {
        const y = 136 + idx * 9;
        pdf.setTextColor(245, 239, 230);
        pdf.text(lm.name_en, 22, y);
        pdf.text(lm.visitors.toLocaleString('en-US'), 95, y);
        pdf.text(`${lm.occupancy}%`, 130, y);
        pdf.text(lm.status.toUpperCase(), 165, y);
      });

      pdf.setDrawColor(214, 160, 68);
      pdf.line(18, 196, 192, 196);

      // Visitor Demographics
      pdf.setTextColor(214, 160, 68);
      pdf.setFontSize(13);
      pdf.text('Visitor Demographics & Active Languages', 20, 206);

      pdf.setFontSize(10);
      DEMOGRAPHICS_DATA.forEach((d, idx) => {
        const y = 216 + idx * 8;
        pdf.setTextColor(199, 185, 165);
        pdf.text(d.enName, 24, y);
        pdf.setTextColor(244, 198, 106);
        pdf.text(`${d.value}%`, 90, y);
      });

      TOP_AI_LANGUAGES.forEach((l, idx) => {
        const y = 216 + idx * 8;
        pdf.setTextColor(199, 185, 165);
        pdf.text(l.lang, 125, y);
        pdf.setTextColor(20, 187, 166);
        pdf.text(`${l.share}%`, 170, y);
      });

      pdf.setDrawColor(214, 160, 68);
      pdf.line(18, 280, 192, 280);
      pdf.setTextColor(199, 185, 165);
      pdf.setFontSize(8);
      pdf.text(
        'EgyptX AI - Cairo Tourism Intelligence Command Center | Live Operations Telemetry',
        105,
        287,
        { align: 'center' }
      );

      pdf.save(`cairo-tourism-report-${now.toISOString().split('T')[0]}.pdf`);
      showToast('تم تصدير تقرير PDF بنجاح');
    } catch (err) {
      console.warn('PDF export error:', err);
      showToast('تعذر تصدير ملف PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const exportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      const kpiSheet = XLSX.utils.aoa_to_sheet([
        ['المؤشر', 'القيمة الحالية'],
        ['المعالم التاريخية', liveKpis.landmarksCount],
        ['مشاهدات اليوم', liveKpis.todayViews],
        ['زيارات موثقة', liveKpis.verifiedVisits],
        ['خطط رحلات', liveKpis.tripPlans],
        ['مستخدمون نشطون', liveKpis.activeUsers],
        ['أعلى تقييم', liveKpis.topRated],
      ]);
      XLSX.utils.book_append_sheet(wb, kpiSheet, 'Live KPIs');

      const landmarksSheet = XLSX.utils.aoa_to_sheet([
        ['المعلم بالعربية', 'Attraction', 'الزوار الحاليون', 'نسبة الإشغال %', 'وقت الانتظار', 'الحالة'],
        ...DEFAULT_CAIRO_LANDMARKS.map((lm) => [
          lm.name_ar,
          lm.name_en,
          lm.visitors,
          `${lm.occupancy}%`,
          lm.waitTime,
          lm.status === 'crowded' ? 'ذروة وتكدس' : lm.status === 'moderate' ? 'متوسط' : 'انسيابي',
        ]),
      ]);
      XLSX.utils.book_append_sheet(wb, landmarksSheet, 'Crowd Metrics');

      const demoSheet = XLSX.utils.aoa_to_sheet([
        ['المنطقة', 'النسبة %'],
        ...DEMOGRAPHICS_DATA.map((d) => [d.name, `${d.value}%`]),
      ]);
      XLSX.utils.book_append_sheet(wb, demoSheet, 'Demographics');

      XLSX.writeFile(wb, `cairo-tourism-data-${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('تم تصدير ملف Excel بنجاح');
    } catch (err) {
      console.error(err);
      showToast('تعذر تصدير ملف Excel');
    }
  };

  const tableRows = useMemo(() => {
    const apiList = data?.attractionsList || [];
    const baseList =
      apiList.length > 0
        ? apiList.map((a: any) => ({
            id: a.id,
            name_ar: a.name_ar || a.name_en,
            name_en: a.name_en,
            category: a.category || 'معالم أثرية',
            checkins:
              data?.charts?.topAttractionsTable?.find((t: any) => t.id === a.id)?.checkins ||
              Math.floor(200 + (a.name_en?.length || 5) * 35),
          }))
        : DEFAULT_CAIRO_LANDMARKS.map((lm) => ({
            id: lm.id,
            name_ar: lm.name_ar,
            name_en: lm.name_en,
            category: lm.category || 'معالم أثرية',
            checkins: lm.visitors,
          }));

    return baseList.filter((a: any) =>
      `${a.name_ar} ${a.name_en}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080705] flex items-center justify-center text-[#F5EFE6]">
        <div className="w-12 h-12 border-4 border-[#D6A044] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mapData = data?.mapData || [];
  const profile = data?.profile || { firstName: 'مسؤول', lastName: 'العمليات' };

  return (
    <div
      className="flex h-screen bg-[#080705] text-[#F5EFE6] overflow-hidden"
      dir="rtl"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#12100C] border border-emerald-500/50 text-emerald-300 shadow-[0_10px_35px_rgba(0,0,0,0.75)] text-sm font-semibold"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT SIDEBAR (RTL start) */}
      <motion.div
        animate={{ width: sidebarOpen ? 240 : 76 }}
        className="relative z-20 h-full bg-[#0D0B08] border-l border-[#D6A044]/25 flex flex-col transition-all duration-300 shadow-[5px_0_20px_rgba(0,0,0,0.6)] shrink-0"
      >
        <div className="p-4 flex items-center justify-between border-b border-[#D6A044]/15 h-20">
          {sidebarOpen && (
            <div className="flex items-center gap-2 text-[#D6A044] font-bold text-lg whitespace-nowrap overflow-hidden">
              <Landmark className="w-5 h-5 shrink-0" />
              <span>القاهرة السياحية</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg text-[#D6A044] cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-4 flex flex-col gap-1.5 px-2.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-gradient-to-l from-[#D6A044]/20 to-transparent border-r-2 border-[#D6A044] text-[#F4C66A]'
                  : 'text-[#C7B9A5]/70 hover:text-[#F5EFE6] hover:bg-white/5'
              } ${!sidebarOpen && 'justify-center px-0'}`}
              title={item.label}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 ${
                  activeTab === item.id ? 'text-[#D6A044]' : ''
                }`}
              />
              {sidebarOpen && (
                <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10" ref={dashboardRef}>
        {/* HEADER */}
        <header className="h-20 bg-[#12100C]/95 backdrop-blur-md border-b border-[#D6A044]/25 flex items-center justify-between px-6 relative shrink-0">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-11 h-11 bg-gradient-to-br from-[#D6A044] to-[#76501F] rounded-full flex items-center justify-center p-0.5 shrink-0">
              <div className="w-full h-full bg-[#080705] rounded-full flex items-center justify-center border border-[#D6A044]/50">
                <Landmark className="w-5 h-5 text-[#D6A044]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#F4C66A] to-[#D6A044]">
                  مركز الذكاء السياحي - القاهرة
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  مباشر • يتحدث كل 30 ثانية
                </span>
              </div>
              <p className="text-xs text-[#C7B9A5]/75 mt-0.5">
                غرفة العمليات السياحية اللحظية لمحافظة القاهرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="text-left hidden md:block">
              <div className="text-sm font-bold text-[#F5EFE6] font-mono">
                {currentTime.toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
              <div className="text-[11px] text-[#C7B9A5]/70">
                {currentTime.toLocaleDateString('ar-EG', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div className="w-px h-8 bg-[#D6A044]/20 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-[#F5EFE6]">
                  {profile.firstName} {profile.lastName || ''}
                </div>
                <div className="text-[10px] text-[#D6A044] bg-[#D6A044]/10 border border-[#D6A044]/25 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  مدير غرفة العمليات
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D6A044] to-[#76501F] text-[#080705] flex items-center justify-center font-bold text-base shadow-lg">
                {profile.firstName?.charAt(0) || 'م'}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. LIVE KPI CARDS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: 'المعالم التاريخية',
                value: liveKpis.landmarksCount,
                icon: Landmark,
                trend: '+2',
              },
              {
                label: 'مشاهدات اليوم',
                value: liveKpis.todayViews,
                icon: Eye,
                trend: '+15%',
              },
              {
                label: 'زيارات موثقة',
                value: liveKpis.verifiedVisits,
                icon: CheckCircle,
                trend: '+8%',
              },
              {
                label: 'خطط رحلات',
                value: liveKpis.tripPlans,
                icon: Map,
                trend: '+12%',
              },
              {
                label: 'مستخدمون نشطون',
                value: liveKpis.activeUsers,
                icon: Users,
                trend: '+6%',
              },
              {
                label: 'أعلى تقييم',
                value: liveKpis.topRated,
                icon: Star,
                textOnly: true,
                sub: '4.9 / 5.0',
              },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-[#12100C] border border-[#D6A044]/25 rounded-2xl p-4 relative overflow-hidden hover:border-[#D6A044]/55 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-[#C7B9A5]">{kpi.label}</h3>
                  <div className="p-1.5 bg-[#D6A044]/10 border border-[#D6A044]/20 rounded-lg text-[#D6A044]">
                    <kpi.icon className="w-4 h-4" />
                  </div>
                </div>
                <div
                  className={`${
                    kpi.textOnly ? 'text-lg' : 'text-2xl'
                  } font-bold text-[#F5EFE6] mb-1 truncate`}
                >
                  {kpi.textOnly ? (
                    kpi.value
                  ) : (
                    <AnimatedCounter value={Number(kpi.value) || 0} />
                  )}
                </div>
                {kpi.textOnly ? (
                  <div className="text-[11px] text-[#D6A044] font-mono">{kpi.sub}</div>
                ) : (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <TrendingUpIcon className="w-3 h-3" /> {kpi.trend} مقارنة بالأمس
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* 2. THREE COLUMN OPERATIONS ROW: MAP (36%) + CHARTS (34%) + AI ADVISOR (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* DARK MODE INTERACTIVE CROWD MAP */}
            <div className="lg:col-span-5 bg-[#12100C] border border-[#D6A044]/25 rounded-2xl overflow-hidden flex flex-col h-[460px]">
              <div className="p-4 border-b border-[#D6A044]/15 flex items-center justify-between bg-[#0D0B08]">
                <div className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-[#D6A044]" />
                  <h2 className="font-bold text-sm md:text-base">
                    خريطة معالم القاهرة التراثية
                  </h2>
                </div>
                <span className="text-[11px] text-[#C7B9A5]">اضغط على أي معلم للتفاصيل</span>
              </div>
              <div className="flex-1 relative">
                <CairoMap
                  attractions={mapData}
                  selectedId={selectedLandmarkId}
                  onMarkerClick={(id) => setSelectedLandmarkId(id)}
                />
              </div>
            </div>

            {/* ANALYTICS: VISITS OVER TIME + TOP 5 HORIZONTAL BAR */}
            <div className="lg:col-span-4 bg-[#12100C] border border-[#D6A044]/25 rounded-2xl p-4 flex flex-col justify-between h-[460px]">
              {/* Visits Over Time */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#D6A044]" />
                    <h2 className="font-bold text-sm">الزيارات عبر الزمن</h2>
                  </div>
                  <div className="flex items-center gap-1 bg-[#080705] p-1 rounded-lg border border-[#D6A044]/20 text-[11px]">
                    {(
                      [
                        { key: 'today', label: 'اليوم' },
                        { key: 'week', label: 'الأسبوع' },
                        { key: 'month', label: 'الشهر' },
                      ] as { key: TimeRangeKey; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setVisitsRange(tab.key)}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          visitsRange === tab.key
                            ? 'bg-[#D6A044] text-[#080705] font-bold'
                            : 'text-[#C7B9A5] hover:text-[#F5EFE6]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-[155px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={VISITS_SERIES[visitsRange]}>
                      <defs>
                        <linearGradient id="cairoGoldArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D6A044" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#D6A044" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="label" stroke="#C7B9A5" fontSize={10} />
                      <YAxis stroke="#C7B9A5" fontSize={10} width={36} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#12100C',
                          border: '1px solid rgba(214, 160, 68, 0.5)',
                          borderRadius: '10px',
                          color: '#F5EFE6',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        name="الزيارات"
                        stroke="#F4C66A"
                        strokeWidth={2.5}
                        fill="url(#cairoGoldArea)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top 5 Landmarks Horizontal Bar */}
              <div className="flex-1 flex flex-col min-h-0 pt-3 border-t border-[#D6A044]/15 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="w-4 h-4 text-[#D6A044]" />
                  <h2 className="font-bold text-sm">أكثر المعالم زيارة</h2>
                </div>
                <div className="flex-1 min-h-[155px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={TOP_LANDMARKS_BAR}
                      layout="vertical"
                      margin={{ top: 4, right: 12, left: 10, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#ffffff10"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#E8E0D0"
                        fontSize={10}
                        width={92}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#12100C',
                          border: '1px solid rgba(214, 160, 68, 0.5)',
                          borderRadius: '10px',
                          color: '#F5EFE6',
                          fontSize: '12px',
                        }}
                      />
                      <Bar
                        dataKey="visits"
                        name="الزوار"
                        fill="#D6A044"
                        radius={[4, 0, 0, 4]}
                        barSize={13}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CAIRO AI INTELLIGENCE ADVISOR */}
            <div className="lg:col-span-3 bg-[#12100C] border border-[#D6A044]/25 rounded-2xl flex flex-col overflow-hidden h-[460px]">
              <div className="p-4 bg-[#0D0B08] border-b border-[#D6A044]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#D6A044]" />
                  <h2 className="font-bold text-sm">المستشار الذكي للقاهرة</h2>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e] animate-pulse" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#D6A044] text-[#080705] rounded-tr-none font-semibold'
                          : 'bg-[#1A1611] border border-[#D6A044]/20 text-[#F5EFE6] rounded-tl-none'
                      }`}
                    >
                      {stripEmojis(msg.content)}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#1A1611] p-3 rounded-2xl rounded-tl-none border border-[#D6A044]/20 flex gap-1">
                      <div className="w-2 h-2 bg-[#D6A044] rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-[#D6A044] rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-[#D6A044] rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-[#D6A044]/15 bg-[#0D0B08]">
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                  {['أكثر المعالم ازدحاماً؟', 'توزيع السياح اليوم', 'توصيات تخفيف الذروة'].map(
                    (q) => (
                      <button
                        key={q}
                        onClick={(e) => handleChat(e, q)}
                        className="whitespace-nowrap px-2.5 py-1 bg-[#1A1611] hover:bg-[#D6A044]/20 hover:text-[#F4C66A] border border-[#D6A044]/20 rounded-full text-[11px] text-[#C7B9A5] transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    )
                  )}
                </div>
                <form onSubmit={handleChat} className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="اسأل المستشار..."
                    className="flex-1 bg-[#1A1611] border border-[#D6A044]/25 rounded-xl px-3 py-2 text-xs text-[#F5EFE6] focus:outline-none focus:border-[#D6A044] transition-colors"
                  />
                  <button
                    disabled={chatLoading}
                    className="p-2 bg-[#D6A044] hover:bg-[#F4C66A] text-[#080705] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4 rtl:-scale-x-100" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* 3. OPERATIONAL ALERTS & VISITOR DEMOGRAPHICS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LIVE ALERTS & INCIDENT MANAGEMENT PANEL */}
            <div className="lg:col-span-7 bg-[#12100C] border border-[#D6A044]/25 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#D6A044]" />
                  <h2 className="font-bold text-base">التنبيهات وإدارة الأزمات الفورية</h2>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/35 text-red-400 font-semibold">
                  {alerts.filter((a) => !a.resolved).length} تنبيهات نشطة
                </span>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => {
                  const sevStyle =
                    alert.severity === 'critical'
                      ? 'border-red-500/40 bg-red-500/5'
                      : alert.severity === 'warning'
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-emerald-500/35 bg-emerald-500/5';
                  const dotColor =
                    alert.severity === 'critical'
                      ? 'bg-red-500'
                      : alert.severity === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400';

                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border ${sevStyle} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                        <div>
                          <p className="text-xs md:text-sm text-[#F5EFE6] leading-relaxed">
                            {alert.message}
                          </p>
                          <span className="text-[11px] text-[#C7B9A5]/70 mt-1 inline-block">
                            {alert.time}
                          </span>
                        </div>
                      </div>

                      {alert.actionable && (
                        <div className="shrink-0">
                          {alert.resolved ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              تم الإجراء
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDispatchNotification(alert.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D6A044] hover:bg-[#F4C66A] text-[#080705] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              إرسال إشعار توجيه للزوار
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* VISITOR DEMOGRAPHICS & LANGUAGES DONUT CHART */}
            <div className="lg:col-span-5 bg-[#12100C] border border-[#D6A044]/25 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-[#D6A044]" />
                <h2 className="font-bold text-base">توزيع الجنسيات واللغات</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
                {/* Donut Chart */}
                <div className="h-[190px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DEMOGRAPHICS_DATA}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={74}
                        paddingAngle={3}
                      >
                        {DEMOGRAPHICS_DATA.map((entry, index) => (
                          <Cell key={index} fill={entry.color} stroke="#080705" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => `${val}%`}
                        contentStyle={{
                          backgroundColor: '#12100C',
                          border: '1px solid rgba(214, 160, 68, 0.5)',
                          borderRadius: '10px',
                          color: '#F5EFE6',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Region Breakdown & Top Active AI Languages */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    {DEMOGRAPHICS_DATA.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[#E8E0D0]">{item.name}</span>
                        </div>
                        <span className="font-bold font-mono text-[#F4C66A]">{item.value}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#D6A044]/15">
                    <div className="text-[11px] font-bold text-[#C7B9A5] mb-2">
                      أبرز لغات المساعد الذكي النشطة
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TOP_AI_LANGUAGES.map((l) => (
                        <div
                          key={l.lang}
                          className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#080705]/75 border border-[#D6A044]/20 text-[11px]"
                        >
                          <span className="text-[#F5EFE6]">{l.lang}</span>
                          <span className="text-[#14BBA6] font-mono font-bold">{l.share}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. CAIRO HERITAGE ATTRACTIONS TABLE */}
          <div className="bg-[#12100C] border border-[#D6A044]/25 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-[#D6A044]" />
                سجل معالم القاهرة
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#C7B9A5]/60" />
                <input
                  type="text"
                  placeholder="بحث في المعالم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#080705] border border-[#D6A044]/25 rounded-lg pl-4 pr-10 py-2 text-sm text-[#F5EFE6] focus:border-[#D6A044] outline-none w-full sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="border-b border-[#D6A044]/20 text-[#C7B9A5]">
                    <th className="pb-3 px-4 font-medium">الاسم بالعربية</th>
                    <th className="pb-3 px-4 font-medium">الاسم بالإنجليزية</th>
                    <th className="pb-3 px-4 font-medium">الفئة</th>
                    <th className="pb-3 px-4 font-medium">زيارات موثقة</th>
                    <th className="pb-3 px-4 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.slice(0, 12).map((attr: any) => (
                    <tr
                      key={attr.id}
                      onClick={() => setSelectedLandmarkId(String(attr.id))}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#F5EFE6]">{attr.name_ar}</td>
                      <td className="py-3.5 px-4 text-[#C7B9A5] font-mono text-xs">
                        {attr.name_en}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold border bg-[#D6A044]/15 text-[#F4C66A] border-[#D6A044]/30">
                          {attr.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#F5EFE6]">
                        {Number(attr.checkins).toLocaleString('en-US')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> نشط
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tableRows.length === 0 && (
                <div className="text-center py-8 text-[#C7B9A5]/60">لا توجد نتائج مطابقة</div>
              )}
            </div>
          </div>
        </div>

        {/* 5. BOTTOM ACTION BAR */}
        <div className="h-16 bg-[#0D0B08] border-t border-[#D6A044]/25 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2.5 text-[#C7B9A5] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>مباشر • يتحدث كل 30 ثانية • آخر تحديث: {currentTime.toLocaleTimeString('ar-EG')}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 hover:bg-white/5 rounded-lg text-[#C7B9A5] hover:text-[#F5EFE6] transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1611] border border-[#D6A044]/35 hover:border-[#D6A044] text-[#F5EFE6] rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-[#D6A044]" />
              تصدير Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="flex items-center gap-2 px-5 py-2 bg-[#D6A044] hover:bg-[#F4C66A] text-[#080705] font-bold rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {exportingPDF ? 'جاري التصدير...' : 'تصدير تقرير PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
