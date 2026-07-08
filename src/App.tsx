import React, { useState, useEffect } from 'react';
import { Coin, TradeLog } from './types';
import { generateInitialHistory, TOTAL_SUPPLY, POOL_ALLOCATION, CREATOR_ALLOCATION } from './utils';
import { fetchOnchainIdentity } from './utils/baseSdk';
import LaunchForm from './components/LaunchForm';
import ActiveCoins from './components/ActiveCoins';
import TradingTerminal from './components/TradingTerminal';
import ContractVault from './components/ContractVault';
import AndroidGuide from './components/AndroidGuide';
import BushidoTradingDashboard from './components/BushidoTradingDashboard';
import TestingSuite from './components/TestingSuite';
import ToadGang from './components/ToadGang';
import TransactionHistory from './components/TransactionHistory';
const bushidoIcon = '/src/assets/images/bushido_icon_1783540049716.jpg';
import { 
  Plus, 
  Coins, 
  ArrowDownUp, 
  FileCode, 
  HelpCircle, 
  Wallet,
  Settings,
  RefreshCw,
  Globe,
  Compass,
  Activity,
  Wifi,
  UserCheck,
  ShieldCheck,
  Server,
  History
} from 'lucide-react';

const generateInitialTradeLogs = (): TradeLog[] => {
  return [
    {
      id: 'init-tx-1',
      coinId: 'yu-pool',
      type: 'BUY',
      ethAmount: 1.5,
      tokenAmount: 600000,
      price: 2.5 / POOL_ALLOCATION,
      timestamp: '10:30 AM',
      fees: {
        creator: 0.0075,
        platform: 0.003,
        tradeRef: 0.00225,
        createRef: 0.00225,
        total: 0.015
      },
      sender: '0xShogunTrader',
      hash: '0x09bc877EE0c4f3beEf7beB72e919Cf822ed34Fa2bfdfdfa89123'
    },
    {
      id: 'init-tx-2',
      coinId: 'rei-pool',
      type: 'BUY',
      ethAmount: 1.2,
      tokenAmount: 480000,
      price: 1.8 / POOL_ALLOCATION,
      timestamp: '08:15 AM',
      fees: {
        creator: 0.006,
        platform: 0.0024,
        tradeRef: 0.0018,
        createRef: 0.0018,
        total: 0.012
      },
      sender: '0xRoninWallet',
      hash: '0x7bcc777EE0c4f3beEf7beB72e919Cf822ed34Fa9fe52c8b746'
    },
    {
      id: 'init-tx-3',
      coinId: 'gi-pool',
      type: 'BUY',
      ethAmount: 0.8,
      tokenAmount: 320000,
      price: 1.0 / POOL_ALLOCATION,
      timestamp: '07:45 AM',
      fees: {
        creator: 0.004,
        platform: 0.0016,
        tradeRef: 0.0012,
        createRef: 0.0012,
        total: 0.008
      },
      sender: '0xSamuraiDegen',
      hash: '0x940c777EE0c4f3beEf7beB72e919Cf822ed34Fa5ce7b54a234'
    },
    {
      id: 'init-tx-4',
      coinId: 'jin-pool',
      type: 'BUY',
      ethAmount: 0.5,
      tokenAmount: 200000,
      price: 0.5 / POOL_ALLOCATION,
      timestamp: '06:05 AM',
      fees: {
        creator: 0.0025,
        platform: 0.001,
        tradeRef: 0.00075,
        createRef: 0.00075,
        total: 0.005
      },
      sender: '0xZenMaster',
      hash: '0x3cfc777EE0c4f3beEf7beB72e919Cf822ed34Fa9df98b44910'
    }
  ];
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'pools' | 'launch' | 'terminal' | 'vault' | 'playbook' | 'bushido' | 'testing' | 'history'>('pools');
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(generateInitialTradeLogs);
  const [network, setNetwork] = useState<'mainnet' | 'sepolia'>('mainnet');
  const [simulatedEthBalance, setSimulatedEthBalance] = useState(10.0); // Starts with 10 simulated ETH
  const [showToadSplash, setShowToadSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('toad_gang_dismissed') !== 'true';
    }
    return true;
  });

  // Base SDK real-time network latency and authentication status
  const [latency, setLatency] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [basename, setBasename] = useState<string | null>(null);
  const [isCoinbaseVerified, setIsCoinbaseVerified] = useState(false);
  const [realBalance, setRealBalance] = useState<string | null>(null);

  // Periodically measure Base RPC latency using real on-chain fetch
  useEffect(() => {
    let active = true;
    const measureLatency = async () => {
      const rpcUrl = network === 'sepolia' ? 'https://sepolia.base.org' : 'https://mainnet.base.org';
      const start = performance.now();
      try {
        await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
        });
        const duration = Math.round(performance.now() - start);
        if (active) {
          setLatency(duration);
        }
      } catch (err) {
        console.warn('Latency measurement failed:', err);
        if (active) {
          setLatency(null);
        }
      }
    };

    measureLatency();
    const interval = setInterval(measureLatency, 6000); // Check every 6 seconds
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [network]);

  // Periodically verify browser wallet status and fetch on-chain identity
  useEffect(() => {
    let active = true;
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        try {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            if (!active) return;
            setWalletAddress(addr);
            
            // Fetch real on-chain identity (Basename, EAS, balance) from Base Node SDK
            const identity = await fetchOnchainIdentity(addr, network);
            if (!active) return;
            setBasename(identity.basename);
            setIsCoinbaseVerified(identity.isCoinbaseVerified);
            setRealBalance(identity.balanceEth);
          } else {
            if (!active) return;
            setWalletAddress(null);
            setBasename(null);
            setIsCoinbaseVerified(false);
            setRealBalance(null);
          }
        } catch (err) {
          console.error('Error checking wallet account:', err);
        }
      }
    };

    checkWallet();
    const walletInterval = setInterval(checkWallet, 5000); // Keep synced

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      const handleAccountsChanged = (accounts: string[]) => {
        checkWallet();
      };
      const handleChainChanged = () => {
        checkWallet();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        active = false;
        clearInterval(walletInterval);
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }

    return () => {
      active = false;
      clearInterval(walletInterval);
    };
  }, [network]);
  
  // Default Seeded Coins corresponding to the hybrid ERC-20z approach, themed around the 8 Bushido Virtues
  const defaultCoins: Coin[] = [
    {
      id: 'gi-pool',
      name: 'Gi (Righteousness / 義)',
      symbol: 'GI',
      tokenURI: 'ipfs://QmXyGiRighteousnessFactoryHash',
      creator: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      splitter: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      createReferrer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      platformFeeBps: 150, // 1.5%
      initialLiquidityETH: 1.0,
      sqrtPriceX96: '2518029525414619478148812',
      coinAddress: '0x21d2B273eE0C4F3bEEf7BEb72E919cf822Ed34f3',
      poolAddress: '0x940c777EE0c4f3beEf7beB72e919Cf822ed34Fa5',
      createdAt: '12:00 PM',
      currentPrice: 1.0 / POOL_ALLOCATION, // ~1.01e-9 ETH
      priceHistory: generateInitialHistory(1.0 / POOL_ALLOCATION, 15),
      volume24h: 1.25,
      feesGenerated: {
        creator: 0.00625,
        platform: 0.0025,
        tradeRef: 0.001875,
        createRef: 0.001875,
        total: 0.0125
      },
      poolTokenBalance: POOL_ALLOCATION,
      poolEthBalance: 1.0,
      creatorBalance: CREATOR_ALLOCATION,
      userBalance: 500000 // Seed with some tokens to trade immediately
    },
    {
      id: 'yu-pool',
      name: 'Yu (Heroic Courage / 勇)',
      symbol: 'YU',
      tokenURI: 'ipfs://QmDigitalYuCourageGenerativeArtz',
      creator: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      splitter: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      createReferrer: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      platformFeeBps: 200, // 2%
      initialLiquidityETH: 2.5,
      sqrtPriceX96: '3981358325414619478148812',
      coinAddress: '0x7e5fD273eE0C4F3bEEf7BEb72E919cf822Ed34f3',
      poolAddress: '0x43b877EE0c4f3beEf7beB72e919Cf822ed34Fa2',
      createdAt: '10:30 AM',
      currentPrice: 2.5 / POOL_ALLOCATION, // ~2.52e-9 ETH
      priceHistory: generateInitialHistory(2.5 / POOL_ALLOCATION, 15),
      volume24h: 4.80,
      feesGenerated: {
        creator: 0.024,
        platform: 0.0096,
        tradeRef: 0.0072,
        createRef: 0.0072,
        total: 0.048
      },
      poolTokenBalance: POOL_ALLOCATION,
      poolEthBalance: 2.5,
      creatorBalance: CREATOR_ALLOCATION,
      userBalance: 1200000
    },
    {
      id: 'jin-pool',
      name: 'Jin (Benevolence / 仁)',
      symbol: 'JIN',
      tokenURI: 'ipfs://QmMemeJinBenevolenceMomentum',
      creator: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      splitter: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      createReferrer: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      platformFeeBps: 100, // 1%
      initialLiquidityETH: 0.5,
      sqrtPriceX96: '1780514125414619478148812',
      coinAddress: '0x6291B273eE0C4F3bEEf7BEb72E919cf822Ed34f3',
      poolAddress: '0x3cfc777EE0c4f3beEf7beB72e919Cf822ed34Fa9',
      createdAt: '08:45 AM',
      currentPrice: 0.5 / POOL_ALLOCATION, // ~5.05e-10 ETH
      priceHistory: generateInitialHistory(0.5 / POOL_ALLOCATION, 15),
      volume24h: 0.95,
      feesGenerated: {
        creator: 0.00475,
        platform: 0.0019,
        tradeRef: 0.001425,
        createRef: 0.001425,
        total: 0.0095
      },
      poolTokenBalance: POOL_ALLOCATION,
      poolEthBalance: 0.5,
      creatorBalance: CREATOR_ALLOCATION,
      userBalance: 0
    },
    {
      id: 'rei-pool',
      name: 'Rei (Respect / 礼)',
      symbol: 'REI',
      tokenURI: 'ipfs://QmReiRespectV3PositionArt',
      creator: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      splitter: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      createReferrer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      platformFeeBps: 150, // 1.5%
      initialLiquidityETH: 1.8,
      sqrtPriceX96: '3128414125414619478148812',
      coinAddress: '0x9ae2B273eE0C4F3bEEf7BEb72E919cf822Ed34f3',
      poolAddress: '0x7bcc777EE0c4f3beEf7beB72e919Cf822ed34Fa9',
      createdAt: '06:15 AM',
      currentPrice: 1.8 / POOL_ALLOCATION, // ~1.81e-9 ETH
      priceHistory: generateInitialHistory(1.8 / POOL_ALLOCATION, 15),
      volume24h: 2.10,
      feesGenerated: {
        creator: 0.0105,
        platform: 0.0042,
        tradeRef: 0.00315,
        createRef: 0.00315,
        total: 0.021
      },
      poolTokenBalance: POOL_ALLOCATION,
      poolEthBalance: 1.8,
      creatorBalance: CREATOR_ALLOCATION,
      userBalance: 850000
    }
  ];

  const [coins, setCoins] = useState<Coin[]>(defaultCoins);
  const [selectedCoinId, setSelectedCoinId] = useState<string>('gi-pool');

  // Find active coin target
  const activeCoin = coins.find(c => c.id === selectedCoinId) || coins[0] || null;

  const handleCoinCreated = (newCoin: Coin) => {
    setCoins(prev => [newCoin, ...prev]);
    setSelectedCoinId(newCoin.id);
    setActiveTab('terminal'); // immediately focus terminal for newly deployed coin
  };

  const handleTradeExecuted = (updatedCoin: Coin, log: TradeLog) => {
    setCoins(prev => prev.map(c => c.id === updatedCoin.id ? updatedCoin : c));
    setTradeLogs(prev => [log, ...prev]);
  };

  const handleResetEth = () => {
    setSimulatedEthBalance(10.0);
  };

  return (
    <div className="min-h-screen bushido-ink-bg text-slate-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-red-200">
      
      {/* Top Header Navigation Panel */}
      <header className="border-b border-slate-900 bg-[#06070b]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand Brand with Bushido theme */}
          <div className="flex items-center gap-3 animate-in fade-in duration-500">
            <div className="relative h-11 w-11 group">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-cyan-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
              <img 
                src={bushidoIcon} 
                alt="Bushido Brand Icon" 
                className="relative h-11 w-11 rounded-xl border border-slate-800 object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-black tracking-widest bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500 bg-clip-text text-transparent">
                  BUSHIDO 八徳
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">8 Virtues</span>
              </div>
              <p className="text-[10px] text-slate-400 font-jp tracking-wider">The Way of the Token: Honor, Rectitude & Hybrid ERC-20z</p>
            </div>
          </div>

          {/* Web3 Wallet and Real-time Network Latency Indicator via Base SDK */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            
            {/* Real-time Network Latency Indicator via Base SDK */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-900/80" title="Base RPC Latency via Base SDK">
              <Server className="h-3.5 w-3.5 text-slate-500" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">Node:</span>
                {latency !== null ? (
                  <div className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      latency < 80 ? 'bg-emerald-400 animate-pulse' : latency < 200 ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                    <span className={`font-black ${
                      latency < 80 ? 'text-emerald-400' : latency < 200 ? 'text-amber-400' : 'text-red-400'
                    }`}>{latency}ms</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin text-slate-600" />
                    <span className="text-slate-600">pinging...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Network Selector */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-900/80">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <select 
                value={network} 
                onChange={(e) => setNetwork(e.target.value as 'mainnet' | 'sepolia')}
                className="bg-transparent text-slate-300 font-black focus:outline-none cursor-pointer text-xs"
              >
                <option value="mainnet" className="bg-slate-900">Base Mainnet</option>
                <option value="sepolia" className="bg-slate-900">Base Sepolia</option>
              </select>
            </div>

            {/* Wallet Authentication Status Indicator */}
            {walletAddress ? (
              <div className="flex items-center gap-2.5 bg-emerald-950/20 border border-emerald-900/50 px-3.5 py-1.5 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-pulse" />
                <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                
                <div className="flex items-center gap-1.5">
                  {basename ? (
                    <span className="text-emerald-300 font-black tracking-wide" title={walletAddress}>
                      {basename}
                    </span>
                  ) : (
                    <span className="text-slate-300 font-bold" title={walletAddress}>
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  )}

                  {isCoinbaseVerified && (
                    <span className="inline-flex items-center gap-0.5 bg-blue-500/20 border border-blue-400/40 text-[9px] text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase scale-90" title="Coinbase EAS Attestation Verified">
                      <ShieldCheck className="h-2.5 w-2.5 text-blue-400" />
                      EAS
                    </span>
                  )}
                </div>

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />

                <div className="border-l border-slate-800/80 pl-2.5 flex items-center gap-1.5">
                  <span className="text-cyan-400 font-black">
                    {realBalance ? `${parseFloat(realBalance).toFixed(4)} ETH` : '0.0000 ETH'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-900">
                <Wallet className="h-3.5 w-3.5 text-amber-500/90" />
                <span className="text-slate-400 font-semibold">Simulated:</span>
                <span className="text-amber-500/90 font-bold">0xBushidoWarrior</span>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                
                <div className="border-l border-slate-900 pl-2.5 flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">{simulatedEthBalance.toFixed(3)} ETH</span>
                  <button 
                    onClick={handleResetEth} 
                    title="Replenish simulated wallet balance to 10.0 ETH"
                    className="text-slate-500 hover:text-red-400 transition-colors p-0.5 hover:bg-slate-900 rounded"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Decorative 8 Virtues Row Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 font-jp text-[11px] text-center">
          <div className="py-2 px-1 rounded bg-slate-950/60 border border-cyan-500/10">
            <span className="block text-lg text-cyan-400 font-bold glow-cyan">義 (Gi)</span>
            <span className="text-slate-400 text-[10px]">Righteousness</span>
          </div>
          <div className="py-2 px-1 rounded bg-slate-950/60 border border-red-500/10">
            <span className="block text-lg text-red-500 font-bold glow-red">勇 (Yu)</span>
            <span className="text-slate-400 text-[10px]">Courage</span>
          </div>
          <div className="py-2 px-1 rounded bg-slate-950/60 border border-emerald-500/10">
            <span className="block text-lg text-emerald-400 font-bold glow-green">仁 (Jin)</span>
            <span className="text-slate-400 text-[10px]">Benevolence</span>
          </div>
          <div className="py-2 px-1 rounded bg-slate-950/60 border border-amber-500/10">
            <span className="block text-lg text-amber-500 font-bold glow-gold">礼 (Rei)</span>
            <span className="text-slate-400 text-[10px]">Respect</span>
          </div>
          <div className="py-2 px-1 rounded bg-slate-950/60 border border-cyan-500/10">
            <span className="block text-lg text-cyan-400 font-bold glow-cyan">誠 (Makoto)</span>
            <span className="text-slate-400 text-[10px]">Sincerity</span>
          </div>
          <div className="py-2 px-1 rounded bg-slate-950/60 border border-red-500/10">
            <span className="block text-lg text-red-500 font-bold glow-red">誉 (Meiyo)</span>
            <span className="text-slate-400 text-[10px]">Honor</span>
          </div>
          <div className="py-2 px-1 rounded bg-slate-950/60 border border-amber-500/10">
            <span className="block text-lg text-amber-500 font-bold glow-gold">忠 (Chugi)</span>
            <span className="text-slate-400 text-[10px]">Loyalty</span>
          </div>
          <div className="py-2 px-1 rounded bg-slate-950/60 border border-fuchsia-500/10">
            <span className="block text-lg text-fuchsia-400 font-bold glow-fuchsia">忍 (Nintai)</span>
            <span className="text-slate-400 text-[10px]">Patience</span>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <div className="flex border-b border-slate-900 gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            id="explore_tab_btn"
            onClick={() => setActiveTab('pools')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'pools'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5 glow-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="h-4 w-4" />
            Pools Registry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('launch')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'launch'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5 glow-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            Launch Token (ERC-20z)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'terminal'
                ? 'border-red-500 text-red-400 bg-red-500/5 glow-red'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownUp className="h-4 w-4" />
            Trading Terminal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5 glow-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-4 w-4" />
            Transaction History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'vault'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 glow-green'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            Contract Vault
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('playbook')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'playbook'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5 glow-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            Android Playbook
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bushido')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'bushido'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5 glow-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <img 
              src={bushidoIcon} 
              alt="Bushido" 
              className="h-4.5 w-4.5 rounded-full border border-slate-700 object-cover"
              referrerPolicy="no-referrer"
            />
            Way of Trade
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('testing')}
            className={`py-3 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'testing'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 glow-green'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            Diagnostic Suite
          </button>
        </div>

        {/* Selected Route Render */}
        <div className="min-h-[400px]">
          {activeTab === 'pools' && (
            <ActiveCoins 
              coins={coins} 
              onSelectCoin={(coin) => {
                setSelectedCoinId(coin.id);
                setActiveTab('terminal');
              }} 
              selectedCoinId={selectedCoinId}
            />
          )}

          {activeTab === 'launch' && (
            <LaunchForm 
              onCoinCreated={handleCoinCreated} 
              userAddress="0x5FbDB2315678afecb367f032d93F642f64180aa3" 
            />
          )}

          {activeTab === 'terminal' && (
            <TradingTerminal 
              coin={activeCoin} 
              onTradeExecuted={handleTradeExecuted}
              simulatedEthBalance={simulatedEthBalance}
              onUpdateEthBalance={setSimulatedEthBalance}
            />
          )}

          {activeTab === 'history' && (
            <TransactionHistory 
              tradeLogs={tradeLogs} 
              coins={coins} 
              onSelectCoin={setSelectedCoinId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'vault' && (
            <ContractVault />
          )}

          {activeTab === 'playbook' && (
            <AndroidGuide />
          )}

          {activeTab === 'bushido' && (
            <BushidoTradingDashboard 
              simulatedEthBalance={simulatedEthBalance}
              onUpdateEthBalance={setSimulatedEthBalance}
              network={network}
              onUpdateNetwork={setNetwork}
              bushidoIconSrc={bushidoIcon}
            />
          )}

          {activeTab === 'testing' && (
            <TestingSuite />
          )}
        </div>

      </main>

      {/* Footer Design */}
      <footer className="border-t border-slate-900 bg-[#040507] py-8 text-center text-xs text-slate-500 font-jp tracking-wider">
        <p className="text-slate-400">© 2026 BUSHIDO-20z (八徳) Launchpad. Guided by the 8 Virtues of Righteousness, Courage, Benevolence, and Honor.</p>
        <p className="mt-1 text-[11px] text-slate-600 font-sans">Simulating hybrid ERC-20z liquidity pool contracts on Base. Crafted for premium desktop & responsive Android guides.</p>
      </footer>

      {/* Floating ToadGang™ Badge */}
      <button
        onClick={() => setShowToadSplash(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider py-3 px-4.5 rounded-full shadow-xl shadow-lime-950/40 flex items-center gap-2 border border-lime-400/20 active:scale-[0.95] transition-all cursor-pointer"
        title="Open ToadGang™ Community Hub"
      >
        <span className="text-sm animate-bounce">🐸</span>
        <span className="font-sans font-extrabold tracking-wide">ToadGang™</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
        </span>
      </button>

      {/* ToadGang™ Splash Overlay */}
      {showToadSplash && (
        <ToadGang 
          onClose={() => {
            setShowToadSplash(false);
            localStorage.setItem('toad_gang_dismissed', 'true');
          }} 
        />
      )}

    </div>
  );
}
