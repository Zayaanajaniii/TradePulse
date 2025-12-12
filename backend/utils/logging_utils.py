import logging
import uuid
from functools import wraps
import time

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [RequestID: %(request_id)s] - %(message)s',
)
logger = logging.getLogger("TradePulse")

def get_request_id():
    # Context var could be used here for thread safety in bigger apps, 
    # but for now passing it explicitly is fine.
    return str(uuid.uuid4())

class RequestContext:
    _request_id = "SYSTEM"

    @classmethod
    def set_id(cls, rid):
        cls._request_id = rid
    
    @classmethod
    def get_id(cls):
        return cls._request_id

# Log filter to inject request ID
class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = RequestContext.get_id()
        return True

logger.addFilter(RequestIdFilter())

def time_execution(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        try:
            return await func(*args, **kwargs)
        finally:
            duration = time.time() - start
            logger.info(f"Function {func.__name__} took {duration:.4f}s")
    return wrapper
