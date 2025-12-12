import React from 'react';
import { Database, GitCommit, Settings, Clock } from 'lucide-react';

export default function ProvenancePanel({
    timestamp,
    dataPoints,
    newsCount
}: {
    timestamp: string,
    dataPoints: number,
    newsCount: number
}) {
    // Determine exchange time approx (just formatting UTC to local for now, usually explicit exchange time requires market schedule logic)
    const dateObj = new Date(timestamp);
    const utcString = dateObj.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    return (
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 text-[10px] text-gray-500 font-mono space-y-3">
            <h4 className="uppercase tracking-widest text-gray-600 flex items-center gap-2">
                <Database className="w-3 h-3" /> System Provenance
            </h4>

            {/* Timestamps */}
            <div className="grid grid-cols-1 gap-1 pl-2 border-l border-gray-800">
                <div className="flex justify-between">
                    <span>ANALYSIS GENERATED:</span>
                    <span className="text-gray-300">{utcString}</span>
                </div>
                <div className="flex justify-between">
                    <span>TIMEFRAME:</span>
                    <span className="text-gray-300">Intraday / Daily</span>
                </div>
            </div>

            {/* Configs */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                <div>
                    <span className="block mb-1 opacity-70 flex items-center gap-1"><GitCommit className="w-2.5 h-2.5" /> MODEL</span>
                    <span className="text-gray-300 block">Alpha Engine v4.1</span>
                    <span className="text-gray-500 block">Factor Weights v2</span>
                </div>
                <div>
                    <span className="block mb-1 opacity-70 flex items-center gap-1"><Settings className="w-2.5 h-2.5" /> PARAMS</span>
                    <span className="text-gray-400 block">RSI(14), MACD(12,26,9)</span>
                    <span className="text-gray-400 block">ADX(14), ATR(14)</span>
                </div>
            </div>

            {/* Sample Sizes */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="block mb-1 opacity-70">DATA SAMPLE</span>
                    <span className="text-gray-300 block">{dataPoints} OHLCV Candles</span>
                </div>
                <div>
                    <span className="block mb-1 opacity-70">INTELLIGENCE</span>
                    <span className="text-gray-300 block">{newsCount} Headlines Analyzed</span>
                    <span className="text-gray-500 block">Lookback: 7 Days</span>
                </div>
            </div>
        </div>
    );
}
