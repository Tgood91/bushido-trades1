import React, { useState, useEffect } from 'react';
import { Coin, DeploymentStep } from '../types';
import { 
  calculateSqrtPriceX96, 
  generateRandomAddress, 
  formatAddress, 
  formatPrice,
  POOL_ALLOCATION,
  CREATOR_ALLOCATION,
  TOTAL_SUPPLY,
  generateInitialVolumeHistory
} from '../utils';
import { 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Percent, 
  TrendingUp, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Copy,
  Wallet,
  ArrowRight,
  Award
} from 'lucide-react';

interface LaunchFormProps {
  onCoinCreated: (coin: Coin) => void;
  userAddress: string;
}

interface VirtueItem {
  name: string;
  kanji: string;
  translation: string;
  symbol: string;
  color: string;
  glowClass: string;
  bgClass: string;
  borderClass: string;
  desc: string;
}

const BUSHIDO_VIRTUES: VirtueItem[] = [
  { name: 'Gi', kanji: '義', translation: 'Righteousness', symbol: 'GI', color: 'text-cyan-400', glowClass: 'glow-cyan', bgClass: 'bg-cyan-500/5', borderClass: 'border-cyan-500/20', desc: 'Absolute rectitude and integrity in smart contracts' },
  { name: 'Yu', kanji: '勇', translation: 'Courage', symbol: 'YU', color: 'text-red-500', glowClass: 'glow-red', bgClass: 'bg-red-500/5', borderClass: 'border-red-500/20', desc: 'Bold market maker deploying custom active ranges' },
  { name: 'Jin', kanji: '仁', translation: 'Benevolence', symbol: 'JIN', color: 'text-emerald-400', glowClass: 'glow-green', bgClass: 'bg-emerald-500/5', borderClass: 'border-emerald-500/20', desc: 'Empowering creator royalties and split payments' },
  { name: 'Rei', kanji: '礼', translation: 'Respect', symbol: 'REI', color: 'text-amber-400', glowClass: 'glow-gold', bgClass: 'bg-amber-500/5', borderClass: 'border-amber-500/20', desc: 'Courteous integration with referrers and router ports' },
  { name: 'Makoto', kanji: '誠', translation: 'Sincerity', symbol: 'MAKOTO', color: 'text-cyan-400', glowClass: 'glow-cyan', bgClass: 'bg-cyan-500/5', borderClass: 'border-cyan-500/20', desc: '100% transparent token distribution with no lock delays' },
  { name: 'Meiyo', kanji: '名誉', translation: 'Honor', symbol: 'MEIYO', color: 'text-red-500', glowClass: 'glow-red', bgClass: 'bg-red-500/5', borderClass: 'border-red-500/20', desc: 'Guarding protocol reputation with verified codebases' },
  { name: 'Chugi', kanji: '忠義', translation: 'Loyalty', symbol: 'CHUGI', color: 'text-amber-400', glowClass: 'glow-gold', bgClass: 'bg-amber-500/5', borderClass: 'border-amber-500/20', desc: 'Committed split locks supporting decentralized vaults' },
  { name: 'Jiseki', kanji: '自制', translation: 'Self-Control', symbol: 'JISEKI', color: 'text-emerald-400', glowClass: 'glow-green', bgClass: 'bg-emerald-500/5', borderClass: 'border-emerald-500/20', desc: 'Optimized gas execution limits and strict slippage controls' }
];

