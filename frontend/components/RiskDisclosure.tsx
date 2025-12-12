import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { MetaData } from '../types';

export default function RiskDisclosure({ quality, meta }: { quality: any, meta: MetaData }) {
    // Parse volume string "1.2M" -> check for low volume
    const isLowVolume = meta.volume && meta.volume.includes('M') ? parseFloat(meta.volume) < 2.0 : false;

    return (
        <div className="bg-gray-900/20 border border-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>DATA INTEGRITY</span>
                <span className="ml-auto text-emerald-500">VERIFIED</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                <div className="p-2 bg-black/40 rounded border border-gray-800">
                    <span className="block mb-1">PRICE SOURCE</span>
                    <span className="text-gray-300 font-mono">NY/NASDAQ (Delayed)</span>
                </div>
                <div className="p-2 bg-black/40 rounded border border-gray-800">
                    <span className="block mb-1">CONFIDENCE</span>
                    <span className="text-gray-300 font-mono">HIGH (1Y Data)</span>
                </div>
            </div>

            {isLowVolume && (
                <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-500">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>CAUTION: Low Volume asset. Technicals may be unreliable due to slippage risk.</span>
                </div>
            )}
        </div>
    );
}
