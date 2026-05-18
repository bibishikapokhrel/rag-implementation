from fastapi import APIRouter,Depends,HTTPException
from app.database.base import get_db
from app.core.services.auth import get_current_user
from app.database.model import Conversation,Message
from app.schemas.conversation import ConversationCreate,ConversationUpdate,ConversationResponse,MessageResponse

router=APIRouter()

@router.get("/")
def list_conversations(user=Depends(get_current_user),db=Depends(get_db)):
    convs=db.query(Conversation).filter(Conversation.user_id==user.id).order_by(Conversation.created_at.desc()).all()
    return [ConversationResponse(id=c.id,title=c.title,created_at=str(c.created_at)) for c in convs]

@router.post("/")
def create_conversation(req:ConversationCreate,user=Depends(get_current_user),db=Depends(get_db)):
    conv=Conversation(user_id=user.id,title=req.title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return ConversationResponse(id=conv.id,title=conv.title,created_at=str(conv.created_at))

@router.patch("/{conv_id}")
def update_conversation(conv_id:int,req:ConversationUpdate,user=Depends(get_current_user),db=Depends(get_db)):
    conv=db.query(Conversation).filter(Conversation.id==conv_id,Conversation.user_id==user.id).first()
    if not conv:
        raise HTTPException(status_code=404,detail="Conversation not found")
    conv.title=req.title
    db.commit()
    db.refresh(conv)
    return ConversationResponse(id=conv.id,title=conv.title,created_at=str(conv.created_at))

@router.get("/{conv_id}/messages")
def get_messages(conv_id:int,db=Depends(get_db)):
    msgs=db.query(Message).filter(Message.conversation_id==conv_id).all()
    return [MessageResponse(id=m.id,user_message=m.user_message,ai_reply=m.ai_reply) for m in msgs]
