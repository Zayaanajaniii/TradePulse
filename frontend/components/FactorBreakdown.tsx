import { Factor } from '../types';

export default function FactorBreakdown({ factors }: { factors: Factor[] }) {
    // Normalize factors to percentage width of the bar
    const totalScore = factors.reduce((acc, f) => acc + f.score_impact, 0);

    return (
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Score Composition</h4>

            <div className="flex h-4 w-full rounded-md overflow-hidden gap-0.5">
                {factors.map((f, i) => {
                    const width = Math.max(5, (f.score_impact / 100) * 100); // Rough pct
                    const color = f.factor_name.includes("RSI") ? "bg-blue-500" :
                        f.factor_name.includes("Trend") ? "bg-purple-500" :
                            "bg-amber-500"; // Sentiment

                    return (
                        <div
                            key={i}
                            className={`${color} hover:opacity-80 transition-opacity cursor-help relative group`}
                            style={{ width: `${width}%` }}
                        >
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black border border-gray-700 p-2 rounded text-xs whitespace-nowrap hidden group-hover:block z-20">
                                {f.factor_name}: {f.score_impact.toFixed(1)}
                            </div>
                        </div>
                    );
                })}
                {/* Fill remaining if less than 100 */}
                <div className="bg-gray-800 flex-1 opacity-20"></div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                <span>0</span>
                <span>50 (NEUTRAL)</span>
                <span>100</span>
            </div>
        </div>
    );
}
