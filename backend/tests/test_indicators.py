import pytest
import pandas as pd
import numpy as np
from backend.indicators.technical import calculate_rsi, calculate_macd, calculate_atr, calculate_adx

@pytest.fixture
def mock_price_data():
    # Generate a synthetic uptrend then downtrend
    prices = [100 + i for i in range(20)] + [120 - i for i in range(20)]
    return pd.Series(prices)

def test_rsi_calculations():
    # Flat line should be 50 (or close to it after stabilization, but with Wilder it's tricky)
    # Let's test a simpler strong uptrend
    uptrend = pd.Series([100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128])
    rsi = calculate_rsi(uptrend, window=14)
    # In a pure uptrend, gain is usually present, loss is 0. RSI should be 100 or close.
    # Wilder's smoothing needs 'window' periods to stabilize.
    assert rsi > 70, f"RSI for uptrend should be high, got {rsi}"

    downtrend = pd.Series([100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72])
    rsi_down = calculate_rsi(downtrend, window=14)
    assert rsi_down < 30, f"RSI for downtrend should be low, got {rsi_down}"

def test_macd_structure(mock_price_data):
    macd, signal, hist = calculate_macd(mock_price_data)
    assert isinstance(macd, float)
    assert isinstance(signal, float)
    assert isinstance(hist, float)
    # Math check: Hist = MACD - Signal
    assert abs(hist - (macd - signal)) < 0.0001

def test_adx_returns_float():
    high = pd.Series([10, 12, 15, 14, 16] * 10) # 50 days
    low = pd.Series([8, 9, 11, 10, 12] * 10)
    close = pd.Series([9, 11, 14, 12, 15] * 10)
    
    adx = calculate_adx(high, low, close)
    assert isinstance(adx, float)
    assert 0 <= adx <= 100

def test_rsi_handle_nan():
    # Ensure it doesn't crash on short data
    short_data = pd.Series([100, 101, 102])
    rsi = calculate_rsi(short_data)
    assert rsi == 50.0 # Our fallback default
