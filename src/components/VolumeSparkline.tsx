import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis, XAxis } from 'recharts';
import { Coin, VolumePoint } from '../types';
import { generateInitialVolumeHistory, generateInitialHistory, formatPrice } from '../utils';

export interface VolumeSparklineProps {
  coin: Coin;
  color?: string;
  height?: number;
  width?: string | number;
  className?: string;
  metric?: 'price' | 'volume';
}

export default function VolumeSparkline({
  coin,
  color = '#22d3ee',
  height = 36,
  width = '100%',
  className = '',
  metric = 'price'
}: VolumeSparklineProps) {
  // Extract or generate data points based on selected metric
  const data = useMemo(() => {
    if (metric === 'price') {
      if (coin.priceHistory && coin.priceHistory.length >= 2) {
        return coin.priceHistory.map((pt: any, idx: number) => ({
          time: pt.timestamp || pt.time || `T-${idx}`,
          value: Number(pt.price)
        }));
      }
      return generateInitialHistory(coin.currentPrice || 1e-9, 15).map((pt, idx) => ({
        time: pt.timestamp || `T-${idx}`,
        value: Number(pt.price)
      }));
    }

    // Default to volume metric
    if (coin.volumeHistory && coin.volumeHistory.length >= 2) {
      return coin.volumeHistory.map((pt: VolumePoint) => ({
        time: pt.timestamp,
        value: Number(pt.volume)
      }));
    }
    return generateInitialVolumeHistory(coin.volume24h || 0.1, 24, coin.id || coin.symbol).map(pt => ({
      time: pt.timestamp,
      value: Number(pt.volume)
    }));
  }, [coin.priceHistory, coin.volumeHistory, coin.currentPrice, coin.volume24h, coin.id, coin.symbol, metric]);

  // Determine dynamic domain so subtle price fluctuations have sufficient visual altitude
  const yDomain = useMemo(() => {
    if (!data.length) return ['auto', 'auto'];
    const vals = data.map(d => d.value).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) return ['auto', 'auto'];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const diff = max - min;
    const padding = diff > 0 ? diff * 0.15 : (min > 0 ? min * 0.05 : 0.0001);
    return [Math.max(0, min - padding), max + padding];
  }, [data]);

  const gradientId = `volume-sparkline-grad-${coin.id.replace(/[^a-zA-Z0-9_-]/g, '_')}-${metric}`;

  return (
    <div 
      className={`relative flex items-center justify-end sparkline-container ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: `${height}px`,
        minWidth: '110px',
        minHeight: `${height}px` 
      }}
    >
      <style>{`
        .sparkline-container svg path.recharts-curve {
          transition: d 700ms cubic-bezier(0.4, 0, 0.2, 1), stroke 350ms ease, fill 350ms ease !important;
          will-change: d;
        }
      `}</style>
      <ResponsiveContainer 
        width="100%" 
        height={height} 
        minWidth={100} 
        minHeight={height}
      >
        <AreaChart 
          data={data} 
          margin={{ top: 2, right: 1, left: 1, bottom: 2 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="90%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis domain={yDomain} hide />
          <XAxis dataKey="time" hide />
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '2 2' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-[#03050a] border border-slate-800/90 rounded px-2 py-1 shadow-2xl text-[10px] font-mono text-slate-200 pointer-events-none z-50 whitespace-nowrap">
                    <div className="text-slate-400 flex items-center gap-1">
                      <span>{item.time}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500">
                        {metric === 'price' ? 'Price Point' : '24h Volume'}
                      </span>
                    </div>
                    <div className="font-bold text-xs mt-0.5" style={{ color }}>
                      {metric === 'price' 
                        ? `${formatPrice(Number(item.value))} ETH` 
                        : `${Number(item.value).toFixed(4)} ETH`
                      }
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: '#03050a', strokeWidth: 1.5 }}
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-in-out"
            animationBegin={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
