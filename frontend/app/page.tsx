'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Search, AlertCircle, BarChart3, Zap, Newspaper, TrendingUp, Clock
} from 'lucide-react';
import SignalExplanation from '../components/SignalExplanation';
import FactorBreakdown from '../components/FactorBreakdown';
import RiskDisclosure from '../components/RiskDisclosure';
import MetricCard from '../components/MetricCard';
import ProvenancePanel from '../components/ProvenancePanel';
import RegimeDisplay from '../components/RegimeDisplay';
import { AnalysisResult } from '../types';

// --- Local Components (Simple) ---

const LoadingTerminal = ({ ticker }: { ticker: string }) => {
  return (
    <div className="font-mono text-xs sm:text-sm text-green-400 bg-black p-6 rounded-xl border border-green-500/30 shadow-[0_0_20px_rgba(0,255,0,0.1)] min-h-[300px] flex flex-col gap-2 justify-center items-center">
      <div className="flex gap-2 items-center">
        <Zap className="animate-pulse w-4 h-4" />
        <span className="animate-pulse">INITIALIZING QUANT ENGINE FOR {ticker}...</span>
      </div>
      <p className="text-gray-600">Calculating RSI/MACD/VADER Factors...</p>
    </div>
  );
};

const FearGreedGauge = ({ score }: { score: number }) => {
  const normalized = Math.max(0, Math.min(100, score)); // clamp
  const rotation = (normalized / 100) * 180;

  return (
    <div className="relative w-full h-24 overflow-hidden flex items-end justify-center mb-2">
      <div className="absolute w-40 h-40 border-[12px] border-gray-800 rounded-full top-0 box-border"></div>
      <div
        className="absolute w-40 h-40 border-[12px] border-transparent rounded-full top-0 box-border border-t-emerald-500 border-r-emerald-500 border-l-rose-500 transition-all duration-1000 ease-out"
        style={{ transform: `rotate(${rotation - 45}deg)` }}
      ></div>
      <div
        className="absolute bottom-0 w-1 h-20 bg-white origin-bottom transition-transform duration-1000 ease-out z-10"
        style={{ transform: `rotate(${rotation - 90}deg)` }}
      />
      <div className="absolute bottom-0 w-4 h-4 bg-white rounded-full z-20" />
    </div>
  );
};

