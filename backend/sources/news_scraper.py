import httpx
from bs4 import BeautifulSoup
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import asyncio
from typing import List, Dict
import logging
from datetime import datetime
from models.schemas import NewsItem, SentimentAnalysis

logger = logging.getLogger("TradePulse.News")
analyzer = SentimentIntensityAnalyzer()

async def fetch_yahoo_news(client: httpx.AsyncClient, ticker: str) -> List[Dict]:
    url = f"https://finance.yahoo.com/quote/{ticker}/news"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = await client.get(url, headers=headers, follow_redirects=True)
        soup = BeautifulSoup(response.content, "lxml")
        
        news_items = []
        # Try generic search for consistency
        for item in soup.select("li.js-stream-content h3"):
            if item.text:
                news_items.append({
                    "title": item.get_text().strip(),
                    "source": "Yahoo Finance (Scraped)",
                    "url": None
                })
        
        # New Yahoo Layout Fallback
        if not news_items:
             for item in soup.find_all("h3"):
                 if len(item.get_text()) > 20: # Filter out short garbage headers
                     news_items.append({
                        "title": item.get_text().strip(),
                        "source": "Yahoo Finance (Scraped)",
                        "url": None
                    })

        return news_items[:5]
    except Exception as e:
        logger.warning(f"Yahoo News scrape failed: {e}")
        return []

async def fetch_google_rss(client: httpx.AsyncClient, ticker: str) -> List[Dict]:
    url = f"https://news.google.com/rss/search?q={ticker}+stock+when:7d&hl=en-US&gl=US&ceid=US:en"
    
    try:
        response = await client.get(url, follow_redirects=True)
        soup = BeautifulSoup(response.content, features="xml")
        items = soup.find_all("item", limit=5)
        
        return [{
            "title": item.title.text,
            "source": item.source.text if item.source else "Google News",
            "url": item.link.text,
            "published_at": None # parsing RSS dates can be messy, skipping for now
        } for item in items]
    except Exception as e:
        logger.warning(f"Google RSS failed: {e}")
        return []

async def get_news_sentiment(ticker: str) -> SentimentAnalysis:
    async with httpx.AsyncClient(timeout=5.0) as client:
        # Try Yahoo first, then Google in parallel to be fast? 
        # Actually user wants "Fallback", so let's try Yahoo then Google.
        news_data = await fetch_yahoo_news(client, ticker)
        
        if not news_data:
            logger.info("Falling back to Google RSS")
            news_data = await fetch_google_rss(client, ticker)
            
    # Deduplicate by title
    unique_news = {n['title']: n for n in news_data}.values()
    
    processed_news = []
    compound_scores = []
    
    for item in unique_news:
        # Finance-Adjusted VADER (Basic Implementation)
        # In a real app we would update the lexicon here with finance terms
        score = analyzer.polarity_scores(item['title'])
        compound = score['compound']
        
        processed_news.append(NewsItem(
            title=item['title'],
            source=item['source'],
            url=item.get('url'),
            sentiment_score=compound
        ))
        compound_scores.append(compound)
    
    avg_score = sum(compound_scores) / len(compound_scores) if compound_scores else 0
    
    # Normalize -1 to 1 -> 0 to 100
    score_norm = (avg_score + 1) * 50
    
    return SentimentAnalysis(
        score_normalized=score_norm,
        raw_vader=avg_score,
        headline_count=len(processed_news),
        top_headlines=processed_news
    )
