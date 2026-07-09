export interface PricePoint {
  timestamp: string;
  price: number;
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
