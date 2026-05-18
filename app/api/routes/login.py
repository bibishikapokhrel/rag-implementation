from fastapi import APIRouter,Depends,HTTPException
from app.database.base import get_db
from app.schemas.user import LoginRequest
from app.database.model import User
from app.core.services.auth import verify_password,create_access_token

router=APIRouter()

@router.post("/login")
def login(req:LoginRequest,db=Depends(get_db)):
    user=db.query(User).filter(User.email==req.email).first()
    if not user or not verify_password(req.password,user.hashed_password):
        raise HTTPException(status_code=401,detail="Invalid email or password")

    token=create_access_token(user.id)
    return {"access_token":token,"token_type":"bearer","user_name":user.name}
