import React, { useState, useEffect } from 'react';
import { Coin, CoinFees } from '../types';
import { formatAmount, formatPrice, formatAddress } from '../utils';
import { 
  Search, 
  Coins, 
  Layers, 
  Users, 
  TrendingUp, 
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
  RefreshCw
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
          desc: 'Rectitude: Absolute integrity in contract deployment & splits'
        };
      case 'YU':
        return {
          glowClass: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500',
          textClass: 'text-red-500 glow-red',
          badgeClass: 'bg-red-500/10 border-red-500/30 text-red-500',
          barClass: 'bg-red-500',
          btnClass: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-slate-950',
          kanji: '勇',
          desc: 'Courage: Audacity to trade high-slippage AMM pools'
        };
      case 'JIN':
        return {
          glowClass: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500',
          textClass: 'text-emerald-400 glow-green',
          badgeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          barClass: 'bg-emerald-500',
          btnClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950',
          kanji: '仁',
          desc: 'Benevolence: Automatic developer & creator fee streaming'
        };
      case 'REI':
        return {
          glowClass: 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500',
          textClass: 'text-amber-400 glow-gold',
          badgeClass: 'bg-amber-400/10 border-amber-400/30 text-amber-400',
          barClass: 'bg-amber-500',
          btnClass: 'bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950',
          kanji: '礼',
          desc: 'Respect: Fair rewards for liquidity referrers'
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
          desc: 'Virtue: Customized community launcher contracts'
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
          <div className="absolute inset-0 bg-[#090b11]/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-amber-500/10 border-t-2 border-t-amber-400 rounded-full animate-spin" />
              <Coins className="h-5 w-5 text-amber-400 absolute animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase animate-pulse">
                Fetching Base Blockchain State...
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Querying pools logs & re-fetching ticks...
              </p>
            </div>
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

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, ticker, or virtue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#040508] border border-slate-900 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-650"
            />
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
                  <span className="text-slate-500 block mb-0.5 text-[10px]">ERC-20Z COIN CONTRACT ADDRESS</span>
                  <span className="text-emerald-400 select-all">{activeConfigCoin.coinAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5 text-[10px]">UNISWAP V3 POOL CONTRACT ADDRESS</span>
                  <span className="text-red-400 select-all">{activeConfigCoin.poolAddress}</span>
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

