import { Coin, CoinFees } from './types';

// Constants
export const TOTAL_SUPPLY = 1_000_000_000;
export const CREATOR_ALLOCATION = 10_000_000; // 1%
export const POOL_ALLOCATION = 990_000_000; // 99%

/**
 * Calculates sqrtPriceX96 for Uniswap V3 given a price of token0 in terms of token1.
 * sqrtPriceX96 = sqrt(price) * 2^96
 */
export function calculateSqrtPriceX96(priceInEth: number): { dec: string; hex: string } {
  try {
    if (priceInEth <= 0) return { dec: "0", hex: "0x0" };
    const sqrtPrice = Math.sqrt(priceInEth);
    const q96 = 79228162514264337593543950336; // 2^96
    const value = Math.floor(sqrtPrice * q96);
    const bigValue = BigInt(value);
    return {
      dec: bigValue.toString(),
      hex: "0x" + bigValue.toString(16)
    };
  } catch (error) {
    return { dec: "0", hex: "0x0" };
  }
}

/**
 * Generates an initial price history array for visual plotting.
 */
export function generateInitialHistory(initialPrice: number, pointsCount = 12): { timestamp: string; price: number }[] {
  const history: { timestamp: string; price: number }[] = [];
  const baseTime = new Date();
  baseTime.setHours(baseTime.getHours() - pointsCount);

  for (let i = 0; i < pointsCount; i++) {
    const time = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
    // Subtle historical fluctuation up to the current starting price
    const fluctuation = 1 + (Math.sin(i / 2) * 0.05) - 0.02; 
    history.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: initialPrice * fluctuation,
    });
  }
  return history;
}

/**
 * Helper to generate mock wallet addresses
 */
export function generateRandomAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * 16)];
  }
  return addr;
}

/**
 * Helper to format addresses (e.g. 0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Helper to format large numbers cleanly
 */
export function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2) + 'B';
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(2) + 'M';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(2) + 'K';
  }
  return amount.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

/**
 * Formats high-precision small numbers (like ETH prices)
 */
export function formatPrice(price: number): string {
  if (price === 0) return '0';
  if (price < 0.000001) {
    return price.toExponential(4);
  }
  if (price < 0.01) {
    return price.toFixed(6);
  }
  return price.toFixed(4);
}

/**
 * AMM Swapping Simulator (Constant Product: x * y = k)
 * Handles fee splits and calculates output amounts, price impact, and new prices.
 */
export function simulateSwap(
  coin: Coin,
  amountIn: number,
  type: 'BUY' | 'SELL'
): {
  tokensOut: number;
  ethOut: number;
  newPrice: number;
  fees: CoinFees;
  priceImpact: number;
  newPoolEth: number;
  newPoolTokens: number;
} {
  const tokenReserve = coin.poolTokenBalance;
  const ethReserve = coin.poolEthBalance;
  const k = tokenReserve * ethReserve;
  
  const currentPrice = ethReserve / tokenReserve;
  
  if (type === 'BUY') {
    // amountIn is in ETH
    const totalEthIn = amountIn;
    
    // Fee structure (Total 1%):
    // 0.50% Creator
    // 0.15% Trade Referrer
    // 0.15% Create Referrer
    // 0.20% Platform
    const creatorFee = totalEthIn * 0.005;
    const tradeRefFee = totalEthIn * 0.0015;
    const createRefFee = totalEthIn * 0.0015;
    const platformFee = totalEthIn * 0.002;
    const totalFee = totalEthIn * 0.01;
    
    const netEthIn = totalEthIn - totalFee;
    
    // Constant product formula: (X + netIn) * (Y - tokensOut) = k
    const newPoolEth = ethReserve + netEthIn;
    const newPoolTokens = k / newPoolEth;
    const tokensOut = tokenReserve - newPoolTokens;
    
    const newPrice = newPoolEth / newPoolTokens;
    const priceImpact = ((newPrice - currentPrice) / currentPrice) * 100;
    
    return {
      tokensOut,
      ethOut: 0,
      newPrice,
      fees: {
        creator: creatorFee,
        platform: platformFee,
        tradeRef: tradeRefFee,
        createRef: createRefFee,
        total: totalFee
      },
      priceImpact,
      newPoolEth,
      newPoolTokens
    };
  } else {
    // type === 'SELL'
    // amountIn is in Tokens
    const tokensIn = amountIn;
    
    // Constant product formula: (X - ethOutGross) * (Y + tokensIn) = k
    const newPoolTokens = tokenReserve + tokensIn;
    const newPoolEth = k / newPoolTokens;
    const ethOutGross = ethReserve - newPoolEth;
    
    // Deduct fees from ETH output (Total 1%)
    const creatorFee = ethOutGross * 0.005;
    const tradeRefFee = ethOutGross * 0.0015;
    const createRefFee = ethOutGross * 0.0015;
    const platformFee = ethOutGross * 0.002;
    const totalFee = ethOutGross * 0.01;
    
    const netEthOut = ethOutGross - totalFee;
    const newPrice = newPoolEth / newPoolTokens;
    const priceImpact = ((newPrice - currentPrice) / currentPrice) * 100; // negative
    
    return {
      tokensOut: 0,
      ethOut: netEthOut,
      newPrice,
      fees: {
        creator: creatorFee,
        platform: platformFee,
        tradeRef: tradeRefFee,
        createRef: createRefFee,
        total: totalFee
      },
      priceImpact,
      newPoolEth,
      newPoolTokens
    };
  }
}
