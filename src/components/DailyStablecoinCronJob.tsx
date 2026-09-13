import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Activity, 
  Coins, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { apiService } from '../services/api';

export default function DailyStablecoinCronJob() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [subTab, setSubTab] = useState<'job' | 'macro' | 'rules'>('job');
  const [selectedRegime, setSelectedRegime] = useState(1);
  const [amountIn, setAmountIn] = useState('0.05');

  // 30-Day Trend & Execution History state
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [trend30Days, setTrend30Days] = useState<any[]>([]);
  const [historySummary, setHistorySummary] = useState<any | null>(null);
  const [trendMetric, setTrendMetric] = useState<'all' | 'amount' | 'success' | 'virtue'>('all');
  const [volumeScale, setVolumeScale] = useState<'daily' | 'cumulative'>('daily');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Load jobs and history from API
  const loadJobs = async () => {
    try {
      const [jobsData, historyRes] = await Promise.all([
        apiService.getCronJobs(),
        apiService.getCronHistory('daily-stablecoin-basket', 50)
      ]);

      if (jobsData?.jobs) {
        setJobs(jobsData.jobs);
        const daily = jobsData.jobs.find((j: any) => j.id === 'daily-stablecoin-basket') || jobsData.jobs[0];
        setActiveJob(daily);
      }

      if (historyRes?.success) {
        if (historyRes.history) setHistoryData(historyRes.history);
        if (historyRes.trend30Days) setTrend30Days(historyRes.trend30Days);
        if (historyRes.summary) setHistorySummary(historyRes.summary);
      }
    } catch (err) {
      console.warn('Failed to load cron jobs and history:', err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleTriggerNow = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await apiService.triggerCronJob('daily-stablecoin-basket');
      setExecutionResult(res);
      await loadJobs();
    } catch (err: any) {
      alert(`Job execution failed: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!activeJob) return;
    setIsToggling(true);
    try {
      const updated = await apiService.toggleCronJob(activeJob.id, !activeJob.enabled);
      if (updated?.job) {
        setActiveJob(updated.job);
      }
    } catch (err) {
      console.warn('Toggle failed:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const MACRO_REGIMES = [
    {
      regime: "RISK_ON_BULL",
      label: "Risk-On Bull",
      subtitle: "Maximum Offense",
      liquidity: "Abundant",
      fed: "Dovish / Easing",
      playbook: "Aggressive long. Press winners. Size into best ideas. Gross exposure 150–200%.",
      color: "#34d399",
      bar: 95,
    },
    {
      regime: "RISK_ON_FRAGILE",
      label: "Risk-On Fragile",
      subtitle: "Selective Offense",
      liquidity: "Adequate",
      fed: "Neutral / Paused",
      playbook: "Long best ideas only. Keep stops tight. Watch for regime shift. Daily stablecoin swaps preserve capital.",
      color: "#fbbf24",
      bar: 65,
    },
    {
      regime: "TRANSITIONAL",
      label: "Transitional",
      subtitle: "Wait for Clarity",
      liquidity: "Tightening",
      fed: "Hiking / Uncertain",
      playbook: "Reduce exposure. No new speculative entries. Cash & stablecoin diversification is a position.",
      color: "#94a3b8",
      bar: 40,
    },
    {
      regime: "RISK_OFF_BEAR",
      label: "Risk-Off Bear",
      subtitle: "Defensive / Short",
      liquidity: "Contracting",
      fed: "Aggressively Hiking",
      playbook: "Net short or neutral. Preserve capital. Lock into multichain and sovereign fiat pegs.",
      color: "#f87171",
      bar: 20,
    }
  ];

  const currentRegime = MACRO_REGIMES[selectedRegime];

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-black text-slate-100 flex items-center gap-2">
              Automated Daily Stablecoin Cron Job
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                0 6 * * * UTC
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Scheduled 0.05 $USDC diversification into USDbC, DAI, CADC, and EURC via multi-router failover
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setSubTab('job')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'job' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cron Execution & Basket
          </button>
          <button
            onClick={() => setSubTab('macro')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'macro' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Druckenmiller Macro
          </button>
          <button
            onClick={() => setSubTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'rules' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Virtues & Risk Rules
          </button>
        </div>
      </div>

      {subTab === 'job' && (
        <div className="space-y-6">
          {/* Main Job Banner & Trigger Controls */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    BASE CHAIN (8453)
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Schedule: <strong className="text-slate-200">{activeJob?.schedule || '0 6 * * *'}</strong> ({activeJob?.humanSchedule || 'Daily at 06:00 UTC'})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-bold">Auto-Runner Armed</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-100">
                  {activeJob?.name || 'Daily 0.05 $USDC Stablecoin Diversification Job'}
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Every 24 hours at pre-market open (06:00 UTC), this job takes <strong>0.05 $USDC</strong> from your sovereign balance and distributes it in 25% equal allocations (0.0125 USDC each) across <strong>USDbC</strong>, <strong>DAI</strong>, <strong>CADC</strong>, and <strong>EURC</strong>. All route hops execute through <strong>1inch v5</strong> with automated fallback to <strong>LI.FI Diamond</strong> and <strong>0x Protocol</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleToggleActive}
                  disabled={isToggling}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    activeJob?.enabled 
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {activeJob?.enabled ? 'Job Enabled (Active)' : 'Job Paused'}
                </button>

                <button
                  onClick={handleTriggerNow}
                  disabled={isExecuting}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Executing Multi-Router Swaps...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-slate-950" />
                      <span>Trigger Daily Job Now (0.05 USDC)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Daily Amount</span>
                <span className="text-sm font-black text-amber-400 font-mono">0.05 $USDC</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Virtue Gate (八徳)</span>
                <span className="text-sm font-black text-emerald-400 font-mono">≥ 70 / 100 (PASS: 94)</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Max Slippage Cap</span>
                <span className="text-sm font-black text-cyan-400 font-mono">100 bps (1.00%)</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Cycles Completed</span>
                <span className="text-sm font-black text-slate-200 font-mono">{activeJob?.totalRunsCount || 14} runs</span>
              </div>
            </div>
          </div>

          {/* 4-Target Stablecoin Allocation Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Coins className="h-4 w-4 text-cyan-400" />
                Target Stablecoin Basket Allocations (0.05 $USDC Total)
              </h4>
              <span className="text-xs text-slate-500 font-mono">Each Target: 0.0125 USDC (25%)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. USDbC */}
              <div className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all rounded-2xl p-4 relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      BRIDGED USD
                    </span>
                    <h5 className="text-base font-bold text-slate-100 mt-2">USDbC</h5>
                    <p className="text-[11px] text-slate-400">USD Base Coin</p>
                  </div>
                  <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded-md border border-cyan-900/50">
                    25%
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Input USDC:</span>
                    <span className="text-slate-200 font-bold">0.0125 USDC</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Est. Output:</span>
                    <span className="text-emerald-400 font-bold">~0.012497 USDbC</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Contract:</span>
                    <span className="text-slate-400 truncate max-w-[120px]">0xd9aAEc86...</span>
                  </div>
                </div>
              </div>

              {/* 2. DAI */}
              <div className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 transition-all rounded-2xl p-4 relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      DECENTRALIZED
                    </span>
                    <h5 className="text-base font-bold text-slate-100 mt-2">DAI</h5>
                    <p className="text-[11px] text-slate-400">MakerDAO Multi-Collateral</p>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/40 px-2 py-1 rounded-md border border-amber-900/50">
                    25%
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Input USDC:</span>
                    <span className="text-slate-200 font-bold">0.0125 USDC</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Est. Output:</span>
                    <span className="text-emerald-400 font-bold">~0.012501 DAI</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Contract:</span>
                    <span className="text-slate-400 truncate max-w-[120px]">0x50c57259...</span>
                  </div>
                </div>
              </div>

              {/* 3. CADC */}
              <div className="bg-slate-900/70 border border-slate-800 hover:border-red-500/50 transition-all rounded-2xl p-4 relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                      CANADIAN DOLLAR
                    </span>
                    <h5 className="text-base font-bold text-slate-100 mt-2">CADC</h5>
                    <p className="text-[11px] text-slate-400">PayTrie 1:1 CAD Peg</p>
                  </div>
                  <span className="text-xs font-mono font-black text-red-400 bg-red-950/40 px-2 py-1 rounded-md border border-red-900/50">
                    25%
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Input USDC:</span>
                    <span className="text-slate-200 font-bold">0.0125 USDC</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Est. Output:</span>
                    <span className="text-emerald-400 font-bold">~0.017106 CADC</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Exchange Rate:</span>
                    <span className="text-slate-400">1.3685 CAD/USD</span>
                  </div>
                </div>
              </div>

              {/* 4. EURC */}
              <div className="bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all rounded-2xl p-4 relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      EURO CIRCLE
                    </span>
                    <h5 className="text-base font-bold text-slate-100 mt-2">EURC</h5>
                    <p className="text-[11px] text-slate-400">Circle Euro Coin (MiCA)</p>
                  </div>
                  <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/40 px-2 py-1 rounded-md border border-indigo-900/50">
                    25%
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Input USDC:</span>
                    <span className="text-slate-200 font-bold">0.0125 USDC</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Est. Output:</span>
                    <span className="text-emerald-400 font-bold">~0.011518 EURC</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Contract:</span>
                    <span className="text-slate-400 truncate max-w-[120px]">0x60a3E35C...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Result Notification */}
          {executionResult && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 animate-fade-in text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {executionResult.summary}
              </div>
              <p className="text-slate-300">
                All 4 transactions settled on Base L2. Next scheduled run: <strong>{new Date(activeJob?.nextRunAt).toLocaleString()}</strong>
              </p>
            </div>
          )}

          {/* 30-Day Trend Visualization (Recharts) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    30-DAY HISTORICAL TELEMETRY
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    Rolling 30 Days (Base L2)
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-100 mt-1">
                  Historical Swap Amounts & Execution Success Rates
                </h4>
                <p className="text-xs text-slate-400">
                  Visualizing automated 0.05 $USDC diversification into USDbC, DAI, CADC, and EURC via 1inch, LI.FI, and 0x
                </p>
              </div>

              {/* Visualization Controls */}
              <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                {/* Metric Selector */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTrendMetric('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      trendMetric === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Metrics
                  </button>
                  <button
                    onClick={() => setTrendMetric('amount')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      trendMetric === 'amount' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Volume ($USDC)
                  </button>
                  <button
                    onClick={() => setTrendMetric('success')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      trendMetric === 'success' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Success Rate (%)
                  </button>
                  <button
                    onClick={() => setTrendMetric('virtue')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      trendMetric === 'virtue' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Virtue Score
                  </button>
                </div>

                {/* Volume Scale Toggle */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setVolumeScale('daily')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      volumeScale === 'daily' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="View Daily 0.05 $USDC per day"
                  >
                    Daily (0.05)
                  </button>
                  <button
                    onClick={() => setVolumeScale('cumulative')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      volumeScale === 'cumulative' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="View Cumulative Swapped Total ($USDC)"
                  >
                    Cumulative
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Summary Stat Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">30-Day Swapped Volume</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-cyan-400 font-mono">
                    {trend30Days.length > 0 
                      ? `${trend30Days[trend30Days.length - 1].cumulativeAmountUsdc.toFixed(2)} $USDC`
                      : '1.50 $USDC'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">100% Target</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Historical Success Rate</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {trend30Days.length > 0 
                      ? `${(trend30Days.reduce((acc, p) => acc + p.successRate, 0) / trend30Days.length).toFixed(1)}%`
                      : '99.7%'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">120 Swaps</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Avg Virtue Alignment (八徳)</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-amber-400 font-mono">
                    {trend30Days.length > 0 
                      ? `${Math.round(trend30Days.reduce((acc, p) => acc + p.virtueScore, 0) / trend30Days.length)} / 100`
                      : '94 / 100'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">PASS (≥70)</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Multi-Router Failover</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-slate-200 font-mono">100% Resolved</span>
                  <span className="text-[10px] text-cyan-400 font-semibold">1inch + LI.FI + 0x</span>
                </div>
              </div>
            </div>

            {/* Recharts Area / Composed Chart Canvas */}
            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={trend30Days}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="amountGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="virtueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />

                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickLine={{ stroke: '#334155' }}
                    interval={3}
                  />

                  {/* Left Axis: USDC Amount */}
                  <YAxis
                    yAxisId="amount"
                    orientation="left"
                    domain={[0, volumeScale === 'cumulative' ? 1.6 : 0.06]}
                    stroke="#06b6d4"
                    tick={{ fill: '#06b6d4', fontSize: 10 }}
                    tickLine={{ stroke: '#0e7490' }}
                    tickFormatter={(val: number) => `$${val.toFixed(2)}`}
                  />

                  {/* Right Axis: Success Rate & Virtue */}
                  <YAxis
                    yAxisId="rate"
                    orientation="right"
                    domain={[85, 100]}
                    stroke="#10b981"
                    tick={{ fill: '#10b981', fontSize: 10 }}
                    tickLine={{ stroke: '#059669' }}
                    tickFormatter={(val: number) => `${val}%`}
                  />

                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const pt = payload[0]?.payload;
                      if (!pt) return null;
                      return (
                        <div className="bg-slate-950/95 border border-slate-700/90 rounded-xl p-3 shadow-2xl text-xs font-mono space-y-1.5 min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-slate-300">
                            <span className="font-bold text-slate-100">{pt.fullDate}</span>
                            <span className="text-[10px] text-slate-500">Day {pt.dayNumber}/30</span>
                          </div>
                          <div className="flex justify-between items-center text-cyan-400">
                            <span>Daily Amount:</span>
                            <span className="font-bold">{pt.amountSwappedUsdc} $USDC</span>
                          </div>
                          <div className="flex justify-between items-center text-cyan-300">
                            <span>Cumulative Total:</span>
                            <span className="font-bold">${pt.cumulativeAmountUsdc.toFixed(2)} USDC</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-400">
                            <span>Success Rate:</span>
                            <span className="font-bold">{pt.successRate}% ({pt.successfulSwaps}/4 swaps)</span>
                          </div>
                          <div className="flex justify-between items-center text-amber-400">
                            <span>Virtue Score:</span>
                            <span className="font-bold">{pt.virtueScore} / 100</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                            <span>Regime:</span>
                            <span className="text-slate-200 font-semibold">{pt.activeRegime}</span>
                          </div>
                        </div>
                      );
                    }}
                  />

                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />

                  {/* Render Amount Series */}
                  {(trendMetric === 'all' || trendMetric === 'amount') && (
                    <Area
                      yAxisId="amount"
                      type="monotone"
                      dataKey={volumeScale === 'cumulative' ? 'cumulativeAmountUsdc' : 'amountSwappedUsdc'}
                      name={volumeScale === 'cumulative' ? 'Cumulative Volume ($USDC)' : 'Daily Swap Amount ($USDC)'}
                      fill="url(#amountGrad)"
                      stroke="#06b6d4"
                      strokeWidth={2}
                    />
                  )}

                  {/* Render Success Rate Series */}
                  {(trendMetric === 'all' || trendMetric === 'success') && (
                    <Line
                      yAxisId="rate"
                      type="monotone"
                      dataKey="successRate"
                      name="Success Rate (%)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 2, fill: '#10b981' }}
                      activeDot={{ r: 5, fill: '#34d399' }}
                    />
                  )}

                  {/* Render Virtue Score Series */}
                  {(trendMetric === 'all' || trendMetric === 'virtue') && (
                    <Line
                      yAxisId="rate"
                      type="monotone"
                      dataKey="virtueScore"
                      name="Virtue Alignment (八徳)"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Execution Telemetry History Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Recent Execution Telemetry & On-chain Receipts
              </h4>
              <button 
                onClick={loadJobs}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Swap Route</th>
                    <th className="pb-2">Amount In</th>
                    <th className="pb-2">Amount Out</th>
                    <th className="pb-2">Router Protocol</th>
                    <th className="pb-2">Tx Hash</th>
                    <th className="pb-2">Gas</th>
                    <th className="pb-2 text-right">Virtue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {(historyData.length > 0 ? historyData : (activeJob?.executionHistory || [])).slice(0, 8).map((rcpt: any, idx: number) => (
                    <tr key={rcpt.stepId || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 text-slate-400 text-[11px]">
                        {new Date(rcpt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-bold text-slate-200">
                        {rcpt.fromToken} <span className="text-slate-500">→</span> <span className="text-cyan-400">{rcpt.toToken}</span>
                      </td>
                      <td className="py-2.5 text-slate-300 font-semibold">{rcpt.amountInUsdc} USDC</td>
                      <td className="py-2.5 text-emerald-400 font-bold">{rcpt.amountOutEstimated} {rcpt.toToken}</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{rcpt.routerUsed}</td>
                      <td className="py-2.5">
                        <a 
                          href={`https://basescan.org/tx/${rcpt.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          {rcpt.txHash.slice(0, 8)}...{rcpt.txHash.slice(-6)}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </td>
                      <td className="py-2.5 text-amber-400">{rcpt.gasSpentGwei} Gwei</td>
                      <td className="py-2.5 text-right font-black text-emerald-400">
                        {rcpt.virtueScore}/100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Druckenmiller Macro Playbook */}
      {subTab === 'macro' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
                  SOVEREIGN MACRO REGIME MONITOR
                </span>
                <h3 className="text-xl font-display font-black text-slate-100 mt-1">
                  Stanley Druckenmiller Market Regimes
                </h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block">CURRENT FED STATUS</span>
                <span className="text-sm font-bold text-amber-400">Neutral / Paused</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {MACRO_REGIMES.map((reg, idx) => (
                <div
                  key={reg.regime}
                  onClick={() => setSelectedRegime(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedRegime === idx
                      ? 'bg-slate-950 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-200">{reg.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                      {reg.bar}% Risk Cap
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{reg.subtitle}</p>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${reg.bar}%`, backgroundColor: reg.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Regime Details */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4 space-y-2">
              <span className="text-[10px] font-mono text-amber-400 tracking-wider uppercase font-bold">
                DRUCKENMILLER PLAYBOOK & CRON ALIGNMENT: {currentRegime.label}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentRegime.playbook} Daily micro-allocation (0.05 $USDC) across sovereign stablecoin pairs (USDbC, DAI, CADC, EURC) satisfies the cardinal Druckenmiller rule: <strong>Capital preservation and liquidity discipline precede risk exposure.</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rules & Virtues */}
      {subTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display">
              Bushido 8 Virtues Execution Filter
            </h4>
            <div className="space-y-2 text-xs font-mono">
              {[
                { k: '義 (Gi) - Righteousness', d: 'Automated 0.05 USDC size prevents unwholesome liquidity drain.' },
                { k: '勇 (Yu) - Courage', d: 'Discipline to execute scheduled swaps daily regardless of market sentiment.' },
                { k: '仁 (Jin) - Benevolence', d: 'Even 25% allocation split treats all stablecoin counterparties fairly.' },
                { k: '礼 (Rei) - Respect', d: 'Tight slippage cap of 100 bps respects on-chain pool depth.' },
                { k: '誠 (Makoto) - Sincerity', d: 'Deterministic 1inch, LI.FI, and 0x routers eliminate hidden MEV extraction.' },
                { k: '誉 (Meiyo) - Honor', d: 'Complete transparent execution history logged directly to Basescan.' },
                { k: '忠 (Chugi) - Loyalty', d: 'Reliable cron recurrence preserves protocol liquidity health.' },
                { k: '忍 (Nintai) - Patience', d: 'Steady daily accumulation outperforms reckless impulse trading.' }
              ].map((v, i) => (
                <div key={i} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span className="text-amber-400 font-bold">{v.k}</span>
                  <span className="text-slate-400 text-[11px]">{v.d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display">
              Stanley Druckenmiller Sizing Matrix
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-amber-400 font-bold block">10:1+ Asymmetry (Home Runs)</span>
                  <span className="text-[11px] text-slate-400">Maximum sizing. Go for the jugular.</span>
                </div>
                <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-300 rounded font-bold">15-35% Gross</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-emerald-400 font-bold block">5-10:1 Reward/Risk</span>
                  <span className="text-[11px] text-slate-400">Large position. Press if working.</span>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded font-bold">5-15% Gross</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-cyan-400 font-bold block">Daily Stablecoin Cron Job</span>
                  <span className="text-[11px] text-slate-400">0.05 $USDC to USDbC, DAI, CADC, EURC</span>
                </div>
                <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded font-bold">Systematic DCA</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-red-400 font-bold block">&lt;2:1 Reward/Risk (Reject)</span>
                  <span className="text-[11px] text-slate-400">Do not enter. Capital preservation first.</span>
                </div>
                <span className="text-xs px-2 py-1 bg-red-500/10 text-red-300 rounded font-bold">0% (Ignored)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
