import React, { useState, useEffect } from 'react';
import { Coin, CoinFees } from '../types';
import { formatAmount, formatPrice, formatAddress } from '../utils';
import VolumeSparkline from './VolumeSparkline';
import { 
  Search, 
  Coins, 
  Layers, 
  Users, 
  TrendingUp,
  TrendingDown,
  Database, 
  ArrowUpRight, 
  DollarSign, 
  Play, 
  ShieldAlert, 
  Sparkles,
  Award,
  Info,
  X,
  Compass,
  Zap,
  ShieldCheck,
  Heart,
  RefreshCw,
  Activity,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';

interface ActiveCoinsProps {
  coins: Coin[];
  onSelectCoin: (coin: Coin) => void;
  selectedCoinId: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function ActiveCoins({ 
  coins, 
  onSelectCoin, 
  selectedCoinId,
  isRefreshing = false,
  onRefresh
}: ActiveCoinsProps) {
  const [search, setSearch] = useState('');
  const [tickerEvents, setTickerEvents] = useState<{ id: string; msg: string; time: string; colorClass: string }[]>([]);
  const [activeConfigCoin, setActiveConfigCoin] = useState<Coin | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCopyMenuId, setActiveCopyMenuId] = useState<string | null>(null);
  const [trendMetric, setTrendMetric] = useState<'price' | 'volume'>('price');

  const handleCopy = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey(prev => prev === key ? null : prev);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveCopyMenuId(null);
    };
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  // Generate continuous feed of simulated on-chain trades/fee payouts themed around Bushido virtues
  useEffect(() => {
    const defaultMessages = [
      { template: "Virtue splits distributed: {amount} ETH sent to recipient Splitter contract.", color: "text-emerald-400" },
      { template: "Courage position executed: Swapped {amount} ETH for {tokenAmount} {symbol} on Uniswap V3.", color: "text-red-400" },
      { template: "Honor pool liquidity rebalanced: active tick range updated safely.", color: "text-amber-400" },
      { template: "Righteousness protocol collected contract launch fee of {fee} ETH.", color: "text-cyan-400" },
      { template: "Loyalty referrers rewarded: {amount} ETH paid automatically.", color: "text-cyan-400" },
    ];

    const interval = setInterval(() => {
      if (coins.length === 0) return;
      const coin = coins[Math.floor(Math.random() * coins.length)];
      const eventTemplate = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
      
      const ethAmount = (Math.random() * 0.12 + 0.01);
      const tokenAmount = Math.floor(ethAmount / (coin.currentPrice || 1e-9));

      let msg = eventTemplate.template
        .replace('{amount}', ethAmount.toFixed(4))
        .replace('{tokenAmount}', tokenAmount.toLocaleString())
        .replace('{symbol}', coin.symbol)
        .replace('{fee}', (ethAmount * 0.002).toFixed(5));

      const newEvent = {
        id: Math.random().toString(),
        msg,
        colorClass: eventTemplate.color,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setTickerEvents(prev => [newEvent, ...prev.slice(0, 4)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [coins]);

  // Filter coins
  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(search.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to assign virtue-specific color schemes to the coins
  const getVirtueColorTheme = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case 'GI':
        return {
          glowClass: 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500',
          textClass: 'text-cyan-400 glow-cyan',
          badgeClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          barClass: 'bg-cyan-500',
          btnClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950',
          kanji: '義',
          desc: 'Rectitude: Absolute integrity in contract deployment & splits',
          hexColor: '#22d3ee'
        };
      case 'YU':
        return {
          glowClass: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500',
          textClass: 'text-red-500 glow-red',
          badgeClass: 'bg-red-500/10 border-red-500/30 text-red-500',
          barClass: 'bg-red-500',
          btnClass: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-slate-950',
          kanji: '勇',
          desc: 'Courage: Audacity to trade high-slippage AMM pools',
          hexColor: '#ef4444'
        };
      case 'JIN':
        return {
          glowClass: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500',
          textClass: 'text-emerald-400 glow-green',
          badgeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          barClass: 'bg-emerald-500',
          btnClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950',
          kanji: '仁',
          desc: 'Benevolence: Automatic developer & creator fee streaming',
          hexColor: '#10b981'
        };
      case 'REI':
        return {
          glowClass: 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500',
          textClass: 'text-amber-400 glow-gold',
          badgeClass: 'bg-amber-400/10 border-amber-400/30 text-amber-400',
          barClass: 'bg-amber-500',
          btnClass: 'bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950',
          kanji: '礼',
          desc: 'Respect: Fair rewards for liquidity referrers',
          hexColor: '#f59e0b'
        };
      default:
        // Default cyan theme
        return {
          glowClass: 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.12)]',
          textClass: 'text-cyan-400 glow-cyan',
          badgeClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          barClass: 'bg-cyan-500',
          btnClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950',
          kanji: '徳',
          desc: 'Virtue: Customized community launcher contracts',
          hexColor: '#06b6d4'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time on-chain event feed */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <h3 className="text-xs font-display font-black text-slate-300 tracking-wider uppercase">Live Bushido-20z Event Stream</h3>
          </div>
          <span className="text-[10px] font-jp text-slate-500">戦士の道 (The Warrior Way)</span>
        </div>
        
        <div className="bg-[#040508] rounded-xl p-3 border border-slate-950 space-y-2 min-h-[96px] shadow-inner">
          {tickerEvents.length === 0 ? (
            <div className="text-slate-500 text-xs font-mono py-4 text-center">
              Awaiting simulated swap events... Make a swap in the Trading Terminal to trigger activity.
            </div>
          ) : (
            tickerEvents.map(ev => (
              <div key={ev.id} className="flex justify-between text-xs font-mono text-slate-450 border-b border-slate-950/65 last:border-0 pb-1.5 last:pb-0">
                <span className={`${ev.colorClass} flex items-center gap-1.5`}>
                  <Zap className="h-3 w-3 inline" />
                  {ev.msg}
                </span>
                <span className="text-slate-600 text-[10px] whitespace-nowrap self-center">{ev.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main filter & grid section */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {isRefreshing && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 block">
                  Syncing Base L2 Block State...
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Updating price tick arrays & animating trend lines
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Live Block Perturbation
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Virtue Pools Registry
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Browse launched creator tokens. Each pool enforces the sacred rules of automated, full-range liquidity.
            </p>
          </div>

          {/* Controls: Search bar, Metric toggle, and Sync button */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Metric Mode Toggle (Price Trend vs Volume Trend) */}
            <div className="flex items-center bg-[#040508] border border-slate-900 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTrendMetric('price')}
                className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-medium transition-all cursor-pointer ${
                  trendMetric === 'price'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Display Recharts Price Trend Sparkline"
              >
                Price Trend
              </button>
              <button
                type="button"
                onClick={() => setTrendMetric('volume')}
                className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-medium transition-all cursor-pointer ${
                  trendMetric === 'volume'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Display Recharts Volume Trend Sparkline"
              >
                Vol Trend
              </button>
            </div>

            {/* Live Sync / Refresh button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-mono rounded-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                title="Simulate Base L2 block sync and animate sparkline trends"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Ticks'}</span>
              </button>
            )}

            {/* Search bar */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, ticker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#040508] border border-slate-900 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-650"
              />
            </div>
          </div>
        </div>

        {filteredCoins.length === 0 ? (
          <div className="text-center py-12 bg-[#040508] border border-slate-950 rounded-xl">
            <ShieldAlert className="h-8 w-8 text-red-500/80 mx-auto mb-2" />
            <p className="text-sm font-jp text-slate-400">No active virtue pools found matching "{search}"</p>
            <p className="text-xs text-slate-500 mt-1">Deploy a new coin under a different virtue above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredCoins.map(coin => {
              const marketCapEth = coin.currentPrice * 1_000_000_000;
              const isSelected = coin.id === selectedCoinId;
              const theme = getVirtueColorTheme(coin.symbol);

              // Calculate price trend percentage
              const firstPrice = coin.priceHistory && coin.priceHistory.length > 0 
                ? coin.priceHistory[0].price 
                : coin.currentPrice;
              const priceChangePct = firstPrice > 0 ? ((coin.currentPrice - firstPrice) / firstPrice) * 100 : 0;
              const isPriceUp = priceChangePct >= 0;

              return (
                <div 
                  key={coin.id}
                  className={`bg-[#05060a] border rounded-xl p-5 relative overflow-hidden transition-all duration-300 ${
                    isSelected 
                      ? `${theme.glowClass}` 
                      : 'border-slate-900 hover:border-slate-800 hover:bg-[#07090f]'
                  }`}
                >
                  {/* Decorative Kanji character background */}
                  <div className="absolute -bottom-8 -right-8 text-slate-900/10 font-jp text-9xl pointer-events-none select-none font-black">
                    {theme.kanji}
                  </div>

                  {/* Active Target indicator */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-red-600 to-amber-500 text-slate-950 text-[10px] font-display font-black px-2.5 py-0.5 rounded-bl tracking-widest uppercase">
                      ACTIVE TARGET
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${theme.badgeClass}`}>
                          {coin.symbol}
                        </span>
                        <span className="font-jp text-slate-500 font-bold">{theme.kanji}</span>
                      </div>
                      <h3 className="text-md font-bold text-slate-200 mt-2 flex items-center gap-1.5">
                        {coin.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 italic font-jp mt-0.5">
                        "{theme.desc}"
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block font-mono">Price in ETH</span>
                      <span className="font-mono text-xs font-bold text-cyan-400 glow-cyan">{formatPrice(coin.currentPrice)}</span>
                    </div>
                  </div>

                  {/* Recharts Sparkline with subtle transition animation */}
                  <div className="bg-[#030408]/90 border border-slate-900/80 rounded-xl px-3.5 py-2.5 mb-4 flex items-center justify-between gap-3 group hover:border-slate-800 transition-colors">
                    <div className="shrink-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <Activity className="h-3.5 w-3.5 text-amber-400" />
                        <span className="uppercase tracking-wider font-semibold">
                          {trendMetric === 'price' ? 'Price Trend' : '24h Vol Trend'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        {trendMetric === 'price' ? (
                          <>
                            <span className="font-mono text-xs font-bold text-slate-100">
                              {formatPrice(coin.currentPrice)}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">ETH</span>
                            <span className={`text-[9px] font-mono ml-1.5 flex items-center font-medium ${isPriceUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPriceUp ? (
                                <TrendingUp className="h-2.5 w-2.5 inline mr-0.5" />
                              ) : (
                                <TrendingDown className="h-2.5 w-2.5 inline mr-0.5" />
                              )}
                              {isPriceUp ? '+' : ''}{priceChangePct.toFixed(1)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-mono text-xs font-bold text-slate-100">{coin.volume24h.toFixed(3)}</span>
                            <span className="text-[10px] font-mono text-slate-500">ETH</span>
                            <span className="text-[9px] font-mono text-emerald-400 ml-1.5 flex items-center font-medium">
                              <TrendingUp className="h-2.5 w-2.5 inline mr-0.5" />
                              +{((((coin.volume24h * 13) % 32) + 6.8)).toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Recharts Sparkline Chart with Smooth Transition Animation */}
                    <div className="flex-1 max-w-[180px] h-9 min-h-[36px] min-w-[110px] flex items-center justify-end">
                      <VolumeSparkline coin={coin} color={theme.hexColor} height={36} metric={trendMetric} />
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-[#040508]/80 p-3 rounded-lg border border-slate-900/60 text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Simulated Market Cap</span>
                      <span className="font-mono font-bold text-slate-300">{marketCapEth.toFixed(2)} ETH</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Pool ETH Liquidity</span>
                      <span className="font-mono font-bold text-cyan-400">{coin.poolEthBalance.toFixed(4)} ETH</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Creator Share (1%)</span>
                      <span className="font-mono font-bold text-slate-400">{(coin.creatorBalance / 1e6).toFixed(1)}M {coin.symbol}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Accumulated Fees</span>
                      <span className="font-mono font-bold text-amber-400 glow-gold">{coin.feesGenerated.total.toFixed(5)} ETH</span>
                    </div>
                  </div>

                  {/* On-Chain Contract Addresses with Copy Address Buttons */}
                  <div className="bg-[#030408]/90 border border-slate-900/80 rounded-xl p-2.5 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold px-0.5">
                      <span>Contract Addresses</span>
                      <span className="text-slate-600 font-normal">Base L2 (8453)</span>
                    </div>

                    {/* ERC-20z Coin Address Row */}
                    <div className="flex items-center justify-between gap-2 bg-[#060810] px-2.5 py-1.5 rounded-lg border border-slate-900/60 group/row hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                          Coin
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 truncate select-all" title={coin.coinAddress}>
                          {formatAddress(coin.coinAddress)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(coin.coinAddress, `${coin.id}-coin`);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shrink-0 active:scale-95"
                        title={`Copy Coin Contract: ${coin.coinAddress}`}
                      >
                        {copiedKey === `${coin.id}-coin` ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-slate-400 group-hover/row:text-cyan-400" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Uniswap V3 Pool Address Row */}
                    <div className="flex items-center justify-between gap-2 bg-[#060810] px-2.5 py-1.5 rounded-lg border border-slate-900/60 group/row hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9px] font-mono uppercase font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded shrink-0">
                          Pool
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 truncate select-all" title={coin.poolAddress}>
                          {formatAddress(coin.poolAddress)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(coin.poolAddress, `${coin.id}-pool`);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-300 hover:text-amber-300 transition-all cursor-pointer shrink-0 active:scale-95"
                        title={`Copy Uniswap V3 Pool Contract: ${coin.poolAddress}`}
                      >
                        {copiedKey === `${coin.id}-pool` ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-slate-400 group-hover/row:text-amber-400" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Pool Allocations Visualizer */}
                  <div className="space-y-2 text-[11px] mb-5">
                    <div className="flex justify-between text-slate-500">
                      <span>Uniswap V3 Pool Reserve:</span>
                      <span className="font-mono text-slate-300">{(coin.poolTokenBalance / 1e6).toFixed(1)}M {coin.symbol} (99%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className={`${theme.barClass} h-full`} style={{ width: `${(coin.poolTokenBalance / 990000000) * 100}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectCoin(coin)}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${theme.btnClass}`}
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Swap & Trade Simulator
                    </button>

                    {/* Quick 'Copy Address' Menu Button with Icon */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCopyMenuId(activeCopyMenuId === coin.id ? null : coin.id);
                        }}
                        className="px-2.5 py-2 bg-slate-950 border border-slate-900 hover:border-slate-700 text-slate-300 hover:text-cyan-300 text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Copy Address (Coin or Pool)"
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span className="hidden sm:inline">Copy Address</span>
                        <ChevronDown className="h-3 w-3 text-slate-500" />
                      </button>

                      {/* Dropup Menu */}
                      {activeCopyMenuId === coin.id && (
                        <div 
                          className="absolute right-0 bottom-full mb-1.5 z-40 w-60 p-1.5 bg-[#070912] border border-slate-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-xs font-mono"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800/80 mb-1">
                            Copy Address to Clipboard
                          </div>

                          {/* Copy Coin Address option */}
                          <button
                            type="button"
                            onClick={() => {
                              handleCopy(coin.coinAddress, `${coin.id}-coin-menu`);
                              setTimeout(() => setActiveCopyMenuId(null), 1200);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-900 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">Coin</span>
                              <span className="text-[11px] text-slate-300">{formatAddress(coin.coinAddress)}</span>
                            </div>
                            {copiedKey === `${coin.id}-coin-menu` ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="h-3 w-3" /> Copied!
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-cyan-300">
                                <Copy className="h-3 w-3" /> Copy
                              </span>
                            )}
                          </button>

                          {/* Copy Pool Address option */}
                          <button
                            type="button"
                            onClick={() => {
                              handleCopy(coin.poolAddress, `${coin.id}-pool-menu`);
                              setTimeout(() => setActiveCopyMenuId(null), 1200);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-900 flex items-center justify-between text-slate-200 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1 py-0.5 rounded">Pool</span>
                              <span className="text-[11px] text-slate-300">{formatAddress(coin.poolAddress)}</span>
                            </div>
                            {copiedKey === `${coin.id}-pool-menu` ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="h-3 w-3" /> Copied!
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-amber-300">
                                <Copy className="h-3 w-3" /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setActiveConfigCoin(coin)}
                      className="px-3 bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
                      title="View Metadata Config"
                    >
                      Config
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Elegant In-page Modal instead of alert() */}
      {activeConfigCoin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090b11] border border-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="border-b border-slate-900 p-4 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm font-jp">八徳設定</span>
                <h3 className="text-sm font-bold text-slate-200 font-display uppercase tracking-widest">
                  Metadata Config: {activeConfigCoin.symbol}
                </h3>
              </div>
              <button 
                onClick={() => setActiveConfigCoin(null)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                <div>
                  <span className="text-slate-500 block mb-0.5 text-[10px]">COIN NAME</span>
                  <span className="text-slate-200 font-sans font-bold text-sm">{activeConfigCoin.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5 text-[10px]">TICKER / SYMBOL</span>
                  <span className="text-cyan-400 font-bold">{activeConfigCoin.symbol}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-[10px]">ERC-20Z COIN CONTRACT ADDRESS</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeConfigCoin.coinAddress, 'modal-coin')}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'modal-coin' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span className="text-emerald-400 select-all block bg-[#05060b] px-2.5 py-1.5 rounded border border-slate-900 break-all">{activeConfigCoin.coinAddress}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-[10px]">UNISWAP V3 POOL CONTRACT ADDRESS</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeConfigCoin.poolAddress, 'modal-pool')}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'modal-pool' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span className="text-red-400 select-all block bg-[#05060b] px-2.5 py-1.5 rounded border border-slate-900 break-all">{activeConfigCoin.poolAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5 text-[10px]">METADATA IPFS TOKEN URI</span>
                  <span className="text-amber-450 select-all truncate block">{activeConfigCoin.tokenURI}</span>
                </div>
              </div>

              <div className="bg-[#05060a] p-4 rounded-xl border border-slate-900 space-y-2 text-slate-400">
                <h4 className="font-display font-bold text-[10px] text-slate-300 uppercase tracking-wider mb-1">
                  Enforced Splitter Details
                </h4>
                <div className="flex justify-between">
                  <span>Splitter Address:</span>
                  <span className="text-slate-300">{formatAddress(activeConfigCoin.splitter)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Create Referrer Address:</span>
                  <span className="text-slate-300">{formatAddress(activeConfigCoin.createReferrer)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee Deduction:</span>
                  <span className="text-slate-300">{(activeConfigCoin.platformFeeBps / 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950 border-t border-slate-900 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveConfigCoin(null)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

