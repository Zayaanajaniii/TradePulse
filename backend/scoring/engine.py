from datetime import datetime
import pandas as pd
from typing import List, Tuple
import logging

from models.schemas import (
    AnalysisResponse, Signal, DataQuality, FactorContribution, 
    TradeSignal, Fundamentals, TechnicalIndicators, SentimentAnalysis, PricePoint
)
from indicators.technical import (
    calculate_rsi, calculate_macd, calculate_atr, calculate_adx
)
from sources.yfinance_client import get_stock_data
from sources.news_scraper import get_news_sentiment
from utils.logging_utils import get_request_id

logger = logging.getLogger("TradePulse.Scoring")

async def analyze_ticker(ticker: str) -> AnalysisResponse:
    request_id = get_request_id()
    
    # 1. Fetch Data
    try:
        history, fundamentals_dict = get_stock_data(ticker)
        sentiment = await get_news_sentiment(ticker)
    except Exception as e:
        logger.error(f"Failed to fetch data for {ticker}: {e}")
        # In production this should be handled more gracefully, 
        # possibly returning a partial response or a specific error code.
        raise e

    # 2. Calculate Technicals
    rsi = calculate_rsi(history['Close'])
    macd_line, signal_line, hist = calculate_macd(history['Close'])
    atr = calculate_atr(history['High'], history['Low'], history['Close'])
    adx = calculate_adx(history['High'], history['Low'], history['Close'])
    
    # 3. Factor Scoring Model (0-100 Scale)
    factors: List[FactorContribution] = []
    
    # Factor A: Momentum (RSI) - weight 25%
    # Bullish if RSI < 30 (Oversold), Bearish if > 70
    rsi_score = 50
    if rsi < 30: rsi_score = 100 # Strong Bullish
    elif rsi < 40: rsi_score = 75
    elif rsi > 70: rsi_score = 0 # Strong Bearish
    elif rsi > 60: rsi_score = 25
    
    factors.append(FactorContribution(
        factor_name="Momentum (RSI)",
        score_impact=rsi_score * 0.25,
        reason=f"RSI is {rsi:.1f} ({'Oversold' if rsi<30 else 'Overbought' if rsi>70 else 'Neutral'})"
    ))

    # Factor B: Trend (MACD + ADX) - weight 35%
    # Bullish if MACD > Signal. Amplified if ADX > 25 (Strong Trend)
    trend_score = 50
    if macd_line > signal_line:
        trend_score = 75
        if adx > 25: trend_score = 100
    else:
        trend_score = 25
        if adx > 25: trend_score = 0
    
    factors.append(FactorContribution(
        factor_name="Trend (MACD+ADX)",
        score_impact=trend_score * 0.35,
        reason=f"MACD {'Bullish' if macd_line > signal_line else 'Bearish'} Cross, ADX {adx:.1f}"
    ))

    # Factor C: Sentiment - weight 40%
    sent_score = sentiment.score_normalized
    factors.append(FactorContribution(
        factor_name="Market Sentiment",
        score_impact=sent_score * 0.40,
        reason=f"VADER Score: {sentiment.raw_vader:.2f} from {sentiment.headline_count} headlines"
    ))

    # 4. Final Aggregation
    final_score = (rsi_score * 0.25) + (trend_score * 0.35) + (sent_score * 0.40)
    
    # Generate Signal Label
    if final_score >= 80: sig_label = Signal.STRONG_BUY
    elif final_score >= 60: sig_label = Signal.BUY
    elif final_score <= 20: sig_label = Signal.STRONG_SELL
    elif final_score <= 40: sig_label = Signal.SELL
    else: sig_label = Signal.HOLD
    
    # Confidence: Higher if factors align (low variance between factor sources)
    # Simple proxy: if score is extreme, confidence is high.
    confidence = abs(final_score - 50) + 50 # 50 to 100 roughly
    
    # 5. Construct Response
    
    # prepare 3mo history
    history_3mo = history.tail(90).reset_index()
    price_points = [
        PricePoint(date=row['Date'].strftime('%Y-%m-%d'), price=round(row['Close'], 2))
        for _, row in history_3mo.iterrows()
    ]
    
    return AnalysisResponse(
        request_id=request_id,
        ticker=ticker,
        timestamp=datetime.now(),
        current_price=fundamentals_dict.get("current_price"),
        fundamentals=Fundamentals(**fundamentals_dict),
        technical_analysis=TechnicalIndicators(
            rsi=rsi, macd_line=macd_line, signal_line=signal_line, histogram=hist,
            atr=atr, adx=adx,
            interpretation=f"RSI {rsi:.1f}, Trend is {'Strong' if adx>25 else 'Weak'}"
        ),
        sentiment_analysis=sentiment,
        signal_analysis=TradeSignal(
            signal=sig_label,
            confidence_score=confidence,
            final_score=final_score,
            factors=factors
        ),
        data_quality=DataQuality(
            price_coverage="1Y Daily OHLCV",
            news_coverage=f"{sentiment.headline_count} Sources",
            is_fallback_used=False # TODO: wiring this from news scraper return
        ),
        price_history=price_points
    )
