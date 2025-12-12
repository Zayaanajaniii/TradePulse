from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from backend.api.routes import router as api_router
from backend.utils.logging_utils import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("TradePulse System Startup")
    yield
    logger.info("TradePulse System Shutdown")

app = FastAPI(title="TradePulse Quant API", version="4.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
