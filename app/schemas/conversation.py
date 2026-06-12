from pydantic import BaseModel

class ConversationCreate(BaseModel):
    title: str

class ConversationUpdate(BaseModel):
    title: str

class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: str

class MessageResponse(BaseModel):
    id: int
    user_message: str
    ai_reply: str

class ChatRequest(BaseModel):
    query: str
    conversation_id: int
