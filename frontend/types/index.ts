export type MetaData = {
    volume: string;
    high: number;
    low: number;
};

export type Factor = {
    factor_name: string;
    score_impact: number;
    reason: string;
};

export type NewsItem = {
    title: string;
    source: string;
    url?: string;
    published_at?: string;
    sentiment_score: number;
};

export type PricePoint = {
    date: string;
    price: number;
};

export type AnalysisResult = {
    ticker: string;
    current_price: number;
    rsi: number;
    macd: string; // "Bullish" | "Bearish"
    sentiment_score: number; // 0-100
    confidence_score: string; // e.g. "87%"
    signal: 'STRONG BUY' | 'BUY' | 'SELL' | 'STRONG SELL' | 'HOLD';
    headlines: string[]; // Legacy flat list, might use full objects if backend sends them
    history: PricePoint[];
    factors: Factor[];
    meta: MetaData;
    timestamp: string;
    adx: number;
    atr: number;
};
