import io
import os
from datetime import timedelta

from minio import Minio
from minio.error import S3Error

ENDPOINT   = os.getenv("MINIO_ENDPOINT",   "localhost:9000")
ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
BUCKET     = os.getenv("MINIO_BUCKET",     "documents")

_client: Minio | None = None


def _get_client() -> Minio:
    global _client
    if _client is None:
        _client = Minio(ENDPOINT, access_key=ACCESS_KEY, secret_key=SECRET_KEY, secure=False)
        try:
            if not _client.bucket_exists(BUCKET):
                _client.make_bucket(BUCKET)
        except S3Error as e:
            raise RuntimeError(f"MinIO bucket setup failed: {e}")
    return _client


def upload(object_key: str, data: bytes, content_type: str) -> None:
    c = _get_client()
    c.put_object(BUCKET, object_key, io.BytesIO(data), length=len(data), content_type=content_type)


def get_presigned_url(object_key: str, expires_hours: int = 1) -> str:
    c = _get_client()
    return c.presigned_get_object(
        BUCKET,
        object_key,
        expires=timedelta(hours=expires_hours),
        response_headers={"response-content-disposition": "inline"},
    )


def delete(object_key: str) -> None:
    c = _get_client()
    try:
        c.remove_object(BUCKET, object_key)
    except S3Error:
        pass
