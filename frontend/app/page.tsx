'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Newspaper, Search, AlertCircle } from 'lucide-react';

type AnalysisResult = {
  ticker: string;
  current_price: number;
  avg_price_20d: number | null;
  sentiment_score: number;
  headlines: string[];
  signal: 'STRONG BUY' | 'BUY' | 'SELL' | 'STRONG SELL' | 'HOLD';
  history: { date: string; price: number }[];
};

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!ticker) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG BUY': return 'text-green-400 bg-green-400/10 border-green-400/50';
      case 'BUY': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/50';
      case 'SELL': return 'text-orange-400 bg-orange-400/10 border-orange-400/50';
      case 'STRONG SELL': return 'text-red-500 bg-red-500/10 border-red-500/50';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500 h-6 w-6" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              TradePulse <span className="text-gray-500 font-normal text-sm">PRO</span>
            </h1>
          </div>
          <div className="flex gap-4">
            {/* Placeholder for future nav items */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="Seach Ticker (e.g. NVDA, TSLA)"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all uppercase placeholder-gray-600 shadow-2xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                />
              </div>
              <button
                onClick={handleScan}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Scan'}
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Chart Card */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    {result.ticker}
                    <span className="text-lg font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded">USD</span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Last 3 Months Price Action</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">${result.current_price.toFixed(2)}</p>
                  <p className={`text-sm flex items-center justify-end gap-1 ${result.avg_price_20d && result.current_price > result.avg_price_20d ? 'text-green-400' : 'text-red-400'}`}>
                    {result.avg_price_20d && result.current_price > result.avg_price_20d ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    vs 20d MA ({result.avg_price_20d?.toFixed(2)})
                  </p>
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      minTickGap={30}
                    />
                    <YAxis
                      stroke="#6b7280"
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                      formatter={(val: number) => [`$${val.toFixed(2)}`, 'Price']}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Signal & Sentiment Column */}
            <div className="space-y-6">
              {/* Signal Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${result.signal.includes('BUY') ? 'from-green-500 to-emerald-500' :
                    result.signal.includes('SELL') ? 'from-red-500 to-orange-500' : 'from-gray-500 to-white'
                  }`} />

                <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> AI Signal
                </h3>
                <div className={`text-center py-8 rounded-xl border ${getSignalColor(result.signal)} mb-6`}>
                  <span className="text-3xl font-black tracking-widest">{result.signal}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Sentiment Score</span>
                    <div className={`font-bold ${result.sentiment_score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {result.sentiment_score > 0 ? '+' : ''}{result.sentiment_score.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* News Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex-1">
                <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                  <Newspaper className="h-4 w-4" /> Latest Headlines
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {result.headlines.length > 0 ? result.headlines.map((headline, i) => (
                    <div key={i} className="p-3 bg-gray-800/30 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                      <p className="text-sm text-gray-300 leading-snug">{headline}</p>
                    </div>
                  )) : (
                    <p className="text-gray-500 italic text-center py-8">No specific news found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
