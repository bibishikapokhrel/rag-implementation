import os
import uuid

from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException

from app.core.services.auth import get_current_user
from app.core.services.ingest import IngestionServicePipeline
from app.core.services import minio_client
from app.database.base import get_db
from app.database.model import Document
from app.schemas.document import DocumentResponse

router = APIRouter()

CONTENT_TYPES = {
    "pdf":  "application/pdf",
    "txt":  "text/plain",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/ingest/", response_model=DocumentResponse)
async def ingest_file(
    file: UploadFile = File(...),
    conversation_id: int | None = Form(None),
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    content = await file.read()
    ext = (file.filename or "file").rsplit(".", 1)[-1].lower()

    if ext not in CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    # 1. Save temp file for ingestion pipeline
    temp_path = f"temp_{uuid.uuid4()}_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(content)

    object_key = f"{user.id}/{uuid.uuid4()}/{file.filename}"
    try:
        # 2. Ingest into Qdrant
        IngestionServicePipeline(temp_path).ingest_document()

        # 3. Upload original file to MinIO
        minio_client.upload(object_key, content, CONTENT_TYPES.get(ext, "application/octet-stream"))

    finally:
        # 4. Always clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

    # 5. Persist document record
    doc = Document(
        user_id=user.id,
        conversation_id=conversation_id,
        filename=file.filename,
        object_key=object_key,
        file_type=ext,
        file_size=len(content),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        created_at=str(doc.created_at),
    )
