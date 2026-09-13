/**
 * Bushido Trading Protocol & Stanley Druckenmiller Agent Backend Express Application
 * Compatible with standalone server, Vite middleware, and Vercel Serverless Function exports
 */

import express, { Request, Response } from 'express';
import { rpcService } from './services/rpcService.js';
import { routerService } from './services/routerService.js';
import { virtueService } from './services/virtueService.js';
import { agentService } from './services/agentService.js';
import { geminiService } from './services/geminiService.js';
import { cronService } from './services/cronService.js';
import { reownService } from './services/reownService.js';

const app = express();

// Middleware
app.use(express.json());

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    network: 'Base (Chain ID: 8453)',
    timestamp: new Date().toISOString(),
    version: '1.0.0-vercel-serverless'
  });
});

// 2. Base RPC Multi-node failover status
app.get('/api/rpc/status', async (_req: Request, res: Response) => {
  try {
    const nodes = await rpcService.checkAllNodes();
    res.json({
      success: true,
      network: 'Base',
      chainId: 8453,
      primaryRpc: 'Coinbase Base RPC',
      activeNodes: nodes
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. Real-time Base Network Gas Price via eth_gasPrice
const handleGasPrice = async (_req: Request, res: Response) => {
  try {
    const gasData = await rpcService.getGasPrice();
    res.json({
      success: true,
      ...gasData
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
app.get('/api/rpc/gas-price', handleGasPrice);
app.get('/api/gas-price', handleGasPrice);

// 3. Multi-DEX Quotes (1inch v5, LI.FI Diamond, 0x Protocol Router)
const handleQuotes = async (req: Request, res: Response) => {
  try {
    const tokenIn = (req.query.tokenIn as string) || 'WETH';
    const tokenOut = (req.query.tokenOut as string) || 'GI';
    const amountIn = parseFloat((req.query.amountIn as string) || '0.5');
    const basePrice = parseFloat((req.query.basePrice as string) || '0.000000001');

    const result = await routerService.getComparativeQuotes(
      tokenIn,
      tokenOut,
      amountIn,
      basePrice
    );

    res.json({
      success: true,
      tokenIn,
      tokenOut,
      amountIn,
      quotes: result.quotes,
      recommendedRouter: result.recommendedRouter
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
app.get('/api/router/quotes', handleQuotes);
app.get('/api/router/quote', handleQuotes);

// 4. DEX Swap Simulation
app.post('/api/router/simulate', (req: Request, res: Response) => {
  try {
    const { routerId, tokenIn, tokenOut, amountIn, expectedOut, virtueScore } = req.body;
    const simulation = routerService.simulateSwapExecution(
      routerId || '1inch',
      tokenIn || 'WETH',
      tokenOut || 'GI',
      amountIn || '0.5',
      expectedOut || '500000',
      virtueScore || 92
    );
    res.json({ success: true, simulation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Stanley Druckenmiller Agent Status
app.get('/api/agent/status', (_req: Request, res: Response) => {
  try {
    const status = agentService.getStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Stanley Druckenmiller Live Market Signals
app.get('/api/agent/signals', (_req: Request, res: Response) => {
  try {
    const signals = agentService.getSignals();
    res.json({ success: true, signals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Trade Proposal Evaluation against Druckenmiller Risk & Bushido Rules
app.post('/api/agent/evaluate', (req: Request, res: Response) => {
  try {
    const { tokenSymbol, amountEth, userPortfolioEth, currentPrice, priceImpactPct } = req.body;
    const evaluation = agentService.evaluateTradeProposal({
      tokenSymbol: tokenSymbol || 'GI',
      amountEth: parseFloat(amountEth || '0.5'),
      userPortfolioEth: parseFloat(userPortfolioEth || '10.0'),
      currentPrice: parseFloat(currentPrice || '0.000000001'),
      priceImpactPct: parseFloat(priceImpactPct || '0.35')
    });
    res.json({ success: true, evaluation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Stanley Druckenmiller Orchestrated Swap Execution
app.post('/api/agent/execute', async (req: Request, res: Response) => {
  try {
    const { tokenSymbol, amountEth, routerPreference } = req.body;
    const result = await agentService.executeOrchestratedSwap({
      tokenSymbol: tokenSymbol || 'GI',
      amountEth: parseFloat(amountEth || '0.5'),
      routerPreference
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 9. Gemini AI Copilot Macro & Strategy Counsel
app.post('/api/agent/copilot', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const advice = await geminiService.generateMacroCounsel(prompt, context);
    res.json({ success: true, response: advice });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Bushido 8 Virtues Matrix & Breakdown
app.get('/api/virtues/matrix', (_req: Request, res: Response) => {
  try {
    const matrix = virtueService.getVirtueMatrix();
    res.json({ success: true, matrix });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Custom Trade Virtue Evaluation
app.post('/api/virtues/evaluate', (req: Request, res: Response) => {
  try {
    const { tokenSymbol, amountEth, priceImpactPct, hasCoinbaseVerification, liquidityEth, creatorFeePct } = req.body;
    const result = virtueService.evaluateTrade({
      tokenSymbol: tokenSymbol || 'GI',
      amountEth: parseFloat(amountEth || '0.5'),
      priceImpactPct: parseFloat(priceImpactPct || '0.35'),
      hasCoinbaseVerification: !!hasCoinbaseVerification,
      liquidityEth: parseFloat(liquidityEth || '2.5'),
      creatorFeePct: parseFloat(creatorFeePct || '1.5')
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Automated Cron Jobs (Daily 0.05 $USDC -> USDbC, DAI, CADC, EURC)
app.get('/api/cron/jobs', (_req: Request, res: Response) => {
  try {
    const jobs = cronService.getJobs();
    res.json({ success: true, jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/cron/history', (req: Request, res: Response) => {
  try {
    const jobId = (req.query.jobId as string) || 'daily-stablecoin-basket';
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const data = cronService.getExecutionHistory(jobId, limit);
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cron/trigger', async (req: Request, res: Response) => {
  try {
    const { jobId = 'daily-stablecoin-basket' } = req.body;
    const result = await cronService.executeJob(jobId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/cron/toggle', (req: Request, res: Response) => {
  try {
    const { jobId = 'daily-stablecoin-basket', enabled } = req.body;
    const updated = cronService.toggleJob(jobId, enabled);
    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/cron/config', (req: Request, res: Response) => {
  try {
    const { jobId = 'daily-stablecoin-basket', totalAmountIn, maxSlippageBps, schedule } = req.body;
    const updated = cronService.updateConfig(jobId, {
      ...(totalAmountIn !== undefined && { totalAmountIn: parseFloat(totalAmountIn) }),
      ...(maxSlippageBps !== undefined && { maxSlippageBps: parseInt(maxSlippageBps, 10) }),
      ...(schedule !== undefined && { schedule })
    });
    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 13. Reown / WalletConnect System Diagnostics & Project ID Management
app.get('/api/reown/status', async (req: Request, res: Response) => {
  try {
    const testId = req.query.projectId as string | undefined;
    const diagnostics = await reownService.runDiagnostics(testId);
    res.json({ success: true, diagnostics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/reown/switch', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ success: false, error: 'Project ID is required' });
    }
    const updateResult = reownService.setProjectId(projectId);
    if (!updateResult.success) {
      return res.status(400).json(updateResult);
    }
    const diagnostics = await reownService.runDiagnostics();
    res.json({ success: true, ...updateResult, diagnostics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/reown/pairing-uri', (_req: Request, res: Response) => {
  try {
    const uri = reownService.generateTestPairingUri();
    res.json({ success: true, uri, projectId: reownService.getProjectId() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default app;
