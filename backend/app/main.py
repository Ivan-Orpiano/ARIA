import logging 
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.core.config import get_settings
from app.routers import email
from app.services.n8n_client import N8NClient

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    async with httpx.AsyncClient() as http_client:
        app.state.settings = settings
        app.state.http_client = http_client
        app.state.n8n_client = N8nClient(settings, http_client)
        yield
        # AsyncClient will be closed automatically when exiting the context manager
        
def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title = "AI Secretary Backend", version = "1.0.0", lifespan=lifespan)


    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list(),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    app.include_router(email.router)
    
    @app.get("/health", tags=["meta"])
    async def health():
        return {"status": "ok", "env": settings.app_env}
    
    return app
app = create_app()
