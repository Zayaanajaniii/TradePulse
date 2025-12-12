import React from 'react';
import { Activity, Compass } from 'lucide-react';

export default function RegimeDisplay({ adx, atr }: { adx: number, atr: number }) {

    // Regime Logic
    const trendRegime = adx > 25 ? "TRENDING" : "RANGE-BOUND";
    const trendStrength = adx > 40 ? "STRONG" : adx > 20 ? "MODERATE" : "WEAK";

    // Simple ATR interpretation (in reality needs percentile, but we'll infer volatility state for display roughly or just show value)
    // Providing context based on raw ATR is hard without history relative comparison. 
    // We will just label it "MEASURED" and show the value, or assume > 1% price is high vol? 
    // Let's rely on the text "VOLATILITY REGIME" and show the raw ADX/ATR values with text.

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 border border-gray-800 p-3 rounded-xl flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                    <Compass className="w-3 h-3 text-cyan-500" /> Trend Regime
                </div>
                <div className="font-mono font-bold text-gray-200">
                    {trendRegime}
                </div>
                <div className="text-[10px] text-gray-500">
                    ADX: {adx.toFixed(1)} ({trendStrength})
                </div>
            </div>

            <div className="bg-black/40 border border-gray-800 p-3 rounded-xl flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                    <Activity className="w-3 h-3 text-purple-500" /> Volatility
                </div>
                <div className="font-mono font-bold text-gray-200">
                    IMPLIED
                </div>
                <div className="text-[10px] text-gray-500">
                    ATR (14): {atr.toFixed(2)}
                </div>
            </div>
        </div>
    );
}
