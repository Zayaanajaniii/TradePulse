from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
from textblob import TextBlob
import requests
from bs4 import BeautifulSoup
import uvicorn
import pandas as pd

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StockRequest(BaseModel):
    ticker: str

@app.post("/analyze")
async def analyze_stock(request: StockRequest):
    ticker = request.ticker.upper()
    
    # 1. Get Stock Data (3 months for chart)
    try:
        stock = yf.Ticker(ticker)
        history = stock.history(period="3mo")
        
        if history.empty:
             raise HTTPException(status_code=404, detail="Stock data not found")
             
        current_price = history['Close'].iloc[-1]
        
        # Calculate 20-day Simple Moving Average (SMA)
        history['SMA_20'] = history['Close'].rolling(window=20).mean()
        sma_20 = history['SMA_20'].iloc[-1]
        
        # Prepare graph data (reset index to get Date as column)
        history_reset = history.reset_index()
        # Format date as YYYY-MM-DD
        graph_data = [
            {"date": row['Date'].strftime('%Y-%m-%d'), "price": round(row['Close'], 2)}
            for _, row in history_reset.iterrows()
        ]
        
    except Exception as e:
        print(f"Error fetching stock data: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")

    # 2. Get News & Analyze Sentiment
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        url = f"https://news.google.com/rss/search?q={ticker}+stock+when:7d&hl=en-US&gl=US&ceid=US:en"
        response = requests.get(url, headers=headers, timeout=5) # Added headers
        soup = BeautifulSoup(response.content, features="xml")
        
        items = soup.find_all("item", limit=5)
        headlines = [item.title.text for item in items]
        
        sentiment_score = 0
        if headlines:
            total_polarity = 0
            for headline in headlines:
                blob = TextBlob(headline)
                total_polarity += blob.sentiment.polarity
            sentiment_score = total_polarity / len(headlines)
            
    except Exception as e:
        print(f"Error fetching news: {e}")
        sentiment_score = 0
        headlines = []

    # 3. Generate Signal (Improved Logic with Technical Fallback)
    signal = "HOLD"
    price_above_sma = current_price > (sma_20 if not pd.isna(sma_20) else current_price)
    
    # Check for NaN in SMA (if not enough data)
    has_sma = not pd.isna(sma_20) and sma_20 > 0

    if has_sma:
        if price_above_sma and sentiment_score > 0.05:
            signal = "STRONG BUY"
        elif price_above_sma and sentiment_score > -0.05:
            signal = "BUY" # Technical/Trend Buy
        elif not price_above_sma and sentiment_score < -0.05:
            signal = "SELL"
        elif not price_above_sma and sentiment_score < -0.15:
            signal = "STRONG SELL"
        elif not price_above_sma:
             signal = "SELL" # Downtrend check
    
    # Override if pure trend is strong but sentiment is neutral
    if signal == "HOLD" and has_sma:
         if price_above_sma: signal = "BUY"
         else: signal = "SELL"

    print(f"DEBUG: Ticker={ticker}, HistoryLen={len(graph_data)}, FirstPoint={graph_data[0] if graph_data else 'None'}")

    return {
        "ticker": ticker,
        "current_price": round(current_price, 2),
        "avg_price_20d": round(sma_20, 2) if has_sma else None,
        "sentiment_score": round(sentiment_score, 2),
        "headlines": headlines,
        "signal": signal,
        "history": graph_data
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
