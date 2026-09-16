export interface PricePoint {
  timestamp: string;
  price: number;
}

export interface VolumePoint {
  timestamp: string;
  volume: number;
}

export interface CoinFees {
  creator: number;
  platform: number;
  tradeRef: number;
  createRef: number;
  total: number;
}

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  tokenURI: string;
  creator: string;
  splitter: string;
  createReferrer: string;
  platformFeeBps: number; // e.g. 200 bps = 2% fee deducted from initial liquidity
  initialLiquidityETH: number;
  sqrtPriceX96: string; // Uniswap V3 price parameter
  poolAddress: string;
  coinAddress: string;
  createdAt: string;
  
  // Market state variables
  currentPrice: number; // in ETH per 1 Token
  priceHistory: PricePoint[];
  volume24h: number; // in ETH
  volumeHistory?: VolumePoint[];
  feesGenerated: CoinFees;
  
  // Pools & Balances
  poolTokenBalance: number; // default: 990,000,000 (99%)
  poolEthBalance: number;    // starts at initialLiquidityETH - platformFee
  creatorBalance: number;    // default: 10,000,000 (1%)
  userBalance: number;       // simulated user wallet holdings for this coin
}

export interface TradeLog {
  id: string;
  coinId: string;
  type: 'BUY' | 'SELL';
  ethAmount: number;
  tokenAmount: number;
  price: number;
  timestamp: string;
  fees: CoinFees;
  sender: string;
  hash: string;
  isSyncAlert?: boolean;
  syncDetails?: {
    blockNumber: string;
    gasPrice: string;
  };
}

export interface DeploymentStep {
  id: string;
  label: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

// ==========================================
// WALLET CONNECTION TYPES & SPECIFICATIONS
// ==========================================

export type WalletProviderId = 'coinbase' | 'metamask' | 'walletconnect' | 'rainbow' | 'safe' | 'injected';

export type WalletConnectionType = 
  | 'injected_eip1193'
  | 'smart_wallet_passkey'
  | 'walletconnect_v2'
  | 'safe_multisig'
  | 'simulated_ephemeral';

export type WalletNetwork = 'mainnet' | 'sepolia';

export type WalletConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'switching_network'
  | 'signing'
  | 'error';

export interface WalletProviderOption {
  id: WalletProviderId;
  name: string;
  subtitle: string;
  badge?: string;
  icon: string;
  color: string;
  connectionType: WalletConnectionType;
  protocolSpec: string;
  rdns?: string;
}

export interface WalletConnectionSession {
  providerId: WalletProviderId;
  connectionType: WalletConnectionType;
  address: string;
  chainId: number;
  network: WalletNetwork;
  balanceEth: string;
  basename?: string | null;
  isCoinbaseVerified?: boolean;
  connectedAt: string;
  status: WalletConnectionStatus;
}

export interface WalletSignatureMandate {
  account: string;
  delegateAddress: string;
  network: string;
  maxSwapLimitPercent: number;
  minVirtueScore: number;
  timestamp: string;
  signature?: string;
  verified: boolean;
}

