import React, { useState, useEffect, useRef } from 'react';
import { Coin, TradeLog, CoinFees } from '../types';
import { simulateSwap, formatAmount, formatPrice, formatAddress } from '../utils';
import { apiService } from '../services/api';
import { 
  ArrowDownUp, 
  TrendingUp, 
  TrendingDown,
  Info, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  ArrowRight,
  User,
  Zap,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sword,
  AlertTriangle,
  Fuel,
  Sliders,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Flame,
  ShieldAlert,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface TradingTerminalProps {
  coin: Coin | null;
  onTradeExecuted: (updatedCoin: Coin, log: TradeLog) => void;
  simulatedEthBalance: number;
  onUpdateEthBalance: (newBalance: number) => void;
  currentGasPriceGwei?: string | number;
}

export default function TradingTerminal({ 
  coin, 
  onTradeExecuted, 
  simulatedEthBalance,
  onUpdateEthBalance,
  currentGasPriceGwei
}: TradingTerminalProps) {
  if (!coin) {
    return (
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-12 text-center shadow-xl">
        <Sword className="h-10 w-10 text-red-500 mx-auto mb-3 animate-pulse" />
        <h3 className="text-md font-display font-black text-slate-300">No Target Coin Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Please select a virtue coin from the active registry or deploy a new token to engage the terminal.
        </p>
      </div>
    );
  }

  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [inputAmount, setInputAmount] = useState('0.1');
  
  // Custom SVG Chart interaction states
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(500);

  // Gas Price & Slippage Alert States
  const [liveGasGwei, setLiveGasGwei] = useState<number>(() => {
    if (currentGasPriceGwei) {
      const parsed = parseFloat(String(currentGasPriceGwei));
      return isNaN(parsed) ? 0.006 : parsed;
    }
    return 0.006;
  });
  const [simulatedGasSpike, setSimulatedGasSpike] = useState<number | null>(null);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5); // Default 0.5%
  const [showSlippageConfig, setShowSlippageConfig] = useState<boolean>(false);
  const [isSwapDelayed, setIsSwapDelayed] = useState<boolean>(false);
  const [delayCountdown, setDelayCountdown] = useState<number>(30); // 30s pause timer
  const [userBypassedGasWarning, setUserBypassedGasWarning] = useState<boolean>(false);
  const [customSlippageInput, setCustomSlippageInput] = useState<string>('0.5');

  // Compute active gas price
  const gasPrice = simulatedGasSpike !== null ? simulatedGasSpike : liveGasGwei;
  const isGasSpike = gasPrice > 5.0;

  // Sync prop gas price if passed from App.tsx
  useEffect(() => {
    if (currentGasPriceGwei !== undefined && currentGasPriceGwei !== null) {
      const val = parseFloat(String(currentGasPriceGwei));
      if (!isNaN(val) && val > 0) {
        setLiveGasGwei(val);
      }
    }
  }, [currentGasPriceGwei]);

  // Periodic poll of Base network gas price
  useEffect(() => {
    let isMounted = true;
    const fetchGas = async () => {
      try {
        const gasData = await apiService.getGasPrice();
        if (isMounted && gasData && typeof gasData.gasPriceGwei === 'number') {
          setLiveGasGwei(gasData.gasPriceGwei);
        }
      } catch (err) {
        // Fallback quiet catch
      }
    };

    const interval = setInterval(fetchGas, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Delay countdown effect when user chooses to delay swap
  useEffect(() => {
    if (!isSwapDelayed) return;

    if (delayCountdown <= 0) {
      // If gas cooled down below 5 Gwei, automatically unpause
      if (gasPrice <= 5.0) {
        setIsSwapDelayed(false);
      }
      return;
    }

    const timer = setInterval(() => {
      setDelayCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSwapDelayed, delayCountdown, gasPrice]);

  // If gas price drops below 5 Gwei, reset the bypassed warning
  useEffect(() => {
    if (!isGasSpike) {
      setUserBypassedGasWarning(false);
      if (isSwapDelayed) {
        setIsSwapDelayed(false);
      }
    }
  }, [isGasSpike, isSwapDelayed]);

  // Resize listener for SVG responsiveness
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setChartWidth(entry.contentRect.width);
      }
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Preset swap amount click handler
  const setAmountPreset = (pct: number) => {
    if (tradeType === 'BUY') {
      const amt = simulatedEthBalance * pct;
      setInputAmount(Math.max(0.001, parseFloat(amt.toFixed(4))).toString());
    } else {
      const amt = coin.userBalance * pct;
      setInputAmount(Math.max(1, Math.floor(amt)).toString());
    }
  };

  // Run real-time AMM calculations
  const parsedAmount = parseFloat(inputAmount) || 0;
  const isOverBalance = tradeType === 'BUY' 
    ? parsedAmount > simulatedEthBalance 
    : parsedAmount > coin.userBalance;

  let swapResult = {
    tokensOut: 0,
    ethOut: 0,
    newPrice: coin.currentPrice,
    fees: { creator: 0, platform: 0, tradeRef: 0, createRef: 0, total: 0 } as CoinFees,
    priceImpact: 0,
    newPoolEth: coin.poolEthBalance,
    newPoolTokens: coin.poolTokenBalance
  };

  if (parsedAmount > 0 && !isOverBalance) {
    swapResult = simulateSwap(coin, parsedAmount, tradeType);
  }

  // Get kanji matching the symbol
  const getVirtueKanji = (symbol: string, name: string) => {
    const s = symbol.toUpperCase();
    if (s.includes('GI')) return '義';
    if (s.includes('YU')) return '勇';
    if (s.includes('JIN')) return '仁';
    if (s.includes('REI')) return '礼';
    if (s.includes('MAKOTO')) return '誠';
    if (s.includes('MEIYO')) return '誉';
    if (s.includes('CHUGI')) return '忠';
    if (s.includes('JISEKI')) return '自';
    
    // Fallbacks
    const n = name.toLowerCase();
    if (n.includes('righteousness')) return '義';
    if (n.includes('courage')) return '勇';
    if (n.includes('benevolence')) return '仁';
    if (n.includes('respect')) return '礼';
    if (n.includes('sincerity')) return '誠';
    if (n.includes('honor')) return '誉';
    if (n.includes('loyalty')) return '忠';
    if (n.includes('control')) return '自';
    return '道';
  };

  const getVirtueColorClass = (kanji: string) => {
    if (kanji === '義' || kanji === '誠') return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
    if (kanji === '勇' || kanji === '誉') return 'text-red-500 border-red-500/20 bg-red-500/5';
    if (kanji === '仁' || kanji === '自') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (kanji === '礼' || kanji === '忠') return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-slate-400 border-slate-900 bg-slate-950/40';
  };

  const kanji = getVirtueKanji(coin.symbol, coin.name);
  const virtueColorStyles = getVirtueColorClass(kanji);

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0 || isOverBalance) return;

    // Deduct / credit user's simulated wallet balances
    if (tradeType === 'BUY') {
      onUpdateEthBalance(simulatedEthBalance - parsedAmount);
      
      const updatedCoin: Coin = {
        ...coin,
        currentPrice: swapResult.newPrice,
        priceHistory: [
          ...coin.priceHistory,
          { 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            price: swapResult.newPrice 
          }
        ],
        volume24h: coin.volume24h + parsedAmount,
        feesGenerated: {
          creator: coin.feesGenerated.creator + swapResult.fees.creator,
          platform: coin.feesGenerated.platform + swapResult.fees.platform,
          tradeRef: coin.feesGenerated.tradeRef + swapResult.fees.tradeRef,
          createRef: coin.feesGenerated.createRef + swapResult.fees.createRef,
          total: coin.feesGenerated.total + swapResult.fees.total
        },
        poolTokenBalance: swapResult.newPoolTokens,
        poolEthBalance: swapResult.newPoolEth,
        userBalance: coin.userBalance + swapResult.tokensOut
      };

      const log: TradeLog = {
        id: Math.random().toString(36).substr(2, 9),
        coinId: coin.id,
        type: 'BUY',
        ethAmount: parsedAmount,
        tokenAmount: swapResult.tokensOut,
        price: swapResult.newPrice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fees: swapResult.fees,
        sender: '0xWalletUser',
        hash: '0x' + Array.from({length: 40}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
      };

      onTradeExecuted(updatedCoin, log);
    } else {
      // SELL
      onUpdateEthBalance(simulatedEthBalance + swapResult.ethOut);

      const updatedCoin: Coin = {
        ...coin,
        currentPrice: swapResult.newPrice,
        priceHistory: [
          ...coin.priceHistory,
          { 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            price: swapResult.newPrice 
          }
        ],
        volume24h: coin.volume24h + swapResult.ethOut,
        feesGenerated: {
          creator: coin.feesGenerated.creator + swapResult.fees.creator,
          platform: coin.feesGenerated.platform + swapResult.fees.platform,
          tradeRef: coin.feesGenerated.tradeRef + swapResult.fees.tradeRef,
          createRef: coin.feesGenerated.createRef + swapResult.fees.createRef,
          total: coin.feesGenerated.total + swapResult.fees.total
        },
        poolTokenBalance: swapResult.newPoolTokens,
        poolEthBalance: swapResult.newPoolEth,
        userBalance: coin.userBalance - parsedAmount
      };

      const log: TradeLog = {
        id: Math.random().toString(36).substr(2, 9),
        coinId: coin.id,
        type: 'SELL',
        ethAmount: swapResult.ethOut,
        tokenAmount: parsedAmount,
        price: swapResult.newPrice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        fees: swapResult.fees,
        sender: '0xWalletUser',
        hash: '0x' + Array.from({length: 40}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
      };

      onTradeExecuted(updatedCoin, log);
    }

    // Reset input
    setInputAmount(tradeType === 'BUY' ? '0.1' : '10000');
  };

  // --- Render custom high-quality SVG Chart ---
  const renderPriceHistoryChart = () => {
    const data = coin.priceHistory;
    if (data.length === 0) return null;

    const chartHeight = 220;
    const paddingLeft = 10;
    const paddingRight = 80; // space for Y axis
    const paddingTop = 25;
    const paddingBottom = 30; // space for X axis

    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    // Find min and max price for scaling
    const prices = data.map(d => d.price);
    const maxVal = Math.max(...prices) * 1.05;
    const minVal = Math.min(...prices) * 0.95;
    const valRange = maxVal - minVal || 1e-9;

    // Helper to get coordinates
    const getXCoord = (index: number) => {
      if (data.length <= 1) return paddingLeft;
      return paddingLeft + (index / (data.length - 1)) * graphWidth;
    };

    const getYCoord = (value: number) => {
      const percentage = (value - minVal) / valRange;
      return paddingTop + graphHeight - (percentage * graphHeight);
    };

    // Build the SVG path
    let linePath = "";
    let areaPath = "";

    if (data.length > 0) {
      const startX = getXCoord(0);
      const startY = getYCoord(data[0].price);
      
      linePath = `M ${startX} ${startY}`;
      areaPath = `M ${startX} ${paddingTop + graphHeight} L ${startX} ${startY}`;

      for (let i = 1; i < data.length; i++) {
        const x = getXCoord(i);
        const y = getYCoord(data[i].price);
        linePath += ` L ${x} ${y}`;
        areaPath += ` L ${x} ${y}`;
      }

      areaPath += ` L ${getXCoord(data.length - 1)} ${paddingTop + graphHeight} Z`;
    }

    // Generate horizontal gridlines
    const gridCount = 4;
    const gridlines = Array.from({ length: gridCount }).map((_, i) => {
      const val = minVal + (i / (gridCount - 1)) * valRange;
      const y = getYCoord(val);
      return { val, y };
    });

    const isTrendPositive = data[data.length - 1]?.price >= data[0]?.price;
    const trendColorClass = isTrendPositive ? "text-cyan-400 stroke-cyan-400" : "text-red-500 stroke-red-500";
    const fillGradientId = `chartFill-${coin.id}`;

    return (
      <div className="relative">
        <svg width="100%" height={chartHeight} className="overflow-visible">
          <defs>
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isTrendPositive ? "#22d3ee" : "#ef4444"} stopOpacity="0.18" />
              <stop offset="100%" stopColor={isTrendPositive ? "#22d3ee" : "#ef4444"} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridlines.map((grid, idx) => (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={grid.y} 
                x2={paddingLeft + graphWidth} 
                y2={grid.y} 
                stroke="#111827" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
              <text 
                x={paddingLeft + graphWidth + 8} 
                y={grid.y + 4} 
                fill="#4b5563" 
                className="font-mono text-[9px] font-medium"
              >
                {formatPrice(grid.val)} ETH
              </text>
            </g>
          ))}

          {/* Glowing Area Fill */}
          <path d={areaPath} fill={`url(#${fillGradientId})`} />

          {/* Bold Price Line */}
          <path 
            d={linePath} 
            fill="none" 
            className={trendColorClass}
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive tracking cursor line */}
          {hoverIndex !== null && hoverIndex < data.length && (
            <g>
              <line 
                x1={getXCoord(hoverIndex)} 
                y1={paddingTop} 
                x2={getXCoord(hoverIndex)} 
                y2={paddingTop + graphHeight} 
                stroke="#374151" 
                strokeWidth="1"
              />
              <circle 
                cx={getXCoord(hoverIndex)} 
                cy={getYCoord(data[hoverIndex].price)} 
                r="5" 
                fill={isTrendPositive ? "#22d3ee" : "#ef4444"}
                stroke="#090b11"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X Axis Timestamps */}
          {data.map((d, i) => {
            const step = Math.max(1, Math.floor(data.length / 4));
            if (i % step !== 0 && i !== data.length - 1) return null;
            return (
              <text 
                key={i} 
                x={getXCoord(i)} 
                y={paddingTop + graphHeight + 16} 
                fill="#4b5563" 
                className="font-mono text-[9px] text-center"
                textAnchor="middle"
              >
                {d.timestamp}
              </text>
            );
          })}
        </svg>

        {/* Hover overlay detector panels */}
        <div className="absolute inset-0 flex" style={{ left: paddingLeft, right: paddingRight, top: paddingTop, height: graphHeight }}>
          {data.map((_, i) => (
            <div 
              key={i} 
              className="flex-1 cursor-crosshair h-full"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </div>

        {/* Floating details box */}
        {hoverIndex !== null && hoverIndex < data.length && (
          <div className="absolute top-2 left-4 bg-slate-950/90 border border-slate-900 rounded px-2.5 py-1 text-[10px] font-mono shadow-md flex items-center gap-3">
            <div>
              <span className="text-slate-500 mr-1">Price:</span>
              <span className="text-cyan-400 font-bold">{formatPrice(data[hoverIndex].price)} ETH</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1">Time:</span>
              <span className="text-slate-300">{data[hoverIndex].timestamp}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Target Token Meta Banner */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border font-jp font-black text-center w-12 h-12 flex items-center justify-center shadow-lg text-2xl ${virtueColorStyles}`}>
              {kanji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-black text-slate-100">{coin.name}</h2>
                <span className="text-xs bg-slate-950 border border-slate-900 text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
                  {coin.symbol}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-mono text-slate-500">Contract:</span>
                <span className="text-[10px] font-mono text-cyan-450 font-semibold">{coin.coinAddress}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-900">
            <div>
              <span className="text-slate-500 block">Current Price</span>
              <span className="font-mono text-sm font-bold text-cyan-450">{formatPrice(coin.currentPrice)} ETH</span>
            </div>
            <div>
              <span className="text-slate-500 block">Simulated Market Cap</span>
              <span className="font-mono text-sm font-bold text-slate-300">{(coin.currentPrice * 1e9).toFixed(2)} ETH</span>
            </div>
            <div>
              <span className="text-slate-500 block">Creator Share</span>
              <span className="font-mono text-sm font-bold text-amber-400">{coin.feesGenerated.creator.toFixed(4)} ETH</span>
            </div>
            <div>
              <span className="text-slate-500 block">LP Liquidity</span>
              <span className="font-mono text-sm font-bold text-emerald-450">{coin.poolEthBalance.toFixed(4)} ETH</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Live Chart Terminal */}
        <div className="lg:col-span-8 bg-[#090b11] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-display font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Live Price Terminal (AMM Seeded)
              </h3>
              
              <div className="flex items-center gap-1 text-[10px] bg-slate-950 px-2 py-0.5 rounded font-mono border border-slate-900 text-slate-450">
                <span>Active Pool Range: Tick Lower to Upper</span>
              </div>
            </div>

            <div ref={chartContainerRef} className="bg-slate-950/80 rounded-xl p-4 border border-slate-900 mb-4 min-h-[220px]">
              {renderPriceHistoryChart()}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-900">
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Pool ETH</span>
              <span className="font-mono text-xs font-bold text-slate-300">{coin.poolEthBalance.toFixed(5)} ETH</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Pool Tokens</span>
              <span className="font-mono text-xs font-bold text-slate-300">{(coin.poolTokenBalance / 1e6).toFixed(1)}M {coin.symbol}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Accumulated Platform Cut</span>
              <span className="font-mono text-xs font-bold text-slate-300">{coin.feesGenerated.platform.toFixed(5)} ETH</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Active Referrers Revenue</span>
              <span className="font-mono text-xs font-bold text-slate-300">{(coin.feesGenerated.tradeRef + coin.feesGenerated.createRef).toFixed(5)} ETH</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Buy/Sell Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-5 shadow-xl">
            {/* Wallet Balance Header */}
            <div className="flex items-center justify-between text-xs mb-4 border-b border-slate-900 pb-3">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-500" />
                Simulated Wallet
              </span>
              <div className="text-right font-mono text-[11px]">
                <div className="text-slate-300">ETH: <span className="text-cyan-400 font-bold">{simulatedEthBalance.toFixed(4)}</span></div>
                <div className="text-slate-300">{coin.symbol}: <span className="text-amber-400 font-bold">{(coin.userBalance).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-slate-900 mb-4">
              <button
                type="button"
                onClick={() => { setTradeType('BUY'); setInputAmount('0.1'); }}
                className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  tradeType === 'BUY'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Buy {coin.symbol}
              </button>
              <button
                type="button"
                onClick={() => { setTradeType('SELL'); setInputAmount('10000'); }}
                className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  tradeType === 'SELL'
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sell {coin.symbol}
              </button>
            </div>

            {/* Swap Input Form */}
            <form onSubmit={handleSwap} className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-550 mb-1 font-semibold">
                  <span>Spend Amount</span>
                  <div className="flex gap-2 font-mono">
                    <button type="button" onClick={() => setAmountPreset(0.25)} className="hover:text-cyan-400 cursor-pointer">25%</button>
                    <button type="button" onClick={() => setAmountPreset(0.50)} className="hover:text-cyan-400 cursor-pointer">50%</button>
                    <button type="button" onClick={() => setAmountPreset(1.00)} className="hover:text-cyan-400 cursor-pointer">MAX</button>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-4 pr-16 py-3 text-slate-200 text-sm font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="0.0"
                  />
                  <span className="absolute right-4 top-3 text-xs text-slate-500 font-bold font-mono">
                    {tradeType === 'BUY' ? 'ETH' : coin.symbol}
                  </span>
                </div>
              </div>

              {/* Estimate Output Area */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimate Receive:</span>
                  <span className="text-slate-200 font-bold">
                    {tradeType === 'BUY' 
                      ? `${swapResult.tokensOut.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${coin.symbol}`
                      : `${swapResult.ethOut.toFixed(6)} ETH`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Price Impact:</span>
                  <span className={`font-bold ${
                    swapResult.priceImpact > 2 
                      ? 'text-amber-400' 
                      : swapResult.priceImpact > 5 
                      ? 'text-red-500' 
                      : 'text-slate-300'
                  }`}>
                    {swapResult.priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Split (1.00%):</span>
                  <span className="text-slate-200">{swapResult.fees.total.toFixed(5)} ETH</span>
                </div>
              </div>

              {/* Transaction Fee distribution details */}
              {parsedAmount > 0 && !isOverBalance && (
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-[10px] font-mono space-y-1.5 text-slate-450">
                  <div className="flex justify-between">
                    <span className="text-slate-500">0.50% Creator Splitter:</span>
                    <span>{swapResult.fees.creator.toFixed(6)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">0.15% Trade Referrer:</span>
                    <span>{swapResult.fees.tradeRef.toFixed(6)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">0.15% Create Referrer:</span>
                    <span>{swapResult.fees.createRef.toFixed(6)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">0.20% Platform Fee:</span>
                    <span>{swapResult.fees.platform.toFixed(6)} ETH</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isOverBalance || parsedAmount <= 0}
                className={`w-full py-3.5 px-6 rounded-xl font-display font-black text-xs transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer ${
                  isOverBalance
                    ? 'bg-slate-800 text-slate-650 cursor-not-allowed border border-slate-900'
                    : tradeType === 'BUY'
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                }`}
              >
                {isOverBalance ? (
                  'Insufficient Wallet Balance'
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Execute Swap (AMM)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
