import React from 'react';

type MetricCardProps = {
    title: string;
    value: string | number;
    subValue?: string;
    status?: 'neutral' | 'bullish' | 'bearish' | 'warning';
};

export default function MetricCard({ title, value, subValue, status = 'neutral' }: MetricCardProps) {
    const getColor = () => {
        switch (status) {
            case 'bullish': return 'text-emerald-400';
            case 'bearish': return 'text-rose-400';
            case 'warning': return 'text-yellow-400';
            default: return 'text-white';
        }
    };

    return (
        <div className="bg-black/40 border border-gray-800 p-4 rounded-xl backdrop-blur-sm hover:border-gray-700 transition-colors">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-mono">{title}</p>
            <p className={`text-xl font-bold ${getColor()}`}>
                {value}
            </p>
            {subValue && (
                <p className="text-xs text-gray-500 mt-1">{subValue}</p>
            )}
        </div>
    );
}
