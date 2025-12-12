import yfinance as yf
import pandas as pd
from typing import Dict, Any, Tuple
from cachetools import TTLCache, cached
import logging

logger = logging.getLogger("TradePulse.YFinance")

# Cache data for 15 minutes to avoid hitting rate limits and improve speed
cache = TTLCache(maxsize=100, ttl=900)

@cached(cache)
def get_stock_data(ticker: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Fetches 1 year of history and fundamentals.
    Returns (history dataframe, fundamentals dict).
    """
    logger.info(f"Fetching data for {ticker} from Yahoo Finance")
    try:
        stock = yf.Ticker(ticker)
        
        # 1. Fetch History (1 Year for robust Tech Analysis)
        history = stock.history(period="1y")
        
        if history.empty:
            logger.warning(f"No price data found for {ticker}")
            raise ValueError(f"No price data found for {ticker}")
            
        # 2. Fetch Fundamentals (Best Effort)
        info = stock.info
        fundamentals = {
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "volume_avg": info.get("averageVolume"),
            "current_price": info.get("currentPrice") or history['Close'].iloc[-1]
        }
        
        return history, fundamentals

    except Exception as e:
        logger.error(f"YFinance Error for {ticker}: {e}")
        raise e
