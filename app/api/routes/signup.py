from fastapi import APIRouter,Depends,HTTPException
from app.database.base import get_db
from app.schemas.user import SignupRequest
from app.database.model import User
from app.core.services.auth import hash_password,create_access_token

router = APIRouter()

@router.post("/signup")
def signup(req:SignupRequest,db=Depends(get_db)):
    existing=db.query(User).filter(User.email==req.email).first()
    if existing:
        raise HTTPException(status_code=400,detail="Email already registered")

    user=User(name=req.name,email=req.email,hashed_password=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token=create_access_token(user.id)
    return{"access_token":token,"token_type":"bearer","user_name":user.name}