// --- Main Page ---

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!ticker) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });

      if (!response.ok) throw new Error('Data stream failed');
      const data = await response.json();

      // Delay for effect
      await new Promise(r => setTimeout(r, 1000));

      // Map API -> Frontend Type
      setResult({
        ticker: data.ticker,
        current_price: data.current_price,
        rsi: data.technical_analysis.rsi,
        macd: data.technical_analysis.interpretation.includes('Bullish') ? 'Bullish' : 'Bearish',
        sentiment_score: data.sentiment_analysis.score_normalized,
        confidence_score: `${Math.round(data.signal_analysis.confidence_score)}%`,
        signal: data.signal_analysis.signal,
        headlines: data.sentiment_analysis.top_headlines.map((h: any) => h.title),
        history: data.price_history,
        factors: data.signal_analysis.factors,
        meta: {
          volume: data.fundamentals.volume_avg ? `${(data.fundamentals.volume_avg / 1000000).toFixed(1)}M` : 'N/A',
          high: 0,
          low: 0
        },
        // v6 Fields
        timestamp: data.timestamp,
        adx: data.technical_analysis.adx || 0,
        atr: data.technical_analysis.atr || 0
      });
    } catch (err: any) {
      setError(err.message || 'System Failure');
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (signal: string) => {
    if (signal.includes('BUY')) return 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/20';
    if (signal.includes('SELL')) return 'text-rose-400 border-rose-500/50 shadow-rose-500/20';
    return 'text-cyan-400 border-cyan-500/50 shadow-cyan-500/20';
  };

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-20">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b border-gray-800/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg">
              <BarChart3 className="text-white h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter text-white">
              Trade<span className="text-cyan-400">Pulse</span> <span className="text-[10px] text-gray-400 font-mono border border-gray-700 px-1 rounded ml-1 bg-gray-900">v6.0 TRUST</span>
            </h1>
          </div>
          {result && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-gray-900 px-3 py-1.5 rounded border border-gray-800">
              <Clock className="w-3 h-3 text-cyan-500" />
              <span>ANALYSIS TIME: {new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </header>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-16 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />
          <div className="relative flex shadow-2xl">
            <div className="relative flex-1 bg-black/60 backdrop-blur-md rounded-l-xl border border-gray-800 focus-within:border-cyan-500/50 transition-colors">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="ENTER TICKER (e.g. NVDA)"
                className="w-full bg-transparent border-none text-white px-12 py-4 text-lg focus:ring-0 placeholder:text-gray-700 tracking-wider font-mono uppercase focus:outline-none"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={loading}
              className="bg-gray-100 hover:bg-white text-black font-bold px-8 rounded-r-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Zap className="animate-spin h-5 w-5" /> : 'SCAN'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading && <LoadingTerminal ticker={ticker} />}

          {error && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-4 font-mono">
              <AlertCircle />
              <span>ERROR: {error}</span>
            </div>
          )}

          {!loading && result && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">

              {/* --- Top Row: Identity & Primary Signal --- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Asset Info (Left, 4 cols) */}
                <div className="lg:col-span-4 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <h1 className="text-8xl font-black text-white select-none">{result.ticker}</h1>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">{result.ticker}</h2>
                    <p className="text-3xl font-mono text-cyan-400">${result.current_price.toFixed(2)}</p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-8">
                    <MetricCard
                      title="RSI (14)"
                      value={result.rsi.toFixed(1)}
                      subValue={result.rsi < 30 ? "OVERSOLD" : result.rsi > 70 ? "OVERBOUGHT" : "NEUTRAL"}
                      status={result.rsi < 30 || result.rsi > 70 ? 'warning' : 'neutral'}
                    />
                    <MetricCard
                      title="TREND"
                      value={result.macd}
                      status={result.macd === 'Bullish' ? 'bullish' : 'bearish'}
                    />
                  </div>
                </div>

                {/* Signal Core (Middle, 4 cols) */}
                <div className={`lg:col-span-4 bg-gray-900/40 backdrop-blur-sm border rounded-2xl p-8 flex flex-col items-center justify-center relative shadow-2xl ${getSignalColor(result.signal)}`}>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] mb-4 opacity-80">Composite Alpha Signal</p>
                  <div className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2 text-center leading-none">
                    {result.signal}
                  </div>
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono flex items-center gap-2" title="Analytical Confidence derived from factor agreement and data completeness">
                    <span>SIGNAL CONFIDENCE:</span>
                    <span className="font-bold text-white">{result.confidence_score}</span>
                  </div>
                </div>

                {/* Explainability Panel (Right, 4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <SignalExplanation factors={result.factors} signal={result.signal} />
                  <FactorBreakdown factors={result.factors} />
                </div>
              </div>

              {/* --- Middle Row: Chart & Deep Data --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart */}
                <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 min-h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 flex items-center gap-2 font-mono">
                      <TrendingUp className="w-4 h-4 text-cyan-500" /> PRICE ACTION (3M)
                    </h3>
                  </div>
                  <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.history}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        {/* Using 0 domain to auto-scale dynamically */}
                        <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                          itemStyle={{ color: '#06b6d4' }}
                          labelFormatter={() => ''}
                        />
                        <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sidebar: Sentiment & Risk */}
                <div className="space-y-6">

                  {/* Component: Regime Display (New) */}
                  <RegimeDisplay adx={result.adx} atr={result.atr} />

                  {/* Component: Provenance Panel (New) */}
                  <ProvenancePanel
                    timestamp={result.timestamp}
                    dataPoints={result.history.length + 200} // approx total history fetched
                    newsCount={result.headlines.length}
                  />

                  {/* Sentiment Gauge */}
                  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
                    <h3 className="text-[10px] font-mono text-gray-500 mb-2 uppercase tracking-widest">News Sentiment Impact</h3>
                    <FearGreedGauge score={result.sentiment_score} />
                    <div className="flex justify-between w-full px-4 mt-[-10px]">
                      <span className="text-xs text-rose-500 font-mono">BEARISH</span>
                      <span className="text-xs text-emerald-500 font-mono">BULLISH</span>
                    </div>
                    <p className={`mt-4 font-mono text-2xl font-bold ${result.sentiment_score > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.sentiment_score.toFixed(0)}/100
                    </p>
                  </div>

                  <RiskDisclosure quality={null} meta={result.meta} />

                  {/* News Feed */}
                  <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <h3 className="text-[10px] font-mono text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest"><Newspaper className="w-3 h-3" /> News Intelligence</h3>
                    <div className="space-y-4">
                      {result.headlines.length > 0 ? result.headlines.map((h, i) => (
                        <div key={i} className="group cursor-default">
                          <p className="text-xs text-gray-300 group-hover:text-cyan-400 transition-colors leading-relaxed">
                            {h}
                          </p>
                          <div className="h-px bg-gray-800 mt-3 group-last:hidden" />
                        </div>
                      )) : <p className="text-gray-600 text-xs italic">No relevant news stream</p>}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
