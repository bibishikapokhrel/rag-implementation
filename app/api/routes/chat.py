from fastapi import APIRouter,Depends
from app.core.services.auth import get_current_user
from app.core.services.chat import ChatService
from app.database.base import get_db
from app.database.model import Message
from app.schemas.conversation import ChatRequest

router = APIRouter()

@router.post("/chat")
def chat_with_bot(req:ChatRequest,user=Depends(get_current_user),db=Depends(get_db)):
    chatbot = ChatService(req.query)
    response = chatbot.chat_service()

    message=Message(
        conversation_id=req.conversation_id,
        user_message=req.query,
        ai_reply=response,
        source_documents=""
    )
    db.add(message)
    db.commit()

    return {"response": response}
