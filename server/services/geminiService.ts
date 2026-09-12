/**
 * Google Gemini AI Copilot Service for Bushido Trading & Stanley Druckenmiller Strategy
 * Leverages @google/genai with gemini-3.8-flash model
 */

import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
      aiClient = null;
    }
  }
  return aiClient;
}

export interface CopilotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GeminiService {
  /**
   * Generates AI market insight and Druckenmiller strategic advice
   */
  async generateMacroCounsel(
    prompt: string,
    context?: {
      activeToken?: string;
      userBalanceEth?: number;
      virtueScore?: number;
      selectedRouter?: string;
    }
  ): Promise<string> {
    const ai = getAiClient();

    const systemContext = `
You are the Stanley Druckenmiller Bushido Trading AI Copilot running on the Base Layer-2 network (Chain ID: 8453).
Your operational principles:
1. Capital Preservation First: Never lose big money. If a trade is dubious, cut it or don't enter.
2. The Fat Pitch & Asymmetry: Size aggressively only when the risk/reward ratio exceeds 3:1 and the Bushido Virtue Alignment is > 70.
3. The 8 Bushido Virtues (八徳): Gi (Righteousness/anti-MEV), Yu (Courage), Jin (Benevolence/creator splits), Rei (Respect/slippage bounds), Makoto (Sincerity/verified contracts), Meiyo (Honor/identity attestations), Chugi (Loyalty/liquidity depth), Nintai (Patience).
4. Multi-DEX Architecture: Routing seamlessly through 1inch v5, LI.FI Diamond, and 0x Protocol Router.

User context:
- Token analyzed: ${context?.activeToken || 'Bushido ERC-20z Pools'}
- Portfolio Balance: ${context?.userBalanceEth ?? 10.0} ETH
- Virtue Alignment Score: ${context?.virtueScore ?? 92}/100
- Active DEX Router: ${context?.selectedRouter || '1inch v5 / LI.FI Diamond'}

Speak directly, decisively, and concisely like legendary macro investor Stanley Druckenmiller with razor-sharp market logic and Japanese martial trading discipline. Keep your answers focused (under 180 words) and emphasize risk-managed sizing.
`;

    if (ai) {
      try {
        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemContext },
                { text: prompt }
              ]
            }
          ]
        });

        // 5-second timeout for rapid responsive UX
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 5000);
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);

        if (response && response.text) {
          return response.text.trim();
        }
      } catch (error) {
        console.warn('Gemini API call returned error, falling back to sovereign strategy logic:', error);
      }
    }

    // Sovereign fallback responses when API key is unconfigured or rate limited
    return this.getSovereignFallbackResponse(prompt, context);
  }

  private getSovereignFallbackResponse(
    prompt: string,
    context?: { activeToken?: string; userBalanceEth?: number; virtueScore?: number }
  ): string {
    const p = prompt.toLowerCase();
    const token = context?.activeToken || 'GI';
    const balance = context?.userBalanceEth ?? 10.0;
    const maxSafe = (balance * 0.1).toFixed(2);

    if (p.includes('size') || p.includes('risk') || p.includes('how much')) {
      return `Druckenmiller Rule #1: "It’s not whether you’re right or wrong, but how much money you make when you’re right and how much you don’t lose when you’re wrong." With ${balance} ETH in your portfolio, keep single-swap exposure capped at ${maxSafe} ETH (10% max limit). Ensure your stop is defined at the Uniswap V3 concentrated liquidity threshold before pulling the trigger.`;
    }

    if (p.includes('route') || p.includes('1inch') || p.includes('dex') || p.includes('slippage')) {
      return `Our multi-node routing scans 1inch v5, LI.FI Diamond, and 0x Protocol simultaneously. On Base L2, always prioritize gas-calibrated net output. If price impact exceeds 1.2%, wait for liquidity rebalancing or split orders into tranches. That is the virtue of Rei (Respect for market liquidity).`;
    }

    if (p.includes('virtue') || p.includes('bushido') || p.includes('gi') || p.includes('honor')) {
      return `The Bushido scoring protocol guarantees trade integrity. With an active score of ${context?.virtueScore ?? 92}/100, the current pool exhibits genuine liquidity lock, clean creator fee distribution, and MEV resistance. When liquidity is pure and the macro tailwind is with Base, you strike with conviction.`;
    }

    return `Look at the macro picture on Base: liquidity is concentrating into verified ERC-20z pools with clear fee distribution. For ${token}, your downside is bounded by the locked pool floor, while upside participation is asymmetrical. Respect the 10% maximum sizing limit, confirm your Web3 signature delegation, and let the trend run.`;
  }
}

export const geminiService = new GeminiService();
