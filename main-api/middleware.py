"""
DeepHunt Main-API Middleware Stack
- Security headers
- Request logging with timing
- Redis-backed rate limiting for auth endpoints
"""
import time
import json
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import redis.asyncio as redis

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Injects security headers into every response."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs every request with method, path, status, and response time."""
    
    def __init__(self, app, logger=None):
        super().__init__(app)
        self.logger = logger
    
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        
        try:
            response = await call_next(request)
        except Exception as exc:
            if self.logger:
                self.logger.error(f"Unhandled exception on {request.method} {request.url.path}", 
                                exc_info=True)
            raise
        
        elapsed_ms = round((time.time() - start) * 1000, 2)
        
        if self.logger:
            # Skip noisy health check logs
            if request.url.path not in ("/health", "/api/main/health"):
                log_data = {
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "elapsed_ms": elapsed_ms,
                    "client_ip": request.client.host if request.client else "unknown"
                }
                if response.status_code >= 400:
                    self.logger.warning(f"HTTP {response.status_code} | {request.method} {request.url.path} | {elapsed_ms}ms")
                else:
                    self.logger.info(f"HTTP {response.status_code} | {request.method} {request.url.path} | {elapsed_ms}ms")
        
        response.headers["X-Response-Time"] = f"{elapsed_ms}ms"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Redis-backed IP rate limiting for authentication endpoints.
    - /api/main/login: 10 requests per minute per IP
    - /api/main/register: 5 requests per minute per IP
    - /api/main/password-reset/*: 5 requests per minute per IP
    """
    
    RATE_LIMITS = {
        "/api/main/login": {"max": 10, "window": 60},
        "/api/main/register": {"max": 5, "window": 60},
        "/api/main/password-reset/request": {"max": 5, "window": 60},
        "/api/main/password-reset/verify": {"max": 10, "window": 60},
        "/api/main/password-reset/reset": {"max": 5, "window": 60},
    }
    
    def __init__(self, app, redis_client=None, logger=None):
        super().__init__(app)
        self.redis_client = redis_client
        self.logger = logger
    
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        if path in self.RATE_LIMITS and self.redis_client:
            limit_config = self.RATE_LIMITS[path]
            client_ip = request.client.host if request.client else "unknown"
            rate_key = f"rate:{path}:{client_ip}"
            
            try:
                current = await self.redis_client.get(rate_key)
                if current and int(current) >= limit_config["max"]:
                    if self.logger:
                        self.logger.warning(f"Rate limit exceeded: {client_ip} on {path}")
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests. Please try again later."},
                        headers={"Retry-After": str(limit_config["window"])}
                    )
                
                pipe = self.redis_client.pipeline()
                await pipe.incr(rate_key)
                await pipe.expire(rate_key, limit_config["window"])
                await pipe.execute()
            except Exception as e:
                # If Redis is down, allow the request through
                if self.logger:
                    self.logger.error(f"Rate limiter Redis error: {e}")
        
        return await call_next(request)
