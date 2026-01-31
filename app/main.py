from fastapi import FastAPI

from app.api.routes.ingestion import router as ingestion_router
from app.api.routes.chat import router as chat_router

app = FastAPI(title="RAG API")

app.include_router(ingestion_router, prefix="/ingest", tags=["Ingestion"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])