export default function LaunchForm({ onCoinCreated, userAddress }: LaunchFormProps) {
  const [selectedVirtueIndex, setSelectedVirtueIndex] = useState(0);
  
  // Input states
  const [name, setName] = useState('Gi Righteousness');
  const [symbol, setSymbol] = useState('GI');
  const [tokenURI, setTokenURI] = useState('ipfs://QmXyGiRighteousnessFactoryHash');
  const [creator, setCreator] = useState(userAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3');
  const [splitter, setSplitter] = useState('');
  const [createReferrer, setCreateReferrer] = useState('');
  const [platformFeeBps, setPlatformFeeBps] = useState(150); // 1.5%
  const [initialLiquidityETH, setInitialLiquidityETH] = useState(1.0);
  
  // Advanced Settings Toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Deployment simulation states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySteps, setDeploySteps] = useState<DeploymentStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [deployedCoin, setDeployedCoin] = useState<Coin | null>(null);

  // Auto-calculated fields
  const [netLiquidityETH, setNetLiquidityETH] = useState(0.985);
  const [platformFeeAmount, setPlatformFeeAmount] = useState(0.015);
  const [estimatedInitialPrice, setEstimatedInitialPrice] = useState(0.000000001);
  const [sqrtPrice, setSqrtPrice] = useState({ dec: '2518029525414619478148812', hex: '0x2117565551dc047a000' });

  // Handle virtue selection
  const handleSelectVirtue = (index: number) => {
    setSelectedVirtueIndex(index);
    const v = BUSHIDO_VIRTUES[index];
    setName(`${v.name} ${v.translation}`);
    setSymbol(v.symbol);
    setTokenURI(`ipfs://QmBushidoVirtue${v.name}MetadataHash`);
    
    // Set typical fee profiles according to the virtue's nature
    if (v.name === 'Gi' || v.name === 'Makoto') {
      setPlatformFeeBps(100); // 1.0%
      setInitialLiquidityETH(1.5);
    } else if (v.name === 'Yu' || v.name === 'Meiyo') {
      setPlatformFeeBps(200); // 2.0%
      setInitialLiquidityETH(2.5);
    } else if (v.name === 'Jin' || v.name === 'Jiseki') {
      setPlatformFeeBps(120); // 1.2%
      setInitialLiquidityETH(0.8);
    } else {
      setPlatformFeeBps(150); // 1.5%
      setInitialLiquidityETH(1.8);
    }
  };

  // Recalculate fees and Uniswap V3 Pool Price settings when inputs change
  useEffect(() => {
    const feePct = platformFeeBps / 10000;
    const feeAmount = initialLiquidityETH * feePct;
    const netLiq = Math.max(0.0001, initialLiquidityETH - feeAmount);
    
    const calculatedPrice = netLiq / POOL_ALLOCATION;
    
    setPlatformFeeAmount(feeAmount);
    setNetLiquidityETH(netLiq);
    setEstimatedInitialPrice(calculatedPrice);
    setSqrtPrice(calculateSqrtPriceX96(calculatedPrice));
  }, [platformFeeBps, initialLiquidityETH]);

  const activeVirtue = BUSHIDO_VIRTUES[selectedVirtueIndex];

  const handleLaunchSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !symbol) return;

    setIsDeploying(true);
    setDeployedCoin(null);
    setCurrentStepIndex(0);

    const steps: DeploymentStep[] = [
      { id: '1', label: 'Purifying Bytecode', description: `Engraving implementation for ${name} (${symbol})`, status: 'running' },
      { id: '2', label: 'Deploying Virtue Coin (ERC-20z)', description: `Forging token smart contract using the rules of ${activeVirtue.translation}`, status: 'idle' },
      { id: '3', label: 'Sacred Allocation', description: `Allocating 990M (99%) to liquidity reserves and 10M (1%) creator share`, status: 'idle' },
      { id: '4', label: 'Deducting platform dues', description: `Transferring platform setup fee of ${platformFeeAmount.toFixed(4)} ETH`, status: 'idle' },
      { id: '5', label: 'Binding Uniswap V3 Pool', description: 'Creating automated pool on Uniswap V3 Factory with full-range ticks', status: 'idle' },
      { id: '6', label: 'Calibrating SqrtPriceX96', description: `Initializing active price parameters for tick alignment`, status: 'idle' },
      { id: '7', label: 'Seeding Liquidity Reserves', description: `Depositing ${netLiquidityETH.toFixed(4)} ETH and 990,000,000 ${symbol} safely`, status: 'idle' },
      { id: '8', label: 'Locking LP positions', description: 'Activating trade referral fee splitters and locking pool ownership', status: 'idle' }
    ];
    setDeploySteps(steps);

    // Simulate stepping through blockchain confirmations
    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      setDeploySteps(prev => prev.map((s, idx) => {
        if (idx === i) return { ...s, status: 'running' };
        if (idx < i) return { ...s, status: 'completed' };
        return s;
      }));

      const delay = i === 0 ? 500 : i === 6 ? 1100 : i === 4 ? 800 : 600;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    setDeploySteps(prev => prev.map(s => ({ ...s, status: 'completed' })));

    const randomCoinAddr = generateRandomAddress();
    const randomPoolAddr = generateRandomAddress();
    const mockCoin: Coin = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      symbol,
      tokenURI,
      creator,
      splitter: splitter || creator,
      createReferrer: createReferrer || '0x0000000000000000000000000000000000000000',
      platformFeeBps,
      initialLiquidityETH,
      sqrtPriceX96: sqrtPrice.dec,
      poolAddress: randomPoolAddr,
      coinAddress: randomCoinAddr,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentPrice: estimatedInitialPrice,
      priceHistory: [
        { timestamp: "12:00 AM", price: estimatedInitialPrice * 0.95 },
        { timestamp: "04:00 AM", price: estimatedInitialPrice * 0.98 },
        { timestamp: "08:00 AM", price: estimatedInitialPrice * 1.02 },
        { timestamp: "12:00 PM", price: estimatedInitialPrice }
      ],
      volume24h: 0,
      volumeHistory: generateInitialVolumeHistory(0.01, 24, name || symbol),
      feesGenerated: {
        creator: 0,
        platform: 0,
        tradeRef: 0,
        createRef: 0,
        total: 0
      },
      poolTokenBalance: POOL_ALLOCATION,
      poolEthBalance: netLiquidityETH,
      creatorBalance: CREATOR_ALLOCATION,
      userBalance: 0
    };

    setDeployedCoin(mockCoin);
    onCoinCreated(mockCoin);
    setIsDeploying(false);
  };

  return (
    <div className="space-y-6" id="launch_section">
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-slate-900 opacity-10 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-display font-black text-slate-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-red-500" />
              Virtue Token Launcher
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a sacred Bushido virtue to forge your unique ERC-20z token. Imbues your pool with automated full-range Uniswap V3 liquidity.
            </p>
          </div>
        </div>

        {/* Virtue Selector Grid */}
        <div className="relative z-10 mb-6">
          <span className="text-xs font-semibold text-slate-450 block mb-2.5 uppercase tracking-wider font-display">Select Enforced Virtue (八徳)</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {BUSHIDO_VIRTUES.map((v, idx) => {
              const isSelected = selectedVirtueIndex === idx;
              return (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => handleSelectVirtue(idx)}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                    isSelected 
                      ? `${v.borderClass} ${v.bgClass} scale-102 ring-1 ring-offset-1 ring-offset-[#090b11] ring-slate-800`
                      : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'
                  }`}
                >
                  <span className={`text-xl font-jp font-black block ${isSelected ? v.color : 'text-slate-500'}`}>
                    {v.kanji}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 block mt-0.5">{v.name}</span>
                  <span className="text-[8px] text-slate-500 font-medium">{v.translation}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex items-start gap-2 text-xs">
            <span className={`text-sm font-jp font-bold px-1.5 py-0.5 rounded ${activeVirtue.bgClass} ${activeVirtue.color}`}>
              {activeVirtue.kanji}
            </span>
            <div className="text-slate-400 self-center">
              <strong className="text-slate-200">{activeVirtue.name} ({activeVirtue.translation}):</strong> {activeVirtue.desc}
            </div>
          </div>
        </div>

        <form onSubmit={handleLaunchSimulation} className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Main settings column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Token Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g. Gi Righteousness"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Ticker Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g. GI"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                Token URI / Metadata URL
                <HelpCircle className="h-3 w-3 text-slate-500 cursor-pointer" title="External link to token metadata, description, or IPFS catalog" />
              </label>
              <input
                type="text"
                value={tokenURI}
                onChange={(e) => setTokenURI(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                placeholder="ipfs://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Initial Pool Liquidity (ETH)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={initialLiquidityETH}
                    onChange={(e) => setInitialLiquidityETH(Math.max(0.01, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-4 pr-12 py-2.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-slate-500 font-bold">ETH</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Platform Setup Fee (BPS)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={platformFeeBps}
                    onChange={(e) => setPlatformFeeBps(Math.min(1000, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-4 pr-12 py-2.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="e.g. 150 BPS"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-slate-500 font-semibold">%{(platformFeeBps/100).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors mt-2 cursor-pointer"
            >
              {showAdvanced ? 'Hide Optional Parameters' : 'Show Optional Parameters (Creator/Referrals)'}
              <ChevronRight className={`h-3.5 w-3.5 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Creator Account Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setCreator(generateRandomAddress())}
                      className="text-[10px] text-red-400 hover:underline cursor-pointer"
                    >
                      Generate New
                    </button>
                  </div>
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-slate-300 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-semibold text-slate-400">
                        Splitter Contract (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={() => setSplitter(generateRandomAddress())}
                        className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        Mock Splitter
                      </button>
                    </div>
                    <input
                      type="text"
                      value={splitter}
                      onChange={(e) => setSplitter(e.target.value)}
                      placeholder="Defaults to creator address if empty"
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-slate-300 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-semibold text-slate-400">
                        Create Referrer Address
                      </label>
                      <button
                        type="button"
                        onClick={() => setCreateReferrer(generateRandomAddress())}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        Mock Referrer
                      </button>
                    </div>
                    <input
                      type="text"
                      value={createReferrer}
                      onChange={(e) => setCreateReferrer(e.target.value)}
                      placeholder="0x0000... (0.15% fee referrer)"
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-slate-300 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isDeploying}
              className="w-full mt-4 bg-gradient-to-r from-cyan-500 via-amber-500 to-red-600 hover:brightness-110 text-slate-950 font-display font-black py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest cursor-pointer"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Simulating Virtue Deployment...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Forge Virtue Coin (ERC-20z)
                </>
              )}
            </button>
          </div>

          {/* Technical calculations & supply split column */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-display font-bold text-slate-300 tracking-wider uppercase border-b border-slate-900 pb-2">
              On-Chain Setup Preview
            </h3>

            {/* Token Allocation split */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-450 block">Supply Allocation Profile</span>
              
              <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full" style={{ width: '99%' }} title="99% LP Allocation" />
                <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full" style={{ width: '1%' }} title="1% Creator" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#05060a] p-2.5 rounded-lg border border-slate-900">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold mb-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    Liquidity Pool (99%)
                  </div>
                  <span className="font-mono text-slate-200 text-sm">{(POOL_ALLOCATION).toLocaleString()}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Seeded into Uniswap V3 position</p>
                </div>
                <div className="bg-[#05060a] p-2.5 rounded-lg border border-slate-900">
                  <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    Creator (1%)
                  </div>
                  <span className="font-mono text-slate-200 text-sm">{(CREATOR_ALLOCATION).toLocaleString()}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Transferred to creator wallet</p>
                </div>
              </div>
            </div>

            {/* Liquidity fee split */}
            <div className="space-y-3 border-t border-slate-900/60 pt-4">
              <span className="text-xs font-semibold text-slate-400 block">Deployment Cost & Fee Split</span>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Initial Liquidity Supplied</span>
                  <span className="font-mono font-bold text-slate-200">{initialLiquidityETH.toFixed(2)} ETH</span>
                </div>
                <div className="flex justify-between items-center text-red-400">
                  <span className="flex items-center gap-1">
                    Platform Setup Fee ({(platformFeeBps / 100).toFixed(2)}%)
                  </span>
                  <span className="font-mono">- {platformFeeAmount.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-bold border-t border-dashed border-slate-900/80 pt-2">
                  <span>Pool Seed Liquidity (ETH)</span>
                  <span className="font-mono">{netLiquidityETH.toFixed(4)} ETH</span>
                </div>
              </div>
            </div>

            {/* Client-Side Price Formula representation */}
            <div className="space-y-3 border-t border-slate-900/60 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Client-Side Pool Price Math</span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono">
                  SOLVED: No Overflow
                </span>
              </div>

              <div className="bg-[#05060a] p-3.5 rounded-xl border border-slate-900 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Initial Price:</span>
                  <span className="text-slate-200">{estimatedInitialPrice.toExponential(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Form:</span>
                  <span className="text-slate-200">WETH per {symbol || 'COIN'}</span>
                </div>
                <div className="border-t border-slate-900 my-2 pt-2">
                  <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
                    <span>sqrtPriceX96 (Decimal):</span>
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(sqrtPrice.dec)}
                      className="text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Copy className="h-2.5 w-2.5" /> Copy
                    </button>
                  </div>
                  <div className="text-slate-300 overflow-x-auto whitespace-pre font-semibold break-all text-[11px] bg-slate-950 p-2 rounded border border-slate-900">
                    {sqrtPrice.dec}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
                    <span>sqrtPriceX96 (Hexadecimal):</span>
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(sqrtPrice.hex)}
                      className="text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Copy className="h-2.5 w-2.5" /> Copy
                    </button>
                  </div>
                  <div className="text-amber-400 overflow-x-auto whitespace-pre font-bold break-all text-[11px] bg-slate-950 p-2 rounded border border-slate-900">
                    {sqrtPrice.hex}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Deployment sequencer overlays */}
      {isDeploying && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#090b11] border border-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-4">
              <Loader2 className="h-6 w-6 text-red-500 animate-spin" />
              <div>
                <h3 className="text-md font-display font-bold text-slate-100">Forging Virtue Contract</h3>
                <p className="text-xs text-slate-450">Step {currentStepIndex + 1} of {deploySteps.length}</p>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
              {deploySteps.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={`flex gap-3 text-xs p-2.5 rounded-lg border transition-all ${
                    step.status === 'running' 
                      ? 'bg-red-500/5 border-red-500/30 text-red-300' 
                      : step.status === 'completed'
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-450'
                      : 'bg-slate-950/40 border-slate-950 text-slate-600'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450 flex-shrink-0" />
                  ) : step.status === 'running' ? (
                    <Loader2 className="h-4.5 w-4.5 text-red-450 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-slate-900 flex items-center justify-center text-[10px] text-slate-500 flex-shrink-0 font-mono">
                      {idx + 1}
                    </div>
                  )}
                  <div>
                    <span className="font-bold block text-slate-200">{step.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{step.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-900/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-jp">戦士の道 (Base Network Layer)</span>
              <span className="font-mono">Gas Limit: ~2,401,902 gwei</span>
            </div>
          </div>
        </div>
      )}

      {/* Success deployment dialog */}
      {deployedCoin && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#090b11] border border-emerald-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="text-center space-y-3 mb-6">
              <div className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 p-3 rounded-full border border-emerald-500/20">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-100">Virtue Token Forged Successfully!</h3>
              <p className="text-xs text-slate-400">
                Your hybrid ERC-20z token is live and fully seeded inside the simulated Uniswap V3 Pool.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Token Name:</span>
                <span className="text-slate-200 font-sans font-bold">{deployedCoin.name} ({deployedCoin.symbol})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-mono">Enforced Virtue:</span>
                <span className="text-amber-400 font-bold font-jp">{activeVirtue.kanji} - {activeVirtue.translation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Initial Supply:</span>
                <span className="text-slate-200">{(TOTAL_SUPPLY).toLocaleString()} {deployedCoin.symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">WETH Seeded:</span>
                <span className="text-emerald-400 font-bold">{deployedCoin.poolEthBalance.toFixed(4)} ETH</span>
              </div>
              <div className="border-t border-slate-900 my-2" />
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Coin Contract:</span>
                  <span className="text-cyan-400 font-bold break-all">{deployedCoin.coinAddress}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Uniswap V3 Pool:</span>
                  <span className="text-red-400 font-bold break-all">{deployedCoin.poolAddress}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeployedCoin(null)}
                className="flex-1 bg-[#05060a] hover:bg-[#07090f] text-slate-300 text-xs font-bold py-3 rounded-xl transition-colors border border-slate-900 cursor-pointer"
              >
                Close Window
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeployedCoin(null);
                  const exploreTab = document.getElementById('explore_tab_btn');
                  if (exploreTab) exploreTab.click();
                }}
                className="flex-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-red-600 hover:brightness-115 text-slate-950 text-xs font-display font-black py-3 rounded-xl transition-all flex items-center justify-center gap-1 uppercase tracking-widest cursor-pointer"
              >
                Enter Terminal
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
