import { Factor } from '../types';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SignalExplanation({ factors, signal }: { factors: Factor[], signal: string }) {
    // Logic to detect conflict: if we have Strong Buy but a negative factor > 20 impact
    // or Strong Sell but a positive factor > 20 impact.
    const positiveFactors = factors.filter(f => f.score_impact > 15);
    const negativeFactors = factors.filter(f => f.score_impact < 5); // Assuming scale 0-25 per factor roughly, 
    // Wait, backend sends score_impact relative to 100? 
    // Backend code: rsi_score (0-100) * 0.25 -> 25 max points.
    // So > 15 is high impact.

    const isConflict = (signal.includes('BUY') && factors.some(f => f.score_impact < 10)) ||
        (signal.includes('SELL') && factors.some(f => f.score_impact > 15));

    return (
        <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                <span>Signal Alpha</span>
                {isConflict && (
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> FACTOR CONFLICT
                    </span>
                )}
            </h3>

            <div className="space-y-4">
                {factors.map((factor, idx) => (
                    <div key={idx} className="group">
                        <div className="flex justify-between text-xs text-gray-300 mb-1 font-medium">
                            <span className="flex items-center gap-2">
                                {factor.factor_name}
                            </span>
                            <span className={factor.score_impact > 12.5 ? 'text-emerald-400' : 'text-rose-400'}>
                                {factor.score_impact > 0 ? '+' : ''}{factor.score_impact.toFixed(1)} pts
                            </span>
                        </div>

                        {/* Impact Bar */}
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${factor.score_impact > 12.5 ? 'bg-emerald-500' : 'bg-rose-500'} transition-all duration-1000`}
                                style={{ width: `${Math.min(100, Math.max(5, (factor.score_impact / 25) * 100))}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 italic opacity-0 group-hover:opacity-100 transition-opacity">
                            {factor.reason}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
