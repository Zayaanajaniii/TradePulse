from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime

class Signal(str):
    STRONG_BUY = "STRONG BUY"
    BUY = "BUY"
    HOLD = "HOLD"
    SELL = "SELL"
    STRONG_SELL = "STRONG SELL"

class DataQuality(BaseModel):
    price_coverage: str = Field(..., description="Description of price data quality (e.g. 'Full 1Y History')")
    news_coverage: str = Field(..., description="Description of news sources found")
    missing_fields: List[str] = Field(default_factory=list, description="List of any missing data points")
    is_fallback_used: bool = False

class FactorContribution(BaseModel):
    factor_name: str
    score_impact: float = Field(..., description="Normalized impact on final score (0-100 scale)")
    reason: str

class TradeSignal(BaseModel):
    signal: str
    confidence_score: float = Field(..., ge=0, le=100)
    final_score: float = Field(..., ge=0, le=100)
    factors: List[FactorContribution]

class Fundamentals(BaseModel):
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    volume_avg: Optional[float] = None

class TechnicalIndicators(BaseModel):
    rsi: float
    macd_line: float
    signal_line: float
    histogram: float
    atr: Optional[float] = None
    adx: Optional[float] = None
    interpretation: str

class NewsItem(BaseModel):
    title: str
    source: str
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    sentiment_score: float

class SentimentAnalysis(BaseModel):
    score_normalized: float = Field(..., ge=0, le=100, description="0 to 100 sentiment score")
    raw_vader: float = Field(..., ge=-1, le=1)
    headline_count: int
    top_headlines: List[NewsItem]

class PricePoint(BaseModel):
    date: str
    price: float

class AnalysisResponse(BaseModel):
    request_id: str
    ticker: str
    timestamp: datetime
    current_price: float
    fundamentals: Fundamentals
    technical_analysis: TechnicalIndicators
    sentiment_analysis: SentimentAnalysis
    signal_analysis: TradeSignal
    data_quality: DataQuality
    price_history: List[PricePoint]
