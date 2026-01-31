
from fastapi import APIRouter, UploadFile, File
from app.core.services.ingest import IngestionServicePipeline  

router = APIRouter()

@router.post("/ingest/")
async def ingest_file(file: UploadFile = File(...)):
    # Save temporarily
    temp_path = f"temp_{file.filename}"
    content = await file.read()
    with open(temp_path, "wb") as f:
        f.write(content)
    
    # Use your ingestion pipeline
    ingestor = IngestionServicePipeline(temp_path)
    ingestor.ingest_document()
    
    return {"status": "ingested", "file": file.filename}