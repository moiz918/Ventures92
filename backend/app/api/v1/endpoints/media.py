"""
Media upload endpoint.

Admin:
    POST /media/upload  — upload an image file; returns its public URL

Security
--------
- Requires authentication.  Only SUPER_ADMIN and AGENT may upload.
- MIME type is validated against an allowlist (JPEG, PNG, WebP).
- File size is capped at settings.MAX_UPLOAD_SIZE_BYTES (default 10 MB).
- Filenames are UUID-based — original names are discarded to prevent
  path-traversal, homograph, and filename-collision attacks.
- Files are written to settings.UPLOAD_DIR, which is served as a
  StaticFiles mount at /static/uploads by main.py.
"""
from __future__ import annotations

import logging
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.api.deps import require_admin
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger("ventures92.media")

router = APIRouter()

# Map of allowed MIME types → canonical file extension
_MIME_TO_EXT: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


class MediaUploadResponse(BaseModel):
    """Shape returned after a successful file upload."""

    url: str
    filename: str
    content_type: str
    size_bytes: int


# ---------------------------------------------------------------------------
# POST /media/upload
# ---------------------------------------------------------------------------

@router.post(
    "/upload",
    response_model=MediaUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Upload a property image; returns the public URL",
)
async def upload_media(
    file: UploadFile,
    _admin: User = Depends(require_admin),
) -> MediaUploadResponse:
    """
    Upload a single image file for use in property listings.

    Accepted MIME types: image/jpeg, image/png, image/webp.

    The response body contains the ``url`` field, which should be stored
    in ``PropertyMedia.media_url`` so the frontend can render it.

    Example response::

        {
          "url": "http://localhost:8000/static/uploads/3f2a1b4c-....jpg",
          "filename": "3f2a1b4c-....jpg",
          "content_type": "image/jpeg",
          "size_bytes": 204800
        }
    """
    # ── MIME type validation ─────────────────────────────────────────────────
    content_type = file.content_type or ""
    if content_type not in _MIME_TO_EXT:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type '{content_type}'. "
                f"Allowed types: {', '.join(_MIME_TO_EXT)}."
            ),
        )

    # ── Read file into memory (with size guard) ──────────────────────────────
    # We read in chunks to enforce the size limit without loading the entire
    # file at once before we know whether it's within bounds.
    chunk_size = 64 * 1024  # 64 KB per chunk
    data = b""
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        data += chunk
        if len(data) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=(
                    f"File exceeds the maximum allowed size of "
                    f"{settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB."
                ),
            )

    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # ── Generate a UUID-based filename — discard the original name entirely ──
    extension = _MIME_TO_EXT[content_type]
    safe_filename = f"{uuid.uuid4()}{extension}"

    # ── Ensure upload directory exists ───────────────────────────────────────
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # ── Write to disk ────────────────────────────────────────────────────────
    dest_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    try:
        with open(dest_path, "wb") as fh:
            fh.write(data)
    except OSError as exc:
        logger.error("Failed to write uploaded file to %s: %s", dest_path, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save the uploaded file. Please try again.",
        ) from exc

    # ── Build the public URL ──────────────────────────────────────────────────
    public_url = f"{settings.STATIC_BASE_URL.rstrip('/')}/static/uploads/{safe_filename}"

    logger.info(
        "[MEDIA UPLOAD] admin=%s  file=%s  size=%d bytes  url=%s",
        _admin.email,
        safe_filename,
        len(data),
        public_url,
    )

    return MediaUploadResponse(
        url=public_url,
        filename=safe_filename,
        content_type=content_type,
        size_bytes=len(data),
    )
