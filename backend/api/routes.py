from fastapi import APIRouter, HTTPException
from models.schemas import AnalysisResponse
from scoring.engine import analyze_ticker
from sources.yfinance_client import cache as yf_cache
import logging

router = APIRouter()
logger = logging.getLogger("TradePulse.API")

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_stock(request: dict):
    # Retrieve ticker from body safely
    ticker = request.get("ticker", "").upper()
    if not ticker or len(ticker) > 6 or not ticker.isalpha():
        raise HTTPException(status_code=400, detail="Invalid Ticker Format")

    logger.info(f"Received analysis request for {ticker}")
    try:
        return await analyze_ticker(ticker)
    except ValueError as e:
        logger.warning(f"Validation Error: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Internal Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "cache_size": yf_cache.currsize
        # could add downstream checks here
    }
