from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from app.database.base import engine, Base
from app.database import model  # noqa: F401 — ensures all models are registered

from app.api.routes.ingestion import router as ingestion_router
from app.api.routes.chat import router as chat_router
from app.api.routes.signup import router as signup_router
from app.api.routes.login import router as login_router
from app.api.routes.conversation import router as conversation_router
from app.api.routes.documents import router as documents_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    yield

app = FastAPI(title="RAG API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingestion_router, prefix="/ingest", tags=["Ingestion"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(signup_router, prefix="/auth", tags=["Auth"])
app.include_router(login_router, prefix="/auth", tags=["Auth"])
app.include_router(conversation_router, prefix="/conversations", tags=["Conversations"])
app.include_router(documents_router,   prefix="/documents",     tags=["Documents"])
