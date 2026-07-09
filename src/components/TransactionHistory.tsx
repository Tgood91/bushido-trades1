import React, { useState } from 'react';
import { Coin, TradeLog } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Briefcase, 
  Activity,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react';
import { formatAddress, formatPrice } from '../utils';

interface TransactionHistoryProps {
  tradeLogs: TradeLog[];
  coins: Coin[];
  onSelectCoin: (coinId: string) => void;
  setActiveTab: (tab: 'pools' | 'launch' | 'terminal' | 'vault' | 'playbook' | 'bushido' | 'testing' | 'history') => void;
}

export default function TransactionHistory({ 
  tradeLogs, 
  coins, 
  onSelectCoin,
  setActiveTab
}: TransactionHistoryProps) {
  const [selectedCoinFilter, setSelectedCoinFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find associated coin for a log
  const getCoinForLog = (coinId: string) => {
    return coins.find(c => c.id === coinId);
  };

  // Filter logs
  const filteredLogs = tradeLogs.filter(log => {
    const coin = getCoinForLog(log.coinId);
    const matchesCoin = selectedCoinFilter === 'all' || log.coinId === selectedCoinFilter;
    const matchesType = selectedTypeFilter === 'all' || log.type === selectedTypeFilter;
    
    const coinName = coin ? coin.name.toLowerCase() : '';
    const coinSymbol = coin ? coin.symbol.toLowerCase() : '';
    const hash = log.hash.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = !query || 
      coinName.includes(query) || 
      coinSymbol.includes(query) || 
      hash.includes(query) || 
      log.sender.toLowerCase().includes(query);

    return matchesCoin && matchesType && matchesSearch;
  });

  // Calculate metrics
  const totalVolumeEth = filteredLogs.reduce((acc, log) => {
    // For buy, volume is ethAmount. For sell, volume is ethAmount (the returned gross eth)
    return acc + log.ethAmount;
  }, 0);

  const totalFeesEth = filteredLogs.reduce((acc, log) => acc + log.fees.total, 0);
  const creatorFeesEth = filteredLogs.reduce((acc, log) => acc + log.fees.creator, 0);
  const platformFeesEth = filteredLogs.reduce((acc, log) => acc + log.fees.platform, 0);
  const referrerFeesEth = filteredLogs.reduce((acc, log) => acc + log.fees.tradeRef + log.fees.createRef, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Title & Stats Grid Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-slate-100 flex items-center gap-2 tracking-wide">
            <History className="h-5 w-5 text-amber-500" />
            BUSHIDO ON-CHAIN LEDGER
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time auditable ledger of all simulated trades, liquidity pools, and creator fee splits on Base.
          </p>
        </div>
      </div>

      {/* Protocol Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Ledger Volume */}
        <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-500" />
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 font-mono uppercase font-bold">Ledger Traded Volume</span>
            <span className="text-xl font-mono font-black text-slate-200">{totalVolumeEth.toFixed(4)} ETH</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">{filteredLogs.length} Total Swaps</span>
          </div>
        </div>

        {/* Total Fees Generated */}
        <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-amber-500/20 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 font-mono uppercase font-bold">Total Fees Collected</span>
            <span className="text-xl font-mono font-black text-slate-200">{totalFeesEth.toFixed(5)} ETH</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">1.00% split across stakeholders</span>
          </div>
        </div>

        {/* Creator Share (0.50%) */}
        <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-red-500/20 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full filter blur-xl pointer-events-none group-hover:bg-red-500/10 transition-all duration-500" />
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 font-mono uppercase font-bold">Creator Split (0.50%)</span>
            <span className="text-xl font-mono font-black text-slate-200">{creatorFeesEth.toFixed(5)} ETH</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Direct to virtue creators</span>
          </div>
        </div>

        {/* Platform & Referrers Share */}
        <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 font-mono uppercase font-bold">Platform & Ref splits</span>
            <span className="text-xl font-mono font-black text-slate-200">{(platformFeesEth + referrerFeesEth).toFixed(5)} ETH</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Platform: {platformFeesEth.toFixed(5)} | Refs: {referrerFeesEth.toFixed(5)}</span>
          </div>
        </div>

      </div>

      {/* Advanced Filtering controls */}
      <div className="bg-[#06070b]/90 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by token name, symbol, transaction hash, or sender address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter by Coin */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-900 text-xs font-mono">
              <Compass className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400 font-bold">Virtue:</span>
              <select 
                value={selectedCoinFilter}
                onChange={(e) => setSelectedCoinFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Coins</option>
                {coins.map(c => (
                  <option key={c.id} value={c.id}>{c.symbol} ({c.name.split(' (')[0]})</option>
                ))}
              </select>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-900 text-xs font-mono">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400 font-bold">Type:</span>
              <select 
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Swaps</option>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 bg-slate-950/40 select-none">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Asset</th>
                <th className="p-4">Type</th>
                <th className="p-4">Volume (ETH)</th>
                <th className="p-4">Token Amount</th>
                <th className="p-4">Swap Price</th>
                <th className="p-4">Fees Split (1.00%)</th>
                <th className="p-4">Hash</th>
                <th className="p-4 text-center">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-950">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-600 font-mono">
                    <History className="h-8 w-8 text-slate-750 mx-auto mb-2 animate-pulse" />
                    No transactions matching your active filters. Try clearing your filters or swap tokens in the terminal.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  if (log.isSyncAlert) {
                    return (
                      <tr key={log.id} className="bg-amber-950/5 hover:bg-amber-950/10 font-mono text-amber-500/90 transition-colors">
                        <td className="p-4 text-[11px] text-amber-600/80">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Clock className="h-3 w-3 text-amber-600/70" />
                            {log.timestamp}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-300">
                          Base Ledger
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            SYNC
                          </span>
                        </td>
                        <td colSpan={3} className="p-4 text-xs font-sans text-slate-300">
                          <span className="font-bold text-amber-400 font-mono">Blockchain State Synced!</span> Re-fetched latest pool balances & tick ranges from <span className="font-bold text-slate-100">{log.sender}</span>. Gas: <span className="text-cyan-400 font-bold font-mono">{log.syncDetails?.gasPrice || '1.50'} Gwei</span>.
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]" colSpan={2}>
                          <div className="flex items-center gap-1.5 select-all">
                            <span>{formatAddress(log.hash)}</span>
                            <button 
                              onClick={() => handleCopy(log.hash, log.id)}
                              className="text-slate-650 hover:text-amber-400 p-1 hover:bg-slate-900 rounded transition-colors"
                              title="Copy Block Hash"
                            >
                              {copiedId === log.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  const coin = getCoinForLog(log.coinId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-950/20 font-mono text-slate-300 transition-colors">
                      {/* Timestamp */}
                      <td className="p-4 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-slate-600" />
                          {log.timestamp}
                        </span>
                      </td>

                      {/* Coin Asset */}
                      <td className="p-4">
                        {coin ? (
                          <button
                            onClick={() => {
                              onSelectCoin(coin.id);
                              setActiveTab('terminal');
                            }}
                            className="flex items-center gap-1.5 hover:text-cyan-400 font-bold transition-colors text-left"
                            title="Go to Trading Terminal"
                          >
                            <span className="text-slate-100">{coin.symbol}</span>
                            <span className="text-[10px] text-slate-500 font-sans">({coin.name.split(' (')[0]})</span>
                          </button>
                        ) : (
                          <span className="text-slate-500">Unknown</span>
                        )}
                      </td>

                      {/* Trade Type */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.type === 'BUY' 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {log.type === 'BUY' ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {log.type}
                        </span>
                      </td>

                      {/* ETH Volume */}
                      <td className="p-4 text-slate-200 font-black">{log.ethAmount.toFixed(4)} ETH</td>

                      {/* Token Amount */}
                      <td className="p-4 text-slate-400">
                        {log.tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} {coin?.symbol || 'TOKENS'}
                      </td>

                      {/* Swap Price */}
                      <td className="p-4 text-cyan-400 font-bold" title="AMM execution price per unit">
                        {formatPrice(log.price)} ETH
                      </td>

                      {/* Fees distribution tooltips */}
                      <td className="p-4" title={`Creator: ${log.fees.creator.toFixed(6)} ETH\nPlatform: ${log.fees.platform.toFixed(6)} ETH\nTrade Ref: ${log.fees.tradeRef.toFixed(6)} ETH\nCreate Ref: ${log.fees.createRef.toFixed(6)} ETH`}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-amber-400 font-bold">{log.fees.total.toFixed(6)} ETH</span>
                          <span className="text-[9px] text-slate-500">0.5% Creator / 0.5% Fee Split</span>
                        </div>
                      </td>

                      {/* Hash with copy icon */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 text-[11px]">{formatAddress(log.hash)}</span>
                          <button 
                            onClick={() => handleCopy(log.hash, log.id)}
                            className="text-slate-650 hover:text-cyan-400 p-1 hover:bg-slate-900 rounded transition-colors"
                            title="Copy Transaction Hash"
                          >
                            {copiedId === log.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Action Trade Button to quickly swap this token */}
                      <td className="p-4 text-center">
                        {coin && (
                          <button
                            onClick={() => {
                              onSelectCoin(coin.id);
                              setActiveTab('terminal');
                            }}
                            className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-[10px] text-slate-300 font-bold rounded-lg transition-all"
                          >
                            Trade
                          </button>
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

    </div>
  );
}
