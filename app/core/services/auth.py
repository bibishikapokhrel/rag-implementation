import bcrypt
import jwt 
import os
from datetime import datetime, timedelta,timezone
from fastapi import Depends,HTTPException,Header
from app.database.base import get_db
from app.database.model import User



SECRET_KEY=os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable is not set")


def hash_password(password:str)->str:
    return bcrypt.hashpw(password.encode(),bcrypt.gensalt(rounds=4)).decode()

def verify_password(password:str,hashed_password:str)->bool:
    return bcrypt.checkpw(password.encode(),hashed_password.encode())

def create_access_token(user_id:int)->str:
    payload={
        "user_id":user_id,
        "exp":datetime.now(timezone.utc)+timedelta(days=7)
    }
    return jwt.encode(payload,SECRET_KEY,algorithm="HS256")

def decode_acess_token(token:str)->dict:
    return jwt.decode(token,SECRET_KEY,algorithms=["HS256"])

def get_current_user(authorization:str=Header(...),db=Depends(get_db)):
    token=authorization.replace("Bearer ","")
    try:
        payload=decode_acess_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user=db.query(User).filter(User.id==payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user