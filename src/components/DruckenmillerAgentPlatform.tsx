import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingUp, 
  Cpu, 
  Activity, 
  Zap, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ExternalLink,
  Sliders,
  DollarSign,
  PieChart,
  Bot
} from 'lucide-react';
import { 
  apiService, 
  RpcNodeStatus, 
  DexQuoteItem, 
  DruckenmillerSignalItem 
} from '../services/api';

const BUSHIDO_ICON = '/src/assets/images/bushido_icon_1783540049716.jpg';

interface DruckenmillerAgentPlatformProps {
  userBalanceEth: number;
  onUpdateBalance: (bal: number) => void;
  network: 'mainnet' | 'sepolia';
  onOpenWeb3Modal: () => void;
  walletAddress: string | null;
}

export default function DruckenmillerAgentPlatform({
  userBalanceEth,
  onUpdateBalance,
  network,
  onOpenWeb3Modal,
  walletAddress
}: DruckenmillerAgentPlatformProps) {
  // RPC status
  const [rpcNodes, setRpcNodes] = useState<RpcNodeStatus[]>([]);
  const [isLoadingRpc, setIsLoadingRpc] = useState(false);

  // DEX Router Quotes
  const [quotes, setQuotes] = useState<DexQuoteItem[]>([]);
  const [bestRouter, setBestRouter] = useState<DexQuoteItem | null>(null);
  const [selectedToken, setSelectedToken] = useState('GI');
  const [swapAmountEth, setSwapAmountEth] = useState(0.5);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  // Agent Signals
  const [signals, setSignals] = useState<DruckenmillerSignalItem[]>([]);
  const [activeSignal, setActiveSignal] = useState<DruckenmillerSignalItem | null>(null);

  // AI Copilot Chat
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Stanley Druckenmiller Sovereign Agent ready. Operating on Base Layer-2 with strict capital preservation, 10% maximum swap allocation, and Bushido Virtue Alignment verification (minimum 70/100). Ask for macro regime analysis, token asymmetry, or route safety.',
      time: 'Ready'
    }
  ]);

  // Swap execution state
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string | null>(null);
  const [swapErrorMessage, setSwapErrorMessage] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    loadRpcStatus();
    loadQuotes();
    loadSignals();
  }, [selectedToken, swapAmountEth]);

  const loadRpcStatus = async () => {
    setIsLoadingRpc(true);
    try {
      const res = await apiService.getRpcStatus();
      if (res?.activeNodes) {
        setRpcNodes(res.activeNodes);
      }
    } catch (err) {
      console.warn('Failed to refresh RPC status:', err);
    } finally {
      setIsLoadingRpc(false);
    }
  };

  const loadQuotes = async () => {
    setIsLoadingQuotes(true);
    try {
      const res = await apiService.getDexQuotes('WETH', selectedToken, swapAmountEth, 0.000000001);
      setQuotes(res.quotes);
      setBestRouter(res.recommendedRouter);
    } catch (err) {
      console.warn('Failed to load DEX quotes:', err);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const loadSignals = async () => {
    try {
      const sigs = await apiService.getAgentSignals();
      setSignals(sigs);
      if (sigs.length > 0 && !activeSignal) {
        setActiveSignal(sigs[0]);
      }
    } catch (err) {
      console.warn('Failed to load signals:', err);
    }
  };

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim() || isCopilotThinking) return;

    const userQuestion = copilotInput.trim();
    setCopilotInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatHistory(prev => [...prev, { role: 'user', text: userQuestion, time: timeStr }]);
    setIsCopilotThinking(true);

    try {
      const advice = await apiService.askCopilot(userQuestion, {
        activeToken: selectedToken,
        userBalanceEth,
        virtueScore: bestRouter?.virtueComplianceScore ?? 92,
        selectedRouter: bestRouter?.routerName
      });

      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: advice,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Communication temporary latency. As Stanley Druckenmiller cautions: "The first rule is capital preservation. If conviction isn\'t absolute, hold your dry powder."',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  const handleExecuteAgentTrade = async () => {
    setSwapErrorMessage(null);
    setSwapSuccessMessage(null);

    const maxAllowed = userBalanceEth * 0.1;
    if (swapAmountEth > maxAllowed) {
      setSwapErrorMessage(
        `Druckenmiller Risk Veto: Requested swap (${swapAmountEth} ETH) exceeds 10% maximum portfolio allocation (${maxAllowed.toFixed(3)} ETH). Reduce swap size to preserve capital.`
      );
      return;
    }

    if (!bestRouter || bestRouter.virtueComplianceScore < 70) {
      setSwapErrorMessage(
        `Bushido Veto: Virtue Alignment score (${bestRouter?.virtueComplianceScore ?? 0}) is below the required minimum threshold of 70/100.`
      );
      return;
    }

    setIsExecutingSwap(true);
    try {
      const result = await apiService.executeTrade({
        tokenSymbol: selectedToken,
        amountEth: swapAmountEth,
        routerPreference: bestRouter.routerId
      });

      if (result.success) {
        const newBal = Math.max(0, userBalanceEth - swapAmountEth - result.gasUsed * 0.0000000015);
        onUpdateBalance(+newBal.toFixed(4));

        setSwapSuccessMessage(
          `Swapped ${swapAmountEth} ETH for ${result.amountOut} ${selectedToken} via ${result.routerId.toUpperCase()}! Tx: ${result.txHash?.slice(0, 14)}...`
        );
      }
    } catch (err: any) {
      setSwapErrorMessage(err.message || 'Execution failed');
    } finally {
      setIsExecutingSwap(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Stanley Druckenmiller System Overview */}
      <div className="bg-[#090b11] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-cyan-950/20">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-cyan-500/5 to-emerald-500/5 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={BUSHIDO_ICON} 
                alt="Bushido" 
                className="w-14 h-14 rounded-2xl border border-amber-500/40 object-cover shadow-lg shadow-amber-500/20"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-black tracking-wider text-slate-100 uppercase">
                  Stanley Druckenmiller Agent Platform
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  VERCEL SERVERLESS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-jp tracking-wider mt-0.5">
                Macro Asymmetry • Multi-DEX Routing (1inch / LI.FI / 0x) • Bushido 8 Virtues Compliance
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Portfolio Balance</span>
              <span className="text-amber-400 font-bold">{userBalanceEth.toFixed(4)} ETH</span>
            </div>

            <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Max Swap Cap (10%)</span>
              <span className="text-cyan-400 font-bold">{(userBalanceEth * 0.1).toFixed(4)} ETH</span>
            </div>

            <button
              onClick={onOpenWeb3Modal}
              className="px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Open Web3Modal'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: RPC Failover Node Cluster & DEX Router Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Multi-Node Base RPC Cluster */}
        <div className="lg:col-span-5 bg-[#090b11] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-display font-black text-slate-200 uppercase tracking-wider">
                Multi-Node Base RPC Cluster
              </h3>
            </div>
            <button
              onClick={loadRpcStatus}
              disabled={isLoadingRpc}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh RPC Latencies"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRpc ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-jp leading-relaxed">
            Zero-latency failover routing across Coinbase Base RPC (Primary), Tenderly WSS, and decentralized relays (1rpc, Pocket Network).
          </p>

          <div className="space-y-2.5">
            {rpcNodes.map((node) => (
              <div 
                key={node.name}
                className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{node.name}</span>
                    {node.isPrimary && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Block #{node.blockNumber.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-mono font-bold text-emerald-400">{node.latencyMs}ms</span>
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase">{node.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center justify-between">
            <span>Dynamic RPC Failover Protocol:</span>
            <span className="font-bold text-cyan-400">ACTIVE & ZERO-CONFIG</span>
          </div>
        </div>

        {/* Right 7 Cols: Multi-DEX Router Aggregation (1inch, LI.FI, 0x) */}
        <div className="lg:col-span-7 bg-[#090b11] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-display font-black text-slate-200 uppercase tracking-wider">
                Multi-DEX Aggregation & Slippage Guard
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-amber-400 font-mono font-bold focus:outline-none cursor-pointer"
              >
                <option value="GI">GI (Righteousness)</option>
                <option value="YU">YU (Courage)</option>
                <option value="JIN">JIN (Benevolence)</option>
                <option value="REI">REI (Respect)</option>
                <option value="MAKOTO">MAKOTO (Sincerity)</option>
              </select>

              <select
                value={swapAmountEth}
                onChange={(e) => setSwapAmountEth(parseFloat(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-cyan-400 font-mono font-bold focus:outline-none cursor-pointer"
              >
                <option value={0.1}>0.1 ETH</option>
                <option value={0.5}>0.5 ETH</option>
                <option value={1.0}>1.0 ETH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quotes.map((q) => (
              <div
                key={q.routerId}
                className={`p-3.5 rounded-2xl border transition-all ${
                  q.isBestRate
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-200">{q.routerName.split(' ')[0]}</span>
                  {q.isBestRate && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      BEST
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block">Expected Return</span>
                  <span className="font-mono text-sm font-bold text-slate-100">{q.expectedOutput}</span>
                  <span className="text-[10px] text-slate-400 font-jp block">{selectedToken}</span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Price Impact:</span>
                    <span className={q.priceImpactPct > 0.5 ? 'text-amber-400' : 'text-emerald-400'}>
                      {q.priceImpactPct}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Virtue Score:</span>
                    <span className="text-cyan-400 font-bold">{q.virtueComplianceScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas:</span>
                    <span>~{q.gasCostEth} ETH</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Swap Execution Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Sovereign Execution Protocol ({bestRouter?.routerName || '1inch v5'})
                </span>
                <p className="text-[11px] text-slate-400 font-jp">
                  Enforces 10% max allocation ({userBalanceEth * 0.1} ETH) & min 70 Bushido Virtue threshold.
                </p>
              </div>

              <button
                onClick={handleExecuteAgentTrade}
                disabled={isExecutingSwap}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isExecutingSwap ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Executing via Relayer...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Execute Atomic Swap ({swapAmountEth} ETH)
                  </>
                )}
              </button>
            </div>

            {swapSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{swapSuccessMessage}</span>
              </div>
            )}

            {swapErrorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{swapErrorMessage}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Grid: Druckenmiller Signals & Gemini Copilot AI Dialogue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Druckenmiller Macro Signals */}
        <div className="lg:col-span-6 bg-[#090b11] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-display font-black text-slate-200 uppercase tracking-wider">
                Druckenmiller Macro Alpha Signals
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              4 ACTIVE REGIMES
            </span>
          </div>

          <div className="space-y-3">
            {signals.map((sig) => (
              <div
                key={sig.id}
                onClick={() => {
                  setActiveSignal(sig);
                  setSelectedToken(sig.tokenSymbol);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeSignal?.id === sig.id
                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 font-display">{sig.tokenSymbol}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      sig.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' :
                      sig.action === 'ACCUMULATE' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {sig.action} • {sig.conviction} CONVICTION
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    Asymmetry: {sig.asymmetryRatio}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-jp leading-relaxed line-clamp-2">
                  {sig.druckenmillerThesis}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Rec Size: <strong className="text-cyan-400">{sig.recommendedSizeEth} ETH</strong></span>
                  <span>Virtue Alignment: <strong className="text-amber-400">{sig.virtueAlignmentScore}/100</strong></span>
                  <span>{sig.generatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 Cols: Gemini AI Copilot Dialogue */}
        <div className="lg:col-span-6 bg-[#090b11] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-display font-black text-slate-200 uppercase tracking-wider">
                  Druckenmiller AI Copilot (Gemini-Powered)
                </h3>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                gemini-3.8-flash
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-xs ${
                    msg.role === 'user'
                      ? 'bg-slate-900 border border-slate-800 text-slate-200 ml-6'
                      : 'bg-cyan-950/20 border border-cyan-500/30 text-slate-300 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                    <span>{msg.role === 'user' ? 'You' : 'Stanley Druckenmiller AI'}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed font-jp">{msg.text}</p>
                </div>
              ))}

              {isCopilotThinking && (
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-cyan-400 flex items-center gap-2 mr-6 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing macro liquidity parameters & Bushido virtues...</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                'How should I size my next Base swap?',
                'Evaluate Gi asymmetry vs downside risk',
                'Explain how 1inch & LI.FI split this trade'
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCopilotInput(suggestion)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskCopilot} className="flex gap-2">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Ask Stanley Druckenmiller AI Copilot..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isCopilotThinking || !copilotInput.trim()}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
