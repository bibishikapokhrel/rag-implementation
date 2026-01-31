from fastapi import APIRouter
from app.core.services.chat import ChatService

router = APIRouter()

@router.get("/chat")
async def chat_with_bot(query: str):
    chatbot = ChatService(query)
    response = chatbot.chat_service()  
    return {"response": response}
