from fastapi import APIRouter, Depends, HTTPException
from typing import Optional

from app.core.services.auth import get_current_user
from app.core.services import minio_client
from app.database.base import get_db
from app.database.model import Document
from app.schemas.document import DocumentResponse

router = APIRouter()


@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    conversation_id: Optional[int] = None,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    q = db.query(Document).filter(Document.user_id == user.id)
    if conversation_id is not None:
        q = q.filter(Document.conversation_id == conversation_id)
    docs = q.order_by(Document.created_at.desc()).all()
    return [
        DocumentResponse(
            id=d.id,
            filename=d.filename,
            file_type=d.file_type,
            file_size=d.file_size,
            created_at=str(d.created_at),
        )
        for d in docs
    ]


@router.get("/{doc_id}/url")
def get_document_url(
    doc_id: int,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id, Document.user_id == user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    url = minio_client.get_presigned_url(doc.object_key, expires_hours=1)
    return {
        "url":      url,
        "filename": doc.filename,
        "type":     doc.file_type,
    }


@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id, Document.user_id == user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    minio_client.delete(doc.object_key)
    db.delete(doc)
    db.commit()
    return {"status": "deleted"}
