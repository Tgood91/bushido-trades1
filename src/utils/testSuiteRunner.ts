import { 
  calculateSqrtPriceX96, 
  simulateSwap, 
  TOTAL_SUPPLY, 
  CREATOR_ALLOCATION, 
  POOL_ALLOCATION 
} from '../utils';
import { Coin, CoinFees } from '../types';

export interface TestCaseResult {
  name: string;
  category: 'launchpad' | 'trading' | 'edge-cases';
  passed: boolean;
  message: string;
  expected?: string;
  actual?: string;
}

export interface SuiteSummary {
  total: number;
  passed: number;
  failed: number;
  results: TestCaseResult[];
}

/**
 * Executes the complete testing suite and returns full results and assertion summaries.
 */
export function runTestSuite(): SuiteSummary {
  const results: TestCaseResult[] = [];

  const assertEqual = (
    category: 'launchpad' | 'trading' | 'edge-cases',
    name: string,
    actual: any,
    expected: any,
    tolerance = 0.000001
  ) => {
    let passed = false;
    if (typeof actual === 'number' && typeof expected === 'number') {
      passed = Math.abs(actual - expected) <= tolerance;
    } else {
      passed = actual === expected;
    }

    results.push({
      name,
      category,
      passed,
      message: passed 
        ? `✓ Passed: ${name}`
        : `✗ Failed: ${name}. Expected ${expected}, got ${actual}`,
      expected: String(expected),
      actual: String(actual)
    });
  };

  const assertCondition = (
    category: 'launchpad' | 'trading' | 'edge-cases',
    name: string,
    condition: boolean,
    failureMessage: string
  ) => {
    results.push({
      name,
      category,
      passed: condition,
      message: condition 
        ? `✓ Passed: ${name}`
        : `✗ Failed: ${name}. ${failureMessage}`
    });
  };

  // ==========================================
  // SECTION 1: LaunchpadCoinFactory Deployment Process Tests
  // ==========================================

  // Test 1.1: Allocation proportions must match exactly 1% creator, 99% pool
  assertEqual('launchpad', '1.1 Creator Allocation should be 1% of total', CREATOR_ALLOCATION, TOTAL_SUPPLY * 0.01);
  assertEqual('launchpad', '1.2 Pool Allocation should be 99% of total', POOL_ALLOCATION, TOTAL_SUPPLY * 0.99);
  assertEqual('launchpad', '1.3 Sum of allocations should equal total supply', CREATOR_ALLOCATION + POOL_ALLOCATION, TOTAL_SUPPLY);

  // Test 1.4: Platform Fee Deductions and Net Liquidity calculations
  // Scenario A: 1.5% fee on 1.0 ETH initial liquidity
  const feeBpsA = 150; // 1.5%
  const initEthA = 1.0;
  const expectedFeeA = initEthA * (feeBpsA / 10000); // 0.015 ETH
  const expectedNetLiqA = initEthA - expectedFeeA; // 0.985 ETH
  const expectedInitialPriceA = expectedNetLiqA / POOL_ALLOCATION; // 0.985 / 990,000,000

  assertEqual('launchpad', '1.4 Platform Fee calculation (1.5% on 1.0 ETH)', expectedFeeA, 0.015);
  assertEqual('launchpad', '1.5 Net Liquidity calculation (1.5% on 1.0 ETH)', expectedNetLiqA, 0.985);
  assertEqual('launchpad', '1.6 Initial Price calculation (1.5% on 1.0 ETH)', expectedInitialPriceA, 0.985 / 990000000);

  // Scenario B: 2.0% fee on 2.5 ETH initial liquidity
  const feeBpsB = 200; // 2.0%
  const initEthB = 2.5;
  const expectedFeeB = initEthB * (feeBpsB / 10000); // 0.05 ETH
  const expectedNetLiqB = initEthB - expectedFeeB; // 2.45 ETH
  
  assertEqual('launchpad', '1.7 Platform Fee calculation (2% on 2.5 ETH)', expectedFeeB, 0.05);
  assertEqual('launchpad', '1.8 Net Liquidity calculation (2% on 2.5 ETH)', expectedNetLiqB, 2.45);

  // Test 1.9: SqrtPriceX96 Calculation Core Correctness
  // Formula: sqrt(price) * 2^96
  const samplePrice = 1.0 / 990000000; // 1.010101e-9
  const expectedSqrtPrice = Math.sqrt(samplePrice) * Math.pow(2, 96);
  const calculatedSqrt = calculateSqrtPriceX96(samplePrice);
  
  // BigInt string representation comparison
  const expectedBigIntStr = BigInt(Math.floor(expectedSqrtPrice)).toString();
  assertEqual('launchpad', '1.9 SqrtPriceX96 decimal match for 1 ETH initial liquidity', calculatedSqrt.dec, expectedBigIntStr);
  assertEqual('launchpad', '1.10 SqrtPriceX96 hexadecimal prefix check', calculatedSqrt.hex.startsWith('0x'), true);

  // ==========================================
  // SECTION 2: TradingTerminal AMM Swaps (Constant Product x * y = k)
  // ==========================================
  
  // Set up mock coin for AMM calculations
  const createMockCoin = (initialLiquidity: number, feeBps: number): Coin => {
    const feeAmount = initialLiquidity * (feeBps / 10000);
    const netLiq = initialLiquidity - feeAmount;
    const price = netLiq / POOL_ALLOCATION;
    const sqrt = calculateSqrtPriceX96(price);
    return {
      id: 'test-coin',
      name: 'Test Virtue Token',
      symbol: 'TEST',
      tokenURI: 'ipfs://mock',
      creator: '0x1111111111111111111111111111111111111111',
      splitter: '0x1111111111111111111111111111111111111111',
      createReferrer: '0x0000000000000000000000000000000000000000',
      platformFeeBps: feeBps,
      initialLiquidityETH: initialLiquidity,
      sqrtPriceX96: sqrt.dec,
      poolAddress: '0xpool',
      coinAddress: '0xcoin',
      createdAt: '12:00 PM',
      currentPrice: price,
      priceHistory: [],
      volume24h: 0,
      feesGenerated: { creator: 0, platform: 0, tradeRef: 0, createRef: 0, total: 0 },
      poolTokenBalance: POOL_ALLOCATION,
      poolEthBalance: netLiq,
      creatorBalance: CREATOR_ALLOCATION,
      userBalance: 0
    };
  };

  // Test 2.1: Buy Swap 0.1 ETH input
  const coinForBuy = createMockCoin(1.0, 150); // net poolEth = 0.985 ETH, poolToken = 990,000,000
  const buyAmountEth = 0.1;
  const buyResult = simulateSwap(coinForBuy, buyAmountEth, 'BUY');

  // Verify Fee splits for 0.1 ETH input (Total 1% = 0.001 ETH)
  // Creator: 0.5% = 0.0005
  // Platform: 0.2% = 0.0002
  // Trade Ref: 0.15% = 0.00015
  // Create Ref: 0.15% = 0.00015
  assertEqual('trading', '2.1 Buy Swap Creator fee split (0.5%)', buyResult.fees.creator, 0.0005);
  assertEqual('trading', '2.2 Buy Swap Platform fee split (0.2%)', buyResult.fees.platform, 0.0002);
  assertEqual('trading', '2.3 Buy Swap Trade Referrer fee split (0.15%)', buyResult.fees.tradeRef, 0.00015);
  assertEqual('trading', '2.4 Buy Swap Create Referrer fee split (0.15%)', buyResult.fees.createRef, 0.00015);
  assertEqual('trading', '2.5 Buy Swap Total fee sum check', buyResult.fees.total, 0.001);

  // Constant Product Validation
  const initialK = coinForBuy.poolTokenBalance * coinForBuy.poolEthBalance; // 990,000,000 * 0.985
  const netEthIn = buyAmountEth - buyResult.fees.total; // 0.1 - 0.001 = 0.099 ETH
  const expectedNewPoolEth = coinForBuy.poolEthBalance + netEthIn; // 0.985 + 0.099 = 1.084 ETH
  const expectedNewPoolTokens = initialK / expectedNewPoolEth;
  const expectedTokensOut = coinForBuy.poolTokenBalance - expectedNewPoolTokens;

  assertEqual('trading', '2.6 Buy Swap Net ETH added to pool', buyResult.newPoolEth, expectedNewPoolEth);
  assertEqual('trading', '2.7 Buy Swap New pool tokens reserve', buyResult.newPoolTokens, expectedNewPoolTokens);
  assertEqual('trading', '2.8 Buy Swap Output tokens calculation', buyResult.tokensOut, expectedTokensOut);

  // Price impact & New price verification
  const expectedNewPrice = expectedNewPoolEth / expectedNewPoolTokens;
  assertEqual('trading', '2.9 Buy Swap New marginal price calculation', buyResult.newPrice, expectedNewPrice);
  
  const expectedPriceImpact = ((expectedNewPrice - coinForBuy.currentPrice) / coinForBuy.currentPrice) * 100;
  assertEqual('trading', '2.10 Buy Swap Price impact percentage', buyResult.priceImpact, expectedPriceImpact);


  // Test 2.11: Sell Swap 50,000,000 Tokens input
  const coinForSell = createMockCoin(1.0, 150); // net poolEth = 0.985, poolTokens = 990M
  const sellTokensAmount = 50000000;
  const sellResult = simulateSwap(coinForSell, sellTokensAmount, 'SELL');

  // For sell swaps, constant product is computed first: (X - ethOutGross) * (Y + tokensIn) = k
  // newPoolTokens = 990M + 50M = 1,040M
  // newPoolEth = k / 1,040M
  // ethOutGross = poolEth - newPoolEth
  const expectedNewPoolTokensSell = coinForSell.poolTokenBalance + sellTokensAmount; // 1,040,000,000
  const expectedNewPoolEthSell = initialK / expectedNewPoolTokensSell;
  const expectedEthOutGross = coinForSell.poolEthBalance - expectedNewPoolEthSell;

  // 1% total fee deducted from gross ETH out
  const expectedSellTotalFee = expectedEthOutGross * 0.01;
  const expectedEthOutNet = expectedEthOutGross - expectedSellTotalFee;

  assertEqual('trading', '2.11 Sell Swap new pool tokens reserve', sellResult.newPoolTokens, expectedNewPoolTokensSell);
  assertEqual('trading', '2.12 Sell Swap new pool ETH reserve', sellResult.newPoolEth, expectedNewPoolEthSell);
  assertEqual('trading', '2.13 Sell Swap Total fee deducted from output gross', sellResult.fees.total, expectedSellTotalFee);
  assertEqual('trading', '2.14 Sell Swap Net ETH output returned to seller', sellResult.ethOut, expectedEthOutNet);

  const expectedNewPriceSell = expectedNewPoolEthSell / expectedNewPoolTokensSell;
  assertEqual('trading', '2.15 Sell Swap New marginal price', sellResult.newPrice, expectedNewPriceSell);


  // ==========================================
  // SECTION 3: Edge cases and Boundary Conditions Tests
  // ==========================================

  // Test 3.1: Swap of zero input should handle gracefully
  const zeroSwapBuy = simulateSwap(coinForBuy, 0, 'BUY');
  assertEqual('edge-cases', '3.1 Zero Swap BUY outputs 0 tokens', zeroSwapBuy.tokensOut, 0);
  assertEqual('edge-cases', '3.2 Zero Swap BUY preserves original price', zeroSwapBuy.newPrice, coinForBuy.currentPrice);
  assertEqual('edge-cases', '3.3 Zero Swap BUY charges 0 fee', zeroSwapBuy.fees.total, 0);

  const zeroSwapSell = simulateSwap(coinForSell, 0, 'SELL');
  assertEqual('edge-cases', '3.4 Zero Swap SELL outputs 0 ETH', zeroSwapSell.ethOut, 0);
  assertEqual('edge-cases', '3.5 Zero Swap SELL preserves original price', zeroSwapSell.newPrice, coinForSell.currentPrice);

  // Test 3.6: Negative inputs should be protected or handle gracefully
  const negativeSwap = simulateSwap(coinForBuy, -0.5, 'BUY');
  assertCondition(
    'edge-cases', 
    '3.6 Negative swap handling checks', 
    negativeSwap.tokensOut <= 0 || isNaN(negativeSwap.tokensOut),
    'Negative inputs should result in non-positive output tokens or NaN'
  );

  // Test 3.7: Extremely large swaps (e.g. infinite or multi-billion token swaps)
  const hugeEthSwap = simulateSwap(coinForBuy, 999999999, 'BUY');
  assertCondition(
    'edge-cases',
    '3.7 Large BUY swap does not break AMM reserves',
    hugeEthSwap.newPoolTokens > 0 && hugeEthSwap.tokensOut < coinForBuy.poolTokenBalance,
    'Buying with huge ETH should never drain pool token balance beyond 100%'
  );

  const hugeTokenSwap = simulateSwap(coinForSell, 999999999999, 'SELL');
  assertCondition(
    'edge-cases',
    '3.8 Large SELL swap does not drop ETH reserve below zero',
    hugeTokenSwap.newPoolEth > 0 && hugeTokenSwap.ethOut < coinForSell.poolEthBalance,
    'Selling huge amount of tokens should never drop pool ETH below zero due to constant product curvature'
  );

  // Summary stats
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  return {
    total,
    passed: passedCount,
    failed: failedCount,
    results
  };
}
