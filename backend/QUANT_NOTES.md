# TradePulse v4 Quant Notes

## 1. Data Processing
- **Aggregation**: Daily OHLCV candles (1 Year Lookback).
- **Timezone**: All data normalized to US/Eastern.
- **Missing Data**: Forward-fill for prices, 0-fill for volume.

## 2. Technical Indicators
Implemented in `backend/indicators/technical.py` using Pandas.

### RSI (Relative Strength Index)
- **Period**: 14 Days
- **Method**: Wilder's Smoothing (alpha = 1/14).
- **Logic**:
  - `> 70`: Overbought (Bearish Pressure)
  - `< 30`: Oversold (Bullish Pressure)

### MACD (Moving Average Convergence Divergence)
- **Fast**: 12 EMA
- **Slow**: 26 EMA
- **Signal**: 9 EMA
- **Logic**: Bullish when MACD Line > Signal Line.

### ADX (Average Directional Index)
- **Period**: 14 Days
- **Logic**: Measures trend strength (0-100).
  - `> 25`: Strong Trend
  - `< 20`: Weak/Sideways Market

### ATR (Average True Range)
- **Period**: 14 Days
- **Usage**: Volatility measurement. Currently returned for display, future use for Stop Loss placement.

## 3. Sentiment Analysis (VADER)
- **Source**: Yahoo Finance News + Google News RSS (Fallback).
- **Engine**: VADER (Valence Aware Dictionary and sEntiment Reasoner).
- **Adjustments**: Scores normalized from [-1, 1] to [0, 100].

## 4. Alpha Scoring Model
The `final_score` (0-100) is a weighted sum of normalized factors:

| Factor | Weight | Logic |
|--------|--------|-------|
| **Momentum (RSI)** | 25% | linear mapping of RSI zones |
| **Trend (MACD+ADX)** | 35% | MACD Cross + ADX confirmation |
| **Sentiment** | 40% | VADER Score from Headlines |

**Confidence Score**: Derived from the extremity of the Final Score. Scores near 50 (Neutral) have low confidence; scores near 0 or 100 have high confidence.
