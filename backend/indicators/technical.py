import pandas as pd
import numpy as np
from typing import Tuple, Dict

def calculate_rsi(data: pd.Series, window: int = 14) -> float:
    """
    Calculate RSI using Wilder's Smoothing.
    """
    delta = data.diff()
    gain = (delta.where(delta > 0, 0))
    loss = (-delta.where(delta < 0, 0))

    # Wilder's Smoothing:
    # First value is SMA, subsequent are (prev * (n-1) + curr) / n
    avg_gain = gain.rolling(window=window, min_periods=window).mean()
    avg_loss = loss.rolling(window=window, min_periods=window).mean()

    # We need to apply the smoothing correctly for the rest of the series
    # Pandas ewm with com=(window-1) matches Wilder's perfectly if adjust=False
    avg_gain = gain.ewm(alpha=1/window, min_periods=window, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/window, min_periods=window, adjust=False).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    # Handle NaN at start
    return rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50.0

def calculate_macd(data: pd.Series, slow: int = 26, fast: int = 12, signal: int = 9) -> Tuple[float, float, float]:
    """
    Returns (macd_line, signal_line, histogram)
    """
    exp1 = data.ewm(span=fast, adjust=False).mean()
    exp2 = data.ewm(span=slow, adjust=False).mean()
    macd_line = exp1 - exp2
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    
    return macd_line.iloc[-1], signal_line.iloc[-1], histogram.iloc[-1]

def calculate_atr(high: pd.Series, low: pd.Series, close: pd.Series, window: int = 14) -> float:
    """
    Average True Range (ATR) for volatility.
    """
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1/window, min_periods=window, adjust=False).mean()
    return atr.iloc[-1]

def calculate_adx(high: pd.Series, low: pd.Series, close: pd.Series, window: int = 14) -> float:
    """
    Average Directional Index (ADX) for trend strength.
    Uses +DI and -DI.
    """
    # True Range
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1/window, min_periods=window, adjust=False).mean()

    # Directional Movement
    up_move = high - high.shift()
    down_move = low.shift() - low
    
    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)
    
    plus_dm_s = pd.Series(plus_dm, index=high.index).ewm(alpha=1/window, min_periods=window, adjust=False).mean()
    minus_dm_s = pd.Series(minus_dm, index=high.index).ewm(alpha=1/window, min_periods=window, adjust=False).mean()

    plus_di = 100 * (plus_dm_s / atr)
    minus_di = 100 * (minus_dm_s / atr)
    
    dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
    adx = dx.ewm(alpha=1/window, min_periods=window, adjust=False).mean()
    
    return adx.iloc[-1]

def get_volume_z_score(volume: pd.Series, window: int = 20) -> float:
    """
    Z-Score of the current volume relative to the last N days.
    """
    mean = volume.rolling(window=window).mean()
    std = volume.rolling(window=window).std()
    z_score = (volume - mean) / std
    return z_score.iloc[-1]
