from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id          : int
    filename    : str
    file_type   : str
    file_size   : int
    created_at  : str

    class Config:
        from_attributes = True
