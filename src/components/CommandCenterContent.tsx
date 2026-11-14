'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Activity,
  Users,
  Map as MapIcon,
  QrCode,
  Building,
  Sparkles,
  Send,
  Download,
  FileText,
  TrendingUp,
  ShieldCheck,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { stripEmojis } from '@/lib/strip-emojis';
import {
  COMMAND_SITES,
  OPERATIONAL_ALERTS,
  COMMAND_TEXT,
  type CmdLocale,
  type SiteTelemetry,
} from '@/lib/command-center-data';
import type { CommandMapSite } from '@/components/command-center/MapInner';

const MapInner = dynamic(() => import('@/components/command-center/MapInner'), { ssr: false });

function normalizeCmdLocale(locale: string): CmdLocale {
  const short = (locale || 'en').toLowerCase().slice(0, 2) as CmdLocale;
  return short in COMMAND_TEXT ? short : 'en';
}

function FormattedAdvisorMessage({ content: rawContent, isRtl }: { content: string; isRtl: boolean }) {
  const content = stripEmojis(rawContent);
  const hasArabic = /[\u0600-\u06FF]/.test(content);
  const dir = hasArabic || isRtl ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      className={`text-sm leading-relaxed text-slate-800 dark:text-[#F5EFE6] ${
        dir === 'rtl' ? 'text-right' : 'text-left'
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[#8A661C] dark:text-[#FFD27A]">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className={`my-1.5 space-y-1.5 list-disc ${dir === 'rtl' ? 'pr-4' : 'pl-4'}`}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className={`my-1.5 space-y-1.5 list-decimal ${dir === 'rtl' ? 'pr-4' : 'pl-4'}`}>{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed marker:text-[#C9A84C]">{children}</li>,
          table: ({ children }) => (
            <div className="my-2 rounded-lg border border-[#C9A84C]/25 bg-black/5 dark:bg-white/5 p-2 text-xs overflow-x-auto">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="py-1 px-1.5 text-left font-semibold text-[#8A661C] dark:text-[#FFD27A] border-b border-[#C9A84C]/25">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-1 px-1.5 border-b border-[#C9A84C]/10 align-top">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function CommandCenterContent() {
  const { locale } = useLanguage();
  const cmdLocale = normalizeCmdLocale(locale);
  const isRtl = cmdLocale === 'ar';
  const text = COMMAND_TEXT[cmdLocale];

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState<SiteTelemetry['id']>('all');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/command-center');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeSite = COMMAND_SITES.find((s) => s.id === selectedSiteId) || COMMAND_SITES[0];
  const landmarkSites = COMMAND_SITES.filter((s) => s.id !== 'all');

  const mapPins: CommandMapSite[] = landmarkSites.map((site) => ({
    id: site.id,
    name: site.names[cmdLocale],
    latitude: site.latitude,
    longitude: site.longitude,
    category: site.category[cmdLocale],
    status: site.status,
    crowdDensity: site.crowdDensity,
    activeVisitors: site.activeTourists,
    readiness: site.readiness,
  }));

  const distributionData = landmarkSites.map((s) => ({
    name: s.names[cmdLocale],
    value: s.activeTourists,
  }));

  const sendChatMessage = async (msg: string) => {
    if (!msg.trim() || chatLoading) return;
    const nextMessages = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/government-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          language: cmdLocale,
          selectedSite: activeSite.names[cmdLocale],
          dashboardData: {
            kpis: {
              activeTourists: activeSite.activeTourists,
              verifiedCheckinsToday: activeSite.checkinsToday,
              monitoredSites: activeSite.monitoredSites,
              readiness: activeSite.readiness,
            },
          },
        }),
      });
      const resData = await res.json();
      if (resData.error) {
        setChatMessages((prev) => [...prev, { role: 'ai', content: resData.error }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'ai', content: resData.reply || resData.response || '' },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'System telemetry temporarily unavailable. Please retry.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = [
      'Site ID',
      'Landmark',
      'Category',
      'Status',
      'Active Tourists',
      'Check-ins Today',
      'Crowd Density (%)',
      'Readiness',
    ];
    const rows = landmarkSites.map((s) => [
      s.id,
      `"${s.names[cmdLocale].replace(/"/g, '""')}"`,
      `"${s.category[cmdLocale].replace(/"/g, '""')}"`,
      s.status,
      s.activeTourists,
      s.checkinsToday,
      s.crowdDensity,
      s.readiness,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerDownload(`egyptx-command-telemetry-${cmdLocale}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
  };

  const handleExportReport = () => {
    const now = new Date().toISOString();
    const lines = [
      `EGYPTX NATIONAL TOURISM COMMAND CENTER — OPERATIONS REPORT`,
      `Generated: ${now}`,
      `Language: ${cmdLocale.toUpperCase()}`,
      `Focus Landmark: ${activeSite.names[cmdLocale]}`,
      ``,
      `--- KEY PERFORMANCE INDICATORS ---`,
      `${text.kpiActiveTourists}: ${activeSite.activeTourists.toLocaleString()}`,
      `${text.kpiCheckinsToday}: ${activeSite.checkinsToday.toLocaleString()}`,
      `${text.kpiMonitoredSites}: ${activeSite.monitoredSites}`,
      `${text.kpiReadiness}: ${activeSite.readiness}`,
      ``,
      `--- SITE BREAKDOWN ---`,
      ...landmarkSites.map(
        (s) =>
          `- ${s.names[cmdLocale]}: ${s.activeTourists.toLocaleString()} ${text.visitorsLabel}, ${s.checkinsToday.toLocaleString()} ${text.checkinsLabel}, ${text.crowdLabel} ${s.crowdDensity}%, ${text.readinessLabel} ${s.readiness}`
      ),
      ``,
      `--- LIVE OPERATIONAL ALERTS ---`,
      ...OPERATIONAL_ALERTS.map(
        (a) => `[${a.time}] ${a.title[cmdLocale]}: ${a.detail[cmdLocale]}`
      ),
    ];
    triggerDownload(
      `egyptx-operations-report-${cmdLocale}.txt`,
      lines.join('\n'),
      'text/plain;charset=utf-8;'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#080705] flex items-center justify-center text-slate-900 dark:text-[#F5EFE6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D6A044] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#D6A044] font-bold text-lg animate-pulse">{text.loading}</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile || { firstName: 'Command', lastName: 'Director', role: 'national_admin' };
  const PIE_COLORS = ['#D6A044', '#10B981', '#1B6B93', '#F59E0B', '#A855F7'];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#080705] text-slate-900 dark:text-[#F5EFE6] font-sans overflow-x-hidden relative transition-colors duration-200 pt-20"
    >
      {/* Top Operations Banner */}
      <header className="w-full bg-[#F8F3E9]/95 dark:bg-[#120C07]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#76501F]/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D6A044] to-[#8A661C] text-[#080705] flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-[#FFD27A]">
                {text.title}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Radio className="w-3 h-3 animate-pulse" />
                {text.liveStatus}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#F5EFE6]/70">{text.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1.5 rounded-full bg-amber-100/80 dark:bg-[#21170D] border border-amber-300 dark:border-[#76501F] text-[#8A661C] dark:text-[#FFD27A] font-semibold">
            {text.badge} — {profile.firstName} {profile.lastName}
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Interactive Site Selector */}
        <div className="bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/60 rounded-2xl p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8A661C] dark:text-[#D6A044] px-2">
            {text.siteSelectorLabel}:
          </span>
          {COMMAND_SITES.map((site) => {
            const active = site.id === selectedSiteId;
            return (
              <button
                key={site.id}
                onClick={() => setSelectedSiteId(site.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  active
                    ? 'bg-[#D6A044] text-[#080705] border-[#D6A044] shadow-[0_0_16px_rgba(214,160,68,0.35)]'
                    : 'bg-white dark:bg-[#21170D] text-slate-700 dark:text-[#F5EFE6]/85 border-slate-200 dark:border-[#76501F]/40 hover:border-[#D6A044]/60'
                }`}
              >
                {site.names[cmdLocale]}
              </button>
            );
          })}
        </div>

        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: text.kpiActiveTourists,
              value: activeSite.activeTourists.toLocaleString(),
              icon: Users,
              accent: 'text-[#D6A044]',
            },
            {
              title: text.kpiCheckinsToday,
              value: activeSite.checkinsToday.toLocaleString(),
              icon: QrCode,
              accent: 'text-emerald-500',
            },
            {
              title: text.kpiMonitoredSites,
              value: activeSite.monitoredSites.toString(),
              icon: Building,
              accent: 'text-[#4CC9F0]',
            },
            {
              title: text.kpiReadiness,
              value: activeSite.readiness,
              icon: ShieldCheck,
              accent: 'text-emerald-400',
            },
          ].map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-[#F8F3E9] dark:bg-gradient-to-br dark:from-[#21170D] dark:to-[#120C07] border border-slate-200 dark:border-[#76501F]/70 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-[#F5EFE6]/75">
                  {kpi.title}
                </span>
                <div className="p-2 rounded-lg bg-[#D6A044]/15 text-[#D6A044]">
                  <kpi.icon className={`w-4 h-4 ${kpi.accent}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-[#FFD27A]">
                {kpi.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Operations Grid: Map + Charts + AI Advisor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dark Pharaonic Operations Map */}
          <div className="lg:col-span-5 bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/70 rounded-2xl overflow-hidden flex flex-col h-[470px]">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-[#76501F]/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#8A661C] dark:text-[#FFD27A] flex items-center gap-2">
                <MapIcon className="w-4 h-4" />
                {text.mapTitle}
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-[#F5EFE6]/65">
                {activeSite.names[cmdLocale]}
              </span>
            </div>
            <div className="flex-1 relative z-0">
              <MapInner
                data={mapPins}
                selectedSiteId={selectedSiteId === 'all' ? undefined : selectedSiteId}
                onSelect={(loc) => {
                  if (loc.id) setSelectedSiteId(loc.id as SiteTelemetry['id']);
                }}
                labels={{
                  crowd: text.crowdLabel,
                  visitors: text.visitorsLabel,
                  readiness: text.readinessLabel,
                }}
              />
            </div>
          </div>

          {/* Center Charts */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-[470px]">
            {/* Hourly Visitor Flow Chart */}
            <div className="flex-1 bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/70 rounded-2xl p-4 flex flex-col">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#FFD27A] mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D6A044]" />
                {text.hourlyFlowTitle}
              </h2>
              <div className="flex-1 min-h-0" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeSite.hourlyFlow} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldFlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D6A044" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#D6A044" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(214,160,68,0.12)" />
                    <XAxis dataKey="hour" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#120C07',
                        border: '1px solid #76501F',
                        borderRadius: '10px',
                        color: '#F5EFE6',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#D6A044"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#goldFlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Crowd Distribution Donut */}
            <div className="flex-1 bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/70 rounded-2xl p-4 flex flex-col">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#FFD27A] mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D6A044]" />
                {text.categoryDistTitle}
              </h2>
              <div className="flex-1 min-h-0 flex items-center gap-2" dir="ltr">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={58}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {distributionData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#120C07',
                          border: '1px solid #76501F',
                          borderRadius: '10px',
                          color: '#F5EFE6',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-1.5 text-[11px]">
                  {landmarkSites.map((s, idx) => (
                    <div key={s.id} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 truncate text-slate-700 dark:text-[#F5EFE6]/85">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <span className="truncate">{s.names[cmdLocale]}</span>
                      </span>
                      <span className="font-semibold text-[#8A661C] dark:text-[#FFD27A]">
                        {s.crowdDensity}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Strategic Advisor */}
          <div className="lg:col-span-3 bg-[#F8F3E9] dark:bg-[#17100A] border border-[#D6A044]/40 rounded-2xl flex flex-col overflow-hidden h-[470px]">
            <div className="px-4 py-3 border-b border-[#D6A044]/25 bg-gradient-to-r from-[#D6A044]/15 to-transparent">
              <h2 className="text-sm font-bold text-[#8A661C] dark:text-[#FFD27A] flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {text.advisorTitle}
              </h2>
              <p className="text-[11px] text-slate-600 dark:text-[#F5EFE6]/65 mt-0.5">
                {text.advisorSubtitle}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              <div className="bg-amber-50 dark:bg-[#21170D] border border-[#D6A044]/30 rounded-xl p-3 text-xs leading-relaxed text-slate-700 dark:text-[#F5EFE6]/90">
                {text.advisorWelcome}
              </div>

              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-xl max-w-[92%] ${
                      msg.role === 'ai'
                        ? 'bg-white dark:bg-[#21170D] border border-slate-200 dark:border-[#76501F]/60'
                        : 'bg-[#D6A044] text-[#080705] font-medium text-xs'
                    }`}
                  >
                    {msg.role === 'ai' ? (
                      <FormattedAdvisorMessage content={msg.content} isRtl={isRtl} />
                    ) : (
                      <span>{stripEmojis(msg.content)}</span>
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-1.5 text-[#D6A044] px-2">
                  <span className="w-1.5 h-1.5 bg-[#D6A044] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#D6A044] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 bg-[#D6A044] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-[#76501F]/50 space-y-2 bg-white/70 dark:bg-[#120C07]">
              <div className="flex flex-wrap gap-1.5">
                {text.quickPrompts.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendChatMessage(q)}
                    className="text-[10px] bg-white dark:bg-[#21170D] hover:bg-amber-50 dark:hover:bg-[#2C1F12] border border-slate-200 dark:border-[#76501F]/50 text-slate-700 dark:text-[#F5EFE6]/85 px-2.5 py-1 rounded-full transition-colors text-start"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(chatInput)}
                  placeholder={text.advisorPlaceholder}
                  className="flex-1 bg-white dark:bg-[#21170D] border border-slate-300 dark:border-[#76501F]/60 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-[#F5EFE6] outline-none focus:border-[#D6A044]"
                />
                <button
                  onClick={() => sendChatMessage(chatInput)}
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2 bg-[#D6A044] text-[#080705] rounded-lg hover:bg-[#FFD27A] disabled:opacity-50 transition-colors"
                >
                  <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Live Landmark Telemetry Table + Operational Alerts Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Landmark Telemetry Table */}
          <div className="bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/70 rounded-2xl p-5 flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#FFD27A] mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#D6A044]" />
              {text.topSitesTitle}
            </h2>
            <div className="space-y-2.5">
              {landmarkSites.map((site) => {
                const isSelected = site.id === selectedSiteId;
                return (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-start ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-[#21170D] border-[#D6A044]'
                        : 'bg-white dark:bg-[#120C07] border-slate-200/80 dark:border-[#76501F]/40 hover:border-[#D6A044]/60'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-[#F5EFE6]">
                        {site.names[cmdLocale]}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-[#F5EFE6]/65">
                        {site.category[cmdLocale]} — {text.readinessLabel}: {site.readiness}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-sm font-bold text-[#8A661C] dark:text-[#FFD27A]">
                        {site.activeTourists.toLocaleString()} {text.visitorsLabel}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        {site.checkinsToday.toLocaleString()} {text.checkinsLabel} ({site.crowdDensity}%)
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operational Alerts Feed */}
          <div className="bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/70 rounded-2xl p-5 flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#FFD27A] mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              {text.alertsTitle}
            </h2>
            <div className="space-y-3">
              {OPERATIONAL_ALERTS.map((alert) => {
                const Icon =
                  alert.severity === 'warning'
                    ? AlertTriangle
                    : alert.severity === 'success'
                      ? CheckCircle2
                      : Info;
                const badgeClass =
                  alert.severity === 'warning'
                    ? 'text-amber-500 bg-amber-500/15'
                    : alert.severity === 'success'
                      ? 'text-emerald-500 bg-emerald-500/15'
                      : 'text-sky-400 bg-sky-500/15';

                return (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#120C07] border border-slate-200/80 dark:border-[#76501F]/40 flex items-start gap-3"
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${badgeClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-[#FFD27A]">
                          {alert.title[cmdLocale]}
                        </h3>
                        <span className="text-[10px] text-slate-500 dark:text-[#F5EFE6]/55 shrink-0">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-[#F5EFE6]/80 mt-1 leading-relaxed">
                        {alert.detail[cmdLocale]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Export Action Bar */}
        <div className="bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/70 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="bg-[#D6A044] hover:bg-[#FFD27A] text-[#080705] font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              {text.exportCsv}
            </button>
            <button
              onClick={handleExportReport}
              className="bg-transparent border border-[#D6A044] text-[#8A661C] dark:text-[#FFD27A] hover:bg-[#D6A044]/10 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              {text.exportReport}
            </button>
          </div>
          <div className="text-xs text-slate-500 dark:text-[#F5EFE6]/60">
            {activeSite.names[cmdLocale]} — {activeSite.readiness} {text.readinessLabel}
          </div>
        </div>
      </main>
    </div>
  );
}
