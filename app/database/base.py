import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,DeclarativeBase

load_dotenv()

engine=create_engine(os.getenv("DATABASE_URL"))

local_session=sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass


def get_db():
    db=local_session()
    try:
        yield db
    finally:
        db.close()


