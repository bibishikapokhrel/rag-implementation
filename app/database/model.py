from app.database.base import Base
from sqlalchemy import Column, DateTime,String,ForeignKey
from sqlalchemy.orm import mapped_column,Mapped,relationship
import datetime

class User(Base):
    __tablename__="users"
    id:Mapped[int]=mapped_column(primary_key=True)
    name:Mapped[str]=mapped_column(String(30))
    email:Mapped[str]=mapped_column(unique=True)
    hashed_password:Mapped[str]=mapped_column(String(60),nullable=False)
    conversations=relationship("Conversation",back_populates="user")
    user_sessions=relationship("User_session",back_populates="user")
   

class User_session(Base):
    __tablename__="user_session"
    id:Mapped[int]=mapped_column(primary_key=True)
    user_id:Mapped[int]=mapped_column(ForeignKey("users.id"))
    session_taken:Mapped[str]=mapped_column(String(255),nullable=False)
    created_at:Mapped[DateTime]=mapped_column(DateTime,default=datetime.datetime.utcnow)
    user=relationship("User",back_populates="user_sessions")

class Conversation(Base):
    __tablename__ = "conversations"

    id         : Mapped[int]      = mapped_column(primary_key=True)
    user_id    : Mapped[int]      = mapped_column(ForeignKey("users.id"))
    title      : Mapped[str]      = mapped_column(String(100))
    created_at : Mapped[DateTime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    user=relationship("User",back_populates="conversations")
    messages=relationship("Message",back_populates="conversation")

class Message(Base):
    __tablename__="messages"
    id:Mapped[int]=mapped_column(primary_key=True)
    conversation_id:Mapped[int]=mapped_column(ForeignKey("conversations.id"))
    user_message:Mapped[str]=mapped_column(String(5000))
    ai_reply:Mapped[str]=mapped_column(String(5000))
    source_documents:Mapped[str]=mapped_column(String(500))
    conversation=relationship("Conversation",back_populates="messages")


class Document(Base):
    __tablename__ = "documents"

    id              : Mapped[int]      = mapped_column(primary_key=True)
    user_id         : Mapped[int]      = mapped_column(ForeignKey("users.id"))
    conversation_id : Mapped[int]      = mapped_column(ForeignKey("conversations.id"), nullable=True)
    filename        : Mapped[str]      = mapped_column(String(255))
    object_key      : Mapped[str]      = mapped_column(String(512))
    file_type       : Mapped[str]      = mapped_column(String(10))
    file_size       : Mapped[int]      = mapped_column()
    created_at      : Mapped[DateTime] = mapped_column(DateTime, default=datetime.datetime.utcnow)