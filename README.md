# TradePulse 📈

TradePulse is a **Real-Time Stock Sentiment Analysis Dashboard** that combines financial data with AI-powered news sentiment analysis to provide trading signals.

![TradePulse Dashboard](./screenshot.png)

## Features

- **Live Stock Data**: Validated price updates via `yfinance`.
- **AI Sentiment Analysis**: Scrapes Google News and uses Natural Language Processing (NLP) to gauge market sentiment.
- **Smart Signals**: Combines Sentiment Score + 20-Day Moving Average (SMA) technical indicators.
- **Interactive Charts**: 3-month historical price visualization using `recharts`.
- **Modern UI**: Built with Next.js and TailwindCSS.

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: FastAPI, Python, TextBlob (NLP), BeautifulSoup (Scraping), Yfinance.

## Installation

### Prerequisites
- Node.js & npm
- Python 3.9+

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The server runs on `http://localhost:8000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The dashboard runs on `http://localhost:3000`.

## How it Works
1. Enter a ticker (e.g., `NVDA`, `TSLA`, `BYND`) and click **Scan**.
2. The system fetches the last 3 months of price data.
3. It scrapes the latest news headlines for that stock.
4. It calculates a composite Sentiment Score.
5. It compares the current price to the 20-day Moving Average.
6. **AI Signal**:
   - **STRONG BUY**: Bullish Trend + Positive Sentiment
   - **BUY**: Bullish Trend + Neutral Sentiment
   - **SELL**: Bearish Trend + Negative Sentiment

## License
MIT
