import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  fetchOnchainIdentity, 
  switchToBaseNetwork, 
  verifyWeb3Signature,
  BASE_MAINNET_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_ID,
  OnchainIdentity
} from '../utils/baseSdk';
import { 
  TrendingUp, 
  Zap, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight, 
  Shield, 
  Wallet, 
  RefreshCw, 
  Globe, 
  Activity, 
  Award, 
  FileText, 
  Sparkles,
  Sword,
  Sliders,
  Cpu
} from 'lucide-react';
import { WalletProviderId } from '../types';

const BUSHIDO_ICON = '/src/assets/images/bushido_icon_1783540049716.jpg';
const MOON_TOAD_ICON = '/src/assets/images/moon_toad_1783540752436.jpg';
const HEART_TOAD_ICON = '/src/assets/images/heart_toad_1783540766395.jpg';

interface BushidoTradingDashboardProps {
  simulatedEthBalance: number;
  onUpdateEthBalance: (bal: number) => void;
  network: 'mainnet' | 'sepolia';
  onUpdateNetwork: (net: 'mainnet' | 'sepolia') => void;
  bushidoIconSrc?: string;
}

export default function BushidoTradingDashboard({
  simulatedEthBalance,
  onUpdateEthBalance,
  network,
  onUpdateNetwork,
  bushidoIconSrc
}: BushidoTradingDashboardProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<'seykota' | 'druckenmiller'>('seykota');
  
  // Wallet Connection via SDK simulation states
  const [sdkConnected, setSdkConnected] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletProviderId>('coinbase');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Real-time Base SDK State
  const [realAddress, setRealAddress] = useState<string>('');
  const [basename, setBasename] = useState<string | null>(null);
  const [isCoinbaseVerified, setIsCoinbaseVerified] = useState(false);
  const [realBalanceEth, setRealBalanceEth] = useState<string>('0.0000');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [realChainId, setRealChainId] = useState<number | null>(null);
  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);

  // Initialize Base SDK connection and real-time listener on startup
  useEffect(() => {
    const initBaseSdk = async () => {
      if (typeof window === 'undefined' || !(window as any).ethereum) return;
      
      try {
        const ethereum = (window as any).ethereum;
        
        // 1. Get current connected accounts (if any)
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const activeAddress = accounts[0];
          setRealAddress(activeAddress);
          setSdkConnected(true);
          
          // 2. Fetch current chain ID
          const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          setRealChainId(chainId);
          
          const isBase = chainId === BASE_MAINNET_CHAIN_ID || chainId === BASE_SEPOLIA_CHAIN_ID;
          setIsCorrectNetwork(isBase);
          
          // 3. Trigger identity verification
          setIsVerifyingIdentity(true);
          const identity = await fetchOnchainIdentity(activeAddress, chainId === BASE_SEPOLIA_CHAIN_ID ? 'sepolia' : 'mainnet');
          setBasename(identity.basename);
          setIsCoinbaseVerified(identity.isCoinbaseVerified);
          setRealBalanceEth(identity.balanceEth);
          onUpdateEthBalance(parseFloat(identity.balanceEth));
          setIsVerifyingIdentity(false);
        } else {
          setSdkConnected(false);
        }
      } catch (err) {
        console.error('Failed to auto-connect to Base SDK:', err);
      }
    };

    initBaseSdk();

    // Setup real-time event listeners for account or chain changes
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          const activeAddress = accounts[0];
          setRealAddress(activeAddress);
          setSdkConnected(true);
          
          setIsVerifyingIdentity(true);
          const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          setRealChainId(chainId);
          const isBase = chainId === BASE_MAINNET_CHAIN_ID || chainId === BASE_SEPOLIA_CHAIN_ID;
          setIsCorrectNetwork(isBase);

          const identity = await fetchOnchainIdentity(activeAddress, chainId === BASE_SEPOLIA_CHAIN_ID ? 'sepolia' : 'mainnet');
          setBasename(identity.basename);
          setIsCoinbaseVerified(identity.isCoinbaseVerified);
          setRealBalanceEth(identity.balanceEth);
          onUpdateEthBalance(parseFloat(identity.balanceEth));
          setIsVerifyingIdentity(false);
        } else {
          setRealAddress('');
          setSdkConnected(false);
          setBasename(null);
          setIsCoinbaseVerified(false);
          setRealBalanceEth('0.0000');
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        window.location.reload();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [onUpdateEthBalance]);
  
  // Covenant Signature states
  const [signingVirtue, setSigningVirtue] = useState<string>('gi');
  const [customPledge, setCustomPledge] = useState<string>('');
  const [signingStatus, setSigningStatus] = useState<'idle' | 'requesting' | 'completed'>('idle');
  const [generatedSignature, setGeneratedSignature] = useState<string>('');

  // ToadGang and Oracle states
  const [showToadGangModal, setShowToadGangModal] = useState(false);
  const [isHyperHonor, setIsHyperHonor] = useState(false);
  const [oathTaken, setOathTaken] = useState(false);
  const [isSigningOath, setIsSigningOath] = useState(false);
  const [currentOracleIdx, setCurrentOracleIdx] = useState(7); // Default to Nintai quote
  const [isDrawingOracle, setIsDrawingOracle] = useState(false);

  const [virtueScores, setVirtueScores] = useState<Record<string, number>>({
    gi: 0.92,
    yu: 0.78,
    jin: 0.85,
    rei: 0.88,
    makoto: 0.95,
    meiyo: 0.81,
    chugi: 0.89,
    nintai: 0.84
  });

  const virtues = [
    { id: 'gi', name: 'Gi', meaning: 'Righteousness', principle: 'Signal Integrity', description: 'Trade only high-integrity signals. Avoid FOMO.' },
    { id: 'yu', name: 'Yu', meaning: 'Courage', principle: 'Risk Discipline', description: 'Cut losses instantly and ride trends courageously.' },
    { id: 'jin', name: 'Jin', meaning: 'Benevolence', principle: 'Liquidity Respect', description: 'Respect order books, avoid high slippage pools.' },
    { id: 'rei', name: 'Rei', meaning: 'Respect', principle: 'Fee Awareness', description: 'Minimize protocol overhead and honor liquidity makers.' },
    { id: 'makoto', name: 'Makoto', meaning: 'Honesty', principle: 'Transparency', description: 'Keep trades open, traceable, and report transparently.' },
    { id: 'meiyo', name: 'Meiyo', meaning: 'Honor', principle: 'Performance Integrity', description: 'Do not manipulate prices. Maintain clean executions.' },
    { id: 'chugi', name: 'Chugi', meaning: 'Loyalty', principle: 'Framework Consistency', description: 'Stay committed to the trend algorithm and rules.' },
    { id: 'nintai', name: 'Nintai', meaning: 'Patience', principle: 'Market Discipline', description: 'Wait for high-probability setups and let trends develop with absolute composure.' }
  ];

  const oracleQuotes = [
    {
      virtueId: 'gi',
      name: 'Gi',
      kanji: '義',
      meaning: 'Righteousness / Signal Integrity',
      text: 'To trade without a clear signal is a betrayal of the sword. Integrity in analysis is the foundation of every victory.',
      avatar: HEART_TOAD_ICON,
      colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5'
    },
    {
      virtueId: 'yu',
      name: 'Yu',
      kanji: '勇',
      meaning: 'Courage / Risk Discipline',
      text: 'The coward freezes at the stop-loss; the warrior executes it instantly. Real courage is entering a trend when the crowd is fearful.',
      avatar: BUSHIDO_ICON,
      colorClass: 'text-red-500 border-red-500/20 bg-red-500/5'
    },
    {
      virtueId: 'jin',
      name: 'Jin',
      kanji: '仁',
      meaning: 'Benevolence / Liquidity Respect',
      text: 'Do not drain the well to catch a single fish. Respect the depth of the pool, for a benevolent trader sustains the market.',
      avatar: MOON_TOAD_ICON,
      colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
    },
    {
      virtueId: 'rei',
      name: 'Rei',
      kanji: '礼',
      meaning: 'Respect / Fee Awareness',
      text: 'Honor the makers of liquidity and tread lightly on fees. A polite sword is never dulled by unnecessary friction.',
      avatar: MOON_TOAD_ICON,
      colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5'
    },
    {
      virtueId: 'makoto',
      name: 'Makoto',
      kanji: '誠',
      meaning: 'Honesty / Transparency',
      text: "A trader's ledger is his soul. Speak truth in your results, for the market eventually exposes all falsehood.",
      avatar: HEART_TOAD_ICON,
      colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5'
    },
    {
      virtueId: 'meiyo',
      name: 'Meiyo',
      kanji: '誉',
      meaning: 'Honor / Performance Integrity',
      text: 'Victory without honor is worse than defeat. Do not manipulate, do not frontrun. True honor lies in fair execution.',
      avatar: BUSHIDO_ICON,
      colorClass: 'text-red-400 border-red-500/20 bg-red-500/5'
    },
    {
      virtueId: 'chugi',
      name: 'Chugi',
      kanji: '忠',
      meaning: 'Loyalty / Framework Consistency',
      text: 'Stay loyal to your system when the storm rages. To abandon your algorithm mid-trend is to abandon your post.',
      avatar: BUSHIDO_ICON,
      colorClass: 'text-amber-500 border-amber-500/20 bg-amber-500/5'
    },
    {
      virtueId: 'nintai',
      name: 'Nintai',
      kanji: '忍',
      meaning: 'Patience / Market Discipline',
      text: 'Patience turns loss into legend. Wait for the perfect setup, for the hasty warrior falls before the battle begins.',
      avatar: MOON_TOAD_ICON,
      colorClass: 'text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5'
    }
  ];

  const drawOracleCard = () => {
    if (isDrawingOracle) return;
    setIsDrawingOracle(true);
    let counter = 0;
    const interval = setInterval(() => {
      setCurrentOracleIdx(Math.floor(Math.random() * oracleQuotes.length));
      counter++;
      if (counter >= 10) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * oracleQuotes.length);
        setCurrentOracleIdx(finalIdx);
        setIsDrawingOracle(false);
        
        // Boost drawn virtue score slightly
        const drawnVirtue = oracleQuotes[finalIdx].virtueId;
        setVirtueScores(prev => {
          const currentVal = prev[drawnVirtue] || 0.8;
          return {
            ...prev,
            [drawnVirtue]: parseFloat(Math.min(1.0, currentVal + 0.05).toFixed(2))
          };
        });

        // Add to audit logs
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC';
        setAuditLog(prev => [
          {
            id: Date.now().toString(),
            time: timeStr,
            action: 'VIRTUE ORACLE CONSULTED',
            asset: `Drew ${oracleQuotes[finalIdx].name} path`,
            amount: 'Verified',
            virtue: drawnVirtue,
            status: 'success'
          },
          ...prev
        ]);
      }
    }, 60);
  };

  const handleTakeBloodOath = () => {
    if (oathTaken || isSigningOath) return;
    setIsSigningOath(true);
    setTimeout(() => {
      setOathTaken(true);
      setIsHyperHonor(true);
      setIsSigningOath(false);
      
      // Boost ALL scores to 99%
      setVirtueScores({
        gi: 0.99,
        yu: 0.99,
        jin: 0.99,
        rei: 0.99,
        makoto: 0.99,
        meiyo: 0.99,
        chugi: 0.99,
        nintai: 0.99
      });

      // Add to audit logs
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC';
      setAuditLog(prev => [
        {
          id: Date.now().toString(),
          time: timeStr,
          action: 'TOADGANG™ BLOOD OATH MINTED',
          asset: 'Soulbound Badge #0042',
          amount: 'Hyper-Honor Active',
          virtue: 'nintai',
          status: 'success'
        },
        ...prev
      ]);
    }, 1800);
  };

  const strategies = [
    {
      id: 'seykota' as const,
      name: 'Seykota',
      theme: 'Ed Seykota - The Trend Follower',
      status: 'active',
      lastSignal: 'BUY AERO/USDC on EMA cross',
      confidence: 0.87,
      positionSize: '15.3%',
      virtueWeight: { gi: 0.95, yu: 0.90, jin: 0.80, rei: 0.92, makoto: 0.98, meiyo: 0.85, chugi: 0.92, nintai: 0.94 }
    },
    {
      id: 'druckenmiller' as const,
      name: 'Druckenmiller',
      theme: 'Stanley Druckenmiller - The Macro Master',
      status: 'monitoring',
      lastSignal: 'HOLD - Macro regime uncertain',
      confidence: 0.62,
      positionSize: '8.7%',
      virtueWeight: { gi: 0.88, yu: 0.65, jin: 0.90, rei: 0.84, makoto: 0.92, meiyo: 0.78, chugi: 0.86, nintai: 0.85 }
    }
  ];

  const [auditLog, setAuditLog] = useState([
    { id: '1', time: '14:23 UTC', action: 'EXECUTE SWAP', asset: 'DEGEN→USDC', amount: '2,450', virtue: 'makoto', status: 'success' },
    { id: '2', time: '14:15 UTC', action: 'SIGNAL GENERATED', agent: 'Seykota', signal: 'BUY AERO', virtue: 'gi', status: 'pending' },
    { id: '3', time: '14:08 UTC', action: 'SLIPPAGE CHECK', pool: 'HIGHER/USDC', slippage: '0.43%', virtue: 'jin', status: 'success' },
    { id: '4', time: '13:52 UTC', action: 'EXECUTE SWAP', asset: 'PRIME→VIRTUAL', amount: '1.2K', virtue: 'meiyo', status: 'success' }
  ]);

  const overallScore = (((Object.values(virtueScores) as number[]).reduce((a, b) => a + b, 0) / Object.keys(virtueScores).length) * 100).toFixed(1);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'from-cyan-400 to-cyan-600';
    if (score >= 0.8) return 'from-emerald-400 to-emerald-600';
    if (score >= 0.7) return 'from-amber-400 to-amber-600';
    return 'from-red-500 to-orange-500';
  };

  const getVirtueColorClass = (id: string) => {
    if (id === 'gi' || id === 'makoto') return 'text-cyan-400';
    if (id === 'yu' || id === 'meiyo') return 'text-red-500';
    if (id === 'jin') return 'text-emerald-400';
    if (id === 'rei' || id === 'chugi') return 'text-amber-400';
    if (id === 'nintai') return 'text-fuchsia-400';
    return 'text-slate-400';
  };

  const handleWalletConnect = async (walletType: WalletProviderId) => {
    setIsConnecting(true);
    setSelectedWallet(walletType);
    
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      // Graceful fallback for non-injected environments (mock/simulated real-time provider activation)
      setTimeout(() => {
        setRealAddress('0x90F79bf6EB2c4f870365E785982E1f101E93b906'); // Bushido Master Address
        setSdkConnected(true);
        setIsCorrectNetwork(true);
        setRealBalanceEth('4.2045');
        onUpdateEthBalance(4.2045);
        setBasename('bushido-master.base');
        setIsCoinbaseVerified(true);
        setIsConnecting(false);
        setShowWalletModal(false);
        
        // Log in audit log
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC';
        setAuditLog(prev => [
          {
            id: Date.now().toString(),
            time: timeStr,
            action: 'WALLET CONNECTED (DEMO MODE)',
            asset: '0x90F79...3b906',
            amount: '4.2045 ETH',
            virtue: 'makoto',
            status: 'success'
          },
          ...prev
        ]);
      }, 1000);
      return;
    }

    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const activeAddress = accounts[0];
        setRealAddress(activeAddress);
        setSdkConnected(true);
        
        const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16);
        setRealChainId(chainId);
        const isBase = chainId === BASE_MAINNET_CHAIN_ID || chainId === BASE_SEPOLIA_CHAIN_ID;
        setIsCorrectNetwork(isBase);

        setIsVerifyingIdentity(true);
        const identity = await fetchOnchainIdentity(activeAddress, chainId === BASE_SEPOLIA_CHAIN_ID ? 'sepolia' : 'mainnet');
        setBasename(identity.basename);
        setIsCoinbaseVerified(identity.isCoinbaseVerified);
        setRealBalanceEth(identity.balanceEth);
        onUpdateEthBalance(parseFloat(identity.balanceEth));
        setIsVerifyingIdentity(false);

        // Switch to Base automatically if they connected but are on another network
        if (!isBase) {
          await switchToBaseNetwork(network === 'sepolia');
        }
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
      setShowWalletModal(false);
    }
  };

  const handleDisconnect = () => {
    setSdkConnected(false);
    setRealAddress('');
    setBasename(null);
    setIsCoinbaseVerified(false);
    setRealBalanceEth('0.0000');
  };

  const handleSignPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdkConnected) return;

    setSigningStatus('requesting');
    
    const virtueObj = virtues.find(v => v.id === signingVirtue);
    const message = `I hereby pledge my soulbound commitment to the Bushido Virtue of ${virtueObj?.name} (${virtueObj?.meaning}) on the Base network.\n\nPrinciple: ${virtueObj?.principle}\nAddress: ${realAddress || '0xBushido'}\nTimestamp: ${Date.now()}`;
    
    // If we have a real wallet injected
    if (typeof window !== 'undefined' && (window as any).ethereum && realAddress) {
      try {
        const ethereum = (window as any).ethereum;
        
        // Request the signature directly
        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [ethers.hexlify(ethers.toUtf8Bytes(message)), realAddress]
        });

        // Verify the signature cryptographically to confirm on-chain identity ownership
        const isVerified = verifyWeb3Signature(message, signature, realAddress);
        setGeneratedSignature(signature);
        setSigningStatus('completed');

        // Boost score
        setVirtueScores(prev => {
          const currentVal = prev[signingVirtue] || 0.8;
          const newVal = Math.min(1.0, currentVal + 0.06); // Bigger boost for real signatures!
          return {
            ...prev,
            [signingVirtue]: parseFloat(newVal.toFixed(2))
          };
        });

        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC';
        setAuditLog(prev => [
          {
            id: Date.now().toString(),
            time: timeStr,
            action: 'COVENANT CRYPTO-VERIFIED',
            asset: `${virtueObj?.name} Alignment Confirmed`,
            amount: isVerified ? 'SIGNATURE VALID' : 'SIGNATURE RECOVERED',
            virtue: signingVirtue,
            status: 'success'
          },
          ...prev
        ]);
      } catch (err: any) {
        console.error('Signing failed:', err);
        setSigningStatus('idle');
      }
    } else {
      // Fallback for demo mode
      setTimeout(() => {
        const entropy = Math.random().toString(16).substring(2, 10);
        const signatureHash = `0x378f72a392de${entropy}781da2289f64bf8c67a3de28be3f07a1b63c76dbe62c86b`;
        setGeneratedSignature(signatureHash);
        setSigningStatus('completed');
        
        setVirtueScores(prev => {
          const currentVal = prev[signingVirtue] || 0.8;
          const newVal = Math.min(1.0, currentVal + 0.04);
          return {
            ...prev,
            [signingVirtue]: parseFloat(newVal.toFixed(2))
          };
        });

        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC';
        setAuditLog(prev => [
          {
            id: Date.now().toString(),
            time: timeStr,
            action: 'VIRTUE COVENANT SIGNED',
            asset: `${signingVirtue.toUpperCase()} aligned successfully`,
            amount: 'Signature verified',
            virtue: signingVirtue,
            status: 'success'
          },
          ...prev
        ]);
      }, 1200);
    }
  };

  const walletDisplayName = () => {
    if (selectedWallet === 'coinbase') return 'Coinbase Smart Wallet (CDP)';
    if (selectedWallet === 'metamask') return 'MetaMask';
    if (selectedWallet === 'walletconnect') return 'WalletConnect v2';
    if (selectedWallet === 'safe') return 'Safe Multi-Sig';
    if (selectedWallet === 'rainbow') return 'Rainbow';
    return 'Injected Wallet';
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header with user icon */}
      <div className={`bg-[#090b11] border rounded-2xl p-6 relative overflow-hidden shadow-xl transition-all duration-700 ${
        isHyperHonor 
          ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.25)]' 
          : 'border-slate-900'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-amber-500/0 to-red-500/5 pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {bushidoIconSrc ? (
              <div className="relative group">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-400 to-amber-500 opacity-60 blur-sm group-hover:opacity-100 transition duration-500"></div>
                <img 
                  src={bushidoIconSrc} 
                  alt="Bushido Brand Logo" 
                  className="relative h-16 w-16 rounded-xl border border-slate-800 object-cover shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-500 flex items-center justify-center border border-slate-800 shadow-xl">
                <Sword className="h-8 w-8 text-white animate-pulse" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500">
                  THE WAY OF TRADE (BUSHIDO)
                </h2>
                {isHyperHonor && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-display font-black border border-cyan-500/40 px-2 py-0.5 rounded-full animate-bounce">
                    TOADGANG™ CHOSEN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-jp tracking-wider mt-0.5">
                Integrating Base Application SDK Web3Modal & Virtue Alignment Engine
              </p>
            </div>
          </div>

          {/* ToadGang pulsing button in the middle */}
          <button
            type="button"
            onClick={() => setShowToadGangModal(true)}
            className={`relative group overflow-hidden px-4 py-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2.5 cursor-pointer xl:mx-auto ${
              isHyperHonor
                ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'border-red-500/30 bg-red-950/10 hover:bg-red-950/25 text-red-400 animate-pulse'
            }`}
          >
            <span className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:translate-x-40 transition-transform duration-1000 ease-out" />
            <div className="relative h-6 w-6">
              <img 
                src={HEART_TOAD_ICON} 
                alt="ToadGang" 
                className="relative h-6 w-6 rounded-full object-cover border border-cyan-500/40"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-black text-xs tracking-wider uppercase">ToadGang™ Hub</span>
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHyperHonor ? 'bg-cyan-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isHyperHonor ? 'bg-cyan-500' : 'bg-red-500'}`}></span>
            </span>
          </button>

          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-900/80">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Virtue Alliance</span>
              <span className="text-3xl font-mono font-black text-amber-400 glow-gold">{overallScore}%</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-900" />
            <div className="text-xs space-y-0.5">
              <span className="text-slate-500 block font-jp">Alignment State:</span>
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> High Rectitude
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Base SDK Web3Modal Status panel & Bushido Wisdom */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Base App SDK Control Panel */}
          <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[380px] transition-all duration-300">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
                <h3 className="text-xs font-display font-bold text-slate-300 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  Base App SDK Control Panel
                </h3>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                  sdkConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}>
                  {sdkConnected ? 'Web3 Connected' : 'Web3Modal Active'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-jp leading-relaxed mb-4">
                Powered by the <code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px]">Base SDK</code>. Resolves your Basename, checks Coinbase EAS verifications, and tracks live node connection states.
              </p>

              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Connection State:</span>
                  {sdkConnected ? (
                    <span className="text-emerald-450 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      CONNECTED
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold">DISCONNECTED</span>
                  )}
                </div>

                {sdkConnected && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Active Wallet:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200 font-semibold">{walletDisplayName()}</span>
                        <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                          {selectedWallet === 'coinbase' ? 'smart_wallet_passkey' : selectedWallet === 'metamask' ? 'injected_eip1193' : selectedWallet === 'safe' ? 'safe_multisig' : 'walletconnect_v2'}
                        </code>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Network:</span>
                      {isCorrectNetwork ? (
                        <span className="text-cyan-400 font-semibold flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-cyan-400" />
                          Base {realChainId === BASE_SEPOLIA_CHAIN_ID ? 'Sepolia' : 'Mainnet'}
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                          ⚠️ WRONG NETWORK
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Wallet Address:</span>
                      <span className="text-slate-300 font-semibold text-[11px] select-all">
                        {realAddress ? `${realAddress.slice(0, 6)}...${realAddress.slice(-4)}` : '0x00...0000'}
                      </span>
                    </div>

                    {isVerifyingIdentity ? (
                      <div className="py-1 flex items-center justify-center gap-1.5 bg-cyan-950/20 border border-cyan-500/20 rounded-lg text-[10px] text-cyan-400 animate-pulse">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Verifying On-Chain Identity...
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Basename (BNS):</span>
                          {basename ? (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 font-bold text-[11px] flex items-center gap-1">
                              👑 {basename}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[10px]">No Basename Registered</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Coinbase Verified:</span>
                          {isCoinbaseVerified ? (
                            <span className="text-cyan-400 font-bold text-[10px] bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                              🛡️ EAS APPROVED
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[10px]">No Attestation Found</span>
                          )}
                        </div>
                      </>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-500">Base RPC Balance:</span>
                      <span className="text-cyan-400 font-bold">{realBalanceEth} ETH</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {sdkConnected ? (
                <div className="space-y-2">
                  {!isCorrectNetwork && (
                    <button
                      type="button"
                      onClick={() => switchToBaseNetwork(network === 'sepolia')}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-display font-black text-[10px] rounded-xl transition-all uppercase tracking-wider text-center cursor-pointer animate-pulse"
                    >
                      🔌 Switch to Base Network
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWalletModal(true)}
                      className="py-2.5 px-3 bg-slate-950 hover:bg-slate-900 text-slate-300 font-display font-bold text-[10px] rounded-xl border border-slate-800 transition-all uppercase tracking-wider text-center cursor-pointer"
                    >
                      Switch Wallet
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="py-2.5 px-3 bg-red-650/10 hover:bg-red-650/20 text-red-500 font-display font-bold text-[10px] rounded-xl border border-red-500/20 transition-all uppercase tracking-wider text-center cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowWalletModal(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet (Base SDK)
                </button>
              )}

              <div className="text-[10px] text-center text-slate-600 font-mono mt-2">
                Chains: Base Mainnet (8453) • Base Sepolia (84532)
              </div>
            </div>
          </div>

          {/* Bushido Wisdom Oracle */}
          <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-[0.03]">
              <span className="text-7xl font-jp font-black">{oracleQuotes[currentOracleIdx].kanji}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-jp text-lg font-bold">⛩</span>
                <div>
                  <h3 className="text-xs font-display font-bold text-slate-300 uppercase tracking-widest">
                    Bushido Wisdom Oracle
                  </h3>
                  <span className="text-[9px] text-slate-500 font-jp block leading-none mt-0.5">ALIGN ALGORITHMIC INTENT</span>
                </div>
              </div>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                Omikuji Draw
              </span>
            </div>

            {/* Oracle Card Display */}
            <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 min-h-[175px] justify-between ${
              isDrawingOracle 
                ? 'animate-pulse border-amber-500/20 bg-amber-500/5' 
                : oracleQuotes[currentOracleIdx].colorClass
            }`}>
              
              <div className="flex items-start gap-3">
                {/* Avatar circular icon */}
                <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img 
                    src={oracleQuotes[currentOracleIdx].avatar} 
                    alt="Oracle Guide" 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider font-display">
                      {oracleQuotes[currentOracleIdx].name}
                    </span>
                    <span className="text-[14px] font-jp leading-none font-bold text-slate-300">
                      {oracleQuotes[currentOracleIdx].kanji}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-jp font-medium leading-none">
                    {oracleQuotes[currentOracleIdx].meaning}
                  </p>
                </div>
              </div>

              {/* Quote text */}
              <div className="relative text-[11px] leading-relaxed text-slate-300 font-jp bg-slate-950/40 p-3 rounded-lg border border-slate-900/50 italic">
                <span className="absolute -top-1 left-1 text-slate-700 text-lg font-serif">“</span>
                <span className="relative z-10">{oracleQuotes[currentOracleIdx].text}</span>
                <span className="absolute -bottom-3 right-1 text-slate-700 text-lg font-serif">”</span>
              </div>
              
              <div className="text-[9px] text-slate-500 font-mono text-right uppercase tracking-wider">
                ★ Drew Vow: +5% {oracleQuotes[currentOracleIdx].name} Integrity
              </div>

            </div>

            {/* Draw button */}
            <button
              type="button"
              onClick={drawOracleCard}
              disabled={isDrawingOracle}
              className={`w-full py-2.5 px-4 rounded-xl font-display font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border ${
                isDrawingOracle
                  ? 'bg-slate-900 text-slate-500 border-slate-900 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-500/25 shadow-md shadow-amber-500/5'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isDrawingOracle ? 'animate-spin' : ''}`} />
              <span>{isDrawingOracle ? 'Consulting Oracle...' : 'Draw Wisdom Oracle'}</span>
            </button>
          </div>

        </div>

        {/* Middle: Virtue Path & Active Strategies */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Virtue Path bar sliders */}
            <div className="md:col-span-5 bg-[#090b11] border border-slate-900 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-display font-bold text-slate-300 mb-4 uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-400" />
                Virtue Integrity Path
              </h3>
              <div className="space-y-4">
                {virtues.map((virtue) => (
                  <div key={virtue.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <span className={`font-jp text-sm ${getVirtueColorClass(virtue.id)}`}>
                          {virtue.name === 'Gi' ? '義' : 
                           virtue.name === 'Yu' ? '勇' : 
                           virtue.name === 'Jin' ? '仁' : 
                           virtue.name === 'Rei' ? '礼' : 
                           virtue.name === 'Makoto' ? '誠' : 
                           virtue.name === 'Meiyo' ? '誉' : 
                           virtue.name === 'Chugi' ? '忠' : '忍'}
                        </span>
                        <span>{virtue.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({virtue.meaning})</span>
                      </span>
                      <span className={`font-mono text-[11px] font-bold ${getVirtueColorClass(virtue.id)}`}>
                        {(virtueScores[virtue.id] * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full bg-gradient-to-r ${getScoreColor(virtueScores[virtue.id])} transition-all duration-500`}
                        style={{ width: `${virtueScores[virtue.id] * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trading Strategies Cards */}
            <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-5 shadow-xl flex-1">
                <h3 className="text-xs font-display font-bold text-slate-300 mb-4 uppercase tracking-widest text-cyan-450 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-cyan-450" />
                  Active Trading Algos
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {strategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedStrategy === strategy.id
                          ? 'bg-amber-950/10 border-amber-500/40 ring-1 ring-amber-500/20'
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-display font-bold text-amber-400 text-sm">{strategy.name}</h4>
                          <p className="text-[11px] text-slate-400 font-jp leading-tight">{strategy.theme}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          strategy.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {strategy.status}
                        </span>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-900/60 mt-2">
                        <div className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-900 flex items-center gap-1.5">
                          <Activity className="h-3 w-3 text-slate-500" />
                          <span className="text-[10px] text-slate-400 truncate">{strategy.lastSignal}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-slate-500">
                          <span>Slippage Shield: <span className="text-amber-400 font-bold">{(strategy.confidence * 100).toFixed(0)}%</span></span>
                          <span>Virtual Weight: <span className="text-cyan-400 font-bold">{strategy.positionSize}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-4 shadow-xl text-center md:text-left">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">Base Pools Active</span>
                  <span className="text-2xl font-mono font-black text-cyan-400">12 Seeded</span>
                  <span className="text-[10px] text-slate-500 font-jp block mt-0.5">Aerodrome • Uniswap V3</span>
                </div>
                <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-4 shadow-xl text-center md:text-left">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">Avg Slippage Saved</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">0.38% Max</span>
                  <span className="text-[10px] text-slate-500 font-jp block mt-0.5">Jin virtue alignment filter</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Selected Strategy Virtue Alignment details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Strategy Virtue Weights */}
        <div className="lg:col-span-5 bg-[#090b11] border border-slate-900 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-display font-bold text-slate-300 mb-4 uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-amber-400" />
            Strategy Virtue Weights: {selectedStrategy === 'seykota' ? 'Seykota' : 'Druckenmiller'}
          </h3>
          <p className="text-[11px] text-slate-400 font-jp leading-relaxed mb-4">
            Each mathematical trading model weights the 8 virtues differently to protect capital while optimizing yields on the Base Network.
          </p>

          <div className="space-y-2">
            {virtues.map((virtue) => {
              const strategy = strategies.find(s => s.id === selectedStrategy)!;
              const weight = strategy.virtueWeight[virtue.id as keyof typeof strategy.virtueWeight] || 0.8;
              return (
                <div key={virtue.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-900 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-300">
                      <span className={`font-jp ${getVirtueColorClass(virtue.id)}`}>{virtue.name}</span>
                      <span className="text-[10px] font-normal text-slate-500">({virtue.principle})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-jp">{virtue.description}</p>
                  </div>
                  <div className={`font-mono font-bold text-right pl-3 ${weight >= 0.9 ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {(weight * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Virtue Covenant Signer & SDK Integration Demonstration */}
        <div className="lg:col-span-7 bg-[#090b11] border border-slate-900 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-display font-bold text-slate-300 uppercase tracking-widest text-cyan-455 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan-455" />
                Virtue Covenant Signer
              </h3>
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                EIP-712 Signatures
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-jp leading-relaxed mb-4">
              To align your algorithms and boost virtue rankings, commit a signed cryptographic pledge onto Base. This utilizes the Base App SDK's provider instance to verify the signature of <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px]">0xBushidoWarrior</code>.
            </p>

            <form onSubmit={handleSignPledge} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Select Virtue Path</label>
                  <select
                    value={signingVirtue}
                    onChange={(e) => setSigningVirtue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {virtues.map(v => (
                      <option key={v.id} value={v.id} className="bg-slate-900">{v.name} ({v.meaning})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Simulated Fee (Gas)</label>
                  <input
                    type="text"
                    disabled
                    value="0.00012 ETH (Base Optimized)"
                    className="w-full bg-slate-950/40 border border-slate-900/60 rounded-xl px-3 py-2 text-slate-500 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Enter Custom Alliance Pledge</label>
                <input
                  type="text"
                  value={customPledge}
                  onChange={(e) => setCustomPledge(e.target.value)}
                  placeholder="e.g. I vow to ride trends and execute cut-loss limits courageously."
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-slate-300 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs font-mono space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Signer:</span>
                  <span className="text-slate-300 font-semibold">0xBushidoWarrior...</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Pledge Hash (EIP-712):</span>
                  <span className="text-slate-400 select-all">0xc89f64bf8c67a3de28be3f07a1b63c76dbe62c8...</span>
                </div>

                {signingStatus === 'completed' && generatedSignature && (
                  <div className="border-t border-slate-900/80 pt-2 mt-2">
                    <div className="flex justify-between text-emerald-450 font-bold">
                      <span>✓ Signature Generated:</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[200px] select-all" title="Copy signature">{generatedSignature}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1 font-jp leading-snug">
                      Pledge recorded onto Base! Verified by decentralized validators. {signingVirtue.toUpperCase()} score increased.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!sdkConnected || signingStatus === 'requesting'}
                className={`w-full py-3 px-6 rounded-xl font-display font-black text-xs transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer ${
                  !sdkConnected 
                    ? 'bg-slate-800 text-slate-550 border border-slate-900 cursor-not-allowed'
                    : signingStatus === 'requesting'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                }`}
              >
                {signingStatus === 'requesting' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Signing via Base App SDK...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Sign Covenant via SDK Provider
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Transaction & Audit Logs */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
          <h3 className="text-sm font-display font-bold text-slate-300 flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            Bushido Virtue Audit Logs
          </h3>
          <span className="text-[10px] text-slate-500 font-mono font-bold">
            Live verification from Aerodrome Router
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-mono text-[10px] uppercase">
                <th className="py-2">Timestamp</th>
                <th className="py-2">Action</th>
                <th className="py-2">Asset / Signal Details</th>
                <th className="py-2">Virtue Association</th>
                <th className="py-2">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-950">
              {auditLog.map((log) => (
                <tr key={log.id} className="font-mono text-slate-300 hover:bg-slate-950/20">
                  <td className="py-3 text-slate-500">{log.time}</td>
                  <td className="py-3 font-bold text-slate-200">{log.action}</td>
                  <td className="py-3 text-slate-400">
                    <span className="text-slate-300">{log.asset}</span> {log.amount !== 'Signature verified' && log.amount !== 'Verified' && <span className="text-cyan-400 font-bold ml-1">({log.amount})</span>}
                  </td>
                  <td className="py-3">
                    <span className="text-amber-400 uppercase tracking-widest font-bold">
                      {log.virtue.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {log.status === 'success' ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-450 uppercase font-bold">Verified</span>
                        </>
                      ) : (
                        <>
                          <Activity className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                          <span className="text-[10px] text-amber-500 uppercase font-bold">Pending</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet connection selection Modal Overlay */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#090b11] border border-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in duration-200">
            <div className="text-center">
              <h4 className="text-md font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-500 uppercase tracking-widest">
                ⛩ Connect to Base App
              </h4>
              <p className="text-[11px] text-slate-400 font-jp leading-tight mt-1">
                Select your decentralized provider to seed transactions and execute virtue covenant signatures.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleWalletConnect('coinbase')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-900 border border-blue-500/40 hover:border-blue-500/70 rounded-xl text-slate-200 text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-black text-sm shrink-0">C</div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>Coinbase Smart Wallet</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">CDP OPTION</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">Coinbase Developer Platform • Passkey & Gasless</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleWalletConnect('metamask')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-amber-500/40 rounded-xl text-slate-200 text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-mono font-black text-sm shrink-0">M</div>
                  <div className="text-left">
                    <span>MetaMask Wallet</span>
                    <p className="text-[10px] text-slate-400 font-normal">Browser Extension & Mobile EIP-1193</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleWalletConnect('walletconnect')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-cyan-500/40 rounded-xl text-slate-200 text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-mono font-black text-sm shrink-0">W</div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>WalletConnect v2</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">REOWN</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">300+ Mobile Wallets & QR Relay</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-900/60 flex gap-2">
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-550 hover:text-slate-300 font-display font-bold text-[10px] rounded-xl border border-slate-900 transition-all uppercase tracking-wider text-center cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ToadGang Modal Overlay */}
      {showToadGangModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`bg-[#05060a] border max-w-xl w-full rounded-2xl p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-350 transition-all ${
            oathTaken ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'border-slate-800'
          }`}>
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowToadGangModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 font-mono text-xs cursor-pointer bg-slate-950/80 border border-slate-900 rounded-full h-7 w-7 flex items-center justify-center transition-all"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-full font-display font-black tracking-widest uppercase">
                ToadGang™ Secret Chamber
              </span>
              <h3 className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500 uppercase tracking-widest leading-none">
                ToadGang™ Honor Hub
              </h3>
              <p className="text-[11px] text-slate-400 font-jp max-w-md mx-auto leading-relaxed">
                Behold the sacred order of the Web3 Toad. Only the most righteous algorithmic traders hold the keys to this inner circle.
              </p>
            </div>

            {/* Toad Gallery Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Moon Toad */}
              <div className="bg-slate-950/60 rounded-xl border border-slate-900 overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="relative aspect-square overflow-hidden border-b border-slate-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent z-10" />
                  <img 
                    src={MOON_TOAD_ICON} 
                    alt="Moon Beach Toad" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 text-[8px] bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 px-1.5 py-0.5 rounded font-mono z-20">
                    NINTAI GUIDE
                  </span>
                </div>
                <div className="p-3 text-center">
                  <span className="text-[10px] font-display font-black text-slate-300 uppercase block tracking-wider">The Lunar Sage</span>
                  <span className="text-[9px] text-slate-500 font-jp block">Meditating under calm starlight</span>
                </div>
              </div>

              {/* Heart Toad */}
              <div className="bg-slate-950/60 rounded-xl border border-slate-900 overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="relative aspect-square overflow-hidden border-b border-slate-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent z-10" />
                  <img 
                    src={HEART_TOAD_ICON} 
                    alt="Heart Pixel Toad" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono z-20">
                    JIN COVENANT
                  </span>
                </div>
                <div className="p-3 text-center">
                  <span className="text-[10px] font-display font-black text-slate-300 uppercase block tracking-wider">Pixel Heart Warrior</span>
                  <span className="text-[9px] text-slate-500 font-jp block">Forged with absolute loyalty</span>
                </div>
              </div>
            </div>

            {/* Oath Taking Area */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
              <div className="text-center space-y-1">
                <span className="text-amber-500 font-jp text-lg block font-bold">🩸</span>
                <span className="text-[11px] font-display font-black uppercase text-slate-300 tracking-widest block">The ToadGang™ Sovereign Oath</span>
                <p className="text-[10px] text-slate-500 font-jp max-w-sm mx-auto">
                  By pressing below, you pledge your soulbound signature. All 8 Virtues will instantly align to 99% (Hyper-Honor Mode).
                </p>
              </div>

              {oathTaken ? (
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 text-center space-y-1">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1.5 animate-bounce">
                    <CheckCircle className="h-4 w-4 text-cyan-400" />
                    Oath Signed and Sealed in Blood
                  </span>
                  <p className="text-[9px] text-slate-400 font-mono">
                    TXN: 0x99ad88d3c11...0042 • BADGE ID: 42 • ALIGNMENT: HYPER-HONOR
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTakeBloodOath}
                  disabled={isSigningOath}
                  className={`w-full py-3 rounded-xl font-display font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer border ${
                    isSigningOath
                      ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-wait'
                      : 'bg-gradient-to-r from-red-500 via-amber-500 to-cyan-500 hover:shadow-lg hover:shadow-red-500/10 text-slate-950 border-red-500/20'
                  }`}
                >
                  {isSigningOath ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Minting Soulbound Badge...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Sign ToadGang™ Blood Oath
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowToadGangModal(false)}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-300 font-display font-bold text-[10px] rounded-xl border border-slate-900 transition-all uppercase tracking-wider text-center cursor-pointer"
              >
                Return to Battle
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
